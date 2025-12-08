/** @jsx jsx */
import {
  type DataSource,
  type ImmutableObject,
  React, css, hooks, jsx,
  loadArcGISJSAPIModule
} from 'jimu-core'
import type { StandardToolConfig, FailedLayer, HistoryItemWithDs, ToolConfig } from '../../config'
import { AnalysisJobStatus, isEmptyValue, getServiceName } from '@arcgis/analysis-shared-utils'
import type { GPDataType, AnalysisToolDataItem, LayerUrlFilter } from '@arcgis/analysis-ui-schema'
import defaultMessages from '../translations/default'
import { Alert, CollapsablePanel, DataActionList, DataActionListStyle, Link } from 'jimu-ui'
import { canDisplayAsLink, resultHasItemId } from '../utils'

interface Props {
  history: HistoryItemWithDs
  toolInfo: ImmutableObject<ToolConfig>
  widgetId: string
  portal: __esri.Portal
}

interface ResultInfo {
  value: GPDataType
  id: string
  ds?: DataSource
  errorInfo?: FailedLayer
}

const { useEffect, useMemo, useState } = React

const style = css`
  .result-item {
    border: 1px solid var(--sys-color-divider-secondary);
    padding: 0.3125rem 0.75rem;
    &:not(:last-child) {
      margin-bottom: 0.5rem;
    }
    &:last-child {
      margin-bottom: 1rem;
    }
    .has-indent {
      padding-left: 0.75rem;
    }
    .layer-item {
      display: flex;
      align-items: center;
      &:not(:last-child) {
        margin-bottom: 0.5rem;
      }
      .label {
        flex: 1;
      }
    }
  }
`

const HistoryResultForStandardTool = (props: Props) => {
  const { history, widgetId, toolInfo, portal } = props

  const { dsMap, dsCreateError } = history

  const translate = hooks.useTranslation(defaultMessages)

  const results = useMemo(() => {
    return history.results
      .filter((result) => !isEmptyValue(result.value as AnalysisToolDataItem))
      .map((result, index) => {
        const id = `${index}`
        const ds = dsMap?.get(id)
        const errorInfo = dsCreateError?.get(id)
        return { value: result.value as GPDataType, id, ds, errorInfo } as ResultInfo
      })
  }, [history.results, dsMap, dsCreateError])

  const [modules, setModules] = useState<[typeof __esri.PortalItem]>()
  useEffect(() => {
    loadArcGISJSAPIModule('esri/portal/PortalItem').then((PortalItem) => {
      setModules([PortalItem])
    })
  }, [])

  const [groupedLayers, setGroupedLayers] = useState<Map<string, ResultInfo[]>>(new Map())
  const [failedLayers, setFailedLayers] = useState<FailedLayer[]>([])
  const [portalItems, setPortalItems] = useState<__esri.PortalItem[]>([])

  useEffect(() => {
    if (!modules) {
      return
    }
    if (results) {
      const loadedResults = new Map<string, ResultInfo[]>()
      const failedResults: FailedLayer[] = []
      const items: __esri.PortalItem[] = []
      // check if the result has job_deleted string as result value.
      const resultsUnavailable = results.length === 1 && results.find((item) => item.value === AnalysisJobStatus.Deleted)
      if (!resultsUnavailable) {
        results.forEach((item) => {
          if (item.ds) {
            const serviceName = getServiceName((item.value as any)?.url ?? '')
            const items = loadedResults.get(serviceName)
            loadedResults.set(serviceName, items ? [...items, item] : [item])
          } else if (item.errorInfo) {
            if (!failedResults.find((comparativeLayer) => item.errorInfo.layerName === comparativeLayer.layerName)) {
              failedResults.push(item.errorInfo)
            }
          } else {
            const value = (item.value as LayerUrlFilter)
            const { itemId } = value
            if (itemId) {
              const PortalItem = modules[0]
              const item = new PortalItem({ id: itemId })
              items.push(item)
            }
          }
        })
      }
      setGroupedLayers(loadedResults)
      setFailedLayers(failedResults)
      Promise.allSettled(items.map((item) => item.load())).then(() => {
        setPortalItems(items)
      })
    }
  }, [modules, results])

  const getNormalItem = (item: ResultInfo, useLabel: boolean) => {
    const { ds, value } = item
    const dsJson = ds.getDataSourceJson()

    const disableExport = !(toolInfo.config as StandardToolConfig).output.allowExportResults
    if (dsJson.disableExport !== disableExport) {
      const newDsJson = dsJson.setIn(['disableExport'], disableExport)
      ds.setDataSourceJson(newDsJson)
    }

    // label: if has single layer, label is feature service name; if has multiple layers, label is feature service name-layer name
    // source label: always be layer name
    // so if has single layer, show feature service name here, if has multiple layers, show layer name here
    const label = useLabel ? ds.getDataSourceJson().label : ds.getDataSourceJson().sourceLabel
    const displayLink = canDisplayAsLink(value as __esri.ParameterValue['value'])

    const itemId = resultHasItemId(value as __esri.ParameterValue['value']) ? (value as any).itemId : ''
    const linkUrl = displayLink ? itemId && portal?.url ? `${portal.url.replace(/\/$/, '')}/home/item.html?id=${itemId}` : (value as any).url : ''

    return <div className='layer-item' key={item.id}>
      {displayLink
        ? <Link className='label' to={linkUrl} type='link' target='_blank' style={{ padding: 0, justifyContent: 'flex-start' }}>{label}</Link>
        : <span className='label'>{label}</span>}
      <DataActionList hideGroupTitle widgetId={widgetId} dataSets={[{ dataSource: ds, records: [], name: ds.getDataSourceJson().label || ds.getDataSourceJson().sourceLabel }]} listStyle={DataActionListStyle.Dropdown} buttonSize='sm' buttonType='tertiary' />
    </div>
  }

  const getFailedItem = (item: FailedLayer) => {
    return <div className='layer-item'>
      <Alert className='flex-shrink-0' css={css`padding-left: 0 !important; padding-right: 0 !important;`} buttonType='tertiary' form='tooltip' size='small' type='error' text={translate(item.reasonForFailure)} />
      <span className='label'>{item.layerName}</span>
    </div>
  }
  return <CollapsablePanel label={translate('result')} aria-label={translate('result')} type="default" defaultIsOpen>
    <div css={style}>
      {Array.from(groupedLayers.keys()).map((key: string) => {
        const value = groupedLayers.get(key)
        if (value !== undefined && value.length > 0) {
          const valueHasMultiLayers = value.length > 1
          return valueHasMultiLayers
            ? <CollapsablePanel className='result-item' label={key} type="default" defaultIsOpen={true} key={key}>
                <div className='has-indent'>
                  {value.map((item) => {
                    return getNormalItem(item, false)
                  })}
                </div>
              </CollapsablePanel>
            : <div className='result-item' key={key}>{getNormalItem(value[0], true)}</div>
        }
        return null
      })}
      {failedLayers.map((failedItem) => <div className='result-item' key={failedItem.layerName}>{getFailedItem(failedItem)}</div>)}
      {portalItems.map((portalItem) => {
        return <div className='result-item' key={portalItem.id}>
          <Link to={portalItem.itemPageUrl} type='link' target='_blank' style={{ padding: 0, textAlign: 'left' }}>{portalItem.title}</Link>
        </div>
      })}
    </div>
  </CollapsablePanel>
}

export default HistoryResultForStandardTool
