import type { ImmutableObject } from 'jimu-core'

export enum Arrangement {
  Panel = 'PANEL',
  Toolbar = 'TOOLBAR'
}

export enum Types {
  Distance = 'DISTANCE',
  Time = 'TIME'
}
export enum DistanceUnits {
  ft = 'FT',
  m = 'M'
}
export enum TimeUnits {
  sec = 'S'
}
export enum CoordUnits {
  DD = 'DD',
  DMS = 'DMS'
}

export interface Streaming {
  type: string
  unit: string
  interval: number
}

export interface WatchLocationSettings {
  streaming: Streaming
  manualPathTracing: boolean
}

export interface HighlightInfo {
  symbolColor: string
  showCompassOrientation: boolean
  showLocationAccuracy: boolean
}

export interface TrackPoint {
  location_timestamp: number
  Longitude: number
  Latitude: number
  altitude: number
  Orientation: number
  speed: number
  Accuracy: number
  OBJECTID: number
}
export interface TrackLine {
  StartTime: number
  EndTime: number
  AverageAltitude: number
  AverageSpeed: number
  AverageAccuracy: number
  OBJECTID: number
}

export interface TrackLinePoint {
  location_timestamp: number
  Longitude: number
  Latitude: number
  altitude: number
  Orientation: number
  speed: number
  Accuracy: number
  OBJECTID: number
  LineID: number
}

export interface TracksWithLine {
  tracks: TrackLinePoint[]
  line: TrackLine
}

export interface Config {
  watchLocation: boolean
  watchLocationSettings: WatchLocationSettings
  arrangement: Arrangement
  highlightLocation: boolean
  highlightInfo: HighlightInfo
  zoomScale: number
  timeOut: number
  selectedFields: []
  selectedLineFields: []
  defaultActivation: boolean
  useMapWidget: boolean
  showRuntimeLayers?: boolean
  zoomToLocation: boolean
}

export type IMConfig = ImmutableObject<Config>
