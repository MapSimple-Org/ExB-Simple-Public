import type { ImmutableObject } from 'jimu-core'
import type { basemapUtils } from 'jimu-arcgis'
import type { ImageParam } from 'jimu-ui'
export enum BasemapsType {
  Organization = 'ORGANIZATION',
  Custom = 'CUSTOM'
}

export interface BasemapFromUrl {
  id: string
  title: string
  thumbnail?: ImageParam
  layerUrls: string[]
  disablePopup?: boolean
}

export type BasemapInfo = basemapUtils.BasemapItem | BasemapFromUrl

export interface Config {
  customBasemaps?: BasemapInfo[]
  basemapsType?: BasemapsType
}

export type IMConfig = ImmutableObject<Config>

export interface GroupInfo {
  id: string
  title: string
  isUserGroup?: boolean
}
