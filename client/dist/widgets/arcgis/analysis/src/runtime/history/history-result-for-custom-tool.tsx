/** @jsx jsx */
import { React, jsx, css, hooks, dataSourceUtils, useIntl, dateUtils, type EsriDateFormats, type ImmutableObject } from 'jimu-core'
import { Alert, CollapsablePanel, DataActionList, DataActionListStyle, Link, defaultMessages as jimuiDefaultMessages } from 'jimu-ui'
import { List, TreeItemActionType, TreeStyle } from 'jimu-ui/basic/list-tree'
import type { ToolConfig, HistoryItemWithDs, CustomToolConfig } from '../../config'
import defaultMessages from '../translations/default'
import { type AnalysisToolParam, AnalysisToolParamDirection, type AnalysisToolData, type GPArealUnit, type GPLinearUnit } from '@arcgis/analysis-ui-schema'
import { depthTraversalProcessingValue, getCustomToolParamDisplayName, getEnumerableObjectFromAccessor, resultValueIsFeatureLayer, resultValueIsFeatureSet } from '../../utils/util'
import { canDisplayAsLink, changeRendererForJimuLayerView, getCustomToolOutputParamNameByDsId, urlIsMapServiceLayerOutput } from '../utils'
import type { JimuLayerView, JimuMapView } from 'jimu-arcgis'
import { formatAnalysisUnitValue, LinearUnitsResultsReverseLookup } from './utils'
import { CalciteTable, CalciteTableCell, CalciteTableRow } from 'calcite-components'

interface Props {
  history: HistoryItemWithDs
  toolInfo: ImmutableObject<ToolConfig>
  widgetId: string
  jimuMapView: JimuMapView
}

interface OutputConfig {
  decimalPlace?: number
  allowExport?: boolean
  dateFormat?: string
  timeFormat?: string
}

const listStyle = css`
  color: var(--sys-color-surface-paper-text);
  &.jimu-tree {
    overflow-x: hidden;
  }
  .jimu-tree-item__body {
    width: 100%;
    padding: 0.1875rem 0.75rem;
    .content {
      flex: 1;
      word-break: break-all;
      user-select: text;
      max-width: 100%;
      .name {
        font-weight: 500;
      }
    }
  }
  .jimu-tree-item_template .jimu-tree-item__body:focus {
    outline: auto;
  }
  .table-container {
    overflow-x: auto;
  }
  .has-indent {
    padding-left: 0.75rem;
  }
  .ds-label {
    flex: 1;
  }
`
const innerListStyle = css`
  &.jimu-tree_template-basic .jimu-tree-item__body.jimu-tree-item_selectable_true {
    border: none;
    padding: 0.1875rem 0;
  }
`

const { useEffect } = React

const HistoryResultForCustomTool = (props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)
  const { history, toolInfo, widgetId, jimuMapView } = props
  const { results, dsMap, dsCreateError } = history
  const config = toolInfo.config as ImmutableObject<CustomToolConfig>
  const { output, toolInfo: toolJson } = config

  const intl = useIntl()

  const getResultItem = (value: __esri.ParameterValue['value'], type: __esri.ParameterValue['dataType'], output: OutputConfig) => {
    const { decimalPlace, dateFormat, timeFormat } = output
    if (value === null || value === undefined) {
      return translate('noData')
    }
    // for long and double
    if (typeof value === 'number' && decimalPlace !== undefined) {
      return decimalPlace !== undefined ? value.toFixed(decimalPlace) : value
    }
    if (typeof value === 'boolean') {
      return translate(value ? 'trueKey' : 'falseKey')
    }
    // for linear unit
    if (typeof value === 'object' && (type === 'linear-unit' || (type as string) === 'GPLinearUnit')) {
      const { distance } = value as GPLinearUnit
      let { units: linearUnit } = value as GPLinearUnit
      // operation only needed for linear unit as it alone has units that can go into the number format
      if (LinearUnitsResultsReverseLookup[linearUnit] !== undefined) {
        linearUnit = LinearUnitsResultsReverseLookup[linearUnit]
      }
      return formatAnalysisUnitValue(distance, linearUnit)
    }
    // for area unit
    if (typeof value === 'object' && (type === 'areal-unit' || (type as string) === 'GPArealUnit')) {
      const { area } = value as GPArealUnit
      const { units: arealUnit } = value as GPArealUnit
      // square units are not valid in the number formatter therefore no reverse lookup is needed.
      return formatAnalysisUnitValue(area, arealUnit)
    }
    // for raster data
    if (typeof value === 'object' && (value as __esri.RasterData).url && (value as __esri.RasterData).format) {
      return (value as __esri.RasterData).url
    }
    // for data file
    if (typeof value === 'object' && (value as __esri.DataFile).url) {
      return (value as __esri.DataFile).url
    }
    // for field
    if (typeof value === 'object' && (value as __esri.Field).name) {
      return (value as __esri.Field).name
    }
    // for date
    if ((value as any) instanceof Date || (type === 'date' && (typeof value === 'string' || typeof value === 'number'))) {
      const date = typeof value === 'string' ? new Date(value) : value as Date
      const esriDateFormat = `${dateFormat || 'shortDate'}${timeFormat || ''}` as EsriDateFormats
      return dateUtils.formatDateValueByEsriFormat(date, esriDateFormat, intl)
    }
    // for other cases
    if (typeof value === 'object' && value !== null) {
      if (!Object.keys(value).length) {
        return translate('noData')
      }
      return value as __esri.DataFile | __esri.FeatureSet | Array<__esri.DataFile | __esri.FeatureSet>
    }
    return value as string
  }

  const updateDsDisableExport = (id: string, paramName: string) => {
    const ds = dsMap?.get(id)
    if (ds) {
      const allowExport = output.allowExport[paramName]
      const disableExport = allowExport === undefined ? false : !allowExport
      const dsJson = ds.getDataSourceJson()
      if (dsJson.disableExport !== disableExport) {
        const newDsJson = dsJson.setIn(['disableExport'], disableExport)

        ds.setDataSourceJson(newDsJson)
      }
    }
  }

  useEffect(() => {
    results.forEach((result, index) => {
      depthTraversalProcessingValue(result.value, `${index}`, (id: string) => {
        updateDsDisableExport(id, result.paramName)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.output])

  useEffect(() => {
    if (!jimuMapView || !dsMap?.size) {
      return
    }

    const dataSourcesIds = Array.from(dsMap).map((item) => item[1]).map((ds) => ds.id)

    const jimuLayerViewCreatedListener = (newJimuLayerView: JimuLayerView) => {
      const ds = newJimuLayerView.getLayerDataSource()
      if (dataSourcesIds.includes(ds.id)) {
        const paramName = getCustomToolOutputParamNameByDsId(dsMap, ds.id, results)
        changeRendererForJimuLayerView(newJimuLayerView, config?.output?.symbol?.[paramName], ds)
      }
    }
    jimuMapView.addJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)

    return () => {
      jimuMapView.removeJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.output?.symbol, dsMap, jimuMapView])

  const resultIsIgnored = (result: __esri.ParameterValue) => {
    return output.ignored[result.paramName]
  }

  // use analysis-json-table to display json
  const getDisplayResult = (id: string, value: __esri.ParameterValue['value'], type: __esri.ParameterValue['dataType'], outputOfCurrentResultItem: OutputConfig) => {
    const displayLink = canDisplayAsLink(value)
    // if has dataSource, show dataSource label
    const ds = dsMap?.get(id)
    if (ds) {
      const label = ds.getDataSourceJson().label || ds.getDataSourceJson().sourceLabel
      const resultUrl = (value as __esri.DataFile)?.url
      const serviceUrl = dataSourceUtils.getFullArcGISServiceUrl(resultUrl, false)

      const isMapServiceOutput = urlIsMapServiceLayerOutput(resultUrl)

      return <div className='d-flex align-items-center'>
        <span className='ds-label'>{displayLink
          ? <Link to={isMapServiceOutput ? resultUrl : serviceUrl || resultUrl} type='link' target='_blank' style={{ padding: 0, textAlign: 'left' }}>{label}</Link>
          : label}</span>
        <DataActionList hideGroupTitle widgetId={widgetId} dataSets={[{ dataSource: ds, records: [], name: label }]} listStyle={DataActionListStyle.Dropdown} buttonSize='sm' buttonType='tertiary' />
      </div>
    }
    // if no data source but has dsCreateError, it means the data source is not created successfully, show error alert
    const errorInfo = dsCreateError?.get(id)
    if (errorInfo) {
      const label = errorInfo ? errorInfo.layerName : dataSourceUtils.getLabelFromArcGISServiceUrl((value as any)?.url || '')
      return <React.Fragment>
        <Alert className='flex-shrink-0' css={css`padding-left: 0 !important; padding-right: 0 !important;`} buttonType='tertiary' form='tooltip' size='small' type='error' text={translate(errorInfo?.reasonForFailure || 'dataSourceCreateError')} />
        {label}
      </React.Fragment>
    }

    // no dataSource and dataSourceJson, display value directly
    const displayValue = getResultItem(value, type, outputOfCurrentResultItem)
    const displayJsonTable = typeof displayValue === 'object' && displayValue !== null


    const setJsonTableRef = (ref: HTMLAnalysisJsonTableElement) => {
      if (ref) {
        ref.json = getEnumerableObjectFromAccessor(displayValue as __esri.DataFile | __esri.FeatureSet) as AnalysisToolData
      }
    }

    const splitter = displayLink ? (displayValue as string).includes('/') ? '/' : '\\' : ''
    const linkLabel = displayLink ? (displayValue as string).split(splitter).pop() : ''

    return <React.Fragment>
      {displayJsonTable
        ? <analysis-json-table ref={setJsonTableRef}></analysis-json-table>
        : displayLink
          ? <Link to={displayValue as string} type='link' target='_blank' style={{ padding: 0, textAlign: 'left' }}>{linkLabel}</Link>
          : displayValue as string | number}
      </React.Fragment>
  }

  const getValueTableDisplayedResult = (id: string, result: __esri.ParameterValue, outputOfCurrentResultItem: OutputConfig) => {
    const { value, paramName } = result
    const parameterInfos = toolJson.parameters?.find((p) => p.direction === AnalysisToolParamDirection.Output && p.name === paramName)?.parameterInfos || []
    return <div className='table-container'>
      <CalciteTable bordered striped caption={getCustomToolParamDisplayName(config.toolInfo, paramName)}>
        {(value as Array<__esri.ParameterValue['value']>).map((v, index1) => {
          return (v as Array<__esri.ParameterValue['value']>).map((item, index2) => {
            const currentId = `${id}-${index1}-${index2}`
            const parameterInfo = parameterInfos?.[index2] || {} as AnalysisToolParam
            return <CalciteTableRow key={currentId}>
              <CalciteTableCell>{parameterInfo.displayName || parameterInfo.name || ''}</CalciteTableCell>
              <CalciteTableCell>{getDisplayResult(currentId, item, parameterInfo.dataType as __esri.ParameterValue['dataType'], outputOfCurrentResultItem)}</CalciteTableCell>
            </CalciteTableRow>
          })
        })}
      </CalciteTable>
    </div>
  }

  return (
    <CollapsablePanel label={translate('result')} aria-label={translate('result')} type="default" defaultIsOpen>
      <List
        css={listStyle}
        itemsJson={results.map((result, index) => ({
          itemKey: `${index}`,
          itemStateDetailContent: { result, id: `${index}` }
        }))}
        treeStyle={TreeStyle.Card}
        overrideItemBlockInfo={({ itemBlockInfo }) => {
          return {
            name: TreeItemActionType.RenderOverrideItem,
            children: [{
              name: TreeItemActionType.RenderOverrideItemBody,
              children: [{
                name: TreeItemActionType.RenderOverrideItemContent
              }, {
                name: TreeItemActionType.RenderOverrideItemCommands
              }]
            }]
          }
        }}
        renderOverrideItemContent={(actionData, refComponent) => {
          const { itemJsons } = refComponent.props
          const currentItemJson = itemJsons[0]
          const id = currentItemJson.itemStateDetailContent.id as string
          const result = currentItemJson.itemStateDetailContent.result as __esri.ParameterValue
          const isIgnored = resultIsIgnored(result)
          if (isIgnored) {
            return null
          }
          const { value, dataType, paramName } = result
          // if no dataSource and no dataSourceJson, show result directly, and not imported from map
          const keys = ['decimalPlace', 'allowExport', 'dateFormat', 'timeFormat']
          const outputOfCurrentResultItem = keys.reduce((acc, key) => {
            acc[key] = output[key]?.[result.paramName]
            return acc
          }, {})
          const isValueTable = dataType === 'value-table'

          const isFeatureSet = resultValueIsFeatureSet(value)
          const isFeatureLayer = resultValueIsFeatureLayer(value)
          const showTitle = !isFeatureSet && !isFeatureLayer && paramName
          return <div className='content'>
            {showTitle && <div className='name mb-2'>{getCustomToolParamDisplayName(config.toolInfo, paramName)}</div>}
            <div className={showTitle ? 'has-indent' : ''}>
              {Array.isArray(value) && !isValueTable
                ? <List
                    css={innerListStyle}
                    itemsJson={value.map((v, i) => ({
                      itemKey: `${id}-${i}`,
                      itemStateDetailContent: { value: v, id: `${id}-${i}` }
                    }))}
                    treeStyle={TreeStyle.Basic}
                    overrideItemBlockInfo={({ itemBlockInfo }) => {
                      return {
                        name: TreeItemActionType.RenderOverrideItem,
                        children: [{
                          name: TreeItemActionType.RenderOverrideItemBody,
                          children: [{
                            name: TreeItemActionType.RenderOverrideItemContent
                          }, {
                            name: TreeItemActionType.RenderOverrideItemCommands
                          }]
                        }]
                      }
                    }}
                    renderOverrideItemContent={(actionData, refComponent) => {
                      const { itemJsons } = refComponent.props
                      const currentItemJson = itemJsons[0]
                      const id = currentItemJson.itemStateDetailContent.id as string
                      const value = currentItemJson.itemStateDetailContent.value as __esri.ParameterValue['value']
                      return <div className='content'>
                        {getDisplayResult(id, value, dataType?.replace('multi-value-', '') as __esri.ParameterValue['dataType'], outputOfCurrentResultItem)}
                      </div>
                    }}
                  />
                : isValueTable
                  ? getValueTableDisplayedResult(id, result, outputOfCurrentResultItem)
                  : getDisplayResult(id, value, dataType, outputOfCurrentResultItem)}
            </div>
          </div>
        }}
      />
    </CollapsablePanel>
  )
}

export default HistoryResultForCustomTool
