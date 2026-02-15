/** @jsx jsx */
import {
  React,
  jsx,
  css,
  Immutable,
  type UseDataSource,
  DataSourceManager,
  AllDataSourceTypes,
  type SubtypeSublayerDataSource,
  type SubtypeGroupLayerDataSource,
  type ImmutableArray,
  type SceneLayerDataSource,
  type FeatureLayerDataSource
} from 'jimu-core'
import { type AllWidgetSettingProps, type SettingChangeFunction, getAppConfigAction } from 'jimu-for-builder'
import {
  DataSourceRemoveWarningPopup,
  DataSourceRemoveWaringReason,
  dataComponentsUtils
} from 'jimu-ui/advanced/data-source-selector'
import { NumericInput, Select, Switch, TextInput, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { SettingRow, SettingSection, DirectionSelector, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, type QueryArrangeType, type QueryItemType, PagingType, ListDirection, FieldsType } from '../config'
import defaultMessages from './translations/default'
import { createGetI18nMessage } from 'widgets/shared-code/mapsimple-common'
import type { ValueManSetByKeyType } from './setting-config'
import { getOutputJsonOriginDs } from './setting-utils'
import { QueryItemList } from './query-item-list'
import { Arrangement } from './arrangement'

export interface State {
  showRemoveQueryItemWarning: boolean
  indexOfQueryItemToRemove: number
  dsToRemove: string
}

const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)

function getQueryOfSubtypeSublayer (ds: SubtypeSublayerDataSource) {
  const mainDs = ds.getMainDataSource()
  const subtypeField = (mainDs.parentDataSource as SubtypeGroupLayerDataSource).getSubtypeField()
  return {
    where: {
      logicalOperator: 'AND',
      parts: [
        {
          jimuFieldName: subtypeField,
          operator: 'NUMBER_OPERATOR_IS',
          type: 'SINGLE',
          valueOptions: {
            inputEditor: 'SIMPLE_SELECT',
            isValid: true,
            value: [{
              value: ds.getSubtypeCode(),
              label: ds.getLabel()
            }]
          }
        }
      ]
    }
  }
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, State> {
  getI18nMessage = createGetI18nMessage({ intl: this.props.intl, defaultMessages: messages })

  constructor (props) {
    super(props)
    this.state = {
      showRemoveQueryItemWarning: false,
      indexOfQueryItemToRemove: -1,
      dsToRemove: null
    }
  }

  updateWidgetJson: SettingChangeFunction = (...args) => {
    const [changedWidgetJson, ...restArgs] = args
    const widgetJson = Object.assign({ id: this.props.id, ...changedWidgetJson })
    this.props.onSettingChange(widgetJson, ...restArgs)
  }

  updateConfigForOptions = (...setByKeyPairs: ValueManSetByKeyType[]) => {
    let allDataSources = null
    const config = setByKeyPairs.reduce((config, [key, value, options]) => {
      if (key === 'queryItems' && options?.dsUpdateRequired) {
        allDataSources = this.getAllDataSources(value)
      }
      return config.set(key, value)
    }, this.props.config)
    if (allDataSources) {
      this.updateWidgetJson(
        {
          config,
          useDataSources: Object.values(allDataSources.useDataSourceMap)
        },
        allDataSources.outputDataSources
      )
    } else {
      this.updateWidgetJson({ config })
    }
  }

  handleArrangeTypeChange = (arrangeType: QueryArrangeType) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('arrangeType', arrangeType)
    })
  }

  handleArrangeWrapChange = (arrangeWrap: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('arrangeWrap', arrangeWrap)
    })
  }

  handleResultDirectionChange = (vertical: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('resultListDirection', vertical ? ListDirection.Vertical : ListDirection.Horizontal)
    })
  }



  tryRemoveQueryItem = (index: number) => {
    const queryItems = this.props.config.queryItems
    const currentQueryItem = queryItems[index]
    const appConfig = getAppConfigAction().appConfig
    const relatedWidgets = dataComponentsUtils.getWidgetsUsingDsOrItsDescendantDss(
      currentQueryItem.outputDataSourceId,
      appConfig.widgets
    )

    if (relatedWidgets.length === 0) {
      this.doRemoveQueryItem(index, true)
    } else {
      this.setState({
        showRemoveQueryItemWarning: true,
        indexOfQueryItemToRemove: index,
        dsToRemove: currentQueryItem.outputDataSourceId
      })
    }
  }

  beforeRemovingDataSource = () => {
    this.doRemoveQueryItem(this.state.indexOfQueryItemToRemove)
  }

  doRemoveQueryItem = (index: number, dsUpdateRequired = false) => {
    const configOptions = { dsUpdateRequired }
    const queryItems = this.props.config.queryItems.asMutable({ deep: true })
    queryItems.splice(index, 1)

    this.updateConfigForOptions(['queryItems', queryItems, configOptions])
  }

  afterRemovingDataSource = () => {
    this.setState({
      showRemoveQueryItemWarning: false,
      indexOfQueryItemToRemove: -1,
      dsToRemove: null
    })
  }

  addQueryItem = (queryItem) => {
    this.updateQueryItem(this.props.config.queryItems?.length ?? 0, queryItem, true)
  }

  updateQueryItem = (index: number, queryItem, dsUpdateRequired = false) => {
    let queryItems: ImmutableArray<QueryItemType> = this.props.config.queryItems ?? Immutable([])
    queryItems = Immutable.set(queryItems, index, queryItem)

    this.updateConfigForOptions(['queryItems', queryItems, { dsUpdateRequired }])
  }

  reOrderQueryItems = (queryItems) => {
    this.updateConfigForOptions(['queryItems', queryItems])
  }

  getAllDataSources = (queryItems: QueryItemType[]) => {
    const dsUseFields: { [dsId: string]: Set<string> } = {}
    const dsMap = Immutable(queryItems)
      .asMutable({ deep: true })
      .reduce(
        (currentDsMap, queryItem) => {
          // add useDataSource
          // note: one data source may be used by multiple query items
          const sources = [queryItem.useDataSource, ...queryItem.spatialRelationUseDataSources]
          sources.forEach((useDs: UseDataSource) => {
            const dsId = useDs.dataSourceId
            currentDsMap.useDataSourceMap[dsId] = currentDsMap.useDataSourceMap[dsId] || useDs
            // const resultDisplayFields = useDs.
            const sortOptions = (queryItem.sortOptions || []).filter((i) => i.jimuFieldName)
            const sortFields = sortOptions.map((i) => i.jimuFieldName)
            // fields used in resultTitleExpression
            // extract fields from the value
            const reg = /\{(\w*)\}/g
            const fields = queryItem.resultTitleExpression?.match(reg)
            const titleFields = []
            if (fields?.length > 0) {
              const dataSource = DataSourceManager.getInstance().getDataSource(dsId)
              const schemaFields = dataSource?.getSchema()?.fields ?? {}
              fields.forEach(field => { // like "{NAME}"
                const fieldName = field.substring(1, field.length - 1)
                if (schemaFields[fieldName]) {
                  titleFields.push(fieldName)
                }
              })
            }
            const alreadyUsedFields = dsUseFields[dsId] ?? new Set()
            currentDsMap.useDataSourceMap[dsId].fields = Array.from(
              new Set([
                ...(Array.from(alreadyUsedFields)),
                ...(useDs.fields || []),
                ...(titleFields),
                ...(queryItem.resultFieldsType === FieldsType.SelectAttributes && queryItem.resultDisplayFields ? queryItem.resultDisplayFields : []),
                ...(sortFields)
              ])
            )
            dsUseFields[dsId] = currentDsMap.useDataSourceMap[dsId].fields

            if (queryItem.resultFieldsType !== FieldsType.SelectAttributes) {
              currentDsMap.useDataSourceMap[dsId].useFieldsInPopupInfo = true
            }
          })
          // add outputDataSource
          const originDs = DataSourceManager.getInstance().getDataSource(queryItem.useDataSource?.dataSourceId) as
            | FeatureLayerDataSource
            | SceneLayerDataSource
          if (originDs) {
            const originDataSourceJson = getOutputJsonOriginDs(originDs)?.getDataSourceJson()
            const outputDataSourceJson = {
              id: queryItem.outputDataSourceId,
              label: this.getI18nMessage('outputDsLabel', { values: { label: queryItem.name } }),
              type: originDataSourceJson?.type === AllDataSourceTypes.SubtypeSublayer ? AllDataSourceTypes.FeatureLayer : originDataSourceJson?.type,
              geometryType: originDataSourceJson?.geometryType,
              url: originDataSourceJson?.url,
              itemId: originDataSourceJson?.itemId,
              portalUrl: originDataSourceJson?.portalUrl,
              originDataSources: [queryItem.useDataSource],
              layerId: originDataSourceJson?.layerId,
              isDataInDataSourceInstance: originDataSourceJson?.isDataInDataSourceInstance,
              query: originDataSourceJson?.type === AllDataSourceTypes.SubtypeSublayer ? getQueryOfSubtypeSublayer(originDs as any) : null
            }
            currentDsMap.outputDataSources.push(outputDataSourceJson)
          }
          return currentDsMap
        },
        { useDataSourceMap: {}, outputDataSources: [] }
      )
    return dsMap
  }

  hideRemovePopup = () => {
    this.setState({ showRemoveQueryItemWarning: false })
  }

  render () {
    const { config } = this.props
    // use the first item's direction if it doesn't exist in the config
    let { resultListDirection } = config
    if (!resultListDirection) {
      resultListDirection = config.queryItems?.[0]?.resultListDirection ?? ListDirection.Vertical
    }
    return (
      <div className='jimu-widget-setting setting-query__setting-content h-100'>
        <QueryItemList
          widgetId={this.props.id}
          arrangeType={this.props.config.arrangeType}
          queryItems={this.props.config.queryItems}
          onNewQueryItemAdded={this.addQueryItem}
          onQueryItemRemoved={this.tryRemoveQueryItem}
          onQueryItemChanged={this.updateQueryItem}
          onOrderChanged={this.reOrderQueryItems}
        />
        {this.props.config.queryItems.length > 0 && !this.props.controllerWidgetId && (
          <Arrangement
            arrangeType={config.arrangeType}
            arrangeWrap={config.arrangeWrap}
            onArrangeTypeChanged={this.handleArrangeTypeChange}
            onArrangeWrapChanged={this.handleArrangeWrapChange}
          />
        )}
        {this.props.config.queryItems.length > 0 && (
          <SettingSection role='group' aria-label={this.getI18nMessage('resultStyle')} title={this.getI18nMessage('resultStyle')}>
            <SettingRow label={this.getI18nMessage('listDirection')}>
              <DirectionSelector
                aria-label={this.getI18nMessage('listDirection')}
                vertical={resultListDirection === ListDirection.Vertical}
                onChange={this.handleResultDirectionChange}
              />
            </SettingRow>
          </SettingSection>
        )}
        {this.props.config.queryItems.length > 0 && (
          <SettingSection role='group' aria-label={this.getI18nMessage('highlightOptions')} title={this.getI18nMessage('highlightOptions')}>
            <SettingSection role='group' title={this.getI18nMessage('selectMapForHighlight')} className='text-truncate'>
                <SettingRow>
                  <MapWidgetSelector
                    onSelect={(mapWidgetIds) => {
                      const selectedMapWidgetId = mapWidgetIds && mapWidgetIds.length > 0 ? mapWidgetIds[0] : null
                      this.updateConfigForOptions(['highlightMapWidgetId', selectedMapWidgetId])
                    }}
                    useMapWidgetIds={config.highlightMapWidgetId 
                      ? Immutable([String(config.highlightMapWidgetId)] as string[]) 
                      : undefined}
                  />
                </SettingRow>
                {!config.highlightMapWidgetId && (
                  <SettingRow>
                    <div css={css`
                      color: var(--ref-palette-red-600, #dc3545);
                      font-size: 12px;
                      line-height: 1.4;
                      padding: 4px 0;
                    `}>
                      {this.getI18nMessage('mapWidgetRequired')}
                    </div>
                  </SettingRow>
                )}
              </SettingSection>
          </SettingSection>
        )}
        {this.props.config.queryItems.length > 0 && (
          <SettingSection role='group' aria-label={this.getI18nMessage('graphicsSymbology')} title={this.getI18nMessage('graphicsSymbology')}>
                <SettingRow label={this.getI18nMessage('addResultsAsMapLayer')}>
                  <Switch
                    checked={config.addResultsAsMapLayer === true}
                    onChange={(e) => {
                      this.updateConfigForOptions(['addResultsAsMapLayer', e.target.checked])
                    }}
                    aria-label={this.getI18nMessage('addResultsAsMapLayer')}
                  />
                </SettingRow>
                <div css={css`font-size: 0.875rem; margin-top: 4px; padding: 0 16px 8px; opacity: 0.8;`}>
                  {this.getI18nMessage('addResultsAsMapLayerDescription')}
                </div>
                {config.addResultsAsMapLayer && (
                  <SettingRow label={this.getI18nMessage('resultsLayerTitle')} flow='wrap'>
                    <TextInput
                      value={config.resultsLayerTitle || ''}
                      placeholder={this.getI18nMessage('resultsLayerTitlePlaceholder')}
                      onChange={(e) => {
                        this.updateConfigForOptions(['resultsLayerTitle', e.target.value])
                      }}
                      aria-label={this.getI18nMessage('resultsLayerTitle')}
                    />
                  </SettingRow>
                )}
                <SettingRow label={this.getI18nMessage('fillColor')} flow='wrap'>
                  <ThemeColorPicker
                    specificTheme={this.props.theme2}
                    value={config.highlightFillColor || '#DF00FF'}
                    onChange={(color: string) => {
                      this.updateConfigForOptions(['highlightFillColor', color])
                    }}
                  />
                </SettingRow>
            
            <SettingRow label={this.getI18nMessage('fillOpacity')} flow='wrap'>
              <NumericInput
                value={config.highlightFillOpacity ?? 0.25}
                min={0}
                max={1}
                step={0.05}
                onChange={(value: number) => {
                  this.updateConfigForOptions(['highlightFillOpacity', value])
                }}
              />
            </SettingRow>
            
                <SettingRow label={this.getI18nMessage('outlineColor')} flow='wrap'>
                  <ThemeColorPicker
                    specificTheme={this.props.theme2}
                    value={config.highlightOutlineColor || '#DF00FF'}
                    onChange={(color: string) => {
                      this.updateConfigForOptions(['highlightOutlineColor', color])
                    }}
                  />
                </SettingRow>
            
            <SettingRow label={this.getI18nMessage('outlineOpacity')} flow='wrap'>
              <NumericInput
                value={config.highlightOutlineOpacity ?? 1.0}
                min={0}
                max={1}
                step={0.05}
                onChange={(value: number) => {
                  this.updateConfigForOptions(['highlightOutlineOpacity', value])
                }}
              />
            </SettingRow>
            
            <SettingRow label={this.getI18nMessage('outlineWidth')} flow='wrap'>
              <NumericInput
                value={config.highlightOutlineWidth ?? 2}
                min={1}
                max={10}
                step={1}
                onChange={(value: number) => {
                  this.updateConfigForOptions(['highlightOutlineWidth', value])
                }}
              />
            </SettingRow>
            
            <SettingRow label={this.getI18nMessage('pointMarkerSize')} flow='wrap'>
              <NumericInput
                value={config.highlightPointSize ?? 12}
                min={8}
                max={32}
                step={2}
                onChange={(value: number) => {
                  this.updateConfigForOptions(['highlightPointSize', value])
                }}
              />
            </SettingRow>
            
            <SettingRow label={this.getI18nMessage('pointOutlineWidth')} flow='wrap'>
              <NumericInput
                value={config.highlightPointOutlineWidth ?? 2}
                min={1}
                max={6}
                step={1}
                onChange={(value: number) => {
                  this.updateConfigForOptions(['highlightPointOutlineWidth', value])
                }}
              />
            </SettingRow>
            
            <SettingRow label={this.getI18nMessage('pointMarkerStyle')} flow='wrap'>
              <Select
                value={config.highlightPointStyle || 'circle'}
                onChange={(e) => {
                  this.updateConfigForOptions(['highlightPointStyle', e.target.value])
                }}
              >
                <option value='circle'>{this.getI18nMessage('styleCircle')}</option>
                <option value='square'>{this.getI18nMessage('styleSquare')}</option>
                <option value='cross'>{this.getI18nMessage('styleCross')}</option>
                <option value='x'>{this.getI18nMessage('styleX')}</option>
                <option value='diamond'>{this.getI18nMessage('styleDiamond')}</option>
              </Select>
            </SettingRow>
          </SettingSection>
        )}
        {this.props.config.queryItems.length > 0 && (
          <SettingSection role='group' aria-label={this.getI18nMessage('hoverPinColor')} title={this.getI18nMessage('hoverPinColor')}>
            <SettingRow label={this.getI18nMessage('pinColor')} flow='wrap'>
              <ThemeColorPicker
                specificTheme={this.props.theme2}
                value={config.hoverPinColor || '#FFC107'}
                onChange={(color: string) => {
                  this.updateConfigForOptions(['hoverPinColor', color])
                }}
              />
            </SettingRow>
            <div css={css`font-size: 0.875rem; margin-top: 4px; padding: 0 16px 8px; opacity: 0.8;`}>
              {this.getI18nMessage('hoverPinColorDescription')}
            </div>
          </SettingSection>
        )}
        {this.props.config.queryItems.length > 0 && (
          <SettingSection role='group' aria-label={this.getI18nMessage('resultClickBehavior')} title={this.getI18nMessage('resultClickBehavior')}>
            <SettingRow label={this.getI18nMessage('zoomOnResultClick')}>
              <Switch
                checked={config.zoomOnResultClick === true}
                onChange={(e) => {
                  this.updateConfigForOptions(['zoomOnResultClick', e.target.checked])
                }}
                aria-label={this.getI18nMessage('zoomOnResultClick')}
              />
            </SettingRow>
            <div css={css`font-size: 0.875rem; margin-top: 4px; padding: 0 16px 8px; opacity: 0.8;`}>
              {this.getI18nMessage('zoomOnResultClickDescription')}
            </div>
          </SettingSection>
        )}
        <DataSourceRemoveWarningPopup
          dataSourceId={this.state.dsToRemove}
          isOpen={this.state.showRemoveQueryItemWarning}
          toggle={this.hideRemovePopup}
          reason={DataSourceRemoveWaringReason.DataSourceRemoved}
          afterRemove={this.afterRemovingDataSource}
          beforeRemove={this.beforeRemovingDataSource}
        />
      </div>
    )
  }
}
