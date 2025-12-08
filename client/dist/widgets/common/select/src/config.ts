import { type ImmutableObject, type UseDataSource, type SqlExpression, Immutable } from 'jimu-core'
import type { SpatialRelationship } from '@esri/arcgis-rest-feature-service'

export interface DataSourceItem {
  uid: string
  // hint for SqlExpressionRuntime
  sqlHint?: string
  useDataSource: UseDataSource
  sqlExpression?: SqlExpression
  // jimuLayerViewId is only available when useMap is true
  jimuLayerViewId?: string
}

export type IMDataSourceItem = ImmutableObject<DataSourceItem>

export interface DataAttributeInfo {
  allowGenerated: boolean
  dataSourceItems: DataSourceItem[]
}

export type IMDataAttributeInfo = ImmutableObject<DataAttributeInfo>

export function getDefaultDataAttributeInfo (): DataAttributeInfo {
  return {
    allowGenerated: false,
    dataSourceItems: []
  }
}

export interface JimuMapViewConfigInfo {
  syncWithMap: boolean
  allowGenerated: boolean // auto true if syncWithMap is true
  enableAttributeSelection: boolean // auto false if syncWithMap is false
  dataSourceItems: DataSourceItem[]
}

export type IMJimuMapViewConfigInfo = ImmutableObject<JimuMapViewConfigInfo>

export function getDefaultJimuMapViewConfigInfo (): JimuMapViewConfigInfo {
  return {
    syncWithMap: true,
    // If syncWithMap is true, allowGenerated must be true.
    allowGenerated: true,
    // If syncWithMap is true, enableAttributeSelection must be false.
    enableAttributeSelection: false,
    // If syncWithMap is true, set dataSourceItems to undefined/null, not empty array because we want to select all visible JimuQueriableLayerView when syncWithMap is set to false
    dataSourceItems: undefined
  }
}

export function getDefaultIMJimuMapViewConfigInfo (): IMJimuMapViewConfigInfo {
  const imJimuMapViewConfigInfo = getDefaultJimuMapViewConfigInfo()
  return Immutable(imJimuMapViewConfigInfo)
}

export interface MapInfo {
  [jimuMapViewId: string]: JimuMapViewConfigInfo
}

export type IMMapInfo = ImmutableObject<MapInfo>

export function getDefaultMapInfo (): MapInfo {
  return {}
}

export function getDefaultIMMapInfo (): IMMapInfo {
  const mapInfo = getDefaultMapInfo()
  return Immutable(mapInfo)
}

// make sure value is same with key
export enum SpatialRelation {
  Intersects = 'Intersects',
  Contains = 'Contains',
  Crosses = 'Crosses',
  EnvelopeIntersects = 'EnvelopeIntersects',
  IndexIntersects = 'IndexIntersects',
  Overlaps = 'Overlaps',
  Touches = 'Touches',
  Within = 'Within',
}

export const mapConfigSpatialRelToJSAPISpatialRel: { [key: string]: SpatialRelationship } = {
  [SpatialRelation.Intersects]: 'esriSpatialRelIntersects',
  [SpatialRelation.Contains]: 'esriSpatialRelContains',
  [SpatialRelation.Crosses]: 'esriSpatialRelCrosses',
  [SpatialRelation.EnvelopeIntersects]: 'esriSpatialRelEnvelopeIntersects',
  [SpatialRelation.IndexIntersects]: 'esriSpatialRelIndexIntersects',
  [SpatialRelation.Overlaps]: 'esriSpatialRelOverlaps',
  [SpatialRelation.Touches]: 'esriSpatialRelTouches',
  [SpatialRelation.Within]: 'esriSpatialRelWithin'
}

export const mapConfigSpatialRelToStringKey: { [key: string]: string } = {
  [SpatialRelation.Intersects]: 'spatialRelation_Intersect',
  [SpatialRelation.Contains]: 'spatialRelation_Contain',
  [SpatialRelation.Crosses]: 'spatialRelation_Cross',
  [SpatialRelation.EnvelopeIntersects]: 'spatialRelation_EnvelopeIntersect',
  [SpatialRelation.IndexIntersects]: 'spatialRelation_IndexIntersect',
  [SpatialRelation.Overlaps]: 'spatialRelation_Overlap',
  [SpatialRelation.Touches]: 'spatialRelation_Touch',
  [SpatialRelation.Within]: 'spatialRelation_Within'
}

// make sure value is same with key
export enum UnitType {
  Miles = 'Miles',
  Kilometers = 'Kilometers',
  Feet = 'Feet',
  Meters = 'Meters',
  NauticalMiles = 'NauticalMiles',
}

export const mapConfigUnitTypeToJSAPIUnit: { [key: string]: __esri.LinearUnits } = {
  [UnitType.Miles]: 'miles',
  [UnitType.Kilometers]: 'kilometers',
  [UnitType.Feet]: 'feet',
  [UnitType.Meters]: 'meters',
  [UnitType.NauticalMiles]: 'nautical-miles'
}

export interface Buffer {
  enable: boolean
  distance: number
  unit: UnitType
}

export type IMBuffer = ImmutableObject<Buffer>

export function getDefaultBuffer (): Buffer {
  return {
    enable: false,
    distance: 0,
    unit: UnitType.Meters
  }
}

export interface SpatialSelection {
  enable: boolean
  useDataSources: UseDataSource[]
  relationships: SpatialRelation[]
  buffer: Buffer
}

export type IMSpatialSelection = ImmutableObject<SpatialSelection>

export function getDefaultSpatialSelection (): SpatialSelection {
  const buffer = getDefaultBuffer()

  return {
    enable: false,
    useDataSources: [],
    relationships: [SpatialRelation.Intersects],
    buffer
  }
}

// Must be the enum values:  "polygon" | "circle" | "rectangle" | "point" | "multipoint" | "polyline"
// See details here: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Sketch-SketchViewModel.html#create
export enum InteractiveToolType {
  Point = 'point',
  Polyline = 'polyline',
  Rectangle = 'rectangle',
  Circle = 'circle',
  Polygon = 'polygon'
}

export interface InteractiveTools {
  tools: InteractiveToolType[]
  partiallyWithin: boolean
}

export type IMInteractiveTools = ImmutableObject<InteractiveTools>

export function getDefaultInteractiveTools (): InteractiveTools {
  return {
    tools: [InteractiveToolType.Rectangle],
    partiallyWithin: true
  }
}

export interface Config {
  useMap: boolean

  // data sources info,  dataAttributeInfo is used when useMap is false
  dataAttributeInfo: DataAttributeInfo

  // layers info, mapInfo is used when useMap is true
  mapInfo: MapInfo

  // interactiveTools is used when useMap is true
  interactiveTools: InteractiveTools

  // spatialSelection is used for both useMap true and useMap false
  spatialSelection: SpatialSelection
}

export type IMConfig = ImmutableObject<Config>

/**
 * fill the missing attributes of config
 * @param config
 */
export function fillConfigWithDefaultValues (config: IMConfig): IMConfig {
  if (!config.dataAttributeInfo) {
    config = config.set('dataAttributeInfo', getDefaultDataAttributeInfo())
  }

  if (!config.mapInfo) {
    config = config.set('mapInfo', getDefaultMapInfo())
  }

  if (!config.interactiveTools) {
    config = config.set('interactiveTools', getDefaultInteractiveTools())
  }

  if (!config.spatialSelection) {
    config = config.set('spatialSelection', getDefaultSpatialSelection())
  }

  return config
}
