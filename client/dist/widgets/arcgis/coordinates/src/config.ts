import type { ImmutableArray, ImmutableObject } from 'jimu-core'

export enum DisplayOrderType {
  xy = 'XY',
  yx = 'YX'
}

export enum WidgetStyleType {
  classic = 'CLASSIC',
  modern = 'MODERN'
}

export enum ElevationUnitType {
  metric = 'METRIC',
  imperial = 'IMPERIAL'
}

export interface MapInfo {
  id: string
  title: string
  wkid: string
  label: string
  csUnit: string
}

export interface WidgetRect {
  width: number
  height: number
}

export interface CoordinateConfig {
  id: string
  name: string
  wkid: string
  crs?: any
  displayUnit: string
  elevationUnit?: ElevationUnitType
  datumWkid?: string
  datumName?: string
  transformForward?: boolean
  datumWkid2?: string
  datumName2?: string
  transformForward2?: boolean
}

export interface Config {
  coordinateSystem: ImmutableArray<CoordinateConfig>
  coordinateDecimal: number
  altitudeDecimal: number
  showSeparators: boolean
  displayOrder: DisplayOrderType
  widgetStyle: WidgetStyleType
  mapInfo?: MapInfo
  mapInfo2?: MapInfo
}

export type IMConfig = ImmutableObject<Config>
