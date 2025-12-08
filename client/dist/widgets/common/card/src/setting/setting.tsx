/** @jsx jsx */
import {
  React,
  classNames,
  type IMState,
  type IMAppConfig,
  type IMThemeVariables,
  type SerializedStyles,
  css,
  jsx,
  AppMode,
  BrowserSizeMode,
  appConfigUtils,
  getAppStore,
  polished,
  type AnimationSetting,
  type LayoutInfo,
  Immutable,
  LayoutType,
  type Size,
  appActions,
  getNextAnimationId,
  lodash,
  defaultMessages as jimuCoreDefaultMessages,
  focusElementInKeyboardMode,
  type IMLinkParam
} from 'jimu-core'
import {
  type AllWidgetSettingProps,
  getAppConfigAction,
  builderAppSync,
  templateUtils,
  widgetService,
  type AppConfigAction
} from 'jimu-for-builder'
import {
  searchUtils,
  defaultMessages as jimuLayoutsDefaultMessages
} from 'jimu-layouts/layout-runtime'
import {
  SettingSection,
  SettingRow,
  LinkSelector,
  type SwitchCardLayoutOption,
  setLayoutAuto,
  CardLayoutSetting
} from 'jimu-ui/advanced/setting-components'
import {
  BackgroundSetting,
  BorderSetting,
  BoxShadowSetting,
  BorderRadiusSetting,
  TransitionSetting,
  type BorderSide
} from 'jimu-ui/advanced/style-setting-components'
import {
  Switch,
  Icon,
  Button,
  defaultMessages as jimuUIDefaultMessages,
  Tooltip,
  CollapsablePanel,
  type BorderStyle
} from 'jimu-ui'
import {
  type IMConfig,
  ItemStyle,
  Status,
  type Transition,
  defaultTransitionInfo,
  type ElementSize,
  OpenSettingStatus,
  CardLayout
} from '../config'
import defaultMessages from './translations/default'
import { Fragment } from 'react'
import type { Template } from 'jimu-for-builder/templates'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { colorUtils, getTheme2 } from 'jimu-theme'
const prefix = 'jimu-widget-'

const originAllStyles: { [key: string]: Template } = {
  STYLE0: require('./template/card-style0.json'),
  STYLE1: require('./template/card-style1.json'),
  STYLE2: require('./template/card-style2.json'),
  STYLE3: require('./template/card-style3.json'),
  STYLE4: require('./template/card-style4.json'),
  STYLE5: require('./template/card-style5.json'),
  STYLE6: require('./template/card-style6.json'),
  STYLE7: require('./template/card-style7.json'),
  STYLE8: require('./template/card-style8.json'),
  STYLE9: require('./template/card-style9.json'),
  STYLE10: require('./template/card-style10.json')
}

let AllStyles: { [key: string]: Template }
const MESSAGES = Object.assign(
  {},
  defaultMessages,
  jimuUIDefaultMessages,
  jimuLayoutsDefaultMessages,
  jimuCoreDefaultMessages
)

function initStyles (widgetId: string) {
  if (AllStyles) {
    return AllStyles
  }
  AllStyles = {}
  Object.keys(originAllStyles).forEach(style => {
    AllStyles[style] = templateUtils.processForTemplate(
      originAllStyles[style],
      widgetId,
      MESSAGES
    )
  })
}

interface State {
  isAdvance: boolean
  openSettingStatus: OpenSettingStatus
  isTemplateContainScroll: boolean
  templateConWidth: number
}

interface ExtraProps {
  appConfig: IMAppConfig
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  showCardSetting: Status
  layoutInfo: LayoutInfo
  selectionIsInSelf: boolean
  settingPanelChange: string
  viewportSize?: Size
  parentSize: ElementSize
  enableA11yForWidgetSettings?: boolean
}

interface CustomProps {
  theme: IMThemeVariables
}

export default class Setting extends React.PureComponent<
AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps,
State
> {
  templatesContain: HTMLElement
  updatePositionTimeout: any
  resettingTheTemplateButtonRef: HTMLButtonElement
  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetSettingProps<IMConfig>
  ) => {
    const { id } = props
    return {
      appConfig: state?.appStateInBuilder?.appConfig,
      appMode: state?.appStateInBuilder?.appRuntimeInfo?.appMode,
      browserSizeMode: state?.appStateInBuilder?.browserSizeMode,
      showCardSetting:
        (state?.appStateInBuilder?.widgetsState[id] &&
          state?.appStateInBuilder?.widgetsState[id].showCardSetting) ||
        Status.Default,
      layoutInfo: state?.appStateInBuilder?.widgetsState[id]?.layoutInfo,
      settingPanelChange: state?.widgetsState?.[props.id]?.settingPanelChange,
      selectionIsInSelf: state?.appStateInBuilder?.widgetsState[id]?.selectionIsInSelf,
      parentSize: state?.appStateInBuilder?.widgetsState[id]?.parentSize,
      enableA11yForWidgetSettings: state?.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings
    }
  }

  constructor (props) {
    super(props)
    initStyles(props.id)
    this.state = {
      isAdvance: false,
      openSettingStatus: OpenSettingStatus.Default,
      isTemplateContainScroll: false,
      templateConWidth: 0
    }
  }

  componentDidMount () {
    this.getIsScrollAndWidthOfTemplateCon()
    window.addEventListener('resize', this.updateStartButtonPosition)
  }

  componentDidUpdate (preProps, preState) {
    const { config, id, layoutInfo, settingPanelChange, showCardSetting } = this.props
    let { appConfig } = this.props
    if (!config.isInitialed && layoutInfo) {
      appConfig = getAppConfigAction().editWidget(appConfig?.asMutable({ deep: true }).widgets[id]).appConfig
      this.onItemStyleChanged(config.itemStyle, appConfig)
    }

    if (preProps?.config) {
      this.initCardStatusInWidgetState(preProps?.config)
    }

    const isEnableA11yForWidgetSettingsChange = preProps?.enableA11yForWidgetSettings !== this.props?.enableA11yForWidgetSettings
    if ((preProps.settingPanelChange !== 'content' && settingPanelChange === 'content') || isEnableA11yForWidgetSettingsChange) {
      this.updateStartButtonPosition()
    }

    if (showCardSetting !== preProps.showCardSetting) {
      this.setState({
        openSettingStatus: showCardSetting as any
      })
    }
  }

  componentWillUnmount () {
    const { dispatch, id } = this.props
    dispatch(
      appActions.widgetStatePropChange(id, 'settingPanelChange', null)
    )
    clearTimeout(this.updatePositionTimeout)
  }

  onPropertyChange = (name, value) => {
    const { config } = this.props
    if (value === config[name]) {
      return
    }
    this.onConfigChange(name, value)
  }

  onConfigChange = (key, value) => {
    const { config } = this.props
    const newConfig = config.setIn(key, value)
    const alterProps = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(alterProps)
  }

  onBackgroundStyleChange = (status: Status, key, value) => {
    this.onConfigChange([status, 'backgroundStyle', key], value)
  }

  onBorderStyleChange = (status: Status, value: BorderStyle) => {
    const { config } = this.props
    const borderStyle = {
      border: value
    }
    const newConfig = config.setIn([status, 'backgroundStyle', 'border'], borderStyle)
    const options = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(options)
  }

  updateSideBorder = (side: BorderSide, border: BorderStyle, status: Status) => {
    const { config } = this.props
    let borderStyle = config[status].backgroundStyle?.border || Immutable({})
    borderStyle = borderStyle.set(lodash.camelCase(`border-${side}`), border).without('border').without('color').without('type').without('width')
    const newConfig = config.setIn([status, 'backgroundStyle', 'border'], borderStyle)
    const options = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(options)
  }

  onExportClick = evt => {
    const { appConfig, layouts, id, browserSizeMode } = this.props
    const currentPageId = getAppStore().getState().appStateInBuilder
      .appRuntimeInfo.currentPageId
    const pageJson =
      appConfig.pages[currentPageId === 'default' ? 'home' : currentPageId]

    const pageTemplates = [
      {
        widgetId: id,
        config: {
          layouts: appConfig.layouts.without(
            pageJson.layout[browserSizeMode],
            layouts[Status.Hover][browserSizeMode]
          ),
          widgets: appConfig.widgets.without(id),
          views: appConfig.views,
          sections: appConfig.sections
        }
      }
    ]

    const template0 = pageTemplates[0]
    template0.config.layouts &&
      Object.keys(template0.config.layouts).forEach(layoutId => {
        let layoutJson = template0.config.layouts[layoutId].without('id')
        layoutJson.content &&
          Object.keys(layoutJson.content).forEach(lEId => {
            const lEJson = (layoutJson.content[lEId] as any)
              .without('id', 'parentId', 'layoutId')
              .setIn(['setting', 'lockParent'], true)
            layoutJson = layoutJson.setIn(['content', lEId], lEJson)
          })
        template0.config.layouts = template0.config.layouts.set(
          layoutId,
          layoutJson
        )
      })

    template0.config.widgets &&
      Object.keys(template0.config.widgets).forEach((wId, index) => {
        const wJson = template0.config.widgets[wId]
        template0.config.widgets = template0.config.widgets.set(
          wId,
          wJson.without(
            'context',
            'icon',
            'label',
            'manifest',
            'version',
            'id',
            'useDataSourcesEnabled',
            'useDataSources'
          )
        )
      })

    template0.config.sections &&
      Object.keys(template0.config.sections).forEach((sId, index) => {
        const sJson = template0.config.sections[sId]
        template0.config.sections = template0.config.sections.set(
          sId,
          sJson.without('id', 'label')
        )
      })

    template0.config.views &&
      Object.keys(template0.config.views).forEach((vId, index) => {
        const vJson = template0.config.views[vId]
        template0.config.views = template0.config.views.set(
          vId,
          vJson.without('id', 'label')
        )
      })
    console.log(JSON.stringify(pageTemplates[0]))
  }

  private readonly changeBuilderStatus = (status: Status) => {
    const { id } = this.props
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'builderStatus',
      value: status
    })
  }

  onItemStyleChanged = (style: ItemStyle, updatedAppConfig = undefined) => {
    // if(this.props.appMode === AppMode.Run) return;
    const { id } = this.props
    let { appConfig } = this.props
    const allBrowserSizeMode = Object.keys(appConfig.widgets[id]?.parent) as any
    if (updatedAppConfig) {
      appConfig = updatedAppConfig
    }
    const styleTemp = AllStyles[style]
    widgetService.updateWidgetByTemplate(
      appConfig,
      styleTemp,
      id,
      styleTemp.widgetId,
      allBrowserSizeMode,
      {}
    ).then((newAppConfig) => {
      this._onItemStyleChange(newAppConfig, style)
    })
  }

  getUniqueIds = (
    appConfig: IMAppConfig,
    type: 'page' | 'layout' | 'widget' | 'section' | 'view',
    size: number
  ): string[] => {
    const ids: string[] = []
    for (let i = 0; i < size; i++) {
      const id = appConfigUtils.getUniqueId(type)
      ids.push(id)
      appConfig = appConfig.setIn([type + 's', id], { id: id } as any)
    }
    return ids
  }

  getUniqueLabels = (
    appConfig: IMAppConfig,
    type: 'page' | 'layout' | 'widget' | 'section' | 'view',
    size: number
  ): string[] => {
    const labels: string[] = []
    for (let i = 0; i < size; i++) {
      const id = appConfigUtils.getUniqueId(type)
      const label = appConfigUtils.getUniqueLabel(appConfig, type, type)
      labels.push(label)
      appConfig = appConfig.setIn([type + 's', id], {
        id: id,
        label: label
      } as any)
    }
    return labels
  }

  private readonly _onItemStyleChange = (appConfig, style) => {
    const { id, config: oldConfig } = this.props
    const appConfigAction = getAppConfigAction(appConfig)
    const wJson = appConfig.widgets[id]
    const template: Template = AllStyles[style]
    const templateWidgetJson = template.config.widgets[template.widgetId]
    wJson.layouts &&
      Object.keys(wJson.layouts).forEach(name => {
        wJson.layouts[name] &&
          Object.keys(wJson.layouts[name]).forEach(device => {
            if (
              templateWidgetJson?.layouts?.[name]?.[device] ||
              !templateWidgetJson?.layouts
            ) { return }
            // Judge if layout is empty
            let sizeLayouts = templateWidgetJson.layouts[name]
            if (!sizeLayouts) {
              const layoutKeys = Object.keys(templateWidgetJson.layouts)
              sizeLayouts = wJson.layouts[layoutKeys[layoutKeys.length - 1]]
            } else {
              sizeLayouts = wJson.layouts[name]
            }
            const length = Object.keys(sizeLayouts).length

            let embedLayoutJson
            for (const key in sizeLayouts) {
              if (key === BrowserSizeMode.Large) {
                embedLayoutJson = appConfig.layouts[sizeLayouts[key]]
              }
            }

            if (!embedLayoutJson) {
              embedLayoutJson =
              appConfig.layouts[
                sizeLayouts[Object.keys(sizeLayouts)[length - 1]]
              ]
            }

            if (!embedLayoutJson?.content) {
              return
            }
            const desLayoutId = wJson.layouts[name][device]

            appConfigAction.editLayoutProperty(
              desLayoutId,
              'type',
              embedLayoutJson.type
            )
          })
      })

    // process inherit properties
    if (wJson.useDataSources && wJson.useDataSources.length > 0) {
      appConfigAction.copyUseDataSourceToAllChildWidgets(
        wJson.set('useDataSources', null),
        wJson
      )
    }
    this.editLayoutItemSize(appConfigAction, style)
    const config = wJson.config
      .set('itemStyle', style)
      .set('isItemStyleConfirm', false)
      .set('isInitialed', true)
    appConfigAction
      .editWidgetProperty(wJson.id, 'config', config)
      .exec(!oldConfig.isInitialed)
  }

  getStyle = (theme: IMThemeVariables): SerializedStyles => {
    return css`
      &{
        &.card-setting-con-with-template-scroll {
          height: calc(100% - 216px) !important;
          .start-con div {
            bottom: 218px !important;
          }
        }
        .resetting-template {
          cursor: pointer;
          color: ${theme.sys.color.primary.light};
          vertical-align: middle;
          padding: 0;
        }
        .resetting-template:hover {
          cursor: pointer;
          color: ${polished.rgba(theme.sys.color.primary.light, 0.8)};
        }
        .card-setting-return {
          cursor: pointer;
        }
        .setting-next {
          width: auto;
          max-width: 50%;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: end;
          font-size: ${polished.rem(13)};
        }
        .clear-padding {
          padding-left: 0;
          padding-right: 0;
        }
        .enable-hover-con .jimu-widget-setting--row-label{
          font-size: 14px!important;
          color: #c5c5c5!important;
          font-weight: 500!important;
        }
        .style-group {
          button:not(.tooltip-icon-con) {
            padding: 0;
          }
          &.advance-style-group {
            padding-bottom: ${polished.rem(4)};
          }
          button {
            flex: 1;
            flex-grow: 1;
          }
          .style-margin-r {
            margin-right: ${polished.rem(6)};
          }
          .style-img {
            cursor: pointer;
            width: 100%;
            height: 70px;
            margin: 0;
            border: 1px solid transparent;
            background-color: ${theme.ref.palette.white};
            &.active {
              border: 2px solid ${theme.sys.color.primary.main};
            }
            &.style-img-h {
              width: 100%;
              height: auto;
            }
            &.low {
              height: 48px;
            }
            &.empty {
              height: 40px;
              line-height: 40px;
              color: ${theme.ref.palette.neutral[800]};
            }
          }
          .vertical-space {
            height: 10px;
          }
        }
        .use-tips {
          bottom: 0;
          background:${theme.ref.palette.neutral[400]};
          z-index: 100;
        }
        .tips-text {
          color: ${theme.ref.palette.neutral[900]};
        }
        .tips-opacity-0 {
          opacity: 0;
        }
        .template-type {
          margin-bottom: ${polished.rem(2)};
        }
        .template-classic {
          font-size: 0.8125rem;
          font-weight: 500;
          color: ${theme.ref.palette.neutral[900]};
          vertical-align: middle;
        }
        .tooltip-icon-con {
          color: ${theme.ref.palette.neutral[1000]};
          flex-grow: initial !important;
          flex: initial !important;
          background: transparent;
          border: none;
          width: 24px;
          svg {
            margin-right: 0;
          }
        }
      }
    `
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: MESSAGES[id] },
      values
    )
  }

  onSettingLinkConfirm = (linkResult: IMLinkParam) => {
    if (!linkResult) {
      return
    }

    this.onConfigChange(['linkParam'], linkResult)
  }

  handleForegroundChange = (status, foreground: string) => {
    this.onConfigChange([status, 'backgroundStyle', 'textColor'], foreground)
  }

  handleBackgroundChange = (status, background) => {
    const { config } = this.props
    const fg = colorUtils.getReadableThemeColor(background.color, getTheme2())
    const newConfig = config.setIn([status, 'backgroundStyle', 'background'], background).setIn([status, 'backgroundStyle', 'textColor'], fg)

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  renderBgSetting (status: Status) {
    const { config } = this.props
    const borderStyle = config[status].backgroundStyle?.border
    return (
      <Fragment>
        <SettingSection className='clear-padding' title={this.formatMessage('background')} aria-label={this.formatMessage('background')}>
          <SettingRow className='w-100' flow='wrap' role='group'>
            <BackgroundSetting
              background={config[status].backgroundStyle.background}
              onChange={value => { this.handleBackgroundChange(status, value) }}
              hasForeground
              onForegroundChange={(foreground) => { this.handleForegroundChange(status, foreground) }}
              foreground={config[status].backgroundStyle?.textColor}
            />
          </SettingRow>
        </SettingSection>
        <SettingSection className='clear-padding' title={this.formatMessage('border')} aria-label={this.formatMessage('border')}>
          <SettingRow flow='wrap' role='group' aria-label={this.formatMessage('border')}>
            <BorderSetting
              value={(borderStyle as any)?.width ? borderStyle as any : borderStyle?.border}
              top={borderStyle?.borderTop}
              left={borderStyle?.borderLeft}
              right={borderStyle?.borderRight}
              bottom={borderStyle?.borderBottom}
              applyDefaultValue
              onChange={value => { this.onBorderStyleChange(status, value) }}
              onSideChange={(side, border) => { this.updateSideBorder(side, border, status) }}
            />
          </SettingRow>
          <SettingRow label={this.formatMessage('borderRadius')} flow='wrap' role='group' aria-label={this.formatMessage('borderRadius')}>
            <BorderRadiusSetting
              value={config[status].backgroundStyle.borderRadius}
              applyDefaultValue={false}
              onChange={value => {
                this.onBackgroundStyleChange(
                  status,
                  'borderRadius',
                  value
                )
              }
              }
            />
          </SettingRow>
        </SettingSection>
        <SettingSection className='clear-padding' title={this.formatMessage('boxShadow')}>
          <SettingRow flow='wrap'>
            <BoxShadowSetting
              value={config[status].backgroundStyle.boxShadow}
              onChange={value => { this.onBackgroundStyleChange(status, 'boxShadow', value) }
              }
            />
          </SettingRow>
        </SettingSection>
      </Fragment>
    )
  }

  handleItemStyleConfirmClick = evt => {
    this.onPropertyChange(['isItemStyleConfirm'], true)
    setTimeout(() => { focusElementInKeyboardMode(this.resettingTheTemplateButtonRef) }, 200)
  }

  handleResetItemStyleClick = evt => {
    this.onPropertyChange(['isItemStyleConfirm'], false)
    this.changeBuilderStatus(Status.Default)
    this.updateStartButtonPosition()
  }

  handleItemStyleImageClick = evt => {
    const style = evt.currentTarget.dataset.value
    const { config } = this.props
    if (config.itemStyle === style) return
    this.onItemStyleChanged(style)
  }

  editLayoutItemSize = (appConfigAction: AppConfigAction, style: ItemStyle) => {
    const { layoutInfo, appConfig } = this.props
    const cardSize = this.getTemplateSize()?.[style]
    const layoutType = this.getLayoutType()
    if (layoutType === LayoutType.FixedLayout) {
      const { layoutId, layoutItemId } = layoutInfo
      const layout = appConfig.layouts[layoutId]
      const layoutItem = layout?.content?.[layoutItemId]
      const bbox = layoutItem.bbox.set('width', `${cardSize.width}%`).set('height', `${cardSize.height}%`)
      appConfigAction.editLayoutItemProperty(layoutInfo, 'bbox', bbox)
    }
  }

  getTemplateSize = () => {
    const { parentSize } = this.props
    const cardWidth1 = 300
    const cardWidth2 = 540
    const viewportWidth = parentSize?.width || 1280
    const viewportHeight = parentSize?.height || 800
    const templateWidth1 = this.checkTemplateDefaultSize((cardWidth1 * 100) / viewportWidth)
    const templateHeight2 = this.checkTemplateDefaultSize((cardWidth2 * 100) / viewportWidth)
    const templateSize = {
      STYLE0: { width: templateWidth1, height: this.checkTemplateDefaultSize((340 * 100) / viewportHeight) },
      STYLE1: { width: templateWidth1, height: this.checkTemplateDefaultSize((405 * 100) / viewportHeight) },
      STYLE2: { width: templateWidth1, height: this.checkTemplateDefaultSize((391 * 100) / viewportHeight) },
      STYLE3: { width: templateWidth1, height: this.checkTemplateDefaultSize((344 * 100) / viewportHeight) },
      STYLE4: { width: templateWidth1, height: this.checkTemplateDefaultSize((368 * 100) / viewportHeight) },
      STYLE5: { width: templateWidth1, height: this.checkTemplateDefaultSize((407 * 100) / viewportHeight) },
      STYLE6: { width: templateWidth1, height: this.checkTemplateDefaultSize((300 * 100) / viewportHeight) },
      STYLE7: { width: templateWidth1, height: this.checkTemplateDefaultSize((300 * 100) / viewportHeight) },
      STYLE8: { width: templateHeight2, height: this.checkTemplateDefaultSize((200 * 100) / viewportHeight) },
      STYLE9: { width: templateHeight2, height: this.checkTemplateDefaultSize((200 * 100) / viewportHeight) },
      STYLE10: { width: templateWidth1, height: this.checkTemplateDefaultSize((391 * 100) / viewportHeight) }
    }
    return templateSize
  }

  checkTemplateDefaultSize = (size) => {
    if (size > 100) {
      return 100
    } else {
      return size
    }
  }

  getLayoutType = (): LayoutType => {
    const { layoutInfo, appConfig } = this.props
    const layoutId = layoutInfo?.layoutId
    const layoutType = appConfig?.layouts?.[layoutId]?.type
    return layoutType
  }

  onHoverLayoutOpenChange = evt => {
    const { config, id, layouts, browserSizeMode, appConfig } = this.props
    const value = evt.target.checked
    if (config[Status.Hover].enable === value) return
    let action = getAppConfigAction()
    let wJson = appConfig.widgets[id]
    if (config[Status.Hover].enable && !value) {
      // remove hover layout
      const desLayoutId = searchUtils.findLayoutId(
        layouts[Status.Hover],
        browserSizeMode,
        appConfig.mainSizeMode
      )
      action = action.clearLayoutContent(desLayoutId)
      this.changeBuilderStatus(Status.Default)
    } else if (!config[Status.Hover].enable && value) {
      const oriLayoutId = appConfig.widgets[id].layouts[Status.Default][browserSizeMode]
      const desLayoutId = appConfig.widgets[id].layouts[Status.Hover]?.[browserSizeMode]

      desLayoutId && action.removeLayout(desLayoutId)
      const newHoverLayout = action.duplicateLayout(oriLayoutId, false)
      action.editLayoutProperty(newHoverLayout.id, 'label', this.formatMessage('hover'))

      if (newHoverLayout) {
        wJson = wJson.setIn(['layouts', Status.Hover, browserSizeMode], newHoverLayout.id)
        //Because the new layout is the layout of the layoutDuplicate in Large, the parent of the sub-widget still points to the widget of Large,
        //so the layout structure needs to be reconstructed
        // action.clearLayoutStructure(newHoverLayout.id, browserSizeMode, true)
        // action.buildLayoutStructure(newHoverLayout.id, browserSizeMode, true)
      }
      this.changeBuilderStatus(Status.Hover)
    }
    const newConfig = config.setIn([Status.Hover, 'enable'], value)
    action
      .editWidgetProperty(id, 'config', newConfig)
      .editWidgetProperty(wJson.id, 'layouts', wJson.layouts)
      .exec()
  }

  getIsScrollAndWidthOfTemplateCon = () => {
    const { enableA11yForWidgetSettings } = this.props
    const templateConHeight = this.templatesContain?.clientHeight || 0
    const templateConWidth = this.templatesContain?.clientWidth || 0
    const templateConParent = !enableA11yForWidgetSettings ? this.templatesContain?.parentElement?.parentElement : this.templatesContain?.parentElement
    const templateConParentHeight = templateConParent?.clientHeight || 0
    const isStartButtonAbsolute = templateConParentHeight < templateConHeight
    this.setState({
      isTemplateContainScroll: isStartButtonAbsolute,
      templateConWidth: templateConWidth
    })
  }

  updateStartButtonPosition = () => {
    clearTimeout(this.updatePositionTimeout)
    this.updatePositionTimeout = setTimeout(() => {
      this.getIsScrollAndWidthOfTemplateCon()
    }, 500)
  }

  setTemplatesContain = (ref) => {
    const preTemplatesContain = this.templatesContain
    if (ref) {
      this.templatesContain = ref
    }
    if (!preTemplatesContain) {
      this.getIsScrollAndWidthOfTemplateCon()
    }
  }

  renderTemplate = () => {
    const { config, appMode } = this.props
    const { isTemplateContainScroll } = this.state
    const startButtonClass = isTemplateContainScroll
      ? 'position-absolute position-absolute-con'
      : 'position-relative-con'
    return (
      <div ref={ref => { this.setTemplatesContain(ref) }}>
        <SettingSection
          title={this.formatMessage('chooseTemplateTip')}
          className='test'
        >
          <SettingRow role='group' aria-label={this.formatMessage('classic')}>
            <div className='style-group w-100'>
              {appMode !== AppMode.Express && <div className='template-type mb-4 d-flex align-items-center'>
                <span className='template-classic flex-grow-1'>
                  {this.formatMessage('classic')}
                </span>
                <Tooltip
                  title={this.formatMessage('classicTips')}
                  placement='left'
                >
                  <Button type='tertiary' className='inline-block ml-2 tooltip-icon-con' aria-label={this.formatMessage('classicTips')}>
                    <InfoOutlined autoFlip/>
                  </Button>
                </Tooltip>
              </div>}

              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={ItemStyle.Style1}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  className='style-margin-r'
                  title={this.formatMessage('cardClassicTemplateTitle', {
                    index: 1
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style1 && 'active'}`}
                    icon={require('./assets/style2.svg')}
                  />
                </Button>
                <Button
                  data-value={ItemStyle.Style3}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  title={this.formatMessage('cardClassicTemplateTitle', {
                    index: 2
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style3 && 'active'}`}
                    icon={require('./assets/style4.svg')}
                  />
                </Button>
              </div>

              <div className='vertical-space' />
              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={ItemStyle.Style7}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  className='style-margin-r'
                  title={this.formatMessage('cardClassicTemplateTitle', {
                    index: 3
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style7 && 'active'}`}
                    icon={require('./assets/style8.svg')}
                  />
                </Button>
                <div className='flex-grow-1'></div>
              </div>

              <div className='vertical-space' />
              <Button
                data-value={ItemStyle.Style8}
                onClick={this.handleItemStyleImageClick}
                type='tertiary'
                title={this.formatMessage('cardClassicTemplateTitle', {
                  index: 4
                })}
              >
                <Icon
                  autoFlip
                  className={`style-img ${config.itemStyle ===
                    ItemStyle.Style8 && 'active'}`}
                  icon={require('./assets/style9.svg')}
                />
              </Button>

              <div className='vertical-space' />
              <Button
                data-value={ItemStyle.Style9}
                onClick={this.handleItemStyleImageClick}
                type='tertiary'
                title={this.formatMessage('cardClassicTemplateTitle', {
                  index: 5
                })}
              >
                <Icon
                  autoFlip
                  className={`style-img ${config.itemStyle ===
                    ItemStyle.Style9 && 'active'}`}
                  icon={require('./assets/style10.svg')}
                />
              </Button>
            </div>
          </SettingRow>

          {appMode !== AppMode.Express && <SettingRow role='group' aria-label={this.formatMessage('classicHover')}>
            <div className='style-group advance-style-group w-100'>
              <div className='template-type mb-4 d-flex align-items-center'>
                <span className='template-classic flex-grow-1'>
                  {this.formatMessage('classicHover')}
                </span>
                <Tooltip
                  title={this.formatMessage('classicHoverTips')}
                  placement='left'
                >
                  <Button type='tertiary' className='inline-block ml-2 tooltip-icon-con' aria-label={this.formatMessage('classicHoverTips')}>
                    <InfoOutlined autoFlip/>
                  </Button>
                </Tooltip>
              </div>

              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={ItemStyle.Style0}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  className='style-margin-r'
                  title={this.formatMessage('cardAdvancedTemplateTitle', {
                    index: 1
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style0 && 'active'}`}
                    icon={require('./assets/style1.svg')}
                  />
                </Button>
                <Button
                  data-value={ItemStyle.Style2}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  title={this.formatMessage('cardAdvancedTemplateTitle', {
                    index: 2
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style2 && 'active'}`}
                    icon={require('./assets/style3.svg')}
                  />
                </Button>
              </div>

              <div className='vertical-space' />
              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={ItemStyle.Style4}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  className='style-margin-r'
                  title={this.formatMessage('cardAdvancedTemplateTitle', {
                    index: 3
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style4 && 'active'}`}
                    icon={require('./assets/style5.svg')}
                  />
                </Button>
                <Button
                  data-value={ItemStyle.Style5}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  title={this.formatMessage('cardAdvancedTemplateTitle', {
                    index: 4
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style5 && 'active'}`}
                    icon={require('./assets/style6.svg')}
                  />
                </Button>
              </div>

              <div className='vertical-space' />
              <div className='d-flex justify-content-between w-100'>
                <Button
                  data-value={ItemStyle.Style6}
                  onClick={this.handleItemStyleImageClick}
                  type='tertiary'
                  className='style-margin-r'
                  title={this.formatMessage('cardAdvancedTemplateTitle', {
                    index: 5
                  })}
                >
                  <Icon
                    autoFlip
                    className={`style-img style-img-h ${config.itemStyle ===
                      ItemStyle.Style6 && 'active'}`}
                    icon={require('./assets/style7.svg')}
                  />
                </Button>
                <div className='flex-grow-1'></div>
              </div>

              <div className='vertical-space' />
              <Button
                data-value={ItemStyle.Style10}
                type='tertiary'
                className={`style-img empty  text-center  pr-1 pl-1 text-truncate ${config.itemStyle ===
                  ItemStyle.Style10 && 'active'}`}
                onClick={this.handleItemStyleImageClick}
                title={this.formatMessage('emptyTemplate')}
              >
                {this.formatMessage('emptyTemplate')}
              </Button>
            </div>
          </SettingRow>}
          <SettingRow>
            <div className='start-con w-100' css={this.getStartButtonStyle()}>
              <div className={startButtonClass}>
                <Button
                  className="w-100"
                  type='primary'
                  title={this.formatMessage('start')}
                  onClick={this.handleItemStyleConfirmClick}
                >
                  {this.formatMessage('start')}
                </Button>
              </div>
            </div>
          </SettingRow>
        </SettingSection>
      </div>
    )
  }

  getStartButtonStyle = (): SerializedStyles => {
    const { theme } = this.props
    const { templateConWidth } = this.state
    return css`
      &.start-con {
        & {
          height: ${polished.rem(64)};
          margin-top: ${polished.rem(-16)};
        }
        .position-absolute-con, .position-relative-con {
          margin-left: ${polished.rem(-16)};
        }
        div{
          padding: ${polished.rem(16)};
          background: ${theme.ref.palette.neutral[400]};
          left: 1rem;
          bottom: 0;
          width: ${templateConWidth ? `${templateConWidth}px` : '100%'}
        }
      }
    `
  }

  editStatus = (status: Status) => {
    const { id } = this.props
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'showCardSetting',
      value: status
    })
    this.changeBuilderStatus(status)
  }

  handleShowRegularClick = () => {
    const { openSettingStatus } = this.state
    if (openSettingStatus !== OpenSettingStatus.Default) {
      this.setState({
        openSettingStatus: OpenSettingStatus.Default
      })
      this.editStatus(Status.Default)
    } else {
      this.setState({
        openSettingStatus: OpenSettingStatus.None
      })
    }
  }

  handleShowHoverClick = () => {
    const { config } = this.props
    const { openSettingStatus } = this.state
    if (openSettingStatus !== OpenSettingStatus.Hover) {
      this.setState({
        openSettingStatus: OpenSettingStatus.Hover
      })
      config[Status.Hover].enable && this.editStatus(Status.Hover)
    } else {
      this.setState({
        openSettingStatus: OpenSettingStatus.None
      })
    }
  }

  renderCardSetting = () => {
    const { selectionIsInSelf } = this.props
    const statusIntl: { [key: string]: string } = {}
    statusIntl[Status.Hover] = this.formatMessage('hoverCard')
    statusIntl[Status.Default] = this.formatMessage('default')
    return (
      <div className='card-setting'>
        <SettingSection>
          {/* <SettingRow label={'export style'}>
            <Button type="primary" onClick={this.onExportClick} >Test</Button>
          </SettingRow> */}
          <SettingRow flow='wrap'>
            <div className='w-100 d-flex align-items-center'>
              <Button className='resetting-template flex-grow-1 text-left d-block' title={this.formatMessage('chooseOtherTemplateTip')} type='tertiary' disableHoverEffect={true} disableRipple={true} onClick={this.handleResetItemStyleClick} ref={ ref => { this.resettingTheTemplateButtonRef = ref } }>
                {this.formatMessage('chooseOtherTemplateTip')}
              </Button>
              <Tooltip
                title={this.formatMessage('useTips')}
                showArrow
                placement='left'
              >
                <Button className='tooltip-icon-con' type='tertiary' aria-label={this.formatMessage('useTips')}>
                  <InfoOutlined autoFlip/>
                </Button>
              </Tooltip>
            </div>
          </SettingRow>
          {!selectionIsInSelf && <SettingRow>
            <LinkSelector
              onSettingConfirm={this.onSettingLinkConfirm}
              linkParam={this.props.config.linkParam}
              useDataSources={this.props.useDataSources}
            />
          </SettingRow>}
        </SettingSection>
        {!selectionIsInSelf && this.renderRegularSetting()}
        {!selectionIsInSelf && this.renderHoverSetting()}
      </div>
    )
  }

  renderRegularSetting = () => {
    const { openSettingStatus } = this.state

    return (
      <SettingSection role='group' aria-label={this.formatMessage('default')}>
        <CollapsablePanel
          label={this.formatMessage('default')}
          isOpen={openSettingStatus === OpenSettingStatus.Default}
          role='group'
          aria-label={this.formatMessage('default')}
          onRequestOpen={this.handleShowRegularClick}
          onRequestClose={this.handleShowRegularClick}>
          {this.renderBgSetting(Status.Default)}
        </CollapsablePanel>
      </SettingSection>
    )
  }

  enableHover = (evt) => {
    const value = evt.target.checked
    const { config } = this.props

    const newConfig = config.setIn([Status.Hover, 'enable'], value)
    if (!value) {
      this.editStatus(Status.Default)
    } else {
      this.editStatus(Status.Hover)
    }
    this.setLayoutAuto(newConfig)
  }

  initCardStatusInWidgetState = (preConfig: IMConfig) => {
    const { config } = this.props
    const enableHover = config?.[Status.Hover]?.enable
    if (preConfig?.[Status.Hover]?.enable !== enableHover) {
      if (!enableHover) {
        this.editStatus(Status.Default)
      }
    }
  }

  renderHoverSetting = () => {
    const { config, id, appConfig, layouts, browserSizeMode, appMode, onSettingChange } = this.props
    const { openSettingStatus } = this.state
    const transitionInfo = config?.transitionInfo?.transition
      ? config.transitionInfo
      : defaultTransitionInfo
    return (
      <SettingSection role='group' aria-label={this.formatMessage('hoverCard')}>
        <CollapsablePanel
          label={this.formatMessage('hoverCard')}
          isOpen={openSettingStatus === OpenSettingStatus.Hover}
          onRequestOpen={this.handleShowHoverClick}
          onRequestClose={this.handleShowHoverClick}>
          <SettingRow></SettingRow>
          <SettingRow className='enable-hover-con' tag='label' label={this.formatMessage('enableHover')}>
            <Switch
              checked={config[Status.Hover].enable}
              onChange={this.enableHover}
              title={this.formatMessage('enableHover')}
            />
          </SettingRow>
          {config[Status.Hover].enable && (
            <Fragment>
              {this.renderBgSetting(Status.Hover)}
              <SettingSection className='clear-padding' title={this.formatMessage('cardTransition')} aria-label={this.formatMessage('cardTransition')}>
                <SettingRow
                  flow='wrap'
                  role='group'
                >
                  <TransitionSetting
                    transition={transitionInfo?.transition}
                    showOneByOne={false}
                    onTransitionChange={this.onTransitionSettingChange}
                    onPreviewTransitionClicked={this.previewTransition}
                    onPreviewAsAWhoneClicked={this.previewTransitionAndOneByOne}
                    formatMessage={this.formatMessage}
                    transitionLabel={this.formatMessage('cardWidgetState')}
                  />
                </SettingRow>
              </SettingSection>
              {appMode === AppMode.Design && <CardLayoutSetting
                id={id}
                onSettingChange={onSettingChange}
                cardLayout={config.cardLayout}
                status={Status.Hover}
                browserSizeMode={browserSizeMode}
                mainSizeMode={appConfig.mainSizeMode}
                layouts={layouts}
                config={config}
                appConfig={appConfig}
                isCardWidget
              />}
            </Fragment>
          )}
        </CollapsablePanel>
      </SettingSection>
    )
  }

  setLayoutAuto = (newConfig: IMConfig, status = Status.Hover) => {
    const { layouts, appConfig, id } = this.props
    const option: SwitchCardLayoutOption = {
      layout: CardLayout.AUTO,
      config: newConfig,
      widgetId: id,
      appConfig: appConfig,
      status: Status.Hover,
      isCardWidget: true,
      layouts: layouts?.asMutable({ deep: true }),
      mainSizeMode: appConfig.mainSizeMode
    }
    setLayoutAuto(option)
  }

  onSectionOneByOneEffectSettingChange = (
    animationSetting: AnimationSetting
  ) => {
    let transitionInfo: any = this.props?.config?.transitionInfo
    transitionInfo = (transitionInfo?.transition || transitionInfo?.oneByOneEffect)
      ? transitionInfo.asMutable({ deep: true })
      : defaultTransitionInfo
    transitionInfo.oneByOneEffect = animationSetting
    transitionInfo.previewId = getNextAnimationId()
    this.onConfigChange(['transitionInfo'], Immutable(transitionInfo))
  }

  onTransitionSettingChange = (transition: Transition) => {
    let transitionInfo: any = this.props?.config?.transitionInfo
    transitionInfo = (transitionInfo?.transition || transitionInfo?.oneByOneEffect)
      ? transitionInfo.asMutable({ deep: true })
      : defaultTransitionInfo
    transitionInfo.transition = transition
    transitionInfo.previewId = getNextAnimationId()
    this.onConfigChange(['transitionInfo'], Immutable(transitionInfo))
  }

  previewTransition = () => {
    this.onConfigChange(['transitionInfo', 'previewId'], getNextAnimationId())
  }

  previewOneByOneInSection = () => {
    this.onConfigChange(['transitionInfo', 'previewId'], getNextAnimationId())
  }

  previewTransitionAndOneByOne = () => {
    this.onConfigChange(['transitionInfo', 'previewId'], getNextAnimationId())
  }

  render () {
    const { config, enableA11yForWidgetSettings } = this.props
    return (
      <div
        className={classNames(`${prefix}card-setting`, `${prefix}setting`, {'card-setting-con-with-template-scroll': enableA11yForWidgetSettings && !config.isItemStyleConfirm})}
        css={this.getStyle(this.props.theme)}
      >
        {!config.isItemStyleConfirm
          ? (
              this.renderTemplate()
            )
          : (
            <Fragment>{this.renderCardSetting()}</Fragment>
            )}
      </div>
    )
  }
}
