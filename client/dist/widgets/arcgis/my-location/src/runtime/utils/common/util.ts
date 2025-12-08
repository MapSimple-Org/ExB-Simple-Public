import { dataSourceUtils, getAppStore, TimezoneConfig, dateUtils, type IntlShape } from 'jimu-core'
import { DistanceUnits } from '../../../config'
import defaultMessages from '../../translations/default'
export const isEmpty = (value) => {
  return value === null || value === undefined || value === ''
}

export const timestampFormat = (intl: IntlShape, utcTimestamp: number) => {
  let timezone
  if (window.jimuConfig.isBuilder) {
    timezone = getAppStore().getState().appStateInBuilder.appConfig.attributes.timezone
  } else {
    timezone = getAppStore().getState().appConfig.attributes.timezone
  }
  let timestamp
  if (timezone?.type === TimezoneConfig.Specific) {
    const tzOffset = dataSourceUtils.getTimeZoneOffsetByName(timezone.value)
    timestamp = utcTimestamp - dataSourceUtils.getLocalTimeOffset() + tzOffset
  } else {
    timestamp = utcTimestamp
  }
  return dateUtils.formatDateValueByEsriFormat(timestamp, dateUtils.DATE_TIME_DEFAULT_ESRI_FORMAT, intl)
}

export const formatNumberWithDecimals = (number: number, count: number) => {
  const formattedNumber = parseFloat(number.toFixed(count))
  return formattedNumber
}

export const formatContent = (intl: IntlShape, key, value) => {
  let str = value
  switch (key) {
    case 'location_timestamp':
    case 'StartTime':
    case 'EndTime':
      str = timestampFormat(intl, value)
      break
    case 'Longitude':
      str = value >= 0 ? `${value} °E` : `${value} °W`
      break
    case 'Latitude':
      str = value >= 0 ? `${value} °N` : `${value} °S`
      break
    case 'speed':
    case 'AverageSpeed':
      str = !isEmpty(value) ? `${value} ${intl.formatMessage({ id: 'speedUnit', defaultMessage: defaultMessages.speedUnit })}` : ''
      break
    case 'Orientation':
      str = !isEmpty(value) ? `${value} °` : ''
      break
    case 'Accuracy':
    case 'AverageAccuracy':
      str = !isEmpty(value) ? `${value} ${intl.formatMessage({ id: 'altitudeUnit', defaultMessage: defaultMessages.altitudeUnit })}` : ''
      break
    case 'altitude':
    case 'AverageAltitude':
      str = !isEmpty(value) ? `${value} ${intl.formatMessage({ id: 'altitudeUnit', defaultMessage: defaultMessages.altitudeUnit })}` : ''
      break
    default:
      break
  }

  return str
}

export const calculateDistance = (lat1, lon1, lat2, lon2, unit) => {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  let d = R * c
  if (unit === DistanceUnits.ft) {
    d *= 3280.84
  } else if (unit === DistanceUnits.m) {
    d *= 1000
  }
  return d
}

function deg2rad (deg) {
  return deg * (Math.PI / 180)
}

export const calculateTimeDifference = (timestamp1, timestamp2) => {
  const differenceInSeconds = Math.abs(timestamp2 - timestamp1) / 1000
  return differenceInSeconds
}
