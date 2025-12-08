import type BuildingExplorerViewModel from 'esri/widgets/BuildingExplorer/BuildingExplorerViewModel'
import { LayerMode } from '../../../../config'

export type WidgetStatesCache = Map<
string, // dsId
{
  layerMode: LayerMode
  caches: Map<
  // layerId
  string,
  // values
  {
    level: {
      enable: boolean
      value: number
      allowedValues: number[]
    }
    phase: {
      enable: boolean
      value: number
      allowedValues: number[]
    }
    _initLevel?: {
      enable: boolean
      value: number
      allowedValues: number[]
    }
    _initPhase?: {
      enable: boolean
      value: number
      allowedValues: number[]
    }
  }
  >
}
>

export function hasCacheInfo (info: { widgetStatesRef: React.MutableRefObject<WidgetStatesCache>, dsID: string, vm: BuildingExplorerViewModel }) {
  const cacheInfo = info.widgetStatesRef.current?.get(info.dsID)
  return cacheInfo
}

function _getLayerId (selectedLayerIDs: string[], layerMode: LayerMode) {
  let layerId = ''
  if (layerMode === LayerMode.Single) {
    layerId = selectedLayerIDs[0]
  } else if (layerMode === (LayerMode as any).Multiple) {
    layerId = (LayerMode as any).Multiple
  }

  return layerId
}

// 1. record & restore
export function saveWidgetStates (selectedLayerIDs: string[], layerMode: LayerMode, isInitFlag: boolean, info: { widgetStatesRef: React.MutableRefObject<WidgetStatesCache>, dsID: string, vm: BuildingExplorerViewModel }) {
  //console.log('save DsStates')
  if (!info.widgetStatesRef.current || isInitFlag) {
    info.widgetStatesRef.current = null // clear all cache (for initFlag==true)
    info.widgetStatesRef.current = new Map() // level 1
  }

  let cacheInfo = hasCacheInfo(info)
  if (!cacheInfo) {
    cacheInfo = { // level 2
      layerMode: layerMode,
      caches: new Map()
    }
    info.widgetStatesRef.current.set(info.dsID, cacheInfo)
  }

  const layerId = _getLayerId(selectedLayerIDs, layerMode)

  // save cache
  const hasCache = cacheInfo.caches.has(layerId)
  let cache
  if (!hasCache) {
    cache = {
      _initLevel: {
        enable: info.vm.level.enabled,
        value: info.vm.level.value,
        allowedValues: info.vm.level.allowedValues
      },
      _initPhase: {
        enable: info.vm.phase.enabled,
        value: info.vm.phase.value,
        allowedValues: info.vm.phase.allowedValues
      }
    }
  } else {
    cache = cacheInfo.caches.get(layerId)
  }

  cache = Object.assign(cache, {
    level: {
      enable: info.vm.level.enabled,
      value: info.vm.level.value,
      allowedValues: info.vm.level.allowedValues
    },
    phase: {
      enable: info.vm.phase.enabled,
      value: info.vm.phase.value,
      allowedValues: info.vm.phase.allowedValues
    }
  })
  cacheInfo.caches.set(layerId, cache)
  //window._info = cacheInfo
}

// 2. restore
export function restoreWidgetStates (selectedLayerIDs: string[], layerMode: LayerMode, isInitFlag: boolean, info: { widgetStatesRef: React.MutableRefObject<WidgetStatesCache>, dsID: string, vm: BuildingExplorerViewModel }) {
  //console.log('restore DsStates')
  if (!info.widgetStatesRef.current) {
    return
  }

  const cacheInfo = info.widgetStatesRef.current.get(info.dsID) // level 1
  if (!cacheInfo) {
    return
  }

  //const layerMode = cacheInfo.layerMode
  const layerId = _getLayerId(selectedLayerIDs, layerMode)

  const cache = cacheInfo.caches.get(layerId)
  const _level = isInitFlag ? cache?._initLevel : cache?.level
  const _phase = isInitFlag ? cache?._initPhase : cache?.phase

  // level
  if (_level?.enable) {
    info.vm.level.select(_level.value)
  } else {
    info.vm.level.clear()
  }
  if (_level?.allowedValues && _level?.allowedValues.length > 0) {
    info.vm.level.allowedValues = _level.allowedValues
  }
  // phase
  if (_phase?.enable) {
    info.vm.phase.select(_phase.value)
  } else {
    info.vm.phase.clear()
  }
  if (_phase?.allowedValues && _phase?.allowedValues.length > 0) {
    info.vm.phase.allowedValues = _phase.allowedValues
  }
}

// 3. clear
export function clearToInit (info: { widgetStatesRef: React.MutableRefObject<WidgetStatesCache>, dsID: string }) {
  const cacheInfo = info.widgetStatesRef.current?.get(info.dsID) // level 1
  if (!cacheInfo) {
    return
  }

  //const layerMode = cacheInfo.layerMode
  cacheInfo?.caches?.forEach((levelPhaseCache, layerId, map) => {
    levelPhaseCache.level = null
    levelPhaseCache.phase = null
  })
}
