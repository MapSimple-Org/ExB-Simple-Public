import { getAppStore, type IMState, AppMode } from 'jimu-core'
import type { IMConfig, ScaleRange } from './config'

export type CustomPopupDockPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type PopupDockPosition = 'auto' | CustomPopupDockPosition

export const CustomDockPositionArray: CustomPopupDockPosition[] = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']

export function getValidPopupDockPosition (config: IMConfig): PopupDockPosition {
  let result: PopupDockPosition = null

  if (config && config.popupDockPosition) {
    if (config.popupDockPosition === 'auto' || CustomDockPositionArray.includes(config.popupDockPosition)) {
      result = config.popupDockPosition
    }
  }

  return result
}

export interface FinalScaleRange {
  isScaleRangeValid: boolean
  finalMinScale: number
  finalMaxScale: number
}

/**
 * This method will calculate the final scale range for the view, the result is definitely not empty.
 * @param view
 * @param configScaleRange
 * @returns
 */
export function getFinalScaleRangeForView (view: __esri.View, configScaleRange: ScaleRange): FinalScaleRange {
  // If minScale/maxScale is 0, means there is no limit for minScale/maxScale.
  let result: FinalScaleRange = null

  if (view.type === '2d' && configScaleRange) {
    // Note, minScale >= maxScale
    const lodScaleRange = getMinScaleAndMaxScaleByLods(view)
    const lodMinScale = lodScaleRange?.minScale
    const lodMaxScale = lodScaleRange?.maxScale
    const currScale = (view as __esri.MapView).scale
    result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
  }

  if (!result) {
    result = {
      isScaleRangeValid: true,
      finalMinScale: 0,
      finalMaxScale: 0
    }
  }

  return result
}

// This method maybe return { minScale: null, maxScale: null } if no lods.
export function getMinScaleAndMaxScaleByLods (view: __esri.View): ScaleRange {
  // Note, minScale >= maxScale
  let minScale: number = null
  let maxScale: number = null

  const lods = (view as any)?.constraintsInfo?.lods as __esri.LOD[]

  if (lods && lods.length > 0) {
    const scales: number[] = []

    lods.forEach(lod => {
      const scale = lod?.scale

      if (typeof scale === 'number' && scale > 0) {
        scales.push(scale)
      }
    })

    if (scales.length > 0) {
      minScale = Math.max(...scales)
      maxScale = Math.min(...scales)
    }
  }

  const scaleRange: ScaleRange = {
    minScale,
    maxScale
  }

  return scaleRange
}

export function getFinalScaleRange (currScale: number, lodMinScale: number, lodMaxScale: number, configScaleRange: ScaleRange): FinalScaleRange {
  // If minScale/maxScale is 0, means there is no limit for minScale/maxScale.
  const result: FinalScaleRange = {
    isScaleRangeValid: true,
    finalMinScale: 0,
    finalMaxScale: 0
  }

  if (configScaleRange) {
    // Note, minScale(bigScale) > maxScale(smallScale)
    // LOD scales:        small [lodMaxScale, lodMinScale] big
    // scaleRange scales: small [configMaxScale, configMinScale] big

    const configMinScale = configScaleRange.minScale
    const configMaxScale = configScaleRange.maxScale
    const configBigScale = isValidScale(configMinScale) ? configMinScale : Infinity
    const configSmallScale = isValidScale(configMaxScale) ? configMaxScale : 0
    const lodBigScale = isValidScale(lodMinScale) ? lodMinScale : Infinity
    const lodSmallScale = isValidScale(lodMaxScale) ? lodMaxScale : 0

    // config range: configSmallScale____________________configBigScale
    // lod range:    lodSmallScale____________________lodBigScale
    const intersection = getRangeIntersection([configSmallScale, configBigScale], [lodSmallScale, lodBigScale])

    if (intersection) {
      const [intersectionSmallScale, intersectionBigScale] = intersection
      result.isScaleRangeValid = true
      result.finalMinScale = getValidScale(intersectionBigScale)
      result.finalMaxScale = getValidScale(intersectionSmallScale)

      if (result.finalMinScale === lodMinScale) {
        result.finalMinScale = 0
      }

      if (result.finalMaxScale === lodMaxScale) {
        result.finalMaxScale = 0
      }
    } else {
      result.isScaleRangeValid = false
      result.finalMinScale = currScale
      result.finalMaxScale = currScale
    }
  }

  return result
}

function isValidScale(scale: number): boolean {
  // don't use >=
  return typeof scale === 'number' && isFinite(scale) && scale > 0
}

function getValidScale(scale: number): number {
  // return 0 if scale is Infinity
  return isFinite(scale) ? scale : 0
}

// getRangeIntersection([0, 2], [1, 3]) => [1, 2]
// getRangeIntersection([0, 4], [1, 3]) => [1, 3]
// getRangeIntersection([0, 1], [1, 2]) => [1, 1]
// getRangeIntersection([0, 2], [3, 4]) => null
function getRangeIntersection(range1: [number, number], range2: [number, number]): [number, number] | null {
  const min1 = Math.min(...range1)
  const max1 = Math.max(...range1)
  const min2 = Math.min(...range2)
  const max2 = Math.max(...range2)

  const start = Math.max(min1, min2)
  const end = Math.min(max1, max2)

  if (start > end) {
    return null
  }

  return [start, end]
}

/**
 * This method maybe return null. This method doesn't return empty array(convert to null).
 * @param mapView
 * @param config
 */
export function getFinalLods(mapView: __esri.View, config: IMConfig): __esri.LODProperties[] {
  let resultLods: __esri.LODProperties[] = null

  if (mapView?.type === '2d') {
    const customLODs = config?.customLODs

    if (customLODs) {
      // 'Customize scale list' radio is checked
      const configLods = customLODs.lods

      if (configLods?.length > 0) {
        // User clicks 'Modify' button and set some scales
        resultLods = configLods.asMutable({ deep: true })
      } else {
        // case1. User doesn't click 'Modify' button
        // case2. User click 'Modify' button, but doesn't click the 'Ok' button of Modal
        resultLods = null
      }
    }
  }

  if (resultLods && resultLods.length === 0) {
    resultLods = null
  }

  return resultLods
}

/**
 * Note, both lods1 and lods2 maybe null
 * @param lods1
 * @param lods2
 * @returns
 */
export function isSameLods(lods1: __esri.LOD[] | __esri.LODProperties[], lods2: __esri.LOD[] | __esri.LODProperties[]): boolean {
  if (!lods1) {
    lods1 = null
  }

  if (!lods2) {
    lods2 = null
  }

  if (Array.isArray(lods1) && Array.isArray(lods2)) {
    // both lods1 and lods2 are array.
    if (lods1.length === lods2.length) {
      if (lods1.length === 0) {
        return true
      } else {
        return lods1.every((lod1, index) => {
          const lod2 = lods2[index]
          return lod1?.level === lod2?.level && lod1?.resolution === lod2?.resolution && lod1?.scale === lod2?.scale
        })
      }
    } else {
      return false
    }
  } else {
    // cases:
    // case1, both lods1 and lods2 are null
    // case2, one is null and the other is array
    return lods1 === lods2
  }
}

export function getOriginalBasemapLODs(mapView: __esri.View): __esri.LODProperties[] {
  let result: __esri.LODProperties[] = []
  const originalBasemapLODs: __esri.LOD[] = (mapView as any)?.originalBasemapLODs

  if (originalBasemapLODs?.length > 0) {
    const lodPropertiesArray: __esri.LODProperties[] = originalBasemapLODs.map(lod => {
      const lodProperties: __esri.LODProperties = {
        level: lod.level,
        resolution: lod.resolution,
        scale: lod.scale
      }

      return lodProperties
    })

    result = sortLODs(lodPropertiesArray)
  }

  return result
}

export function sortLODs(lods: __esri.LODProperties[]): __esri.LODProperties[] {
  if (!lods) {
    lods = []
  }

  //  desc order
  lods.sort((v1, v2) => (v2.scale - v1.scale))

  lods.forEach((lod, index) => {
    lod.level = index
  })

  return lods
}

export function getRuntimeState (): IMState {
  const appState = getAppStore().getState()
  return window.jimuConfig?.isBuilder ? appState.appStateInBuilder : appState
}

export function isExpressMode (): boolean {
  const runtimeState = getRuntimeState()
  const isExpressMode = runtimeState?.appRuntimeInfo?.appMode === AppMode.Express
  return isExpressMode
}
