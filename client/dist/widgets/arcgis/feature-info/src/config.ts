import type { ImmutableObject } from 'jimu-core'
import type { LinearUnit } from 'jimu-ui'

export enum StyleType {
  syncWithTheme = 'syncWithTheme',
  usePopupDefined = 'usePopupDefined',
  custom = 'custom'
}

export enum FontSizeType {
  auto = 'auto',
  custom = 'custom'
}

export interface StyleConfig {
  textColor: string
  fontSizeType: FontSizeType
  fontSize: LinearUnit
  backgroundColor: string
}

export interface ContentConfig {
  title: boolean
  fields: boolean
  media: boolean
  attachments: boolean
  lastEditInfo: boolean
}

export interface DSConfig {
  id: string
  label: string
  useDataSourceId: string
  contentConfig: ContentConfig
}

export interface Config {
  useMapWidget?: boolean
  limitGraphics: boolean
  maxGraphics: number
  noDataMessage: string
  styleType: StyleType
  style: StyleConfig
  dsNavigator: boolean
  featureNavigator: boolean
  showCount: boolean
  clearSelection: boolean
  dsConfigs: DSConfig[]
  //dsConfigsOfMapWidget?: DSConfig[]
}

export type IMConfig = ImmutableObject<Config>
