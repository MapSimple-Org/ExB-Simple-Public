import type { ImmutableObject } from 'jimu-core'
import type { IMViewNavigationDisplay } from './runtime/components/view-navigation'

export interface IMWidgetState {
  showManageViews: boolean
}

export enum ViewType {
  Auto = 'AUTO',
  Custom = 'CUSTOM'
}

export interface ViewNavigationData {
  section: string
  type: ViewType
  views?: string[]
}

export type IMViewNavigationData = ImmutableObject<ViewNavigationData>

export interface Config {
  data: IMViewNavigationData
  display: IMViewNavigationDisplay
}

export type IMConfig = ImmutableObject<Config>

export interface NavArrowColor {
  default?: string
  hover?: string
  disabled?: string
}
