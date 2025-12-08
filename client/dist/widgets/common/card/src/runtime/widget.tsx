/** @jsx jsx */
import {
  React,
  type IMState,
  classNames,
  css,
  jsx,
  type AllWidgetProps,
  type IMThemeVariables,
  type SerializedStyles,
  AppMode,
  type BrowserSizeMode,
  appActions,
  type IMAppConfig,
  getAppStore,
  ReactResizeDetector,
  defaultMessages as jimuUIMessages,
  lodash,
  type IMUrlParameters,
  utils
} from 'jimu-core'
import { WidgetPlaceholder, Paper } from 'jimu-ui'
import { type IMConfig, Status, type ElementSize } from '../config'
import CardEditor from './components/card-editor'
import CardViewer from './components/card-viewer'
import {
  LayoutEntry,
  searchUtils,
  LayoutItemSizeModes
} from 'jimu-layouts/layout-runtime'

import defaultMessages from './translations/default'

interface Props {
  selectionIsSelf: boolean
  selectionIsInSelf: boolean
  selectionStatus: Status
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  builderStatus: Status
  isRTL: boolean
  left: number | string
  top: number | string
  isWidthAuto: boolean
  isHeightAuto: boolean
  queryObject: IMUrlParameters
  parentSize: ElementSize
}

interface States {
  LayoutEntry: any
  hideCardTool: boolean
  isSetlayout: boolean
}

export class Widget extends React.PureComponent<
AllWidgetProps<IMConfig> & Props,
States
> {
  widgetConRef = React.createRef<HTMLDivElement>()
  debounceOnResize: ({ width, height }) => void

  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetProps<IMConfig>
  ): Props => {
    const appConfig = state && state.appConfig
    const { layouts, layoutId, layoutItemId, builderSupportModules, id } = props
    const browserSizeMode = state?.browserSizeMode
    const builderStatus =
      (state?.widgetsState[props.id] &&
        state?.widgetsState[props.id]?.builderStatus) ||
      Status.Default

    const selection = state && state.appRuntimeInfo && state.appRuntimeInfo.selection

    const selectionIsInSelf =
      selection &&
      builderSupportModules &&
      builderSupportModules.widgetModules &&
      builderSupportModules.widgetModules.selectionInCard(
        selection,
        id,
        appConfig,
        false
      )
    let selectionStatus
    if (selectionIsInSelf) {
      selectionStatus = Object.keys(layouts).find(
        status =>
          searchUtils.findLayoutId(
            layouts[status],
            browserSizeMode,
            appConfig.mainSizeMode
          ) === selection.layoutId
      )
    }

    const layout = appConfig.layouts?.[layoutId]
    const layoutSetting = layout?.content?.[layoutItemId]?.setting
    const isHeightAuto =
      layoutSetting?.autoProps?.height === LayoutItemSizeModes.Auto ||
      layoutSetting?.autoProps?.height === true
    const isWidthAuto =
      layoutSetting?.autoProps?.width === LayoutItemSizeModes.Auto ||
      layoutSetting?.autoProps?.width === true

    let widgetPosition
    if (window.jimuConfig.isInBuilder) {
      const bbox = appConfig.layouts?.[layoutId]?.content?.[layoutItemId]?.bbox
      widgetPosition = bbox && {
        left: bbox.left,
        top: bbox.top
      }
    }
    const selectionIsSelf =
      selection?.layoutId === layoutId &&
      selection?.layoutItemId === layoutItemId
    return {
      selectionIsSelf: selectionIsSelf,
      selectionIsInSelf,
      selectionStatus,
      appMode: state?.appRuntimeInfo?.appMode,
      browserSizeMode: state?.browserSizeMode,
      builderStatus: builderStatus,
      isRTL: state?.appContext?.isRTL,
      left: widgetPosition && widgetPosition.left,
      top: widgetPosition && widgetPosition.top,
      isHeightAuto,
      isWidthAuto,
      queryObject: state.queryObject,
      parentSize: state.widgetsState[props.id]?.parentSize || null
    }
  }

  constructor (props) {
    super(props)
    const stateObj: States = {
      LayoutEntry: null,
      hideCardTool: false,
      isSetlayout: false
    }

    if (window.jimuConfig.isInBuilder) {
      stateObj.LayoutEntry = this.props.builderSupportModules.LayoutEntry
    } else {
      stateObj.LayoutEntry = LayoutEntry
    }
    this.state = stateObj
    // this.editWidgetConfig('builderStatus', Status.Default);

    this.onResize = this.onResize.bind(this)
    this.selectSelf = this.selectSelf.bind(this)
    this.debounceOnResize = lodash.debounce(
      ({ width, height }) => { this.onResize(width, height) },
      200
    )
  }

  componentDidUpdate (preProps, preState) {
    const { appMode, selectionStatus, builderStatus, left, top } = this.props
    if (
      appMode === AppMode.Design &&
      selectionStatus !== builderStatus &&
      selectionStatus
    ) {
      // clear show selected only
      // change status by toc
      this.editBuilderAndSettingStatus(selectionStatus)
    }

    if (preProps.appMode !== appMode && appMode !== AppMode.Design) {
      this.editBuilderAndSettingStatus(Status.Default)
    }

    if (preProps?.selectionIsInSelf !== this.props?.selectionIsInSelf) {
      this.setSelectionStatus()
    }

    if (top !== preProps.top || left !== preProps.left) {
      this.updateCardToolPosition()
    }
    this.setSettingLayout()
    this.setListParentSizeInWidgetState()
  }

  setListParentSizeInWidgetState = () => {
    const { browserSizeMode, id, parentSize, layoutId } = this.props
    const appConfig = getAppStore().getState().appConfig
    const viewportSize = utils.findViewportSize(appConfig, browserSizeMode)

    const selector = `div.layout[data-layoutid=${layoutId}]`
    const parentElement = document.querySelector(selector)
    const newParentSize = {
      width: parentElement?.clientWidth || viewportSize.width,
      height: parentElement?.clientHeight || viewportSize.height
    }
    if (!parentSize || parentSize.height !== newParentSize.height || parentSize.width !== newParentSize.width) {
      this.props.dispatch(appActions.widgetStatePropChange(id, 'parentSize', newParentSize))
    }
  }

  setSelectionStatus = () => {
    const { id, selectionIsInSelf } = this.props
    this.props.dispatch(
      appActions.widgetStatePropChange(
        id,
        'selectionIsInSelf',
        selectionIsInSelf
      )
    )
  }

  setSettingLayout = () => {
    const { layoutId, layoutItemId, id, selectionIsSelf } = this.props
    const { isSetlayout } = this.state
    if (layoutId && id && layoutItemId && !isSetlayout && selectionIsSelf) {
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'layoutInfo', {
          layoutId,
          layoutItemId
        })
      )
      this.setState({
        isSetlayout: true
      })
    }
  }

  onResize = (width, height) => {
    this.updateCardToolPosition()
  }

  updateCardToolTimeout
  private readonly updateCardToolPosition = () => {
    const { selectionIsSelf } = this.props
    if (!selectionIsSelf) return
    this.setState({
      hideCardTool: true
    })
    if (this.updateCardToolTimeout) {
      clearTimeout(this.updateCardToolTimeout)
      this.updateCardToolTimeout = undefined
    }
    this.updateCardToolTimeout = setTimeout(() => {
      this.setState({
        hideCardTool: false
      })
    }, 500)
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: { ...defaultMessages, ...jimuUIMessages }[id] },
      values
    )
  }

  // call exec manuly
  editStatus = (name, value) => {
    const { dispatch, id } = this.props
    dispatch(appActions.widgetStatePropChange(id, name, value))
  }

  editWidgetConfig = newConfig => {
    if (!window.jimuConfig.isInBuilder) return

    const appConfigAction = this.props.builderSupportModules.jimuForBuilderLib.getAppConfigAction()
    appConfigAction.editWidgetConfig(this.props.id, newConfig).exec()
  }

  isEditing = (): boolean => {
    const { appMode, config, selectionIsSelf, selectionIsInSelf } = this.props
    if (!window.jimuConfig.isInBuilder) return false
    return (
      (selectionIsSelf || selectionIsInSelf) &&
      window.jimuConfig.isInBuilder &&
      appMode === AppMode.Design &&
      config.isItemStyleConfirm
    )
  }

  checkIsShowMask = (): boolean => {
    const { appMode, config } = this.props
    if (!window.jimuConfig.isInBuilder) return false
    return !(
      window.jimuConfig.isInBuilder &&
      appMode === AppMode.Design &&
      config.isItemStyleConfirm
    )
  }

  editBuilderAndSettingStatus = (status: Status) => {
    this.editStatus('showCardSetting', status)
    this.editStatus('builderStatus', status)
  }

  getAppConfig = (): IMAppConfig => {
    return getAppStore().getState().appConfig
  }

  getStyle = (theme: IMThemeVariables): SerializedStyles => {
    const { id } = this.props
    return css`
      ${'&.card-widget-' + id} {
        overflow: visible;
        background-color: transparent;
        width: 100%;
        height: 100%;
      }
      &:has(a.list-link:focus) {
        outline: 2px solid ${theme.sys.color.action.focus} !important;
      }
    `
  }

  getCardProps = () => {
    const {
      config,
      selectionIsInSelf,
      selectionIsSelf,
      builderStatus,
      appMode,
      queryObject
    } = this.props
    const isEditor = window.jimuConfig.isInBuilder && appMode === AppMode.Design
    const editProps = isEditor
      ? {
          hideCardTool: this.state.hideCardTool,
          selectionIsCard: selectionIsSelf,
          selectionIsInCard: selectionIsInSelf,
          isEditing: this.isEditing(),
          isShowMask: this.checkIsShowMask(),
          builderStatus: builderStatus,
          selectSelf: this.selectSelf
        }
      : {
          linkParam: config.linkParam,
          queryObject: queryObject
        }
    return {
      ...this.getOtherProps(),
      ...editProps
    }
  }

  getOtherProps = () => {
    const {
      config,
      theme,
      id,
      appMode,
      builderSupportModules,
      layouts,
      browserSizeMode,
      dispatch,
      isRTL,
      isHeightAuto,
      isWidthAuto
    } = this.props
    return {
      browserSizeMode: browserSizeMode,
      isRTL: isRTL,
      builderSupportModules: builderSupportModules,
      formatMessage: this.formatMessage,
      dispatch: dispatch,
      widgetId: id,
      interact:
        window.jimuConfig.isInBuilder &&
        builderSupportModules.widgetModules.interact,
      appMode: appMode,
      theme: theme,
      LayoutEntry: this.state.LayoutEntry,
      layouts: layouts,
      cardConfigs: config,
      isHeightAuto: isHeightAuto,
      isWidthAuto: isWidthAuto,
      cardLayout: config?.cardLayout
    }
  }

  cardRender = () => {
    const props = this.getCardProps()
    const { appMode } = this.props
    const isEditor = window.jimuConfig.isInBuilder && appMode === AppMode.Design
    const Card = isEditor ? CardEditor : CardViewer
    return <Card {...props} />
  }

  selectSelf = () => {
    if (!window.jimuConfig.isInBuilder) return false
    const { layoutId, layoutItemId } = this.props

    const layoutInfo = { layoutId, layoutItemId }
    this.props.dispatch(appActions.selectionChanged(layoutInfo))
  }

  render () {
    const { config, id } = this.props
    const classes = classNames(
      'jimu-widget',
      'widget-card',
      'card-widget-' + id
    )

    if (!config.itemStyle) {
      return (
        <WidgetPlaceholder
          name={this.formatMessage('_widgetLabel')}
          icon={require('./assets/icon.svg')}
          message={this.formatMessage('placeHolderTip')}
        />
      )
    }

    return (
      <Paper transparent role='group' aria-label={this.formatMessage('_widgetLabel')} className={classes} css={this.getStyle(this.props.theme)} ref={this.widgetConRef}>
        {this.cardRender()}
        <ReactResizeDetector
          targetRef={this.widgetConRef}
          handleWidth
          handleHeight
          onResize={this.debounceOnResize}
        />
      </Paper>
    )
  }
}

export default Widget
