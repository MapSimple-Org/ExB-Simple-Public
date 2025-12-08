import type { GeometryType, IGeometry } from '@esri/arcgis-rest-feature-service'
import type { ImmutableArray } from 'jimu-core'
import type { ImmutableObject } from 'seamless-immutable'
import type { LrsLayer, MapViewConfig, ModeType, SearchMeasuresType } from 'widgets/shared-code/lrs'

export interface Locations {
  status: string
  routeId: string
  toRouteId: string
  geometryType: GeometryType
  geometry: IGeometry
}

export interface GeometryToMeasureResult {
  routeId: string
  measure: number
  distance: number
  geometryType: GeometryType
  geometry: IGeometry
}

export interface GeometryToMeasureLocation {
  status: string
  results: GeometryToMeasureResult[]
}

export interface GeometryToMeasureResponse {
  spatialReference: { wkid: number; wkt: string }
  locations: GeometryToMeasureLocation[]
}

export interface MeasureToGeometryResponse {
  spatialReference: { wkid?: number; wkt?: string }
  locations: Locations[]
}

export interface RouteAndMeasureQuery {
  routeId?: string
  routeName?: string
  lineId?: string
  lineName?: string
  routeIdFields?: string[] | number[]
  measure?: number
  station?: string
  fromMeasure?: number
  toMeasure?: number
  fromStation?: string
  toStation?: string
  measures?: number[]
  stations?: string[]
  isPoint?: boolean
  isMeasureToGeometryOperation?: boolean
  searchMeasureBy?: SearchMeasuresType
}

export interface CoordinateQuery {
  xCoordinate?: number
  yCoordinate?: number
  zCoordinate?: number
}

export interface ReferentQuery {
  layerId?: number
  objectId?: number[]
  offset?: number
  fromDate?: number
  objectIdFromDt?: any
}

export interface ResultConfig {
  pageSize: number
  defaultReferentLayer?: ImmutableObject<LrsLayer>
  defaultOffsetUnit?: string
}

export interface Style {
  color: string
  size: number
}

export interface SettingsPerView {
  highlightStyle?: Style
  labelStyle?: Style
  resultConfig?: ResultConfig
  defaultNetwork?: string
  hideMethod: boolean
  hideNetwork: boolean
  hideRoute?: boolean
}

export interface Config {
  lrsLayers?: ImmutableArray<LrsLayer>
  highlightStyle?: Style
  labelStyle?: Style
  resultConfig?: ResultConfig
  defaultNetwork?: string
  hideMethod: boolean
  hideNetwork: boolean
  hideRoute?: boolean
  mode?: ModeType
  mapViewsConfig?: {
    [jimuMapViewId: string]: ImmutableObject<MapViewConfig>
  }
  settingsPerView?: {
    [jimuMapViewId: string]: ImmutableObject<SettingsPerView>
  }
}

export type IMConfig = ImmutableObject<Config>
