import type { ImmutableObject } from 'jimu-core'
import type { MeasurementsUnitsInfo, DrawingElevationMode3D, MeasurementsPropsInfo, DrawOptionsInfo } from 'jimu-ui/advanced/map'

export enum Arrangement {
  Panel = 'Panel',
  Toolbar = 'Toolbar'
}

export enum DrawMode {
  Continuous = 'continuous',
  Update = 'update'
}

export enum DrawingTool {
  Point = 'point',
  //Multipoint = 'multipoint'
  Polyline = 'polyline',
  Polygon = 'polygon',
  Rectangle = 'rectangle',
  Circle = 'circle',
  Text = 'text',
  FreehandPolyline = "freehandPolyline",
  FreehandPolygon = "freehandPolygon"
}

// for groupLayer listMode
export enum LayerListMode {
  Show = 'show',
  Hide = 'hide'
  //,HideChildren = 'hide-children'
}

export interface Config {
  isDisplayCanvasLayer: boolean
  arrangement: Arrangement
  drawMode: DrawMode
  drawingTools: DrawingTool[]

  layerListMode: LayerListMode

  measurementsInfo: MeasurementsPropsInfo
  measurementsUnitsInfos: MeasurementsUnitsInfo[]

  drawOptions: DrawOptionsInfo
  //isEnableAdvancedSetting: boolean
  drawingElevationMode3D: DrawingElevationMode3D
}

export type IMConfig = ImmutableObject<Config>
