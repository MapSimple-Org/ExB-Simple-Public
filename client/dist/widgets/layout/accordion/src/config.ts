import type { IconResult } from 'jimu-core'

export interface HeaderConfig {
  expandIcon?: IconResult
  collapseIcon?: IconResult
  togglePosition?: string
  showWidgetIcon?: boolean
  widgetIconSize?: number
  widgetIconColor?: string

  textStyle?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strike?: boolean
    color?: string
    size?: string
  }
  padding?: {
    number: number[]
    unit: string
  }
  border?: any
  borderTop?: any
  borderLeft?: any
  borderRight?: any
  borderBottom?: any
  borderRadius?: any
  collapsedColor?: string
  expandedColor?: string
}

export interface Config {
  useQuickStyle?: number
  gap?: number
  padding?: {
    number: number[]
    unit: string
  }
  header?: HeaderConfig
  panel?: {
    padding?: {
      number: number[]
      unit: string
    }
    backgroundColor?: string
    textColor?: string
    border?: any
    borderTop?: any
    borderLeft?: any
    borderRight?: any
    borderBottom?: any
    borderRadius?: any
  }
  singleMode?: boolean
  showToggleAll?: boolean
  expandedItems?: string[]
}
