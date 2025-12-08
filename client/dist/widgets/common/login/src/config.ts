import type { ImmutableObject, ThemeButtonType, IconProps, IconResult, LinkParam } from 'jimu-core'
import type { StyleSettings } from 'jimu-ui'

export type IMConfig = ImmutableObject<Config>

export enum QuickStyleMode {
  default = 'DEFAULT',
  iconOnly = 'ICON_ONLY',
  labelOnly = 'LABEL_ONLY',
  linkLabelOnly = 'LINK_LABEL_ONLY'
}

export interface Config {
  functionConfig: FunctionConfig
  styleConfig?: StyleConfig
}

export interface FunctionConfig {
  usePopupLogin?: boolean
  afterLoginLinkParam?: LinkParam
  afterLogoutLinkParam?: LinkParam

  loginOptions?: LoginOptions

  quickStyleMode?: QuickStyleMode
  icon?: IconConfig
  /**
   * customIcons is used for developers to set certain icons as preset icons, it could not be uploaded in the builder.
   * These custom icons can't be delete.
   */
  customIcons?: IconResult[]

}

export interface LoginOptions {
  useAdvanceLogin: boolean
  username: boolean
  userAvatar: boolean
  userProfile: boolean
  userSetting: boolean
  //userExperiences : boolean
  resourceCredentialList: boolean
  links: LinkInfo[]
}

export interface LinkInfo {
  id: string
  label: string
  url: string
}

export enum IconPosition {
  Left = 'LEFT',
  Right = 'RIGHT'
}

export interface IconConfig {
  data: IconResult
  position: IconPosition
}

export interface StyleConfig {
  themeStyle?: ThemeStyle
  customStyle?: CustomStyle
}

export interface ThemeStyle {
  quickStyleType: ThemeButtonType
}

export interface CustomStyle {
  regular: AdvanceStyleSettings
  hover: AdvanceStyleSettings
  dropdownRegular?: AdvanceStyleSettings
  dropdownHover?: AdvanceStyleSettings
}

export interface AdvanceStyleSettings extends StyleSettings {
  iconProps?: IconProps
}

export interface WidgetState {
  isConfiguringHover?: boolean
  isLogoutMode?: boolean
}

export type IMAdvanceStyleSettings = ImmutableObject<AdvanceStyleSettings>

export type IMIconProps = ImmutableObject<IconProps>

export type IMCustomStyle = ImmutableObject<CustomStyle>

export type IMThemeStyle = ImmutableObject<ThemeStyle>

export type IMStyleConfig = ImmutableObject<StyleConfig>

export type IMIconPosition = ImmutableObject<IconPosition>

export type IMIconConfig = ImmutableObject<IconConfig>

export type IMWidgetState = ImmutableObject<WidgetState>

export type IMLoginOptions = ImmutableObject<LoginOptions>
