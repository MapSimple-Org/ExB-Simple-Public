import type { ImmutableObject } from 'jimu-core'
import type { LinearUnit } from 'jimu-ui'

export interface Config {
  swipeStyle?: SwipeStyle
  swipeMode?: SwipeMode
  styleConfig?: StyleConfig
  mapUseDataSourcesOrderList?: string[]
  swipeMapViewList?: { [mapViewId: string]: LayersOption }
  scrollMapViewList?: { [mapViewId: string]: string[] }
}
export type IMConfig = ImmutableObject<Config>

export interface StyleConfig {
  sliderPosition?: LinearUnit
  dividerColor?: string
  handleColor?: string
  isAllowDeactivateLayers?: boolean
  defaultActivation?: boolean
  detailsVisibility?: boolean
  toggleLayerVisibility?: boolean
}

export interface LayersOption {
  leadingLayersId: string[]
  trailingLayersId: string[]
}

export enum SwipeStyle {
  SimpleHorizontal = 'SIMPLE_HORIZONTAL',
  SimpleVertical = 'SIMPLE_VERTICAL',
  AdvancedHorizontal = 'ADVANCED_HORIZONTAL',
  AdvancedVertical = 'ADVANCED_VERTICAL',
}

export enum SwipeMode {
  SwipeBetweenLayers = 'SWIPE_BETWEEN_LAYERS_OF_ONE_MAP',
  SwipeBetweenMaps = 'SWIPE_BETWEEN_WEBMAPS_OR_WEBSCENES'
}

export interface LayerInfo {
  layerId: string
  title: string
  selected: boolean
  visible: boolean
  allowOperation: boolean
}
