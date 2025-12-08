import { React, type ImmutableArray, Immutable, DataSourceManager, utils as jimuCoreUtils, DataSourceTypes, JSAPILayerTypes } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent, type JimuLayerView } from 'jimu-arcgis'
import SelectHeader from './select-header'
import SelectByFilter from './select-by-filter'
import SelectByLocation from './select-by-location'
import {
  WidgetDisplayMode, type UpdateWidgetDisplayMode, type SelectWidgetProps, type DataSourceItemRuntimeInfoMap, type WidgetDomRef,
  type MixinDataSourceItemRuntimeInfoMap, type UpdateDataSourceItemRuntimeInfoForUid, type ClearAllDataSourceItemRuntimeInfoMap,
  type RemoveNotUsedDataSourceItemRuntimeInfoMap, type RemoveGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap, getInitialDataSourceItemRuntimeInfoMap,
  getImDataSourceItemForGeneratedDataSource, getReadyToDisplayRuntimeInfos
} from '../utils'
import { type DataSourceItem, type IMDataSourceItem, getDefaultIMMapInfo, getDefaultIMJimuMapViewConfigInfo, type IMJimuMapViewConfigInfo } from '../../config'
import {
  isSupportedDataSourceType, isSupportedJimuLayerView, getFinalAllowGeneratedForMap, getFinalEnableAttributeSelectionForMap,
  sortDataSourceItemsByLayersOrder, getNeverRejectPromise, getWidgetJson
} from '../../utils'

export interface UseMapEntryProps {
  isRTL: boolean
  className?: string
  widgetProps: SelectWidgetProps
  widgetDomRef: WidgetDomRef
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
  mixinDataSourceItemRuntimeInfoMap: MixinDataSourceItemRuntimeInfoMap
  updateDataSourceItemRuntimeInfoForUid: UpdateDataSourceItemRuntimeInfoForUid
  clearAllDataSourceItemRuntimeInfoMap: ClearAllDataSourceItemRuntimeInfoMap
  removeNotUsedDataSourceItemRuntimeInfoMap: RemoveNotUsedDataSourceItemRuntimeInfoMap
  removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap: RemoveGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap
  updateWidgetDisplayMode: UpdateWidgetDisplayMode
}

/**
 * Entry component when source radio 'Interact with a Map widget' is checked.
 */
export default function UseMapEntry (props: UseMapEntryProps) {
  const {
    isRTL,
    className,
    widgetProps,
    widgetDomRef,
    dataSourceItemRuntimeInfoMap,
    mixinDataSourceItemRuntimeInfoMap,
    updateDataSourceItemRuntimeInfoForUid,
    clearAllDataSourceItemRuntimeInfoMap,
    removeNotUsedDataSourceItemRuntimeInfoMap,
    removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap,
    updateWidgetDisplayMode
  } = props

  const dataSourceItemRuntimeInfoMapRef = React.useRef<DataSourceItemRuntimeInfoMap>(null)
  dataSourceItemRuntimeInfoMapRef.current = dataSourceItemRuntimeInfoMap

  const clearAllDataSourceItemRuntimeInfoMapRef = React.useRef<ClearAllDataSourceItemRuntimeInfoMap>(null)
  clearAllDataSourceItemRuntimeInfoMapRef.current = clearAllDataSourceItemRuntimeInfoMap

  const removeNotUsedDataSourceItemRuntimeInfoMapRef = React.useRef<RemoveNotUsedDataSourceItemRuntimeInfoMap>(null)
  removeNotUsedDataSourceItemRuntimeInfoMapRef.current = removeNotUsedDataSourceItemRuntimeInfoMap

  const removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMapRef = React.useRef<RemoveGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap>(null)
  removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMapRef.current = removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMap

  const {
    widgetId,
    config,
    dataSourceCount: dsCountInAppState,
    mapWidgetId,
    autoControlWidgetId,
    state: widgetState
  } = widgetProps

  const {
    spatialSelection
  } = config

  const mapInfo = config.mapInfo || getDefaultIMMapInfo()

  // By default, this.props.enableDataAction is undefined, which means enabled.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  const enableDataAction = widgetProps.enableDataAction !== false
  const shouldRenderSelectByLocation = !!(spatialSelection?.enable)

  // isSelectByLocationVisible is used to add d-none
  const [isSelectByLocationVisible, setSelectByLocationVisible] = React.useState<boolean>(false)
  const [activeJimuMapView, setActiveJimuMapView] = React.useState<JimuMapView>(null)
  const activeJimuMapViewRef = React.useRef<JimuMapView>(activeJimuMapView)
  activeJimuMapViewRef.current = activeJimuMapView

  // const preActiveJimuMapView = hooks.usePrevious(activeJimuMapView)
  const activeJimuMapViewId = activeJimuMapView ? activeJimuMapView.id : ''
  const activeJimuMapViewInfoConfig = React.useMemo(() => {
    let jimuMapViewInfoConfig: IMJimuMapViewConfigInfo = null

    if (mapInfo && activeJimuMapViewId) {
      jimuMapViewInfoConfig = mapInfo[activeJimuMapViewId]
    }

    if (!jimuMapViewInfoConfig) {
      jimuMapViewInfoConfig = getDefaultIMJimuMapViewConfigInfo()
    }

    return jimuMapViewInfoConfig
  }, [activeJimuMapViewId, mapInfo])

  const syncWithMap = !!activeJimuMapViewInfoConfig.syncWithMap
  const syncWithMapRef = React.useRef<boolean>(syncWithMap)
  syncWithMapRef.current = syncWithMap

  const allowMapBuiltin = syncWithMap
  const allowMapBuiltinRef = React.useRef<boolean>(allowMapBuiltin)
  allowMapBuiltinRef.current = allowMapBuiltin

  // make sure allowGenerated is boolean value, otherwise hooks.usePrevious(allowGenerated) maybe not work correctly
  const allowGenerated = getFinalAllowGeneratedForMap(syncWithMap, activeJimuMapViewInfoConfig.allowGenerated)
  const allowGeneratedRef = React.useRef<boolean>(allowGenerated)
  allowGeneratedRef.current = allowGenerated
  // const preAllowGenerated = hooks.usePrevious(allowGenerated)

  const enableAttributeSelection = getFinalEnableAttributeSelectionForMap(syncWithMap, activeJimuMapViewInfoConfig.enableAttributeSelection)
  const enableAttributeSelectionRef = React.useRef<boolean>(enableAttributeSelection)
  enableAttributeSelectionRef.current = enableAttributeSelection

  // allImDataSourceItems = imDataSourceItemsFromMap + configDataSourceItems

  // store data sources that reads from map
  // If syncWithMap is true and allowGenerated is true, imDataSourceItemsFromMap = map builtin layers + generated layers
  // If syncWithMap is true and allowGenerated is false, imDataSourceItemsFromMap = map builtin layers
  // If syncWithMap is false and allowGenerated is true, imDataSourceItemsFromMap = generated layers
  // If syncWithMap is false and allowGenerated is false, imDataSourceItemsFromMap = empty layers
  const [imDataSourceItemsFromMap, setImDataSourceItemsFromMap] = React.useState<ImmutableArray<DataSourceItem>>(Immutable([]))

  // updateGeneratedDataSourcesRef.current is updateIMDataSourceItemsFromMap method
  const updateIMDataSourceItemsFromMapRef = React.useRef<() => void>(null)
  // update imDataSourceItemsFromMap by jimuMapViewInfoConfig and activeJimuMapView
  const updateIMDataSourceItemsFromMap = React.useCallback(() => {
    if ((!allowMapBuiltin && !allowGenerated) || !activeJimuMapView) {
      if (imDataSourceItemsFromMap.length !== 0) {
        // switch from sync with map to not sync
        // switch from enable allowGenerated to disable allowGenerated
        setImDataSourceItemsFromMap(Immutable([]))
      }
      return
    }

    const dsManager = DataSourceManager.getInstance()
    const oldLayerDataSourceIds = imDataSourceItemsFromMap.map(item => item.useDataSource.dataSourceId).asMutable()
    const newLayerDataSourceIds: string[] = []

    const jimuQueriableLayerViews = getValidJimuQueriableLayerViewsFromMap(activeJimuMapView, allowMapBuiltin, allowGenerated)
    jimuQueriableLayerViews.forEach(jimuQueriableLayerView => {
      const layerDs = jimuQueriableLayerView.getLayerDataSource()

      // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive. For generated data sources/layers, we only include SubtypeSublayers and exclude SubtypeGrouplayers.
      if (layerDs && isSupportedDataSourceType(layerDs.type) && layerDs.type !== DataSourceTypes.SubtypeGroupLayer) {
        const dsJson = layerDs.getDataSourceJson()
        const isOutputFromWidget = dsJson?.isOutputFromWidget

        if (!isOutputFromWidget) {
          newLayerDataSourceIds.push(layerDs.id)
        }
      }
    })

    const {
      added: addedLayerDsIds,
      // deleted: deletedLayerDsIds,
      saved: keptLayerDsIds
    } = jimuCoreUtils.diffArrays(true, oldLayerDataSourceIds, newLayerDataSourceIds)

    // if (addedLayerDsIds.length === 0 && deletedLayerDsIds.length === 0) {
    //   // nothing change
    //   return
    // }

    // ImDataSourceItems that both in oldLayerDataSourceIds and newLayerDataSourceIds
    const keptImDataSourceItems = imDataSourceItemsFromMap.filter(imDataSourceItemFromMap => {
      const dsId = imDataSourceItemFromMap.useDataSource.dataSourceId
      return keptLayerDsIds.includes(dsId)
    })

    const addedDataSourceItems: IMDataSourceItem[] = []

    if (addedLayerDsIds.length > 0) {
      // add data source
      addedLayerDsIds.forEach(dsId => {
        const ds = dsManager.getDataSource(dsId)

        if (ds) {
          const jimuLayerView = activeJimuMapView.getJimuLayerViewByDataSourceId(ds.id)
          const jimuLayerViewId = jimuLayerView?.id
          const newImDataSourceItem = getImDataSourceItemForGeneratedDataSource(ds, jimuLayerViewId)
          addedDataSourceItems.push(newImDataSourceItem)
        }
      })

      // We don't need to call getInitialDataSourceItemRuntimeInfoMap() and mixinDataSourceItemRuntimeInfoMap() here to add runtimeInfo for addedDataSourceItems,
      // because we use below useEffect to add new runtimeInfos for imDataSourceItemsFromMap which doesn't have runtimeInfo.
    }

    // calculated sortedNewImDataSourceItems
    const newImDataSourceItems = keptImDataSourceItems.concat(addedDataSourceItems)
    const newDataSourceItems = newImDataSourceItems.asMutable() as unknown as DataSourceItem[]
    // TODO: need to verify the sorted results
    const sortedNewDataSourceItems = sortDataSourceItemsByLayersOrder(activeJimuMapView, newDataSourceItems)
    const sortedNewImDataSourceItems = Immutable(sortedNewDataSourceItems)

    // update imDataSourceItemsFromMap by sortedNewImDataSourceItems
    setImDataSourceItemsFromMap(sortedNewImDataSourceItems)
  }, [activeJimuMapView, allowGenerated, allowMapBuiltin, imDataSourceItemsFromMap])

  updateIMDataSourceItemsFromMapRef.current = updateIMDataSourceItemsFromMap

  // Need to add new runtimeInfos for imDataSourceItemsFromMap which doesn't have runtimeInfo.
  React.useEffect(() => {
    // dataSourceItemsWithoutRuntimeInfo are new added data sources or the data sources which runtimeInfo is removed.
    const dataSourceItemsWithoutRuntimeInfo = imDataSourceItemsFromMap.filter(imDataSourceItem => {
      const uid = imDataSourceItem.uid
      const itemRuntimeInfo = dataSourceItemRuntimeInfoMap[uid]
      return !itemRuntimeInfo
    })

    if (dataSourceItemsWithoutRuntimeInfo.length > 0) {
      // add new runtimeInfos for imDataSourceItemsFromMap which doesn't have runtimeInfo
      const useMap = true

      let supportCustomSQLBuilder = false

      if (enableAttributeSelection) {
        // case3: activeJimuMapViewInfoConfig.syncWithMap is false and activeJimuMapViewInfoConfig.enableAttributeSelection is true
        // imDataSourceItemsFromMap should all be generated layers because syncWithMap is false, so set supportCustomSQLBuilder to true
        supportCustomSQLBuilder = true
      } else {
        // case1: activeJimuMapViewInfoConfig.syncWithMap is true, all layers (builtin layers and generated layers) should not support custom sql builder
        // case2: activeJimuMapViewInfoConfig.syncWithMap is false and activeJimuMapViewInfoConfig.enableAttributeSelection is false
        supportCustomSQLBuilder = false
      }

      const runtimeInfoMapForNewDataSourceItems = getInitialDataSourceItemRuntimeInfoMap(useMap, supportCustomSQLBuilder, dataSourceItemsWithoutRuntimeInfo, dataSourceItemRuntimeInfoMap)
      mixinDataSourceItemRuntimeInfoMap(runtimeInfoMapForNewDataSourceItems)
    }
  }, [dataSourceItemRuntimeInfoMap, enableAttributeSelection, imDataSourceItemsFromMap, mixinDataSourceItemRuntimeInfoMap])

  // This method do two things
  // 1. create necessary layer data sources for supported JimuQueriableLayerViews by allowMapBuiltin and allowGenerated
  // 2. call updateIMDataSourceItemsFromMap() to update imDataSourceItemsFromMap
  const createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap = React.useCallback((_activeJimuMapView: JimuMapView) => {
    // _activeJimuMapView maybe null
    const jimuQueriableLayerViews = getValidJimuQueriableLayerViewsFromMap(_activeJimuMapView, allowMapBuiltinRef.current, allowGeneratedRef.current)
    const p = safelyCreateLayerDataSourceForJimuLayerViews(jimuQueriableLayerViews)

    // some jimuLayerView.createLayerDataSource() (like SceneLayer without associated feature layer) will reject the promise,
    // it is as expected, so we call updateIMDataSourceItemsFromMap() in the finally callback, not just in the then() callback.
    p.finally(() => {
      if (updateIMDataSourceItemsFromMapRef.current) {
        updateIMDataSourceItemsFromMapRef.current()
      }
    })
  }, [])
  const createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef = React.useRef<(_activeJimuMapView: JimuMapView) => void>(null)
  createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current = createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap

  // If syncWithMap changed,
  // 1. Need to call clearAllDataSourceItemRuntimeInfoMap to clear the runtimeInfo cache
  // 2. Need to call createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap to create layer data sources and update imDataSourceItemsFromMap
  React.useEffect(() => {
    // When syncWithMap changed, we need to clear the runtimeInfo cache.
    if (clearAllDataSourceItemRuntimeInfoMapRef.current) {
      clearAllDataSourceItemRuntimeInfoMapRef.current()
    }

    if (createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current && activeJimuMapViewRef.current) {
      // 1. create necessary layer data sources for supported JimuQueriableLayerViews by allowMapBuiltin and allowGenerated
      // 2. call updateIMDataSourceItemsFromMap() to update imDataSourceItemsFromMap
      createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current(activeJimuMapViewRef.current)
    }
  }, [syncWithMap]) // Note, this effect should only use syncWithMap as the only dependency.

  // If allowGenerated changed,
  // 1. Need to call createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap to create layer data sources and update imDataSourceItemsFromMap
  React.useEffect(() => {
    // When allowGenerated changed from true to false, we don't need to remove the runtimeInfo cache of generated layers because we use another useEffect to remove not used runtimeInfo in UseMapEntry.

    if (createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current && activeJimuMapViewRef.current) {
      // 1. create necessary layer data sources for supported JimuQueriableLayerViews by allowMapBuiltin and allowGenerated
      // 2. call updateIMDataSourceItemsFromMap() to update imDataSourceItemsFromMap
      createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current(activeJimuMapViewRef.current)
    }
  }, [allowGenerated]) // Note, this effect should only use allowGenerated as the only dependency.

  // If allowGenerated changed,
  // 1. Need to remove the old runtimeInfos of generated layers.
  // 2. Don't need to call createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap because imDataSourceItemsFromMap should not change.
  React.useEffect(() => {
    // If syncWithMap is true, all builtin layers don't show custom sql builder.
    // If syncWithMap is false, all builtin layers also don't show custom sql builder because they can set SqlExpression in config.
    // So, enableAttributeSelection never affects builtin layers. enableAttributeSelection can only affect generated layers.
    // We should remove the old runtimeInfos of generated layers and we use another useEffect to add new runtimeInfos for these generated layers.
    if (removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMapRef.current) {
      removeGeneratedJimuLayerViewDataSourceItemRuntimeInfoMapRef.current()
    }
  }, [enableAttributeSelection]) // Note, this effect should only use enableAttributeSelection as the only dependency.

  // If activeJimuMapView changed
  // 1. Need to call clearAllDataSourceItemRuntimeInfoMap to clear the runtimeInfo cache
  // 2. Need to call createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMap to create layer data sources and update imDataSourceItemsFromMap
  // 3. Need to add JimuLayerViewCreatedListener
  // 4. Need to add JimuLayerViewsVisibleChangedListener
  // Don't use allowGenerated, allowMapBuiltin and syncWithMap as dependencies because it makes the return callback be more complex. Use allowGeneratedRef, allowMapBuiltinRef and syncWithMapRef instead.
  // Note, this effect should only use activeJimuMapView as the only dependency.
  React.useEffect(() => {
    // need to check if activeJimuMapView really changed because we will also go to here if other dependencies (allowGenerated, allowMapBuiltin, syncWithMap) changed
    // const isActiveJimuMapViewChanged = preActiveJimuMapView !== activeJimuMapView
    // if (!isActiveJimuMapViewChanged) {
    //   return
    // }

    // When activeJimuMapView changed, we need to clear the runtimeInfo cache.
    if (clearAllDataSourceItemRuntimeInfoMapRef.current) {
      clearAllDataSourceItemRuntimeInfoMapRef.current()
    }

    if (createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current) {
      // 1. create necessary layer data sources for supported JimuQueriableLayerViews by allowMapBuiltin and allowGenerated
      // 2. call updateIMDataSourceItemsFromMap() to update imDataSourceItemsFromMap
      createLayerDataSourcesForJimuMapViewAndUpdateIMDataSourceItemsFromMapRef.current(activeJimuMapView)
    }

    // add JimuLayerViewCreatedListener
    const jimuLayerViewCreatedListener = async (newJimuLayerView: JimuLayerView) => {
      // use isJimuLayerViewInMap(newJimuLayerView) to make sure the newJimuLayerView is alive
      // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive. For generated data sources/layers, we only include SubtypeSublayers and exclude SubtypeGrouplayers.
      if (newJimuLayerView && isValidJimuQueriableLayerView(newJimuLayerView, allowMapBuiltinRef.current, allowGeneratedRef.current) && newJimuLayerView.type !== JSAPILayerTypes.SubtypeGroupLayer) {
        await safelyCreateLayerDataSourceForJimuLayerViews([newJimuLayerView])
        const newDs = newJimuLayerView.getLayerDataSource()
        const isValidDs = newDs && isSupportedDataSourceType(newDs.type)

        if (isValidDs) {
          if (updateIMDataSourceItemsFromMapRef.current) {
            updateIMDataSourceItemsFromMapRef.current()
          }
        }
      }
    }

    // add JimuLayerViewsVisibleChangedListener
    // If syncWithMap is true, we only list visible JimuLayerViews on Select widget.
    const jimuLayerViewsVisibleChangedListener = async (visibleChangedJimuLayerViews: JimuLayerView[]) => {
      if (!syncWithMapRef.current) {
        return
      }

      const eventJimuQueriableLayerViews = visibleChangedJimuLayerViews.filter(jimuLayerView => isSupportedJimuLayerView(jimuLayerView))

      if (eventJimuQueriableLayerViews.length > 0) {
        const visibleValidJimuQueriableLayerViews = eventJimuQueriableLayerViews.filter(jimuLayerView => isValidJimuQueriableLayerView(jimuLayerView, allowMapBuiltinRef.current, allowGeneratedRef.current))

        if (visibleValidJimuQueriableLayerViews.length > 0) {
          await safelyCreateLayerDataSourceForJimuLayerViews(visibleValidJimuQueriableLayerViews)
        }

        if (updateIMDataSourceItemsFromMapRef.current) {
          updateIMDataSourceItemsFromMapRef.current()
        }
      }
    }

    // add JimuLayerViewRemovedListener

    const jimuLayerViewRemovedListener = (removedJimuLayerView: JimuLayerView) => {
      // don't call isValidJimuQueriableLayerView(removedJimuLayerView) here, because removedJimuLayerView maybe the parent of JimuFeatureLayerView
      if (removedJimuLayerView && removedJimuLayerView.fromRuntime) {
        if (updateIMDataSourceItemsFromMapRef.current) {
          updateIMDataSourceItemsFromMapRef.current()
        }
      }
    }

    if (activeJimuMapView) {
      // console.log(`Select adds event listeners for ${activeJimuMapView.id}`)
      activeJimuMapView.addJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
      activeJimuMapView.addJimuLayerViewsVisibleChangeListener(jimuLayerViewsVisibleChangedListener)
      activeJimuMapView.addJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)
    }

    return () => {
      if (activeJimuMapView) {
        // console.log(`Select removes event listeners for ${activeJimuMapView.id}`)
        activeJimuMapView.removeJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
        activeJimuMapView.removeJimuLayerViewsVisibleChangeListener(jimuLayerViewsVisibleChangedListener)
        activeJimuMapView.removeJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)
      }
    }
    // Don't use preActiveJimuMapView, allowGenerated, allowMapBuiltin and syncWithMap as dependencies, use allowGeneratedRef, allowMapBuiltinRef and syncWithMapRef instead.
  }, [activeJimuMapView]) // Note, this effect should only use activeJimuMapView as the only dependency.

  // update generated layers when remove the generated data source
  // In the above, by listening to the layer-add event and layer-remove event, most cases of generated layers can be correctly handled.
  // In addition to listening to layer-remove event, we also need to listen to ds-remove event. Because if ds is deleted by Add Data, but the layer is not deleted, then the layer still cannot select features.
  React.useEffect(() => {
    if (updateIMDataSourceItemsFromMapRef.current) {
      updateIMDataSourceItemsFromMapRef.current()
    }
  }, [dsCountInAppState])

  // configDataSourceItems for current active jimuMapView
  // If syncWithMap is true, activeConfigDataSourceItems will be empty array.
  const activeConfigDataSourceItems = React.useMemo(() => {
    // resultActiveConfigDataSourceItems should keep the orders of original activeJimuMapViewInfoConfig.dataSourceItems orders and should not sort by layers rendering orders.
    let resultActiveConfigDataSourceItems: Immutable.ImmutableArray<DataSourceItem> = null

    if (activeJimuMapViewInfoConfig && !syncWithMap) {
      const tempConfigDataSourceItems = activeJimuMapViewInfoConfig.dataSourceItems

      if (tempConfigDataSourceItems && tempConfigDataSourceItems.length > 0) {
        resultActiveConfigDataSourceItems = tempConfigDataSourceItems
      }
    }

    if (!resultActiveConfigDataSourceItems) {
      resultActiveConfigDataSourceItems = Immutable([])
    }

    return resultActiveConfigDataSourceItems
  }, [activeJimuMapViewInfoConfig, syncWithMap])

  // imDataSourceItemsFromMap + configDataSourceItems
  const allImDataSourceItems = React.useMemo(() => {
    return imDataSourceItemsFromMap.concat(activeConfigDataSourceItems)
  }, [activeConfigDataSourceItems, imDataSourceItemsFromMap])

  const allImDataSourceItemsRef = React.useRef<Immutable.ImmutableArray<DataSourceItem>>(allImDataSourceItems)
  allImDataSourceItemsRef.current = allImDataSourceItems

  const lengthOfIMDataSourceItemsFromMap = imDataSourceItemsFromMap.length

  const mapDataSourceIdCount = React.useMemo(() => {
    let count = 0

    if (mapWidgetId) {
      const mapWidgetJson = getWidgetJson(mapWidgetId)

      if (mapWidgetJson?.useDataSources?.length > 0) {
        count = mapWidgetJson.useDataSources?.length
      }
    }

    return count
  }, [mapWidgetId])

  // update widgetDisplayMode
  React.useEffect(() => {
    let newDisplayMode: WidgetDisplayMode = null

    if (mapWidgetId) {
      let allViewConfigItemsCount: number = 0

      if (mapInfo) {
        Object.values(mapInfo).forEach((activeJimuMapViewInfoConfig) => {
          if (activeJimuMapViewInfoConfig && !activeJimuMapViewInfoConfig.syncWithMap && activeJimuMapViewInfoConfig.dataSourceItems) {
            const length = activeJimuMapViewInfoConfig.dataSourceItems.length

            if (length > 0) {
              allViewConfigItemsCount += length
            }
          }
        })
      }

      if (lengthOfIMDataSourceItemsFromMap === 0 && allViewConfigItemsCount === 0 && mapDataSourceIdCount === 0) {
        newDisplayMode = WidgetDisplayMode.NoLayersTip
      } else {
        if (activeJimuMapViewId) {
          // map view is loaded
          if (allImDataSourceItems.length > 0) {
            const readyToDisplayRuntimeInfos = getReadyToDisplayRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)

            if (readyToDisplayRuntimeInfos.length > 0) {
              newDisplayMode = WidgetDisplayMode.Normal
            } else {
              newDisplayMode = WidgetDisplayMode.Loading
            }
          } else {
            newDisplayMode = WidgetDisplayMode.NoLayersTip
          }
        } else {
          // map view is loading
          newDisplayMode = WidgetDisplayMode.Loading
        }
      }
    } else {
      // show placeholder if don't set mapWidgetId or the map widget is removed
      newDisplayMode = WidgetDisplayMode.Placeholder
    }

    updateWidgetDisplayMode(newDisplayMode)
  }, [activeJimuMapViewId, allImDataSourceItems, dataSourceItemRuntimeInfoMap, lengthOfIMDataSourceItemsFromMap, mapDataSourceIdCount, mapInfo, mapWidgetId, updateWidgetDisplayMode])

  // Need to check if some activeConfigDataSourceItems are added or some activeConfigDataSourceItems are removed.
  // Need to add new runtimeInfos for config DataSourceItems which doesn't have runtimeInfo.
  React.useEffect(() => {
    // dataSourceItemsWithoutRuntimeInfo are new added data sources
    const dataSourceItemsWithoutRuntimeInfo = activeConfigDataSourceItems.filter(imDataSourceItem => {
      const uid = imDataSourceItem.uid
      const itemRuntimeInfo = dataSourceItemRuntimeInfoMap[uid]
      return !itemRuntimeInfo
    })

    if (dataSourceItemsWithoutRuntimeInfo.length > 0) {
      // add new runtimeInfos for config DataSourceItems which doesn't have runtimeInfo
      const useMap = true
      const supportCustomSQLBuilder = false // configDataSourceItems doesn't support custom sql builder
      const runtimeInfoMapForNewDataSourceItems = getInitialDataSourceItemRuntimeInfoMap(useMap, supportCustomSQLBuilder, dataSourceItemsWithoutRuntimeInfo, dataSourceItemRuntimeInfoMap)
      mixinDataSourceItemRuntimeInfoMap(runtimeInfoMapForNewDataSourceItems)
    }
  }, [activeConfigDataSourceItems, dataSourceItemRuntimeInfoMap, mixinDataSourceItemRuntimeInfoMap])

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

  const onActiveViewChange = React.useCallback((newActiveJimuMapView: JimuMapView) => {
    setActiveJimuMapView(newActiveJimuMapView)
  }, [setActiveJimuMapView])

  const classNames = ['select-use-map-entry']

  if (className) {
    classNames.push(className)
  }

  const strFinalClassName = classNames.join(' ')

  return (
    <div className={strFinalClassName}>
      {
        mapWidgetId &&
        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onActiveViewChange={onActiveViewChange}
        />
      }

      <SelectHeader
        config={config}
        widgetId={widgetId}
        mapWidgetId={mapWidgetId}
        autoControlWidgetId={autoControlWidgetId}
        widgetState={widgetState}
        activeJimuMapView={activeJimuMapView}
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
        jimuMapView={activeJimuMapView}
        enableDataAction={enableDataAction}
        allImDataSourceItems={allImDataSourceItems}
        notConfigDataSourceItems={imDataSourceItemsFromMap}
        configDataSourceItems={activeConfigDataSourceItems}
        dataSourceItemRuntimeInfoMap={dataSourceItemRuntimeInfoMap}
        updateDataSourceItemRuntimeInfoForUid={updateDataSourceItemRuntimeInfoForUid}
      />
    </div>
  )
}

function getValidJimuQueriableLayerViewsFromMap (jimuMapView: JimuMapView, allowMapBuiltin: boolean, allowGenerated: boolean): JimuLayerView[] {
  const jimuLayerViews: JimuLayerView[] = []

  if (jimuMapView) {
    Object.values(jimuMapView.jimuLayerViews).forEach(jimuLayerView => {
      if (jimuLayerView && isValidJimuQueriableLayerView(jimuLayerView, allowMapBuiltin, allowGenerated)) {
        jimuLayerViews.push(jimuLayerView)
      }
    })
  }

  return jimuLayerViews
}

/**
 * The following conditions are met at the same time to return true
 * 1. jimuLayerView is not empty
 * 2. isSupportedJimuLayerView(jimuLayerView) returns true
 * 3. layer still in map, that is isJimuLayerViewInMap(jimuLayerView) returns true
 * 4. layer is visible
 * 5. jimuLayerView.fromRuntime satisfies allowMapBuiltin and allowGenerated
 * @param jimuLayerView
 * @param allowMapBuiltin
 * @param allowGenerated
 * @returns
 */
function isValidJimuQueriableLayerView (jimuLayerView: JimuLayerView, allowMapBuiltin: boolean, allowGenerated: boolean): boolean {
  if (jimuLayerView && isSupportedJimuLayerView(jimuLayerView) && isJimuLayerViewInMap(jimuLayerView) && jimuLayerView.isLayerVisible()) {
    if (jimuLayerView.fromRuntime) {
      return allowGenerated
    } else {
      return allowMapBuiltin
    }
  }

  return false
}

function isJimuLayerViewInMap (jimuLayerView: JimuLayerView): boolean {
  if (jimuLayerView) {
    const jimuMapView = jimuLayerView.getJimuMapView()
    const layers = jimuMapView?.view?.map?.layers?.toArray() || []

    const rootJimuLayerView = getRootJimuLayerView(jimuLayerView)
    const rootLayer = rootJimuLayerView?.layer

    if (layers?.length > 0 && rootLayer) {
      return layers.includes(rootLayer)
    }
  }

  return false
}

function getRootJimuLayerView (jimuLayerView: JimuLayerView): JimuLayerView {
  let rootJimuLayerView: JimuLayerView = null

  if (jimuLayerView) {
    const jimuMapView = jimuLayerView.getJimuMapView()

    if (jimuMapView) {
      const parentJimuLayerViews = jimuMapView.getParentJimuLayerViews(jimuLayerView.id)

      if (parentJimuLayerViews.length > 0) {
        // the last one is the root JimuLayerView
        rootJimuLayerView = parentJimuLayerViews[parentJimuLayerViews.length - 1]
      } else {
        // no parents, use self as root JimuLayerView
        rootJimuLayerView = jimuLayerView
      }
    }
  }

  return rootJimuLayerView
}

function safelyCreateLayerDataSourceForJimuLayerViews (jimuLayerViews: JimuLayerView[]) {
  const promises = jimuLayerViews.map(jimuLayerView => {
    const layerDs = jimuLayerView.getLayerDataSource()

    if (layerDs) {
      return Promise.resolve(layerDs)
    } else {
      const promise = jimuLayerView.createLayerDataSource()
      return getNeverRejectPromise(promise)
    }
  })

  return Promise.all(promises)
}
