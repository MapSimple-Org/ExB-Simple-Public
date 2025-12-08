import { Arrangement, Types, DistanceUnits } from './config'
import type { storeScheme } from './runtime/utils/common/db'
export const WATCH_LOCATION = false
export const DEFAULT_ACTIVATION = false
export const DEFAULT_ARRANGEMENT = Arrangement.Panel
export const HIGHLIGHT_LOCATION = true
export const ZOOM_TO_LOCATION = true
export const ZOOM_SCALE = 50000
export const TIME_OUT = 15
export const USE_MAPWIDGET = true
export const MANUAL_PATHTRACING = true
export const STREAMING = {
  TYPE: Types.Distance,
  UNIT: DistanceUnits.ft,
  INTERVAL: 15
}

export const SYMBOL_COLOR = '#007AC2'
export const SHOW_COMPASS_ORIENTATION = false
export const SHOW_LOCATION_ACCURACY = false

export enum POINT_FIELDS {
  'location_timestamp',
  'Longitude',
  'Latitude',
  'altitude',
  'Orientation',
  'speed',
  'Accuracy'
}

export const SELECTED_FIELDS = [
  'OBJECTID',
  'location_timestamp',
  'altitude',
  'Orientation',
  'speed',
  'Accuracy',
  'Latitude',
  'Longitude'
]
export const SELECTED_LINEPOINT_FIELDS = [
  'OBJECTID',
  'location_timestamp',
  'altitude',
  'Orientation',
  'speed',
  'Accuracy',
  'Latitude',
  'Longitude',
  'LineID'
]
export const SELECTED_LINE_FIELDS = [
  'OBJECTID',
  'StartTime',
  'EndTime',
  'AverageAltitude',
  'AverageSpeed',
  'AverageAccuracy'
]

export const STORES: storeScheme[] = [{
  storeName: 'location',
  indexName: 'timeIndex',
  indexKey: 'location_timestamp',
  keyPath: 'OBJECTID'
}, {
  storeName: 'path-point',
  indexName: 'lineIdIndex',
  indexKey: 'LineID',
  keyPath: 'OBJECTID'
}, {
  storeName: 'path',
  indexName: 'timeIndex',
  indexKey: 'EndTime',
  keyPath: 'OBJECTID'
}]

export const DB_VERSION = 1
