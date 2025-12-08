import type { ImmutableObject } from 'jimu-core'

export interface CustomizeLayerOptions {
  [jimuMapViewId: string]: {
    isEnabled: boolean
    selectedLayerViewIds: string[]
  }
}

export interface Config {
  enableAttributeFilter: boolean,
  enableSpatialFilter: boolean,
  enableImageTypeFilter: boolean,
  enableSort: boolean,
  enableListSettings: boolean,
  enableViewImageDetails: boolean,
  enableZoomTo: boolean,
  enableAddToMap: boolean,
  maxImageItemCountPerPage: number,
   customizeLayersOptions?: CustomizeLayerOptions
}

export type IMConfig = ImmutableObject<Config>

export type IMCustomizeLayerOptions = ImmutableObject<CustomizeLayerOptions>
