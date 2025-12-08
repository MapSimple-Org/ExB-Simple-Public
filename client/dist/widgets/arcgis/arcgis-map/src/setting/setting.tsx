/** @jsx jsx */
import {
  React, Immutable, type ImmutableObject, type DataSourceJson, type IMState, FormattedMessage, lodash,
  css, jsx, DataSourceManager, getAppStore, polished, classNames, type UseDataSource, AllDataSourceTypes, type ImmutableArray
} from 'jimu-core'
import { loadArcGISJSAPIModules, type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { Alert, Switch, Image, Radio, defaultMessages as jimuUIDefaultMessages, Select, Checkbox, Label, Tooltip, CollapsablePanel, Button } from 'jimu-ui'
import { type IMJimuMapConfig, MapStatesEditor } from 'jimu-ui/advanced/map'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { ColorPicker } from 'jimu-ui/basic/color-picker'
import { type AllWidgetSettingProps, builderAppSync, helpUtils } from 'jimu-for-builder'
import { SettingSection, SettingRow , SidePopper } from 'jimu-ui/advanced/setting-components'
import { type IMConfig, SceneQualityMode, type CustomLODs, type ScaleRange, type IMScalebarOptions } from '../config'
import defaultMessages from './translations/default'
import MapThumb from '../../src/runtime/components/map-thumb'
import ToolModules from '../../src/runtime/layout/tool-modules-config'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { WidgetMapOutlined } from 'jimu-icons/outlined/brand/widget-map'
import { type PopupDockPosition, type CustomPopupDockPosition, getValidPopupDockPosition, getMinScaleAndMaxScaleByLods, isExpressMode } from '../utils'
import { PopupPositionSetting } from './components/popup-position-setting'
import { LodRangeIndicator } from './components/lod-range-indicator'
import { CustomLodsModal } from './components/custom-lods-modal'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import ScalebarSetting from './components/scalebar-setting'

interface ExtraProps {
  dsJsons: ImmutableObject<{ [dsId: string]: DataSourceJson }>
}

interface WebMapInfo {
  jimuMapViewId: string
  mapName: string
  lodScaleRange: ScaleRange
}

interface State {
  showSelectThirdMapAlert: boolean
  clientQueryHelpHref: string
  scaleRangleLimit: ScaleRange
  webMapInfos: WebMapInfo[]
  scaleRangeCounter: number
  showCustomLodModal: boolean
  sidePopperMapTool: string
}

interface AppClientQueryDataSourceWidgetInfo {
  // key is dataSourceId, value is widgetIds that enable client query for this dataSourceId
  [dataSourceId: string]: string[]
}

interface DataSourceClientQueryInfo {
  dataSourceId: string
  dsLabel: string
  clientQueryEnabled: boolean
  switchEnabled: boolean
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig> & ExtraProps, State> {
  unmount = false
  dsManager = DataSourceManager.getInstance()
  integratedDataSourceSetting = {} as any
  supportedDsTypes = Immutable([AllDataSourceTypes.WebMap, AllDataSourceTypes.WebScene])
  closeThirdMapAlertTimer
  alertRef = React.createRef<HTMLDivElement>()
  activeJimuMapView: JimuMapView
  webMapJimuMapViews: JimuMapView[]
  handlesOfWebMapLods: __esri.Handle[]
  scaleRangeSliderContainer: HTMLDivElement
  reactiveUtils: __esri.reactiveUtils
  ScaleRangeSlider: typeof __esri.ScaleRangeSlider
  scaleRangeSlider: __esri.ScaleRangeSlider
  handlesOfScaleRangeSlider: __esri.Handle[]
  scaleHandleOfMapView: __esri.Handle
  minScale: number
  maxScale: number
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  debounceHandleMinMaxScaleChange = () => {}
  scaleRangeCounter = 0
  mapToolsContainer: HTMLElement
  mapToolsContainerClickedTimestamp: number

  presetColors = [
    { label: '#00FFFF', value: '#00FFFF', color: '#00FFFF' },
    { label: '#FF9F0A', value: '#FF9F0A', color: '#FF9F0A' },
    { label: '#089BDC', value: '#089BDC', color: '#089BDC' },
    { label: '#FFD159', value: '#FFD159', color: '#FFD159' },
    { label: '#74B566', value: '#74B566', color: '#74B566' },
    { label: '#FF453A', value: '#FF453A', color: '#FF453A' },
    { label: '#9868ED', value: '#9868ED', color: '#9868ED' },
    { label: '#43ABEB', value: '#43ABEB', color: '#43ABEB' }
  ]

  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      dsJsons: state.appStateInBuilder.appConfig.dataSources
    }
  }

  constructor (props) {
    super(props)

    this.debounceHandleMinMaxScaleChange = lodash.debounce(() => {
      this.handleMinMaxScaleChange()
    }, 1000)

    this.mapToolsContainerClickedTimestamp = -1

    const initScaleRange = this.props?.config?.scaleRange

    if (initScaleRange) {
      this.minScale = initScaleRange.minScale
      this.maxScale = initScaleRange.maxScale
    }

    this.webMapJimuMapViews = []
    this.handlesOfWebMapLods = []
    this.handlesOfScaleRangeSlider = []

    this.state = {
      showSelectThirdMapAlert: false,
      clientQueryHelpHref: '#',
      scaleRangleLimit: null,
      webMapInfos: [],
      scaleRangeCounter: 0,
      showCustomLodModal: false,
      sidePopperMapTool: ''
    }

    this.initDataSourceSettingOption()
  }

  getStyle () {
    // ScaleRangeSlider should not be flipped in RTL locale, LodRangeIndicator should follow the same behavior.
    const appState = getAppStore().getState()
    const isRTL = appState?.appContext?.isRTL
    const rtlCssOfLodRangeIndicatorScale = isRTL ? 'transform: scale(-1);' : ''

    return css`
      .widget-setting-map {
        color: ${this.props.theme.ref.palette.neutral[1000]};

        .setting-row-text-level-1 {
          color: ${this.props.theme.ref.palette.neutral[1100]} !important;
        }

        .source-description {
          color: ${this.props.theme.ref.palette.neutral[1000]};
        }

        .webmap-thumbnail{
          cursor: pointer;
          width: 100%;
          height: 120px;
          overflow: hidden;
          padding: 1px;
          border: ${polished.rem(2)} solid initial;
          img, div{
            width: 100%;
            height: 100%;
          }
        }

        .selected-item{
          border: ${polished.rem(2)} solid ${this.props.theme.sys.color.primary.light} !important;
        }

        .webmap-thumbnail-multi{
          cursor: pointer;
          width: 48%;
          height: 100px;
          overflow: hidden;
          padding: 1px;
          border: ${polished.rem(2)} solid initial;
          img, div{
            width: 100%;
            height: 100%;
          }
        }

        .placeholder-container {
          background-color: ${this.props.theme.sys.color.secondary.main};
          width: 100%;
          height: 120px;
          position: relative;
        }

        .placeholder-icon {
          top: 40%;
          left: 46%;
          position: absolute;
          fill: ${this.props.theme.ref.palette.neutral[900]};
        }

        .choose-btn{
          width: 100%;
        }

        .webmap-tools{
          .webmap-tools-item{
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
        }

        .uploadInput {
          position: absolute;
          opacity: 0;
          left: 0;
          top: 0;
          cursor: pointer;
        }

        .uploadInput-container {
          position: relative;
        }

        .setting-map-button{
          cursor: 'pointer';
        }

        .select-third-map-alert {
          position: fixed;
          right: 0;
          top: 139px;
          width: 260px;
          height: auto;
          z-index: 1;
        }
      }

      .item-selector-popup {
        width: 850px;
        .modal-body {
          max-height: 70vh;
          overflow: auto;
        }
      }

      .dock-popup-label {
        display: inline;
      }

      .dock-popup-custom-position-label {
        justify-content: start;
        line-height: 26px;
        text-wrap: wrap;
        word-break: break-all;

        &.use-custom-dock-popup-position {
          width: calc(100% - 46px);
        }
      }

      .enable-client-query-header >.jimu-widget-setting--row-label {
        margin-bottom: 0;
      }

      .original-scale-range-tip-setting-row > .jimu-widget-setting--row-label {
        max-width: 100%;
        margin: 0;
      }

      .lod-range-indicator-setting-row {
        padding-left: 10px;
        padding-right: 10px;
      }

      .lod-range-indicator {
        width: 100% !important;
        flex-grow: 0;
        flex-shrink: 0;
        ${rtlCssOfLodRangeIndicatorScale}
      }

      .exb-scale-range-slider-setting-row {
        .exb-scale-range-slider-container {
          width: 100% !important;
          flex-grow: 0;
          flex-shrink: 0;
        }
      }

      .esri-scale-range-slider {
        min-width: auto;
        width: 100%;

        &.esri-widget {
          background: transparent;
        }

        .esri-slider.esri-widget {
          background-color: transparent;
        }

        .esri-scale-range-slider__segment-active {
          background-color: var(--sys-color-action-selected, #007F94);
        }

        .esri-slider__thumb {
          border-color: var(--sys-color-action-selected, #007F94);
        }

        --calcite-color-brand: var(--sys-color-primary-light, #00D8ED);
        --calcite-color-brand-hover: var(--sys-color-primary-light, #00D8ED);

        .esri-scale-range-slider__scale-menu-container {
          width: 100%;
          > calcite-dropdown {
            max-width: 50%;

            .esri-scale-range-slider__scale-menu-toggle {
              max-width: 100%;
              --calcite-offset-invert-focus: 1;
            }
          }
        }

        calcite-dropdown-group {
          border-radius: 4px;
          border: 1px solid var(--sys-color-divider-secondary, #585858);
          background: var(--sys-color-surface-overlay, #282828);
          box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.20);
          --calcite-color-text-3: var(--sys-color-surface-overlay-hint, #DCDCDC);
        }
      }
    `
  }

  componentDidMount () {
    this.unmount = false
    document.body.addEventListener('click', this.onClickBody, false)
    this.updateClientQueryHelpHref()
    this.loadApiScaleRangeSlider()
  }

  async updateClientQueryHelpHref () {
    try {
      const widgetName = this.props.manifest?.name

      if (widgetName) {
        let href = await helpUtils.getWidgetHelpLink(widgetName)

        if (!href) {
          href = '#'
        }

        if (!this.unmount) {
          this.setState({
            clientQueryHelpHref: href
          })
        }
      }
    } catch (e) {
      console.error('can not get help link of map', e)
    }
  }

  componentWillUnmount () {
    this.unmount = true
    document.body.removeEventListener('click', this.onClickBody, false)
    this.cancelCloseSelectThirdMapAlertTimer()
    this.releaseWebMapLodHandles()
    this.releaseScaleHandleOfMapView()
    this.removeScaleRangeSlider()
  }

  updateConfig(newConfig: IMConfig) {
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onScaleRangeSwitchChange = (evt) => {
    const checked = evt?.target?.checked

    if (!checked) {
      this.removeScaleRangeSlider()
    }

    const scaleRange: ScaleRange = checked ? {} : null
    this.minScale = scaleRange?.minScale
    this.maxScale = scaleRange?.maxScale
    const newConfig = this.props.config.set('scaleRange', scaleRange).set('customLODs', null)
    this.updateConfig(newConfig)
  }

  onCustomLodRadioChecked = () => {
    this.removeScaleRangeSlider()
    this.minScale = undefined
    this.maxScale = undefined
    const customLods: CustomLODs = {}
    const newConfig = this.props.config.set('customLODs', customLods).set('scaleRange', null)
    this.updateConfig(newConfig)
  }

  onScaleSliderRadioChecked = () => {
    this.minScale = undefined
    this.maxScale = undefined
    const scaleRange: ScaleRange = {}
    const newConfig = this.props.config.set('scaleRange', scaleRange).set('customLODs', null)
    this.updateConfig(newConfig)
  }

  onModifyCustomLodBtnClick = () => {
    this.setState({
      showCustomLodModal: true
    })
  }

  onCustomLodModalOk = (lods: __esri.LODProperties[]) => {
    const customLods: CustomLODs = {
      lods
    }
    const newConfig = this.props.config.set('customLODs', customLods)
    this.updateConfig(newConfig)

    this.setState({
      showCustomLodModal: false
    })
  }

  onCustomLodModalCancel = () => {
    this.setState({
      showCustomLodModal: false
    })
  }

  onJimuMapViewsChange = (views: { [viewId: string]: JimuMapView }) => {
    this.releaseWebMapLodHandles()
    this.webMapJimuMapViews = Object.values(views || {}).filter(jimuMapView => jimuMapView?.view?.type === '2d')
    this.webMapJimuMapViews.forEach(async (webMapJimuMapView) => {
      const handle = await webMapJimuMapView.watch(() => (webMapJimuMapView?.view as any).constraintsInfo?.lods, () => {
        this.updateWebMapJimuMapViewInfos()
      })

      if (!this.handlesOfWebMapLods) {
        this.handlesOfWebMapLods = []
      }

      this.handlesOfWebMapLods.push(handle)
    })
    this.updateWebMapJimuMapViewInfos()
  }

  releaseWebMapLodHandles () {
    if (this.handlesOfWebMapLods?.length > 0) {
      this.handlesOfWebMapLods.forEach(handle => {
        if (handle) {
          handle.remove()
        }
      })
    }

    this.handlesOfWebMapLods = []
  }

  updateWebMapJimuMapViewInfos () {
    const webMapInfos: WebMapInfo[] = []

    if (this.webMapJimuMapViews?.length > 0) {
      this.webMapJimuMapViews.forEach(jimuMapView => {
        const apiView = jimuMapView.view
        const webMapName = (apiView.map as any)?.portalItem?.title || ''
        const lodScaleRange = getMinScaleAndMaxScaleByLods(apiView)
        const webmapInfo: WebMapInfo = {
          jimuMapViewId: jimuMapView.id,
          mapName: webMapName,
          lodScaleRange
        }
        webMapInfos.push(webmapInfo)
      })
    }

    this.setState({
      webMapInfos
    })
  }

  onActiveJimuViewChange = (activeJimuMapView: JimuMapView) => {
    this.releaseScaleHandleOfMapView()
    this.activeJimuMapView = activeJimuMapView
    this.updateScaleRangeSlider()
    // this.render() method will use this.activeJimuMapView, but this.activeJimuMapView is not in this.state,
    // so we need to call this.forceUpdate() to trigger this.render() method again to make sure it can get the latest activeJimuMapView.
    this.forceUpdate()
  }

  loadApiScaleRangeSlider () {
    loadArcGISJSAPIModules(['esri/core/reactiveUtils', 'esri/widgets/ScaleRangeSlider']).then(modules => {
      this.reactiveUtils = modules[0] as __esri.reactiveUtils
      this.ScaleRangeSlider = modules[1] as typeof __esri.ScaleRangeSlider
      this.updateScaleRangeSlider()
    })
  }

  releaseScaleHandleOfMapView () {
    if (this.scaleHandleOfMapView) {
      this.scaleHandleOfMapView.remove()
      this.scaleHandleOfMapView = null
    }
  }

  onScaleRangeSliderContainerChange = (container) => {
    this.scaleRangeSliderContainer = container
    this.updateScaleRangeSlider()
  }

  async updateScaleRangeSlider () {
    if (this.unmount) {
      return
    }

    this.releaseScaleHandleOfMapView()
    this.removeScaleRangeSlider()

    const apiMapView = this.activeJimuMapView?.view
    const config = this.props.config

    if (this.ScaleRangeSlider && apiMapView && this.scaleRangeSliderContainer && config?.scaleRange) {
      // console.log('scaleRangeSlider created', this.activeJimuMapView.id)
      // Don't use this.scaleRangeSliderContainer as the container of ScaleRangeSlider directly, instead we should create a new div as the container.
      const container = document.createElement('div')
      this.scaleRangeSliderContainer.appendChild(container)

      const scaleRangeSliderProperties: __esri.ScaleRangeSliderProperties = {
        container,
        view: apiMapView
      }

      if (typeof this.minScale === 'number') {
        scaleRangeSliderProperties.minScale = this.minScale
      }

      if (typeof this.maxScale === 'number') {
        scaleRangeSliderProperties.maxScale = this.maxScale
      }

      const appState = getAppStore().getState()
      const locale = appState?.appContext?.locale

      if (locale) {
        // e.g. en-us
        const splits = locale.split('-')

        if (splits?.length > 0) {
          const lastSplit = splits[splits.length - 1]

          if (lastSplit) {
            const region = lastSplit.toUpperCase()

            const validRegions: string[] = [
              'AE', 'AR', 'AT', 'AU', 'BE', 'BG', 'BO', 'BR', 'CA', 'CH', 'CI', 'CL', 'CN', 'CO', 'CR', 'CZ', 'DE',
              'DK', 'EE', 'EG', 'ES', 'FI', 'FR', 'GB', 'GL', 'GR', 'GT', 'HK', 'ID', 'IE', 'IL', 'IN', 'IQ', 'IS', 'IT',
              'JP', 'KE', 'KR', 'KW', 'LI', 'LT', 'LU', 'LV', 'MA', 'MG', 'ML', 'MO', 'MX', 'MY', 'NI', 'NL', 'NO', 'NZ',
              'PE', 'PL', 'PR', 'PT', 'RO', 'RU', 'RW', 'SE', 'SG', 'SK', 'SR', 'SV', 'TH', 'TN', 'TW', 'US', 'VE', 'VI', 'ZA'
            ]

            if (validRegions.includes(region)) {
              scaleRangeSliderProperties.region = region as any
            }
          }
        }
      }

      this.scaleRangeSlider = new this.ScaleRangeSlider(scaleRangeSliderProperties)
      this.watchHandlesOfScaleRangeSlider()
      this.updateScaleRangeLimitState(this.scaleRangeSlider)
      this.scaleHandleOfMapView = await this.activeJimuMapView.watch(() => apiMapView.scale, () => {
        if (this.scaleRangeSlider) {
          // change this.scaleRangeSlider.view to force the this.scaleRangeSlider update the current scale indicator by apiMapView.scale
          this.scaleRangeSlider.view = null
          this.scaleRangeSlider.view = apiMapView
        }
      })
      this.updateScaleRangeCounterState()
    }
  }

  watchHandlesOfScaleRangeSlider () {
    this.releaseHandlesOfScaleRangeSlider()

    const scaleRangeSlider = this.scaleRangeSlider

    if (scaleRangeSlider) {
      const minScaleHandle = this.reactiveUtils.watch(() => scaleRangeSlider.minScale, (newMinScale: number) => {
        this.minScale = newMinScale
        this.debounceHandleMinMaxScaleChange()
      })

      const maxScaleHandle = this.reactiveUtils.watch(() => scaleRangeSlider.maxScale, (newMaxScale: number) => {
        this.maxScale = newMaxScale
        this.debounceHandleMinMaxScaleChange()
      })

      const minMaxScaleLimitHandle = this.reactiveUtils.watch(() => [scaleRangeSlider.minScaleLimit, scaleRangeSlider.maxScaleLimit], () => {
        this.updateScaleRangeLimitState(scaleRangeSlider)
      })

      if (!this.handlesOfScaleRangeSlider) {
        this.handlesOfScaleRangeSlider = []
      }

      this.handlesOfScaleRangeSlider.push(minScaleHandle, maxScaleHandle, minMaxScaleLimitHandle)
    }
  }

  updateScaleRangeLimitState(scaleRangeSlider: __esri.ScaleRangeSlider) {
    const scaleRangleLimit: ScaleRange = {
      minScale: scaleRangeSlider.minScaleLimit,
      maxScale: scaleRangeSlider.maxScaleLimit
    }

    this.setState({ scaleRangleLimit })
  }

  releaseHandlesOfScaleRangeSlider () {
    if (this.handlesOfScaleRangeSlider?.length > 0) {
      this.handlesOfScaleRangeSlider.forEach(handle => {
        if (handle) {
          handle.remove()
        }
      })
    }

    this.handlesOfScaleRangeSlider = []
  }

  removeScaleRangeSlider () {
    this.releaseScaleHandleOfMapView()
    this.releaseHandlesOfScaleRangeSlider()

    if (this.scaleRangeSlider) {
      const container = this.scaleRangeSlider.container
      this.scaleRangeSlider.destroy()
      this.scaleRangeSlider = null

      if (container) {
        if (container.parentElement) {
          container.parentElement.removeChild(container)
        }
      }
    }

    this.updateScaleRangeCounterState()
  }

  // This method will be called when this.scaleRangeSlider changed.
  // It will trigger the render method to use the latest this.scaleRangeSlider by updating scaleRangeCounter state.
  updateScaleRangeCounterState() {
    this.scaleRangeCounter++

    if (!this.unmount) {
      this.setState({ scaleRangeCounter: this.scaleRangeCounter })
    }
  }

  handleMinMaxScaleChange () {
    if (this.unmount) {
      return
    }

    const scaleRange: ScaleRange = {}

    // If minScale is 0, means there is no limit for minScale.
    if (typeof this.minScale === 'number' && this.minScale > 0) {
      scaleRange.minScale = this.minScale
    }

    // If maxScale is 0, means there is no limit for maxScale.
    if (typeof this.maxScale === 'number' && this.maxScale > 0) {
      scaleRange.maxScale = this.maxScale
    }

    const newConfig = this.props.config.set('scaleRange', scaleRange)
    this.updateConfig(newConfig)
  }

  resetMinScaleAndMaxScale () {
    this.minScale = null
    this.maxScale = null

    if (this.scaleRangeSlider) {
      // We don't want the flowing code emit minScale/maxScale change event.
      this.releaseHandlesOfScaleRangeSlider()
      this.scaleRangeSlider.minScale = 0
      this.scaleRangeSlider.maxScale = 0
      this.watchHandlesOfScaleRangeSlider()
    }
  }

  getPortUrl = (): string => {
    const portUrl = getAppStore().getState().portalUrl
    return portUrl
  }

  getMapDataSourceCount(): [webMapDataSourceCount: number, webSceneDataSourceCount: number, allDataSourceCount: number] {
    let webMapDataSourceCount: number = 0
    let webSceneDataSourceCount: number = 0
    let allDataSourceCount: number = 0

    const useDataSources = this.props.useDataSources

    if (useDataSources && useDataSources.length > 0) {
      allDataSourceCount = useDataSources.length
      useDataSources.forEach(useDataSource => {
        const type = this.props.dsJsons[useDataSource.dataSourceId]?.type

        if (type === 'WEB_MAP') {
          webMapDataSourceCount++
        } else if (type === 'WEB_SCENE') {
          webSceneDataSourceCount++
        }
      })
    }

    return [webMapDataSourceCount, webSceneDataSourceCount, allDataSourceCount]
  }

  onNewDataAdded = (newAddedUseDataSources: UseDataSource[]) => {
    if (isExpressMode() && newAddedUseDataSources?.length > 0) {
      const propsUseDataSources: Immutable.ImmutableArray<UseDataSource> = this.props.useDataSources || Immutable([])
      const dsCount = propsUseDataSources.length + newAddedUseDataSources.length

      if (dsCount <= 2) {
        // Maybe use already click the new data source, so it maybe already in props.useDataSources. We need to check this case.
        const propUseDataSourceIds = propsUseDataSources.map(useDataSource => useDataSource?.dataSourceId)
        const filteredNewAddedUseDataSources = newAddedUseDataSources.filter(useDataSource => {
          return useDataSource && !propUseDataSourceIds.includes(useDataSource.dataSourceId)
        })

        if (filteredNewAddedUseDataSources.length > 0) {
          this.onDataSourceSelected(filteredNewAddedUseDataSources, propsUseDataSources)
        }
      }
    }
  }

  // This method is triggered when select new webmap/webscene data source or remove webmap/webscene data source.
  onDataSourceChange = (useDataSources: UseDataSource[]) => {
    if (!useDataSources) {
      return
    }

    // Use propsUseDataSources instead of this.props.useDataSources because this.props.useDataSources maybe undefined.
    let propsUseDataSources: Immutable.ImmutableArray<UseDataSource> = this.props.useDataSources

    if (!propsUseDataSources) {
      // There is no data source by default, so this.props.useDataSources is undefined by default.
      // So it means user doesn't select any webmap/webscene data source if propsUseDataSources is empty.
      propsUseDataSources = Immutable([])
    }

    if (useDataSources.length > propsUseDataSources.length) {
      // select new webmap/webscene data source
      const propUseDataSourceIds = propsUseDataSources.map(useDataSource => useDataSource?.dataSourceId)
      const newSelectedUseDataSources = useDataSources.filter(useDataSource => !propUseDataSourceIds.includes(useDataSource?.dataSourceId))
      this.onDataSourceSelected(newSelectedUseDataSources, propsUseDataSources)
    } else if (useDataSources.length < propsUseDataSources.length) {
      // unselect webmap/webscene data source
      const currentRemovedDs = propsUseDataSources.find(uDs => !useDataSources.some(ds => uDs.dataSourceId === ds.dataSourceId))
      this.onDataSourceRemoved(currentRemovedDs)
    }
  }

  onDataSourceSelected = (newSelectedUseDataSources: UseDataSource[], propsUseDataSources: Immutable.ImmutableArray<UseDataSource>) => {
    // newSelectedUseDataSources are the new selected data sources from DataSourceSelector
    // Use propsUseDataSources instead of this.props.useDataSources because this.props.useDataSources maybe undefined.

    if (!newSelectedUseDataSources) {
      return
    }

    newSelectedUseDataSources = newSelectedUseDataSources.filter(useDataSource => !!useDataSource)

    if (newSelectedUseDataSources.length === 0) {
      return
    }

    if (!propsUseDataSources) {
      propsUseDataSources = Immutable([])
    }

    const firstNewSelectedDs = newSelectedUseDataSources[0]

    const newUseDataSources = propsUseDataSources.asMutable({ deep: true }) || []
    newUseDataSources.push(...newSelectedUseDataSources)

    this.integratedDataSourceSetting = {
      id: this.props.id,
      useDataSources: Immutable(newUseDataSources)
    }

    if (this.activeJimuMapView && !this.activeJimuMapView.dataSourceId) {
      // this.activeJimuMapView is default webmap, it will be destroyed soon, so we need to destroy the ScaleRangeSlider
      this.removeScaleRangeSlider()
    }

    this.resetMinScaleAndMaxScale()

    const settingOption = Object.assign({}, this.integratedDataSourceSetting)
    const newIMConfig = this.props.config
      .set('initialMapDataSourceID', firstNewSelectedDs.dataSourceId)
      .set('isUseCustomMapState', false)
      .set('initialMapState', null)
      .set('scaleRange', null)
      .set('customLODs', null)

    // Don't enable client query by default.
    // const canNewSelectedDataSourceEnableClientQuery = this.canNewSelectedDataSourceEnableClientQuery(firstNewSelectedDs)
    // if (canNewSelectedDataSourceEnableClientQuery) {
    //   newIMConfig = this.getNewConfigByEnableDataSourceClientQuery(newIMConfig, firstNewSelectedDs.dataSourceId)
    // }

    settingOption.config = newIMConfig
    this.props.onSettingChange(settingOption)
  }

  onDataSourceRemoved = (currentRemovedDs: UseDataSource): void => {
    if (!currentRemovedDs) {
      return
    }

    const removedDataSourceId = currentRemovedDs.dataSourceId

    // remove related useDataSource
    let tempUseDataSources = []
    tempUseDataSources = Object.assign(tempUseDataSources, this.props.useDataSources)
    for (let i = 0; i < tempUseDataSources.length; i++) {
      if (tempUseDataSources[i].dataSourceId === removedDataSourceId) {
        tempUseDataSources.splice(i, 1)
        break
      }
    }

    const settingChange = {
      id: this.props.id,
      useDataSources: Immutable(tempUseDataSources)
    } as any

    let settingOption = {} as any

    this.integratedDataSourceSetting = settingChange
    settingOption = Object.assign({}, this.integratedDataSourceSetting)
    let newConfig: IMConfig = null

    // console.log('onDataSourceRemoved')
    if (this.activeJimuMapView && removedDataSourceId && this.activeJimuMapView.dataSourceId === removedDataSourceId) {
      // this.activeJimuMapView will be destroyed soon, so we need to destroy the ScaleRangeSlider
      this.removeScaleRangeSlider()
    }

    this.resetMinScaleAndMaxScale()

    let initialMapDataSourceID = null

    if (tempUseDataSources.length > 0) {
      initialMapDataSourceID = tempUseDataSources[0] && tempUseDataSources[0].dataSourceId
    } else {
      initialMapDataSourceID = null
    }

    newConfig = this.props.config
      .set('initialMapDataSourceID', initialMapDataSourceID)
      .set('isUseCustomMapState', false)
      .set('initialMapState', null)
      .set('scaleRange', null)
      .set('customLODs', null)

    // try to remove removedDataSourceId from clientQueryDataSourceIds
    newConfig = this.getNewConfigByDisableDataSourceClientQuery(newConfig, removedDataSourceId)

    settingOption.config = newConfig

    this.props.onSettingChange(Object.assign({}, settingOption))
  }

  onMapToolsContainerRef = (ref) => {
    this.mapToolsContainer = ref
    // call forceUpdate to update the trigger propr of map tool setting SidePopper
    this.forceUpdate()
  }

  onMapToolsContainerClick = (evt) => {
    const target = evt?.target as HTMLElement

    if (target && !target.classList.contains('map-tool-sidepopper-setting-btn')) {
      this.mapToolsContainerClickedTimestamp = Date.now()
    }
  }

  // When click setting row label,
  // case1. If the setting button doesn't exist, mapToolsContainer click event and switch change event are triggered in sequence,
  //        so the switch works fine. This is expected.
  // case2. If the setting button exists, the click events of mapToolsContainer and setting button are triggered in sequence,
  //        but the change event of the switch is not triggered, which causes the switch to not work correctly.
  //        To avoid this problem, we need to detect this case and simulate the triggering of the change event of the switch.
  onMapToolSettingBtnClick = (mapTool: string, canToolName: string, isSwitchChecked: boolean): void => {
    // e.g.
    // mapTool: ScaleBar
    // canToolName: canScaleBar

    if (this.mapToolsContainerClickedTimestamp > 0) {
      const deltaTime = Date.now() - this.mapToolsContainerClickedTimestamp

      if (deltaTime <= 200) {
        // by test, deltaTime is <= 4ms, we use 200ms here
        // In this case, onMapToolSettingBtnClick is triggered by clicking setting row label, switch change event is not triggered.
        // so onMapToolSettingBtnClick should not be triggered, it should trigger onMapToolSwitchChanged.
        this.onMapToolSwitchChanged(mapTool, canToolName, !isSwitchChecked)
        return
      }
    }

    // map tool setting button is really clicked

    if (mapTool && this.state.sidePopperMapTool === mapTool) {
      this.setState({
        sidePopperMapTool: ''
      })
    } else {
      this.setState({
        sidePopperMapTool: mapTool
      })
    }
  }

  onMapToolSidePopperToggle = ():void => {
    this.setState({
      sidePopperMapTool: ''
    })
  }

  onMapToolSwitchChanged = (mapTool: string, canToolName: string, isSwitchChecked: boolean): void => {
    // e.g.
    // mapTool: ScaleBar
    // canToolName: canScaleBar
    this.handleMapToolSwitchChanged(mapTool, canToolName, isSwitchChecked)

    // hide map tool side popper if the tool is turned off
    if (mapTool && mapTool === this.state.sidePopperMapTool && !isSwitchChecked) {
      this.setState({
        sidePopperMapTool: ''
      })
    }
  }

  handleMapToolSwitchChanged = (mapTool: string, canToolName: string, checked: boolean): void => {
    // e.g.
    // mapTool: ScaleBar
    // canToolName: canScaleBar

    let newConfig = this.props.config.setIn(['toolConfig', canToolName], checked)

    if (mapTool === 'Select') {
      newConfig = newConfig.setIn(['toolConfig', 'canSelectState'], checked)
    }

    if (!checked) {
      // reset config.toolOptions when tool disabled
      if (newConfig.toolOptions && newConfig.toolOptions[mapTool]) {
        newConfig = newConfig.setIn(['toolOptions', mapTool], null)
      }
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onMapOptionsChanged = (checked, name): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(name, checked)
    })
  }

  onSceneQualityModeChanged = (value, name): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(name, value)
    })
  }

  onDisableSelection = (useDataSources: UseDataSource[]): boolean => {
    if (useDataSources.length > 1) {
      return true
    } else {
      return false
    }
  }

  onClickDisabledDsItem = () => {
    if (this.props.useDataSources && this.props.useDataSources.length >= 2) {
      setTimeout(() => {
        this.showSelectThirdMapAlert()
      }, 0)
    }
  }

  showSelectThirdMapAlert (): void {
    if (!this.unmount) {
      this.setState({
        showSelectThirdMapAlert: true
      }, () => {
        // make sure Alert dom is rendered and we can get the this.alertRef.current
        if (!this.unmount) {
          this.forceUpdate()
        }
      })

      this.startCloseSelectThirdMapAlertTimer()
    }
  }

  hideSelectThirdMapAlert (): void {
    this.cancelCloseSelectThirdMapAlertTimer()

    if (!this.unmount) {
      this.setState({
        showSelectThirdMapAlert: false
      })
    }
  }

  cancelCloseSelectThirdMapAlertTimer (): void {
    if (this.closeThirdMapAlertTimer) {
      clearTimeout(this.closeThirdMapAlertTimer)
      this.closeThirdMapAlertTimer = null
    }
  }

  startCloseSelectThirdMapAlertTimer (): void {
    this.cancelCloseSelectThirdMapAlertTimer()
    this.closeThirdMapAlertTimer = setTimeout(() => {
      if (!this.unmount) {
        this.setState({
          showSelectThirdMapAlert: false
        })
      }
    }, 5000)
  }

  onClickBody = () => {
    if (!this.unmount) {
      this.hideSelectThirdMapAlert()
    }
  }

  onSelectThirdMapAlertClose = () => {
    this.hideSelectThirdMapAlert()
  }

  // use for dataSourceSetting cache
  initDataSourceSettingOption = () => {
    let tempUseDataSources = []
    tempUseDataSources = Object.assign(tempUseDataSources, this.props.useDataSources)

    const dataSourceSettingOption = {
      widgetId: this.props.id,
      useDataSources: Immutable(tempUseDataSources)
    }
    this.integratedDataSourceSetting = dataSourceSettingOption
  }

  setInitialMap = (dataSourceId: string) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('initialMapDataSourceID', dataSourceId)
    })

    // mapWidget.props.stateProps.initialMapDataSourceID is a temporary variable to let map setting and map runtime communicate with each other.
    // If we change the initialMapDataSourceID by clicking ds thumbnail in map setting,
    // then map setting will call builderAppSync.publishChangeWidgetStatePropToApp() to update mapWidget.props.stateProps.initialMapDataSourceID.
    // Once we check mapWidget.props.stateProps.initialMapDataSourceID is not empty in MultiSourceMap, means we changed the initialMapDataSourceID,
    // then we make sure the initialMapbase go to the initial extent.
    // At last, MultiSourceMap will reset mapWidget.props.stateProps.initialMapDataSourceID to empty.
    builderAppSync.publishChangeWidgetStatePropToApp({ widgetId: this.props.id, propKey: 'initialMapDataSourceID', value: dataSourceId })
  }

  changeToolLayout = (index: number) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('layoutIndex', index)
    })
  }

  handleMapInitStateChanged = (config: IMJimuMapConfig) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('initialMapDataSourceID', config.initialMapDataSourceID).set('initialMapState', config.initialMapState)
    })
  }

  handleIsUseCustomMapState = (isUseCustomMapState: boolean) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('isUseCustomMapState', isUseCustomMapState).set('initialMapState', null)
    })
  }

  updateSelectionHighlightColor = (color: string) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('selectionHighlightColor', color)
    })
  }

  updateSelectionHighlightHaloColor = (color: string) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('selectionHighlightHaloColor', color)
    })
  }

  onEnablePopupSwitchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const disableMapPopup = !evt.target.checked

    let newConfig: IMConfig = this.props.config.set('disablePopUp', disableMapPopup)

    if (disableMapPopup) {
      newConfig = newConfig.set('showPopupUponSelection', false).set('popupDockPosition', '')
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onShowPopupUponSelectionCheckboxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.onMapOptionsChanged(evt.target.checked, 'showPopupUponSelection')
  }

  onDockPopupCheckboxChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const config = this.props.config
    let newConfig: IMConfig = config

    if (evt.target.checked) {
      newConfig = config.set('popupDockPosition', 'auto')
    } else {
      newConfig = config.set('popupDockPosition', '')
    }

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  // this method is triggered if 'Default' radio is checked
  onAutoDockPopupPositionRadioChange = () => {
    const config = this.props.config
    const newConfig = config.set('popupDockPosition', 'auto')
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  // this method is triggered if 'Custom' radio is checked
  onCustomDockPopupPositionRadioChange = () => {
    const config = this.props.config
    const newConfig = config.set('popupDockPosition', 'top-right')
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  onPopupDockPositionChange = (newPosition: PopupDockPosition) => {
    const config = this.props.config

    if (config.popupDockPosition === newPosition) {
      return
    }

    const newConfig = config.set('popupDockPosition', newPosition)

    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    })
  }

  handleMapThumbKeyDown = (e: React.KeyboardEvent<any>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      this.setInitialMap(this.props.useDataSources[index].dataSourceId)
      e?.preventDefault()
    }
  }

  handleLayoutThumbKeyDown = (e: React.KeyboardEvent<any>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      this.changeToolLayout(index)
      e?.preventDefault()
    }
  }

  getAppClientQueryDataSourceWidgetInfo = (): AppClientQueryDataSourceWidgetInfo => {
    const result: AppClientQueryDataSourceWidgetInfo = {} // { dataSourceId: mapWidgetIds }
    const widgetsJson = getAppStore().getState()?.appStateInBuilder?.appConfig?.widgets

    if (widgetsJson) {
      const widgetJsonArray = Object.values(widgetsJson)

      for (const widgetJson of widgetJsonArray) {
        if (widgetJson.uri === 'widgets/arcgis/arcgis-map/') {
          const mapWidgetId = widgetJson.id
          const useDataSources = widgetJson.useDataSources
          const mapWidgetConfig = widgetJson.config as IMConfig

          const useDataSourceIds: string[] = []

          if (useDataSources && useDataSources.length > 0) {
            useDataSources.forEach(useDataSource => {
              const dataSourceId = useDataSource?.dataSourceId

              if (dataSourceId) {
                useDataSourceIds.push(dataSourceId)
              }
            })
          }

          // The dataSourceId in mapWidgetConfig.clientQueryDataSourceIds maybe not exist in widgetJson.useDataSources (see #17570 for more details),
          // so we need to validate mapWidgetConfig.clientQueryDataSourceIds by widgetJson.useDataSources.
          const validClientQueryDataSourceIds: string[] = []

          if (mapWidgetConfig?.clientQueryDataSourceIds?.length > 0) {
            // This is just a workaround for #17570, need further fix once #12995 fixed.
            mapWidgetConfig?.clientQueryDataSourceIds?.forEach(dataSourceId => {
              if (useDataSourceIds.includes(dataSourceId)) {
                validClientQueryDataSourceIds.push(dataSourceId)
              }
            })
          }

          if (validClientQueryDataSourceIds?.length > 0) {
            validClientQueryDataSourceIds?.forEach(dataSourceId => {
              if (!result[dataSourceId]) {
                result[dataSourceId] = []
              }

              if (!result[dataSourceId].includes(mapWidgetId)) {
                result[dataSourceId].push(mapWidgetId)
              }
            })
          }
        }
      }
    }

    return result
  }

  // Return true if the new selected data source can enable client query by default, otherwise return false.
  // newSelectedDs is just selected from DataSourceSelector, it is not in this.props.useDataSources yet.
  canNewSelectedDataSourceEnableClientQuery = (newSelectedDs: UseDataSource): boolean => {
    let result: boolean = false

    const dataSourceId = newSelectedDs.dataSourceId
    const allDsJsons = this.props.dsJsons
    const dsJson = allDsJsons && allDsJsons[dataSourceId]

    if (dsJson && dsJson.type === 'WEB_MAP') {
      const appClientQueryDataSourceWidgetInfo = this.getAppClientQueryDataSourceWidgetInfo()
      // widgetIds is the widget ids that enable client query for the newSelectedDs data source.
      const widgetIds = appClientQueryDataSourceWidgetInfo[dataSourceId] || []
      result = widgetIds.length === 0
    }

    return result
  }

  getDsClientQueryInfos = (): DataSourceClientQueryInfo[] => {
    const result: DataSourceClientQueryInfo[] = []
    const appClientQueryDataSourceWidgetInfo = this.getAppClientQueryDataSourceWidgetInfo()
    const currMapWidgetId = this.props.id
    const allDsJsons = this.props.dsJsons

    if (allDsJsons && this.props.useDataSources?.length > 0) {
      this.props.useDataSources?.forEach(useDataSource => {
        const dataSourceId = useDataSource.dataSourceId

        if (dataSourceId) {
          const dsJson = allDsJsons[dataSourceId]

          if (dsJson && dsJson.type === 'WEB_MAP') {
            const dsLabel = dsJson.label || dsJson.sourceLabel || ''
            const enableClientQueryWidgetIds = appClientQueryDataSourceWidgetInfo[dataSourceId] || []
            const clientQueryEnabled = enableClientQueryWidgetIds.includes(currMapWidgetId)

            let switchEnabled = false

            if (clientQueryEnabled) {
              switchEnabled = true
            } else {
              switchEnabled = enableClientQueryWidgetIds.length === 0
            }

            result.push({
              dataSourceId,
              dsLabel,
              clientQueryEnabled,
              switchEnabled
            })
          }
        }
      })
    }

    return result
  }

  // enable client query for dataSourceId, dataSourceId is the old config, this method will return a new config with client query enabled
  getNewConfigByEnableDataSourceClientQuery = (oldConfig: IMConfig, dataSourceId: string): IMConfig => {
    let newConfig: IMConfig = oldConfig

    const oldClientQueryDataSourceIds = oldConfig.clientQueryDataSourceIds
    let newClientQueryDataSourceIds: ImmutableArray<string> = null

    if (oldClientQueryDataSourceIds) {
      if (oldClientQueryDataSourceIds.includes(dataSourceId)) {
        newClientQueryDataSourceIds = oldClientQueryDataSourceIds
      } else {
        newClientQueryDataSourceIds = Immutable(oldClientQueryDataSourceIds.asMutable().concat(dataSourceId))
      }
    } else {
      newClientQueryDataSourceIds = Immutable([dataSourceId])
    }

    if (oldClientQueryDataSourceIds !== newClientQueryDataSourceIds) {
      newConfig = oldConfig.set('clientQueryDataSourceIds', newClientQueryDataSourceIds)
    }

    return newConfig
  }

  // disable client query for dataSourceId, dataSourceId is the old config, this method will return a new config with client query disabled
  getNewConfigByDisableDataSourceClientQuery = (oldConfig: IMConfig, dataSourceId: string): IMConfig => {
    let newConfig: IMConfig = oldConfig

    if (oldConfig.clientQueryDataSourceIds?.includes(dataSourceId)) {
      const newClientQueryDataSourceIds = oldConfig.clientQueryDataSourceIds.filter(item => item !== dataSourceId)
      newConfig = newConfig.set('clientQueryDataSourceIds', newClientQueryDataSourceIds)
    }

    return newConfig
  }

  onClientQueryChanged = (dataSourceId: string, checked: boolean) => {
    const currentWidgetId = this.props.id
    const oldConfig = this.props.config
    let newConfig = oldConfig

    if (checked) {
      // enable client query
      // need to check if other map already enable client query for safety
      const appClientQueryDataSourceWidgetInfo = this.getAppClientQueryDataSourceWidgetInfo()
      const widgetIds = appClientQueryDataSourceWidgetInfo[dataSourceId] || []
      const otherWidgetIds = widgetIds.filter(widgetId => widgetId !== currentWidgetId)

      if (otherWidgetIds.length > 0) {
        console.warn(`the data source ${dataSourceId} is enabled client query in another map widget, ${otherWidgetIds}`)
        return
      }

      newConfig = this.getNewConfigByEnableDataSourceClientQuery(oldConfig, dataSourceId)
    } else {
      // disable client query
      newConfig = this.getNewConfigByDisableDataSourceClientQuery(oldConfig, dataSourceId)
    }

    this.props.onSettingChange({
      id: currentWidgetId,
      config: newConfig
    })
  }

  render () {
    const mapWidgetId = this.props?.widgetId
    const config = this.props.config
    const customLODs = config?.customLODs
    const scaleRange = config?.scaleRange
    const portalUrl = this.getPortUrl()
    const [webMapDataSourceCount, webSceneDataSourceCount, allDataSourceCount] = this.getMapDataSourceCount()

    let sceneQualityModeContent = null
    if (webSceneDataSourceCount > 0) {
      const sceneQualityModeLabel = this.props.intl.formatMessage({ id: 'sceneQualityMode', defaultMessage: defaultMessages.sceneQualityMode })
      const automaticLabel = this.props.intl.formatMessage({ id: 'mapZoomToAction_Automatic', defaultMessage: defaultMessages.mapZoomToAction_Automatic })
      sceneQualityModeContent = (
        <SettingRow flow='wrap' label={sceneQualityModeLabel}>
          <Select
            size='sm' value={(this.props.config && this.props.config.sceneQualityMode) || SceneQualityMode.auto}
            onChange={evt => { this.onSceneQualityModeChanged(evt.target.value, 'sceneQualityMode') }}
          >
            <option key='auto' value='auto'>{automaticLabel}</option>
            <option key='low' value='low'><FormattedMessage id='low' defaultMessage='Low' /></option>
            <option key='medium' value='medium'><FormattedMessage id='medium' defaultMessage='Medium' /></option>
            <option key='high' value='high'><FormattedMessage id='high' defaultMessage='High' /></option>
          </Select>
        </SettingRow>
      )
    }

    const alertText = this.props.intl.formatMessage({ id: 'selectThirdMapHint', defaultMessage: defaultMessages.selectThirdMapHint })
    const showPopupUponSelectionTooltip = this.props.intl.formatMessage({ id: 'showPopupUponSelectionTooltip', defaultMessage: defaultMessages.showPopupUponSelectionTooltip })

    let sidePopperTrigger: HTMLElement = null

    if (this.alertRef && this.alertRef.current) {
      sidePopperTrigger = this.alertRef.current as HTMLElement
    }

    const enablePopUp = !!(this.props.config && !this.props.config.disablePopUp)
    const showPopupUponSelection = enablePopUp && !!(this.props.config && this.props.config.showPopupUponSelection)
    const popupDockPosition: PopupDockPosition = enablePopUp ? getValidPopupDockPosition(this.props.config) : null
    const dockPopup = !!popupDockPosition
    const useAutoDockPopupPosition = popupDockPosition === 'auto'
    const useCustomDockPopupPosition = popupDockPosition && popupDockPosition !== 'auto'

    const dsClientQueryInfos = this.getDsClientQueryInfos()

    const moreInformation = this.props.intl.formatMessage({ id: 'moreInformation', defaultMessage: defaultMessages.moreInformation })
    let clientQueryHelpTip: any = ''

    clientQueryHelpTip = this.props.intl.formatMessage({
      id: 'clientQueryHelpTip',
      defaultMessage: defaultMessages.clientQueryHelpTip
    }, {
      link: <a href={this.state.clientQueryHelpHref} target="_blank" rel="noopener noreferrer">{moreInformation}</a>
    })

    const clientQueryHelpTipCss = css`
      width: 360px;
      font-size: 12px;
    `

    const toolTipTitleOfClientQueryHelpTip = (<div className='p-2' css={clientQueryHelpTipCss}>
      <div>{clientQueryHelpTip}</div>
    </div>)

    const clientQueryDisabledTip = this.props.intl.formatMessage({ id: 'clientQueryDisabledTip', defaultMessage: defaultMessages.clientQueryDisabledTip })
    const defaultLabel = this.props.intl.formatMessage({ id: 'default', defaultMessage: jimuUIDefaultMessages.default })
    const customLabel = this.props.intl.formatMessage({ id: 'custom', defaultMessage: jimuUIDefaultMessages.custom })

    const firstDataSourceId = this.props.useDataSources?.[0]?.dataSourceId
    const firstDataSourceJson = firstDataSourceId ? this.props.dsJsons[firstDataSourceId] : null
    const firstDataSourcePortalUrl = firstDataSourceJson?.portalUrl || null
    const firstDataSourceMapItemId = firstDataSourceJson?.itemId || null
    const firstDataSourceLabel = firstDataSourceJson?.label || firstDataSourceJson?.sourceLabel || ''

    const secondDataSourceId = this.props.useDataSources?.[1]?.dataSourceId
    const secondDataSourceJson = secondDataSourceId ? this.props.dsJsons[secondDataSourceId] : null
    const secondDataSourceMapPortalUrl = secondDataSourceJson?.portalUrl || null
    const secondDataSourceMapItemId = secondDataSourceJson?.itemId || null
    const secondDataSourceLabel = secondDataSourceJson?.label || secondDataSourceJson?.sourceLabel || ''

    const isCustomLodRadioEnabled = webMapDataSourceCount <= 1 && webSceneDataSourceCount === 0 // custom LOD is only available for single webmap or default web map
    const isScaleSliderRadioEnabled = webMapDataSourceCount > 0 || allDataSourceCount === 0 // scale range switch is enabled if map has any webmap data source or only use default web map
    const isScaleRangeSwitchEnabled = isCustomLodRadioEnabled || isScaleSliderRadioEnabled

    const isCustomLodRadioChecked = !!customLODs
    const isScaleSliderRadioChecked = !!scaleRange
    const isScaleRangeSwitchChecked = isScaleRangeSwitchEnabled && (isCustomLodRadioChecked || isScaleSliderRadioChecked)

    let showScaleRangeWarning = false

    if (scaleRange && this.state.webMapInfos?.length > 0) {
      const scaleRangeMinScale = (typeof scaleRange.minScale === 'number' && scaleRange.minScale > 0) ? scaleRange.minScale : Infinity
      const scaleRangeMaxScale = (typeof scaleRange.maxScale === 'number' && scaleRange.maxScale > 0) ? scaleRange.maxScale : 0
      showScaleRangeWarning = this.state.webMapInfos.every(webMapInfo => {
        const lodScaleRange = webMapInfo.lodScaleRange
        const lodMinScale = lodScaleRange.minScale
        const lodMaxScale = lodScaleRange.maxScale

        if (typeof lodMinScale === 'number' && typeof lodMaxScale === 'number') {
          if (lodMinScale < scaleRangeMaxScale || lodMaxScale > scaleRangeMinScale) {
            return true
          }
        }

        return false
      })
    }

    const isModifyCustomLodBtnEnabled = !!this.activeJimuMapView
    const originalScaleRangeTip = this.props.intl.formatMessage({ id: 'originalScaleRangeTip', defaultMessage: defaultMessages.originalScaleRangeTip })

    return (
      <div css={this.getStyle()}>
      <div className='widget-setting-map'>
        <Alert
          closable
          className='select-third-map-alert'
          form='basic'
          onClose={this.onSelectThirdMapAlertClose}
          open={this.state.showSelectThirdMapAlert}
          text={alertText}
          type='warning'
          withIcon
          ref={this.alertRef}
        />

        <JimuMapViewComponent
          useMapWidgetId={mapWidgetId}
          onViewsChange={this.onJimuMapViewsChange}
          onActiveViewChange={this.onActiveJimuViewChange}
        />

        {/* Source */}
        <SettingSection className='section-title' title={this.props.intl.formatMessage({ id: 'sourceLabel', defaultMessage: defaultMessages.sourceLabel })}>
          <SettingRow flow='wrap'>
            <div className='source-description text-break'>{this.props.intl.formatMessage({ id: 'sourceDescript', defaultMessage: defaultMessages.sourceDescript })}</div>
          </SettingRow>

          <SettingRow>
            <DataSourceSelector
              isMultiple types={this.supportedDsTypes}
              buttonLabel={this.props.intl.formatMessage({ id: 'selectMap', defaultMessage: defaultMessages.selectMap })}
              onNewDataAdded={this.onNewDataAdded}
              onChange={this.onDataSourceChange} useDataSources={this.props.useDataSources}
              disableSelection={this.onDisableSelection} mustUseDataSource widgetId={this.props.id}
              onClickDisabledDsItem={this.onClickDisabledDsItem} sidePopperTrigger={sidePopperTrigger}
            />
          </SettingRow>

          {
            portalUrl && this.props.dsJsons && this.props.useDataSources && this.props.useDataSources.length === 1 &&
            <SettingRow>
              <div className='w-100'>
                <div
                  className='webmap-thumbnail selected-item'
                  title={firstDataSourceLabel}
                  onClick={() => { this.setInitialMap(this.props.useDataSources[0].dataSourceId) }}
                >
                  <MapThumb
                    usedInSetting={true}
                    portUrl={firstDataSourcePortalUrl}
                    mapItemId={firstDataSourceMapItemId}
                    label={firstDataSourceLabel}
                    theme={this.props.theme}
                  />
                </div>
              </div>
            </SettingRow>
          }

          {
            portalUrl && this.props.dsJsons && this.props.useDataSources && this.props.useDataSources.length === 2 &&
              <SettingRow>
                <div className='w-100 d-flex justify-content-between'>
                  <div
                    onClick={() => { this.setInitialMap(this.props.useDataSources[0].dataSourceId) }}
                    title={firstDataSourceLabel}
                    className={classNames('webmap-thumbnail-multi', { 'selected-item': this.props.config.initialMapDataSourceID === this.props.useDataSources[0].dataSourceId })}
                    tabIndex={0} role='button' onKeyDown={e => { this.handleMapThumbKeyDown(e, 0) }}
                  >
                    <MapThumb
                      usedInSetting={true}
                      portUrl={firstDataSourcePortalUrl}
                      mapItemId={firstDataSourceMapItemId}
                      label={firstDataSourceLabel}
                      theme={this.props.theme}
                    />
                  </div>
                  <div
                    onClick={() => { this.setInitialMap(this.props.useDataSources[1].dataSourceId) }}
                    title={secondDataSourceLabel}
                    className={classNames('webmap-thumbnail-multi', { 'selected-item': this.props.config.initialMapDataSourceID === this.props.useDataSources[1].dataSourceId })}
                    tabIndex={0} role='button' onKeyDown={e => { this.handleMapThumbKeyDown(e, 1) }}
                  >
                    <MapThumb
                      usedInSetting={true}
                      portUrl={secondDataSourceMapPortalUrl}
                      mapItemId={secondDataSourceMapItemId}
                      label={secondDataSourceLabel}
                      theme={this.props.theme}
                    />
                  </div>
                </div>
              </SettingRow>
          }
        </SettingSection>

        {/* Initial view */}
        <SettingSection>
          <CollapsablePanel
            label={this.props.intl.formatMessage({ id: 'initialMapView', defaultMessage: defaultMessages.initialMapView })}
            aria-label={this.props.intl.formatMessage({ id: 'initialMapView', defaultMessage: defaultMessages.initialMapView })}
            level={1}
            type='default'
            wrapperClassName='mt-4'
          >
            <SettingRow>
              <div className='d-flex justify-content-between w-100 align-items-center'>
                <Label title={this.props.intl.formatMessage({ id: 'defaultViewTip', defaultMessage: defaultMessages.defaultViewTip })}>
                  <Radio
                    className='mr-2'
                    style={{ cursor: 'pointer' }}
                    onChange={() => { this.handleIsUseCustomMapState(false) }}
                    checked={!this.props.config.isUseCustomMapState}
                  />
                  {this.props.intl.formatMessage({ id: 'defaultView', defaultMessage: defaultMessages.defaultView })}
                </Label>
              </div>
            </SettingRow>

            <SettingRow>
              <div className='d-flex justify-content-between w-100 align-items-center'>
                <Label title={this.props.intl.formatMessage({ id: 'customViewTip', defaultMessage: defaultMessages.customViewTip })}>
                  <Radio
                    className='mr-2'
                    style={{ cursor: 'pointer' }}
                    onChange={() => { this.handleIsUseCustomMapState(true) }}
                    checked={this.props.config.isUseCustomMapState}
                  />
                  {this.props.intl.formatMessage({ id: 'customView', defaultMessage: defaultMessages.customView })}
                </Label>
              </div>
            </SettingRow>

            {
              this.props.config.isUseCustomMapState &&
              <SettingRow>
                <div className='ml-5'>
                  <MapStatesEditor
                    title={this.props.intl.formatMessage({ id: 'setMapView', defaultMessage: defaultMessages.setMapView })}
                    buttonLabel={this.props.intl.formatMessage({ id: 'customViewSet', defaultMessage: defaultMessages.customViewSet })}
                    useDataSources={this.props.useDataSources}
                    jimuMapConfig={this.props.config as IMJimuMapConfig} id={this.props.id}
                    onConfigChanged={this.handleMapInitStateChanged} isUseWidgetSize
                  />
                </div>
              </SettingRow>
            }
          </CollapsablePanel>
        </SettingSection>

        {/* Scale range */}
        <SettingSection
          className='scale-range-setting-section'
        >
          <CollapsablePanel
            className='scale-range-collapsable-panel'
            label={this.props.intl.formatMessage({ id: 'scaleRange', defaultMessage: defaultMessages.scaleRange })}
            aria-label={this.props.intl.formatMessage({ id: 'scaleRange', defaultMessage: defaultMessages.scaleRange })}
            level={1}
            type='default'
            wrapperClassName='mt-4'
          >
            <SettingRow
              tag='label'
              label={this.props.intl.formatMessage({ id: 'scaleRangeTip', defaultMessage: defaultMessages.scaleRangeTip })}
            >
              <Switch
                disabled={!isScaleRangeSwitchEnabled}
                checked={isScaleRangeSwitchChecked}
                onChange={this.onScaleRangeSwitchChange}
              />
            </SettingRow>

            {
              isScaleRangeSwitchChecked &&
              <React.Fragment>
                <SettingRow>
                  <Label className='w-100' style={{justifyContent: 'flex-start'}} title={this.props.intl.formatMessage({ id: 'customizeScaleList', defaultMessage: defaultMessages.customizeScaleList })}>
                    <Radio
                      className='mr-2'
                      style={{ cursor: 'pointer' }}
                      disabled={!isCustomLodRadioEnabled}
                      checked={isCustomLodRadioChecked}
                      onChange={this.onCustomLodRadioChecked}
                    />
                    {this.props.intl.formatMessage({ id: 'customizeScaleList', defaultMessage: defaultMessages.customizeScaleList })}
                  </Label>

                  <Tooltip title={this.props.intl.formatMessage({ id: 'lodSingleMapTip', defaultMessage: defaultMessages.lodSingleMapTip })} showArrow placement='left'>
                    <span className='ml-2'>
                      <InfoOutlined />
                    </span>
                  </Tooltip>
                </SettingRow>

                {
                  isScaleRangeSwitchChecked && isCustomLodRadioChecked &&
                  <Button
                    className='modify-custom-lod-btn mt-4 mb-4 ml-6'
                    size='sm'
                    disabled={!isModifyCustomLodBtnEnabled}
                    onClick={this.onModifyCustomLodBtnClick}
                  >
                    {this.props.intl.formatMessage({ id: 'customViewSet', defaultMessage: defaultMessages.customViewSet })}
                  </Button>
                }

                <SettingRow>
                  <Label title={this.props.intl.formatMessage({ id: 'adjustScaleRange', defaultMessage: defaultMessages.adjustScaleRange })}>
                    <Radio
                      className='mr-2'
                      style={{ cursor: 'pointer' }}
                      disabled={!isScaleSliderRadioEnabled}
                      checked={isScaleSliderRadioChecked}
                      onChange={this.onScaleSliderRadioChecked}
                    />
                    {this.props.intl.formatMessage({ id: 'adjustScaleRange', defaultMessage: defaultMessages.adjustScaleRange })}
                  </Label>
                </SettingRow>
              </React.Fragment>
            }

            {
              this.activeJimuMapView && customLODs && this.state.showCustomLodModal &&
              <CustomLodsModal
                jimuMapView={this.activeJimuMapView}
                lods={customLODs?.lods}
                onModalOk={this.onCustomLodModalOk}
                onModalCancel={this.onCustomLodModalCancel}
              />
            }

            {
              isScaleRangeSwitchChecked && isScaleSliderRadioChecked &&
              <React.Fragment>
                <SettingRow className='exb-scale-range-slider-setting-row'>
                  <div className='exb-scale-range-slider-container' ref={this.onScaleRangeSliderContainerChange}></div>
                </SettingRow>

                <SettingRow className='original-scale-range-tip-setting-row' tag='label' label={originalScaleRangeTip}>
                </SettingRow>

                {
                  this.scaleRangeSlider && this.state.webMapInfos?.length > 0 &&
                  <React.Fragment>
                    {
                      this.state.webMapInfos?.map(webMapInfo => {
                        return (
                          <SettingRow key={webMapInfo.jimuMapViewId} className='lod-range-indicator-setting-row'>
                            <LodRangeIndicator
                              mapName={webMapInfo.mapName}
                              scaleRangeSlider={this.scaleRangeSlider}
                              scaleRangleLimit={this.state.scaleRangleLimit}
                              lodScaleRange={webMapInfo.lodScaleRange}
                            />
                          </SettingRow>
                        )
                      })
                    }
                  </React.Fragment>
                }
              </React.Fragment>
            }

          {
            showScaleRangeWarning &&
            <SettingRow className='p-0 scale-range-alert-setting-row'>
              <Alert
                className='w-100'
                closable={false}
                form='basic'
                text={this.props.intl.formatMessage({ id: 'wrongScaleRangeWarning', defaultMessage: defaultMessages.wrongScaleRangeWarning })}
                type='warning'
                withIcon
              />
            </SettingRow>
          }
          </CollapsablePanel>
        </SettingSection>

        {/* Tools */}
        <SettingSection>
          <CollapsablePanel
            label={this.props.intl.formatMessage({ id: 'toolLabel', defaultMessage: defaultMessages.toolLabel })}
            aria-label={this.props.intl.formatMessage({ id: 'toolLabel', defaultMessage: defaultMessages.toolLabel })}
            level={1}
            type='default'
            wrapperClassName='mt-4'
          >
            <div className='w-100' ref={this.onMapToolsContainerRef} onClick={this.onMapToolsContainerClick}>
              {Object.keys(ToolModules).map((key, index) => {
                const toolModuleInfo = ToolModules[key]
                if (toolModuleInfo.isNeedSetting) {
                  const labelKey = key + 'Label'
                  const className = 'map-tool-option-setting-row ' + (index === 0 ? 'mt-0' : 'mt-2')
                  const canToolName = `can${key}`
                  const isSwitchChecked = (this.props.config.toolConfig && this.props.config.toolConfig[canToolName]) || false

                  return (
                    <SettingRow
                      key={key}
                      className={className}
                      tag='label'
                      label={this.props.intl.formatMessage({ id: labelKey, defaultMessage: jimuUIDefaultMessages[labelKey] })}
                    >
                      {
                        toolModuleInfo.hasSettingOptions && isSwitchChecked &&
                        <Button
                          aria-haspopup='dialog'
                          className='map-tool-sidepopper-setting-btn p-0 border-0 mr-2'
                          type='tertiary'
                          icon={true}
                          size='sm'
                          onClick={() => { this.onMapToolSettingBtnClick(key, canToolName, isSwitchChecked) }}
                        >
                          <SettingOutlined
                            size={16}
                          />
                        </Button>
                      }
                      <Switch
                        className='can-x-switch'
                        checked={isSwitchChecked}
                        onChange={evt => { this.onMapToolSwitchChanged(key, canToolName, evt.target.checked) }}
                      />
                    </SettingRow>
                  )
                } else {
                  return null
                }
              })}
            </div>
          </CollapsablePanel>
          { this.renderMapToolSidePopper() }
        </SettingSection>

        {/* Tools layout */}
        <SettingSection>
          <CollapsablePanel
            label={this.props.intl.formatMessage({ id: 'mapLayout', defaultMessage: defaultMessages.mapLayout })}
            aria-label={this.props.intl.formatMessage({ id: 'mapLayout', defaultMessage: defaultMessages.mapLayout })}
            level={1}
            type='default'
            wrapperClassName='mt-4'
          >
            <SettingRow>
              <div className='source-description' id='largeAndMediumLayout'>
                {this.props.intl.formatMessage({ id: 'mapLayout_LargeAndMedium', defaultMessage: defaultMessages.mapLayout_LargeAndMedium })}
              </div>
            </SettingRow>
            <SettingRow>
              <div className='w-100 d-flex justify-content-between'>
                <div
                  onClick={() => { this.changeToolLayout(0) }} className={classNames('webmap-thumbnail-multi border d-flex justify-content-center align-items-center', {
                    'selected-item': !this.props.config.layoutIndex
                  })}
                  aria-labelledby='largeAndMediumLayout'
                  tabIndex={0} role='button' onKeyDown={e => { this.handleLayoutThumbKeyDown(e, 0) }}
                >
                  <Image src={require('./assets/pc-layout-0.svg')} />
                </div>
                <div
                  onClick={() => { this.changeToolLayout(1) }} className={classNames('webmap-thumbnail-multi border d-flex justify-content-center align-items-center', {
                    'selected-item': this.props.config.layoutIndex === 1
                  })}
                  aria-labelledby='largeAndMediumLayout'
                  tabIndex={0} role='button' onKeyDown={e => { this.handleLayoutThumbKeyDown(e, 1) }}
                >
                  <Image src={require('./assets/pc-layout-1.svg')} />
                </div>
              </div>
            </SettingRow>
          </CollapsablePanel>
        </SettingSection>

        {/* Options */}
        <SettingSection>
          <CollapsablePanel
            label={this.props.intl.formatMessage({ id: 'options', defaultMessage: jimuUIDefaultMessages.options })}
            aria-label={this.props.intl.formatMessage({ id: 'options', defaultMessage: jimuUIDefaultMessages.options })}
            level={1}
            type='default'
            wrapperClassName='mt-4'
          >
            <SettingRow>
              <div className='w-100 webmap-tools'>
                <div className='webmap-tools-item'>
                  <label>
                    <FormattedMessage id='featureSelectionColor' defaultMessage={defaultMessages.featureSelectionColor} />
                  </label>
                </div>
                <div className='d-flex justify-content-between' style={{ marginBottom: '8px', color: this.props.theme.ref.palette.neutral[900] }}>
                  <label id='highlightFill'>
                    <FormattedMessage id='featureHighlightFill' defaultMessage={defaultMessages.featureHighlightFill} />
                  </label>
                  <div>
                    <ColorPicker
                      style={{ padding: '4' }} width={30} height={26}
                      color={this.props.config.selectionHighlightColor ? this.props.config.selectionHighlightColor : '#00FFFF'}
                      onChange={this.updateSelectionHighlightColor} presetColors={this.presetColors}
                      aria-label={this.props.intl.formatMessage({ id: 'featureHighlightFill', defaultMessage: defaultMessages.featureHighlightFill })}
                    />
                  </div>
                </div>
                <div className='d-flex justify-content-between' style={{ color: this.props.theme.ref.palette.neutral[900] }}>
                  <label>
                    <FormattedMessage id='featureHighlightOutline' defaultMessage={defaultMessages.featureHighlightOutline} />
                  </label>
                  <div>
                    <ColorPicker
                      style={{ padding: '4' }} width={30} height={26}
                      color={this.props.config.selectionHighlightHaloColor ? this.props.config.selectionHighlightHaloColor : '#00FFFF'}
                      onChange={this.updateSelectionHighlightHaloColor} presetColors={this.presetColors}
                      aria-label={this.props.intl.formatMessage({ id: 'featureHighlightOutline', defaultMessage: defaultMessages.featureHighlightOutline })}
                    />
                  </div>
                </div>
              </div>
            </SettingRow>

            <SettingRow
              tag='label'
              label={this.props.intl.formatMessage({ id: 'enableScrollZoom', defaultMessage: defaultMessages.enableScrollZoom })}
            >
              <Switch
                /* eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare*/
                className='can-x-switch' checked={(this.props.config && this.props.config.disableScroll !== true)}
                data-key='disableScroll' onChange={evt => { this.onMapOptionsChanged(!evt.target.checked, 'disableScroll') }}
              />
            </SettingRow>

            <SettingRow
              tag='label'
              label={this.props.intl.formatMessage({ id: 'enablePopUp', defaultMessage: defaultMessages.enablePopUp })}
            >
              <Switch
                className='can-x-switch' checked={enablePopUp}
                data-key='disablePopUp' onChange={this.onEnablePopupSwitchChange}
              />
            </SettingRow>

            {
              enablePopUp && (
                <SettingRow>
                  <Label>
                    <Checkbox
                      checked={showPopupUponSelection}
                      className='mr-1'
                      onChange={this.onShowPopupUponSelectionCheckboxChange}
                    />
                    <FormattedMessage id='showPopupUponSelection' defaultMessage={defaultMessages.showPopupUponSelection} />
                  </Label>
                  <Tooltip title={showPopupUponSelectionTooltip} showArrow placement='left'>
                    <span>
                      <InfoOutlined />
                    </span>
                  </Tooltip>
                </SettingRow>
              )
            }

            {
              enablePopUp && (
                <React.Fragment>
                  <SettingRow>
                    <Label>
                      <Checkbox
                        checked={dockPopup}
                        className='mr-1'
                        onChange={this.onDockPopupCheckboxChange}
                      />
                      <FormattedMessage id='dockPopup' defaultMessage={defaultMessages.dockPopup} />
                    </Label>
                  </SettingRow>

                  {
                    dockPopup && (
                      <React.Fragment>
                        <SettingRow>
                          <div className='dock-popup-section d-flex w-100 align-items-center'>
                            <label className='dock-popup-label w-100'>
                              <FormattedMessage id='position' defaultMessage={jimuUIDefaultMessages.position} />
                            </label>
                          </div>
                        </SettingRow>

                        <SettingRow>
                          <Label title={defaultLabel}>
                            <Radio
                              className='mr-2'
                              style={{ cursor: 'pointer' }}
                              checked={useAutoDockPopupPosition}
                              onChange={this.onAutoDockPopupPositionRadioChange}
                            />
                            {defaultLabel}
                          </Label>
                        </SettingRow>

                        <SettingRow>
                          <Label title={customLabel} className={classNames('dock-popup-custom-position-label', { 'use-custom-dock-popup-position': useCustomDockPopupPosition, 'pr-1': useCustomDockPopupPosition })} style={{ }}>
                            <Radio
                              className='mr-2'
                              style={{ cursor: 'pointer' }}
                              checked={useCustomDockPopupPosition}
                              onChange={this.onCustomDockPopupPositionRadioChange}
                            />
                            {customLabel}
                          </Label>

                          {
                            useCustomDockPopupPosition &&
                            <PopupPositionSetting
                              /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
                              value={popupDockPosition as CustomPopupDockPosition}
                              onChange={this.onPopupDockPositionChange}
                            />
                          }
                        </SettingRow>

                      </React.Fragment>
                    )
                  }
                </React.Fragment>
              )
            }

            {sceneQualityModeContent}

            {
              dsClientQueryInfos.length > 0 &&
              <React.Fragment>
                <SettingRow
                  bottomLine={true}
                >
                </SettingRow>

                <SettingRow
                  level={2}
                  label={this.props.intl.formatMessage({ id: 'enableClientSideQuery', defaultMessage: defaultMessages.enableClientSideQuery })}
                  flow='no-wrap'
                  className='enable-client-query-header'
                >
                  <Tooltip title={toolTipTitleOfClientQueryHelpTip} showArrow placement='left' interactive={true} leaveDelay={1000}>
                    <span>
                      <InfoOutlined />
                    </span>
                  </Tooltip>
                </SettingRow>

                {
                  dsClientQueryInfos.map(clientQueryInfo => {
                    const {
                      dataSourceId,
                      dsLabel,
                      clientQueryEnabled,
                      switchEnabled
                    } = clientQueryInfo

                    const isSwitchDisabled = !switchEnabled
                    const settingRowLabel = (
                      <div className='d-flex align-items-center' title={dsLabel}>
                        <WidgetMapOutlined className='mr-2' style={{ flexBasis: '16px', flexShrink: 0 }} />
                        {dsLabel}
                      </div>
                    )

                    return (
                      <SettingRow
                        key={dataSourceId}
                        level={3}
                        tag='label'
                        label={settingRowLabel}
                        aria-label={dsLabel}
                        flow='no-wrap'
                        className='w-100'
                      >
                        {
                          isSwitchDisabled &&
                          <Tooltip title={clientQueryDisabledTip} showArrow placement='left'>
                            <span className='mr-2'>
                              <InfoOutlined />
                            </span>
                          </Tooltip>
                        }

                        <Switch
                          className='can-x-switch'
                          disabled={isSwitchDisabled}
                          checked={clientQueryEnabled}
                          onChange={evt => { this.onClientQueryChanged(dataSourceId, evt.target.checked) }}
                        />
                      </SettingRow>
                    )
                  })
                }
              </React.Fragment>
            }
          </CollapsablePanel>
        </SettingSection>

      </div>
      </div>
    )
  }

  renderMapToolSidePopper() {
    const { sidePopperMapTool } = this.state
    const isMapToolSidePopperOpen = !!sidePopperMapTool
    let sidePopperTitle = ''

    if (sidePopperMapTool) {
      const labelKey = sidePopperMapTool + 'Label'
      sidePopperTitle = this.props.intl.formatMessage({ id: labelKey, defaultMessage: jimuUIDefaultMessages[labelKey] }) || ''
    }

    const scalebarOptions = this.props.config?.toolOptions?.ScaleBar
    let mapToolSidePopperTriggers: HTMLElement[] = null

    if (isMapToolSidePopperOpen && this.mapToolsContainer) {
      const rows = Array.from(this.mapToolsContainer.querySelectorAll('.map-tool-option-setting-row')).filter(row => row?.querySelector('.map-tool-sidepopper-setting-btn')) as HTMLElement[]

      if (rows.length > 0) {
        mapToolSidePopperTriggers = rows
      }
    }

    return (
      <SidePopper
        isOpen={isMapToolSidePopperOpen}
        toggle={this.onMapToolSidePopperToggle}
        position='right'
        trigger={mapToolSidePopperTriggers}
        title={sidePopperTitle}
      >
        {
          isMapToolSidePopperOpen &&
          <React.Fragment>
            {
              sidePopperMapTool === 'ScaleBar' &&
              <ScalebarSetting scalebarOptions={scalebarOptions} onChange={this.onScalebarSettingChange} />
            }
          </React.Fragment>
        }
      </SidePopper>
    )
  }

  onScalebarSettingChange = (scalebarOptions: IMScalebarOptions): void => {
    const newConfig = this.props.config.setIn(['toolOptions', 'ScaleBar'], scalebarOptions)
    this.updateConfig(newConfig)
  }
}
