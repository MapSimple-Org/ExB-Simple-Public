/** @jsx jsx */
import {
  React, type IMState, jsx, type IMAppConfig, type IMAppInfo, type AllWidgetProps,
  type BrowserSizeMode, appActions, AppMode, getAppStore, urlUtils,
  focusElementInKeyboardMode,
  type IntlShape
} from 'jimu-core'
import { type IMConfig, UiMode, ItemsName, ErrorInfo } from '../config'
import { type AutoPlacementOptions, Button, Icon, Paper, Popper, type ShiftOptions, defaultMessages } from 'jimu-ui'
import { getStyle, getPopupStyle } from './style'
import { ContentHeader } from './components/content-header'
import { getDefaultIconConfig } from '../common/default-icon-utils'
import nls from './translations/default'
// shortLink
import * as ShortLinkUtil from './components/short-link'
// items
import { ShownMode, ExpandType } from './components/items/base-item'
import { ShareLink } from './components/items/sharelink'
import { QRCode } from './components/items/qr-code'
import { Embed } from './components/items/embed'
import { ItemsList } from './components/items-list'

import { versionManager } from '../version-manager'
import { getUrlWithoutLastSplash } from './components/items/utils'

interface ExtraProps {
  appConfig: IMAppConfig
  appInfo: IMAppInfo
  browserSizeMode: BrowserSizeMode
  isLiveViewMode: boolean
}

interface State {
  sharedUrl: string // processed-url for sharing/shown

  // ui
  uiMode: UiMode
  isFetchingShortLink: boolean
  // popup
  isPopupOpen: boolean
  shownItem?: ItemsName // e.g QRCode tiled the popup
  isLiveViewMode: boolean
  // controller
  isControllerOffPanelStyle: boolean
  isPopupInController: boolean
  // a11y
  a11yPopperAutoFocus: boolean
  a11yFocusElement: string

  // Failed to fetch short link
  errorInfo: ErrorInfo
}

const autoPlacementOptions: AutoPlacementOptions = {
  alignment: 'start',
  allowedPlacements: ['right-start', 'left-start']
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & ExtraProps, State> {
  private readonly btnRef: React.RefObject<any>
  private popperRef: React.RefObject<any>

  private readonly _cached = {
    currentUrl: '',
    shortUrl: '', // use longUrl to exchanged from the backend, '' means haven't fetch shortUrl
    enableShortUrl: true, // ref for remember whether is isShortUrl
    _urlAttachedOrg: '', // just for testing
    _debug: false
  }

  static versionManager = versionManager
  static mapExtraStateProps = (state: IMState, ownProps: AllWidgetProps<IMConfig>): ExtraProps => {
    const appMode = (state && state.appRuntimeInfo && state.appRuntimeInfo.appMode)
    return {
      appConfig: state.appConfig,
      appInfo: state.appInfo,
      browserSizeMode: state.browserSizeMode,
      isLiveViewMode: (appMode === AppMode.Run)
    }
  }

  constructor (props) {
    super(props)

    this.state = {
      sharedUrl: '',

      // ui
      uiMode: UiMode.Popup,
      isFetchingShortLink: false,
      isPopupOpen: false,
      shownItem: null,
      isLiveViewMode: false,
      // in controller
      isControllerOffPanelStyle: false,
      isPopupInController: false,
      // a11y
      a11yPopperAutoFocus: true,
      a11yFocusElement: null,

      errorInfo: null
    }

    // cached for comparison
    this._cached = {
      currentUrl: '',
      shortUrl: '',
      enableShortUrl: true,
      _urlAttachedOrg: '',
      _debug: false
    }

    this.btnRef = React.createRef()
    this.popperRef = React.createRef()
  }

  componentDidMount () {
    const { layoutId, layoutItemId, id } = this.props
    this.props.dispatch(appActions.widgetStatePropChange(id, 'layoutInfo', { layoutId, layoutItemId }))

    this.updateUrls({ enableShortUrl: this._cached.enableShortUrl }) // init sharedUrl/shortUrl, otherwise, it will be slower to open when using it.
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State) {
    // app url changed, need to update
    if (this._cached.currentUrl !== this.getCurrentAppUrl()) {
      this.updateUrls({ enableShortUrl: this._cached.enableShortUrl })
    }

    const { uiMode } = this.props.config
    // change UI-mode
    if (this.props.config?.uiMode !== this.state.uiMode) {
      this.setState({ // when uiMode changed in setting
        shownItem: null,
        isPopupOpen: false
      })
    }

    // is share-contents in Controller
    // new & offPanel add a new style, otherwise, keep the behavior of the old widget ,#21271
    if (this.isParentWidgetIsController(prevProps) && this.props.offPanel) {
      this.setState({ isControllerOffPanelStyle: true })
    } else {
      this.setState({ isControllerOffPanelStyle: false })
    }

    if (uiMode === UiMode.Popup && this.isParentWidgetIsController(prevProps)) {
      this.setState({ isPopupInController: true })// Tile popup content in Controller
    } else {
      this.setState({ isPopupInController: false })
    }

    this.setUiMode(uiMode)

    // LiveViewMode changed
    this.closePopperWhenLiveViewModeChange()

    // close popper, when widget config has changed, #18072
    if (this.props.config !== prevProps.config) {
      this.onTogglePopup(false)
    }

    // a11y
    const a11ySkipAndReset508 = this.a11yIsSkipAndReset508(this.props.config, prevProps.config)
    if (a11ySkipAndReset508) {
      this.setState({
        a11yPopperAutoFocus: true,
        a11yFocusElement: null
      })
    } else {
      // focus back to Btn, when Popper closed
      this.a11yFocusOnBtnRefWhenPopupClosed(uiMode, prevState)

      this.a11yHandlers(prevState)
    }
  }

  getCurrentAppUrl () {
   return getUrlWithoutLastSplash(window.location.href)
  }

  private isParentWidgetIsController (prevProps: AllWidgetProps<IMConfig>) {
    return (!!prevProps.controllerWidgetId) // supports off panel in controller ,#21682
  }

  private closePopperWhenLiveViewModeChange () {
    const { isLiveViewMode } = this.props

    if (isLiveViewMode !== this.state.isLiveViewMode) {
      this.onTogglePopup(false)
    }
    this.setState({ isLiveViewMode: isLiveViewMode })
  }

  // urls
  private readonly onShownUrlChange = (sharedUrl: string) => {
    this.setState({ sharedUrl: sharedUrl })
  }

  onShortUrlChange = (shortUrl: string) => {
    this._cached.shortUrl = shortUrl
    if (this._cached._debug) {
      console.log('_cached.shortUrl==>  ' + this.state.sharedUrl)
    }

    if (shortUrl) {
      this.onShownUrlChange(shortUrl)
    }
  }

  // try to fetch shortUrl
  updateUrls = (options?: { enableShortUrl?: boolean, urlExcludedUrlParams?: string }): void => {
    const excludedUrlParamsFlag = !!(options?.urlExcludedUrlParams) // exclude Url params
    const { enableShortUrl = true, urlExcludedUrlParams = this.getCurrentAppUrl() } = options ?? {}

    const longUrl = excludedUrlParamsFlag ? urlExcludedUrlParams : this.getCurrentAppUrl()
    const href = this.attachOrgUrlKey(longUrl)

    this._cached.currentUrl = this.getCurrentAppUrl()
    this._cached.shortUrl = ''
    this._cached.enableShortUrl = enableShortUrl
    this._cached._urlAttachedOrg = href

    if (enableShortUrl) {
      this.setState({ isFetchingShortLink: true }) // loading
      // 1. use short url: try to set short url
      ShortLinkUtil.fetchShortLink(href).then((shortUrl) => {
        this.onShortUrlChange(shortUrl)
        this.setState({ isFetchingShortLink: false, errorInfo: null }) // loading
      }, (failedInfo) => {
        if (failedInfo.reason === ErrorInfo.UrlIsTooLong) {
          this.setState({ errorInfo: ErrorInfo.UrlIsTooLong })
        }

        this.onShownUrlChange(href) // failed to fetch shortUrl
        this.setState({ isFetchingShortLink: false }) // loading
      })
    } else {
      //2. use long url
      this.onShownUrlChange(href)
    }

    if (this._cached._debug) {
      console.log('\nShare info:')
      console.log('isShortUrl==>' + enableShortUrl)
      console.log('isIncludeUrlParams==>' + !excludedUrlParamsFlag)
      console.log('_cached.currentUrl==>' + this._cached.currentUrl)
    }
  }

  handleError = (type?: string): void => {
    if (!type || type === 'clear') {
      this.setState({ errorInfo: null })
    }
  }

  // complete url(including ?org=<url-key>), but may not include UrlParams
  attachOrgUrlKey = (href: string): string => {
    let url = href

    const appState = getAppStore().getState()
    const urlKey = appState?.portalSelf?.urlKey
    if (urlKey) {
      url = urlUtils.updateQueryStringParameter(url, 'org', urlKey)
    }

    return url
  }

  // ui
  private readonly setUiMode = (mode: UiMode) => {
    this.setState({
      uiMode: mode,
      a11yPopperAutoFocus: true // reset this a11y flag
    })
  }

  // content
  onItemClick = (name: ItemsName, ref: React.RefObject<any>, type: ExpandType, isUpdateUrl: boolean) => {
    // if (isUpdateUrl) {
    //   this.updateUrls()
    // }

    if (name && ref) {
      if (this.state.uiMode === UiMode.Popup && !this.state.isPopupInController) {
        this.onOpenPopup(true)
      } else if (this.state.uiMode === UiMode.Inline && type === ExpandType.ShowInPopup) {
        this.onOpenPopup(true)
      }

      this.onContentChange(name, ref)
    } // else just updateUrls
  }

  onContentChange = (name: ItemsName, ref: React.RefObject<any>) => {
    this.popperRef = ref
    this.setState({ shownItem: name })
  }

  // popup
  private readonly onPopupBtnClick = () => {
    this.onTogglePopup()
  }

  onTogglePopup = (command?: boolean) => {
    let isOpen
    if (typeof command !== 'undefined') {
      isOpen = command
    } else {
      isOpen = !this.state.isPopupOpen
    }

    if (isOpen === false) {
      this.onBackBtnClick()// back to main content
    }

    this.setState({ isPopupOpen: isOpen })
  }

  onOpenPopup = (isOpen: boolean) => {
    //this.updateUrls()
    this.setState({ isPopupOpen: isOpen })
  }

  // popup's toggle handler
  onPopperToggleHandler = (evt: React.MouseEvent<HTMLElement>) => {
    this.onTogglePopup()
  }

  onBackBtnClick = () => {
    this.setState({ shownItem: null })
  }

  getRefByUiMode = () => {
    let ref = null
    if (UiMode.Popup === this.props.config.uiMode && !this.state.isPopupInController) {
      ref = this.btnRef
    } else /* if (UiMode.Popup === this.props.config.uiMode && this.state.isPopupInController) */ {
      ref = this.popperRef
    } /* else if (UiMode.Inline === this.props.config.uiMode) {
      ref = this.popperRef;
    } else if (UiMode.Slide === this.props.config.uiMode) {
      ref = this.popperRef;
    } */

    return ref
  }
  // popup

  getAppTitle = (): string => {
    // console.log('getAppTitle  ', this.props.appInfo.name);
    // console.log('getAppSummary  ', this.props.appInfo.snippet);
    return this.props.appInfo.name
  }

  getPopupTitle = (intl: IntlShape,shownItem:ItemsName) => {
    let popupTitle = intl.formatMessage({ id: 'popupTitle', defaultMessage: nls.popupTitle })
    if (shownItem === ItemsName.QRcode) {
      popupTitle = intl.formatMessage({ id: 'qrcodeTitle', defaultMessage: nls.qrcodeTitle })
    } else if (shownItem === ItemsName.Sharelink) {
      popupTitle = intl.formatMessage({ id: 'shareLinkTitle', defaultMessage: nls.shareLinkTitle })
    } else if (shownItem === ItemsName.Embed) {
      popupTitle = intl.formatMessage({ id: 'embedTitle', defaultMessage: nls.embedTitle })
    }
    return popupTitle
  }

  render () {
    const isRenderPopper = this.state.isPopupOpen
    const { sharedUrl, shownItem, uiMode } = this.state
    const { config, theme, intl } = this.props
    const shownMode = ShownMode.Content
    // popup
    const tooltip = this.props.config.popup.tooltip
    const icon = this.props.config.popup.icon ? this.props.config.popup.icon : getDefaultIconConfig(this.props.theme)
    // keep show the popup, when trigger Email/FB/Twitter/Pinterest/Linkedin
    const isHideMainContentInPopupMode = [ItemsName.Embed, ItemsName.QRcode, ItemsName.Sharelink].includes(shownItem)
    // 508
    const isShowHeader = !(this.state.shownItem === null && this.state.isPopupInController)// hide header when Sharelink in Controller
    const popupTitle= this.getPopupTitle(this.props.intl,this.state.shownItem)

    const shiftOptions: ShiftOptions = {
      mainAxis: true,
      crossAxis: true,
    }

    // mainContent
    const mainContent = <React.Fragment>
      {/* 1.header */}
      <ContentHeader
        intl={this.props.intl}
        uiMode={this.state.uiMode}
        shownItem={this.state.shownItem}
        isPopupInController={this.state.isPopupInController}
        isShow={isShowHeader}
        popupTitle={popupTitle}
        onBackBtnClick={this.onBackBtnClick}
        onPopupBtnClick={this.onPopupBtnClick}
      ></ContentHeader>
      {/* 2.default popup content */}
      {(uiMode === UiMode.Popup) &&
        <div className={'popup-mode-content ' + (isHideMainContentInPopupMode ? 'd-none ' : '')}>
          <ShareLink
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal
            config={config} theme={theme} intl={intl}

            onItemClick={this.onItemClick}
            onShortUrlChange={this.onShortUrlChange}
            updateUrls={this.updateUrls}
            getAppTitle={this.getAppTitle}
            // error
            errorInfo={this.state.errorInfo}
            handleError={this.handleError}
            // loading
            isFetchingShortLink={this.state.isFetchingShortLink}

            isShowing={true}
          />
          <div className='items popup-item-buttons-wrapper'>
            <ItemsList
              sharedUrl={this.state.sharedUrl}
              uiMode={uiMode}
              isShowInModal
              // shownItem={this.state.shownItem}
              theme={theme} intl={intl} config={config}

              onShortUrlChange={this.onShortUrlChange}
              updateUrls={this.updateUrls}

              onItemClick={this.onItemClick}
              getAppTitle={this.getAppTitle}
              // error
              errorInfo={this.state.errorInfo}
              handleError={this.handleError}
              // loading
              isFetchingShortLink={this.state.isFetchingShortLink}

              a11yFocusElement={this.state.a11yFocusElement}
            />
          </div>
        </div>
      }

      {//3. detail content
        <React.Fragment>
          <QRCode
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal
            config={config} theme={theme} intl={intl}

            onItemClick={this.onItemClick}
            getAppTitle={this.getAppTitle}

            errorInfo={this.state.errorInfo}

            isShowing={(shownItem === ItemsName.QRcode)}
          />

          <ShareLink
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal
            config={config} theme={theme} intl={intl}

            onItemClick={this.onItemClick}
            onShortUrlChange={this.onShortUrlChange}
            updateUrls={this.updateUrls}
            getAppTitle={this.getAppTitle}
            // error
            errorInfo={this.state.errorInfo}
            handleError={this.handleError}
            // loading
            isFetchingShortLink={this.state.isFetchingShortLink}

            isShowing={(shownItem === ItemsName.Sharelink)}
          />

          <Embed
            sharedUrl={sharedUrl}
            uiMode={uiMode} shownMode={shownMode} isShowInModal
            config={config} theme={theme} intl={intl}

            onItemClick={this.onItemClick}
            getAppTitle={this.getAppTitle}

            isShowing={(shownItem === ItemsName.Embed)}
          />
        </React.Fragment>
      }
    </React.Fragment>

    const shareNls = this.props.intl.formatMessage({ id: 'share', defaultMessage: defaultMessages.share }) // keep popupBtn's aria-label=share (#23519)
    return (
      <Paper shape='none' variant='flat' transparent={!(uiMode === UiMode.Popup && this.state.isPopupInController)} css={getStyle(this.props.theme)} data-testid='share-widget' className={this.state.isControllerOffPanelStyle ? 'px-3 py-3' : ''}>
        <React.Fragment>
          {/* 1.popup mode */}
          {(uiMode === UiMode.Popup) && !this.state.isPopupInController &&
            <Button ref={this.btnRef} icon title={tooltip}
              className='jimu-outline-inside' style={{ border: 'none', backgroundColor: 'transparent', padding: 0, overflow: 'visible' }}
              onClick={this.onPopupBtnClick}
              aria-haspopup='dialog' data-testid='popupBtn' aria-label={shareNls}>
              <Icon icon={icon.svg} color={icon.properties?.color} size={icon.properties?.size} />
            </Button>
          }
          {(uiMode === UiMode.Popup) && this.state.isPopupInController &&
            mainContent
          }

          {/* 2.inline mode */}
          {(uiMode === UiMode.Inline) &&
            <ItemsList
              sharedUrl={this.state.sharedUrl}
              uiMode={uiMode}
              isShowInModal={false}
              // shownItem={this.state.shownItem}

              theme={theme} intl={intl} config={config}

              onShortUrlChange={this.onShortUrlChange}
              updateUrls={this.updateUrls}

              onItemClick={this.onItemClick}
              getAppTitle={this.getAppTitle}
              // error
              errorInfo={this.state.errorInfo}
              handleError={this.handleError}
              // loading
              isFetchingShortLink={this.state.isFetchingShortLink}

              a11yFocusElement={this.state.a11yFocusElement}
            />
          }
        </React.Fragment>

        {/* popper */}
        <Popper
          placement='right-start' css={getPopupStyle(this.props.theme)} reference={this.getRefByUiMode()}
          autoPlacementOptions={autoPlacementOptions} data-testid='mainPopper'
          open={this.state.isPopupOpen} toggle={this.onPopperToggleHandler}
          shiftOptions={shiftOptions}
          // a11y
          autoFocus={this.state.a11yPopperAutoFocus}
          forceLatestFocusElements={true}
          keepMount={true}
          aria-label={popupTitle}
          overflowHidden={true}
        >
          <div className={isRenderPopper ? '' : 'd-none'}>
            {mainContent}
          </div>
        </Popper>
      </Paper>
    )
  }

  // a11y
  private a11yIsSkipAndReset508 (propsConfig: IMConfig, prevPropsConfig: IMConfig) {
    let skipAndReset508Flag = false
    if (propsConfig !== prevPropsConfig) {
      skipAndReset508Flag = true
    }

    return skipAndReset508Flag
  }

  private a11yFocusOnBtnRefWhenPopupClosed (uiMode: UiMode, prevState) {
    if (uiMode === UiMode.Popup && (!this.state.isPopupOpen && prevState.isPopupOpen)) {
      focusElementInKeyboardMode(this.btnRef?.current)
    }
  }

  private a11yHandlers (prevState: State) {
    if (this.props.config.uiMode === UiMode.Popup) {
      // 1.Popup mode
      // 1.1 open popper
      if (this.state.isPopupOpen && !prevState.isPopupOpen) {
        this.setState({
          a11yPopperAutoFocus: true
        })
      }
      // 1.2 item switch
      if (this.state.shownItem !== prevState.shownItem) {
        // popup-content back to main-content
        if (this.state.shownItem === null && prevState.shownItem !== null) {
          this.setState({
            a11yFocusElement: prevState.shownItem,
            a11yPopperAutoFocus: false
          })
        } else {
          this.setState({
            a11yFocusElement: null,
            a11yPopperAutoFocus: false
          }, () => {
            this.setState({
              a11yPopperAutoFocus: true // Popper re-focus need to set it to false, then true ,#6772
            })
          })
        }
      }
    } else {
      // 2.Inline mode
      if (this.state.shownItem !== prevState.shownItem) { //item switch
        this.setState({
          a11yPopperAutoFocus: true,
          a11yFocusElement: prevState.shownItem
        })
      }
    }
  }
}
