import type { ImmutableObject, Size, UseDataSource, ThemeBoxStyles } from 'jimu-core'
import type { ButtonProps, BoxShadowStyle } from 'jimu-ui'

export enum DisplayType {
  Stack = 'STACK',
  SideBySide = 'SIDEBYSIDE'
}

export type ControllerButtonStyle = Omit<ThemeBoxStyles, 'shadow'> & {
  // The color property in ThemeBoxStyles is used as the labels' color,
  // so another property iconColor is added to store the icons' color
  iconColor?: string
  // The shadow property is a combined string(e.g. shadow-box: 2px 2px 1px 1px red;), which is hard to handle the default case
  boxShadow?: BoxShadowStyle
}

export interface ControllerButtonStylesByState {
  default?: ControllerButtonStyle
  hover?: ControllerButtonStyle
  active?: ControllerButtonStyle
}

export type IMControllerButtonStylesByState = ImmutableObject<ControllerButtonStylesByState>

export interface AvatarProps {
  size: ButtonProps['size'] | 'custom'
  type: ButtonProps['type']
  shape: 'circle' | 'rectangle'
  iconSize?: number
  buttonSize?: number
}

export type IMAvatarProps = ImmutableObject<AvatarProps>

export interface AvatarCardConfig {
  showLabel?: boolean
  showIndicator?: boolean
  showTooltip?: boolean
  labelGrowth?: number
  avatar: AvatarProps
  variant?: ControllerButtonStylesByState
}

export type IMAvatarCardConfig = ImmutableObject<AvatarCardConfig>

export interface SizeMap {
  [x: string]: Size
}

export type IMSizeMap = ImmutableObject<SizeMap>

export enum ControllerAlignment {
  Center = 'center',
  Start = 'start',
  End = 'end'
}

export enum OverflownStyle {
  Arrows = 'ARROWS',
  PopupWindow = 'POPUP_WINDOW'
}

export interface Config {
  behavior: {
    onlyOpenOne: boolean
    openStarts: string[]
    arrangement: 'floating' | 'fixed'
    displayType: DisplayType
    vertical: boolean
    size: SizeMap
    alignment: ControllerAlignment
    overflownStyle: OverflownStyle
  }
  appearance: {
    space: number
    advanced: boolean
    card: AvatarCardConfig
  }
}

export type IMConfig = ImmutableObject<Config>

export interface ActionConfig {
  widgetIds: string[]
  useDataSources?: UseDataSource[]
}

export type IMActionConfig = ImmutableObject<ActionConfig>
