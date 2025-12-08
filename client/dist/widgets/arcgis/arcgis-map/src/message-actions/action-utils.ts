import {
  getAppStore, MessageType, MessageCarryData, type UseDataSource, type IMUseDataSource, Immutable, AppMode,
  DataSourceManager, type ImmutableObject, type ImmutableArray, type IMWidgetJson, DataSourceTypes,
  type ActionSettingProps, type IMSqlExpression, type WidgetJson, type IMState, type MessageDescription
} from 'jimu-core'
import type { IMConfig as FilterMessageActionIMConfig } from './filter-action-setting'
import type { IMConfig as FlashMessageActionIMConfig } from './flash-action-setting'

export function isUseOutputDataSources (wId: string, messageType: MessageType): boolean {
  const messageCarryData = getMessageCarryDataByWidgetId(wId, messageType)
  return messageCarryData === MessageCarryData.OutputDataSource
}

/**
 * wId can publish different messages, different message maybe support different data source types: USE_DATA_SOURCE, OUTPUT_DATA_SOURCE and BOTH_DATA_SOURCE.
 * This info is defined in widget manifest.json.
 * e.g.
 * For Search widget,
 * If the published message type is DATA_RECORDS_SELECTION_CHANGE, messageCarryData is BOTH_DATA_SOURCE.
 * If the published message type is DATA_RECORD_SET_CHANGE, messageCarryData is OUTPUT_DATA_SOURCE.
 * If the published message type is DATA_SOURCE_FILTER_CHANGE, messageCarryData is BOTH_DATA_SOURCE.
 * @param wId
 * @param messageType
 * @returns
 */
export function getMessageCarryDataByWidgetId (wId: string, messageType: MessageType): MessageCarryData {
  const appConfig = getAppConfig()
  const widgetJson = appConfig?.widgets?.[wId]
  const publishMessages = widgetJson?.manifest?.publishMessages
  let messageCarryData = MessageCarryData.UseDataSource
  publishMessages?.forEach(el => {
    const publishMessageProperty = el as any
    if (publishMessageProperty?.messageCarryData && publishMessageProperty?.messageType === messageType) {
      messageCarryData = publishMessageProperty?.messageCarryData
    }
  })
  return messageCarryData
}

export interface ActionConfig {
  // useDataSource is the single selected trigger data, it is used if it only supports single data source
  useDataSource: UseDataSource
  // useDataSources is the multiple selected trigger data, it is used if it supports multiple data sources
  useDataSources?: UseDataSource[]
}

/**
 * This method is only used by zoom-to and pan-to message action in setting componentDidMount method.
 * It returns useDataSource and useDataSources. Then uses the returned useDataSource and useDataSources to update messageActionConfig.useDataSource and messageActionConfig.useDataSources.
 * useDataSource is the single selected trigger data, it is used if it only supports single data source.
 * useDataSources is the multiple selected trigger data, it is used if it supports multiple data sources.
 * There are two cases.
 * Case1: If actionConfig.useDataSource is null, it is the the first time to open the message action setting.
 *        For case1, useDataSources is the layer data sources returned by getDsByWidgetId().
 *        And useDataSource is the first data sources of useDataSources.
 * Case2: If actionConfig.useDataSource is not null, it is not the the first time to open the message action setting.
 *        For case2, we don't call getDsByWidgetId() to update useDataSource and useDataSources.
 *        But we need to validate messageActionConfig.useDataSource and messageActionConfig.useDataSources because the data source maybe removed from the message widget.
 *        If the data source is removed from the message widget, we also need to remove it from messageActionConfig.useDataSource and messageActionConfig.useDataSources.
 * @param actionConfig
 * @param messageWidgetId
 * @param messageType
 * @returns
 */
export function checkOutActionConfigForZoomToAndPanToMessageActions (actionConfig: Immutable.ImmutableObject<ActionConfig>, messageWidgetId: string, messageType: MessageType) {
  let useDataSource: IMUseDataSource = null
  const useDataSources: IMUseDataSource[] = []
  // When opening the message action setting for the first time, this.props.config is { useDataSource: null }.
  if (!actionConfig.useDataSource) {
    // Case1: If actionConfig.useDataSource is null, it is the the first time to open the message action setting.
    //        For case1, useDataSources is the layer data sources returned by getDsByWidgetId().
    //        And useDataSource is the first data sources of useDataSources.

    let messageWidgetUseDataSources = getDsByWidgetId(messageWidgetId, messageType)

    // filter the initial data sources
    messageWidgetUseDataSources = messageWidgetUseDataSources.filter((imUseDataSource) => {
      const dsId = imUseDataSource.dataSourceId
      return validateDataSourceForZoonToAndPanToMessageActionInSetting(dsId, messageType)
    })

    //if (messageWidgetJson && messageWidgetJson.useDataSources && messageWidgetJson.useDataSources.length > 0) {
    if (messageWidgetUseDataSources.length > 0) {
      messageWidgetUseDataSources.forEach((useDS, index) => {
        let tempUseDataSource
        if (isWebMapOrWebSceneDataSourceId(useDS.dataSourceId)) {
          tempUseDataSource = null
        } else {
          tempUseDataSource = Immutable({
            dataSourceId: useDS.dataSourceId,
            mainDataSourceId: useDS.mainDataSourceId,
            rootDataSourceId: useDS.rootDataSourceId,
            dataViewId: useDS.dataViewId
          })
          if (!useDataSource) {
            useDataSource = tempUseDataSource
          }
          useDataSources.push(tempUseDataSource)
        }
      })
    }
  } else {
    // Case2: If actionConfig.useDataSource is not null, it is not the the first time to open the message action setting.
    //        For case2, we don't call getDsByWidgetId() to update useDataSource and useDataSources.
    //        But we need to validate messageActionConfig.useDataSource and messageActionConfig.useDataSources because the data source maybe removed from the message widget.
    //        If the data source is removed from the message widget, we also need to remove it from messageActionConfig.useDataSource and messageActionConfig.useDataSources.

    // the data source maybe removed, so need to validate the actionConfig.useDataSource again
    const compareMainDataSourceId = false
    useDataSource = validateUseDataSource(messageWidgetId, actionConfig.useDataSource, messageType, compareMainDataSourceId)
    if (actionConfig.useDataSources) {
      actionConfig.useDataSources.forEach(useDS => {
        const tempUseDataSource = validateUseDataSource(messageWidgetId, useDS, messageType, compareMainDataSourceId)
        tempUseDataSource && useDataSources.push(tempUseDataSource)
      })
    }
  }

  return {
    useDataSource: useDataSource,
    useDataSources: useDataSources
  }
}

// validate the data source is valid or not for the message type
function validateDataSourceForZoonToAndPanToMessageActionInSetting (dsId: string, messageType: MessageType): boolean {
  if (messageType === MessageType.DataSourceFilterChange) {
    // If ds is ImageryLayer, then zoom-to message action and pan-to message action don't support filtering change message.
    const ds = DataSourceManager.getInstance().getDataSource(dsId)

    if (ds) {
      if (ds.type === DataSourceTypes.ImageryLayer) {
        return false
      }
    }
  }

  return true
}

/**
 * Validate the oldUseDataSource still exists in message widget or not.
 * 1. If the oldUseDataSource still exists in message widget, return the oldUseDataSource.
 * 2. If the oldUseDataSource doesn't exist in message widget,
 *    2.1 If the length of (widgetJson.useDataSources + widgetJson.outputDataSources) is 1 and the only useDataSource is not WebMap/WebScene, then use the only data source as the return value.
 *    2.2 Otherwise return null.
 * @param widgetId
 * @param oldUseDataSource
 * @param messageType
 * @param compareMainDataSourceId If checkMainDataSourceId is true, this method compares useDataSources by useDataSource.mainDataSourceId, otherwise this method compares useDataSources by useDataSource.dataSourceId (default).
 * @returns
 */
export function validateUseDataSource (widgetId: string, oldUseDataSource: IMUseDataSource, messageType: MessageType, compareMainDataSourceId: boolean): IMUseDataSource {
  let initUseDataSource: IMUseDataSource = null

  const useDataSources = getDsByWidgetId(widgetId, messageType)
  const isNotEmptyUseDataSources = useDataSources && useDataSources.length > 0

  if (!isNotEmptyUseDataSources) {
    return null
  }

  let isUseOldDs = false

  if (oldUseDataSource) {
    const dsM = DataSourceManager.getInstance()
    const oldUseDataSourceIsOutputDs = dsM.getDataSource(oldUseDataSource.dataSourceId)?.getDataSourceJson()?.isOutputFromWidget

    isUseOldDs = useDataSources.some(useDataSource => {
      if (useDataSource) {
        if (isWebMapOrWebSceneDataSourceId(useDataSource.dataSourceId)) {
          // useDataSource is WebMap/WebScene
          return useDataSource.dataSourceId === oldUseDataSource.rootDataSourceId
        } else {
          // useDataSource is not WebMap/WebScene
          if (oldUseDataSourceIsOutputDs || compareMainDataSourceId) {
            // outputDataSource
            return oldUseDataSource.mainDataSourceId === useDataSource.mainDataSourceId
          } else {
            // not outputDataSource
            return oldUseDataSource.dataSourceId === useDataSource.dataSourceId
          }
        }
      }

      return false
    })
  }

  if (isUseOldDs) {
    initUseDataSource = oldUseDataSource
  } else {
    initUseDataSource = null

    // If the oldUseDataSource is invalid and there is only one data source in useDataSources, then we use it as the return value.
    if (useDataSources && useDataSources.length === 1) {
      const firstUseDataSource = useDataSources[0]

      if (firstUseDataSource && firstUseDataSource.dataSourceId && !isWebMapOrWebSceneDataSourceId(firstUseDataSource.dataSourceId)) {
        initUseDataSource = Immutable({
          dataSourceId: firstUseDataSource.dataSourceId,
          mainDataSourceId: firstUseDataSource.mainDataSourceId,
          dataViewId: firstUseDataSource.dataViewId,
          rootDataSourceId: firstUseDataSource.rootDataSourceId
        })
      }
    }
  }

  return initUseDataSource
}

interface DataSourceSelectorSourceDataForZoomToAndPanTo {
  // isReadOnly is true when there is only one layer data source available as the trigger data candidate of message action.
  isReadOnly: boolean
  // useDataSource is messageWidgetJson.useDataSource
  useDataSource: ImmutableObject<UseDataSource>
  // useDataSources is messageWidgetJson.useDataSources
  useDataSources: ImmutableArray<UseDataSource>
  // fromRootDsIds is the root data source ids of messageWidgetJson.useDataSources.
  fromRootDsIds: ImmutableArray<string>
  // fromDsIds is the data source ids of messageWidgetJson.useDataSources and messageWidgetJson.outputDataSources.
  // Note, fromRootDsIds and fromDsIds are mutually exclusive.
  fromDsIds: ImmutableArray<string>
}

/**
 * this method is only used in zoom-to setting and pan-to setting
 * this method is called by getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions(this.props.messageWidgetId, this.props.config.useDataSource, this.props.config.useDataSources, this.props.messageType)
 * @param messageWidgetId messageWidgetId is the widget that publishes message
 * @param useDataSource
 * @param useDataSources
 * @param messageType
 * @returns
 */
export function getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions (
  messageWidgetId: string,
  useDataSource: ImmutableObject<UseDataSource>,
  useDataSources: ImmutableArray<UseDataSource>,
  messageType: MessageType
): DataSourceSelectorSourceDataForZoomToAndPanTo {
  const appConfig = getAppConfig()

  //  messageWidgetJson is the widget that publishes message. messageWidgetJson.useDataSources and messageWidgetJson.outputDataSources provide data sources as the trigger data candidates of message action.
  //  messageWidgetJson.useDataSources maybe contain root data sources (webmap/webscene), or maybe contain layer data sources.
  const messageWidgetJson = appConfig?.widgets?.[messageWidgetId]

  //  dsRootIds is the root data source ids of messageWidgetJson.useDataSources.
  const dsRootIds = getDsRootIdsByWidgetId(messageWidgetId, messageType)

  // isReadOnly is true when there is only one layer data source available as the trigger data candidate of message action.
  let isReadOnly = false

  if (dsRootIds && dsRootIds.length > 0) {
    // If dsRootIds is not empty, means messageWidgetJson.useDataSources haves webmap/webscene. A webmap/webscene can contain multiple layer data source, so isReadOnly is false.
    isReadOnly = false
  } else {
    // If dsRootIds is empty, then we check the length of (widgetJson.useDataSources + widgetJson.outputDataSources) by checkIsOnlyOneDs() method, isReadOnly is true if the length is 0.
    isReadOnly = checkIsOnlyOneDs(messageWidgetJson, messageType, dsRootIds)
  }

  // const fromDsIds = dsRootIds ? undefined : getFromDsIdsByWidgetId(messageWidgetId, messageType)
  let fromDsIds: undefined | ImmutableArray<string>

  if (dsRootIds && dsRootIds.length > 0) {
    fromDsIds = undefined
  } else {
    // Get main data source ids by messageWidgetJson.useDataSources and messageWidgetJson.outputDataSources.
    const mainDsIds: ImmutableArray<string> = getFromDsIdsByWidgetId(messageWidgetId, messageType)
    // filter fromDsIds
    // If ds is ImageryLayer, then zoom-to message action and pan-to message action don't support filtering change message.
    fromDsIds = mainDsIds.filter((dsId: string) => {
      return validateDataSourceForZoonToAndPanToMessageActionInSetting(dsId, messageType)
    })
  }

  // Note, if both fromRootDsIds and fromDsIds are undefined, user can select all data sources from appConfig.dataSources. We need to avoid this case.
  // If rootIds is empty, then fromRootDsIds is undefined and fromDsIds is not undefined (fromDsIds maybe empty array).
  // If rootIds is not empty, then fromRootDsIds is not empty and fromDsIds is undefined.
  const dsSelectorSource: DataSourceSelectorSourceDataForZoomToAndPanTo = {
    isReadOnly: isReadOnly,
    useDataSource: useDataSource,
    useDataSources: useDataSources || Immutable([]),
    fromRootDsIds: dsRootIds,
    fromDsIds: fromDsIds
  }

  return dsSelectorSource
}

export interface ResultOfGetInitConfigForFilterAndFlashMessageActions {
  messageUseDataSource: IMUseDataSource
  actionUseDataSource: IMUseDataSource
  sqlExprObj: IMSqlExpression
}

/**
 * This method is only used in FilterActionSetting and FlashActionSetting.
 * @param props
 * @returns
 */
export function getInitConfigForFilterAndFlashMessageActions (props: ActionSettingProps<FilterMessageActionIMConfig> | ActionSettingProps<FlashMessageActionIMConfig>) {
  const messageWidgetId = props.messageWidgetId
  const appConfig = getAppConfig()

  let messageUseDataSource: IMUseDataSource = null
  let actionUseDataSource: IMUseDataSource = null

  if (!props.config.messageUseDataSource) {
    // props.config.messageUseDataSource is empty
    // For filter/flash message action, user can only select one layer data source as config.messageUseDataSource.
    // So, if useDataSources is only one layer data source, we can use it as config.messageUseDataSource because it is the only valid candidate layer data source.
    // If useDataSources.length >= 2, we can't pick one layer data source as the default config.messageUseDataSource, user must select it.
    const useDataSources = getDsByWidgetId(messageWidgetId, props.messageType)

    if (useDataSources && useDataSources.length === 1) {
      const firstUseDataSource = useDataSources[0]

      if (firstUseDataSource) {
        if (isWebMapOrWebSceneDataSourceId(firstUseDataSource.dataSourceId)) {
          // config.messageUseDataSource must be a layer data source, ignore the webmap/webscene
          messageUseDataSource = null
        } else {
          // firstUseDataSource is layer data source, try to use it as config.messageUseDataSource
          messageUseDataSource = Immutable({
            dataSourceId: firstUseDataSource.dataSourceId,
            mainDataSourceId: firstUseDataSource.mainDataSourceId,
            dataViewId: firstUseDataSource.dataViewId,
            rootDataSourceId: firstUseDataSource.rootDataSourceId
          })
        }
      }
    }
  } else {
    // props.config.messageUseDataSource is not empty, but it maybe removed from messageWidgetJson.useDataSources,
    // so we need to validate if props.config.messageUseDataSource is still valid.
    // If props.config.messageUseDataSource is still in messageWidgetJson.useDataSources, keep it.
    // If props.config.messageUseDataSource is not in messageWidgetJson.useDataSources, set config.messageUseDataSource to null.

    // Consider the following case:
    // There is a layer in the map. There are two data views for the layer: dataView1 and dataView2.
    // Table widget uses dataView1 and dataView2 as data sources.
    // Add a map flash/map filter message action for Table widget. Trigger data DataSourceSelector of flash/filter message action setting can only select main data source.
    // When we select the trigger data from data source tree, the final messageActionConfig.messageUseDataSource is the main data source of layer, not dataView1 or dataView2.
    // Then close the popper of flash/filter message action, then click the message action to open the popper again.
    // Then we will call getInitConfigForFilterAndFlashMessageActions() again. Now, props.config.messageUseDataSource is not null.
    // Then we will call validateUseDataSource() to validate props.config.messageUseDataSource still exists in widgetJson.useDataSources/widgetJson.outputDataSources or not.
    // validateUseDataSource() compares props.config.messageUseDataSource with tableWidgetJson.useDataSources by useDataSource.dataSourceId.
    // props.config.messageUseDataSource is layer main data source, but tableWidgetJson.useDataSources is data views of layer, like [dataView1, dataView2].
    // So, validateUseDataSource() thinks props.config.messageUseDataSource is not in tableWidgetJson.useDataSources/tableWidgetJson.outputDataSources.
    // Then messageUseDataSource is set to null. So, user can't see the trigger data any more when open flash/filter message action setting again.
    // So to fix the above issue, we can set compareMainDataSourceId to true, so validateUseDataSource() compares useDataSources by useDataSource.mainDataSourceId, not useDataSource.dataSourceId. Then props.config.messageUseDataSource is kept.
    // See #21155 for more details.
    const compareMainDataSourceId = true
    messageUseDataSource = validateUseDataSource(props.messageWidgetId, props.config.messageUseDataSource, props.messageType, compareMainDataSourceId)
  }

  const actionWidgetId = props.widgetId
  const actionWidgetJson = appConfig.widgets[actionWidgetId]

  if (!props.config.actionUseDataSource) {
    // props.config.actionUseDataSource is empty
    // For filter/flash message action, user can only select one layer data source as config.actionUseDataSource.
    // So, if useDataSources is only one layer data source, we can use it as config.actionUseDataSource because it is the only valid candidate layer data source.
    // If useDataSources.length >= 2, we can't pick one layer data source as the default config.actionUseDataSource, user must select it.
    if (actionWidgetJson && actionWidgetJson.useDataSources && actionWidgetJson.useDataSources.length === 1) {
      const firstUseDataSource = actionWidgetJson.useDataSources[0]

      if (firstUseDataSource) {
        if (isWebMapOrWebSceneDataSourceId(firstUseDataSource.dataSourceId)) {
          // config.actionUseDataSource must be a layer data source, ignore the webmap/webscene
          actionUseDataSource = null
        } else {
          // firstUseDataSource is layer data source, try to use it as config.actionUseDataSource
          // config.actionUseDataSource must be main data source, ignore data view
          actionUseDataSource = Immutable({
            dataSourceId: firstUseDataSource.dataSourceId,
            mainDataSourceId: firstUseDataSource.mainDataSourceId,
            dataViewId: firstUseDataSource.dataViewId,
            rootDataSourceId: firstUseDataSource.rootDataSourceId
          })
        }
      }
    }
  } else {
    // props.config.actionUseDataSource is not empty, but it maybe removed from actionWidgetJson.useDataSources,
    // so we need to validate if props.config.actionUseDataSource is still valid.
    // If props.config.actionUseDataSource is still in actionWidgetJson.useDataSources, keep it.
    // If props.config.actionUseDataSource is not in actionWidgetJson.useDataSources, set config.actionUseDataSource to null.

    // actionUseDataSource is selected from map, so actionUseDataSource must be main data source, can't be data view, so need to set compareMainDataSourceId to false to compare useDataSources strictly.
    const compareMainDataSourceId = false
    actionUseDataSource = validateUseDataSource(props.widgetId, props.config.actionUseDataSource, props.messageType, compareMainDataSourceId)
  }

  const oldActionUseDataSourceId = props.config.actionUseDataSource && props.config.actionUseDataSource.dataSourceId
  const newActionUseDataSourceId = actionUseDataSource && actionUseDataSource.dataSourceId

  // sqlExprObj is for actionUseDataSource
  if (newActionUseDataSourceId !== oldActionUseDataSourceId) {
    // If the new actionUseDataSource changed, need to set props.config.sqlExprObj to null.
    return {
      messageUseDataSource: messageUseDataSource,
      actionUseDataSource: actionUseDataSource,
      sqlExprObj: null
    }
  } else {
    // If the new actionUseDataSource not changed, keep props.config.sqlExprObj.
    return {
      messageUseDataSource: messageUseDataSource,
      actionUseDataSource: actionUseDataSource,
      sqlExprObj: props.config.sqlExprObj
    }
  }
}

interface DataSourceSelectorSourceDataForFilterAndFlash {
  isReadOnly: boolean
  useDataSources: ImmutableArray<UseDataSource>
  fromRootDsIds: ImmutableArray<string>
  fromDsIds: ImmutableArray<string>
}

export function getDataSourceSelectorSourceDataForFilterAndFlashMessageActions (widgetId: string, messageType: MessageType, useDataSource: Immutable.ImmutableObject<UseDataSource>) {
  const appConfig = getAppConfig()
  const widgetJson = appConfig?.widgets?.[widgetId]
  // Get the webmap/webscene data source ids from widgetJson.useDataSources
  const dsRootIds = getDsRootIdsByWidgetId(widgetId, messageType)
  const isReadOnly = checkIsOnlyOneDs(widgetJson, messageType, dsRootIds)
  const useDataSources = (useDataSource && useDataSource.dataSourceId) ? Immutable([useDataSource]) : Immutable([])

  // Get main data source ids from widgetJson.useDataSources and widgetJson.outputDataSources by this.props.messageType.
  const fromDsIds = (dsRootIds && dsRootIds.length > 0) ? undefined : getFromDsIdsByWidgetId(widgetId, messageType)

  // Note, if both fromRootDsIds and fromDsIds are undefined, user can select all data sources from appConfig.dataSources. We need to avoid this case.
  // If rootIds is empty, then fromRootDsIds is undefined and fromDsIds is not undefined (fromDsIds maybe empty array).
  // If rootIds is not empty, then fromRootDsIds is not empty and fromDsIds is undefined.
  const dsSelectorSource: DataSourceSelectorSourceDataForFilterAndFlash = {
    isReadOnly: isReadOnly,
    useDataSources: useDataSources,
    fromRootDsIds: dsRootIds,
    fromDsIds: fromDsIds
  }

  return dsSelectorSource
}

/**
 * Return useDataSources by check widgetJson.useDataSources, widgetJson.outputDataSources and widgetJson.useMapWidgetIds.
 * Firstly, get the messageCarryData by wId_widgetManifestJson.publishMessages[messageType].messageCarryData.
 * Then check messageCarryData,
 * Case1: If messageCarryData is MessageCarryData.OutputDataSource, return widgetJson.outputDataSources.
 * Case2: If messageCarryData is MessageCarryData.UseDataSource, return widgetJson.useDataSources.
 *        If widgetJson.useDataSources is undefined, then return mapUseDataSources by widgetJson.useMapWidgetIds.
 * Case3: If messageCarryData is MessageCarryData.BothDataSource, return both result data sources of case1 and case2.
 * @param wId
 * @param messageType
 * @returns
 */
export function getDsByWidgetId (wId: string, messageType: MessageType): ImmutableArray<UseDataSource> {
  // get the messageCarryData by wId_widgetManifestJson.publishMessages[messageType].messageCarryData
  const messageCarryData = getMessageCarryDataByWidgetId(wId, messageType)
  const appConfig = getAppConfig()
  const widgetJson = appConfig?.widgets?.[wId]
  const useDataSources: ImmutableArray<UseDataSource> = widgetJson?.useDataSources || Immutable([] as UseDataSource[])
  const outputDataSources: ImmutableArray<UseDataSource> = initOutputDataSources(widgetJson?.outputDataSources) || Immutable([] as UseDataSource[])
  const mapUseDataSources: ImmutableArray<UseDataSource> = getMapUseDataSourcesByUseMapWidgetIds(wId)

  // for MessageCarryData.OutputDataSource
  const resultForMessageCarryDataOutputDataSource = outputDataSources

  // for MessageCarryData.UseDataSource
  // Don't check by (useDataSources.length > 0), should check by (widgetJson?.useDataSources).
  // const resultForMessageCarryDataUseDataSource = useDataSources.length > 0 ? useDataSources : mapUseDataSources
  const resultForMessageCarryDataUseDataSource = widgetJson?.useDataSources ? useDataSources : mapUseDataSources

  // for MessageCarryData.BothDataSource
  const resultForMessageCarryDataBothDataSource = Immutable(resultForMessageCarryDataUseDataSource.asMutable({ deep: true }).concat(resultForMessageCarryDataOutputDataSource.asMutable({ deep: true })))

  switch (messageCarryData) {
    case MessageCarryData.OutputDataSource:
      return resultForMessageCarryDataOutputDataSource
    case MessageCarryData.UseDataSource:
      return resultForMessageCarryDataUseDataSource
    case MessageCarryData.BothDataSource:
      return resultForMessageCarryDataBothDataSource
  }
}

/**
 * Return the useDataSources of getDsByWidgetId(), but exclude WebMap and WebScene.
 * @param wId
 * @param messageType
 * @returns
 */
export function getDsByWidgetIdWithoutWebMapWebScene (wId: string, messageType: MessageType): ImmutableArray<UseDataSource> {
  const allUseDataSources = getDsByWidgetId(wId, messageType) || Immutable([] as UseDataSource[])
  const filteredUseDataSources = allUseDataSources.filter(useDataSource => {
    const isWebMapOrWebScene = isWebMapOrWebSceneDataSourceId(useDataSource?.dataSourceId)
    return !isWebMapOrWebScene
  })
  return filteredUseDataSources
}

/**
 * Get map useDataSources by widgetJson.useMapWidgetIds
 * @param widgetId Note, widgetId is not the map widget id. widgetId is the message widgetId.
 * @returns
 */
function getMapUseDataSourcesByUseMapWidgetIds (widgetId: string): ImmutableArray<UseDataSource> {
  const useDataSources: UseDataSource[] = []
  const widgetJson = getWidgetJson(widgetId)
  const useMapWidgetIds = widgetJson?.useMapWidgetIds
  // use dataSourceIdsObj[mapWidgetUseDataSourceObj.dataSourceId] to avoid duplicate dataSourceIds
  const dataSourceIdsObj: { [dataSourceId: string]: boolean } = {}

  if (useMapWidgetIds?.length > 0) {
    useMapWidgetIds.forEach(mapWidgetId => {
      if (mapWidgetId) {
        const mapWidgetJson = getWidgetJson(mapWidgetId)
        const mapWidgetUseDataSources = mapWidgetJson?.useDataSources

        if (mapWidgetUseDataSources) {
          mapWidgetUseDataSources.forEach(mapWidgetUseDataSource => {
            const mapWidgetUseDataSourceObj = mapWidgetUseDataSource?.asMutable?.({ deep: true }) as unknown as UseDataSource
            if (mapWidgetUseDataSourceObj && mapWidgetUseDataSourceObj.dataSourceId && !dataSourceIdsObj[mapWidgetUseDataSourceObj.dataSourceId]) {
              dataSourceIdsObj[mapWidgetUseDataSourceObj.dataSourceId] = true
              useDataSources.push(mapWidgetUseDataSourceObj)
            }
          })
        }
      }
    })
  }

  return Immutable(useDataSources)
}

export function getWidgetJson (widgetId: string): ImmutableObject<WidgetJson> {
  if (!widgetId) {
    return null
  }

  const appConfig = getAppConfig()
  return appConfig?.widgets?.[widgetId]
}

export function initOutputDataSources (outputDataSources): ImmutableArray<UseDataSource> {
  const ds = outputDataSources?.map(dsId => {
    return {
      dataSourceId: dsId,
      mainDataSourceId: dsId,
      rootDataSourceId: null
    }
  }) ?? []
  return Immutable(ds)
}

/**
 * widgetJson is the widget that publishes message. widgetJson.useDataSources and widgetJson.outputDataSources provide data sources as the trigger data candidates of message action.
 * widgetJson.useDataSources maybe contain root data sources (webmap/webscene), or maybe contain layer data sources.
 * dsRootIds is the root data source ids of widgetJson.useDataSources.
 * This method will return true if there is only one layer data source available.
 * a. If dsRootIds is not empty, means widgetJson.useDataSources haves webmap/webscene. A webmap/webscene can contain multiple layer data source, so it returns false.
 * b. If dsRootIds is empty, then we check the length of (widgetJson.useDataSources + widgetJson.outputDataSources), return true if the length is 0.
 * @param widgetJson
 * @param messageType
 * @param dsRootIds
 * @returns
 */
export function checkIsOnlyOneDs (widgetJson: IMWidgetJson, messageType: MessageType, dsRootIds: ImmutableArray<string>): boolean {
  const messageCarryData = getMessageCarryDataByWidgetId(widgetJson?.id, messageType)
  const outputDs = widgetJson?.outputDataSources || []
  const useDs = widgetJson?.useDataSources || []
  if (dsRootIds) {
    return false
  }
  switch (messageCarryData) {
    case MessageCarryData.OutputDataSource:
      return outputDs?.length === 1
    case MessageCarryData.UseDataSource:
      return useDs?.length === 1
    case MessageCarryData.BothDataSource:
      const dsLength = outputDs.length + useDs.length
      return dsLength === 1
  }
}

export function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}

export function getRuntimeState (): IMState {
  return window.jimuConfig?.isBuilder ? getAppStore().getState().appStateInBuilder : getAppStore().getState()
}

export function isExpressMode (): boolean {
  // const state = getAppStore().getState()
  // const isExpressMode = state?.appRuntimeInfo?.appMode === AppMode.Express
  const runtimeState = getRuntimeState()
  const isExpressMode = runtimeState?.appRuntimeInfo?.appMode === AppMode.Express
  return isExpressMode
}

/**
 * Get WebMap or WebScene data source ids from widgetJson.useDataSources or widgetJson.useMapWidgetIds.
 * The result is used as DataSourceSelector.props.fromRootDsIds.
 * @param wId
 * @returns
 */
function getDsRootIdsByWidgetId (wId: string, messageType: MessageType): ImmutableArray<string> {
  let rootIds: string[] = []

  const useDataSources = getDsByWidgetId(wId, messageType)

  if (useDataSources) {
    useDataSources.forEach((useDataSource) => {
      const dataSourceId = useDataSource?.dataSourceId

      if (dataSourceId && isWebMapOrWebSceneDataSourceId(dataSourceId)) {
        rootIds.push(dataSourceId)
      }
    })
  }

  // remove duplicate ids
  rootIds = Array.from(new Set(rootIds))

  // Note, if rootIds is empty, we still need to return undefined (instead of empty array []) for code compatibility.
  return rootIds.length > 0 ? Immutable(rootIds) : undefined
}

/**
 * Get main data source ids from widgetJson.useDataSources and widgetJson.outputDataSources by this.props.messageType.
 * The result is used as DataSourceSelector.props.fromDsIds.
 * @param wId
 * @param messageType
 * @returns
 */
function getFromDsIdsByWidgetId (wId: string, messageType: MessageType): ImmutableArray<string> {
  const useDataSources = getDsByWidgetId(wId, messageType)
  const mainDataSourceIds: string[] = []

  if (useDataSources) {
    useDataSources.forEach(useDataSource => {
      const mainDataSourceId = useDataSource?.mainDataSourceId

      if (mainDataSourceId && !isWebMapOrWebSceneDataSourceId(mainDataSourceId)) {
        mainDataSourceIds.push(mainDataSourceId)
      }
    })
  }

  // Note, the return value can't be undefined. The return value maybe empty array.
  return Immutable(mainDataSourceIds)
}

export function isWebMapOrWebSceneDataSourceId (dataSourceId: string): boolean {
  const appConfig = getAppConfig()

  if (dataSourceId && appConfig.dataSources) {
    const dsJson = appConfig.dataSources[dataSourceId]

    if (dsJson && ((dsJson.type === DataSourceTypes.WebMap) || (dsJson.type === DataSourceTypes.WebScene))) {
      return true
    }
  }

  return false
}

/**
 * This method will return true only if the following conditions are met at the same time.
 * 1. The message widget is Search.
 * 2. The message type is DataRecordSetChange.
 * 3. The widget connects with map.
 *
 * This method is called by the filterMessageDescription method of show-on-map/zoom-to/pan-to message actions.
 * When Search widget connects with map, it will read geocoder from map. And Search will create local data sources for the geocoders.
 * In the manifest of Search widget, only output data sources can publish DataRecordSetChange message. Local data sources are not output data sources.
 * So, getDsByWidgetId() will return empty array and show-on-map/zoom-to/pan-to message actions are not available for this case.
 * To workaround this, we need to check this special case and let the filterMessageDescription method of show-on-map/zoom-to/pan-to returns true.
 *
 * See #22225 for more details.
 * @param messageDescription
 * @returns
 */
export function isSpecialCaseOfSearchWidget (messageDescription: MessageDescription): boolean {
  const messageWidgetId = messageDescription.widgetId

  if ((messageDescription.messageType === MessageType.DataRecordSetChange || messageDescription.messageType === MessageType.DataRecordsSelectionChange) && messageWidgetId) {
    const messageWidgetJson = getWidgetJson(messageWidgetId)

    if (messageWidgetJson && messageWidgetJson.uri === 'widgets/common/search/' && messageWidgetJson.useMapWidgetIds?.length > 0) {
      return true
    }
  }

  return false
}
