/** @jsx jsx */
import {
  React,
  type IMAppConfig,
  type IMState,
  jsx,
  type IMThemeVariables,
  Immutable,
  type UseDataSource,
  type WidgetJson,
  expressionUtils,
  css,
  getAppStore,
  esri,
  DataSourceTypes
} from 'jimu-core'
import { type AllWidgetSettingProps, builderAppSync, helpUtils } from 'jimu-for-builder'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import {
  TextInput,
  TextArea,
  Switch,
  NumericInput,
  defaultMessages as jimuUiMessages,
  AdvancedButtonGroup,
  Button,
  richTextUtils,
  Tooltip,
  Label
} from 'jimu-ui'
import defaultMessages from './translations/default'
import { type IMConfig, EmbedType } from '../config'
import { getStyle } from './style'
import {
  DataSourceSelector
} from 'jimu-ui/advanced/data-source-selector'
import { DynamicUrlEditor } from 'jimu-ui/advanced/dynamic-url-editor'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { getExpressionParts, getUrlByEmbedCode } from '../utils'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
const MAX_CODE_LEN = 8192
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()
const sanitizer2 = new esri.Sanitizer({
  whiteList: {},
  stripIgnoreTag: true
})
const trialsAccount = ['Trial', 'Trial Developer', 'HUP Online Entitlements', 'Trial Press', 'Personal Use', 'Developer Subscription']
const developerAccount = ['Developer', 'Trial Developer', 'Developer Subscription']

interface ExtraProps {
  appConfig: IMAppConfig
  selectWidgets: WidgetJson[]
}

interface CustomProps {
  theme: IMThemeVariables
}

interface State {
  showUrlError: boolean
  urlError: string
  isExpPopupOpen: boolean
  showCodeError: boolean
  codeErrorMessage: string
  helpUrl: string
}

export default class Setting extends React.PureComponent<
AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps,
State
> {
  supportedDsTypes = Immutable([
    DataSourceTypes.FeatureLayer,
    DataSourceTypes.SceneLayer,
    DataSourceTypes.OrientedImageryLayer,
    DataSourceTypes.ImageryLayer,
    DataSourceTypes.BuildingComponentSubLayer,
    DataSourceTypes.SubtypeGroupLayer,
    DataSourceTypes.SubtypeSublayer
  ])

  attributePlaceHolder: string
  expressionPlaceHolder: string
  textAreaRef: HTMLInputElement
  readonly accountType: string
  constructor (props) {
    super(props)

    const appState = getAppStore().getState()
    this.accountType = appState?.portalSelf?.subscriptionInfo?.type
    this.state = {
      showUrlError: false,
      urlError: '',
      isExpPopupOpen: false,
      showCodeError: false,
      codeErrorMessage: 'maxLimit',
      helpUrl: ''
    }
  }

  static mapExtraStateProps = (
    state: IMState,
    props: AllWidgetSettingProps<IMConfig>
  ) => {
    const widgets = state && state.appStateInBuilder?.appConfig?.widgets
    const selectWidgets = []
    if (widgets) {
      for (const name in widgets) {
        const item = widgets[name]
        if (item.uri === 'widgets/common/embed/' && item.id !== props.id) {
          selectWidgets.push(item)
        }
      }
    }
    return {
      appConfig: state?.appStateInBuilder?.appConfig,
      selectWidgets
    }
  }

  componentDidMount () {
    const { config } = this.props
    const { embedType, expression } = config
    if (!expression && embedType === EmbedType.Url) {
      // Onblur event for empty string is one less than paste when typing in DynamicUrlEditor component.
      // When the user types in the DynamicUrlEditor component instead of pasting,
      // in order to be able to use undo to clear the content of the DynamicUrlEditor component and keep it consistent with pasting,
      // after adding the widget, first set the expression in the config to an empty string
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('expression', '')
      })
    }
    helpUtils.getWidgetHelpLink('embed').then(url => {
      this.setState({ helpUrl: url })
    })
  }

  componentDidUpdate () {
    // For undo/redo to work, the textarea should be able to get the value from the config.
    const { config } = this.props
    const { embedType, embedCode } = config
    if (embedType === EmbedType.Code) {
      this.textAreaRef && (this.textAreaRef.value = embedCode || '')
    }
  }

  componentWillUnmount () {
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'codeLimitExceeded', value: false })
  }

  embedTypeChange = (type: EmbedType) => {
    const { config } = this.props
    if (type === EmbedType.Url) {
      this.setState({ showCodeError: false })
    }
    if (config.embedType !== type) {
      this.props.onSettingChange({
        id: this.props.id,
        config: config.set('embedType', type).set('honorThemeFont', false)
      })
    }
  }

  checkURL = (str: string): boolean => {
    if (!str || str === '') {
      this.setState({ urlError: '' })
      return true
    }
    const httpsRex = '^(([h][t]{2}[p][s])?://)'
    const re = new RegExp(httpsRex)
    if (!re.test(str)) {
      this.setState({
        urlError: this.formatMessage('httpsUrlMessage')
      })
      return false
    }
    // url of localhost works without '.'
    const httpsLocalRex = new RegExp('^(([h][t]{2}[p][s])?://localhost)')
    if (httpsLocalRex.test(str)) {
      this.setState({ urlError: '' })
      return true
    }
    const index = str.indexOf('.')
    if (index < 0 || index === str.length - 1) {
      this.setState({
        urlError: this.formatMessage('invalidUrlMessage')
      })
      return false
    }
    this.setState({ urlError: '' })
    return true
  }

  embedCodeChangeRightAway = value => {
    const { config, id } = this.props
    const contentLength = value?.length
    if (contentLength > MAX_CODE_LEN) {
      this.setState({
        showCodeError: true,
        codeErrorMessage: 'maxLimit'
      })
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: id, propKey: 'codeLimitExceeded', value: true })
      return
    } else {
      builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: id, propKey: 'codeLimitExceeded', value: false })
    }
    // check social media and sanitize html
    let formatCode = value
    const isCodeUnsupported = formatCode ? !getUrlByEmbedCode(formatCode) : false
    if (formatCode && isCodeUnsupported) {
      formatCode = sanitizer.sanitize(formatCode)
    }
    this.setState({ showCodeError: false })
    this.props.onSettingChange({
      id,
      config: config.set('embedCode', formatCode)
    })
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUiMessages)
    return this.props.intl.formatMessage({ id, defaultMessage: messages[id] }, values)
  }

  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (!useDataSources) {
      return
    }

    this.props.onSettingChange({
      id: this.props.id,
      useDataSources: useDataSources
    })
  }

  onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      useDataSourcesEnabled
    })
  }

  onSwitchChanged = (name: string , checked: boolean): void => {
    const { config, id } = this.props
    this.props.onSettingChange({
      id,
      config: config.set(name, checked)
    })
  }

  onEmptyTipsChange = (value) => {
    const { config, id } = this.props
    this.props.onSettingChange({
      id,
      config: config.set('blankMessage', value)
    })
  }

  handleAutoInterval = (valueInt: number) => {
    if (valueInt === null) return
    const { config, id } = this.props
    this.props.onSettingChange({
      id,
      config: config.set('autoInterval', valueInt)
    })
  }

  labelChange = event => {
    const { config, id } = this.props
    const value = event?.target?.value
    this.props.onSettingChange({
      id,
      config: config.set('label', value)
    })
  }

  webAddressExpressionChange = (expression: string) => {
    const { config, onSettingChange, id, useDataSourcesEnabled, useDataSources } = this.props
    const { embedType } = config
    const URL_SEARCH_TAG_REGEXP = /\<urlsearch((?!\<urlsearch).)+\<\/urlsearch\>/gmi
    const EXP_TAG_REGEXP = /\<exp((?!\<exp).)+\<\/exp\>/gmi
    const haveUrlSearch = expression?.match(URL_SEARCH_TAG_REGEXP)
    const haveExp = expression?.match(EXP_TAG_REGEXP)
    const result = sanitizer2.sanitize(expression)
    const expressionStr = result && result.replace(/(^\s*|\s*$)/g, '')
    // undefined is not supported for replacing an empty string
    if (expression === undefined) expression = ''
    if ((haveUrlSearch || haveExp) && expressionStr.indexOf('{') === 0) {
      // show expression in runtime
      this.setState({ showUrlError: false })
    } else {
      if (this.checkURL(expressionStr)) {
        this.setState({ showUrlError: false })
      } else {
        this.setState({ showUrlError: true })
      }
    }
    // When expression changed, put the fields in `useDataSources`
    const embedExpressions = richTextUtils.getAllExpressions(expression)
    const parts = getExpressionParts(embedExpressions)
    let udsWithFields
    udsWithFields = expressionUtils.generateFieldsForUseDataSourcesByExpressionParts(parts, useDataSources) as any
    const udsWithoutFields = expressionUtils.getUseDataSourcesWithoutFields(useDataSources)
    udsWithFields = expressionUtils.mergeUseDataSources(udsWithoutFields, udsWithFields)

    const hasExpressionTag = expression?.match(EXP_TAG_REGEXP)
    const useLabel = embedType === EmbedType.Url && useDataSourcesEnabled && useDataSources?.length > 0 && hasExpressionTag
    if (expression !== config.expression) {
      if (!useLabel) {
        onSettingChange({
          id,
          config: config.set('expression', expression).set('enableLabel', false),
          useDataSources: udsWithFields
        })
      } else {
        onSettingChange({
          id,
          config: config.set('expression', expression),
          useDataSources: udsWithFields
        })
      }
    }
  }

  isUsedDataSource = () => {
    const { useDataSources, useDataSourcesEnabled } = this.props
    return useDataSourcesEnabled && useDataSources && useDataSources.length > 0
  }

  hasExpressionTag = (expression: string) => {
    const EXP_TAG_REGEXP = /\<exp((?!\<exp).)+\<\/exp\>/gmi
    return expression?.match(EXP_TAG_REGEXP)
  }

  render () {
    const { showUrlError, urlError, showCodeError, helpUrl } = this.state
    const { theme, useDataSources, config, useDataSourcesEnabled, id, selectWidgets } = this.props
    const { embedType, enableLabel, label, enableBlankMessage, blankMessage, autoRefresh, autoInterval, honorThemeFont } = config
    const isUrlType = embedType === EmbedType.Url
    const isCodeType = embedType === EmbedType.Code
    const useLabel = isUrlType && useDataSourcesEnabled && useDataSources?.length > 0 && this.hasExpressionTag(config.expression)
    const disableByCode = trialsAccount.includes(this.accountType) || developerAccount.includes(this.accountType)
    const hereHtmlString = `<a target="_blank" style="text-decoration: none !important;" href=${helpUrl}>$1</a>`
    const moreDetails = this.formatMessage('moreDetailsOnHTML', { detailsFormatLinkTag: '<detailsFormatLinkTag>' }).replace(/\<detailsFormatLinkTag\>(.+)\<detailsFormatLinkTag\>/, hereHtmlString)
    const honorFontLabel = (
      <div className='w-100 d-flex tip-container'>
        <Label className='tip-text' for='embed-honor-theme-font' title={this.formatMessage('honorThemeFont')}>{this.formatMessage('honorThemeFont')}</Label>
        <Tooltip title={this.formatMessage('honorThemeFontTips')} showArrow placement='bottom'>
          <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    )
    const blankMessageLabel = (
      <div className='w-100 d-flex tip-container'>
        <Label className='tip-text' for='embed-blank-message' title={this.formatMessage('blankMessage')}>{this.formatMessage('blankMessage')}</Label>
        <Tooltip title={this.formatMessage('blankMessageHint')} showArrow placement='bottom'>
          <Button icon type='tertiary' className='d-inline jimu-outline-inside' disableHoverEffect={true} disableRipple={true}>
            <InfoOutlined />
          </Button>
        </Tooltip>
      </div>
    )

    return (
      <div css={getStyle(this.props.theme)}>
        <div className='widget-iframe jimu-widget'>
          <div>
            <SettingSection>
              <SettingRow label={this.formatMessage('embedBy')} />
              <SettingRow>
                <AdvancedButtonGroup className='w-100'>
                  <Button
                    className='w-50'
                    aria-label={`${this.formatMessage('embedBy')} ${this.formatMessage('url')}`}
                    active={isUrlType}
                    onClick={() => { this.embedTypeChange(EmbedType.Url) }}
                  >
                    {this.formatMessage('url')}
                  </Button>
                  <Button
                    className='w-50'
                    aria-label={`${this.formatMessage('embedBy')} ${this.formatMessage('code')}`}
                    active={isCodeType}
                    onClick={() => { this.embedTypeChange(EmbedType.Code) }}
                    disabled={disableByCode}
                  >
                    {this.formatMessage('code')}
                  </Button>
                </AdvancedButtonGroup>
              </SettingRow>
              {isUrlType && (
                <SettingRow>
                  <div className='choose-ds w-100'>
                    <DataSourceSelector
                      types={this.supportedDsTypes}
                      useDataSources={this.props.useDataSources}
                      useDataSourcesEnabled={useDataSourcesEnabled}
                      onToggleUseDataEnabled={this.onToggleUseDataEnabled}
                      onChange={this.onDataSourceChange}
                      widgetId={this.props.id}
                    />
                  </div>
                </SettingRow>
              )}
              {isCodeType &&
                <SettingRow>
                  <div
                    className='body text-paper'
                    css={css`
                      color: var(--ref-palette-neutral-1100);
                    `}
                    dangerouslySetInnerHTML={{ __html: moreDetails }}
                  />
                </SettingRow>
              }
              <SettingRow>
                {isUrlType
                  ? (
                    <div className='d-flex flex-column w-100 embed-dynamic-con'>
                      <DynamicUrlEditor
                        widgetId={id}
                        useDataSourcesEnabled={useDataSourcesEnabled}
                        useDataSources={useDataSources}
                        selectWidgets={selectWidgets}
                        onChange={this.webAddressExpressionChange}
                        value={config.expression}
                      />
                      {showUrlError && (
                        <div
                          className='d-flex w-100 align-items-center justify-content-between'
                          style={{ marginTop: '5px' }}
                        >
                          <WarningOutlined color={theme.sys.color.error.main} />
                          <div
                            style={{
                              width: 'calc(100% - 20px)',
                              margin: '0 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: theme.sys.color.error.main
                            }}
                          >
                            {urlError}
                          </div>
                        </div>
                      )}
                    </div>
                    )
                  : (
                    <div className='d-flex flex-column w-100'>
                      <TextArea
                        height={300}
                        className='w-100'
                        spellCheck={false}
                        placeholder={this.formatMessage('codePlaceholder')}
                        defaultValue={config.embedCode || ''}
                        onAcceptValue={this.embedCodeChangeRightAway}
                        ref={ref => { this.textAreaRef = ref }}
                      />
                      {showCodeError &&
                        <div
                          className='d-flex w-100 align-items-center justify-content-between'
                          style={{ marginTop: '5px' }}
                        >
                          <WarningOutlined color={theme.sys.color.error.main} />
                          <div
                            style={{
                              width: 'calc(100% - 20px)',
                              margin: '0 4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: theme.sys.color.error.main
                            }}
                          >
                            {this.formatMessage('maxLimit')}
                          </div>
                        </div>
                      }
                    </div>
                    )}
              </SettingRow>
              {useLabel &&
                <React.Fragment>
                  <SettingRow tag='label' label={this.formatMessage('label')}>
                    <Switch
                      className='can-x-switch'
                      checked={enableLabel || false}
                      data-key='enableLabel'
                      onChange={evt => {
                        this.onSwitchChanged('enableLabel', evt.target.checked)
                      }}
                      aria-label={this.formatMessage('label')}
                    />
                  </SettingRow>
                  {enableLabel &&
                    <SettingRow>
                      <TextInput
                        type='text'
                        className='w-100'
                        value={label || ''}
                        onChange={this.labelChange}
                      />
                    </SettingRow>
                  }
                </React.Fragment>
              }
              {useLabel &&
                <React.Fragment>
                  <SettingRow tag='label' label={blankMessageLabel}>
                    <Switch
                      id='embed-blank-message'
                      className='can-x-switch'
                      checked={enableBlankMessage || false}
                      data-key='enableBlankMessage'
                      onChange={evt => {
                        this.onSwitchChanged('enableBlankMessage', evt.target.checked)
                      }}
                      aria-label={this.formatMessage('label')}
                    />
                  </SettingRow>
                  {enableBlankMessage &&
                    <SettingRow>
                      <TextInput
                        className='w-100'
                        aria-label={this.formatMessage('blankMessage')}
                        defaultValue={blankMessage || ''}
                        onAcceptValue={this.onEmptyTipsChange}
                      />
                    </SettingRow>
                  }
                </React.Fragment>
              }
              <SettingRow tag='label' label={this.formatMessage('autoRefresh')}>
                <Switch
                  className='can-x-switch'
                  checked={autoRefresh || false}
                  data-key='autoRefresh'
                  onChange={evt => {
                    this.onSwitchChanged('autoRefresh', evt.target.checked)
                  }}
                  aria-label={this.formatMessage('autoRefresh')}
                />
              </SettingRow>
              {autoRefresh && (
                <SettingRow
                  flow='wrap'
                  label={`${this.formatMessage('autoInterval')} (${this.formatMessage('autoUnit')})`}
                >
                  <NumericInput
                    size='sm'
                    style={{ width: '100%' }}
                    value={autoInterval || 1}
                    precision={2}
                    min={0.2}
                    max={1440}
                    onChange={this.handleAutoInterval}
                    aria-label={`${this.formatMessage('autoInterval')} (${this.formatMessage('autoUnit')})`}
                  />
                </SettingRow>
              )}
              {isCodeType &&
                <SettingRow tag='label' label={honorFontLabel}>
                  <Switch
                    id='embed-honor-theme-font'
                    className='can-x-switch'
                    checked={honorThemeFont}
                    data-key='honorThemeFont'
                    onChange={(evt) => {
                      this.onSwitchChanged('honorThemeFont', evt.target.checked)
                    }}
                    aria-label={this.formatMessage('honorThemeFont')}
                  />
                </SettingRow>
              }
            </SettingSection>
          </div>
        </div>
      </div>
    )
  }
}
