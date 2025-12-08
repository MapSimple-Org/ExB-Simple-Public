/** @jsx jsx */
import { React, hooks, jsx, Immutable, type ImmutableArray, uuidv1, type UseDataSource, utils as jimuCoreUtils, JSAPILayerTypes } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import {
  MapViewManager, type JimuMapView, JimuMapViewComponent, type JimuLayerView , type JimuFeatureLayerView, type JimuSceneLayerView, type JimuBuildingComponentSublayerView,
  type JimuImageryLayerView, type JimuOrientedImageryLayerView, type JimuSubtypeGroupLayerView, type JimuSubtypeSublayerView
} from 'jimu-arcgis'
import type { TreeItemsType } from 'jimu-ui/basic/list-tree'
import { MapWidgetSelector, SettingRow, LayerSetting } from 'jimu-ui/advanced/setting-components'
import selectByAttributeIconSrc from 'jimu-icons/svg/outlined/application/attribute.svg'
import Placeholder from './placeholder'
import { type RootSettingProps, getUseDataSourcesByConfig, getRuntimeAppConfig } from '../utils'
import { isSupportedJimuLayerView, isExpressMode, getFinalAllowGeneratedForMap, sortDataSourceItemsByLayersOrder, getFinalEnableAttributeSelectionForMap } from '../../utils'
import { getDefaultIMMapInfo, type IMJimuMapViewConfigInfo, getDefaultIMJimuMapViewConfigInfo, type DataSourceItem, type IMDataSourceItem } from '../../config'
import LayerItemDetail from './layer-item-detail'
import TitleWithSwitch from './title-with-switch'

export type SelectableJimuLayerView = JimuFeatureLayerView | JimuSceneLayerView | JimuBuildingComponentSublayerView | JimuImageryLayerView | JimuOrientedImageryLayerView | JimuSubtypeGroupLayerView | JimuSubtypeSublayerView


interface MapSourceSectionProps {
  rootSettingProps: RootSettingProps
  showPlaceholder: boolean
}

interface ClickedJimuLayerViewInfo {
  jimuLayerViewId: string
  jimuMapViewId: string
  jimuMapView: JimuMapView
}

/**
 * Configure map and layers when source radio 'Interact with a Map widget' is checked.
 * If sync with map, 'Allow selection of data generated at runtime' must be enabled and 'Attribute selection' must be disabled. User can't turn on/off these two options.
 * If customize layers, 'Allow selection of data generated at runtime' is enabled by default and 'Attribute selection' is disabled by default. User can turn on/off these two options.
 */
function MapSourceSection (props: MapSourceSectionProps) {
  // ----------------------------------------handle MapInfo - start----------------------------------------
  const {
    rootSettingProps
  } = props

  const {
    id: widgetId,
    config,
    useMapWidgetIds,
    onSettingChange
  } = rootSettingProps

  const mapInfo = config.mapInfo || getDefaultIMMapInfo()

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const currMapWidgetId = (useMapWidgetIds && useMapWidgetIds.length > 0) ? useMapWidgetIds[0] : ''

  const [jimuMapViews, setJimuMapViews] = React.useState<JimuMapView[]>([])

  const onMapWidgetSelect = React.useCallback((newMapWidgetIds: string[]) => {
    if (!newMapWidgetIds) {
      newMapWidgetIds = []
    }

    const newConfig = config.set('mapInfo', {})
    const useDataSources = getUseDataSourcesByConfig(newConfig)

    onSettingChange({
      id: widgetId,
      config: newConfig,
      useMapWidgetIds: newMapWidgetIds,
      useDataSources
    })
  }, [config, onSettingChange, widgetId])

  React.useEffect(() => {
    setJimuMapViews((currJimuMapViews) => {
      const newJimuMapViews = currJimuMapViews.filter(jimuMapView => jimuMapView.mapWidgetId === currMapWidgetId)
      return newJimuMapViews
    })
  }, [currMapWidgetId, setJimuMapViews])

  const onJimuViewsCreate = React.useCallback((viewsObj: { [jimuMapViewIds: string]: JimuMapView }) => {
    const allJimuMapViews = Object.values(viewsObj)
    // Need to filter out default webmap
    const newJimuMapViews = allJimuMapViews.filter(jimuMapView => {
      return jimuMapView.dataSourceId && jimuMapView.mapWidgetId === currMapWidgetId
    })
    setJimuMapViews(newJimuMapViews)
  }, [currMapWidgetId, setJimuMapViews])

  const onJimuMapViewConfigInfoChange = React.useCallback((jimuMapViewId: string, jimuMapViewConfigInfo: IMJimuMapViewConfigInfo) => {
    // jimuMapViewId maybe empty, so we need to check it here
    if (!jimuMapViewId) {
      return
    }

    const newMapInfo = mapInfo.set(jimuMapViewId, jimuMapViewConfigInfo)
    const newConfig = config.set('mapInfo', newMapInfo)
    const useDataSources = getUseDataSourcesByConfig(newConfig)

    onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources
    })
  }, [config, mapInfo, onSettingChange, widgetId])

  const updateIMDataSourceItemsConfig = React.useCallback((jimuMapViewId: string, jimuMapViewConfigInfo: IMJimuMapViewConfigInfo, imNewDataSourceItems: ImmutableArray<DataSourceItem>) => {
    if (jimuMapViewId && jimuMapViewConfigInfo) {
      const newJimuMapViewConfigInfo = jimuMapViewConfigInfo.set('dataSourceItems', imNewDataSourceItems)
      onJimuMapViewConfigInfoChange(jimuMapViewId, newJimuMapViewConfigInfo)
    }
  }, [onJimuMapViewConfigInfoChange])

  const getRawJimuMapViewConfigInfoByJimuMapViewId = React.useCallback((jimuMapViewId: string): IMJimuMapViewConfigInfo => {
    const result: IMJimuMapViewConfigInfo = (mapInfo && jimuMapViewId && mapInfo[jimuMapViewId]) || null
    return result
  }, [mapInfo])

  const allValidJimuMapViewIds: string[] = getAllValidJimuMapViewIdsByMapWidget(currMapWidgetId)

  // calculate configJimuMapViewIds
  const configJimuMapViewIds: string[] = Object.keys(mapInfo) || []

  // invalidConfigJimuMapViewIds are the invalid jimuMapViewIds in config, they are not in the map widget any more
  const invalidConfigJimuMapViewIds = configJimuMapViewIds.filter(configJimuMapViewId => !allValidJimuMapViewIds.includes(configJimuMapViewId))

  // If invalidConfigJimuMapViewIds is not empty, we will update config to remove invalidConfigJimuMapViewIds from config in the below useEffect.
  React.useEffect(() => {
    if (invalidConfigJimuMapViewIds.length > 0) {
      const newMapInfo = mapInfo.without(...invalidConfigJimuMapViewIds)
      const newConfig = config.set('mapInfo', newMapInfo)
      const useDataSources = getUseDataSourcesByConfig(newConfig)

      onSettingChange({
        id: widgetId,
        config: newConfig,
        useDataSources
      })
    }
  }, [config, mapInfo, invalidConfigJimuMapViewIds, onSettingChange, widgetId])

  const isAllConfigJimuMapViewIdsValid = invalidConfigJimuMapViewIds.length === 0
  const shouldShowPlaceholder = !currMapWidgetId && !isExpressMode()
  const selectMapHintDomId = React.useId()

  // clickedJimuMapViewId is the clicked JimuMapViewId which triggered by LayerSetting.props.onMapItemClick().
  const [clickedJimuMapViewId, setClickedJimuMapViewId] = React.useState<string>(null)

  // clickedJimuLayerViewInfo is the clicked jimuLayerView info which triggered by onLayerItemClick
  // note, clickedJimuLayerViewInfo.jimuMapViewId maybe different with clickedJimuMapViewId
  // e.g. clickedJimuMapViewId is jimuMapViewId1, clickedJimuLayerViewInfo.jimuMapViewId is jimuMapViewId2
  const [clickedJimuLayerViewInfo, setClickedJimuLayerViewInfo] = React.useState<ClickedJimuLayerViewInfo>(null)

  // -----------------------------handle single JimuMapViewConfigInfo-----------------------------
  // This part uses clickedJimuMapViewId and doesn't use clickedJimuLayerViewInfo.
  // only clickedJimuMapViewId and allSelectableJimuLayerViewsObj are root state, all other variables are calculated by clickedJimuMapViewId, allSelectableJimuLayerViewsObj and config
  const [allSelectableJimuLayerViewsObj, setAllSelectableJimuLayerViewsObj] = React.useState<{ [jimuMapViewId: string]: SelectableJimuLayerView[] }>({}) // { jimuMapViewId: SelectableJimuLayerView[] }
  const allSelectableJimuLayerViewsObjRef = React.useRef<{ [jimuMapViewId: string]: SelectableJimuLayerView[] }>(null)
  allSelectableJimuLayerViewsObjRef.current = allSelectableJimuLayerViewsObj

  // If isLayersAndDataSourcesLoadedForClickedMap is true, it means all JimuLayerViews loaded and all related data sources of the JimuLayerViews are created for the clicked map.
  const isLayersAndDataSourcesLoadedForClickedMap = React.useMemo(() => {
    let result: boolean = false

    if (clickedJimuMapViewId && allSelectableJimuLayerViewsObj[clickedJimuMapViewId]) {
      result = true
    }

    return result
  }, [allSelectableJimuLayerViewsObj, clickedJimuMapViewId])

  const jimuMapViewForClickedMap = React.useMemo(() => {
    let result: JimuMapView = null

    if (clickedJimuMapViewId && jimuMapViews?.length > 0) {
      result = jimuMapViews.find(item => item.id === clickedJimuMapViewId)
    }

    return result
  }, [clickedJimuMapViewId, jimuMapViews])

  // make sure jimuMapViewConfigInfoForClickedMap is not empty
  const jimuMapViewConfigInfoForClickedMap: IMJimuMapViewConfigInfo = React.useMemo(() => {
    const result: IMJimuMapViewConfigInfo = (mapInfo && clickedJimuMapViewId && mapInfo[clickedJimuMapViewId]) || getDefaultIMJimuMapViewConfigInfo()
    return result
  }, [clickedJimuMapViewId, mapInfo])

  const syncWithMapForClickedMap = !!(jimuMapViewConfigInfoForClickedMap.syncWithMap)
  const customizeLayersForClickedMap = !syncWithMapForClickedMap
  const allowGeneratedForClickedMap = !!(jimuMapViewConfigInfoForClickedMap.allowGenerated)
  const enableAttributeSelectionForClickedMap = !!(jimuMapViewConfigInfoForClickedMap.enableAttributeSelection)
  const rawDataSourceItemsForClickedMap = jimuMapViewConfigInfoForClickedMap.dataSourceItems

  // If rawDataSourceItemsForClickedMap is undefined, means it likes first opened.
  const isRawDataSourceItemsUndefinedForClickedMap = !rawDataSourceItemsForClickedMap
  const isRawDataSourceItemsUndefinedRefForClickedMap = React.useRef<boolean>(isRawDataSourceItemsUndefinedForClickedMap)
  isRawDataSourceItemsUndefinedRefForClickedMap.current = isRawDataSourceItemsUndefinedForClickedMap

  // rawDataSourceItemsForClickedMap maybe undefined, so need to wrap it with imDataSourceItems, the following code should use imDataSourceItems instead of rawDataSourceItems
  const imDataSourceItemsForClickedMap = React.useMemo(() => {
    return Immutable(rawDataSourceItemsForClickedMap || []) as Immutable.ImmutableArray<DataSourceItem>
  }, [rawDataSourceItemsForClickedMap])

  // allSelectableJimuLayerViews means the built-in JimuLayerViews that have data source
  const allSelectableJimuLayerViewsForClickedMap = React.useMemo(() => {
    let result: SelectableJimuLayerView[] = null

    if (clickedJimuMapViewId && allSelectableJimuLayerViewsObj) {
      result = allSelectableJimuLayerViewsObj[clickedJimuMapViewId]
    }

    if (!result) {
      result = []
    }

    return result
  }, [allSelectableJimuLayerViewsObj, clickedJimuMapViewId])

  // all JimuLayerViews that can show in JimuLayerViewSelector, include FeatureJimuLayerView/SceneJimuLayerView and their ancestor JimuLayerViews
  const allAvailableJimuLayerViewIdsObjForClickedMapJimuLayerViewSelector = React.useMemo(() => {
    const jimuLayerViewIdsObj: { [jimuLayerViewId: string]: boolean } = {}

    allSelectableJimuLayerViewsForClickedMap.forEach(leafJimuLayerView => {
      jimuLayerViewIdsObj[leafJimuLayerView.id] = true
      const ancestorJimuLayerViews = leafJimuLayerView.getAllAncestorJimuLayerViews()
      ancestorJimuLayerViews.forEach(ancestorJimuLayerView => {
        jimuLayerViewIdsObj[ancestorJimuLayerView.id] = true
      })
    })

    return jimuLayerViewIdsObj
  }, [allSelectableJimuLayerViewsForClickedMap])

  // update data source items to config for clicked map
  const updateIMDataSourceItemsConfigForClickedMap = React.useCallback((imNewDataSourceItems: ImmutableArray<DataSourceItem>) => {
    // clickedJimuMapViewId maybe empty, so we need to check it here
    if (clickedJimuMapViewId && jimuMapViewConfigInfoForClickedMap) {
      updateIMDataSourceItemsConfig(clickedJimuMapViewId, jimuMapViewConfigInfoForClickedMap, imNewDataSourceItems)
    }
  }, [clickedJimuMapViewId, jimuMapViewConfigInfoForClickedMap, updateIMDataSourceItemsConfig])

  // LayerSetting.isShowRuntimeAddedLayerEnabled
  const layerSettingIsShowRuntimeAddedLayerEnabled = React.useMemo(() => {
    const result = getFinalAllowGeneratedForMap(syncWithMapForClickedMap, allowGeneratedForClickedMap)
    return result
  }, [allowGeneratedForClickedMap, syncWithMapForClickedMap])

  // LayerSetting.selectedValues
  const layerSettingSelectedValues = React.useMemo(() => {
    const result: { [jimuMapViewId: string]: ImmutableArray<string> } = {} // { jimuMapViewId: ImmutableArray<jimuLayerViewId> }

    if (mapInfo) {
      const jimuMapViewIds = Object.keys(mapInfo)

      if (jimuMapViewIds.length > 0) {
        jimuMapViewIds.forEach(jimuMapViewId => {
          const jimuMapViewConfigInfo = mapInfo[jimuMapViewId]
          const imDataSourceItems = jimuMapViewConfigInfo?.dataSourceItems
          const configuredJimuLayerViewIds: string[] = []

          if (imDataSourceItems?.length > 0) {
            imDataSourceItems.forEach(dataSourceItem => {
              configuredJimuLayerViewIds.push(dataSourceItem.jimuLayerViewId)
            })
          }

          result[jimuMapViewId] = Immutable(configuredJimuLayerViewIds)
        })
      }
    }

    if (clickedJimuMapViewId && !result[clickedJimuMapViewId]) {
      result[clickedJimuMapViewId] = Immutable([])
    }

    return result
  }, [clickedJimuMapViewId, mapInfo])

  // LayerSetting.onToggleCustomize
  const onCustomizeMapSwitchChangeForClickedMap = React.useCallback((checked: boolean) => {
    // In this callback, isLayersAndDataSourcesLoaded is always true because we show loading for the popper if isLayersAndDataSourcesLoaded is false.

    // clickedJimuMapViewId maybe empty, so we need to check it here
    if (!clickedJimuMapViewId) {
      return
    }

    const newSyncWithMap = !checked
    let newJimuMapViewConfigInfo = jimuMapViewConfigInfoForClickedMap.set('syncWithMap', newSyncWithMap)

    if (newSyncWithMap) {
      // If sync with map,
      // allowGenerated should be set to true
      // enableAttributeSelection should be set to false
      // dataSourceItems should be set to undefined (not empty array)
      newJimuMapViewConfigInfo = newJimuMapViewConfigInfo
        .set('allowGenerated', true)
        .set('enableAttributeSelection', false)
        .set('dataSourceItems', undefined) // set to undefined (not empty array) because we want to select all visible JimuQueriableLayerView again when syncWithMap is set to false
    } else {
      // switch to customize layers (syncWithMap is changed to false)

      let finalDataSourceItems: ImmutableArray<DataSourceItem> = null

      // When user first connects to the JimuMapView, we need to save all visible JimuQueriableLayerView into config by default.
      if (jimuMapViewForClickedMap && isLayersAndDataSourcesLoadedForClickedMap && isRawDataSourceItemsUndefinedRefForClickedMap.current) {
        const initialConfigJimuLayerViews = allSelectableJimuLayerViewsForClickedMap.filter(jimuLayerView => {
          // only select visible layers by default
          if (!jimuLayerView.isLayerVisible()) {
            return false
          }

          const ds = jimuLayerView.getLayerDataSource()

          if (!ds) {
            // If ds is empty, getDataSourceItemByJimuLayerView will throw error.
            return false
          }

          if (jimuLayerView.type === JSAPILayerTypes.SubtypeGroupLayer) {
            const subtypeGroupLayerView = jimuLayerView as JimuSubtypeGroupLayerView

            // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive. By default, we include all SubtypeSublayers and exclude all SubtypeGrouplayers as the initial config.
            if (subtypeGroupLayerView.layer?.sublayers?.length > 0) {
              return false
            }
          }

          return true
        })

        const newDataSourceItems: DataSourceItem[] = initialConfigJimuLayerViews.map(jimuLayerView => getDataSourceItemByJimuLayerView(jimuLayerView))
        // sort the data source items by map layers order
        const sortedNewDataSourceItems = sortDataSourceItemsByLayersOrder(jimuMapViewForClickedMap, newDataSourceItems)
        finalDataSourceItems = Immutable(sortedNewDataSourceItems)
      }

      if (!finalDataSourceItems) {
        finalDataSourceItems = Immutable([])
      }

      newJimuMapViewConfigInfo = newJimuMapViewConfigInfo.set('dataSourceItems', finalDataSourceItems)
    }

    onJimuMapViewConfigInfoChange(clickedJimuMapViewId, newJimuMapViewConfigInfo)
  }, [allSelectableJimuLayerViewsForClickedMap, isLayersAndDataSourcesLoadedForClickedMap, jimuMapViewForClickedMap, jimuMapViewConfigInfoForClickedMap, clickedJimuMapViewId, onJimuMapViewConfigInfoChange])

  // LayerSetting.onShowRuntimeAddedLayersChange
  const onAllowGeneratedLayersSwitchChangeForClickedMap = React.useCallback((checked: boolean) => {
    // clickedJimuMapViewId maybe empty, so we need to check it here
    if (!clickedJimuMapViewId) {
      return
    }

    const newJimuMapViewConfigInfo = jimuMapViewConfigInfoForClickedMap.set('allowGenerated', checked)
    onJimuMapViewConfigInfoChange(clickedJimuMapViewId, newJimuMapViewConfigInfo)
  }, [jimuMapViewConfigInfoForClickedMap, clickedJimuMapViewId, onJimuMapViewConfigInfoChange])

  // Attribute selection switch turn on/off
  const onGlobalAttributeSelectionSwitchChange = React.useCallback((evt, checked: boolean) => {
    // clickedJimuMapViewId maybe empty, so we need to check it here
    if (!clickedJimuMapViewId) {
      return
    }

    let newJimuMapViewConfigInfo = jimuMapViewConfigInfoForClickedMap.set('enableAttributeSelection', checked)

    if (!checked) {
      // need to remove all sqlExpressions if the global attribute selection is disabled
      const newDataSourceItems = imDataSourceItemsForClickedMap.map(dataSourceItem => {
        const newDataSourceItem = dataSourceItem.set('sqlExpression', null)
        return newDataSourceItem
      })
      newJimuMapViewConfigInfo = newJimuMapViewConfigInfo.set('dataSourceItems', newDataSourceItems)
    }

    onJimuMapViewConfigInfoChange(clickedJimuMapViewId, newJimuMapViewConfigInfo)
  }, [imDataSourceItemsForClickedMap, jimuMapViewConfigInfoForClickedMap, clickedJimuMapViewId, onJimuMapViewConfigInfoChange])

  // LayerSetting.hideLayers
  // Hide the JimuLayerViews that not in allAvailableJimuLayerViewIdsObjForJimuLayerViewSelector.
  const jimuLayerViewSelectorHideLayersForClickedMap = React.useCallback((jimuLayerView: JimuLayerView): boolean => {
    const jimuLayerViewId = jimuLayerView.id
    return !allAvailableJimuLayerViewIdsObjForClickedMapJimuLayerViewSelector[jimuLayerViewId]
  }, [allAvailableJimuLayerViewIdsObjForClickedMapJimuLayerViewSelector])

  // LayerSetting.disableLayers
  // If JimuLayerView is not in allSelectableJimuLayerViews, disable selecting in JimuLayerViewSelector.
  const jimuLayerViewSelectorDisableLayersForClickedMap = React.useCallback((jimuLayerView: JimuLayerView): boolean => {
    return !allSelectableJimuLayerViewsForClickedMap.includes(jimuLayerView as SelectableJimuLayerView)
  }, [allSelectableJimuLayerViewsForClickedMap])

  /**
   * JimuLayerViewSelector change
   * @param newSelectedJimuLayerViewIds newSelectedJimuLayerViewIds is the new all selected JimuLayerViewIds, not the diff changed JimuLayerViewIds
   */
  const onJimuLayerViewSelectorChangeForClickedMap = React.useCallback((newSelectedJimuLayerViewIds: string[]) => {
    if (!jimuMapViewForClickedMap) {
      // jimuMapViewForClickedMap is used in this method, so need to check it
      return
    }

    if (!isLayersAndDataSourcesLoadedForClickedMap) {
      // allSelectableJimuLayerViews is used in this method, so need to make sure isLayersAndDataSourcesLoadedForClickedMap is true
      return
    }

    newSelectedJimuLayerViewIds = Array.from(new Set(newSelectedJimuLayerViewIds))

    // ----handle SubtypeGrouplayer and SubtypeSublayer start----
    // SubtypeGrouplayer and SubtypeSublayer are mutually exclusive.
    let needExcludeJimuLayerViewIds: string[] = []

    const oldConfigJimuLayerViewIds = imDataSourceItemsForClickedMap.map(imDataSourceItem => imDataSourceItem.jimuLayerViewId).asMutable()
    const { added: addedJimuLayerViewIds } = jimuCoreUtils.diffArrays(true, oldConfigJimuLayerViewIds, newSelectedJimuLayerViewIds)
    addedJimuLayerViewIds.forEach(addedJimuLayerViewId => {
      if (addedJimuLayerViewId) {
        const jimuLayerView = jimuMapViewForClickedMap.jimuLayerViews?.[addedJimuLayerViewId]

        if (jimuLayerView) {
          if (jimuLayerView.type === JSAPILayerTypes.SubtypeGroupLayer) {
            // exclude all the child SubtypeSublayer ids
            const childJimuLayerViewIds = jimuMapViewForClickedMap.getChildJimuLayerViewIds(jimuLayerView.id)
            needExcludeJimuLayerViewIds.push(...childJimuLayerViewIds)
          } else if (jimuLayerView.type === JSAPILayerTypes.SubtypeSublayer) {
            // exclude the parent SubtypeGroupLayer id
            if (jimuLayerView.parentJimuLayerViewId) {
              needExcludeJimuLayerViewIds.push(jimuLayerView.parentJimuLayerViewId)
            }
          }
        }
      }
    })
    // needExcludeJimuLayerViewIds maybe have duplicate ids
    needExcludeJimuLayerViewIds = Array.from(new Set(needExcludeJimuLayerViewIds))
    // remove needExcludeJimuLayerViewIds from newSelectedJimuLayerViewIds
    newSelectedJimuLayerViewIds = newSelectedJimuLayerViewIds.filter(jimuLayerViewId => !needExcludeJimuLayerViewIds.includes(jimuLayerViewId))
    newSelectedJimuLayerViewIds = Array.from(new Set(newSelectedJimuLayerViewIds))
    // ----handle SubtypeGrouplayer and SubtypeSublayer end----

    const allSelectableJimuLayerViewIds = allSelectableJimuLayerViewsForClickedMap.map(jimuLayerView => jimuLayerView.id)
    // make sure put newSelectedJimuLayerViewIds before allSelectableJimuLayerViewIds in jimuCoreUtils.diffArrays(true, a, b) because intersectionJimuLayerViewIds uses the orders of a
    let { saved: intersectionJimuLayerViewIds } = jimuCoreUtils.diffArrays(true, newSelectedJimuLayerViewIds, allSelectableJimuLayerViewIds )
    intersectionJimuLayerViewIds = Array.from(new Set(intersectionJimuLayerViewIds))

    const dataSourceItemsObj: { [key: string]: DataSourceItem } = {}

    imDataSourceItemsForClickedMap.forEach(imDataSourceItem => {
      const jimuLayerViewId = imDataSourceItem.jimuLayerViewId
      dataSourceItemsObj[jimuLayerViewId] = imDataSourceItem.asMutable() as unknown as DataSourceItem
    })

    const newDataSourceItems: DataSourceItem[] = []

    intersectionJimuLayerViewIds.forEach(jimuLayerViewId => {
      let dataSourceItem = dataSourceItemsObj[jimuLayerViewId]

      if (!dataSourceItem) {
        // the jimuLayerViewId is newly selected
        if (jimuMapViewForClickedMap) {
          const jimuLayerView = jimuMapViewForClickedMap.jimuLayerViews[jimuLayerViewId]

          if (jimuLayerView) {
            dataSourceItem = getDataSourceItemByJimuLayerView(jimuLayerView)
          }
        }
      }

      if (dataSourceItem) {
        newDataSourceItems.push(dataSourceItem)
      }
    })

    // don't sort orders
    const imNewDataSourceItems = Immutable(newDataSourceItems)
    updateIMDataSourceItemsConfigForClickedMap(imNewDataSourceItems)
  }, [allSelectableJimuLayerViewsForClickedMap, imDataSourceItemsForClickedMap, isLayersAndDataSourcesLoadedForClickedMap, jimuMapViewForClickedMap, updateIMDataSourceItemsConfigForClickedMap])

  // click webmap/webscene row to change current selected webmap/webscene
  const onMapItemClick = React.useCallback((mapDsId: string) => {
    const newJimuMapViewId = `${currMapWidgetId}-${mapDsId}`
    setClickedJimuMapViewId(newJimuMapViewId)
  }, [currMapWidgetId])

  // If current selected webmap/webscene changed, we need to update allSelectableJimuLayerViewsObj[jimuMapViewId] if allSelectableJimuLayerViewsObj[jimuMapViewId] is empty
  React.useEffect(() => {
    if (!jimuMapViewForClickedMap) {
      return
    }

    const thisJimuMapViewId = jimuMapViewForClickedMap.id

    if (allSelectableJimuLayerViewsObjRef.current?.[thisJimuMapViewId]) {
      // allSelectableJimuLayerViewsObj[jimuMapViewId] is not empty, just return
      return
    }

    async function getJimuLayerViews () {
      const allJimuLayerViewsObj = await jimuMapViewForClickedMap.whenAllJimuLayerViewLoaded()
      const allJimuLayerViews: JimuLayerView[] = Object.values(allJimuLayerViewsObj)
      const allJimuQueriableLayerViews: SelectableJimuLayerView[] = allJimuLayerViews.filter(jimuLayerView => {
        return (!jimuLayerView.fromRuntime) && isSupportedJimuLayerView(jimuLayerView)
      }) as SelectableJimuLayerView[]

      // only filter the JimuLayerView that has data source
      const promises = allJimuQueriableLayerViews.map(jimuLayerView => jimuLayerView.createLayerDataSource())

      try {
        await Promise.all(promises)
      } catch (e) {
        // some SceneLayer can't create data source, it is as expected, just log it
        console.log(e)
      }

      // If the Map widget has two web maps, there will be two MapLayersSetting instances.
      // In Builder, both JimuLayerViews and data sources are created by default, then the above async code logic just take little time (about 20ms).
      // So the two MapLayersSetting instances run here almost at the same time, and they call updateAndSortDataSourceItemsConfigRef.current(dataSourceItems) at the same time,
      // and they call onDataSourceItemsChange almost at the same time.
      // By test, MapLayersSetting1 calls onDataSourceItemsChange at time1, and MapLayersSetting2 calls onDataSourceItemsChange at (time1 + 3ms).
      // Calling onDataSourceItemsChange will update the config.
      // Here is the expected workflow:
      // MapLayersSetting1 (webmap1) calls onDataSourceItemsChange: config -> config1, config1.mapInfo only includes layer items of webmap1
      // MapLayersSetting2 (webmap2) calls onDataSourceItemsChange: config1 -> config2, config2 merge config1, config2.mapInfo includes layer items of both webmap1 and webmap2

      // Here is the real workflow:
      // MapLayersSetting1 (webmap1) calls onDataSourceItemsChange: config -> config1, config1.mapInfo only includes layer items of webmap1
      // MapLayersSetting2 (webmap2) calls onDataSourceItemsChange: config -> config2, config2 replace config1, config2.mapInfo only includes layer items of webmap2

      // To solve the above issue, we need to increase the time interval between MapLayersSetting2.onDataSourceItemsChange and MapLayersSetting1.onDataSourceItemsChange.
      if (!jimuMapViewForClickedMap.isActive) {
        // By test, the duration of MapLayersSetting2.onDataSourceItemsChange and MapLayersSetting1.onDataSourceItemsChange is about 3ms, we use 500ms for safety.
        await waitTime(500)
      }

      const resultAllSelectableJimuLayerViews: SelectableJimuLayerView[] = allJimuQueriableLayerViews.filter(jimuLayerView => !!jimuLayerView.getLayerDataSource())

      if (allSelectableJimuLayerViewsObjRef.current?.[thisJimuMapViewId]) {
        // allSelectableJimuLayerViewsObj[jimuMapViewId] is not empty, just return
        return
      }

      setAllSelectableJimuLayerViewsObj((latestAllDataSourcesCreatedStatusObj) => {
        const newAllDataSourcesCreatedStatusObj = {...latestAllDataSourcesCreatedStatusObj}
        newAllDataSourcesCreatedStatusObj[thisJimuMapViewId] = resultAllSelectableJimuLayerViews
        return newAllDataSourcesCreatedStatusObj
      })
    }

    getJimuLayerViews()
  }, [jimuMapViewForClickedMap]) // make sure jimuMapView is the only dependency

  // -----------------------------handle customized layer list of single JimuMapViewConfigInfo-----------------------------
  // This part uses clickedJimuLayerViewInfo and doesn't use clickedJimuMapViewId.

  const dataSourceItemForClickedLayer = React.useMemo((): DataSourceItem => {
    let result: DataSourceItem = null

    if (clickedJimuLayerViewInfo) {
      const jimuLayerViewId = clickedJimuLayerViewInfo.jimuLayerViewId
      const jimuMapViewId = clickedJimuLayerViewInfo.jimuMapViewId
      const rawJimuMapViewConfigInfo = getRawJimuMapViewConfigInfoByJimuMapViewId(jimuMapViewId)
      result = (rawJimuMapViewConfigInfo?.dataSourceItems?.find(item => item.jimuLayerViewId === jimuLayerViewId)) || null
    }

    return result
  }, [clickedJimuLayerViewInfo, getRawJimuMapViewConfigInfoByJimuMapViewId])

  const isLayerListItemClickable = React.useCallback((jimuLayerViewId: string, jimuMapViewId: string): boolean => {
    if (jimuLayerViewId && jimuMapViewId) {
      const rawJimuMapViewConfigInfo = getRawJimuMapViewConfigInfoByJimuMapViewId(jimuMapViewId)
      const enableAttributeSelection = !!(rawJimuMapViewConfigInfo?.enableAttributeSelection)
      return enableAttributeSelection
    }

    return false
  }, [getRawJimuMapViewConfigInfoByJimuMapViewId])

  const isLayerListItemDisabled = React.useCallback((jimuLayerViewId: string, jimuMapViewId: string) => {
    const clickable = isLayerListItemClickable(jimuLayerViewId, jimuMapViewId)
    return !clickable
  }, [isLayerListItemClickable])

  // show attribute icon if configured sql filter for the layer
  const getLayerCustomIcon = React.useCallback((jimuLayerViewId: string, jimuMapViewId: string) => {
    if (jimuLayerViewId && jimuMapViewId) {
      const rawJimuMapViewConfigInfo = getRawJimuMapViewConfigInfoByJimuMapViewId(jimuMapViewId)
      const imDataSourceItem = jimuLayerViewId && rawJimuMapViewConfigInfo?.dataSourceItems?.find(item => item.jimuLayerViewId === jimuLayerViewId)
      const hasSql = imDataSourceItem?.sqlExpression?.parts?.length > 0
      return hasSql ? selectByAttributeIconSrc : null
    }
  }, [getRawJimuMapViewConfigInfoByJimuMapViewId])

  const onLayerItemClick = React.useCallback((jimuLayerViewId: string, jimuMapViewId: string) => {
    // LayerItemDetail component is used to configure sqlExpression and sqlHint,
    // so it is only available when the global enableAttributeSelection is true.
    let newClickedJimuLayerViewInfo: ClickedJimuLayerViewInfo = null

    if (jimuLayerViewId && jimuMapViewId && isLayerListItemClickable(jimuLayerViewId, jimuMapViewId)) {
      const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapViewId)

      if (jimuMapView) {
        newClickedJimuLayerViewInfo = {
          jimuLayerViewId: jimuLayerViewId,
          jimuMapViewId,
          jimuMapView
        }
      } else {
        console.error('can not get JimuMapView in onLayerItemClick prop of LayerSetting')
      }
    }

    setClickedJimuLayerViewInfo(newClickedJimuLayerViewInfo)
  }, [isLayerListItemClickable])

  // drag list item to change its order
  const onLayerReorder = React.useCallback((jimuMapViewId: string, newListItemJsons: TreeItemsType) => {
    if (jimuMapViewId && newListItemJsons?.length > 0) {
      const rawJimuMapViewConfigInfo = getRawJimuMapViewConfigInfoByJimuMapViewId(jimuMapViewId)

      // rawJimuMapViewConfigInfo should not be empty
      if (rawJimuMapViewConfigInfo) {
        const rawImDataSourceItems = rawJimuMapViewConfigInfo?.dataSourceItems
        const itemsObj: { [itemId: string]: IMDataSourceItem } = {}
        const oldItemKeys: string[] = []

        if (rawImDataSourceItems?.length > 0) {
          rawImDataSourceItems.forEach(item => {
            const itemId = item?.jimuLayerViewId

            if (itemId) {
              itemsObj[itemId] = item
              oldItemKeys.push(itemId)
            }
          })
        }

        const oldItemKeysJoin = oldItemKeys.join(',')

        const newItemKeys: string[] = []
        newListItemJsons.forEach(newListItemJson => {
          const itemKey = newListItemJson?.itemKey

          if (itemKey) {
            newItemKeys.push(itemKey)
          }
        })
        const newItemKeysJoin = newItemKeys.join(',')

        if (newItemKeysJoin !== oldItemKeysJoin) {
          // order changed
          const newItemsArray: IMDataSourceItem[] = []
          newItemKeys.forEach(itemKey => {
            const item = itemsObj[itemKey]

            if (item) {
              newItemsArray.push(item)
            }
          })

          const newImDataSourceItems = Immutable(newItemsArray) as unknown as ImmutableArray<DataSourceItem>
          updateIMDataSourceItemsConfig(jimuMapViewId, rawJimuMapViewConfigInfo, newImDataSourceItems)
        }
      }
    }
  }, [getRawJimuMapViewConfigInfoByJimuMapViewId, updateIMDataSourceItemsConfig])

  // sqlExpression or sqlHint changed for one dataSourceItem
  const onLayerItemDetailUpdate = React.useCallback((newImDataSourceItem: IMDataSourceItem) => {
    if (clickedJimuLayerViewInfo && dataSourceItemForClickedLayer && newImDataSourceItem) {
      const jimuMapViewId = clickedJimuLayerViewInfo.jimuMapViewId

      if (jimuMapViewId && dataSourceItemForClickedLayer && newImDataSourceItem.uid && newImDataSourceItem.uid === dataSourceItemForClickedLayer.uid) {
        // rawJimuMapViewConfigInfo should not be empty
        const rawJimuMapViewConfigInfo = getRawJimuMapViewConfigInfoByJimuMapViewId(jimuMapViewId)

        if (rawJimuMapViewConfigInfo) {
          const dataSourceItems = rawJimuMapViewConfigInfo.dataSourceItems

          if (dataSourceItems?.length > 0) {
            const newImDataSourceItems = dataSourceItems.map((item) => {
              if (newImDataSourceItem.jimuLayerViewId && item.jimuLayerViewId === newImDataSourceItem.jimuLayerViewId) {
                return newImDataSourceItem
              } else {
                return item
              }
            }) as unknown as ImmutableArray<DataSourceItem>

            updateIMDataSourceItemsConfig(jimuMapViewId, rawJimuMapViewConfigInfo, newImDataSourceItems)
          }
        }
      }
    }
  }, [clickedJimuLayerViewInfo, dataSourceItemForClickedLayer, getRawJimuMapViewConfigInfoByJimuMapViewId, updateIMDataSourceItemsConfig])

  const attributeSelectionRow = syncWithMapForClickedMap ? null : (
    <TitleWithSwitch
      disabled={syncWithMapForClickedMap}
      checked={getFinalEnableAttributeSelectionForMap(syncWithMapForClickedMap, enableAttributeSelectionForClickedMap)}
      titleKey='attributeSelection'
      className='mt-3'
      onSwitchChange={onGlobalAttributeSelectionSwitchChange}
    />
  )

  return (
    <React.Fragment>
      <SettingRow>
        <MapWidgetSelector
          useMapWidgetIds={useMapWidgetIds}
          aria-describedby={selectMapHintDomId}
          onSelect={onMapWidgetSelect}
        />
      </SettingRow>

      {
        shouldShowPlaceholder &&
        <React.Fragment>
          <span id={selectMapHintDomId} className='d-none'>{translate('selectMapHint')}</span>
          <Placeholder
            text={translate('selectMapHint')}
            style={{ height: 'calc(100% - 15rem)' }}
          />
        </React.Fragment>
      }

      {
        currMapWidgetId &&
        <SettingRow>
          <JimuMapViewComponent
            useMapWidgetId={currMapWidgetId}
            onViewsCreate={onJimuViewsCreate}
          />

          {/* If invalidConfigJimuMapViewIds is not empty, we will update config to remove invalidConfigJimuMapViewIds from config.
              MapLayersSetting maybe also update config, so we should not render MapLayersSetting to avoid updating config with conflict. */}
          {
            isAllConfigJimuMapViewIdsValid &&
            <LayerSetting
              // MultipleJimuMapConfigProps
              mapWidgetId={currMapWidgetId}
              disableSwitchMap={true}
              onMapItemClick={onMapItemClick}

              // CustomizeLayerPanelProps, include JimuLayerViewSelector props
              mapViewId={clickedJimuMapViewId}
              isJlvLoading={clickedJimuMapViewId && !(isLayersAndDataSourcesLoadedForClickedMap)}
              isCustomizeEnabled={customizeLayersForClickedMap}
              isShowRuntimeAddedLayerEnabled={layerSettingIsShowRuntimeAddedLayerEnabled}
              extraSettingOptions={attributeSelectionRow}
              selectedValues={layerSettingSelectedValues}
              showTable={false}

              onToggleCustomize={onCustomizeMapSwitchChangeForClickedMap}
              onShowRuntimeAddedLayersChange={onAllowGeneratedLayersSwitchChangeForClickedMap}
              hideLayers={jimuLayerViewSelectorHideLayersForClickedMap}
              disableLayers={jimuLayerViewSelectorDisableLayersForClickedMap}
              onSelectedLayerIdChange={onJimuLayerViewSelectorChangeForClickedMap}

              // customized layer list
              showSelectedLayers={true}
              dndEnabled={true}
              isLayerDisabled={isLayerListItemDisabled}
              getLayerCustomIcon={getLayerCustomIcon}
              onLayerItemClick={onLayerItemClick}
              onLayerReorder={onLayerReorder}
            >
              {
                // LayerItemDetail component is used to configure sqlExpression and sqlHint,
                // so it is only available when the global enableAttributeSelection is true.
                (clickedJimuLayerViewInfo && clickedJimuLayerViewInfo.jimuMapView && dataSourceItemForClickedLayer) &&
                <LayerItemDetail
                  jimuMapView={clickedJimuLayerViewInfo.jimuMapView}
                  currentDataSourceItem={dataSourceItemForClickedLayer}
                  onLayerItemDetailUpdate={onLayerItemDetailUpdate}
                />
              }
            </LayerSetting>
          }
        </SettingRow>
      }
    </React.Fragment>
  )
}

function getAllValidJimuMapViewIdsByMapWidget (mapWidgetId: string): string[] {
  const resultValidJimuMapViewIds: string[] = []

  if (mapWidgetId) {
    const appConfig = getRuntimeAppConfig()

    if (appConfig.widgets) {
      const widgetJson = appConfig.widgets[mapWidgetId]

      if (widgetJson) {
        const mapUseDataSources = widgetJson.useDataSources

        if (mapUseDataSources && mapUseDataSources.length > 0) {
          mapUseDataSources.forEach(mapUseDataSource => {
            const mapDataSourceId = mapUseDataSource?.dataSourceId

            if (mapDataSourceId) {
              const validJimuMapViewId = mapWidgetId + '-' + mapDataSourceId
              resultValidJimuMapViewIds.push(validJimuMapViewId)
            }
          })
        }
      }
    }
  }

  return resultValidJimuMapViewIds
}

function getDataSourceItemByJimuLayerView (jimuLayerView: JimuLayerView): DataSourceItem {
  const uid = uuidv1()
  const useDataSource = getUseDataSourceByJimuLayerView(jimuLayerView)
  const jimuLayerViewId = jimuLayerView.id

  const dataSourceItem: DataSourceItem = {
    uid,
    sqlHint: '',
    useDataSource,
    sqlExpression: null,
    jimuLayerViewId
  }

  return dataSourceItem
}

function getUseDataSourceByJimuLayerView (jimuLayerView: JimuLayerView): UseDataSource {
  const ds = jimuLayerView.getLayerDataSource()
  const dsId = ds.id
  const mainDs = ds.getMainDataSource()
  const rootDs = ds.getRootDataSource()
  const mainDataSourceId = mainDs ? mainDs.id : dsId
  const rootDsId = rootDs ? rootDs.id : ''

  const useDataSource: UseDataSource = {
    dataSourceId: dsId,
    mainDataSourceId,
    rootDataSourceId: rootDsId
  }

  return useDataSource
}

function waitTime (ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

export default React.memo(MapSourceSection)