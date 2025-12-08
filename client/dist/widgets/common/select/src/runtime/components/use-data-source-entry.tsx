import { React, type ImmutableArray, Immutable, getAppStore, DataSourceManager, utils as jimuCoreUtils, type FeatureLayerDataSource, DataSourceTypes } from 'jimu-core'
import SelectHeader from './select-header'
import SelectByFilter from './select-by-filter'
import SelectByLocation from './select-by-location'
import {
  WidgetDisplayMode, type UpdateWidgetDisplayMode, type SelectWidgetProps, type DataSourceItemRuntimeInfoMap,
  type WidgetDomRef, getInitialDataSourceItemRuntimeInfoMap, getImDataSourceItemForGeneratedDataSource,
  type UpdateDataSourceItemRuntimeInfoForUid, type RemoveNotUsedDataSourceItemRuntimeInfoMap, getReadyToDisplayRuntimeInfos
} from '../utils'
import type { DataSourceItem, IMDataSourceItem } from '../../config'
import { isSupportedDataSourceType } from '../../utils'

export interface UseDataSourceEntryProps {
  isRTL: boolean
  className?: string
  widgetProps: SelectWidgetProps
  widgetDomRef: WidgetDomRef
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
  mixinDataSourceItemRuntimeInfoMap: (updatedDataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap) => void
  updateDataSourceItemRuntimeInfoForUid: UpdateDataSourceItemRuntimeInfoForUid
  removeNotUsedDataSourceItemRuntimeInfoMap: RemoveNotUsedDataSourceItemRuntimeInfoMap
  updateWidgetDisplayMode: UpdateWidgetDisplayMode
}

/**
 * Entry component when source radio 'Select by data attribute' is checked.
 */
export default function UseDataSourceEntry (props: UseDataSourceEntryProps): React.ReactElement {
  const {
    isRTL,
    className,
    widgetProps,
    widgetDomRef,
    dataSourceItemRuntimeInfoMap,
    mixinDataSourceItemRuntimeInfoMap,
    updateDataSourceItemRuntimeInfoForUid,
    removeNotUsedDataSourceItemRuntimeInfoMap,
    updateWidgetDisplayMode
  } = props

  const removeNotUsedDataSourceItemRuntimeInfoMapRef = React.useRef<RemoveNotUsedDataSourceItemRuntimeInfoMap>(null)
  removeNotUsedDataSourceItemRuntimeInfoMapRef.current = removeNotUsedDataSourceItemRuntimeInfoMap

  const {
    widgetId,
    config,
    dataSourceCount: dsCountInAppState,
    autoControlWidgetId
  } = widgetProps

  const {
    dataAttributeInfo,
    spatialSelection
  } = config

  const {
    allowGenerated,
    dataSourceItems: configDataSourceItems
  } = dataAttributeInfo

  // By default, this.props.enableDataAction is undefined, which means enabled.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  const enableDataAction = widgetProps.enableDataAction !== false
  const shouldRenderSelectByLocation = !!(spatialSelection?.enable)

  // isSelectByLocationVisible is used to add d-none
  const [isSelectByLocationVisible, setSelectByLocationVisible] = React.useState<boolean>(false)

  // store generated data sources at runtime
  const [generatedImDataSourceItems, setGeneratedImDataSourceItems] = React.useState<ImmutableArray<DataSourceItem>>(Immutable([]))

  // generatedImDataSourceItems + configDataSourceItems
  const allImDataSourceItems = React.useMemo(() => {
    return generatedImDataSourceItems.concat(configDataSourceItems)
  }, [configDataSourceItems, generatedImDataSourceItems])

  const allImDataSourceItemsRef = React.useRef<Immutable.ImmutableArray<DataSourceItem>>(allImDataSourceItems)
  allImDataSourceItemsRef.current = allImDataSourceItems

  // update widgetDisplayMode
  React.useEffect(() => {
    let newDisplayMode: WidgetDisplayMode = null

    if (allImDataSourceItems.length > 0) {
      const readyToDisplayRuntimeInfos = getReadyToDisplayRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)

      if (readyToDisplayRuntimeInfos.length > 0) {
        // some items are ready to display
        newDisplayMode = WidgetDisplayMode.Normal
      } else {
        // all items are loading
        newDisplayMode = WidgetDisplayMode.Loading
      }
    } else {
      // show placeholder if doesn't have any items
      newDisplayMode = WidgetDisplayMode.Placeholder
    }

    updateWidgetDisplayMode(newDisplayMode)
  }, [allImDataSourceItems, dataSourceItemRuntimeInfoMap, updateWidgetDisplayMode])

  // try to update generated data sources when ds count (Object.keys(_appState.dataSourcesInfo).length) changes
  React.useEffect(() => {
    // console.log('ds count change', dsCountInAppState)

    if (!allowGenerated) {
      if (generatedImDataSourceItems.length !== 0) {
        // switch from enable allowGenerated to disable allowGenerated
        setGeneratedImDataSourceItems(Immutable([]))
      }

      return
    }

    const appState = getAppStore().getState()
    const dataSourcesInfo = appState.dataSourcesInfo || Immutable({})
    const dsManager = DataSourceManager.getInstance()
    const oldGeneratedDataSourceIds = generatedImDataSourceItems.map(item => item.useDataSource.dataSourceId).asMutable()
    const newGeneratedDataSourceIds: string[] = []
    Object.keys(dataSourcesInfo).forEach(dsId => {
      // ignore the data source that created by view-in-table action
      if (dsId.includes('view_in_table')) {
        return
      }

      const ds = dsManager.getDataSource(dsId)

      if (ds) {
        const isAssociatedFeatureLayer = (ds as FeatureLayerDataSource).isAssociatedFeatureLayer
        const dsJson = ds.getDataSourceJson()
        const isOutputFromWidget = dsJson?.isOutputFromWidget

        // only want to get generated main data sources by (!ds.isInAppConfig() && !ds.isDataView && !ds.isLocal && !isOutputFromWidget)
        // ignore the output data source generated by widgets such as Search by !isOutputFromWidget
        // ignore the associated data source by (!isAssociatedFeatureLayer), otherwise Select will show two data sources (one SceneLayerDataSource and one FeatureLayerDataSource) when AddData add a scene layer url
        if (!ds.isInAppConfig() && !ds.isDataView && !ds.isLocal && !isOutputFromWidget && !isAssociatedFeatureLayer) {
          // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive. For generated data sources/layers, we only include SubtypeSublayers and exclude SubtypeGrouplayers.
          if (isSupportedDataSourceType(ds.type) && ds.type !== DataSourceTypes.SubtypeGroupLayer) {
            newGeneratedDataSourceIds.push(ds.id)
          }
        }
      }
    })

    const {
      added: addedGeneratedDsIds,
      deleted: deletedGeneratedDsId,
      saved: keptGeneratedDsIds
    } = jimuCoreUtils.diffArrays(true, oldGeneratedDataSourceIds, newGeneratedDataSourceIds)

    if (addedGeneratedDsIds.length === 0 && deletedGeneratedDsId.length === 0) {
      // no generated data source change
      return
    }

    // ImDataSourceItems that both in oldGeneratedDataSourceIds and newGeneratedDataSourceIds
    const keptGeneratedImDataSourceItems = generatedImDataSourceItems.filter(generatedImDataSourceItem => {
      const dsId = generatedImDataSourceItem.useDataSource.dataSourceId
      return keptGeneratedDsIds.includes(dsId)
    })

    const addedGeneratedDataSourceItems: IMDataSourceItem[] = []

    if (addedGeneratedDsIds.length > 0) {
      // add generated data source
      addedGeneratedDsIds.forEach(dsId => {
        const ds = dsManager.getDataSource(dsId)

        if (ds) {
          const newImDataSourceItem = getImDataSourceItemForGeneratedDataSource(ds)
          addedGeneratedDataSourceItems.push(newImDataSourceItem)
        }
      })

      // add runtimeInfos for addedGeneratedDataSourceItems
      const useMap = false
      const supportCustomSQLBuilder = true
      const newAddedDataSourceItemRuntimeInfoMap = getInitialDataSourceItemRuntimeInfoMap(useMap, supportCustomSQLBuilder, addedGeneratedDataSourceItems, dataSourceItemRuntimeInfoMap)
      mixinDataSourceItemRuntimeInfoMap(newAddedDataSourceItemRuntimeInfoMap)
    }

    const finalGeneratedImDataSourceItems = keptGeneratedImDataSourceItems.concat(addedGeneratedDataSourceItems)
    setGeneratedImDataSourceItems(finalGeneratedImDataSourceItems)
  }, [dsCountInAppState, allowGenerated, generatedImDataSourceItems, mixinDataSourceItemRuntimeInfoMap, setGeneratedImDataSourceItems, dataSourceItemRuntimeInfoMap])

  // need to check if some configDataSourceItems are added or some configDataSourceItems are removed
  // need to add new runtimeInfos for config DataSourceItems which doesn't have runtimeInfo
  React.useEffect(() => {
    // dataSourceItemsWithoutRuntimeInfo are new added data sources
    const dataSourceItemsWithoutRuntimeInfo = configDataSourceItems.filter(imDataSourceItem => {
      const uid = imDataSourceItem.uid
      const itemRuntimeInfo = dataSourceItemRuntimeInfoMap[uid]
      return !itemRuntimeInfo
    })

    // TODO: should only execute the flowing code logic when items added into dataSourceItemsWithoutRuntimeInfo and ignore dataSourceItemRuntimeInfoMap changes
    if (dataSourceItemsWithoutRuntimeInfo.length > 0) {
      // add new runtimeInfos for config DataSourceItems which doesn't have runtimeInfo
      const useMap = false
      const supportCustomSQLBuilder = false
      const runtimeInfoMapForNewDataSourceItems = getInitialDataSourceItemRuntimeInfoMap(useMap, supportCustomSQLBuilder, dataSourceItemsWithoutRuntimeInfo, dataSourceItemRuntimeInfoMap)
      mixinDataSourceItemRuntimeInfoMap(runtimeInfoMapForNewDataSourceItems)
    }
  }, [configDataSourceItems, dataSourceItemRuntimeInfoMap, mixinDataSourceItemRuntimeInfoMap])

  // Remove not used runtimeInfo cache, allImDataSourceItems are all used DataSourceItems.
  // Note, we should put useEffect at the end of UseMapEntry.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (allImDataSourceItemsRef.current) {
        const allUsedUids: string[] = []
        // Here, we should use allImDataSourceItemsRef.current instead of allImDataSourceItems, because allImDataSourceItems may not be the latest,
        // which will cause some runtimeInfo to be deleted incorrectly if we miscalculate allUsedUids based on allImDataSourceItems.
        // For related cases, see https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/22349#issuecomment-5080664.
        allImDataSourceItemsRef.current.forEach(imDataSourceItem => {
          allUsedUids.push(imDataSourceItem.uid)
        })

        if (removeNotUsedDataSourceItemRuntimeInfoMapRef.current) {
          removeNotUsedDataSourceItemRuntimeInfoMapRef.current(allUsedUids)
        }
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [allImDataSourceItems]) // Note, this effect should only use allImDataSourceItems as the only dependency.

  const classNames = ['select-use-data-source-entry']

  if (className) {
    classNames.push(className)
  }

  const strFinalClassName = classNames.join(' ')

  return (
    <div className={strFinalClassName}>
      <SelectHeader
        config={config}
        widgetId={widgetId}
        mapWidgetId=''
        autoControlWidgetId={autoControlWidgetId}
        activeJimuMapView={null}
        setSelectByLocationVisible={setSelectByLocationVisible}
        allImDataSourceItems={allImDataSourceItems}
        dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
      />

      {
        shouldRenderSelectByLocation &&
        <SelectByLocation
          widgetId={widgetId}
          visible={isSelectByLocationVisible}
          allImDataSourceItems={allImDataSourceItems}
          dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
          imSpatialSelection={spatialSelection}
          updateDataSourceItemRuntimeInfoForUid={updateDataSourceItemRuntimeInfoForUid}
        />
      }

      <SelectByFilter
        isRTL={isRTL}
        widgetId={widgetId}
        widgetDomRef={widgetDomRef}
        jimuMapView={null}
        enableDataAction={enableDataAction}
        allImDataSourceItems={allImDataSourceItems}
        notConfigDataSourceItems={generatedImDataSourceItems}
        configDataSourceItems={configDataSourceItems}
        dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
        updateDataSourceItemRuntimeInfoForUid={updateDataSourceItemRuntimeInfoForUid}
      />
    </div>
  )
}
