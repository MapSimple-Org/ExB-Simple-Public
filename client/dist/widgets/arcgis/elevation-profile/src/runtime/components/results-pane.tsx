/** @jsx jsx */
import { React, jsx, type IntlShape, type IMThemeVariables, classNames, Immutable, getAppStore, lodash, type DataSource, DataSourceManager, type FeatureLayerDataSource } from 'jimu-core'
import {
  Button, Icon, Popper, Select, Option, MultiSelect, Alert, Label, Checkbox, LoadingType, Loading,
  defaultMessages as jimuUIDefaultMessages,
  Tooltip,
  Switch,
  NumericInput,
  MobilePanel,
  FloatingPanel
} from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import { type AssetBufferIntersection, ButtonTriggerType, type LayerIntersectionInfo, type AssetLayersSettings, type ProfileLayersSettings, type ElevationLayersInfo, type ProfileStyle } from '../../config'
import defaultMessages from '../translations/default'
import { getContainerStyle, geSettingsOptionsStyle, getChartStyle, getExportOptionsStyle } from '../lib/style'
import { getRuntimeIcon, unitOptions } from '../constants'
import { getAllLayersFromDataSource, defaultSelectedUnits, getMaxBufferLimit, validateMaxBufferDistance, getPortalSelfElevationUnits } from '../../common/utils'
import ProfileChart from './profile-chart'
import ProfileStatistics from './chart-statistics'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import exportIcon from 'jimu-icons/svg/outlined/editor/export.svg'
import type { JimuPolygonSymbol } from 'jimu-ui/advanced/map'
import { convertSingle } from '../../common/unit-conversion'
import { focusElementInKeyboardMode } from 'jimu-core'

const { epIcon } = getRuntimeIcon()
const portalSelf = getAppStore().getState().portalSelf

interface Props {
  theme: IMThemeVariables
  intl: IntlShape
  widgetId: string
  isMobile: boolean
  displayLoadingIndicator: boolean
  activeDataSource: string
  commonDsGeneralSettings: any
  defaultConfig: any
  activeDatasourceConfig: any
  profileResult: any
  visibleGroundProfileStats: any
  selectMode: boolean
  drawMode: boolean
  onDrawingComplete: boolean
  isNewSegmentsForSelection: boolean
  noGraphicAfterFirstSelection: boolean
  chartRender: boolean
  noFeaturesFoundError: boolean
  drawingLayer: GraphicsLayer
  intersectionHighlightLayer: GraphicsLayer
  jimuMapView: JimuMapView
  viewModelErrorState: boolean
  profileErrorMsg: string
  onNavBack: () => void
  doneClick: () => boolean
  activateDrawSelectToolForNewProfile: () => void
  selectableLayersRuntime: (layersArray: string[]) => void
  intersectingLayersRuntime: (layersArray: string[]) => void
  chartPosition: (point: any) => void
  hideChartPosition: () => void
  buildOutputStatistics: (selectedElevationUnit: string, selectedLinearUnit: string, isFlip: boolean) => void
  intersectingBufferRuntime: (bufferValues: AssetBufferIntersection) => void
  cancelButtonClicked: () => void
  intersectionResult: LayerIntersectionInfo[]
  chartDataUpdateTime: number
  currentPageId: string
  addedElelvationProfileLayers: ElevationLayersInfo[]
  groundLayerId: string
  newAddedLayer: string[]
  profileSettingsForNewAddedLayer: ProfileLayersSettings[]
}

interface IState {
  initialEmptyState: boolean
  emptyStateIfDoneClick: boolean
  enableForNewProfile: boolean
  settingsOptionsOpen: boolean
  unitOptions: any
  isFlipChart: boolean
  selectedElevationUnit: string
  selectedLinearUnit: string
  selectedLayers: string[]
  selectedIntersectedLayers: string[]
  profileLayers: ProfileLayersSettings[]
  intersectingLayers: AssetLayersSettings[]
  isAnyProfileLineLayers: boolean
  isAnyIntersectingLayers: boolean
  isProfileSettingsOptionEnabled: boolean
  isCustomizeOptionEnabled: boolean
  isAssetSettingsOptionEnabled: boolean
  noFeaturesError: boolean
  dismissInfoMsg: boolean
  dismissWarningMsg: boolean
  statisticsOpen: boolean
  legendStats: any
  showLegend: boolean
  displayStats: boolean
  renderSeries: boolean
  toggledSeriesId: string
  isUniformScalingEnable: boolean
  isLayerSelected: boolean
  isBufferSelectorEnableInConfig: boolean
  isBufferSelectorEnableAtRuntime: boolean
  selectedBufferDistance: number
  selectedBufferUnit: string
  selectedBufferSymbol: JimuPolygonSymbol
  noValidInput: boolean
  viewModelErrorMsg: string
  isExport: boolean
  isCustomizeInterval: boolean
  allowExport: boolean
  exportData: boolean
  showViewLineGraph: boolean
  volumetricObjStyle: ProfileStyle
  volumetricObjLabel: string
  distanceInterval: number
  showInValidIntervalErrorMsg: boolean
  getIntervalsError: string
  addedElevationLayers: ElevationLayersInfo[]
  newAddedLayers: string[]
  profileSettingsForNewlyAddedLayers: ProfileLayersSettings[]
}

export default class ResultPane extends React.PureComponent<Props, IState> {
  private _selectableLayers = []
  private _intersectingLayers = []
  private _chart: any
  private readonly _alertElement = React.createRef<HTMLDivElement>()
  constructor (props) {
    super(props)
    const selectedUnit = defaultSelectedUnits(this.props.activeDatasourceConfig, portalSelf)
    this._chart = null

    let configuredBufferDistanceUnit: string = this.props.activeDatasourceConfig?.assetSettings?.assetIntersectingBuffer?.bufferUnits
    if (configuredBufferDistanceUnit === '') {
      configuredBufferDistanceUnit = getPortalSelfElevationUnits(portalSelf)
    }

    const volumetricStats = this.props.activeDatasourceConfig
      ? (this.props.activeDatasourceConfig.elevationLayersSettings?.showVolumetricObjLineInGraph && this.props.activeDatasourceConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.displayStatistics)
      : (this.props.defaultConfig.elevationLayersSettings?.showVolumetricObjLineInGraph && this.props.defaultConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.displayStatistics)

    const isDisplayStats = this.props.addedElelvationProfileLayers?.filter((layerInfo) => layerInfo.displayStatistics)?.[0]?.displayStatistics || volumetricStats
    this.state = {
      initialEmptyState: true,
      emptyStateIfDoneClick: false,
      enableForNewProfile: false,
      settingsOptionsOpen: false,
      unitOptions: unitOptions,
      isFlipChart: false,
      selectedElevationUnit: this.props.activeDatasourceConfig ? selectedUnit[0] : this.props.defaultConfig.elevationLayersSettings?.elevationUnit,
      selectedLinearUnit: this.props.activeDatasourceConfig ? selectedUnit[1] : this.props.defaultConfig.elevationLayersSettings?.linearUnit,
      selectedLayers: [],
      selectedIntersectedLayers: [],
      profileLayers: this.props.activeDatasourceConfig?.profileSettings.layers,
      intersectingLayers: this.props.activeDatasourceConfig?.assetSettings?.layers?.length > 0 ? this.props.activeDatasourceConfig?.assetSettings?.layers : [],
      isAnyProfileLineLayers: false,
      isAnyIntersectingLayers: false,
      isProfileSettingsOptionEnabled: this.props.activeDatasourceConfig?.profileSettings.isProfileSettingsEnabled,
      isCustomizeOptionEnabled: this.props.activeDatasourceConfig?.profileSettings.isCustomizeOptionEnabled,
      isAssetSettingsOptionEnabled: this.props.activeDatasourceConfig?.assetSettings?.isAssetSettingsEnabled,
      noFeaturesError: this.props.noFeaturesFoundError,
      dismissInfoMsg: (this.props.selectMode && this.props.isNewSegmentsForSelection) || (this.props.drawMode && !this.props.onDrawingComplete),
      dismissWarningMsg: !this.props.isNewSegmentsForSelection && !this.props.noGraphicAfterFirstSelection && this.props.selectMode,
      statisticsOpen: false,
      legendStats: [],
      showLegend: this.props.commonDsGeneralSettings?.showLegend,
      displayStats: isDisplayStats,
      renderSeries: true,
      toggledSeriesId: '',
      isUniformScalingEnable: false,
      isLayerSelected: true,
      isBufferSelectorEnableInConfig: this.props.activeDatasourceConfig?.assetSettings?.assetIntersectingBuffer?.enabled,
      isBufferSelectorEnableAtRuntime: this.props.activeDatasourceConfig?.assetSettings?.assetIntersectingBuffer?.enabled,
      selectedBufferDistance: this.props.activeDatasourceConfig?.assetSettings?.assetIntersectingBuffer?.bufferDistance || 10,
      selectedBufferUnit: configuredBufferDistanceUnit || getPortalSelfElevationUnits(portalSelf),
      selectedBufferSymbol: this.props.activeDatasourceConfig?.assetSettings?.assetIntersectingBuffer?.bufferSymbol,
      noValidInput: this.props.viewModelErrorState,
      viewModelErrorMsg: this.props.profileErrorMsg,
      isExport: false,
      isCustomizeInterval: false,
      allowExport: this.props.commonDsGeneralSettings?.allowExport,
      exportData: false,
      showViewLineGraph: this.props.activeDatasourceConfig ? this.props.activeDatasourceConfig.elevationLayersSettings?.showVolumetricObjLineInGraph : this.props.defaultConfig.elevationLayersSettings?.showVolumetricObjLineInGraph,
      volumetricObjStyle: this.props.activeDatasourceConfig ? this.props.activeDatasourceConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.style : this.props.defaultConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.style,
      volumetricObjLabel: this.props.activeDatasourceConfig ? this.props.activeDatasourceConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel : this.props.defaultConfig.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel,
      distanceInterval: 1.0,
      showInValidIntervalErrorMsg: false,
      getIntervalsError: '',
      addedElevationLayers: this.props.addedElelvationProfileLayers,
      newAddedLayers: this.props.newAddedLayer,
      profileSettingsForNewlyAddedLayers: this.props.profileSettingsForNewAddedLayer
    }

    this._selectableLayers = []
    this._intersectingLayers = []
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  updateOutputStatistics = lodash.debounce(() => {
    this.props.buildOutputStatistics(
      this.state.selectedElevationUnit,
      this.state.selectedLinearUnit,
      this.state.isFlipChart
    )
  }, 700)

  componentDidMount = () => {
    this.getSelectableLayers(this.props.activeDataSource)
    this.getIntersectingLayers(this.props.activeDataSource)
    this.props.intersectingBufferRuntime({
      enabled: this.state.isBufferSelectorEnableInConfig,
      bufferDistance: this.state.selectedBufferDistance,
      bufferUnits: this.state.selectedBufferUnit,
      bufferSymbol: this.state.selectedBufferSymbol
    })
    if (this.props.selectMode || this.props.drawMode) {
      setTimeout(() => {
        focusElementInKeyboardMode(this._alertElement?.current)
      }, 100)
    }
  }

  componentDidUpdate = (prevProps: Props) => {
    const currentDsConfig = this.props.activeDatasourceConfig
    const prevDsConfig = prevProps.activeDatasourceConfig
    const selectedUnit = defaultSelectedUnits(currentDsConfig, portalSelf)
    if (prevProps.commonDsGeneralSettings.showLegend !== this.props.commonDsGeneralSettings?.showLegend ||
      prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime ||
      this.didElevationLayersInfoChanged(prevDsConfig?.elevationLayersSettings?.addedElevationLayers,
        currentDsConfig?.elevationLayersSettings?.addedElevationLayers) ||
      prevDsConfig?.elevationLayersSettings?.groundLayerId !== currentDsConfig?.elevationLayersSettings?.groundLayerId ||
      prevDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph !== currentDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph ||
      prevDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.displayStatistics !== currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.displayStatistics ||
      this.didStatisticsListChanged(prevDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.selectedStatistics,
        currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.selectedStatistics)
    ) {
      const isDisplayStats = currentDsConfig?.elevationLayersSettings?.addedElevationLayers.filter((layerInfo) => layerInfo.displayStatistics)?.[0]?.displayStatistics ||
      (currentDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph && currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.displayStatistics)
      this.setState({
        showLegend: this.props.commonDsGeneralSettings?.showLegend,
        displayStats: isDisplayStats,
        addedElevationLayers: currentDsConfig?.elevationLayersSettings?.addedElevationLayers
      }, () => {
        if (!this.state.displayStats || !this.props.profileResult) {
          this.setState({
            statisticsOpen: false
          })
        }
        this.displayStatisticsInfo(this._chart)
        this.exportOptionDisplay()
      })
    }

    if (prevProps.chartRender !== this.props.chartRender && (!this.props.chartRender && this.state.statisticsOpen)) {
      this.setState({
        statisticsOpen: false
      })
    }

    //check for the allow export option in live view and handles the interval error
    if (prevProps.commonDsGeneralSettings.allowExport !== this.props.commonDsGeneralSettings?.allowExport ||
      prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime) {
      this.setState({
        allowExport: this.props.commonDsGeneralSettings?.allowExport,
        isExport: false
      }, () => {
        if (prevProps.chartDataUpdateTime !== this.props.chartDataUpdateTime) {
          this.setState({
            distanceInterval: this.getDefaultIntervalValue()
          })
          this.showIntervalError(this.getDefaultIntervalValue())
        }
      })
    }

    if (prevProps.noFeaturesFoundError !== this.props.noFeaturesFoundError) {
      this.setState({
        noFeaturesError: this.props.noFeaturesFoundError
      })
    }

    if (prevProps.viewModelErrorState !== this.props.viewModelErrorState ||
      prevProps.profileErrorMsg !== this.props.profileErrorMsg) {
      this.setState({
        noValidInput: this.props.viewModelErrorState,
        viewModelErrorMsg: this.props.profileErrorMsg
      })
    }

    //for more options live update
    if (prevDsConfig?.elevationLayersSettings?.elevationUnit !== currentDsConfig?.elevationLayersSettings?.elevationUnit ||
      prevDsConfig?.elevationLayersSettings?.linearUnit !== currentDsConfig?.elevationLayersSettings?.linearUnit ||
      prevDsConfig?.advanceOptions !== currentDsConfig?.advanceOptions ||
      prevDsConfig?.profileSettings?.isProfileSettingsEnabled !== currentDsConfig?.profileSettings?.isProfileSettingsEnabled ||
      prevDsConfig?.profileSettings?.isCustomizeOptionEnabled !== currentDsConfig?.profileSettings?.isCustomizeOptionEnabled ||
      prevDsConfig?.assetSettings?.isAssetSettingsEnabled !== currentDsConfig?.assetSettings?.isAssetSettingsEnabled
    ) {
      this.setState({
        selectedElevationUnit: currentDsConfig?.elevationLayersSettings?.elevationUnit ? currentDsConfig.elevationLayersSettings?.elevationUnit : selectedUnit[0],
        selectedLinearUnit: currentDsConfig?.elevationLayersSettings?.linearUnit ? currentDsConfig.elevationLayersSettings?.linearUnit : selectedUnit[1],
        isProfileSettingsOptionEnabled: currentDsConfig?.profileSettings.isProfileSettingsEnabled,
        isCustomizeOptionEnabled: currentDsConfig?.profileSettings.isCustomizeOptionEnabled,
        isAssetSettingsOptionEnabled: currentDsConfig?.assetSettings?.isAssetSettingsEnabled,
        profileLayers: currentDsConfig?.profileSettings.layers,
        intersectingLayers: currentDsConfig?.assetSettings?.layers
      }, () => {
        //on change of units update stats values to use in other widget
        this.displayStatisticsInfo(this._chart)
        this.showIntervalError(this.getDefaultIntervalValue())
        this.exportOptionDisplay()
        this.getSelectableLayers(this.props.activeDataSource)
        this.getIntersectingLayers(this.props.activeDataSource)
      })
    }

    //rerender the graph when volumetric objects property changed in live view
    if (prevDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph !== currentDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph ||
      !lodash.isDeepEqual(prevDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.style, currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.style) ||
      prevDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel !== currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel) {
      this.setState({
        showViewLineGraph: currentDsConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph,
        volumetricObjStyle: currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.style,
        volumetricObjLabel: currentDsConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel
      })
    }

    //check if profile layers config are updated in live view mode
    if (this.didProfileLayersSettingsChanged(prevDsConfig?.profileSettings.layers,
      currentDsConfig?.profileSettings.layers)) {
      this.setState({
        profileLayers: currentDsConfig?.profileSettings.layers
      }, () => {
        this.getSelectableLayers(this.props.activeDataSource)
      })
    }

    //check if intersecting layers config are updated in live view mode
    if (this.didIntersectingLayersSettingsChanged(prevDsConfig?.assetSettings?.layers,
      currentDsConfig?.assetSettings?.layers)) {
      this.setState({
        intersectingLayers: currentDsConfig?.assetSettings?.layers
      }, () => {
        this.getIntersectingLayers(this.props.activeDataSource)
      })
    }

    if ((this.props.drawMode && (prevProps.onDrawingComplete !== this.props.onDrawingComplete)) ||
      prevProps.isNewSegmentsForSelection !== this.props.isNewSegmentsForSelection ||
      prevProps.noGraphicAfterFirstSelection !== this.props.noGraphicAfterFirstSelection) {
      this.setState({
        dismissInfoMsg: (this.props.selectMode && this.props.isNewSegmentsForSelection) || (this.props.drawMode && !this.props.onDrawingComplete),
        dismissWarningMsg: !this.props.isNewSegmentsForSelection && !this.props.noGraphicAfterFirstSelection && this.props.selectMode
      })
    }

    //check for buffer settings in live view
    if (prevDsConfig?.assetSettings?.assetIntersectingBuffer?.enabled !== currentDsConfig?.assetSettings?.assetIntersectingBuffer?.enabled ||
      prevDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferDistance !== currentDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferDistance ||
      prevDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferUnits !== currentDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferUnits ||
      !lodash.isDeepEqual(prevDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferSymbol,
        currentDsConfig?.assetSettings?.assetIntersectingBuffer?.bufferSymbol)) {
      this.setState({
        isBufferSelectorEnableInConfig: currentDsConfig?.assetSettings.assetIntersectingBuffer.enabled,
        isBufferSelectorEnableAtRuntime: currentDsConfig?.assetSettings.assetIntersectingBuffer.enabled,
        selectedBufferDistance: currentDsConfig?.assetSettings.assetIntersectingBuffer.bufferDistance || this.state.selectedBufferDistance,
        selectedBufferUnit: currentDsConfig?.assetSettings.assetIntersectingBuffer.bufferUnits || this.state.selectedBufferUnit,
        selectedBufferSymbol: currentDsConfig?.assetSettings.assetIntersectingBuffer.bufferSymbol
      }, () => {
        this.props.intersectingBufferRuntime({
          enabled: this.state.isBufferSelectorEnableInConfig,
          bufferDistance: this.state.selectedBufferDistance,
          bufferUnits: this.state.selectedBufferUnit,
          bufferSymbol: this.state.selectedBufferSymbol
        })
      })
    }

    //if statistics popup is open and current page is changed in live view
    if (this.state.statisticsOpen && (prevProps.currentPageId !== this.props.currentPageId)) {
      this.setState({
        statisticsOpen: false
      })
    }

    //update the selectable layers dropdown when new added layer changed in live view
    if (prevProps?.newAddedLayer !== this.props?.newAddedLayer ||
      prevProps?.profileSettingsForNewAddedLayer !== this.props?.profileSettingsForNewAddedLayer
    ) {
      this.setState({
        newAddedLayers: this.props?.newAddedLayer,
        profileSettingsForNewlyAddedLayers: this.props?.profileSettingsForNewAddedLayer
      }, () => {
        if (this.state.newAddedLayers !== this.state.selectedLayers) {
          this.getSelectableLayers(this.props.activeDataSource)
        }
      })
    }
  }

  didElevationLayersInfoChanged = (prevSettings, newSettings) => {
    let elevationLayersList = false
    if (newSettings?.length !== prevSettings?.length) {
      return true
    }
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newStatsSettings, index) => {
      if (!lodash.isDeepEqual(newStatsSettings.useDataSource, prevSettings[index]?.useDataSource) ||
        newStatsSettings.label !== prevSettings[index]?.label ||
        newStatsSettings.elevationLayerUrl !== prevSettings[index]?.elevationLayerUrl ||
        !lodash.isDeepEqual(newStatsSettings.style, prevSettings[index]?.style) ||
        newStatsSettings.displayStatistics !== prevSettings[index]?.displayStatistics ||
        this.didStatisticsListChanged(prevSettings[index]?.selectedStatistics,
          newStatsSettings.selectedStatistics)) {
        elevationLayersList = true
        return true
      }
    })
    return elevationLayersList
  }

  didStatisticsListChanged = (prevSettings, newSettings) => {
    let statsListChange = false
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newStatsSettings, index) => {
      if (newStatsSettings.name !== prevSettings[index].name ||
        newStatsSettings.label !== prevSettings[index].label ||
        newStatsSettings.enabled !== prevSettings[index].enabled) {
        statsListChange = true
        return true
      }
    })
    return statsListChange
  }

  didProfileLayersSettingsChanged = (prevProfileLayers, currentProfileLayers) => {
    let profileSettingsChanged = false
    if (prevProfileLayers?.length !== currentProfileLayers?.length) {
      profileSettingsChanged = true
    }
    return profileSettingsChanged
  }

  didIntersectingLayersSettingsChanged = (prevAssetLayers, currentAssetLayers) => {
    let intersectingSettingsChanged = false
    if (prevAssetLayers?.length !== currentAssetLayers?.length) {
      intersectingSettingsChanged = true
    }
    return intersectingSettingsChanged
  }

  /**
   * Updates the states to show the interval error message
   * @param intervalInput distance interval input
   */
  showIntervalError = (intervalInput: number) => {
    const xMin = 0
    this.setState({
      distanceInterval: intervalInput
    })
    if (intervalInput >= xMin && intervalInput <= this.getMaxDistance()) {
      this.setState({
        showInValidIntervalErrorMsg: false
      })
    } else {
      this.setState({
        showInValidIntervalErrorMsg: true,
        getIntervalsError: this.getIntervalLimitValues(xMin, this.getMaxDistance())
      })
    }
  }

  getSelectableLayers = (activeDs: string) => {
    const dataSource: DataSource[] = getAllLayersFromDataSource(activeDs)
    this._selectableLayers = []
    const selectedLayers = []
    let anyLineLayer = false
    dataSource?.forEach((layer: FeatureLayerDataSource) => {
      if (layer && layer.getLayerDefinition() && layer.getLayerDefinition().geometryType &&
        layer.getLayerDefinition().geometryType === 'esriGeometryPolyline') {
        //if selectable layers option is enabled in config then display all the configured layers in layers dropdown
        // eslint-disable-next-line no-prototype-builtins
        if ((this.props.activeDatasourceConfig?.hasOwnProperty('advanceOptions') || this.state.isProfileSettingsOptionEnabled)) {
          // eslint-disable-next-line no-prototype-builtins
          if ((this.props.activeDatasourceConfig?.hasOwnProperty('advanceOptions') && this.props.activeDatasourceConfig?.advanceOptions) ||
            this.state.isCustomizeOptionEnabled) {
            if (this.state.profileLayers.length === 0) {
              anyLineLayer = false
            } else {
              this.state.profileLayers?.forEach((currentSetting) => {
                if (currentSetting?.layerId === layer.id) {
                  this._selectableLayers.push({
                    label: layer.getSchema().label,
                    value: layer.id
                  })
                  selectedLayers.push(layer.id)
                  //update the flag to true if any line layers are configured
                  anyLineLayer = true
                }
              })
            }
          } else { //display all the available line layers in layers dropdown available in map
            this._selectableLayers.push({
              label: layer.getSchema().label,
              value: layer.id
            })
            selectedLayers.push(layer.id)
            //update the flag to true if any line layers are configured
            anyLineLayer = true
          }
        }
      }
    })

    //if new layer is added through other widgets then push that layer details
    //in order to display that layer at the runtime selectable layers dropdown
    if (this.state.newAddedLayers?.length > 0) {
      const dsManager = DataSourceManager.getInstance()
      this.state.newAddedLayers.forEach((newLayerDsId) => {
        const layerDs = dsManager?.getDataSource(newLayerDsId)
        if (layerDs) {
          this._selectableLayers.push({
            label: layerDs.getSchema().label,
            value: layerDs.id
          })
          selectedLayers.push(layerDs.id)
          //update the flag to true if any line layers are configured
          anyLineLayer = true
        }
      })
    }

    this.props.selectableLayersRuntime(selectedLayers)
    this.setState({
      selectedLayers: selectedLayers,
      isAnyProfileLineLayers: anyLineLayer
    })
  }

  getIntersectingLayers = (activeDs: string) => {
    const dataSource: DataSource[] = getAllLayersFromDataSource(activeDs)
    this._intersectingLayers = []
    const selectedLayers = []
    let anyIntersectingLayer = false
    dataSource?.forEach((layer: FeatureLayerDataSource) => {
      if (layer && layer.getLayerDefinition() && layer.getLayerDefinition().geometryType) {
        //if asset settings option is enabled in config then display all the configured layers in layers dropdown
        if (this.state.isAssetSettingsOptionEnabled) {
          if (this.state.intersectingLayers?.length === 0) {
            anyIntersectingLayer = false
          } else {
            if (layer.getLayerDefinition().geometryType === 'esriGeometryPolyline' || layer.getLayerDefinition().geometryType === 'esriGeometryPoint') {
              this.state.intersectingLayers?.forEach((currentSetting) => {
                if (currentSetting?.layerId === layer.id) {
                  this._intersectingLayers.push({
                    label: layer.getSchema().label,
                    value: layer.id
                  })
                  selectedLayers.push(layer.id)
                  //update the flag to true if any line layers are configured
                  anyIntersectingLayer = true
                }
              })
            }
          }
        }
      }
    })
    this.props.intersectingLayersRuntime(selectedLayers)
    this.setState({
      selectedIntersectedLayers: selectedLayers,
      isAnyIntersectingLayers: anyIntersectingLayer
    })
  }

  onDoneClick = () => {
    const enableToShowNewProfile = this.props.doneClick()
    if (enableToShowNewProfile) {
      this.setState({
        enableForNewProfile: true
      })
    } else {
      //if empty state
      this.setState({
        enableForNewProfile: false,
        initialEmptyState: false,
        emptyStateIfDoneClick: true,
        noFeaturesError: false,
        noValidInput: false
      }, () => {
        setTimeout(() => {
          focusElementInKeyboardMode(this._alertElement?.current)
        }, 100)
      })
    }
  }

  toggleStatistics = () => {
    this.setState({
      statisticsOpen: !this.state.statisticsOpen
    }, () => {
      this.displayStatisticsInfo(this._chart, true)
    })
  }

  toggleSettings = () => {
    this.setState({
      settingsOptionsOpen: !this.state.settingsOptionsOpen
    })
  }

  highlightChartPosition = (point) => {
    this.props.chartPosition(point)
  }

  hideChartPosition = () => {
    this.props.hideChartPosition()
  }

  onChartFlip = () => {
    this.setState({
      isFlipChart: !this.state.isFlipChart,
      toggledSeriesId: ''
    }, () => {
      this.displayStatisticsInfo(this._chart)
      this.exportOptionDisplay()
    })
  }

  onNewProfileClick = () => {
    this.createNewProfile()
    this.props.jimuMapView.clearSelectedFeatures()
    this.setState({
      enableForNewProfile: false
    })
  }

  onClearButtonClick = () => {
    this.createNewProfile()
  }

  createNewProfile = () => {
    this.props.activateDrawSelectToolForNewProfile()
    this.setState({
      initialEmptyState: true,
      emptyStateIfDoneClick: false,
      noFeaturesError: false,
      noValidInput: false,
      statisticsOpen: false,
      isExport: false
    }, () => {
      setTimeout(() => {
        focusElementInKeyboardMode(this._alertElement?.current)
      }, 100)
    })
  }

  onElevationUnitChange = (evt) => {
    this.setState({
      selectedElevationUnit: evt.target.value
    }, () => {
      this.displayStatisticsInfo(this._chart)
    })
  }

  onLinearUnitChange = (evt) => {
    this.setState({
      selectedLinearUnit: evt.target.value
    }, () => {
      this.displayStatisticsInfo(this._chart)
      //update the interval values according to the distance
      this.showIntervalError(this.getDefaultIntervalValue())
      this.exportOptionDisplay()
    })
  }

  onLayerSelected = (value, values) => {
    let isLayerEnable: boolean = true
    this.setState({
      selectedLayers: values
    })
    if (values.length === 0) {
      isLayerEnable = false
    }
    this.setState({
      isLayerSelected: isLayerEnable
    })
    this.props.selectableLayersRuntime(values)
  }

  onIntersectedLayerSelected = (value, values) => {
    this.setState({
      selectedIntersectedLayers: values
    })
    this.props.intersectingLayersRuntime(values)
  }

  displaySelectedFields = (values) => {
    //display enabled layers count on dropdown
    let selectedLabel = this.nls('selectLayerLabel')
    if (values && values.length) {
      selectedLabel = this.props.intl.formatMessage({
        id: 'selectedLayerCount',
        defaultMessage: defaultMessages.selectedLayerCount
      }, { selectedLayerCount: values.length })
    }
    return selectedLabel
  }

  updateBufferValues = () => {
    this.props.intersectingBufferRuntime({
      enabled: this.state.isBufferSelectorEnableAtRuntime,
      bufferDistance: this.state.selectedBufferDistance,
      bufferUnits: this.state.selectedBufferUnit,
      bufferSymbol: this.state.selectedBufferSymbol
    })
  }

  onBufferSelectorChange = (evt) => {
    this.setState({
      isBufferSelectorEnableAtRuntime: evt.target.checked
    }, () => {
      this.updateBufferValues()
    })
  }

  onBufferUnitsChange = (evt) => {
    const bufferDistanceMaxLimit = validateMaxBufferDistance(this.state.selectedBufferDistance, evt.target.value)
    this.setState({
      selectedBufferUnit: evt.target.value,
      selectedBufferDistance: bufferDistanceMaxLimit
    }, () => {
      this.updateBufferValues()
    })
  }

  onBufferDistanceChange = (value: number) => {
    this.setState({
      selectedBufferDistance: value ?? 0
    }, () => {
      this.updateBufferValues()
    })
  }

  onUniformScalingChange = (evt) => {
    this.setState({
      isUniformScalingEnable: evt.target.checked
    })
  }

  setExportButtonState = (isExport: boolean) => {
    this.setState({
      exportData: isExport
    })
  }

  customizeIntervalChange = (evt) => {
    this.setState({
      isCustomizeInterval: evt.target.checked
    })
    if (evt.target.checked) {
      this.onDistanceIntervalChange(this.state.distanceInterval)
    }
  }

  //get max distance of the profile result
  getMaxDistance = () => {
    return this.props.profileResult?.statistics?.maxDistance ? convertSingle(this.props.profileResult.statistics.maxDistance, this.props.profileResult.effectiveUnits.distance, this.state.selectedLinearUnit) : 0
  }

  onExportButtonClick = () => {
    this.state.showInValidIntervalErrorMsg ? this.setState({ exportData: false }) : this.setState({ exportData: true })
  }

  onExportCancelButtonClick = () => {
    this.setState({
      isExport: false
    })
  }

  /**
   * Get the default interval value from profile result xmax
   * @returns default interval value
   */
  getDefaultIntervalValue = () => {
    const maxInterval = this.getMaxDistance()
    let setDefaultInterval: number = 1
    if (maxInterval < 1 && maxInterval >= 0.1) {
      setDefaultInterval = 0.1
    } else if (maxInterval < 0.1 && maxInterval >= 0.01) {
      setDefaultInterval = 0.01
    } else if (maxInterval < 0.01 && maxInterval >= 0.001) {
      setDefaultInterval = 0.001
    } else if (maxInterval < 0.001 && maxInterval >= 0.0001) {
      setDefaultInterval = 0.0001
    }
    return setDefaultInterval
  }

  onDistanceIntervalChange = (value: number) => {
    const xMin = 0
    this.setState({
      distanceInterval: value ?? 0
    }, () => {
      if (this.state.distanceInterval === 0) { // 0 is not a valid interval value show the error
        this.setState({
          showInValidIntervalErrorMsg: true,
          getIntervalsError: this.getIntervalLimitValues(null, null)
        })
      } else if (this.state.distanceInterval >= xMin && this.state.distanceInterval <= this.getMaxDistance()) {
        this.setState({
          showInValidIntervalErrorMsg: false
        })
      } else {
        this.setState({
          showInValidIntervalErrorMsg: true,
          getIntervalsError: this.getIntervalLimitValues(xMin, this.getMaxDistance())
        })
      }
    })
  }

  //get error handling error message for min max distance values
  getIntervalLimitValues = (xMin, xMax) => {
    let intervalErrorHintLabel = ''
    if (!xMin && !xMax) {
      intervalErrorHintLabel = this.nls('intervalHintForInvalidEntry')
    } else {
      intervalErrorHintLabel = this.props.intl.formatMessage({
        id: 'intervalErrorHint', defaultMessage: defaultMessages.intervalErrorHint
      }, { xMin: xMin, xMax: this.truncateMaxIntervalDistance(xMax) })
    }
    return intervalErrorHintLabel
  }

  /**
   * Truncate the max profile result max distance
   * @param xMax profile result max disatnce value
   * @returns formatted value
   */
  truncateMaxIntervalDistance = (xMax: number) => {
    let formattedValue
    if (!isNaN(xMax) && xMax !== null) {
      const truncatePlaces = 4
      const truncateExp = new RegExp(truncatePlaces > 0 ? '^\\d*[.]?\\d{0,' + truncatePlaces + '}' : '^\\d*')
      formattedValue = truncateExp.exec(xMax.toString())[0]
      formattedValue = this.props.intl.formatNumber(formattedValue, { maximumFractionDigits: truncatePlaces })
    }
    return formattedValue
  }

  adjustInfoIconPosition = () => {
    const theme = this.props.theme
    let infoMarginTop = -8
    if (theme.ref.typeface.htmlFontSize === '125%') {
      infoMarginTop = -11
    }
    return infoMarginTop
  }

  exportOptionDisplay = () => {
    const isRTL = getAppStore().getState().appContext.isRTL
    const selectedDistance = unitOptions.find(unit => unit.value === this.state.selectedLinearUnit)
    return (<div>
      <Popper css={getExportOptionsStyle(this.props.theme)}
        open={this.state.isExport}
        reference={'export' + this.props.widgetId}
        placement={'right-start'}
        version={0}
        toggle={e => {
          this.setState({ isExport: !this.state.isExport })
        }}
      >
        <div style={{ width: 250 }} className={'p-2'}>
          <Label aria-label={this.nls('chartExport')} className={'exportLabel text-break'}>
            {this.nls('chartExport')}
          </Label>
          <Label tabIndex={0} className='pt-2 pl-1 exportHintStyle'>
            {this.nls('exportHint')}
          </Label>
          <div className={'pt-1 pb-1 d-flex'}>
            <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('customizeIntervalTooltip')}
              title={this.nls('customizeIntervalTooltip')} showArrow placement='top'>
              <Button className={'d-inline'} style={{ marginTop: this.adjustInfoIconPosition(), marginLeft: -4 }} type='tertiary' icon>
                <Icon icon={epIcon.infoIcon} />
              </Button>
            </Tooltip>
            <Label className='w-100 d-flex pl-1'>
              {this.nls('customizeIntervalLabel')}
            </Label>
            <Switch role={'switch'} aria-label={this.nls('customizeIntervalLabel')}
              title={this.nls('customizeIntervalLabel')} checked={this.state.isCustomizeInterval}
              onChange={this.customizeIntervalChange} />
          </div>

          <div className={this.state.isCustomizeInterval ? 'showCustomizeEdit' : 'hideCustomizeEdit'}>
            <div className={classNames('d-flex', this.state.showInValidIntervalErrorMsg ? 'pb-1' : 'pb-2')}>
              <NumericInput aria-label={this.nls('customizeIntervalLabel')} size={'sm'} defaultValue={this.state.distanceInterval} value={this.state.distanceInterval}
                title={this.state.distanceInterval + ''} className={classNames('ml-1 w-100', this.state.showInValidIntervalErrorMsg ? 'invalidValue' : '')}
                showHandlers={false} onChange={this.onDistanceIntervalChange} />
              <div title={this.nls(selectedDistance.abbreviation)} className={'style-setting--unit-selector border'}>
                <Label className='text-truncate unitsLabel'>{this.nls(selectedDistance.abbreviation)}
                </Label>
              </div>
            </div>
            <Label className={classNames('ml-1 pb-1 invalidRange', this.state.isCustomizeInterval &&
              this.state.showInValidIntervalErrorMsg
              ? 'showCustomizeEdit'
              : 'hideCustomizeEdit')}>
              {this.state.getIntervalsError}
            </Label>
          </div>

          <div style={{ height: 35 }} className={'mt-1 mb-2 d-flex w-100'}>
            <div className={'align-items-center w-100 pt-1'} style={{ display: 'inline-block' }}>
              <Button role={'button'} aria-label={this.nls('exportLabel')} title={this.nls('exportLabel')}
                className={'actionButton text-break'} style={{ float: !isRTL ? 'right' : 'left' }} size={'default'} type='primary' onClick={this.onExportButtonClick}>
                {this.nls('exportLabel')}
              </Button>
              <Button role={'button'} aria-label={this.nls('cancel')} title={this.nls('cancel')}
                className={'actionButton text-break'} style={{ float: !isRTL ? 'left' : 'right' }} size={'default'} type='secondary' onClick={this.onExportCancelButtonClick}>
                {this.nls('cancel')}
              </Button>
            </div></div>
        </div>
      </Popper>
    </div>
    )
  }

  displayStatisticsInfo = (chart?, toggledSeries = false) => {
    const items: React.JSX.Element[] = []
    const elevationLayersSeries = []
    this.setState({
      legendStats: []
    })
    if (!chart?.series) {
      items.push(<Loading type={LoadingType.Donut} />)
    } else {
      chart?.series?.values.forEach((series, index) => {
        this.state.addedElevationLayers.forEach((layerInfo) => {
          if (layerInfo.id === series.get('id') && layerInfo.displayStatistics) {
            elevationLayersSeries.push({
              id: series.get('id'),
              name: series.get('name'),
              color: layerInfo.style.lineColor,
              statistics: this.props.visibleGroundProfileStats.filter((profile) => profile.id === layerInfo.id)[0],
              selectedStatsList: layerInfo.selectedStatistics
            })
          }
        })
      })

      //If volumetic objects is enabled, and Show profile stats is enabled in config,
      //then display the statistics of the volumetric object in Profile statistics window
      const volumetricObjOptions = this.props.activeDatasourceConfig?.elevationLayersSettings?.volumetricObjSettingsOptions
      if (this.state.showViewLineGraph && volumetricObjOptions?.displayStatistics) {
        chart?.series?.values.forEach((series, index) => {
          if (volumetricObjOptions?.id === series.get('id')) {
            elevationLayersSeries.push({
              id: series.get('id'),
              name: series.get('name'),
              color: volumetricObjOptions.style.lineColor,
              statistics: this.props.visibleGroundProfileStats.filter((profile) => profile.id === volumetricObjOptions.id)[0],
              selectedStatsList: volumetricObjOptions.selectedStatistics
            })
          }
        })
      }

      elevationLayersSeries.forEach((series, index) => {
        items.push(<ProfileStatistics
          theme={this.props.theme}
          intl={this.props.intl}
          parentWidgetId={this.props.widgetId}
          index={index}
          key={series.name + index}
          isShowViewLineInGraph={this.state.showViewLineGraph}
          legendName={series.name}
          activeDsConfig={this.props.activeDatasourceConfig}
          selectedElevationUnit={this.state.selectedElevationUnit}
          selectedLinearUnit={this.state.selectedLinearUnit}
          chartDataUpdateTime={this.props.chartDataUpdateTime}
          chartProfileResult={series.statistics}
          selectedStatsDisplay={series.selectedStatsList}
          statsLineColor={series.color}
          seriesId={series.id}
          renderSeries={this.state.renderSeries}
          toggledSeriesId={this.state.toggledSeriesId}
          isFlip={this.state.isFlipChart}
        />)
        return true //Remove once we show other series statistics
      })
    }
    this.setState({
      legendStats: items
    }, () => {
      //on change of elevation profile stats update the output stats in other widgets
      if (!toggledSeries) {
        this.updateOutputStatistics()
      }
    })
  }

  statisticsDisplay = () => {
    return (<div>
      {this.props.isMobile
        ? <MobilePanel open={this.state.statisticsOpen} title={this.nls('statisticsLabel')}
          css={getChartStyle(this.props.theme)}
          onClose={() => { this.setState({ statisticsOpen: !this.state.statisticsOpen }) }}>
          <div style={{ height: 'calc(100% - 15px)', overflow: 'auto' }} className={'pr-4 pl-4 pt-2 pb-4'}>
            {this.state.legendStats.map((statsComponent, index) => (
              <React.Fragment key={index}>
                {statsComponent}
              </React.Fragment>
            ))}
          </div>
        </MobilePanel>
        : <FloatingPanel css={getChartStyle(this.props.theme)}
          open={this.state.statisticsOpen}
          reference={'statistics' + this.props.widgetId}
          headerTitle={this.nls('statisticsLabel')}
          flipOptions={{ fallbackPlacements: ['left', 'right', 'top', 'bottom'] }}
          onHeaderClose={() => { this.setState({ statisticsOpen: !this.state.statisticsOpen }) }}
          defaultSize={{ width: 400, height: this.state.legendStats.length === 1 ? 435 : 475 }}>
          {/* Show Statistics Info for each series*/}
          <div style={{ height: 'calc(100% - 15px)', overflow: 'auto' }} className={'pr-4 pl-4 pt-2 pb-4'}>
            {this.state.legendStats.map((statsComponent, index) => (
              <React.Fragment key={index}>
                {statsComponent}
              </React.Fragment>
            ))}
          </div>
        </FloatingPanel>
      }
    </div>
    )
  }

  settingsOptionsRender = () => {
    return (<div>
      <Popper css={geSettingsOptionsStyle(this.props.theme)} open={this.state.settingsOptionsOpen}
        reference={'settingsOptions' + this.props.widgetId}
        placement='right-start'
        version={0}
        toggle={e => {
          this.setState({ settingsOptionsOpen: !this.state.settingsOptionsOpen })
        }}
      >
        <div tabIndex={-1} style={{ width: 175 }}>
          <div tabIndex={-1} className={'p-2'}>
            <Label aria-label={this.nls('elevationUnitLabel')} className={'settingsLabel text-break'}>
              {this.nls('elevationUnitLabel')}
            </Label>
            <Select aria-label={this.nls('elevationUnitLabel') + ' ' + this.state.selectedElevationUnit} className={'pt-1'} name='elevationUnit'
              size={'sm'} onChange={this.onElevationUnitChange} value={this.state.selectedElevationUnit}>
              {unitOptions.map((unitOption) => {
                return <Option role={'option'} aria-label={unitOption.value} key={unitOption.value} value={unitOption.value}>{this.nls(unitOption.value)}</Option>
              })}
            </Select>
          </div>

          <div className={'p-2'}>
            <Label aria-label={this.nls('distanceUnitLabel')} className={'settingsLabel text-break'}>
              {this.nls('distanceUnitLabel')}
            </Label>
            <Select aria-label={this.nls('distanceUnitLabel') + ' ' + this.state.selectedLinearUnit} className={'pt-1'} name='linearUnit'
              size={'sm'} onChange={this.onLinearUnitChange} value={this.state.selectedLinearUnit}>
              {unitOptions.map((unitOption) => {
                return <Option role={'option'} aria-label={unitOption.value} key={unitOption.value} value={unitOption.value}>{this.nls(unitOption.value)}</Option>
              })}
            </Select>
          </div>

          {this.state.isAnyProfileLineLayers &&
            <React.Fragment>
              <div className={'p-2'}>
                <Label aria-label={this.nls('selectableLayersLabel')} className={'settingsLabel text-break'}>
                  {this.nls('selectableLayersLabel')}
                </Label>
                {!this.state.isLayerSelected &&
                  <Alert tabIndex={0} className={'w-100 selectLayerWarningMsg py-1'}
                    open={!this.state.isLayerSelected}
                    text={this.nls('selectLayerWarning')}
                    type={'warning'}
                    withIcon
                  />
                }
                <MultiSelect
                  items={Immutable(this._selectableLayers)}
                  values={Immutable(this.state.selectedLayers)}
                  className='pt-1 custom-multiselect'
                  size='sm'
                  onChange={this.onLayerSelected}
                  displayByValues={this.displaySelectedFields} />
              </div>
            </React.Fragment>
          }

          {(this.props.selectMode || this.props.drawMode) && this.state.isAnyIntersectingLayers &&
            <React.Fragment>
              <div className={'p-2'}>
                <Label aria-label={this.nls('intersectingLayersLabel')} className={'settingsLabel text-break'}>
                  {this.nls('intersectingLayersLabel')}
                </Label>
                <MultiSelect
                  items={Immutable(this._intersectingLayers)}
                  values={Immutable(this.state.selectedIntersectedLayers)}
                  className='pt-1 custom-multiselect'
                  size={'sm'}
                  onChange={this.onIntersectedLayerSelected}
                  displayByValues={this.displaySelectedFields} />
              </div>
            </React.Fragment>
          }

          {(this.state.isAssetSettingsOptionEnabled && this.state.isBufferSelectorEnableInConfig) &&
            <div className={'p-2'}>
              <Label aria-label={this.nls('bufferSelectorLabel')} className={'w-100 d-flex'}>
                <div className='flex-grow-1 settingsLabel text-break'>
                  {this.nls('bufferSelectorLabel')}
                </div>
                <Switch role={'switch'} aria-label={this.nls('bufferSelectorLabel')}
                  title={this.nls('bufferSelectorLabel')}
                  checked={this.state.isBufferSelectorEnableAtRuntime}
                  onChange={this.onBufferSelectorChange} />
              </Label>

              {this.state.isBufferSelectorEnableAtRuntime &&
                <React.Fragment>
                  <NumericInput aria-label={this.nls('bufferSelectorLabel') + this.state.selectedBufferDistance}
                    size={'sm'} min={0} max={getMaxBufferLimit(this.state.selectedBufferUnit)}
                    defaultValue={this.state.selectedBufferDistance} value={this.state.selectedBufferDistance}
                    onChange={this.onBufferDistanceChange} />

                  <Select aria-label={this.state.selectedBufferUnit} className={'pt-1 pb-1'}
                    size={'sm'} name={'bufferUnits'}
                    value={this.state.selectedBufferUnit}
                    onChange={this.onBufferUnitsChange}>
                    {unitOptions.map((option, index) => {
                      return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                        {this.nls(option.value)}</Option>
                    })}
                  </Select>
                </React.Fragment>
              }
            </div>
          }

          <React.Fragment>
            <div className={'pl-2 pb-2 pr-2'}>
              <Label className={'cursor-pointer settingsLabel text-break'} title={this.nls('uniformChartScalingInfo')}>
                <Checkbox role={'checkbox'} className={'mr-2 font-13'} aria-label={this.nls('uniformChartScaling')}
                  checked={this.state.isUniformScalingEnable} onChange={this.onUniformScalingChange.bind(this)}
                />
                {this.nls('uniformChartScaling')}
              </Label>
            </div>
          </React.Fragment>
        </div>
      </Popper>
    </div>
    )
  }

  dismissInfoMsg = () => {
    this.setState({ dismissInfoMsg: !this.state.dismissInfoMsg })
  }

  dismissWarningMsg = () => {
    this.setState({ dismissWarningMsg: !this.state.dismissWarningMsg })
  }

  getChartInfo = (chart: any) => {
    this._chart = chart
    setTimeout(() => {
      this.displayStatisticsInfo(this._chart)
    }, 50)
  }

  onToggleSeries = (hideSeries: boolean, toggledSeriesId: string) => {
    this.setState({
      renderSeries: !hideSeries,
      toggledSeriesId: toggledSeriesId
    }, () => {
      this.displayStatisticsInfo(this._chart, true)
    })
  }

  toggleExport = () => {
    this.setState({
      isExport: !this.state.isExport
    })
  }

  render () {
    let infoMessagesForSelectDraw = ''
    let warningMessagesForSelectDraw = ''
    let infoMsgWhileSelectingOrDrawing = ''
    if ((this.state.initialEmptyState && this.props.drawMode) || (this.state.emptyStateIfDoneClick && this.props.drawMode)) {
      infoMessagesForSelectDraw = this.nls('drawUserInfo')
    } else if ((this.state.initialEmptyState && this.props.selectMode) || (this.state.emptyStateIfDoneClick && this.props.selectMode)) {
      infoMessagesForSelectDraw = this.nls('selectUserInfo')
    }

    if (this.state.emptyStateIfDoneClick && this.props.drawMode) {
      warningMessagesForSelectDraw = this.nls('emptyDrawStateWarning')
    } else if (this.state.emptyStateIfDoneClick && this.props.selectMode) {
      warningMessagesForSelectDraw = this.nls('emptySelectStateWarning')
    }

    if (this.props.drawMode && this.props.chartRender) {
      infoMsgWhileSelectingOrDrawing = this.nls('infoMsgWhileDrawing')
    } else if (this.props.selectMode && this.props.chartRender) {
      infoMsgWhileSelectingOrDrawing = this.props.isNewSegmentsForSelection && this.props.noGraphicAfterFirstSelection ? this.nls('infoMsgWhileSelecting') : this.nls('addToSelectionWarning')
    }

    //display error message when no features found for selection
    const noFeaturesErrorDisplay = this.nls('noFeaturesFound')

    const settingsOptions = this.settingsOptionsRender()
    const statsRender = this.statisticsDisplay()
    const exportInfoRender = this.exportOptionDisplay()

    return <div className={'h-100 w-100'} css={getContainerStyle(this.props.theme)}>
      <div style={{ height: 35 }} className={'ep-widget-header d-flex w-100'}>
        <div className={'align-items-center w-100 pt-1'} style={{ display: 'inline-block' }}>
          <Button role={'button'} aria-label={this.nls('settingsOptions')} aria-haspopup={'dialog'} title={this.nls('settingsOptions')} icon
            id={'settingsOptions' + this.props.widgetId} className={'chart-actions'}
            color={this.state.settingsOptionsOpen ? 'primary' : 'default'}
            size={'sm'} type='default' onClick={this.toggleSettings}>
            <Icon size={16} icon={epIcon.settingsIcon} />
          </Button>

          {this.state.allowExport && this.props.chartRender && ((this.props.drawMode && this.props.onDrawingComplete) ||
          (this.props.selectMode)) &&
            <Button role={'button'} aria-label={this.nls('chartExport')} aria-haspopup={'dialog'} title={this.nls('chartExport')} icon
              id={'export' + this.props.widgetId} className={'chart-actions'} color={this.state.isExport ? 'primary' : 'default'}
              size={'sm'} type='default' onClick={this.toggleExport}>
              <Icon size={16} icon={exportIcon} />
            </Button>
          }

          {this.props.chartRender &&
            <React.Fragment>
              <Button role={'button'} aria-label={this.nls('chartFlip')} title={this.nls('chartFlip')} icon
                className={'chart-actions'} color={this.state.isFlipChart ? 'primary' : 'default'}
                size={'sm'} type='default' onClick={this.onChartFlip}>
                <Icon size={16} icon={epIcon.flipIcon} />
              </Button>

            {this.state.displayStats &&
              <Button role={'button'} aria-label={this.nls('chartStatistics')} aria-haspopup={'dialog'} title={this.nls('chartStatistics')} icon
                id={'statistics' + this.props.widgetId} className={'chart-actions'}
                color={this.state.statisticsOpen ? 'primary' : 'default'}
                size={'sm'} type='default' onClick={this.toggleStatistics}>
                <Icon size={16} icon={epIcon.chartIcon} />
              </Button>
            }
            </React.Fragment>
          }

          {this.state.settingsOptionsOpen &&
            settingsOptions
          }

          {this.state.isExport &&
            exportInfoRender
          }

          {this.state.statisticsOpen &&
            statsRender
          }
        </div>
      </div>

      <div className={classNames('ep-widget-bodyContainer d-flex w-100', this.props.chartRender ? '' : 'align-items-center')}>
        <div className={classNames('w-100', this.props.chartRender ? '' : 'alignInfo align-items-center', this.props.noFeaturesFoundError ? 'alignInfo align-items-center' : '')}>
          {!this.props.displayLoadingIndicator &&
            <React.Fragment>
              {!this.props.chartRender && !this.state.noFeaturesError && !this.state.noValidInput &&
                <div tabIndex={0} ref={this._alertElement} aria-label={infoMessagesForSelectDraw}>
                  <Alert className={'mb-4 w-100 userInfo py-1'}
                    open={!this.props.chartRender && !this.state.noFeaturesError && !this.state.noValidInput}
                    text={infoMessagesForSelectDraw}
                    type={'info'}
                    withIcon
                  />
                </div>
              }
              {this.state.emptyStateIfDoneClick && !this.props.chartRender && !this.state.noFeaturesError && !this.state.noValidInput &&
                <Alert tabIndex={0} className={'w-100 userInfo py-1'}
                  open={this.state.emptyStateIfDoneClick && !this.props.chartRender && !this.state.noFeaturesError && !this.state.noValidInput}
                  text={warningMessagesForSelectDraw}
                  type={'warning'}
                  withIcon
                />
              }

              {this.state.noFeaturesError &&
                <Alert tabIndex={0} className={'w-100 userInfo py-1'}
                  open={this.state.noFeaturesError}
                  text={noFeaturesErrorDisplay}
                  type={'warning'}
                  withIcon
                />
              }

              {this.state.noValidInput &&
                <Alert tabIndex={0} className={'w-100 userInfo py-1'}
                  open={this.state.noValidInput}
                  text={this.state.viewModelErrorMsg}
                  type={'warning'}
                  withIcon
                />
              }
            </React.Fragment>
          }

          {(this.props.chartRender || this.state.exportData) &&
            <ProfileChart
              intl={this.props.intl}
              isExportEnable={this.state.exportData}
              parentWidgetId={this.props.widgetId}
              isSelectModeActive={this.props.selectMode}
              commonGeneralSettings={this.props.commonDsGeneralSettings}
              activeDs={this.props.activeDataSource}
              currentConfig={this.props.activeDatasourceConfig}
              theme={this.props.theme}
              selectedLinearUnit={this.state.selectedLinearUnit}
              selectedElevationUnit={this.state.selectedElevationUnit}
              showVolumetricObj={this.state.showViewLineGraph}
              volumetricObjLineStyle={this.state.volumetricObjStyle}
              volumetricObjLabel={this.state.volumetricObjLabel}
              chartDataUpdateTime={this.props.chartDataUpdateTime}
              profileResult={this.props.profileResult}
              unitOptions={this.state.unitOptions}
              highlightChartPositionOnMap={this.highlightChartPosition.bind(this)}
              hideChartPosition={this.hideChartPosition.bind(this)}
              chartInfo={this.getChartInfo.bind(this)}
              toggleLegendSeriesState={this.onToggleSeries}
              isFlip={this.state.isFlipChart}
              isUniformChartScalingEnable={this.state.isUniformScalingEnable}
              drawingLayer={this.props.drawingLayer}
              intersectionHighlightLayer={this.props.intersectionHighlightLayer}
              mapView={this.props.jimuMapView}
              assetIntersectionResult={this.props.intersectionResult}
              setExportButton={this.setExportButtonState}
              isCustomIntervalEnabled={this.state.isCustomizeInterval}
              customDistanceInterval={this.state.distanceInterval}
              addedElelvationProfileLayers={this.state.addedElevationLayers}
              profileSettingsForNewAddedLayer={this.state.profileSettingsForNewlyAddedLayers}
            />
          }
        </div>
        {this.props.displayLoadingIndicator &&
          <React.Fragment>
            <Loading className='loading-scrim' type={LoadingType.Donut} />
            {this.props.selectMode && <Button role={'button'} aria-label={this.nls('cancel')} title={this.nls('cancel')}
              size={'default'} type='default' className={'cancel-button-pos'} onClick={this.props.cancelButtonClicked}>
              {this.nls('cancel')}
            </Button>}
          </React.Fragment>
        }
      </div>

      <div className={'floatingInfoMsg'}>
        {!this.state.enableForNewProfile && this.props.chartRender &&
          <React.Fragment>
            <div title={infoMsgWhileSelectingOrDrawing}>
              <Alert tabIndex={0} className={classNames('alignDismissibleInfo py-1', this.state.dismissInfoMsg ? 'showMessage' : 'hideMessage')}
                onClose={this.dismissInfoMsg}
                open={this.state.dismissInfoMsg}
                text={infoMsgWhileSelectingOrDrawing}
                type={'info'}
                withIcon
                closable
              />
            </div>
            <div title={infoMsgWhileSelectingOrDrawing}>
              <Alert tabIndex={0} className={classNames('alignDismissibleInfo py-1', this.state.dismissWarningMsg ? 'showMessage' : 'hideMessage')}
                onClose={this.dismissWarningMsg}
                open={this.state.dismissWarningMsg}
                text={infoMsgWhileSelectingOrDrawing}
                type={'warning'}
                withIcon
                closable
              />
            </div>
          </React.Fragment>
        }
      </div>

      <div className={'ep-widget-footer'}>
        <div className={'w-100 footer-display'}>
          <Button role={'button'} aria-label={this.nls('backButtonLabel')} title={this.nls('backButtonLabel')}
            className={'m-1 text-break'} size={'default'} type='tertiary' onClick={this.props.onNavBack}>
            <Icon size={16} autoFlip icon={epIcon.arrowNavBack} />
            {this.nls('backButtonLabel')}
          </Button>

          {this.props.commonDsGeneralSettings?.buttonStyle === ButtonTriggerType.IconText &&
            <Button role={'button'} aria-label={this.nls('doneButtonLabel')} title={this.nls('doneButtonLabel')}
              className={this.state.enableForNewProfile || this.props.onDrawingComplete || this.state.noValidInput ||
                (this.props.selectMode && this.props.chartRender && !this.props.isNewSegmentsForSelection)
                ? 'hidden'
                : 'm-1 actionButton text-break'}
              size={'default'} type='primary' onClick={this.onDoneClick}>
              <React.Fragment>
                <Icon size={16} icon={epIcon.doneIcon} />
                {this.nls('doneButtonLabel')}
              </React.Fragment>
            </Button>
          }

          {this.props.chartRender && this.props.commonDsGeneralSettings?.buttonStyle === ButtonTriggerType.IconText &&
            <React.Fragment>
              <Button role={'button'} aria-label={this.nls('clearButtonLabel')} title={this.nls('clearButtonLabel')}
                className={this.state.enableForNewProfile || this.props.onDrawingComplete ||
                  (this.props.selectMode && this.props.chartRender && !this.props.isNewSegmentsForSelection)
                  ? 'hidden'
                  : 'm-1 actionButton text-break'}
                size={'default'} type='default' onClick={this.onClearButtonClick}>
                <Icon size={16} icon={epIcon.clearIcon} />
                {this.nls('clearButtonLabel')}
              </Button>
            </React.Fragment>
          }

          {(this.state.enableForNewProfile || this.props.onDrawingComplete || this.state.noValidInput ||
            (this.props.selectMode && this.props.chartRender && !this.props.isNewSegmentsForSelection)) &&
            this.props.commonDsGeneralSettings?.buttonStyle === ButtonTriggerType.IconText &&
            <Button role={'button'} aria-label={this.nls('newProfileButtonLabel')} title={this.nls('newProfileButtonLabel')}
              className={'m-1 actionButton text-break'} size={'default'} type='primary' onClick={this.onNewProfileClick}>
              <React.Fragment>
                <Icon size={16} icon={this.props.drawMode ? epIcon.drawIcon : epIcon.selectIcon} />
                {this.nls('newProfileButtonLabel')}
              </React.Fragment>
            </Button>
          }
        </div>
      </div>
    </div>
  }
}
