/** @jsx jsx */
import {
  React,
  type AllWidgetProps,
  getAppStore,
  AppMode,
  urlUtils,
  queryString,
  type IMState,
  jsx,
  classNames,
  appActions,
  esri,
  LayoutParentType,
  ViewVisibilityContext,
  type ViewVisibilityContextProps,
  type AppConfig,
  type ImmutableObject,
  WIDGET_PREFIX_FOR_A11Y_SKIP
} from 'jimu-core'
import { Fragment } from 'react'
import { WidgetPlaceholder, DynamicUrlResolver, AlertButton, Alert, Paper } from 'jimu-ui'
import { type IMConfig, EmbedType } from '../config'
import { getStyle } from './style'
import defaultMessages from './translations/default'
import embedIcon from '../../icon.svg'
import { versionManager } from '../version-manager'
import { getUrlByEmbedCode, getParamsFromEmbedCode } from '../utils'
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()
// Domains under *.arcgis.com, should be considered as the same origin.
// Remove 'esri.com' according to the guide, keep this array for adding new safe domains later
const safeDomainArray = ['.arcgis.com']

interface State {
  // Indicates embedded content, regardless of type
  content?: string
  contentLabel?: string
  isLoading?: boolean

  loadErr?: boolean
  // Parsing error or some variables are not selected and not replaced
  resolveErr?: boolean
  errMessage?: string
  isEmptyUrl?: boolean

  codeLimitExceeded?: boolean
  // Indicates the code is not social media or video
  useSrcdoc?: boolean
}

interface Props {
  appMode: AppMode
  sectionNavInfos: any
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & Props, State> {
  static versionManager = versionManager
  ifr: HTMLIFrameElement
  // Indicates whether the iFrame needs to be loaded in the View, and keep the loaded iframe unloaded.
  shouldRenderIframeInView: boolean
  // Indicates whether content needs to be loaded on the iFrame after switching the view.
  needLoadContentInView: boolean
  // Auto refresh timer
  refreshTimer: any
  // The map of err messages
  errMessages: {
    httpsCheck: string
    unSupportUrl: string
    unSupportIframeUrl: string
  }

  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetProps<IMConfig>
  ): Props => {
    return {
      appMode: state?.appRuntimeInfo?.appMode,
      sectionNavInfos: state?.appRuntimeInfo?.sectionNavInfos
    }
  }

  constructor (props) {
    super(props)
    const { config } = props
    const { embedType, embedCode, expression } = config

    this.errMessages = {
      httpsCheck: this.formatMessage('httpsUrlMessage'),
      unSupportUrl: this.formatMessage('unSupportUrl'),
      unSupportIframeUrl: this.formatMessage('unSupportIframeUrl')
    }

    this.checkUrl = this.checkUrl.bind(this)
    const embedByCodeUrl = getUrlByEmbedCode(embedCode)
    const mediaCodeOrSanitizedHtml = embedByCodeUrl || sanitizer.sanitize(embedCode)
    const state: State = {
      content:
        embedType === EmbedType.Url
          ? expression
          : mediaCodeOrSanitizedHtml,
      contentLabel: '',
      isLoading: false,
      loadErr: false,
      resolveErr: false,
      errMessage: '',
      isEmptyUrl: false,
      codeLimitExceeded: false,
      useSrcdoc: !embedByCodeUrl
    }
    this.state = state
    this.shouldRenderIframeInView = false
  }

  componentDidMount () {
    const { config } = this.props
    const { content } = this.state
    if (content && content.trim().length > 0) {
      this.setState({ isLoading: true }, () => {
        // In the first load, resolving the URL is incomplete, after resolved, it is loaded via didUpdate
        // In code type, we can loadContent directly
        if (config.embedType === EmbedType.Code) {
          this.loadContent()
        }
      })
    }
  }

  componentDidUpdate (preProps, preStates) {
    const { content, isEmptyUrl } = this.state
    const { content: oldContent } = preStates
    const { appMode, config, id, theme } = this.props
    const { embedCode, embedType, enableBlankMessage, blankMessage, autoRefresh, autoInterval, expression, honorThemeFont } = config
    const { config: preConfig, appMode: preAppMode, sectionNavInfos: preSectionNavInfos, theme: preTheme } = preProps
    const {
      enableBlankMessage: preEnableBlankMessage, blankMessage: preBlankMessage, autoRefresh: preAutoRefresh, autoInterval: preAutoInterval,
      embedType: preEmbedType, honorThemeFont: preHonorThemeFont
    } = preConfig
    const autoConfChange = autoRefresh !== preAutoRefresh || autoInterval !== preAutoInterval
    const codeLimitExceeded = this.props?.stateProps?.codeLimitExceeded || false
    const isCodeType = embedType === EmbedType.Code
    this.setState({ codeLimitExceeded })

    if ((appMode !== preAppMode && appMode === AppMode.Design) || autoConfChange) {
      this.reload()
    }
    // embedType change
    const embedByCodeUrl = getUrlByEmbedCode(embedCode)
    const mediaCodeOrSanitizedHtml = embedByCodeUrl || sanitizer.sanitize(embedCode)
    if (embedType !== preEmbedType) {
      const reuseContent =
        embedType === EmbedType.Url
          ? expression
          : mediaCodeOrSanitizedHtml
      this.setState({
        loadErr: false,
        errMessage: '',
        isEmptyUrl: false,
        resolveErr: false,
        codeLimitExceeded: false,
        content: reuseContent,
        useSrcdoc: !embedByCodeUrl
      })
      this.props.dispatch(
        appActions.widgetStatePropChange(id, 'codeLimitExceeded', false)
      )
    } else {
      if (isCodeType) {
        if (preConfig.embedCode !== embedCode) {
          this.setState({
            content: mediaCodeOrSanitizedHtml,
            useSrcdoc: !embedByCodeUrl
          })
        }
      } else {
        if (preConfig.expression !== expression) {
          this.setState({
            content: expression,
            useSrcdoc: !embedByCodeUrl
          })
        }
      }
    }
    // blankMessage change
    if (isEmptyUrl) {
      const blankMessageSettingChange = (blankMessage !== preBlankMessage) || (enableBlankMessage !== preEnableBlankMessage)
      if (blankMessageSettingChange) {
        const urlInvalid = this.errMessages.unSupportUrl
        const usedMessage = enableBlankMessage ? (blankMessage || urlInvalid) : urlInvalid
        this.setState({ errMessage: usedMessage })
      }
    }

    if (content !== oldContent) {
      this.setState({
        isLoading: !!content,
        loadErr: false
      }, () => {
        this.checkAndLoadByType()
      })
    }
    // Current section change reload embed
    this.reloadContentInView(preSectionNavInfos)
    // Auto refresh setting
    this.autoRefreshHandler(autoConfChange)
    // Theme font-family change
    // If the media is successfully matched, the honor font is not required
    // Use iframe to obtain the window and document, they must be of the same origin, otherwise, the contentDocument is null.
    if (isCodeType && !embedByCodeUrl) {
      const fontFamily = theme.ref.typeface?.fontFamily
      const preFontFamily = preTheme.typography?.fontFamilyBase
      const honorThemeChange = preHonorThemeFont !== honorThemeFont
      const fontFamilyChange = preFontFamily !== fontFamily
      if (honorThemeChange) {
        if (honorThemeFont) {
          if (fontFamily) this.updateIframeFont(fontFamily)
        } else {
          this.removeIframeFont()
        }
      }
      if (fontFamilyChange && honorThemeFont) {
        if (fontFamily) this.updateIframeFont(fontFamily)
      }
    }
  }

  injectFontToIframe = (iframeDoc: Document, fontUrl: string) => {
    const link = iframeDoc.createElement('link')
    link.id = 'embed-inject-font'
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = fontUrl
    iframeDoc.head.appendChild(link)
  }

  updateIframeFont = (fontFamily: string) => {
    if (this.ifr) {
      const iframeDoc = this.ifr?.contentDocument || this.ifr?.contentWindow?.document
      if (!iframeDoc) return
      const iframeBody = iframeDoc.querySelector('body')
      // get theme font face. Now only Avenir is available.
      // TODO: Method support from the theme side is required.
      const fontAvenirUrl = `${urlUtils.getFixedRootPath()}jimu-theme/base/assets/fonts/avenir/fonts.css`
      if (iframeBody) iframeBody.style.fontFamily = fontFamily
      const existFontLink = iframeDoc.getElementById('embed-inject-font')
      if (existFontLink) existFontLink.remove()
      if (fontFamily === 'Avenir Next') this.injectFontToIframe(iframeDoc, fontAvenirUrl)
    }
  }

  removeIframeFont = () => {
    if (this.ifr) {
      const iframeDoc = this.ifr?.contentDocument || this.ifr?.contentWindow?.document
      if (!iframeDoc) return
      const iframeBody = iframeDoc.querySelector('body')
      if (iframeBody) iframeBody.style.removeProperty('font-family')
      const existFontLink = iframeDoc.getElementById('embed-inject-font')
      if (existFontLink) existFontLink.remove()
    }
  }

  checkAndLoadByType = () => {
    const { config } = this.props
    const { embedType } = config
    const { content } = this.state
    if (embedType === EmbedType.Url) {
      const processedUrl = this.processUrl(content)
      this.checkUrl(processedUrl).then(passed => {
        if (passed) this.loadContent()
      })
    } else {
      this.loadContent()
    }
  }

  getSectionIdWhenParentIsView = (appConfig: ImmutableObject<AppConfig>, layoutId: string): string => {
    const mainSizeMode = appConfig.mainSizeMode
    const widgetLayoutJson = appConfig.layouts?.[layoutId]
    let sectionId
    const recursionCheckParent = (layoutJson) => {
      if (!layoutJson) return
      if (layoutJson?.parent?.type === LayoutParentType.View) {
        const viewId = layoutJson.parent?.id
        const viewJson = appConfig.views?.[viewId]
        sectionId = viewJson?.parent
      } else {
        const parentWidgetId = layoutJson?.parent?.id
        const parentWidget = appConfig.widgets[parentWidgetId]
        const parentLayoutId = parentWidget?.parent?.[mainSizeMode]?.[0]?.layoutId
        const parentLayoutJson = appConfig.layouts?.[parentLayoutId]
        recursionCheckParent(parentLayoutJson)
      }
    }
    recursionCheckParent(widgetLayoutJson)
    return sectionId
  }

  reloadContentInView = (preSectionNavInfos) => {
    const { sectionNavInfos, layoutId } = this.props
    if (
      this.needLoadContentInView &&
      sectionNavInfos &&
      preSectionNavInfos !== sectionNavInfos
    ) {
      const changedSection = []
      for (const sectionIndex in sectionNavInfos) {
        const curSectionInfo = sectionNavInfos[sectionIndex]
        const preSectionInfo = preSectionNavInfos?.[sectionIndex]
        if (curSectionInfo !== preSectionInfo) {
          changedSection.push(sectionIndex)
        }
      }
      const appState = getAppStore().getState()
      const appConfig = appState?.appConfig
      const sectionId = this.getSectionIdWhenParentIsView(appConfig, layoutId)
      // Reload the content in section view
      if (changedSection.includes(sectionId)) {
        this.checkAndLoadByType()
      }
    }
  }

  autoRefreshHandler = (autoConfChange: boolean) => {
    const { useSrcdoc } = this.state
    const { config } = this.props
    const { embedType, autoRefresh, autoInterval = 1 } = config

    // Turn auto refresh on or off
    if (!this.refreshTimer && autoRefresh) {
      const autoRefreshTimer = setInterval(() => {
        if (this.ifr) {
          if (embedType === EmbedType.Code && useSrcdoc) {
            const srcDoc = this.ifr.srcdoc
            this.ifr.srcdoc = srcDoc
          } else {
            const src = this.ifr.src
            this.ifr.src = ''
            setTimeout(() => {
              if (this.ifr) this.ifr.src = src
            }, 100)
          }
        }
      }, autoInterval * 60 * 1000)
      this.refreshTimer = autoRefreshTimer
    } else if (this.refreshTimer && !autoRefresh) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }

    // Auto refresh setting changed
    if (autoConfChange && autoRefresh) {
      if (this.refreshTimer) clearInterval(this.refreshTimer)
      const changeTimer = setInterval(() => {
        if (this.ifr) {
          if (embedType === EmbedType.Code && useSrcdoc) {
            const srcDoc = this.ifr.srcdoc
            this.ifr.srcdoc = srcDoc
          } else {
            const src = this.ifr.src
            this.ifr.src = ''
            setTimeout(() => {
              if (this.ifr) this.ifr.src = src
            }, 100)
          }
        }
      }, autoInterval * 60 * 1000)
      this.refreshTimer = changeTimer
    }
  }

  iframeOnLoad = () => {
    const { useSrcdoc } = this.state
    const { config, theme } = this.props
    const { embedType, honorThemeFont } = config
    const isCodeType = embedType === EmbedType.Code
    this.setState({ isLoading: false })
    if (isCodeType && honorThemeFont && useSrcdoc) {
      const fontFamily = theme.ref.typeface?.fontFamily
      if (fontFamily) this.updateIframeFont(fontFamily)
    }
  }

  checkSafeDomain = (url: string): boolean => {
    let safeFlag = false
    if (!url) return safeFlag
    const appState = getAppStore().getState()
    const selfPortal = appState?.portalSelf
    let selfPortalDomain = selfPortal?.portalHostname
    // some portalDomain end with '/portal'
    if (selfPortalDomain?.includes('/')) {
      selfPortalDomain = selfPortalDomain.split('/')[0]
    }
    const safeDomain = [...safeDomainArray]
    // portal self domain is safe
    if (selfPortalDomain) safeDomain.push(selfPortalDomain)
    let toBeCheckedDomain = ''
    if (url.includes('https://')) {
      toBeCheckedDomain = url.substring(8).split('/')[0]
    }
    // Check safe domain
    // An url from arcgis can be 'arcgis.com/xxx', without 'www.'
    if (toBeCheckedDomain === 'arcgis.com') {
      return true
    }
    for (const safeItem of safeDomain) {
      if (toBeCheckedDomain.includes(safeItem)) {
        safeFlag = true
        break
      }
    }
    return safeFlag
  }

  processUrl = (url: string, onlyGetUrl?: boolean): string => {
    if (!url) return url
    const { config } = this.props
    const { embedType } = config
    // Support Google Map, Youtube, Facebook and Vimeo now.
    const lowerUrl = url.toLowerCase()
    // Google Map
    // if(lowerUrl.indexOf('https://www.google.com/maps') > -1 || lowerUrl.indexOf('https://goo.gl/maps') > -1){//google map
    //   return url;
    // }

    // Vimeo
    if (/https:\/\/vimeo\.com\/.*/.test(lowerUrl)) {
      url = urlUtils.removeSearchFromUrl(url)
      const splits = url.split('/')
      const id = splits[splits.length - 1]
      return `https://player.vimeo.com/video/${id}`
    }

    // Youtube
    if (/https:\/\/www\.youtube\.com\/watch\?.*v=.*/.test(lowerUrl)) {
      const queryObj = queryString.parseUrl(url)?.query
      const id = queryObj?.v
      let youtubeEmbed = `https://www.youtube.com/embed/${id}`
      delete queryObj?.v
      const queryParamKeys = Object.keys(queryObj)
      if (queryParamKeys?.length > 0) {
        queryParamKeys.forEach((paramKey, index) => {
          youtubeEmbed = `${youtubeEmbed}${index === 0 ? '?' : '&'}${paramKey}=${queryObj[paramKey]}`
        })
      }
      return youtubeEmbed
    } else if (/https:\/\/youtu\.be\/.*/.test(lowerUrl)) {
      url = urlUtils.removeSearchFromUrl(url)
      const splits = url.split('/')
      const id = splits[splits.length - 1]
      return `https://www.youtube.com/embed/${id}`
    }

    // Facebook video
    if (/https:\/\/www\.facebook\.com\/.*\/videos\/.*/.test(lowerUrl)) {
      return `https://www.facebook.com/plugins/video.php?href=${lowerUrl}&show_text=0`
    }

    if (embedType === EmbedType.Code && url.startsWith('//')) {
      url = `https:${url}`
    }

    if (!this.checkURLFormat(url, onlyGetUrl)) {
      url = 'about:blank'
    }

    // Check and replace the url to current user's org to avoid duplicate sign-in
    // This is the matching rule, and the target Domain contains these three types, which need to be replaced
    const matchedUrl = [
      '.maps.arcgis.com',
      '.mapsdevext.arcgis.com',
      '.mapsqa.arcgis.com'
    ]
    let toBeCheckedDomain = ''
    if (url.includes('https://')) {
      toBeCheckedDomain = url.substring(8).split('/')[0]
    }
    let matchFlag = false
    let matchEnv = ''
    // Check domain
    for (const item of matchedUrl) {
      if (toBeCheckedDomain.includes(item)) {
        matchFlag = true
        switch (item) {
          case '.maps.arcgis.com':
            matchEnv = 'prod'
            break
          case '.mapsdevext.arcgis.com':
            matchEnv = 'dev'
            break
          case '.mapsqa.arcgis.com':
            matchEnv = 'qa'
            break
        }
        break
      }
    }

    const hostEnv = window.jimuConfig.hostEnv
    if (matchFlag && matchEnv === hostEnv) {
      const appState = getAppStore().getState()
      if (appState && appState.user) {
        const urlKey = appState?.portalSelf?.urlKey
        const customBaseUrl = appState?.portalSelf?.customBaseUrl
        if (toBeCheckedDomain && urlKey && customBaseUrl) {
          url = url.replace(toBeCheckedDomain, `${urlKey}.${customBaseUrl}`)
        }
      }
    }
    return url
  }

  // onlyCheckUrl: Only verify the url, not set the state
  checkURLFormat = (str: string, onlyCheckUrl?: boolean): boolean => {
    if (!str || str === '') {
      if (!onlyCheckUrl) this.setState({ isEmptyUrl: true })
      const { config } = this.props
      const { enableBlankMessage, blankMessage } = config
      const urlInvalid = this.errMessages.unSupportUrl
      const usedMessage = enableBlankMessage ? (blankMessage || urlInvalid) : urlInvalid
      if (!onlyCheckUrl) this.setState({ errMessage: usedMessage })
      return false
    }
    if (str === 'about:blank') {
      return false
    }
    const httpsRex = '^(([h][t]{2}[p][s])?://)'
    const re = new RegExp(httpsRex)
    if (!re.test(str)) {
      if (!onlyCheckUrl) this.setState({ errMessage: this.errMessages.httpsCheck })
      return false
    }
    // url of localhost works without '.'
    const httpsLocalRex = new RegExp('^(([h][t]{2}[p][s])?://localhost)')
    if (httpsLocalRex.test(str)) {
      return true
    }
    const index = str.indexOf('.')
    if (index < 0 || index === str.length - 1) {
      if (!onlyCheckUrl) this.setState({ errMessage: this.errMessages.unSupportUrl })
      return false
    }
    return true
  }

  // Tips: remove fetchUrl in builder
  checkUrl (url: string): Promise<boolean> {
    if (!this.checkURLFormat(url)) {
      this.setState({ loadErr: true })
      return Promise.resolve(false)
    } else {
      this.setState({ loadErr: false })
      return Promise.resolve(true)
    }
  }

  isOriginSameAsLocation (url: string) {
    const pageLocation = window.location
    const URL_HOST_PATTERN = /(\w+:)?(?:\/\/)([\w.-]+)?(?::(\d+))?\/?/
    const urlMatch = URL_HOST_PATTERN.exec(url) || []
    const urlParts = {
      protocol: urlMatch[1] || '',
      host: urlMatch[2] || '',
      port: urlMatch[3] || ''
    }
    // Check safe domain
    let safeDomain = ''
    for (const safeItem of safeDomainArray) {
      if (pageLocation.host.includes(safeItem)) {
        safeDomain = safeItem
        break
      }
    }
    if (urlMatch[2].includes(safeDomain)) {
      return true
    }

    const defaultPort = protocol => {
      return { 'http:': 80, 'https:': 443 }[protocol]
    }

    const portOf = location => {
      return (
        location.port || defaultPort(location.protocol || pageLocation.protocol)
      )
    }

    return !!(
      urlParts.protocol &&
      urlParts.protocol === pageLocation.protocol &&
      urlParts.host &&
      urlParts.host === pageLocation.host &&
      urlParts.host &&
      portOf(urlParts) === portOf(pageLocation)
    )
  }

  formatMessage = (id: string) => {
    return this.props.intl.formatMessage({
      id: id,
      defaultMessage: defaultMessages[id]
    })
  }

  reload = () => {
    const { useSrcdoc } = this.state
    const { config } = this.props
    if (this.ifr) {
      if (config.embedType === EmbedType.Code && useSrcdoc) {
        const srcDoc = this.ifr.srcdoc
        this.ifr.srcdoc = srcDoc
      } else {
        const src = this.ifr.src
        this.ifr.src = src
      }
    }
  }

  loadContent = () => {
    const { config } = this.props
    const { content, useSrcdoc } = this.state
    const { embedType } = config
    if (this.ifr) {
      this.ifr.removeAttribute('srcdoc')
      this.ifr.removeAttribute('src')
      if (embedType === EmbedType.Code) {
        if (useSrcdoc) {
          this.ifr.srcdoc = content
        } else {
          setTimeout(() => {
            if (this.ifr) this.ifr.src = this.processUrl(content)
          }, 100)
        }
      } else {
        setTimeout(() => {
          if (this.ifr) this.ifr.src = this.processUrl(content)
        }, 100)
      }
    }
  }

  onHtmlResolved = (url, hasExpression) => {
    // Remove the empty characters at the beginning and end of the parsed url
    const trimmedUrl = url.replace(/(^\s*|\s*$)/g, '')
    this.setState({
      contentLabel: trimmedUrl,
      content: trimmedUrl,
      resolveErr: hasExpression
    })
  }

  getIframe = (iframeWidth, iframeHeight, iframeParams,sandbox = false) => {
    const { id, a11yLabel } = this.props
    const title = a11yLabel || this.formatMessage('embedHint')
    const sandboxProps = sandbox ? {
      sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox'
    } : {}
    return (
      <iframe
        id={`${WIDGET_PREFIX_FOR_A11Y_SKIP}${id}`}
        title={title}
        className={`iframe-${id} ${!iframeWidth && 'w-100'} ${!iframeHeight && 'h-100'} embed-iframe`}
        {...sandboxProps}
        allowFullScreen
        onLoad={this.iframeOnLoad}
        ref={(f) => { this.ifr = f }}
        allow="local-network-access; geolocation"
        data-testid="embedSandbox"
        {...iframeParams}
      />
    )
  }

  render () {
    const { isLoading, loadErr, errMessage, resolveErr, content, contentLabel, codeLimitExceeded, useSrcdoc } = this.state
    const { theme, id, config } = this.props
    const { embedCode, embedType, expression, enableLabel, label } = config
    // the expression value will be '<p><br></p>' after the input is cleared
    const showPlaceholder =
      embedType === EmbedType.Code
        ? !embedCode
        : (!expression || expression === '<p><br></p>' || expression === '<p></p>')

    if (showPlaceholder) {
      return (
        <Fragment>
          <WidgetPlaceholder
            icon={embedIcon}
            name={this.formatMessage('_widgetLabel')}
            message={this.formatMessage('embedHint')}
          />
          {codeLimitExceeded &&
            <div className='p-2 w-100' style={{ position: 'absolute', bottom: 0 }}>
              <Alert withIcon={true} size='small' type='warning' text={this.formatMessage('maxLimitTips')} className='w-100' />
            </div>
          }
        </Fragment>
      )
    }
    let withSandbox = true
    if (embedType === EmbedType.Url || (embedType === EmbedType.Code && !useSrcdoc)) {
      withSandbox = !this.checkSafeDomain(this.processUrl(content, true))
    }
    let iframeParams = { width: undefined, height: undefined }
    iframeParams = getParamsFromEmbedCode(embedCode)
    const { width: iframeWidth, height: iframeHeight } = iframeParams

    return (
      <ViewVisibilityContext.Consumer>
        {({ isInView, isInCurrentView }: ViewVisibilityContextProps) => {
          let embedLoad = true
          if (!this.shouldRenderIframeInView) {
            embedLoad = isInView ? isInCurrentView : true
            if (embedLoad) this.shouldRenderIframeInView = true
          }
          this.needLoadContentInView = isInView && isInCurrentView
          return <Fragment>
            {embedLoad &&
              <Paper shape='none' transparent className='jimu-widget widget-embed' css={getStyle(theme, iframeParams)}>
                {this.getIframe(iframeWidth, iframeHeight, iframeParams, withSandbox)}
                {isLoading && <div className='jimu-secondary-loading'></div>}
                {!resolveErr && loadErr &&
                  <div className='mask text-center load-err-mask'>
                    <div className='mask-content'>
                      <AlertButton
                        variant='text'
                        type='warning'
                      />
                      <div className='mt-2'>{errMessage}</div>
                    </div>
                  </div>
                }
                {resolveErr &&
                  <div
                    data-testid='test-expressionMask'
                    className="mask text-center load-err-mask"
                  >
                    <div
                      className={classNames('mask-content', { 'truncate-two': !(enableLabel && label) })}
                      style={{ width: '70%' }}
                      title={(enableLabel && label) || contentLabel}
                    >
                      {(enableLabel && label) || contentLabel}
                    </div>
                  </div>
                }
                {embedType === EmbedType.Url &&
                  <DynamicUrlResolver
                    widgetId={id}
                    useDataSources={this.props.useDataSources}
                    value={config.expression}
                    onHtmlResolved={this.onHtmlResolved}
                  />
                }
                {codeLimitExceeded &&
                  <div className='bottom-alert p-2 w-100'>
                    <Alert withIcon={true} size='small' type='warning' text={this.formatMessage('maxLimitTips')} className='w-100' />
                  </div>
                }
              </Paper>
            }
          </Fragment>
        }}
      </ViewVisibilityContext.Consumer>
    )
  }
}
