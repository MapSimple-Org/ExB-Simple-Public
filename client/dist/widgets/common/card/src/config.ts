import type { FillType, BorderStyle, ImageParam, FourSidesUnit, BoxShadowStyle } from 'jimu-ui'

import { type AnimationSetting, TransitionType, TransitionDirection, type ImmutableObject, type IMLinkParam } from 'jimu-core'

export enum CardLayout {
  AUTO = 'Auto',
  CUSTOM = 'Custom'
}

export const defaultTransitionInfo = {
  transition: {
    type: TransitionType.None,
    direction: TransitionDirection.Horizontal
  },
  oneByOneEffect: null
}

export interface WidgetStyle {
  id: string
}

export enum ItemStyle {
  Style0 = 'STYLE0',
  Style1 = 'STYLE1',
  Style2 = 'STYLE2',
  Style3 = 'STYLE3',
  Style4 = 'STYLE4',
  Style5 = 'STYLE5',
  Style6 = 'STYLE6',
  Style7 = 'STYLE7',
  Style8 = 'STYLE8',
  Style9 = 'STYLE9',
  Style10 = 'STYLE10',
}

export enum Status {
  Default = 'DEFAULT',
  Hover = 'HOVER'
}

export enum OpenSettingStatus {
  None = 'NONE',
  Default = 'DEFAULT',
  Hover = 'HOVER'
}

export enum Direction {
  Horizontal = 'Horizontal',
  Vertical = 'Vertical'
}

interface CardBorderStyle {
  border?: BorderStyle
  borderLeft?: BorderStyle
  borderRight?: BorderStyle
  borderTop?: BorderStyle
  borderBottom?: BorderStyle
}
export interface CardBackgroundStyle {
  background: {
    color: string
    fillType: FillType
    image: ImageParam
  }
  border: CardBorderStyle
  borderRadius: FourSidesUnit
  boxShadow: BoxShadowStyle
  textColor?: string
}

export type IMCardBackgroundStyle = ImmutableObject<CardBackgroundStyle>

export interface CardConfig {
  backgroundStyle?: CardBackgroundStyle
  enable?: boolean
}

export interface ElementSize {
  height: number
  width: number
}

export interface Transition {
  type: TransitionType
  direction: TransitionDirection
}

export interface TransitionInfo {
  transition: Transition
  oneByOneEffect: AnimationSetting
  previewId: number
}

export type IMTransitionInfo = ImmutableObject<TransitionInfo>

export interface Config {
  builderStatus: Status
  itemStyle?: ItemStyle
  style?: ImmutableObject<WidgetStyle>
  // link
  linkParam?: IMLinkParam

  isItemStyleConfirm?: boolean// Is Confirm select template
  isInitialed?: boolean
  isOpenAdvabceSetting?: boolean
  REGULAR: ImmutableObject<CardConfig>
  HOVER: ImmutableObject<CardConfig>
  direction?: Direction
  transitionInfo?: TransitionInfo
  cardLayout?: CardLayout
}

export type IMConfig = ImmutableObject<Config>
