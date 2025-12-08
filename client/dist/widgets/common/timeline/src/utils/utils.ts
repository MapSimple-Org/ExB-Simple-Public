import { type DataSource, dataSourceUtils, dateUtils, type FeatureLayerDataSource, type MapServiceDataSource, Immutable, DataSourceTypes, getAppStore, TimezoneConfig, type MapDataSource } from 'jimu-core'
import type { DateTimeUnits, DateUnitInputValue, DateWeekUnits, TimeUnits } from 'jimu-ui/advanced/style-setting-components'
import { TimeDisplayStrategy, type timeSpanValue, type timeSettings, TimeSpeed } from '../config'

export const UnitSelectorDateWeekUnits: DateWeekUnits[] = ['year', 'month', 'day'] //, 'week'
export const UnitSelectorTimeUnits: TimeUnits[] = ['hour', 'minute', 'second']

// Min tick width of timeline.
export const MIN_TICK_WIDTH = 4 // px
// Default step_length: 10. It could be 5, or 1 when extent is smaller than calcuated step_length.
export const STEP_LENGTH = 10
// Default divided_count
export const DIVIDED_COUNT = 5

export const MIN_DATE_TIME = -59011488343000 // UTC 100/1/1 00:00:00
export const MAX_DATE_TIME = 32503651200000 // UTC 3000/1/1 00:00:00
export const DATE_PATTERN = 'd/M/y'
export const TIME_PATTERN = 'h:mm:ss a'

export const DISPLAY_ACCURACY = [...UnitSelectorDateWeekUnits, ...UnitSelectorTimeUnits]

export function getDateTimePattern (unit) {
  const formats: any = {
    second: '2-digit',
    minute: '2-digit',
    hour: '2-digit',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  }
  const pattern = {}
  DISPLAY_ACCURACY.some(key => {
    pattern[key] = formats[key]
    return key === unit
  })
  return pattern
}

export enum SecondsForDateUnit {
  'year' = 31536000,
  'month' = 2592000,
  // 'week' = 604800,
  'day' = 86400,
  'hour' = 3600,
  'minute' = 60,
  'second' = 1
}

function getUnitFromEsriTimeUnit (esriUnit) {
  switch (esriUnit) {
    case 'esriTimeUnitsMonths':
      return 'month'
    case 'esriTimeUnitsDays':
      return 'day'
    case 'esriTimeUnitsHours':
      return 'hour'
    case 'esriTimeUnitsMinutes':
      return 'minute'
    default:
      return 'year'
  }
}

export const SPEED_VALUE_PAIR = {
  slowest: 5000,
  slow: 4000,
  medium: 3000,
  fast: 2000,
  fastest: 1000
}

function findProperSpeed (speedValue): TimeSpeed {
  let finalSpeed
  const s = Math.ceil(speedValue / 1000) * 1000 // MV3,4
  Object.keys(SPEED_VALUE_PAIR).some(level => {
    if (SPEED_VALUE_PAIR[level] === s) {
      finalSpeed = level.toUpperCase()
      return true
    }
    return false
  })
  if (!finalSpeed) { // MV3
    if (s > SPEED_VALUE_PAIR.slowest) {
      finalSpeed = TimeSpeed.Slowest
    } else if (s < SPEED_VALUE_PAIR.fastest) {
      finalSpeed = TimeSpeed.Fastest
    }
  }
  return finalSpeed
}

export function getTimeSettingsFromHonoredWebMap (dataSources: { [dsId: string]: DataSource }, isRuntime = false): timeSettings {
  let settings: timeSettings = null
  // eslint-disable-next-line @typescript-eslint/prefer-find
  const webMap = dataSources[Object.keys(dataSources).filter(id => isWebMapOrWebScene(dataSources[id].type))[0]]
  const props = (webMap as MapServiceDataSource)?.getItemData()?.widgets?.timeSlider?.properties
  // webmap may disabled time after current widget is added. If so, use default settings calculated by inside layers.
  if (props) {
    const { startTime: _startTime, endTime: _endTime, timeStopInterval, numberOfStops, thumbMovingRate, thumbCount } = props
    let startTime = _startTime
    let endTime = _endTime
    if (isRuntime) {
      const times = getTimeExtentByTzOffset(_startTime, _endTime, true)
      startTime = times.startTime
      endTime = times.endTime
    }
    settings = {
      speed: findProperSpeed(thumbMovingRate),
      layerList: null,
      startTime: { value: startTime },
      endTime: { value: endTime },
      // todo: when MV supports instant mode.
      timeDisplayStrategy: thumbCount === 2 ? TimeDisplayStrategy.current : TimeDisplayStrategy.cumulatively
    }
    if (timeStopInterval) {
      const unit = getUnitFromEsriTimeUnit(timeStopInterval.units)
      settings.accuracy = unit
      settings.stepLength = { val: timeStopInterval.interval, unit: unit }
    } else if (numberOfStops) {
      settings.dividedCount = numberOfStops
      // set proper accuracy.
      const accuracyList = getSupporedAccuracyList(startTime, endTime)
      settings.accuracy = accuracyList[0]
      const tickTimes = (endTime - startTime) / numberOfStops
      accuracyList.some(unit => {
        if (tickTimes >= SecondsForDateUnit[unit] * 1000) {
          settings.accuracy = unit
          return true
        }
        return false
      })
    }
  }
  return settings
}

/**
 * Get TimeSettings with calculated accuracy and stepLength, and added minAccuracy, exactStartTime and exactEndTime.
 * @param timeSettings
 * @param dataSources
 * @param width
 * @returns
 */
export function getCalculatedTimeSettings (timeSettings, dataSources: { [dsId: string]: DataSource }, isRuntime = false) {
  const {
    startTime = { value: dateUtils.VirtualDateType.Min },
    endTime = { value: dateUtils.VirtualDateType.Max },
    layerList, accuracy: accuracySet, stepLength: stepLengthSet
  } = timeSettings || {}
  let newTimeSettings

  // Return default time setting, and calculated accuracy and stepLength.
  const { startTime: newStartTime, endTime: newEndTime } = getTimeExtentForDS(dataSources, layerList, startTime, endTime)

  if (!newStartTime || !newEndTime) {
    return null
  }

  // Calculate the lastest accuracy.
  const accuracyList = getSupporedAccuracyList(newStartTime, newEndTime)
  const accuracy = accuracyList[0] // Use first as default value.

  // Update settings
  const stepLengthCalc = getStepLengthByAccuracy(newStartTime, newEndTime, accuracy)
  if (timeSettings) {
    newTimeSettings = Immutable(timeSettings)
    const isAccuracyChanged = !accuracyList.includes(accuracySet)
    // Update accuracy when: accuracySet is not in supported accuracy list.
    if (isAccuracyChanged) {
      newTimeSettings = newTimeSettings.set('accuracy', accuracy)
    }
    /**
     * Check if necessary to update stepLength:
     * 1. accuracy is changed.
     * 2. stepLengthSet unit is larger than maxAccuracy
     * 3. stepLengthSet extent if out of whole extent
     */
    if (stepLengthSet && (
      isAccuracyChanged ||
      SecondsForDateUnit[stepLengthSet.unit] > SecondsForDateUnit[accuracy] ||
      (SecondsForDateUnit[stepLengthSet.unit] as any) * 1000 * stepLengthSet.val > newEndTime - newStartTime
    )) {
      newTimeSettings = newTimeSettings.set('stepLength', stepLengthCalc)
    }
  } else { // Return default settings (with calculated accuracy and stepLength)
    newTimeSettings = Immutable(getDefaultTimeSettings(accuracy, stepLengthCalc))
  }

  // TODO: add layerlist when type is webmap

  if (isRuntime) {
    newTimeSettings = newTimeSettings.set('startTime', { value: newStartTime }).set('endTime', { value: newEndTime })
    return newTimeSettings
  } else {
    return Immutable({
      config: newTimeSettings,
      exactStartTime: newStartTime,
      exactEndTime: newEndTime,
      minAccuracy: accuracy,
      accuracyList: accuracyList
    })
  }
}

/**
 * Get proper stepLength by accuracy.
 * By default, stepLength is 10 times larger than accuracy.
 * When stepLength is longer than extent, it should be 1, or 5 times.
 * @param startTime
 * @param endTime
 * @param accuracy
 * @returns
 */
export function getStepLengthByAccuracy (startTime, endTime, accuracy: DateTimeUnits) {
  const proportion = (endTime - startTime) / 1000 / SecondsForDateUnit[accuracy]
  const value = proportion > 15 ? STEP_LENGTH : (proportion > 10 ? 5 : 1)
  return { val: value, unit: accuracy }
}

function getDefaultTimeSettings (accuracy: DateTimeUnits, stepLength: DateUnitInputValue) {
  return {
    layerList: null,
    startTime: { value: dateUtils.VirtualDateType.Min },
    endTime: { value: dateUtils.VirtualDateType.Max },
    timeDisplayStrategy: 'CURRENT',
    dividedCount: null,
    accuracy: accuracy,
    stepLength: stepLength,
    speed: TimeSpeed.Medium
  }
}

/**
 * Get dateTimes for exact date and virtual dates.
 */
export function getTimesByVirtualDate (dateTime: timeSpanValue, isStart = true, dataSources?, layerList?) {
  let times: number = null
  if (dateTime) {
    if (typeof dateTime.value === 'number') {
      times = dateTime.value
    } else {
      const d = new Date()
      d.setMinutes(0)
      d.setSeconds(0)
      d.setMilliseconds(0)
      if (dateTime.value === dateUtils.VirtualDateType.Today) {
        d.setHours(0)
        times = d.getTime() + getOffsetedTimes(dateTime)
        times = isStart ? times : times + SecondsForDateUnit.day * 1000
      } else if (dateTime.value === dateUtils.VirtualDateType.Now) {
        times = d.getTime() + getOffsetedTimes(dateTime)
        times = isStart ? times : times + SecondsForDateUnit.hour * 1000
      } else if (dateTime.value === dateUtils.VirtualDateType.Max || dateTime.value === dateUtils.VirtualDateType.Min) {
          // Use all webmap/layers instead of selected layers
          const mapLayers = getInsideLayersFromWebmapOrWebScene(dataSources, layerList)
          if (mapLayers) {
            dataSources = mapLayers
          }

          // check if all dss are null which means inaccessible.
          const allDssAreFailed = Object.keys(dataSources).filter(dsId => dataSources[dsId] === null).length === Object.keys(dataSources).length
          if (allDssAreFailed) {
            return null
          }

          Object.keys(dataSources).forEach(dsId => {
            const ds = dataSources[dsId] as FeatureLayerDataSource
            if (!ds) { // some dss might be null
              return
            }
            const dsInfo = ds.getTimeInfo() // TODO: no getTimeInfo for webMap
            if (dateTime.value === dateUtils.VirtualDateType.Max) {
              const max = dsInfo?.timeExtent?.[1]
              times = times ? Math.max(times, max) : max // TODO: query features if no timeExtent.
            } else {
              const min = dsInfo?.timeExtent?.[0]
              times = times ? Math.min(times, min) : min
            }
          })
      }
    }
  }
  return times
}

function getOffsetedTimes (dateTime: timeSpanValue) {
  return dateTime.offset ? dateTime.offset.val * SecondsForDateUnit[dateTime.offset.unit] * 1000 : 0
}

export function isWebMapOrWebScene (type: string): boolean {
  return type === DataSourceTypes.WebMap || type === DataSourceTypes.WebScene
}

/**
 * Get all inside supported layers when current ds is webMap or webScene which support timeInfo.
 * @param dataSources
 * @returns
 */
export function getInsideLayersFromWebmapOrWebScene (dataSources: { [dsId: string]: DataSource }, layerList) {
  let layers = null
  const mapDs = Object.keys(dataSources).map(dsId => dataSources[dsId] as MapDataSource)[0]
  if (isWebMapOrWebScene(mapDs?.type)) {
    const fLayers = []
    mapDs.getAllChildDataSources().forEach(layer => {
      if ((
        layer.type === DataSourceTypes.MapService ||
        layer.type === DataSourceTypes.SubtypeGroupLayer ||
        layer.type === DataSourceTypes.ImageryLayer ||
        layer.type === DataSourceTypes.ImageryTileLayer ||
        (layer.type === DataSourceTypes.FeatureLayer && dataSourceUtils.findMapServiceDataSource(layer as FeatureLayerDataSource) === null) || // featureLayers which are not inside a mapService
        layer.type === DataSourceTypes.SceneLayer
      ) && (layer as any).supportTime()) {
        fLayers.push(layer)
      }
    })

    const layerListIds = layerList?.map(layer => layer.dataSourceId) || []
    layers = {}
    fLayers.forEach(layer => {
      if (layerListIds.length === 0 || layerListIds.includes(layer.id)) {
        layers[layer.id] = layer
      }
    })
  }
  return layers
}

/**
 * Get TimeExtent from DS
 * @param dataSources
 * @returns
 */
function getTimeExtentForDS (dataSources: { [dsId: string]: DataSource }, layerList, sTime: timeSpanValue, eTime: timeSpanValue) { // TODO: get exact time for min, max and other virtual dates.
  const startTime: number = getTimesByVirtualDate(sTime, true, dataSources, layerList)
  const endTime: number = getTimesByVirtualDate(eTime, false, dataSources, layerList)
  return getTimeExtentByTzOffset(startTime, endTime, true)
}

/**
 * Add offset to extent to display, or remove offset of ds.tz and local tz.
 * For now, skip timezone='unknown' case since:
 * Timeline widget supports multiple layers, some of them might be 'unknown' while others are not.
 */
export function getTimeExtentByTzOffset (startTime, endTime, withOffset = false) {
  let timezone
  if (window.jimuConfig.isBuilder) {
    timezone = getAppStore().getState().appStateInBuilder.appConfig.attributes.timezone
  } else {
    timezone = getAppStore().getState().appConfig.attributes.timezone
  }
  if (timezone?.type === TimezoneConfig.Specific) {
    const tzOffset = dataSourceUtils.getTimeZoneOffsetByName(timezone.value)
    const localTzOffset = dataSourceUtils.getLocalTimeOffset()
    if (withOffset) {
      startTime = startTime - localTzOffset + tzOffset
      endTime = endTime - localTzOffset + tzOffset
    } else {
      startTime = startTime + localTzOffset - tzOffset
      endTime = endTime + localTzOffset - tzOffset
    }
  }
  return { startTime, endTime }
}

/**
 * Get supported accuracy list for Minimum accuracy select, and Length of step select.
 * @param accuracy: predicted accuracy
 * @returns {DateTimeUnits[]}
 */
function getSupporedAccuracyList (startTime: number, endTime: number): DateTimeUnits[] {
  const units = [...UnitSelectorDateWeekUnits, ...UnitSelectorTimeUnits]
  const list = []

  const times = endTime - startTime
  units.forEach(key => {
    if (times >= SecondsForDateUnit[key] * 1000) {
      list.push(key)
    }
  })
  return list
}

/**
 * Get timeline's whole width by zoom level.
 * @param width
 * @param level
 */
// function getWidthByLevel (width: number, level: number) {
//   return width * level // TODO
// }

/**
 * Get update endTime by stepLength only when there is no virtual dates. #9812
 * @param stepLength
 * @param startTime
 * @param endTime
 * @ignore
 */
export function getUpdatedEndTimeByStepLength (stepLength: DateUnitInputValue, startTime, endTime) {
  let newEndTime = null
  startTime = startTime.value
  endTime = endTime.value
  if (stepLength && typeof startTime === 'number' && typeof endTime === 'number') {
    // if (stepLength.unit === 'week') { // turn week to days to calculate
    //   stepLength = { val: stepLength.val * 7, unit: 'day' }
    // }
    const diff = endTime - startTime
    const stepTimes = stepLength.val * SecondsForDateUnit[stepLength.unit] * 1000
    if (['day', 'hour', 'minute'].includes(stepLength.unit)) {
      newEndTime = startTime + Math.ceil(diff / stepTimes) * stepTimes
    } else {
      const startDate = new Date(startTime)
      let endDate = new Date(endTime)
      if (stepLength.unit === 'year') {
        // update same mdhms to endTime as startTime.
        const tempEndTime = new Date(startTime).setFullYear(endDate.getFullYear())
        newEndTime = endTime <= tempEndTime ? tempEndTime : new Date(startTime).setFullYear(endDate.getFullYear() + 1)
        // update endTime to fill last step.
        endDate = new Date(newEndTime)
        const fillTime = (endDate.getFullYear() - startDate.getFullYear()) % stepLength.val
        if (fillTime) {
          newEndTime = startDate.setFullYear(startDate.getFullYear() + Math.ceil((endDate.getFullYear() - startDate.getFullYear()) / stepLength.val) * stepLength.val)
        }
      } else if (stepLength.unit === 'month') {
        // update same dhms to endTime as startTime.
        let tempEndTime = new Date(startTime).setFullYear(endDate.getFullYear())
        tempEndTime = new Date(tempEndTime).setMonth(endDate.getMonth())
        newEndTime = endTime <= tempEndTime ? tempEndTime : new Date(tempEndTime).setMonth(endDate.getMonth() + 1)
        // update endTime to fill last step.
        endDate = new Date(newEndTime)
        let difMonth = 0
        const difYear = endDate.getFullYear() - startDate.getFullYear()
        if (difYear) {
          difMonth = (12 - startDate.getMonth() - 1) + difYear * 12 + endDate.getMonth() + 1
        } else {
          difMonth = endDate.getMonth() - startDate.getMonth()
        }

        const fillTime = difMonth % stepLength.val
        if (fillTime) {
          if (difYear) {
            newEndTime = startDate.setMonth(difYear * 12 + endDate.getMonth() + stepLength.val - fillTime)
          } else {
            newEndTime = startDate.setMonth(startDate.getMonth() + Math.ceil(difMonth / stepLength.val) * stepLength.val)
          }
        }
      }
    }
  }
  return newEndTime
}

export function isSingleLayer(dsType: string): boolean {
  return dsType === DataSourceTypes.FeatureLayer ||
    dsType === DataSourceTypes.ImageryLayer ||
    dsType === DataSourceTypes.ImageryTileLayer ||
    dsType === DataSourceTypes.SubtypeGroupLayer ||
    dsType === DataSourceTypes.SceneLayer
}
