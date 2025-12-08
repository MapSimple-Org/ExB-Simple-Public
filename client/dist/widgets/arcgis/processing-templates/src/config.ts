import type { ImmutableObject } from 'seamless-immutable'
export interface CustomizeLayerOptions {
  [jimuMapViewId: string]: {
    isEnabled: boolean
    selectedLayerViewIds: string[]
  }
}
export interface Config {
  customizeLayersOptions?: CustomizeLayerOptions
}

export type IMConfig = ImmutableObject<Config>

export type IMCustomizeLayerOptions = ImmutableObject<CustomizeLayerOptions>

export type QualifiedLayer = __esri.ImageryLayer | __esri.ImageryTileLayer
