/** @jsx jsx */
import {
  React,
  jsx,
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
import { NumericInput, Select, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { SettingRow, SettingSection, DirectionSelector } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, type QueryArrangeType, type QueryItemType, PagingType, ListDirection, FieldsType } from '../config'
import defaultMessages from './translations/default'
import { createGetI18nMessage } from 'widgets/shared-code/common'
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
