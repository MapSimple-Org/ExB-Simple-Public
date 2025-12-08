import type { ImmutableObject } from 'jimu-core'
import type { BackgroundStyle } from 'jimu-ui'

export enum ELegendMode {
  ShowVisible = 'show-visible',
  ShowWithinExtent = 'show-within-extent',
  ShowAll = 'show-all'
}

export interface Style {
  useCustom: boolean
  background: BackgroundStyle
  fontColor: string
}

export interface Config {
  showBaseMap?: boolean
  cardStyle?: boolean
  cardLayout?: 'auto' | 'side-by-side' | 'stack'
  legendMode?: ELegendMode
  respectLayerDefinitionExp?: boolean
  style: Style
  customizeLayerOptions?: {
    [jimuMapViewId: string]: CustomizeLayerOption
  }
}

export interface CustomizeLayerOption {
  isEnabled: boolean
  showRuntimeAddedLayers?: boolean
  showJimuLayerViewIds?: string[]
}

export type IMConfig = ImmutableObject<Config>
