import type { ImmutableObject } from 'seamless-immutable'
import type {
  FillType,
  ImageParam,
  BorderStyle,
  FourSidesUnit,
  BoxShadowStyle,
  LinearUnit,
  TextAlignValue
} from 'jimu-ui'
import type { DataRecord, ImmutableArray, UseDataSource, DynamicStyleConfig, DynamicStyle, IMThemeVariables, SqlExpression, IMLinkParam, AllWidgetProps, AppMode, BrowserSizeMode, LayoutType, IMUrlParameters, BoundingBox, PageMode } from 'jimu-core'
import type { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'
import type { SortSettingOption } from 'jimu-ui/advanced/setting-components'

export interface Props {
  selectionIsSelf: boolean
  selectionIsInSelf: boolean
  selectionStatus: Status
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  builderStatus: Status
  isRTL: boolean
  subLayoutType: LayoutType
  left: number | string
  top: number | string
  isWidthAuto: boolean
  isHeightAuto: boolean
  showLoadingWhenConfirmSelectTemplate: boolean
  queryObject: IMUrlParameters
  boundingBox: BoundingBox
  heightLayoutItemSizeModes: LayoutItemSizeModes
  parentSize: ElementSize
  pageMode: PageMode
  activeSort: boolean
}

export type ListProps = AllWidgetProps<IMConfig> & Props
export { type SortSettingOption }

export enum ListLayout {
  AUTO = 'Auto',
  CUSTOM = 'Custom'
}

// TODO: move to core
export interface gotoProps {
  views: string[]
}
export interface gotoAction {
  goto: gotoProps
}

export interface Suggestion {
  suggestionHtml: string | Element
  suggestion: string
}

export const LIST_CARD_PADDING = 0
export const LIST_CARD_MIN_SIZE = 20
export const DS_TOOL_H = 42
export const BOTTOM_TOOL_H = 40
export const COMMON_PADDING = 0
export const DS_TOOL_BOTTOM_PADDING = 14
export const BOTTOM_TOOL_TOP_PADDING = 14
export const LIST_TOOL_MIN_SIZE_NO_DATA_ACTION = 175
export const LIST_TOOL_MIN_SIZE_DATA_ACTION = 250
export const LIST_AUTO_REFRESH_INFO_SWITCH_SIZE = 321
export const DEFAULT_CARD_SIZE = 200
export const DEFAULT_SPACE = 10
export const SCROLL_BAR_WIDTH = 8
export const MAX_PAGE_SIZE = 2000
export const MAX_ITEMS_PER_PAGE = 200

export enum SettingCollapseType {
  None = 'NONE',
  Arrangement = 'ARRANGEMENT',
  States = 'STATES',
  Tools = 'TOOLS'
}

interface WidgetHeaderTitle {
  text: string
  // Add color, size, alignment, etc.
  // Add an option to bind text to a field
}

export interface WidgetHeader {
  title: ImmutableObject<WidgetHeaderTitle>
  // TODO:
  // Add "action" such as filter
}

export interface ListDivSize {
  clientWidth: number
  clientHeight: number
}

export interface WidgetStyle {
  id: string
}
// END: TODO

export interface ListItemData {
  columnIndex?: number
  rowIndex?: number
  previewDynamicStyle?: boolean

  hideCardTool: boolean
  selectionIsList: boolean
  selectionIsInList: boolean
  isEditing: boolean
  builderStatus: Status,
  changeIsResizingCard: (isResizingCard: boolean) => void

  dynamicStyleOfCard?: IMDynamicStyleOfCard
  useDataSources?: ImmutableArray<UseDataSource>

  index: number,
  isHover: boolean,
  record: DataRecord,
  active: boolean

  id: string
  widgetId: string
  config: IMConfig
  recordLength: number,
  widgetRect: ElementSize,
  currentCardSize: ElementSize,
  handleListMouseMove: (itemIndex: number) => void,
  handleListMouseLeave: () => void,

  browserSizeMode: BrowserSizeMode,
  isRTL: boolean,
  builderSupportModules: any,
  interact: any,
  appMode: AppMode,
  theme: IMThemeVariables,
  LayoutEntry: any,
  layouts: any,
  datasourceId: string,
  isWidthPercentage: boolean,
  formatMessage: any,
  selectCard: () => void,
  handleResizeCard: (newCardSize: any, resizeEnd?: boolean, isTop?: boolean, isLeft?: boolean, isReplace?: boolean) => void,
  onChange: (itemRecord: DataRecord) => void,
  updateCanClickLinkWhenClickItem: (itemRecord: DataRecord) => void,
  updateCardToolPosition: () => void
}

export interface DynamicStyleOfCard {
  [status: string]: DynamicStyle
}

export type IMDynamicStyleOfCard = ImmutableObject<DynamicStyleOfCard>

export enum SelectionModeType {
  None = 'NONE',
  Single = 'SINGLE',
  Multiple = 'MULTIPLE'
}

export enum PageStyle {
  Scroll = 'SCROLL',
  MultiPage = 'MULTIPAGE'
}

export enum AlignType {
  Start = 'FLEX-START',
  Center = 'CENTER',
  End = 'FLEX-END'
}

export enum DirectionType {
  Horizon = 'HORIZON',
  Vertical = 'VERTICAL'
}

export enum ListLayoutType {
  Row = 'ROW',
  Column = 'COLUMN',
  GRID = 'GRID'
}

export enum PageTransitionType {
  Glide = 'GLIDE',
  Fade = 'FADE',
  Float = 'FLOAT'
}

export enum HoverType {
  Hover0 = 'HOVER0',
  Hover1 = 'HOVER1',
  Hover2 = 'HOVER2',
  Hover3 = 'HOVER3'
}

export enum SelectedStyle {
  Style0 = 'STYLE0',
  Style1 = 'STYLE1',
  Style2 = 'STYLE2',
  Style3 = 'STYLE3'
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
  Style11 = 'STYLE11',
  Style12 = 'STYLE12'
}

export enum Status {
  Default = 'DEFAULT',
  Selected = 'SELECTED',
  Hover = 'HOVER'
}

export interface CardSize {
  height: number | string
  width: number | string
}

export interface ElementSize {
  height: number
  width: number
}

export interface ElementSizeUnit {
  height: LinearUnit
  width: LinearUnit
}

export interface DeviceCardSize {
  [deviceMode: string]: CardSize
}

export interface WidgetRect {
  width: number
  height: number
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
  textColor?: string
  border: CardBorderStyle
  borderRadius: FourSidesUnit
  boxShadow: BoxShadowStyle
}

export type IMCardBackgroundStyle = ImmutableObject<CardBackgroundStyle>

export interface CardConfig {
  backgroundStyle?: CardBackgroundStyle
  textColor?: string
  enable?: boolean
  selectionMode?: SelectionModeType
  cardSize?: DeviceCardSize
  listLayout?: ListLayout
  enableDynamicStyle?: boolean
  dynamicStyleConfig?: DynamicStyleConfig
}

export type IMCardConfig = ImmutableObject<CardConfig>

export interface Config {
  pageTransition?: PageTransitionType
  hoverType?: HoverType
  selectedStyle?: SelectedStyle
  differentOddEven?: boolean
  itemStyle?: ItemStyle
  isCheckEmptyTemplate?: boolean
  isItemStyleConfirm?: boolean
  direction?: DirectionType
  alignType?: AlignType
  space?: number
  horizontalSpace?: number
  verticalSpace?: number
  itemsPerPage?: number
  pageStyle?: PageStyle
  scrollBarOpen?: boolean
  navigatorOpen?: boolean
  scrollStep?: number
  style?: ImmutableObject<WidgetStyle>
  isInitialed?: boolean
  lockItemRatio?: boolean
  showSelectedOnlyOpen?: boolean
  showClearSelected?: boolean
  gridAlignment?: TextAlignValue

  showRefresh?: boolean

  // link
  linkParam?: IMLinkParam

  // search
  searchOpen?: boolean
  searchFields?: string[]
  searchExact?: boolean
  // filter
  filterOpen?: boolean
  filter?: SqlExpression
  // sort
  sortOpen?: boolean
  sorts?: SortSettingOption[]

  // card background
  cardConfigs?: ImmutableObject<{ [status: string]: CardConfig }>
  searchHint?: string

  isShowAutoRefresh?: boolean
  noDataMessage?: string
  layoutType?: ListLayoutType
  keepAspectRatio?: boolean
  gridItemSizeRatio?: number

  showRecordCount?: boolean
  hidePageTotal?: boolean
}

export type IMConfig = ImmutableObject<Config>
