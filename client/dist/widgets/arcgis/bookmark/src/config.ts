import type { ImageParam, ImageFillMode, LinearUnit, FontFamilyValue } from 'jimu-ui'
import type { AnimationSetting, TransitionType, TransitionDirection, ImmutableObject } from 'jimu-core'

export interface WidgetStyle {
  id: string
}

export enum DirectionType {
  Horizon = 'HORIZON',
  Vertical = 'VERTICAL'
}

export enum PageStyle {
  Scroll = 'SCROLL',
  Paging = 'PAGING'
}

export enum DisplayType {
  All = 'ALL',
  Selected = 'SELECTED'
}

export enum TemplateType {
  Card = 'CARD',
  List = 'LIST',
  Slide1 = 'SLIDE1',
  Slide2 = 'SLIDE2',
  Slide3 = 'SLIDE3',
  Gallery = 'GALLERY',
  Navigator = 'NAVIGATOR',
  Custom1 = 'CUSTOM1',
  Custom2 = 'CUSTOM2',
}

export enum Status {
  Default = 'DEFAULT',
  Regular = 'REGULAR',
  Hover = 'HOVER'
}

export enum ImgSourceType {
  Snapshot = 'SNAPSHOT',
  Custom = 'CUSTOM',
}

export enum ItemSizeType {
  HonorMap = 'HONOR_MAP',
  Custom = 'CUSTOM'
}
export interface Transition {
  type: TransitionType
  direction: TransitionDirection
}

export interface TransitionInfo {
  transition: Transition
  effect: AnimationSetting
  oneByOneEffect: AnimationSetting
  previewId: number
}

export interface LayersConfig {
  [layerId: string]: {
    visibility?: boolean
    layers?: LayersConfig
  }
}

export interface ElementSize {
  height: number
  width: number
}

export interface ElementSizeUnit {
  width: LinearUnit
  height: LinearUnit
}

export interface IFontStyles {
  style?: 'italic' | 'normal'
  weight?: 'bold' | 'normal'
  decoration?: 'line-through' | 'none' | 'underline' // Keep this for compatibility with old apps created in 2024R03
  strike?: 'line-through' | 'none'
  underline?: 'underline' | 'none'
}

export interface BookmarkTextStyle {
  fontFamily: FontFamilyValue
  fontStyles: IFontStyles
  fontColor: string
  fontSize: string
}

export interface Bookmark {
  id: number | string
  name: string
  title?: string
  description?: string
  type: '2d' | '3d'
  imgParam?: ImageParam
  snapParam?: ImageParam
  imagePosition?: ImageFillMode
  imgSourceType?: ImgSourceType
  extent?: __esri.Extent
  viewpoint?: __esri.Viewpoint
  graphics?: __esri.Graphic[]
  showFlag?: boolean
  mapDataSourceId: string
  customLayout?: any
  runTimeFlag?: boolean
  mapOriginFlag?: boolean
  visibleLayers?: any[]
  layoutId?: string
  layoutName?: string
  layersConfig?: LayersConfig
  baseMap?: any // This field reads from existing bookmark data
  ground?: any // This field reads from existing bookmark data
  environment?: __esri.SceneViewEnvironment // This field reads from existing bookmark data
  timeExtent?: __esri.TimeExtentProperties // This field reads from existing bookmark data
}

export interface Config {
  templateType?: TemplateType
  isTemplateConfirm?: boolean
  style?: ImmutableObject<WidgetStyle>
  isInitialed?: boolean
  bookmarks: Bookmark[]
  initBookmark?: boolean
  runtimeAddAllow?: boolean
  displayFromWeb?: boolean
  ignoreLayerVisibility?: boolean
  autoPlayAllow?: boolean
  autoInterval?: number
  autoLoopAllow?: boolean
  direction?: DirectionType
  pageStyle?: PageStyle
  space?: number
  scrollBarOpen?: boolean
  navigatorOpen?: boolean
  transition?: TransitionType
  transitionDirection?: TransitionDirection
  displayType?: DisplayType
  itemHeight?: number
  itemWidth?: number
  galleryItemHeight?: number
  galleryItemWidth?: number
  galleryItemSpace?: number
  transitionInfo?: TransitionInfo
  cardBackground?: string
  displayName?: boolean
  hideIcon?: boolean
  //Card(Grid) template config
  cardItemWidth?: number | string
  cardItemHeight?: number | string
  keepAspectRatio?: boolean
  cardItemSizeRatio?: number

  itemSizeType?: ItemSizeType
  //Text style
  cardNameStyle?: BookmarkTextStyle
  slidesNameStyle: BookmarkTextStyle
  slidesDescriptionStyle?: BookmarkTextStyle
}

export type IMConfig = ImmutableObject<Config>
