/** @jsx jsx */
import { classNames, React, jsx, AppMode, appActions, utils as jimuUtils } from 'jimu-core'
import type { DataSource, IMState, IMAppConfig, IMThemeVariables, BrowserSizeMode, QueriableDataSource, LayoutInfo, Size } from 'jimu-core'
import { type AllWidgetSettingProps, builderAppSync, builderActions } from 'jimu-for-builder'
import { type IMConfig, SelectionModeType, Status, type ElementSize } from '../config'
import SelectAndHoverSetting from './components/select-and-hover-setting'
import ListDefaultSetting from './components/default-setting'
import ListTemplateSelector from './components/template-selector'
import CreateDataSource from './components/data-source'
import { getNewUseDatasourcesByWidgetConfig } from './utils/utils'
import { Fragment } from 'react'
import { getStyle } from './style'

const prefix = 'jimu-widget-'
interface State {
  datasource: DataSource
  isTextExpPopupOpen: boolean
  currentTextInput: string
  isTipExpPopupOpen: boolean
  isSqlExprShow: boolean
  isTemplateContainScroll: boolean
  templateConWidth: number
  aspectRatio: string
}

interface ExtraProps {
  appConfig: IMAppConfig
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  showCardSetting: Status
  builderStatus: Status
  selectionIsInSelf: boolean
  settingPanelChange: string
  layoutInfo: LayoutInfo
  widgetRect: ElementSize
  parentSize: ElementSize
  viewportSize?: Size
  enableA11yForWidgetSettings?: boolean
}

interface CustomProps {
  theme: IMThemeVariables
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps, State> {
  toHoverSettingButtonRef: HTMLButtonElement
  toSelectedSettingButtonRef: HTMLButtonElement
  isPreDataSourceRefreshOpen: boolean
  resettingTheTemplateButtonRef: HTMLButtonElement

  static mapExtraStateProps = (state: IMState, props: AllWidgetSettingProps<IMConfig>) => {
    const { id } = props
    return {
      appConfig: state.appStateInBuilder?.appConfig,
      appMode: state.appStateInBuilder?.appRuntimeInfo?.appMode,
      browserSizeMode: state.appStateInBuilder?.browserSizeMode,
      showCardSetting: (state.appStateInBuilder?.widgetsState?.[id]?.showCardSetting) || Status.Default,
      builderStatus: (state.appStateInBuilder?.widgetsState?.[id]?.builderStatus) || Status.Default,
      selectionIsInSelf: state?.appStateInBuilder?.widgetsState[id]?.selectionIsInSelf,
      settingPanelChange: state?.widgetsState?.[props.id]?.settingPanelChange,
      layoutInfo: state?.appStateInBuilder?.widgetsState[id]?.layoutInfo,
      widgetRect: state?.appStateInBuilder?.widgetsState[id]?.widgetRect,
      parentSize: state?.appStateInBuilder?.widgetsState[id]?.parentSize,
      viewportSize: jimuUtils.findViewportSize(state?.appStateInBuilder?.appConfig, state?.appStateInBuilder?.browserSizeMode),
      enableA11yForWidgetSettings: state?.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings
    }
  }

  constructor (props) {
    super(props)
    this.state = {
      datasource: null,
      isTextExpPopupOpen: false,
      currentTextInput: '',
      isTipExpPopupOpen: false,
      isSqlExprShow: false,
      isTemplateContainScroll: false,
      templateConWidth: 0,
      aspectRatio: null,
    }
  }

  componentDidMount () {
    this.toggleMessageActionSettingOpenStateInExpressMode()
  }

  componentDidUpdate (preProps: AllWidgetSettingProps<IMConfig> & ExtraProps & CustomProps) {
    this.toggleMessageActionSettingOpenStateInExpressMode()
  }

  componentWillUnmount () {
    const { dispatch, id } = this.props
    dispatch(appActions.widgetStatePropChange(id, 'settingPanelChange', null))
  }

  onPropertyChange = (name, value) => {
    const { config } = this.props
    if (value === config[name]) {
      return
    }
    const newConfig = config.set(name, value)
    if (name === 'sorts' || name === 'filter' || name === 'searchFields') {
      this.onSettingChangeAndUpdateUsedFieldsOfDs(newConfig)
    } else {
      this.onConfigChange(newConfig)
    }
  }

  onConfigChange = newConfig => {
    const alterProps = {
      id: this.props.id,
      config: newConfig
    }
    this.props.onSettingChange(alterProps)
  }

  handleCheckboxChange = (dataField: string) => {
    if (!dataField) return false
    const currentCheckboxValue = this.props.config?.[dataField]
    this.onPropertyChange(dataField, !currentCheckboxValue)
  }

  onSettingChangeAndUpdateUsedFieldsOfDs = (newConfig?: IMConfig) => {
    const { id, useDataSources, onSettingChange } = this.props
    const config = newConfig || this.props.config
    if (useDataSources && useDataSources[0]) {
      const useDS = getNewUseDatasourcesByWidgetConfig(config, useDataSources)
      const option = {
        id: id,
        useDataSources: useDS
      }
      if (newConfig) {
        (option as any).config = newConfig
      }
      onSettingChange(option)
    }
  }

  setToHoverSettingButtonRef = ref => {
    this.toHoverSettingButtonRef = ref
  }
  setToSelectedSettingButtonRef = ref => {
    this.toSelectedSettingButtonRef = ref
  }

  private readonly changeCardSettingAndBuilderStatus = (status: Status) => {
    const { id, config } = this.props
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'showCardSetting',
      value: status
    })
    if (
      status === Status.Default ||
      (status === Status.Hover && config.cardConfigs[Status.Hover].enable) ||
      (status === Status.Selected &&
        config.cardConfigs[Status.Selected].selectionMode !==
          SelectionModeType.None)
    ) {
      this.changeBuilderStatus(status)
    }
  }

  private readonly changeBuilderStatus = (status: Status) => {
    const { id } = this.props
    builderAppSync.publishChangeWidgetStatePropToApp({
      widgetId: id,
      propKey: 'builderStatus',
      value: status
    })
  }

  toggleMessageActionSettingOpenStateInExpressMode = () => {
    const { appMode, config, showCardSetting } = this.props
    const { datasource } = this.state
    if (appMode !== AppMode.Express) return
    const isStatusDefault = showCardSetting === Status.Default || !showCardSetting
    const open = !!datasource && !!config?.isItemStyleConfirm && isStatusDefault
    this.toggleMessageActionSetting(open)
  }

  toggleMessageActionSetting = (open: boolean) => {
    const { appMode, dispatch, id } = this.props
    if (appMode !== AppMode.Express) return
    dispatch(builderActions.changeMessageActionSettingOpenState(id, open))
  }

  setDatasource = (ds: DataSource, setDsCallBack?: () => void) => {
    this.setState({
      datasource: ds
    }, () => {
      setDsCallBack && setDsCallBack()
    })
  }

  setResettingTheTemplateButtonRef = ref => {
    this.resettingTheTemplateButtonRef = ref
  }

  checkIsDsAutoRefreshSettingOpen = (datasource): boolean => {
    if (!datasource) return false
    const interval = (datasource as QueriableDataSource)?.getAutoRefreshInterval() || 0
    return interval > 0
  }

  render () {
    const { config, showCardSetting, browserSizeMode, widgetRect, builderStatus, useDataSources, layouts, selectionIsInSelf, appMode, id,
      appConfig, useDataSourcesEnabled, layoutInfo, parentSize, settingPanelChange, theme, enableA11yForWidgetSettings } = this.props
    const { datasource } = this.state
    return (
      <div
        className={classNames(`${prefix}list-setting`, `${prefix}setting`, {'list-setting-con-with-template-scroll': enableA11yForWidgetSettings && !config.isItemStyleConfirm})}
        css={getStyle(this.props.theme)}
      >
        {!selectionIsInSelf && <div className='h-100'>
          {!config.isItemStyleConfirm && <ListTemplateSelector
            config={config}
            appMode={appMode}
            id={id}
            appConfig={appConfig}
            layoutInfo={layoutInfo}
            theme={theme}
            resettingTheTemplateButtonRef={this.resettingTheTemplateButtonRef}
            parentSize={parentSize}
            settingPanelChange={settingPanelChange}
            useDataSourcesEnabled={useDataSourcesEnabled}
            onPropertyChange={this.onPropertyChange}
          />}
          {config.isItemStyleConfirm &&
            <Fragment>
              {showCardSetting === Status.Default && <ListDefaultSetting
                id={id}
                config={config}
                appConfig={appConfig}
                showCardSetting={showCardSetting}
                browserSizeMode={browserSizeMode}
                layouts={layouts}
                datasource={datasource}
                selectionIsInSelf={selectionIsInSelf}
                useDataSources={useDataSources}
                widgetRect={widgetRect}
                builderStatus={builderStatus}
                onPropertyChange={this.onPropertyChange}
                setResettingTheTemplateButtonRef={this.setResettingTheTemplateButtonRef}
                setToHoverSettingButtonRef={this.setToHoverSettingButtonRef}
                setToSelectedSettingButtonRef={this.setToSelectedSettingButtonRef}
                onSettingChangeAndUpdateUsedFieldsOfDs={this.onSettingChangeAndUpdateUsedFieldsOfDs}
                checkIsDsAutoRefreshSettingOpen={this.checkIsDsAutoRefreshSettingOpen}
                handleCheckboxChange={this.handleCheckboxChange}
                onSettingChange={this.props.onSettingChange}
                changeCardSettingAndBuilderStatus={this.changeCardSettingAndBuilderStatus}
              />}
              {showCardSetting !== Status.Default && <SelectAndHoverSetting
                id={id}
                config={config}
                appConfig={appConfig}
                showCardSetting={showCardSetting}
                browserSizeMode={browserSizeMode}
                useDataSources={useDataSources}
                appMode={appMode}
                layouts={layouts}
                toHoverSettingButtonRef={this.toHoverSettingButtonRef}
                toSelectedSettingButtonRef={this.toSelectedSettingButtonRef}
                onSettingChange={this.props.onSettingChange}
                changeCardSettingAndBuilderStatus={this.changeCardSettingAndBuilderStatus}
                onSettingChangeAndUpdateUsedFieldsOfDs={this.onSettingChangeAndUpdateUsedFieldsOfDs}
              />}
            </Fragment>
          }

          <CreateDataSource
            id={id}
            config={config}
            datasource={datasource}
            useDataSources={useDataSources}
            onSettingChange={this.props.onSettingChange}
            setDatasource={this.setDatasource}
            checkIsDsAutoRefreshSettingOpen={this.checkIsDsAutoRefreshSettingOpen}
            onSettingChangeAndUpdateUsedFieldsOfDs={this.onSettingChangeAndUpdateUsedFieldsOfDs}
          />
        </div>}
      </div>
    )
  }
}
