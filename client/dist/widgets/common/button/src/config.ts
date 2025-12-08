import type { ImmutableObject, Expression, ThemeButtonType, IconProps, IconResult, LinkParam ,DynamicStyleConfig } from 'jimu-core'
import type { StyleSettings } from 'jimu-ui'

export type IMConfig = ImmutableObject<Config>

export interface Config {
  functionConfig: FunctionConfig
  styleConfig?: StyleConfig
}

export interface FunctionConfig {
  toolTip?: string
  text?: string
  icon?: IconConfig
  /**
   * customIcons is used for developers to set certain icons as preset icons, it could not be uploaded in the builder.
   * These custom icons can't be delete.
   */
  customIcons?: IconResult[]
  textExpression?: Expression
  toolTipExpression?: Expression
  linkParam?: LinkParam
}

export enum IconPosition {
  Left = 'LEFT',
  Right = 'RIGHT'
}

export interface IconConfig {
  data?: IconResult
  position?: IconPosition
}

export interface StyleConfig {
  useCustom: boolean
  themeStyle?: ThemeStyle
  customStyle?: CustomStyle
}

export interface ThemeStyle {
  quickStyleType: ThemeButtonType
}

export interface CustomStyle {
  regular: AdvanceStyleSettings
  hover: AdvanceStyleSettings
}

export interface AdvanceStyleSettings extends StyleSettings {
  iconProps?: IconProps
  enableDynamicStyle?: boolean
  dynamicStyleConfig?: DynamicStyleConfig
}

export interface WidgetState {
  isConfiguringHover?: boolean
}

export type IMAdvanceStyleSettings = ImmutableObject<AdvanceStyleSettings>

export type IMIconProps = ImmutableObject<IconProps>

export type IMCustomStyle = ImmutableObject<CustomStyle>

export type IMThemeStyle = ImmutableObject<ThemeStyle>

export type IMStyleConfig = ImmutableObject<StyleConfig>

export type IMIconPosition = ImmutableObject<IconPosition>

export type IMIconConfig = ImmutableObject<IconConfig>

export type IMWidgetState = ImmutableObject<WidgetState>
