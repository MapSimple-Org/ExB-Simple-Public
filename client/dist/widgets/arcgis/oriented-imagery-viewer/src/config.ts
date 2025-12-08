import type OrientedImageryLayer from '@arcgis/core/layers/OrientedImageryLayer'
import type OrientedImageryViewer from '@arcgis/core/widgets/OrientedImageryViewer'
import type { ImmutableObject } from 'jimu-core'
import type defaultI18nSettingMessages from './setting/translations/default'

export interface SettingInfo {
  name: keyof Config
  labelKey: keyof typeof defaultI18nSettingMessages
  subTools?: SettingInfo[]
}

interface OiViewerVisibleElements {
  title: boolean
  closeButton: boolean
  imageGallery: boolean
  viewerTools: boolean
  imageEnhancement: boolean
  navigationTool: boolean
  directionalNavigation: boolean
  sequentialNavigation: boolean
  coverageMenu: boolean
  mapImageConversionTool: boolean
  showPopupsAction: boolean
  measurementTools: boolean
  imageOverlays: boolean
}

export interface OiViewerWithVisibleElements extends OrientedImageryViewer {
  dataCaptureEnabled: boolean
  visibleElements: OiViewerVisibleElements
}

export interface OiLayerInstance {
  id: string
  layer: OrientedImageryLayer
}

export interface Config {
  viewerToolsEnabled: boolean
  imageEnahncementEnabled: boolean
  imageGalleryEnabled: boolean
  mapImageConversionToolEnabled: boolean
  showPopupsActionEnabled: boolean
  navigationToolEnabled: boolean
  directionalNavigationEnabled: boolean
  sequentialNavigationEnabled: boolean
  measurementToolsEnabled: boolean
  imageOverlaysEnabled: boolean
  dataCaptureEnabled: boolean
  navigateToExtentEnabled: boolean
}

export type IMConfig = ImmutableObject<Config>
