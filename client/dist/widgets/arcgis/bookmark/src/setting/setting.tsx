/** @jsx jsx */
import {
  classNames, Immutable, type IMState, React, type IMAppConfig, jsx,
  type IMThemeVariables, type ImmutableArray, type BrowserSizeMode, LayoutType,
  defaultMessages as jimuCoreMessages, type LayoutInfo, type TransitionType, type TransitionDirection, getNextAnimationId, LayoutParentType,
  focusElementInKeyboardMode, getAppStore
} from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages, utils } from 'jimu-layouts/layout-runtime'
import { type AllWidgetSettingProps, getAppConfigAction, templateUtils, builderAppSync, widgetService } from 'jimu-for-builder'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { MarkPopper } from './components/mark-popper'
import {
  Checkbox, Icon, Button, defaultMessages as jimuUIDefaultMessages,
  NumericInput, AdvancedButtonGroup, Select, Slider, Tooltip, Switch, ConfirmDialog, CollapsablePanel,
  Label
} from 'jimu-ui'
import { type IMConfig, TemplateType, type Bookmark, DirectionType, PageStyle, DisplayType, Status, type Transition, type ElementSize } from '../config'
import defaultMessages from './translations/default'
import { Fragment } from 'react'
import type { Template } from 'jimu-for-builder/templates'
import { TransitionSetting } from 'jimu-ui/advanced/style-setting-components'
import { getStyle, getNextButtonStyle } from './style'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { ArrowRightOutlined } from 'jimu-icons/outlined/directional/arrow-right'
import { ArrowDownOutlined } from 'jimu-icons/outlined/directional/arrow-down'
import { BookmarkList } from './components/bookmark-list'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { getDefaultConfig } from '../utils'
import { ITEM_MIN_SIZE, OLD_CARD_TEMPLATE_WIDTH, OLD_GALLERY_TEMPLATE_WIDTH } from '../constants'
import { CardArrangementSetting } from './components/arrangement/card-arrangement-setting'
import { GalleryArrangementSetting } from './components/arrangement/gallery-arrangement-setting'
import { TextStyleSetting } from './components/text-style-setting'

const prefix = 'jimu-widget-'

const defaultConfig = require('../../config.json')
const directions = [
  { icon: 'right', value: DirectionType.Horizon },
  { icon: 'down', value: DirectionType.Vertical }
]
const originAllStyles = {
  CUSTOM1: require('./template/mark-styleCustom1.json'),
  CUSTOM2: require('./template/mark-styleCustom2.json')
}

let AllStyles: { [key: string]: Template }

function initStyles (widgetId: string) {
  if (AllStyles) {
    return AllStyles
  }
  const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
  AllStyles = {}
  Object.keys(originAllStyles).forEach(style => {
    AllStyles[style] = templateUtils.processForTemplate(originAllStyles[style], widgetId, messages)
  })
}

interface State {
  activeId: number | string
  expandedId: number | string
  showSimple: boolean
  showAdvance: boolean
  showArrangement: boolean
  tempLayoutType: LayoutType
  changeCustomConfirmOpen: boolean
  isTemplateContainScroll: boolean
  templateConWidth: number
  aspectRatio: string
}

interface ExtraProps {
  appConfig: IMAppConfig
  browserSizeMode: BrowserSizeMode
  activeBookmarkId: number
  layoutInfo: LayoutInfo
  settingPanelChange: string
  widgetRect: ElementSize
  enableA11yForWidgetSettings?: boolean
}

interface CustomProps {
  theme: IMThemeVariables
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps, State> {
  markPopper = null
  templatesContainer: any
  resetButtonRef: React.RefObject<HTMLButtonElement>
  updatePositionTimeout: any
  aspectRatioRef: string

  static mapExtraStateProps = (state: IMState, props: AllWidgetSettingProps<IMConfig>) => {
    return {
      appConfig: state && state.appStateInBuilder && state.appStateInBuilder.appConfig,
      browserSizeMode: state && state.appStateInBuilder && state.appStateInBuilder.browserSizeMode,
      activeBookmarkId: state && state.appStateInBuilder?.widgetsState[props.id]?.activeBookmarkId,
      widgetRect: state?.appStateInBuilder?.widgetsState[props.id]?.widgetRect,
      layoutInfo: state && state.appStateInBuilder?.widgetsState[props.id]?.layoutInfo,
      settingPanelChange: state?.widgetsState?.[props.id]?.settingPanelChange,
      enableA11yForWidgetSettings: state?.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings
    }
  }

  static getFullConfig (config) {
    return getDefaultConfig().merge(config, { deep: true })
  }

  constructor (props) {
    super(props)
    initStyles(props.id)
    this.state = {
      activeId: 0,
      expandedId: 0,
      showSimple: true,
      showAdvance: true,
      showArrangement: true,
      tempLayoutType: LayoutType.FixedLayout,
      changeCustomConfirmOpen: false,
      isTemplateContainScroll: false,
      templateConWidth: 260,
      aspectRatio: null
    }
    this.templatesContainer = React.createRef()
    this.resetButtonRef = React.createRef()
  }

  componentDidMount () {
    this.getIsScrollAndWidthOfTemplateCon()
    window.addEventListener('resize', this.updateNextButtonPosition)
    const { config } = this.props
    // Ensure that after the gallery template is refactored, the old apps won't get regression problem. If the user just open the old app in runtime, the style will remain unchanged, if the user has clicked the bookmark widget in builder, it will change to the updated logic: resizing according to the container. (issue #20598)
    if (config.templateType === TemplateType.Gallery) {
      if (config.galleryItemWidth === undefined) {
        this.onPropertyChange('galleryItemWidth', OLD_GALLERY_TEMPLATE_WIDTH)
      }
    }
    // Ensure that after the card template is refactored, the old apps won't get regression problem. If the user just open the old app in runtime, the style will remain unchanged, and if the user has clicked the bookmark widget in builder, it will change to the updated logic: align bookmark items center. (issue #21431)
    if (config.templateType === TemplateType.Card) {
      if (config.cardItemWidth === undefined) {
        this.onPropertyChange('cardItemWidth', OLD_CARD_TEMPLATE_WIDTH)
      }
    }
  }

  componentDidUpdate (prevProps: AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps) {
    const { activeId } = this.state
    const { settingPanelChange, activeBookmarkId = 0 } = this.props
    if (this.props.activeBookmarkId !== prevProps.activeBookmarkId) {
      if (activeBookmarkId !== activeId) {
        this.setState({ activeId: activeBookmarkId })
      }
    }
    if (settingPanelChange !== prevProps.settingPanelChange) {
      this.markPopper?.handleCloseOk()
    }
    if (settingPanelChange === 'content' && prevProps.settingPanelChange !== 'content') {
      this.updateNextButtonPosition()
    }
  }

  componentWillUnmount () {
    clearTimeout(this.updatePositionTimeout)
  }

  getIsScrollAndWidthOfTemplateCon = () => {
    const { enableA11yForWidgetSettings } = this.props
    const templateConHeight = this.templatesContainer?.current?.clientHeight || 0
    const templateConWidth = this.templatesContainer?.current?.clientWidth || 260
    const templateConParentHeight =
      this.templatesContainer?.current?.parentElement?.parentElement?.clientHeight || 0
    const isStartButtonAbsolute = (enableA11yForWidgetSettings ? templateConParentHeight - 216 : templateConParentHeight) < templateConHeight
    this.setState({
      isTemplateContainScroll: isStartButtonAbsolute,
      templateConWidth: templateConWidth
    })
  }

  onPropertyChange = (name, value) => {
    const { savedConfig, config } = this.props
    if (value === config[name]) {
      return
    }
    const newConfig = savedConfig.set(name, value)
    const alterProps = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(alterProps)
  }

  onConfigChange = (key, value) => {
    const { savedConfig } = this.props
    const newConfig = savedConfig.setIn(key, value)
    const alterProps = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(alterProps)
  }

  onTemplateTypeChanged = (style: TemplateType, updatedAppConfig = undefined) => {
    const { id } = this.props
    let { appConfig } = this.props
    const allBrowserSizeMode = Object.keys(appConfig.widgets[id]?.parent) as any
    if (updatedAppConfig) {
      appConfig = updatedAppConfig
    }
    if (style === TemplateType.Custom1 || style === TemplateType.Custom2) {
      const styleTemplate = AllStyles[style]
      widgetService.updateWidgetByTemplate(
        appConfig,
        styleTemplate,
        id,
        styleTemplate.widgetId,
        allBrowserSizeMode,
        {}
      ).then(newAppConfig => {
        this._onItemStyleChange(newAppConfig, style)
      })
    } else {
      this._onItemStyleChange(appConfig, style)
    }
  }

  handleFormChange = (evt) => {
    const target = evt.currentTarget
    if (!target) return
    const field = target.dataset.field
    const type = target.type
    let value
    switch (type) {
      case 'checkbox':
        value = target.checked
        break
      case 'select':
        value = target.value
        break
      case 'range':
        value = parseFloat(target.value)
        break
      case 'number':
        const numberType = target.dataset.numberType
        const parseNumber = numberType === 'float' ? parseFloat : parseInt
        const minValue = !!target.min && parseNumber(target.min)
        const maxValue = !!target.max && parseNumber(target.max)
        value = evt.target.value
        if (!value || value === '') return
        value = parseNumber(evt.target.value)
        if (!!minValue && value < minValue) { value = minValue }
        if (!!maxValue && value > maxValue) { value = maxValue }
        break
      default:
        value = target.value
        break
    }
    this.onPropertyChange(field, value)
  }

  handleCheckboxChange = (evt) => {
    const target = evt.currentTarget
    if (!target) return
    this.onPropertyChange(target.dataset.field, target.checked)
  }

  handleAutoInterval = (valueInt: number) => {
    this.onPropertyChange('autoInterval', valueInt)
  }

  onSwitchChanged = (checked: boolean, name: string) => {
    this.onPropertyChange(name, checked)
  }

  private readonly _onItemStyleChange = (newAppConfig, style) => {
    const { id, config: oldConfig, layoutInfo } = this.props
    const { tempLayoutType } = this.state
    const customType = [TemplateType.Custom1, TemplateType.Custom2]
    const tempWidgetSize = {
      CARD: { width: 516, height: 210 },
      LIST: { width: 300, height: 360 },
      SLIDE1: { width: 320, height: 380 },
      SLIDE2: { width: 320, height: 380 },
      SLIDE3: { width: 320, height: 380 },
      GALLERY: { width: 680, height: 150 },
      CUSTOM1: { width: 320, height: 380 },
      CUSTOM2: { width: 320, height: 380 }
    }
    let config = Immutable(defaultConfig)
    const wJson = newAppConfig.widgets[id]
    let newBookmarks
    let nextAppConfig = newAppConfig
    if (customType.includes(style)) {
      const appStateInBuilder = getAppStore().getState().appStateInBuilder
      let newOriginLayoutId = newAppConfig.widgets[id].layouts[Status.Default][appStateInBuilder.browserSizeMode || newAppConfig.mainSizeMode]
      newBookmarks = oldConfig.bookmarks.map(item => {
        const { newLayoutId, eachAppConfig } = this.duplicateLayoutsEach(newOriginLayoutId, id, `Bookmark-${item.id}`, `Bookmark-${item.id}-label`, tempLayoutType, nextAppConfig)
        nextAppConfig = eachAppConfig
        newOriginLayoutId = newLayoutId
        item = item.set('layoutName', `Bookmark-${item.id}`).set('layoutId', newLayoutId)
        return item
      })
    }
    if (customType.includes(oldConfig.templateType) && !customType.includes(style)) {
      newBookmarks = newAppConfig.widgets[id].config.bookmarks
    }
    config = config.set('templateType', style).set('bookmarks', newBookmarks || oldConfig.bookmarks).set('isTemplateConfirm', false)
      .set('runtimeAddAllow', oldConfig.runtimeAddAllow)
      .set('displayFromWeb', oldConfig.displayFromWeb)
      .set('ignoreLayerVisibility', oldConfig.ignoreLayerVisibility)
      .set('displayName', oldConfig.displayName)
    config = config.set('isInitialed', true)
    const appConfigAction = getAppConfigAction(nextAppConfig)
    const layoutType = this.getLayoutType()
    if (layoutType === LayoutType.FixedLayout) {
      appConfigAction.editLayoutItemSize(layoutInfo, tempWidgetSize[style].width, tempWidgetSize[style].height)
    }
    //If there are more than one bookmark item, delete the default layout
    if (oldConfig.bookmarks.length > 0) {
      appConfigAction.removeLayoutFromWidget(id, 'DEFAULT')
    }
    appConfigAction.editWidgetProperty(wJson.id, 'config', config).exec()
  }

  getLayoutType = (): LayoutType => {
    const { layoutInfo, appConfig } = this.props
    const layoutId = layoutInfo?.layoutId
    const layoutType = appConfig?.layouts?.[layoutId]?.type
    return layoutType
  }

  duplicateLayoutsEach = (originLayoutId: string, widgetId: string, layoutName: string, layoutLabel: string, layoutType?: LayoutType, newAppConfig?: IMAppConfig) => {
    let { appConfig } = this.props
    if (newAppConfig) appConfig = newAppConfig
    const appConfigAction = getAppConfigAction(appConfig)
    const newLayoutJson = appConfigAction.duplicateLayout(originLayoutId, true)
    appConfigAction
      .editLayoutProperty(newLayoutJson.id, 'parent', { type: LayoutParentType.Widget, id: widgetId })
      .editLayoutProperty(newLayoutJson.id, 'label', layoutLabel)
      .editWidgetProperty(widgetId, `layouts.${layoutName}.${utils.getCurrentSizeMode()}`, newLayoutJson.id)

    return { newLayoutId: newLayoutJson.id, eachAppConfig: appConfigAction.appConfig }
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreMessages, jimuLayoutsDefaultMessages)
    return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  handleTemplateTypeImageClick = evt => {
    const style = evt.currentTarget.dataset.value
    const { id, config, savedConfig, appConfig } = this.props
    const customType = [TemplateType.Custom1, TemplateType.Custom2]
    if (config.templateType === style) return
    if (customType.includes(config.templateType)) { // origin type is advanced
      let nextAppConfig = appConfig
      const newBookmarks = config.bookmarks.map(item => {
        const { layoutName } = item
        const appConfigAction = getAppConfigAction(nextAppConfig)
        const newAction = appConfigAction.removeLayoutFromWidget(id, layoutName)
        nextAppConfig = newAction.appConfig
        return item.set('layoutId', '').set('layoutName', '')
      })
      const newConfig = savedConfig.set('bookmarks', newBookmarks).set('templateType', style)
      const appConfigAction = getAppConfigAction(nextAppConfig)
      appConfigAction.removeLayoutFromWidget(id, 'DEFAULT')
      appConfigAction.editWidgetProperty(id, 'config', newConfig).exec()
      this.onTemplateTypeChanged(style, appConfigAction.appConfig)
    } else { // origin type is simple
      this.onTemplateTypeChanged(style)
    }
  }

  handleTemplateConfirmClick = () => {
    this.onPropertyChange('isTemplateConfirm', true)
    this.setState({ expandedId: 0 })
    setTimeout(() => {
      focusElementInKeyboardMode(this.resetButtonRef.current)
    }, 50)
  }

  handleResetTemplateClick = () => {
    const { config } = this.props
    if (config.templateType === TemplateType.Custom1 || config.templateType === TemplateType.Custom2) {
      this.setState({ changeCustomConfirmOpen: true })
    } else {
      this.onPropertyChange('isTemplateConfirm', false)
    }
    this.updateNextButtonPosition()
  }

  handleChangeOk = () => {
    this.onPropertyChange('isTemplateConfirm', false)
    this.updateNextButtonPosition()
    this.setState({ changeCustomConfirmOpen: false })
  }

  handleChangeClose = () => {
    this.setState({ changeCustomConfirmOpen: false })
  }

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.onPropertyChange('bookmarks', [])
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
    this.markPopper?.handleCloseOk()
  }

  showBookmarkConfig = (ref) => {
    this.markPopper = ref
  }

  onBookmarkUpdated = (updateBookmark: Bookmark) => {
    const { config } = this.props
    const oriBookmarks = config.bookmarks
    const fixIndex = oriBookmarks.findIndex(x => x.id === updateBookmark.id)
    const newBookmark = oriBookmarks.map((item, index) => {
      if (fixIndex === index) {
        return updateBookmark
      }
      return item
    })
    this.onPropertyChange('bookmarks', newBookmark)
  }

  addNewBookmark = (bookmark: Bookmark) => {
    const { config } = this.props
    const noImgType = [TemplateType.List, TemplateType.Custom1, TemplateType.Custom2]
    if (!noImgType.includes(config.templateType)) {
      this.setState({ expandedId: bookmark.id })
    }
    this.onPropertyChange('bookmarks', config.bookmarks.concat(bookmark))
    setTimeout(() => {
      this.setState({activeId: bookmark.id})
    }, 100)
  }

  handleClosePopper = (isBookmarkDeleted?: boolean) => {
    const { activeId, expandedId } = this.state
    activeId !== expandedId && this.setState({ activeId: 0 })
    isBookmarkDeleted && this.setState({ activeId: 0 })
  }

  getArrayMaxId (arr: ImmutableArray<Bookmark>): number {
    const numbers = arr.map(p => p.id)
    return numbers.length > 0 ? Math.max.apply(null, numbers) : 0
  }

  handleSort = (curIndex, newIndex) => {
    const bookmarks = this.props.config?.bookmarks?.asMutable() || []
    const sortBookmark = bookmarks.splice(curIndex, 1)?.[0]
    sortBookmark && bookmarks.splice(newIndex, 0, sortBookmark)
    this.onPropertyChange('bookmarks', Immutable(bookmarks))
  }

  handleSelect = (bookmark: Bookmark) => {
    this.setState({ activeId: bookmark.id })
    this.markPopper.handleEditWhenOpen(bookmark)
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'activeBookmarkId', value: bookmark.id })
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'settingChangeBookmark', value: true })
  }

  handleExpandBookmark = (bookmark: Bookmark) => {
    const { expandedId } = this.state
    if (expandedId === bookmark.id) {
      this.setState({ expandedId: 0 })
      return
    }
    this.setState({ expandedId: bookmark.id })
  }

  handleEditBookmark = (bookmark: Bookmark) => {
    this.setState({ activeId: bookmark.id })
    this.markPopper.handleNewOrEdit(bookmark)
  }

  handleDelete = (bookmark: Bookmark) => {
    const { id } = bookmark
    const customType = [TemplateType.Custom1, TemplateType.Custom2]
    const { activeId } = this.state
    const { id: widgetId, appConfig, browserSizeMode } = this.props
    let { savedConfig, config } = this.props
    const oriBookmarks = config.bookmarks
    const index = oriBookmarks.findIndex(x => x.id === id)
    if (index === -1) return
    const newBookmark = oriBookmarks.asMutable({ deep: true })
    const dialogStatus = this.markPopper.getDialogStatus()
    let newEditActiveBookmark
    if (activeId === newBookmark[index].id) {
      if (index !== 0) {
        newEditActiveBookmark = newBookmark[index - 1]
      } else { // delete the first one
        if (newBookmark.length > 1) {
          newEditActiveBookmark = newBookmark[index + 1]
        } else { // delete the only one
          this.markPopper.handleClickClose(null, true)
          newEditActiveBookmark = undefined
          builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'lastFlag', value: true })
        }
      }
      newEditActiveBookmark && dialogStatus && this.handleEditBookmark(Immutable(newEditActiveBookmark))
    }
    if (customType.includes(config.templateType)) {
      // delete bookmark layouts and bookmark
      const { layoutName } = newBookmark[index]
      const appConfigAction = getAppConfigAction(appConfig)
      appConfigAction.removeLayoutFromWidget(widgetId, layoutName)
      newBookmark.splice(index, 1)
      if (activeId === 0 && newBookmark.length >= 1) {
        newEditActiveBookmark = newBookmark[0]
      }
      const newImmutableArray = Immutable(newBookmark)
      savedConfig = savedConfig.set('bookmarks', newImmutableArray)
      appConfigAction.editWidgetProperty(widgetId, 'config', savedConfig).exec()

      //when deleting the last one bookmark item, restore the default layout
      if (oriBookmarks.length === 1) {
        const styleTemplate = AllStyles[config.templateType]
        widgetService.updateWidgetByTemplate(
          appConfig,
          styleTemplate,
          widgetId,
          styleTemplate.widgetId,
          [browserSizeMode],
          {}
        ).then(newAppConfig => {
          const appConfigAction = getAppConfigAction(newAppConfig)
          appConfigAction.editWidgetProperty(widgetId, 'config', savedConfig).exec()
        })
      }
    } else {
      // only delete bookmark
      newBookmark.splice(index, 1)
      if (activeId === 0 && newBookmark.length >= 1) {
        newEditActiveBookmark = newBookmark[0]
      }
      const newImmutableArray = Immutable(newBookmark)
      this.onPropertyChange('bookmarks', newImmutableArray)
    }
    const newActiveId = (newEditActiveBookmark && newEditActiveBookmark.id) || activeId
    this.setState({ activeId: newActiveId })
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'activeBookmarkId', value: newActiveId })
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'settingChangeBookmark', value: true })
  }

  handleShowSimpleClick = () => {
    const { showSimple } = this.state
    this.setState({ showSimple: !showSimple })
  }

  handleShowAdvanceClick = () => {
    const { showAdvance } = this.state
    this.setState({ showAdvance: !showAdvance })
  }

  handleShowArrangementClick = () => {
    const { showArrangement } = this.state
    this.setState({ showArrangement: !showArrangement })
  }

  handlePageStyleChange = (evt) => {
    const value = evt?.target?.value
    this.onPropertyChange('pageStyle', value)
  }

  handleDisplayTypeChange = (evt) => {
    const value = evt?.target?.value
    this.onPropertyChange('displayType', value)
  }

  onTransitionTypeChange = (type: TransitionType) => {
    this.onPropertyChange('transition', type)
  }

  onTransitionDirectionChange = (dir: TransitionDirection) => {
    this.onPropertyChange('transitionDirection', dir)
  }

  getPageStyleOptions = (): React.JSX.Element[] => {
    return [
      <option key={PageStyle.Scroll} value={PageStyle.Scroll}>{this.formatMessage('scroll')}</option>,
      <option key={PageStyle.Paging} value={PageStyle.Paging}>{this.formatMessage('paging')}</option>
    ]
  }

  handleDirectionClick = (evt) => {
    const direction = evt.currentTarget.dataset.value
    this.onPropertyChange('direction', direction)
  }

  handleSpaceChange = (valueFloat: number) => {
    this.onPropertyChange('space', valueFloat)
  }

  handleItemSizeChange = (value: number, isVertical: boolean) => {
    const val = value ?? ITEM_MIN_SIZE
    isVertical ? this.onPropertyChange('itemHeight', val) : this.onPropertyChange('itemWidth', val)
  }

  duplicateNewLayouts = (originLayoutId: string, widgetId: string, layoutName: string, layoutLabel: string, layoutType?: LayoutType, newAppConfig?: IMAppConfig) => {
    let { appConfig } = this.props
    if (newAppConfig) appConfig = newAppConfig
    const appConfigAction = getAppConfigAction(appConfig)
    const newLayoutJson = appConfigAction.duplicateLayout(originLayoutId, true)
    appConfigAction
      .editLayoutProperty(newLayoutJson.id, 'parent', { type: LayoutParentType.Widget, id: widgetId })
      .editLayoutProperty(newLayoutJson.id, 'label', layoutLabel)
      .editWidgetProperty(widgetId, `layouts.${layoutName}.${utils.getCurrentSizeMode()}`, newLayoutJson.id)

    appConfigAction.exec()
    return newLayoutJson.id
  }

  updateNextButtonPosition = () => {
    clearTimeout(this.updatePositionTimeout)
    this.updatePositionTimeout = setTimeout(() => {
      this.getIsScrollAndWidthOfTemplateCon()
    }, 500)
  }

  handleChangeCardBackground = (color: string) => {
    this.onPropertyChange('cardBackground', color)
  }

  handleCardFontChange = (key: any, value: any) => {
    this.onConfigChange(['cardNameStyle', key], value)
  }

  handleCardNameFontStyleChange = (key: string, value: any) => {
    this.onConfigChange(['cardNameStyle', 'fontStyles', key], value)
  }

  handleSlidesFontChange = (key: any, value: any) => {
    this.onConfigChange(['slidesNameStyle', key], value)
  }

  handleSlidesNameFontStyleChange = (key: string, value: any) => {
    this.onConfigChange(['slidesNameStyle', 'fontStyles', key], value)
  }

  handleDescriptionFontChange = (key: any, value: any) => {
    this.onConfigChange(['slidesDescriptionStyle', key], value)
  }

  handleDescriptionNameFontStyleChange = (key: string, value: any) => {
    this.onConfigChange(['slidesDescriptionStyle', 'fontStyles', key], value)
  }

  renderTemplate = () => {
    const { config, theme } = this.props
    const { showSimple, showAdvance, isTemplateContainScroll, templateConWidth } = this.state
    const isExpressMode = window.isExpressBuilder
    const nextBtnClass = isTemplateContainScroll
      ? 'position-absolute position-absolute-con'
      : 'position-relative-con'
    const simpleTemplateTip = (
      <div className='w-100 d-flex'>
        <div className='text-truncate p-1'>
          {this.formatMessage('simple')}
        </div>
        <Tooltip title={this.formatMessage('simpleTemplateTip')} showArrow placement='left' describeChild>
          <Button icon type='tertiary' size='sm' className='ml-1' aria-label={this.formatMessage('simple') + ': ' + this.formatMessage('simpleTemplateTip')} >
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    )
    const advancedTemplateTip = (
      <div className='w-100 d-flex'>
        <div className='text-truncate p-1'>
          {this.formatMessage('advance')}
        </div>
        <Tooltip title={this.formatMessage('advancedTemplateTip')} showArrow placement='left' describeChild>
          <Button icon type='tertiary' size='sm' className='ml-1' aria-label={this.formatMessage('advance') + ': ' + this.formatMessage('advancedTemplateTip')} >
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    )

    const simpleTemplate = (
      <div className='template-group w-100 mt-1'>
        <div className='d-flex justify-content-between w-100'>
          <Button
            data-value={TemplateType.Card}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.Card}
            title={this.formatMessage('typeCard')}
          >
            <Icon
              autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Card && 'active'}`}
              icon={require('./assets/tradition_card.svg')}
            />
          </Button>
          <Button
            data-value={TemplateType.List}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.List}
            title={this.formatMessage('typeList')}
          >
            <Icon
              autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.List && 'active'}`}
              icon={require('./assets/tradition_list.svg')}
            />
          </Button>
        </div>
        <div className='vertical-space' />
        <div className='d-flex justify-content-between w-100'>
          <Button
            data-value={TemplateType.Gallery}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.Gallery}
            title={this.formatMessage('typeGallery')}
          >
            <Icon
              autoFlip className={`template-img template-img-gallery ${config.templateType === TemplateType.Gallery && 'active'}`}
              icon={require('./assets/presentation_gallery_h.svg')}
            />
          </Button>
        </div>
        <div className='vertical-space' />
        <div className='d-flex justify-content-between w-100'>
          <Button
            data-value={TemplateType.Slide1}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.Slide1}
            title={this.formatMessage('slideOne')}
          >
            <Icon
              autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Slide1 && 'active'}`}
              icon={require('./assets/presentation_slide1.svg')}
            />
          </Button>
          <Button
            data-value={TemplateType.Slide2}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.Slide2}
            title={this.formatMessage('slideTwo')}
          >
            <Icon
              autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Slide2 && 'active'}`}
              icon={require('./assets/presentation_slide2.svg')}
            />
          </Button>
        </div>
        <div className='vertical-space' />
        <div className='d-flex justify-content-between w-100'>
          <Button
            data-value={TemplateType.Slide3}
            onClick={this.handleTemplateTypeImageClick}
            type='tertiary'
            role='radio'
            aria-checked={config.templateType === TemplateType.Slide3}
            title={this.formatMessage('slideThree')}
          >
            <Icon
              autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Slide3 && 'active'}`}
              icon={require('./assets/presentation_slide3.svg')}
            />
          </Button>
        </div>
      </div>
    )

    return (
      <div ref={this.templatesContainer}>
        <SettingSection role='group' aria-label={this.formatMessage('chooseTemplateTip')} title={this.formatMessage('chooseTemplateTip')}>
          {!isExpressMode
            ? (<CollapsablePanel
              label={simpleTemplateTip}
              isOpen={showSimple}
              onRequestOpen={this.handleShowSimpleClick}
              onRequestClose={this.handleShowSimpleClick}
              role='radiogroup'
              aria-label={this.formatMessage('simple')}
              >
                {simpleTemplate}
              </CollapsablePanel>)
            : <div className='mt-4 mb-2'>{simpleTemplate}</div>
            }
          {!isExpressMode && <CollapsablePanel
            label={advancedTemplateTip}
            isOpen={showAdvance}
            onRequestOpen={this.handleShowAdvanceClick}
            onRequestClose={this.handleShowAdvanceClick}
            role='radiogroup'
            aria-label={this.formatMessage('advance')}
            className='mt-2 mb-2'
          >
            <div className='template-group w-100 mt-1'>
              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={TemplateType.Custom1}
                  onClick={this.handleTemplateTypeImageClick}
                  type='tertiary'
                  role='radio'
                  aria-checked={config.templateType === TemplateType.Custom1}
                  title={this.formatMessage('customOne')}
                >
                  <Icon
                    autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Custom1 && 'active'}`}
                    icon={require('./assets/custom_template1.svg')}
                  />
                </Button>
                <Button
                  data-value={TemplateType.Custom2}
                  onClick={this.handleTemplateTypeImageClick}
                  type='tertiary'
                  role='radio'
                  aria-checked={config.templateType === TemplateType.Custom2}
                  title={this.formatMessage('customTwo')}
                >
                  <Icon
                    autoFlip className={`template-img template-img-h ${config.templateType === TemplateType.Custom2 && 'active'}`}
                    icon={require('./assets/custom_template2.svg')}
                  />
                </Button>
              </div>
              <div className="vertical-space" />
            </div>
          </CollapsablePanel> }

          <SettingRow>
            <div className='next-con w-100' css={getNextButtonStyle(theme, templateConWidth)}>
              <div className={nextBtnClass}>
                <Button type='primary' className='w-100' onClick={this.handleTemplateConfirmClick}>
                  {this.formatMessage('start')}
                </Button>
              </div>
            </div>
          </SettingRow>
        </SettingSection>
      </div>
    )
  }

  onTransitionSettingChange = (transition: Transition) => {
    const transitionInfo = this.props.config.transitionInfo.asMutable({ deep: true })
    transitionInfo.transition = transition
    transitionInfo.previewId = getNextAnimationId()
    this.onConfigChange(['transitionInfo'], Immutable(transitionInfo))
  }

  previewTransitionAndOneByOne = () => {
    this.onConfigChange(['transitionInfo', 'previewId'], getNextAnimationId())
  }

  renderSlideOrCustomArrangementSetting = () => {
    const { config } = this.props
    const { transitionInfo } = config
    const { showArrangement } = this.state
    const isVertical = config.direction === DirectionType.Vertical

    return (
      <SettingSection>
        <CollapsablePanel
          label={this.formatMessage('arrangement')}
          isOpen={showArrangement}
          onRequestOpen={this.handleShowArrangementClick}
          onRequestClose={this.handleShowArrangementClick}
          role='group'
          aria-label={this.formatMessage('arrangement')}
        >
          {<SettingRow className='mt-2' label={this.formatMessage('pagingStyle')} flow='wrap'>
              <Select value={config.pageStyle} onChange={this.handlePageStyleChange} size='sm' aria-label={this.formatMessage('pagingStyle')}>
                {this.getPageStyleOptions()}
              </Select>
            </SettingRow>
          }
          {config.pageStyle !== PageStyle.Scroll &&
            <Fragment>
              <SettingRow>
                <Label>
                  <Checkbox
                    data-field='initBookmark'
                    onClick={this.handleCheckboxChange}
                    checked={config.initBookmark}
                    aria-label={this.formatMessage('initBookmark')}
                  />
                  <span className='text-wrap ml-2' title={this.formatMessage('initBookmark')}>{this.formatMessage('initBookmark')}</span>
                </Label>
                <Tooltip title={this.formatMessage('initBookmarkTips')} showArrow placement='left'>
                  <span className='inline-block ml-2 tips-pos'>
                    <InfoOutlined />
                  </span>
                </Tooltip>
              </SettingRow>
              <SettingRow tag='label' label={this.formatMessage('playEnable')}>
                <Switch
                  className='can-x-switch' checked={(config && config.autoPlayAllow) || false}
                  data-key='autoRefresh' onChange={evt => { this.onSwitchChanged(evt.target.checked, 'autoPlayAllow') }} aria-label={this.formatMessage('playEnable')}
                />
              </SettingRow>
              {config.autoPlayAllow &&
                <Fragment>
                  <SettingRow
                    flow='wrap'
                    label={`${this.formatMessage('autoInterval')} (${this.formatMessage('second')})`}
                    role='group'
                    aria-label={`${this.formatMessage('autoInterval')} (${this.formatMessage('second')})`}
                  >
                    <NumericInput
                      style={{ width: '100%' }}
                      value={config.autoInterval || 3}
                      min={2}
                      max={60}
                      onChange={this.handleAutoInterval}
                    />
                  </SettingRow>
                  <SettingRow>
                    <Label>
                      <Checkbox
                        data-field='autoLoopAllow'
                        onClick={this.handleCheckboxChange}
                        checked={config.autoLoopAllow}
                        aria-label={this.formatMessage('autoLoopAllow')}
                      />
                      <span className='text-wrap ml-2'>{this.formatMessage('autoLoopAllow')}</span>
                    </Label>
                  </SettingRow>
                </Fragment>}
            </Fragment>
          }
          {(config.pageStyle !== PageStyle.Paging) &&
            <SettingRow label={this.formatMessage('direction')} role='group' aria-label={this.formatMessage('direction')}>
              <AdvancedButtonGroup size='sm'>
                {
                  directions.map((data, i) => {
                    return (
                      <Button
                        key={i} icon active={config.direction === data.value}
                        data-value={data.value}
                        onClick={this.handleDirectionClick}
                        aria-label={data.icon === 'right' ? this.formatMessage('horizontal') : this.formatMessage('vertical')}
                      >
                        {data.icon === 'right' ? <ArrowRightOutlined size='s' /> : <ArrowDownOutlined size='s' />}
                      </Button>
                    )
                  })
                }
              </AdvancedButtonGroup>
            </SettingRow>
          }
          {config.pageStyle === PageStyle.Paging &&
            <SettingRow label={this.formatMessage('transition')} flow='wrap' role='group' aria-label={this.formatMessage('transition')}>
              <TransitionSetting
                transition={transitionInfo?.transition}
                onTransitionChange={this.onTransitionSettingChange}
                onPreviewTransitionClicked={this.previewTransitionAndOneByOne}
                onPreviewAsAWhoneClicked={this.previewTransitionAndOneByOne}
                formatMessage={this.formatMessage}
                showOneByOne={false}
              />
            </SettingRow>
          }
          {config.pageStyle === PageStyle.Scroll &&
            <Fragment>
              <SettingRow
                flow='wrap'
                role='group'
                label={`${isVertical ? this.formatMessage('itemHeight') : this.formatMessage('itemWidth')}(px)`}
                aria-label={`${isVertical ? this.formatMessage('itemHeight') : this.formatMessage('itemWidth')}(px)`}
              >
                <NumericInput
                  style={{ width: '100%' }}
                  value={(isVertical ? config.itemHeight : config.itemWidth) || 240}
                  min={ITEM_MIN_SIZE}
                  onChange={(value) => { this.handleItemSizeChange(value, isVertical) }}
                />
              </SettingRow>
              <SettingRow
                flow='wrap'
                role='group'
                label={(isVertical ? this.formatMessage('verticalSpacing') : this.formatMessage('horizontalSpacing')) + ' (px)'}
                aria-label={(isVertical ? this.formatMessage('verticalSpacing') : this.formatMessage('horizontalSpacing')) + ' (px)'}
              >
                <div className='d-flex justify-content-between w-100 align-items-center'>
                  <Slider
                    style={{ width: '60%' }}
                    data-field='space'
                    onChange={this.handleFormChange}
                    value={config.space}
                    title='0-50'
                    min={0}
                    max={50}
                  />
                  <NumericInput
                    style={{ width: '25%' }}
                    value={config.space}
                    min={0}
                    max={50}
                    title='0-50'
                    onChange={this.handleSpaceChange}
                  />
                </div>
              </SettingRow>
            </Fragment>
          }
        </CollapsablePanel>
      </SettingSection>
    )
  }

  renderDataSetting = () => {
    const { id, theme, useDataSources, useMapWidgetIds, config } = this.props
    const { cardItemWidth, cardItemHeight, keepAspectRatio, cardItemSizeRatio, itemSizeType, direction, galleryItemSpace, galleryItemWidth, galleryItemHeight, cardNameStyle, slidesNameStyle, slidesDescriptionStyle } = config
    const { activeId, expandedId, tempLayoutType } = this.state
    const activeBookmark = config.bookmarks.find(x => x.id === activeId)
    const activeName = (activeBookmark && activeBookmark.name) ? activeBookmark.name : '---'
    const runtimeAddType = [TemplateType.Card, TemplateType.List, TemplateType.Gallery]
    const slideAndCustomType = [TemplateType.Slide1, TemplateType.Slide2, TemplateType.Slide3, TemplateType.Custom1, TemplateType.Custom2]
    const customType = [TemplateType.Custom1, TemplateType.Custom2]
    const hideNameType = [TemplateType.Card, TemplateType.Gallery, TemplateType.Slide1, TemplateType.Slide2, TemplateType.Slide3]
    const slidesType = [TemplateType.Slide1, TemplateType.Slide2, TemplateType.Slide3]
    const displayAllTip = this.formatMessage('displayAll')
    const displaySelectedTip = this.formatMessage('displaySelected')
    const displayTypeTip = config.displayType === DisplayType.All ? displayAllTip : displaySelectedTip

    return (
      <div className='bookmark-setting'>
        <SettingSection>
          <SettingRow flow='wrap'>
            <div className='w-100 overflow-hidden'>
              <Button
                type='tertiary'
                className='resetting-template jimu-outline-inside'
                disableHoverEffect={true}
                disableRipple={true}
                onClick={this.handleResetTemplateClick}
                title={this.formatMessage('resettingTheTemplate')}
                ref={this.resetButtonRef}
              >
                {this.formatMessage('resettingTheTemplate')}
              </Button>
              {customType.includes(config.templateType) &&
                <Fragment>
                  {this.formatMessage('customBookmarkDesign')}
                  <Tooltip title={this.formatMessage('customTips')} showArrow placement='left'>
                    <span className='inline-block ml-2'>
                      <InfoOutlined />
                    </span>
                  </Tooltip>
                </Fragment>}
            </div>
          </SettingRow>
          <SettingRow flow='wrap' label={this.formatMessage('selectMapWidget')}>
            <MapWidgetSelector onSelect={this.onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} isNeedConfirmBeforeChange confirmMessage={this.formatMessage('switchRemind')}/>
          </SettingRow>
          {this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 &&
            <SettingRow>
              <MarkPopper
                id={id}
                theme={theme}
                title={`${this.formatMessage('setBookmarkView')}: ${activeName}`}
                buttonLabel={this.formatMessage('addBookmark')}
                useDataSources={useDataSources}
                useMapWidgetIds={useMapWidgetIds}
                jimuMapConfig={config}
                onBookmarkUpdated={this.onBookmarkUpdated}
                onShowBookmarkConfig={(ref) => { this.showBookmarkConfig(ref) }}
                maxBookmarkId={this.getArrayMaxId(config.bookmarks)}
                activeBookmarkId={activeId}
                onAddNewBookmark={this.addNewBookmark}
                onClose={this.handleClosePopper}
                formatMessage={this.formatMessage}
                duplicateNewLayouts={this.duplicateNewLayouts}
                tempLayoutType={tempLayoutType}
                isUseWidgetSize
              />
            </SettingRow>}
          {this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1 && config.bookmarks && config.bookmarks.length !== 0 &&
            <SettingRow>
              <BookmarkList
                theme={theme}
                bookmarks={config.bookmarks}
                templateType={config.templateType}
                activeId={activeId}
                expandedId={expandedId}
                widgetId={this.props.id}
                onSelect={this.handleSelect}
                onEdit={this.handleEditBookmark}
                onExpand={this.handleExpandBookmark}
                onDelete={this.handleDelete}
                onSort={this.handleSort}
                onPropertyChange={this.onPropertyChange}
                formatMessage={this.formatMessage}
              />
            </SettingRow>}
        </SettingSection>

        <SettingSection
          title={this.formatMessage('general')}
          aria-label={this.formatMessage('general')}
          role='group'
        >
          <SettingRow flow='wrap' label={this.formatMessage('drawingDisplay')}>
            <Select value={config.displayType} title={displayTypeTip} aria-label={this.formatMessage('drawingDisplay')} onChange={this.handleDisplayTypeChange} size='sm'>
              <option key='all' value={DisplayType.All} title={displayAllTip}>
                <div className='text-truncate'>{displayAllTip}</div>
              </option>
              <option key='selected' value={DisplayType.Selected} title={displaySelectedTip}>
                <div className='text-truncate'>{displaySelectedTip}</div>
              </option>
            </Select>
          </SettingRow>
          {(runtimeAddType.includes(config.templateType)) &&
            <SettingRow>
              <Label>
                <Checkbox
                  data-field='runtimeAddAllow'
                  onClick={this.handleCheckboxChange}
                  checked={config.runtimeAddAllow}
                  aria-label={this.formatMessage('runtimeAddAllow')}
                />
                <span className='text-wrap ml-2' title={this.formatMessage('runtimeAddAllow')}>{this.formatMessage('runtimeAddAllow')}</span>
              </Label>
            </SettingRow>}
          {(!customType.includes(config.templateType)) &&
            <SettingRow>
              <Label>
                <Checkbox
                  data-field='displayFromWeb'
                  onClick={this.handleCheckboxChange}
                  checked={config.displayFromWeb}
                  aria-label={this.formatMessage('displayFromWeb')}
                />
                <span className='text-wrap ml-2' title={this.formatMessage('displayFromWeb')}>{this.formatMessage('displayFromWeb')}</span>
              </Label>
            </SettingRow>}
            <SettingRow>
              <Label>
                <Checkbox
                  data-field='ignoreLayerVisibility'
                  onClick={this.handleCheckboxChange}
                  checked={config.ignoreLayerVisibility}
                  aria-label={this.formatMessage('ignoreLayerVisibility')}
                />
                <span className='text-wrap ml-2' title={this.formatMessage('ignoreLayerVisibility')}>{this.formatMessage('ignoreLayerVisibility')}</span>
              </Label>
            </SettingRow>
          {(hideNameType.includes(config.templateType)) &&
            <SettingRow>
              <Label>
                <Checkbox
                  data-field='displayName'
                  onClick={this.handleCheckboxChange}
                  checked={config.displayName}
                  aria-label={this.formatMessage('displayName')}
                />
                <span className='text-wrap ml-2' title={this.formatMessage('displayName')}>{this.formatMessage('displayName')}</span>
              </Label>
            </SettingRow>}
            {(config.templateType === TemplateType.List) &&
            <SettingRow>
              <Label>
                <Checkbox
                  data-field='hideIcon'
                  onClick={this.handleCheckboxChange}
                  checked={config.hideIcon}
                  aria-label={this.formatMessage('hideIcon')}
                />
                <span className='text-wrap ml-2' title={this.formatMessage('hideIcon')}>{this.formatMessage('hideIcon')}</span>
              </Label>
            </SettingRow>}
        </SettingSection>
        {(slideAndCustomType.includes(config.templateType)) && this.renderSlideOrCustomArrangementSetting()}
        {config.templateType === TemplateType.Card &&
          <CardArrangementSetting
            widgetId={this.props.id}
            savedConfig={this.props.savedConfig}
            cardItemWidth={cardItemWidth}
            cardItemHeight={cardItemHeight}
            widgetRect={this.props.widgetRect}
            onPropertyChange={this.onPropertyChange}
            onSettingChange={this.props.onSettingChange}
            keepAspectRatio={keepAspectRatio}
            cardItemSizeRatio={cardItemSizeRatio}
            itemSizeType={itemSizeType}
          />
        }
        {config.templateType === TemplateType.Gallery &&
          <GalleryArrangementSetting
            direction={direction}
            handleDirectionClick={this.handleDirectionClick}
            handleFormChange={this.handleFormChange}
            galleryItemSpace={galleryItemSpace}
            onPropertyChange={this.onPropertyChange}
            itemSizeType={itemSizeType}
            galleryItemWidth={galleryItemWidth}
            galleryItemHeight={galleryItemHeight}
          />
        }
        <SettingSection title={this.formatMessage('appearance')}>
          <SettingRow label={this.formatMessage('cardBackground')}>
            <ThemeColorPicker
              specificTheme={this.props.theme2}
              value={config.cardBackground}
              onChange={this.handleChangeCardBackground}
            />
          </SettingRow>
          {runtimeAddType.includes(config.templateType) && <SettingRow label={this.formatMessage('bookmarkTitleName')} aria-label={this.formatMessage('bookmarkTitleName')} flow='wrap'>
            <TextStyleSetting
              textStyle={cardNameStyle}
              onFontChange={this.handleCardFontChange}
              onFontStyleChange={this.handleCardNameFontStyleChange}
            />
          </SettingRow>}
          {slidesType.includes(config.templateType) && <Fragment>
            <SettingRow label={this.formatMessage('bookmarkTitleName')} aria-label={this.formatMessage('bookmarkTitleName')} flow='wrap'>
              <TextStyleSetting
                textStyle={slidesNameStyle}
                onFontChange={this.handleSlidesFontChange}
                onFontStyleChange={this.handleSlidesNameFontStyleChange}
              />
            </SettingRow>
            <SettingRow label={this.formatMessage('description')} aria-label={this.formatMessage('description')} flow='wrap'>
              <TextStyleSetting
                textStyle={slidesDescriptionStyle}
                onFontChange={this.handleDescriptionFontChange}
                onFontStyleChange={this.handleDescriptionNameFontStyleChange}
              />
            </SettingRow></Fragment>}
        </SettingSection>
      </div>
    )
  }

  render () {
    const { config, theme, enableA11yForWidgetSettings } = this.props
    const { changeCustomConfirmOpen } = this.state

    return (
      <Fragment>
        <div
          className={classNames(`${prefix}bookmark-setting`, `${prefix}setting`, {'bookmark-setting-con-with-template-scroll': enableA11yForWidgetSettings && !config.isTemplateConfirm })}
          css={getStyle(theme)}
        >
          {config.isTemplateConfirm ? this.renderDataSetting() : this.renderTemplate()}
        </div>
        {
          changeCustomConfirmOpen &&
            <ConfirmDialog
              level='warning'
              title={this.formatMessage('changeConfirmTitle')}
              hasNotShowAgainOption={false}
              content={this.formatMessage('changeRemind')}
              onConfirm={this.handleChangeOk}
              onClose={this.handleChangeClose}
            />
        }
      </Fragment>
    )
  }
}
