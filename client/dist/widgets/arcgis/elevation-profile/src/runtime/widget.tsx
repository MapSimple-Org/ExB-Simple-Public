/* eslint-disable no-prototype-builtins */
/** @jsx jsx */
import {
  React, type AllWidgetProps, BaseWidget, jsx, classNames, getAppStore, WidgetState, AppMode, type IMState, type DataRecord,
  DataSourceManager, DataSourceStatus, type FeatureLayerQueryParams, type QueriableDataSource, type DataSource, geometryUtils,
  DataSourceSelectionMode, type IMDataSourceInfo, UrlManager, urlUtils, DataSourceComponent, lodash, DataSourceTypes, type SubtypeGroupLayerDataSource,
  Immutable, type SubtypeSublayerDataSource, BrowserSizeMode, type FeatureLayerDataSource, type FeatureDataRecord,
  MessageManager,
  DataRecordsSelectionChangeMessage
} from 'jimu-core'
import {
  WidgetPlaceholder, Card, CardBody, Button, Icon,
  defaultMessages as jimuUIDefaultMessages,
  Loading,
  LoadingType,
  Paper
} from 'jimu-ui'
import { type IMConfig, ButtonTriggerType, type AssetBufferIntersection, type LayerIntersectionInfo, type IntersectionResult, type ElevationLayersInfo, type ProfileLayersSettings, type SelectionModeOptions } from '../config'
import { JimuMapViewComponent, type JimuMapView, type JimuLayerView } from 'jimu-arcgis'
import { getStyle } from './lib/style'
import ResultPane from './components/results-pane'
import defaultMessages from './translations/default'
import { getRuntimeIcon, epStatistics, defaultElevationLayer, ElevationProfileErrorState, unitOptions, ElevationProfileStatisticsName, getReverseStatsOnFlip } from './constants'
import { getAllLayersFromDataSource, defaultSelectedUnits, getPortalSelfElevationUnits, getPortalSelfLinearUnits, getRandomHexColor, getUseDataSourcesForAllDs } from '../common/utils'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import Graphic from 'esri/Graphic'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import type Point from 'esri/geometry/Point'
import Extent from 'esri/geometry/Extent'
import * as geodeticLengthOperator from 'esri/geometry/operators/geodeticLengthOperator'
import * as simplifyOperator from 'esri/geometry/operators/simplifyOperator'
import * as intersectionOperator from 'esri/geometry/operators/intersectionOperator'
import * as intersectsOperator from 'esri/geometry/operators/intersectsOperator'
import ElevationProfileViewModel from 'esri/widgets/ElevationProfile/ElevationProfileViewModel'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import ElevationLayer from 'esri/layers/ElevationLayer'
import * as jsonUtils from 'esri/symbols/support/jsonUtils'
import Polyline from 'esri/geometry/Polyline'
import SpatialReference from 'esri/geometry/SpatialReference'
import unitUtils from 'esri/core/unitUtils'
import Color from 'esri/Color'
import FeatureLayer from 'esri/layers/FeatureLayer'
import { convertSingle } from '../common/unit-conversion'
import * as promiseUtils from 'esri/core/promiseUtils'
import { versionManager } from '../version-manager'
import { defaultElevationLayerSettings, defaultProfileSettings, SelectionMode } from '../setting/constants'

const { epIcon } = getRuntimeIcon()

const defaultPointSymbol = {
  style: 'esriSMSCircle',
  color: [0, 0, 128, 128],
  name: 'Circle',
  outline: {
    color: [0, 0, 128, 255],
    width: 1
  },
  type: 'esriSMS',
  size: 18
}

interface ExtraProps {
  appMode: AppMode
  browserSizeMode: BrowserSizeMode
  selectedFeatureRecords: DataRecord[]
  currentPageId: string
  mapSelectionHighlightColor: string
}

interface IState {
  initialStage: boolean
  resultStage: boolean
  selectModeActive: boolean
  addToSelectionTool: boolean
  drawModeActive: boolean
  onDrawingComplete: boolean
  currentDatasource: string
  currentSketchVM: SketchViewModel
  jimuMapView: JimuMapView
  startChartRendering: boolean
  addedElevationLayers: ElevationLayersInfo[]
  groundLayerId: string
  graphicsHighlightColor: string
  selectionModeOptions: SelectionModeOptions
  profileResult: any
  selectedLinearUnit: string
  selectedElevationUnit: string
  noFeaturesError: boolean
  profileLineLayers: any
  lineLayersNotFound: boolean
  viewModelErrorState: boolean
  profileErrorMsg: string
  noGraphicAfterFirstSelection: boolean
  onWidgetLoadShowLoadingIndicator: boolean
  loadingIndicator: boolean
  nextPossibleloadingIndicator: boolean
  selectedFeatureRecord: any
  intersectionResult: LayerIntersectionInfo[]
  chartDataUpdateTime: number
  isMapLoaded: boolean
  layersLoaded: boolean
  dsToGetSelectedOnLoad: string
  newAddedLayer: string[]
  profileSettingsForNewAddedLayer: ProfileLayersSettings[]
  updatedSelectableLayersAtRuntime: string[]
  isCancelButtonClick: boolean
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig> & ExtraProps, IState> {
  private _drawingLayer: GraphicsLayer
  private _intersectionHighlightLayer: GraphicsLayer
  private _nextPossibleSelectionLayer: GraphicsLayer
  private _bufferLayer: GraphicsLayer
  private _mapView: JimuMapView
  private _selectedUnit: [string, string]
  private _defaultViewModel: ElevationProfileViewModel
  private _selectableLayersAtRuntime: string[]
  private _intersectingLayersAtRuntime: string[]
  private _isSelectableLayersChangedAtRuntime: boolean
  private readonly _defaultConfig
  private _newFeatureSelection: boolean
  private _activeCurrentDs: string
  private _selectedBufferValues: AssetBufferIntersection
  private _bufferGraphics: Graphic
  private _resultsAfterIntersectionTimeout = null
  private _abortController: AbortController
  private _addedNewLayerOnMap: string[]
  private _defaultProfileSettingsForNewAddedLayer: ProfileLayersSettings[]
  private _addedLayerAfterWidgetLoaded: boolean
  private _jimuLayerViewRemovedListener: any
  private _prevJimuMapView: JimuMapView
  private _selectedRecordsDsId: string[]
  private _selectedFeaturesRecords: FeatureDataRecord[]

  static versionManager = versionManager
  static mapExtraStateProps = (state: IMState,
    props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      appMode: state.appRuntimeInfo?.appMode,
      browserSizeMode: state.browserSizeMode,
      selectedFeatureRecords: props?.mutableStateProps?.selectedFeatureRecords,
      currentPageId: state.appRuntimeInfo?.currentPageId,
      mapSelectionHighlightColor: state.appConfig?.widgets?.[props.useMapWidgetIds?.[0]]?.config?.selectionHighlightColor
    }
  }

  constructor (props) {
    super(props)
    this._defaultConfig = this.createDefaultConfigForDataSource()
    this._newFeatureSelection = false
    //create all graphic layers for drawing, highlighting etc.
    this.createDrawingLayers()
    this._activeCurrentDs = 'default'
    this._selectableLayersAtRuntime = []
    this._intersectingLayersAtRuntime = []
    this._isSelectableLayersChangedAtRuntime = false
    this._defaultViewModel = null
    this._selectedBufferValues = null
    const activeDsConfig = this.props.config.configInfo[this.props.config.activeDataSource]
    this._selectedUnit = defaultSelectedUnits(activeDsConfig, this.props.portalSelf)
    this._bufferGraphics = null
    this._addedNewLayerOnMap = []
    this._defaultProfileSettingsForNewAddedLayer = []
    this._addedLayerAfterWidgetLoaded = false
    this._jimuLayerViewRemovedListener = null
    this._prevJimuMapView = null
    this._selectedRecordsDsId = []
    this._selectedFeaturesRecords = []
    this.state = {
      initialStage: true,
      resultStage: false,
      selectModeActive: this.props.config.generalSettings?.isSelectToolActive,
      addToSelectionTool: false,
      drawModeActive: this.props.config.generalSettings?.isDrawToolActive,
      onDrawingComplete: false,
      currentDatasource: this.props.config.activeDataSource,
      currentSketchVM: null,
      jimuMapView: null,
      startChartRendering: false,
      addedElevationLayers: activeDsConfig?.elevationLayersSettings?.addedElevationLayers,
      groundLayerId: activeDsConfig?.elevationLayersSettings?.groundLayerId,
      graphicsHighlightColor: this.props.mapSelectionHighlightColor || '#00ffff',
      selectionModeOptions: activeDsConfig?.profileSettings?.selectionModeOptions,
      profileResult: null,
      selectedLinearUnit: this._selectedUnit[1],
      selectedElevationUnit: this._selectedUnit[0],
      noFeaturesError: false,
      profileLineLayers: [],
      lineLayersNotFound: !((this.canShowSelectAndDrawOptions(activeDsConfig) &&
       this.canShowProfilingForBackward(activeDsConfig) && activeDsConfig.profileSettings.layers.length !== 0) ||
        (this.canShowSelectAndDrawOptions(activeDsConfig) && !this.canShowProfilingForBackward(activeDsConfig))),
      viewModelErrorState: false,
      profileErrorMsg: '',
      noGraphicAfterFirstSelection: false,
      onWidgetLoadShowLoadingIndicator: true,
      loadingIndicator: false,
      nextPossibleloadingIndicator: false,
      selectedFeatureRecord: null,
      intersectionResult: null,
      chartDataUpdateTime: 0,
      isMapLoaded: false,
      layersLoaded: false,
      dsToGetSelectedOnLoad: '',
      newAddedLayer: [],
      profileSettingsForNewAddedLayer: [],
      updatedSelectableLayersAtRuntime: [],
      isCancelButtonClick: false
    }
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

  createDrawingLayers = () => {
    //create new graphicsLayer to draw lines
    this._drawingLayer = new GraphicsLayer({
      listMode: 'hide',
      effect: 'bloom(0.8, 1px, 0)'
    })

    //create new graphicsLayer to show next possible selections
    this._nextPossibleSelectionLayer = new GraphicsLayer({
      listMode: 'hide',
      effect: 'bloom(0.8, 0px, 1%)'
    })

    //create new graphicsLayer to show buffer graphics
    this._bufferLayer = new GraphicsLayer({
      listMode: 'hide'
    })

    //create new graphicsLayer to show highlight intersecting features
    this._intersectionHighlightLayer = new GraphicsLayer({
      listMode: 'hide',
      effect: 'bloom(0.8, 1px, 0)'
    })
  }

  componentDidMount = async () => {
    if (!geodeticLengthOperator.isLoaded()) {
      await geodeticLengthOperator.load()
    }
    this.setState({
      noFeaturesError: false,
      viewModelErrorState: false
    })
  }

  //wait for all the jimu layers and dataSource loaded
  waitForChildDataSourcesReady = async (mapView: JimuMapView): Promise<DataSource> => {
    await mapView?.whenAllJimuLayerViewLoaded()
    const ds = DataSourceManager.getInstance().getDataSource(mapView?.dataSourceId)
    if (ds?.isDataSourceSet() && !ds.areChildDataSourcesCreated()) {
      await ds.childDataSourcesReady()
    }
    return Promise.resolve(ds)
  }

  //create data source by id for only configured selectable and intersecting layers and wait for only those layers to load
  loadConfiguredDataSources = (currentDataSourceId: string): Array<Promise<DataSource>> => {
    const mapDs = DataSourceManager.getInstance().getDataSource(currentDataSourceId)
    const createdDs = []
    const uniqueUsedDsId = []
    this.props.config?.configInfo?.[currentDataSourceId]?.profileSettings?.layers?.forEach((inidividualLayer) => {
      !uniqueUsedDsId.includes(inidividualLayer.layerId) && uniqueUsedDsId.push(inidividualLayer.layerId)
    })
    this.props.config?.configInfo?.[currentDataSourceId]?.assetSettings?.layers?.forEach((inidividualLayer) => {
      !uniqueUsedDsId.includes(inidividualLayer.layerId) && uniqueUsedDsId.push(inidividualLayer.layerId)
    })
    uniqueUsedDsId.forEach((dsId) => {
      createdDs.push(new Promise((resolve, reject) => {
        try {
          mapDs?.isDataSourceSet() && mapDs?.createDataSourceById(dsId).then((ds) => {
            resolve(ds)
          }, () => {
            resolve(null)
          })
        } catch {
          resolve(null)
        }
      }))
    })
    return createdDs
  }

  //Get selected feature record
  getSelectedFeatureRecords = (currentDs: string) => {
    let selectedFeatureRecord = []
    const allDataSources = getAllLayersFromDataSource(currentDs)
    allDataSources?.forEach(async (layer) => {
      await layer.ready()
      if (layer.getSelectedRecords().length > 0) {
        selectedFeatureRecord = layer.getSelectedRecords()
        let isFeatureValid = false
        const dsLayerId = selectedFeatureRecord?.[0]?.dataSource.getMainDataSource().id
        if (selectedFeatureRecord?.[0].feature) {
          this.getSelectableLayers(this.state.currentDatasource)
          if (selectedFeatureRecord?.[0].feature?.geometry?.type === 'polyline' && this._selectableLayersAtRuntime.includes(dsLayerId)) {
            isFeatureValid = true
          }
        }
        if (isFeatureValid) {
          //Show profile on app load if feature is preselected
          this.displayFeaturesResult(dsLayerId, [selectedFeatureRecord?.[0]?.feature])
          return true
        }
      }
    })
  }

  onDataSourceInfoChange = (info: IMDataSourceInfo) => {
    if (info?.selectedIds?.length) {
      let selectedFeatureRecord = []
      const dsLayer = DataSourceManager.getInstance().getDataSource(this.state.dsToGetSelectedOnLoad)
      selectedFeatureRecord = dsLayer.getSelectedRecords()
      //Show profile on app load if feature is preselected
      if (selectedFeatureRecord?.length > 0) {
        //get the complete feature in map SR and then display result
        this.getFeatureFromLayer(this.state.dsToGetSelectedOnLoad, selectedFeatureRecord[0].getId()).then((feature) => {
          this.displayFeaturesResult(this.state.dsToGetSelectedOnLoad, [feature])
          this.setState({
            dsToGetSelectedOnLoad: ''
          })
        })
      }
    }
  }

  getSelectedFeatureOnLoad = async () => {
    const urlManager = UrlManager.getInstance()
    const dsInfos = urlUtils.getDataSourceInfosFromUrlParams(urlManager.getQueryObject(), urlManager.getHashObject())
    for (const dsLayerId in dsInfos) {
      let selectedLayerDsId = dsLayerId
      const layerDataSource = DataSourceManager.getInstance().getDataSource(dsLayerId)
      if (layerDataSource?.type === DataSourceTypes.SubtypeGroupLayer) {
        //get the sublayer datasource by record id
        const subLayerDataSource = await (layerDataSource as SubtypeGroupLayerDataSource).getSublayerDataSourceByRecordId((dsInfos[dsLayerId]?.selection as any).ids[0])
        selectedLayerDsId = subLayerDataSource.id
      }
      if (this._selectableLayersAtRuntime.includes(selectedLayerDsId)) {
        const selection = dsInfos[dsLayerId]?.selection as any
        if (selection?.ids?.length || selection?.queryParams?.geometry || selection?.queryParams?.where) {
          this.setState({
            dsToGetSelectedOnLoad: selectedLayerDsId
          })
          break
        }
      }
    }
  }

  activeViewChangeHandler = async (jmv: JimuMapView) => {
    //reset the newly added infos when active view changes
    this._addedNewLayerOnMap = []
    this._defaultProfileSettingsForNewAddedLayer = []
    this.setState({
      newAddedLayer: [],
      profileSettingsForNewAddedLayer: [],
      updatedSelectableLayersAtRuntime: this._selectableLayersAtRuntime
    })
    if (!(jmv && jmv.view)) {
      this.setState({
        initialStage: false,
        resultStage: false
      })
      return
    }
    this._mapView = jmv
    if (this.state.jimuMapView) {
      // we have a 'previous' map where we added the widget
      // (ex: case where two Maps in single Experience page and user is switching
      // between them in the dropdown) - we must destroy the old widget in this case.
      // destroy the sketch view modal if it was still not destroyed
      // this will resolve the cross origin issue with react
      if (this.state.currentSketchVM && !this.state.currentSketchVM.destroyed) {
        this.state.currentSketchVM.destroy()
      }
      //Once the data source is changed, clear the chart and map graphics and set widget to initial stage
      this.clearAll()
      this.setState({
        initialStage: true,
        resultStage: false,
        drawModeActive: this.props.config.generalSettings?.isDrawToolActive,
        selectModeActive: this.props.config.generalSettings?.isSelectToolActive
      })
      //destroy prev drawing layers and create new for changed map view
      this.destroyDrawingLayers()
      this.createDrawingLayers()
    }

    this.setState({
      onWidgetLoadShowLoadingIndicator: true,
      layersLoaded: false
    })
    try {
      if (this.props.config?.configInfo?.[jmv?.dataSourceId]?.profileSettings.isCustomizeOptionEnabled) {
        await Promise.all(this.loadConfiguredDataSources(jmv.dataSourceId))
      } else {
        await this.waitForChildDataSourcesReady(this._mapView)
      }
    } catch (e) {
      console.error(e)
    }
    this.setState({
      onWidgetLoadShowLoadingIndicator: false,
      layersLoaded: true
    })
    if (jmv) {
      this.setState({
        jimuMapView: jmv
      }, () => {
        //If no configuration found for selected data source
        //create and use the default configuration
        //this will allow user to use the widget with basic draw tool
        if (jmv.dataSourceId === '') {
          this.setState({
            currentDatasource: 'default'
          }, () => {
            this._activeCurrentDs = this.state.currentDatasource
            //set default Units
            this._selectedUnit = defaultSelectedUnits(this.props.config.configInfo[this.state.currentDatasource], this.props.portalSelf)
            this.getSelectableLayers(this.state.currentDatasource)
          })
        } else if (this.state.jimuMapView.dataSourceId !== this.props.config.activeDataSource || !this.props.config.configInfo[this.props.config.activeDataSource]) {
          this.setState({
            currentDatasource: this.state.jimuMapView.dataSourceId
          }, () => {
            this._activeCurrentDs = this.state.currentDatasource
            this.getSelectableLayers(this.state.currentDatasource)
          })
          this.checkLineLayerAvailableInDsAndConfig(this.state.jimuMapView.dataSourceId)
        } else if (this.props.config.activeDataSource &&
            this.props.config.configInfo[this.props.config.activeDataSource]) {
          let configDs = this.props.config.activeDataSource
          if (this.state.jimuMapView && this.state.jimuMapView.dataSourceId) {
            if (this.props.config.configInfo.hasOwnProperty(this.state.jimuMapView.dataSourceId)) {
              configDs = this.state.jimuMapView.dataSourceId
            } else {
              configDs = 'default'
            }
            this.setState({
              currentDatasource: configDs
            }, () => {
              this._activeCurrentDs = this.state.currentDatasource
              if (this.state.currentDatasource !== 'default') {
                this.checkLineLayerAvailableInDsAndConfig(this.state.currentDatasource)
              }
              this.setConfigForDataSources()
              this.getSelectableLayers(this.state.currentDatasource)
            })
          }
        }

        setTimeout(() => {
          const elevationInfo = {
            mode: this.state.jimuMapView.view?.type === '3d' ? 'relative-to-ground' : 'on-the-ground',
            offset: null
          }
          this._drawingLayer.set('elevationInfo', elevationInfo)
          this._nextPossibleSelectionLayer.set('elevationInfo', elevationInfo)
          this.state.jimuMapView.view.map.addMany([this._bufferLayer, this._nextPossibleSelectionLayer, this._drawingLayer, this._intersectionHighlightLayer])
          this.createApiWidget(jmv)
          this.createEpViewModel(jmv)
          //check the widget state whether open/close in live view
          const currentWidgetState = getAppStore().getState().widgetsRuntimeInfo[this.props.id].state
          const loadSelectOrDrawTool = true
          if (loadSelectOrDrawTool && (currentWidgetState === WidgetState.Opened || !currentWidgetState)) {
            this.loadSelectDrawToolOnLoad(this._activeCurrentDs)
          }
          this.getSelectedFeatureOnLoad()

          this._addedLayerAfterWidgetLoaded = false

          if (this._prevJimuMapView) {
            this._jimuLayerViewRemovedListener && this._prevJimuMapView.removeJimuLayerViewRemovedListener(this._jimuLayerViewRemovedListener)
          }
          this._prevJimuMapView = jmv

          //on layerview create support all line layers added through the Add Data widget or generated by other widget
          //validate the newly added layer with the layer from the jimulayerviews
          jmv.view?.on('layerview-create', event => {
            this.getValidAddedLayers(jmv)
          })

          this._jimuLayerViewRemovedListener = (jimuLayerView: JimuLayerView) => {
            this.onJimuLayerViewRemove(jimuLayerView)
          }
          //when JimuLayerView is removed from JimuMapView then remove all the added layer from the selectable layers
          jmv.addJimuLayerViewRemovedListener(this._jimuLayerViewRemovedListener)

          //if layer added before widget loaded
          if (!this._addedLayerAfterWidgetLoaded) {
            this.getValidAddedLayers(jmv)
          }
        }, 100)
      })
    }
  }

  onJimuLayerViewRemove = (jimuLayerView: JimuLayerView) => {
    if (this.isSupportAddedLayers()) {
      const selectedLayerIds = []
      const addedNewLayerIds = [...this._addedNewLayerOnMap]
      const profileSettingsForNewLayer = [...this._defaultProfileSettingsForNewAddedLayer]
      this._drawingLayer.graphics?.forEach((graphics) => {
        if (graphics.attributes.esriCTFeatureLayerId) {
          selectedLayerIds.push(graphics.attributes.esriCTFeatureLayerId)
        }
      })
      const layerDs = DataSourceManager.getInstance().getDataSource(jimuLayerView.layerDataSourceId) as FeatureLayerDataSource | SubtypeSublayerDataSource
      if (layerDs.type === DataSourceTypes.FeatureLayer || layerDs.type === DataSourceTypes.SubtypeSublayer) {
        if (layerDs?.getLayerDefinition()?.geometryType === 'esriGeometryPolyline') {
          this._addedLayerAfterWidgetLoaded = true
          addedNewLayerIds.includes(layerDs.id) && addedNewLayerIds.splice(addedNewLayerIds.indexOf(layerDs.id), 1)
          this._defaultProfileSettingsForNewAddedLayer?.forEach((layerSetting, index) => {
            if (layerSetting.layerId === layerDs.id) {
              profileSettingsForNewLayer.splice(index, 1)
            }
          })
          this._defaultProfileSettingsForNewAddedLayer = profileSettingsForNewLayer
          this._addedNewLayerOnMap = addedNewLayerIds
        }
      }
      if (selectedLayerIds.length) {
        // eslint-disable-next-line array-callback-return
        selectedLayerIds?.some((esriCTFeatureLayerId) => {
          if (!this._addedNewLayerOnMap.includes(esriCTFeatureLayerId)) {
            //reset the chart and graphics when selected added layer is removed from the map
            this.onBackClick()
            return true
          }
        })
      }

      this.setState({
        newAddedLayer: this._addedNewLayerOnMap,
        profileSettingsForNewAddedLayer: this._defaultProfileSettingsForNewAddedLayer,
        updatedSelectableLayersAtRuntime: this.getUpdatedSelectableLayers()
      }, () => {
        if (!this._addedNewLayerOnMap.length) {
          this.getSelectableLayers(this.state.currentDatasource)
          if (!this.getUpdatedSelectableLayers().length) {
            this.clearAll()
            this.setState({
              initialStage: true,
              startChartRendering: false,
              onDrawingComplete: false,
              resultStage: false,
              drawModeActive: false,
              selectModeActive: false
            })
          }
          this.setState({
            updatedSelectableLayersAtRuntime: this.getUpdatedSelectableLayers()
          })
        }
      })
    }
  }

  getUpdatedSelectableLayers = () => {
    return this._selectableLayersAtRuntime.concat(this._addedNewLayerOnMap).filter((layer, index, self) => self.indexOf(layer) === index)
  }

  getValidAddedLayers = (jmv: JimuMapView) => {
    if (this.isSupportAddedLayers()) {
      this._addedNewLayerOnMap = []
      this._defaultProfileSettingsForNewAddedLayer = []
      this.getAllAddedJimuLayerViews(jmv)?.forEach((layer) => {
        if (layer) {
          const layerDs = DataSourceManager.getInstance().getDataSource(layer.layerDataSourceId) as FeatureLayerDataSource | SubtypeSublayerDataSource
          if (layerDs.type === DataSourceTypes.FeatureLayer || layerDs.type === DataSourceTypes.SubtypeSublayer) {
            if (layerDs?.getLayerDefinition()?.geometryType === 'esriGeometryPolyline' && !this._addedNewLayerOnMap.includes(layerDs.id)) {
              this._addedLayerAfterWidgetLoaded = true
              //create an array of newly added layer's id and the default profile settings config
              this.getInfoForNewAddedLayer(layerDs)
            }
          } else {
            const allDs = getAllLayersFromDataSource(layer.layerDataSourceId)
            allDs?.forEach((ds: FeatureLayerDataSource | SubtypeSublayerDataSource) => {
              if (ds?.getLayerDefinition()?.geometryType === 'esriGeometryPolyline' && !this._addedNewLayerOnMap.includes(ds.id)) {
                this._addedLayerAfterWidgetLoaded = true
                //create an array of newly added layer's id and the default profile settings config
                this.getInfoForNewAddedLayer(ds)
              }
            })
          }
        }
      })
      this.setState({
        newAddedLayer: this._addedNewLayerOnMap,
        profileSettingsForNewAddedLayer: this._defaultProfileSettingsForNewAddedLayer,
        updatedSelectableLayersAtRuntime: this._selectableLayersAtRuntime.concat(this._addedNewLayerOnMap)
      })
    }
  }

  isSupportAddedLayers = (): boolean => {
    let supportAddedLayers = false
    const activeDsConfigInfo = this.props.config.configInfo[this.state.currentDatasource]
    if ((activeDsConfigInfo?.hasOwnProperty('advanceOptions') ||
      (activeDsConfigInfo?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled')))) {
      if ((activeDsConfigInfo?.advanceOptions || activeDsConfigInfo?.profileSettings?.isProfileSettingsEnabled) &&
        activeDsConfigInfo?.profileSettings?.supportAddedLayers) {
        supportAddedLayers = true
      }
    }
    return supportAddedLayers
  }

  getAllAddedJimuLayerViews = (jimuMapView: JimuMapView): JimuLayerView[] => {
    const allJimuLayerViews = jimuMapView.getAllJimuLayerViews()
    const addedJimuLayerViews = allJimuLayerViews.filter(jimuLayerView => jimuLayerView.fromRuntime)
    return addedJimuLayerViews
  }

  getInfoForNewAddedLayer = (layerDs) => {
    if (!this._addedNewLayerOnMap.includes(layerDs.id)) {
      this._addedNewLayerOnMap.push(layerDs.id)
      const defaultUnits = defaultSelectedUnits(this.props.config.configInfo[this.state.currentDatasource], this.props.portalSelf)
      let defaultElevationType = 'no elevation'
      //if layer having elevation info then set default elevation type as z
      if (layerDs.getLayerDefinition().hasZ) {
        defaultElevationType = 'z'
      }
      const defaultProfileSettingsObj = Object.assign({}, defaultProfileSettings)
      //if shape length field available in the layer use it as default distance field
      if (layerDs.layerDefinition?.hasGeometryProperties &&
        layerDs.layerDefinition?.geometryProperties?.shapeLengthFieldName) {
        defaultProfileSettingsObj.distanceSettings.field = layerDs.layerDefinition.geometryProperties.shapeLengthFieldName
      }
      const layerObject = Object.assign({}, defaultProfileSettingsObj)
      layerObject.layerId = layerDs.id
      layerObject.elevationSettings.type = defaultElevationType
      layerObject.elevationSettings.unit = defaultUnits[0]
      layerObject.distanceSettings.unit = defaultUnits[1]
      layerObject.style.lineColor = getRandomHexColor()
      this._defaultProfileSettingsForNewAddedLayer.push(Immutable(layerObject))
    }
  }

  loadSelectDrawToolOnLoad = (activeCurrentDs) => {
    //on widget load activate draw/select tool if it is enabled in config
    if (activeCurrentDs === 'default') {
      if (this.state.drawModeActive) {
        this.manageActiveDrawSelect()
      }
    } else if (this.state.drawModeActive || this.state.selectModeActive) {
      if (this.state.lineLayersNotFound && this.state.selectModeActive) {
        return
      }
      this.manageActiveDrawSelect()
    } else {
      this.setState({
        resultStage: false,
        initialStage: true
      })
    }
  }

  manageActiveDrawSelect = () => {
    this.setState({
      resultStage: true,
      initialStage: false
    }, () => {
      this.clearAll(true)
      this._displayDefaultCursor()
      this.activateDrawOrSelectTool()
    })
  }

  checkLineLayerAvailableInDsAndConfig = (activeDs: string) => {
    const allLayerSources: DataSource[] = getAllLayersFromDataSource(activeDs)
    let noLineLayerFound: boolean = true
    allLayerSources?.forEach((layer: FeatureLayerDataSource) => {
      if (layer && layer.getLayerDefinition() && layer.getLayerDefinition().geometryType &&
        layer.getLayerDefinition().geometryType === 'esriGeometryPolyline') {
        noLineLayerFound = false
      }
    })
    if (activeDs && this.props.config.configInfo[activeDs]) {
      if (this.canShowSelectAndDrawOptions(this.props.config.configInfo[activeDs])) {
        if (this.canShowProfilingForBackward(this.props.config.configInfo[activeDs])) {
          if (this.props.config.configInfo[activeDs]?.profileSettings.layers.length === 0) {
            noLineLayerFound = true
          }
        }
      } else {
        noLineLayerFound = true
      }
    } else {
      noLineLayerFound = true
    }
    this.setState({
      lineLayersNotFound: noLineLayerFound
    })
  }

  setConfigForDataSources = () => {
    const configActiveDs = this.props.config.configInfo[this.state.currentDatasource]
    const groundLayer = configActiveDs ? configActiveDs.elevationLayersSettings?.groundLayerId : this._defaultConfig.elevationLayersSettings?.groundLayerId
    this.setState({
      addedElevationLayers: configActiveDs ? configActiveDs.elevationLayersSettings?.addedElevationLayers : this._defaultConfig.elevationLayersSettings?.addedElevationLayers,
      groundLayerId: groundLayer,
      graphicsHighlightColor: this.props.mapSelectionHighlightColor || '#00ffff',
      selectionModeOptions: configActiveDs ? configActiveDs.profileSettings?.selectionModeOptions : this._defaultConfig.profileSettings.selectionModeOptions,
      selectedLinearUnit: configActiveDs ? this._selectedUnit[1] : this._defaultConfig.elevationLayersSettings?.linearUnit,
      selectedElevationUnit: configActiveDs ? this._selectedUnit[0] : this._defaultConfig.elevationLayersSettings?.elevationUnit
    })
  }

  createDefaultConfigForDataSource = () => {
    let elevationUnit = ''
    let linearUnit = ''
    const defaultElevationSettings = defaultElevationLayerSettings
    defaultElevationSettings.useDataSource = null
    defaultElevationSettings.elevationLayerUrl = defaultElevationLayer
    defaultElevationSettings.displayStatistics = true
    defaultElevationSettings.selectedStatistics = epStatistics
    defaultElevationSettings.style = {
      lineType: 'solid-line',
      lineColor: getRandomHexColor(),
      lineThickness: 2
    }
    //Fetch and set the default units based on portal settings
    elevationUnit = getPortalSelfElevationUnits(this.props.portalSelf)
    linearUnit = getPortalSelfLinearUnits(this.props.portalSelf)
    //Populate the default settings
    return {
      elevationLayersSettings: {
        addedElevationLayers: [defaultElevationSettings],
        groundLayerId: defaultElevationSettings.id,
        linearUnit: linearUnit,
        elevationUnit: elevationUnit,
        showVolumetricObjLineInGraph: false,
        volumetricObjSettingsOptions: {
          id: '',
          style: {
            lineType: 'solid-line',
            lineColor: '#cf4ccf',
            lineThickness: 2
          },
          volumetricObjLabel: this.nls('volumetricObj'),
          displayStatistics: true,
          selectedStatistics: []
        }
      }
    }
  }

  //check for the advanced option in backward compatibility when customize option is enabled or ground elevation option disabled
  canShowProfilingForBackward = (activeDsConfigInfo) => {
    let showProfiling: boolean = false
    if (activeDsConfigInfo) {
      if ((activeDsConfigInfo?.hasOwnProperty('advanceOptions') ||
      (activeDsConfigInfo?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled') &&
      activeDsConfigInfo?.profileSettings?.hasOwnProperty('isCustomizeOptionEnabled')))) {
        if (activeDsConfigInfo?.advanceOptions ||
          (activeDsConfigInfo?.profileSettings?.isProfileSettingsEnabled &&
            activeDsConfigInfo?.profileSettings?.isCustomizeOptionEnabled)) {
          showProfiling = true
        }
      }
    }
    return showProfiling
  }

  //check if the selectable layers options is enabled or disabled
  canShowSelectAndDrawOptions = (activeDsConfigInfo) => {
    let showSelectAndDrawingOption: boolean = true
    if (activeDsConfigInfo?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled')) {
      showSelectAndDrawingOption = activeDsConfigInfo.profileSettings.isProfileSettingsEnabled
    }
    return showSelectAndDrawingOption
  }

  createApiWidget = (jmv: JimuMapView) => {
    // Create a new instance of sketchViewModel
    const sketchVM = new SketchViewModel({
      view: jmv ? jmv.view : null,
      layer: new GraphicsLayer(),
      updateOnGraphicClick: false,
      defaultCreateOptions: {
        mode: 'click',
        hasZ: jmv?.view?.type === '3d'
      },
      polylineSymbol: {
        type: 'simple-line',
        color: this.state.graphicsHighlightColor,
        width: 5
      },
      pointSymbol: jsonUtils.fromJSON(defaultPointSymbol) as any,
      defaultUpdateOptions: {
        toggleToolOnClick: false
      }
    })

    sketchVM.on('create', event => {
      if (event.state === 'start') {
        const polylineSymbol = {
          type: 'simple-line',
          color: this.state.graphicsHighlightColor,
          width: 5
        }
        this.state.currentSketchVM.set('polylineSymbol', polylineSymbol)
      } else if (event.state === 'complete') {
        this.setState({
          noFeaturesError: false
        })
        if (this.state.selectModeActive) {
          this.setState({
            loadingIndicator: true
          })
          const options = {
            returnAllFields: true,
            returnFullGeometry: true,
            outSR: jmv.view?.spatialReference?.toJSON()
          }
          jmv.selectFeaturesByGraphic(event.graphic, 'intersects', DataSourceSelectionMode.New, options).then((featuresByLayer) => {
            const jimuLayerViews = Object.values(this.state.jimuMapView.jimuLayerViews)
            const featureByLayer = {}
            for (let i = 0; i < jimuLayerViews.length; i++) {
              if (featuresByLayer[jimuLayerViews[i].id]?.length > 0) {
                const layerDsId = jimuLayerViews[i].getLayerDataSource().id
                featureByLayer[layerDsId] = featuresByLayer[jimuLayerViews[i].id]
              }
            }
            this.queryForNewSelection(featureByLayer, true)
          }, (e) => {
            const error = this.getErrorMsgState(ElevationProfileErrorState.UnknownError)
            this.setState({
              loadingIndicator: false,
              viewModelErrorState: error[0],
              profileErrorMsg: error[1]
            })
          })
        }
      }
    })

    this.setState({
      currentSketchVM: sketchVM
    })

    jmv?.view?.on('click', (event) => {
      const filterLayer = this._nextPossibleSelectionLayer
      if (this.state.addToSelectionTool) {
        //stopPropagation so that info window is not shown
        event.stopPropagation()
        jmv.view.hitTest(event).then((response) => {
          // check if a feature is returned from the next possible selection layer
          // do something with the result graphic
          if (response && response.results) {
            const graphicResults = response.results.filter(r => r.type === 'graphic') as __esri.GraphicHit[]
            const results = graphicResults.filter((result) => {
              return result.graphic.layer === filterLayer &&
                result.graphic.geometry.type === 'polyline'
            })
            if (results && results.length > 0) {
              //clear profile chart
              this.clearChart()
              this._newFeatureSelection = false
              //to remove the extra selection form map view, done by system while showing info-window of selected features
              this._mapView.clearSelectedFeatures()
              this.selectFeatureForProfiling(results[0].graphic)
            }
          }
        })
      }
    })
  }

  getGroundSeriesLabel = (label: string): string => {
    let referenceLayerLabel = label
    referenceLayerLabel = this.props.intl.formatMessage({
      id: 'referenceLayerLabel',
      defaultMessage: defaultMessages.referenceLayerLabel
    }, { elevationLayerLabel: label })
    return referenceLayerLabel
  }

  createEpViewModel = (jmv, layerInfoUpdated?: boolean) => {
    if (!jmv.view) {
      return
    }
    const profiles: any = []
    //if view model present then empty all the existing profiles and create new profiles
    if (this._defaultViewModel) {
      this._defaultViewModel.profiles = profiles
    }
    const setAsGroundProfileLayer = this.state.addedElevationLayers?.filter((layerInfo) => layerInfo.id === this.state.groundLayerId)
    const normalProfileLayers = this.state.addedElevationLayers?.filter((layerInfo) => !(layerInfo.id === this.state.groundLayerId))

    //push the profile first which is set as ground in config
    if (setAsGroundProfileLayer?.length > 0) {
      if (jmv.view.type === '3d') {
        profiles.push({
          id: setAsGroundProfileLayer[0].id,
          type: 'ground', // ground Profile
          color: setAsGroundProfileLayer[0].style.lineColor,
          title: this.getGroundSeriesLabel(setAsGroundProfileLayer[0].label)
        })
      } else {
        profiles.push({
          id: setAsGroundProfileLayer[0].id,
          type: 'query', // displays elevation values from a custom source
          source: new ElevationLayer({
            url: setAsGroundProfileLayer[0].elevationLayerUrl
          }),
          color: setAsGroundProfileLayer[0].style.lineColor,
          title: this.getGroundSeriesLabel(setAsGroundProfileLayer[0].label)
        })
      }
    }

    //always push the profiles in the type query for all the layers which are not set as ground
    normalProfileLayers?.forEach((layerInfo) => {
      profiles.push({
        id: layerInfo.id,
        type: 'query', // displays elevation values from a custom source
        source: new ElevationLayer({
          url: layerInfo.elevationLayerUrl
        }),
        color: layerInfo.style.lineColor,
        title: layerInfo.label
      })
    })

    const viewProfile = this.checkForVolumetricObjects(jmv.view.type)
    if (viewProfile) {
      profiles.push(viewProfile)
    }

    //add input profile after the volumetric object
    if (jmv.view.type === '3d') {
      profiles.push({
        type: 'input', // view line Profile
        color: this.state.graphicsHighlightColor
      })
    }

    //Create new instance of ElevationProfileViewModel
    //update the exitings instance ONLY when volumetric objects are changed in all other cases create new instance
    //when volumetricObjectsChanged and _defaultViewModel is null still create new instance
    if (!this._defaultViewModel || !layerInfoUpdated) {
      this._defaultViewModel = new ElevationProfileViewModel({
        view: jmv ? jmv.view : null,
        profiles: profiles
      })
    } else if (layerInfoUpdated) {
      this._defaultViewModel.view = jmv.view
      //update the profiles
      this._defaultViewModel.profiles = profiles
      if (this._defaultViewModel.input?.geometry) {
        const abortController = new AbortController()
        this.setState({
          loadingIndicator: true,
          startChartRendering: false,
          profileResult: null,
          chartDataUpdateTime: Date.now()
        })
        reactiveUtils.whenOnce(
          () => this._defaultViewModel.progress === 1, abortController.signal)
          .then(async () => {
            const configuredGroundLayer = this.state.addedElevationLayers.filter((layerInfo) => layerInfo.id === this.state.groundLayerId)
            const isGroundProfileAvailable = this._defaultViewModel?.chartData?.lines?.filter((linesInfo) => linesInfo.id === configuredGroundLayer?.[0]?.id)
            if (this._defaultViewModel.chartData && (isGroundProfileAvailable?.length || this.onlyVolumetricConfigured())) {
              //as it takes some time to update the chart stats, after adding this timeout then only we received the updated stats
              await new Promise((resolve) => setTimeout(resolve, 500))
              this.onChartDataReady(abortController.signal)
            } else {
              this.onErrorInChartData(true, this.nls('noProfileError'))
            }
          })
      }
    }

    const defaultViewModel: any = this._defaultViewModel
    //use reactiveUtils instead of watchUtils because it was deprecated at 4.24 and the plan is to remove it at 4.27 version
    //if view model having some error in its error state while drawing/selecting to generate the profile
    reactiveUtils?.watch(() => defaultViewModel.errorState, (errorState) => {
      const error = this.getErrorMsgState(errorState)
      if (error?.length === 0 || !error) {
        return
      }
      //on error abort the operation
      this._abortController?.abort()
      this.onErrorInChartData(error[0], error[1])
    }, { initial: true })

    reactiveUtils?.watch(() => defaultViewModel.input?.geometry, async () => {
      if (defaultViewModel.input) {
        if (this.checkIfCancelClick()) {
          return
        }
        try {
          // Abort any pending async operation if the input geometry changes again in the meantime.
          this._abortController?.abort()
          const { signal } = (this._abortController = new AbortController())
          this.setState({
            loadingIndicator: !this.state.viewModelErrorState,
            onDrawingComplete: this._defaultViewModel.state === 'created'
          })
          // Wait for the profile to be finished before proceeding.
          await reactiveUtils.whenOnce(() => defaultViewModel.progress === 1, signal)
          if (this.checkIfCancelClick()) {
            return
          }
          if (signal.aborted) {
            return
          }
          //if valid chartData then only perform further operations, else show error msg and hide loading indicator
          // added to resolve issue with volumetric objects, sometimes not shown correctly for first time
          await new Promise((resolve) => setTimeout(resolve, 1500))
          if (this.checkIfCancelClick()) {
            return
          }
          if (this._defaultViewModel.chartData) {
            //check if valid data for ground is available, if not show error and return
            const configuredGroundLayer = this.state.addedElevationLayers.filter((layerInfo) => layerInfo.id === this.state.groundLayerId)
            const isGroundProfileAvailable = this._defaultViewModel?.chartData?.lines?.filter((linesInfo) => linesInfo.id === configuredGroundLayer?.[0]?.id)
            if ((isGroundProfileAvailable?.length || this.onlyVolumetricConfigured())) {
              //as it takes some time to update the chart stats, after adding this timeout then only we received the updated stats
              await new Promise((resolve) => setTimeout(resolve, 500))
              await this.onChartDataReady(signal)
            } else {
              this.onErrorInChartData(true, this.nls('noProfileError'))
            }
          } else {
            this.onErrorInChartData(true, this.state.profileErrorMsg)
          }
        } catch (e) {
          // Ignore abort errors
          if (!promiseUtils.isAbortError(e)) {
            throw new Error(e)
          }
        }
      }
    })
  }

  //check if no ground profile available and only volumetric objects is configured in webscene
  onlyVolumetricConfigured = () => {
    const configuredGroundLayer = this.state.addedElevationLayers.filter((layerInfo) => layerInfo.id === this.state.groundLayerId)
    const isGroundProfileAvailable = this._defaultViewModel?.chartData?.lines?.filter((linesInfo) => linesInfo.id === configuredGroundLayer?.[0]?.id)
    const elevationLayersSettings = this.props.config.configInfo[this.state.currentDatasource]?.elevationLayersSettings
    return !isGroundProfileAvailable?.length && this.state.jimuMapView.view.type === '3d' && elevationLayersSettings?.showVolumetricObjLineInGraph
  }

  checkIfCancelClick = () => {
    //if cancel button click clear all the processing of the chart and drawings on the map
    if (this.state.isCancelButtonClick) {
      this.onBackClick()
      return true
    }
    return false
  }

  onCancelButtonClick = () => {
    this._abortController?.abort()
    this.setState({
      isCancelButtonClick: true
    }, () => {
      this.checkIfCancelClick()
    })
  }

  //create the view profile only in case of web scenes and when show in graph property in enabled in config
  checkForVolumetricObjects = (jimuMapViewType: string) => {
    const elevationLayersSettings = this.props.config.configInfo[this.state.currentDatasource]?.elevationLayersSettings
    if (jimuMapViewType === '3d' && elevationLayersSettings?.showVolumetricObjLineInGraph) {
      return {
        id: elevationLayersSettings?.volumetricObjSettingsOptions?.id,
        type: 'view', // view line Profile
        color: elevationLayersSettings?.volumetricObjSettingsOptions?.style?.lineColor,
        title: elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel
      }
    } else {
      return null
    }
  }

  onChartDataReady = async (signal) => {
    if (this.state.drawModeActive || this.state.selectModeActive) {
      const intersectionResult = await this.createBufferGraphics(true)
      if (signal.aborted) {
        return
      }
      this.setState({
        intersectionResult: intersectionResult,
        viewModelErrorState: false,
        profileResult: this._defaultViewModel.chartData,
        chartDataUpdateTime: Date.now()
      }, async () => {
        //as it takes some time to render the chart after setting data
        await new Promise((resolve) => setTimeout(resolve, 500))
        this.setState({
          loadingIndicator: false,
          startChartRendering: true
        })
      })
    }
  }

  /**
   * Set different required states in the widget, when error in getting valid chart data
   * @param viewModelErrorState boolean value of viewModelErrorState
   * @param errorMsg string error message
   */
  onErrorInChartData = (viewModelErrorState: boolean, errorMsg: string) => {
    this.setState({
      loadingIndicator: false,
      viewModelErrorState: viewModelErrorState,
      profileErrorMsg: errorMsg || this.nls('unknownError'),
      startChartRendering: false,
      profileResult: null,
      chartDataUpdateTime: Date.now()
    })
  }

  //create the buffer when line is drawn/selected
  createBufferGraphics = async (skipSettingResultState?: boolean): Promise<any[]> => {
    return new Promise((resolve) => {
      //Empty prev buffer graphic instance
      this._bufferGraphics = null
      if (!this._selectedBufferValues) {
        resolve([])
        return
      }
      if (this._defaultViewModel?.input) {
        //if buffer is enabled then create buffer and then get intersecting features
        //else directly get the intersecting features to the drawn/selected geometry
        if (this._selectedBufferValues.enabled && this._selectedBufferValues.bufferDistance > 0) {
          let inputGeometry = this._defaultViewModel.input.geometry.clone ? this._defaultViewModel.input.geometry.clone() as __esri.geometryGeometry : this._defaultViewModel.input.geometry
          //In some cases with add to selection the complete geometry will not be simplified
          //to the get the correct buffer the geometry should be simplified
          if (simplifyOperator && !simplifyOperator.isSimple(inputGeometry)) {
            inputGeometry = simplifyOperator.execute(inputGeometry)
          }
          geometryUtils.createBuffer(inputGeometry, [this._selectedBufferValues.bufferDistance], this._selectedBufferValues.bufferUnits).then((bufferGeometry) => {
            //as we will always deal with only one geometry get first geometry only
            const firstBufferGeom = Array.isArray(bufferGeometry) ? bufferGeometry[0] : bufferGeometry
            const bufferGraphics = new Graphic({
              geometry: firstBufferGeom,
              symbol: jsonUtils?.fromJSON(this._selectedBufferValues.bufferSymbol)
            })
            this._bufferGraphics = bufferGraphics
            if (bufferGraphics && this._bufferGraphics) {
              this._bufferLayer?.removeAll()
              this._bufferLayer?.add(bufferGraphics)
            }
            //check for intersecting assets once buffer is drawn
            //when creating buffer after selection or drawing, we are setting the intersectionResult in state along with chart data,
            //and when updating buffer while changing value, unit, intersection layers the state needs to be updated after the intersection
            this.checkForIntersectingLayer(skipSettingResultState).then((intersectionResult) => {
              resolve(intersectionResult)
            })
          })
        } else {
          this._bufferLayer?.removeAll()
          this.checkForIntersectingLayer(skipSettingResultState).then((intersectionResult) => {
            resolve(intersectionResult)
          })
        }
      } else {
        this._bufferLayer?.removeAll()
        if (!skipSettingResultState) {
          this.setState({
            intersectionResult: []
          })
        }
        resolve([])
      }
    })
  }

  //On buffer values changes at runtime
  onBufferChange = (bufferValues: AssetBufferIntersection) => {
    this._selectedBufferValues = bufferValues
    this.createBufferGraphics()
  }

  /**
  * The current error state of the widget, which allows it to display different
  * error messages while drawing/selecting on webmap/webscene
  *
  * @ignore
  */
  getErrorMsgState = (errorMsg): any => {
    switch (errorMsg) {
      case ElevationProfileErrorState.TooComplex:
        return [true, this.nls('tooComplexError')]
      case ElevationProfileErrorState.InvalidGeometry:
        return [true, this.nls('invalidGeometryError')]
      case ElevationProfileErrorState.InvalidElevationInfo:
        return [true, this.nls('invalidElevationInfoError')]
      case ElevationProfileErrorState.UnknownError:
        return [true, this.nls('unknownError')]
      case ElevationProfileErrorState.NoVisibleProfiles:
        return [true, this.nls('noProfileError')]
      case ElevationProfileErrorState.RefinedButNoChartData:
        return [true, this.nls('noProfileError')]
      case ElevationProfileErrorState.None:
        return []
    }
  }

  getSelectableLayers = (activeDs: string) => {
    const dataSource: DataSource[] = getAllLayersFromDataSource(activeDs)
    const selectedLayers = []
    const isSelectableLayerCustomized: boolean = this.canShowSelectAndDrawOptions(this.props.config.configInfo[activeDs]) &&
      this.canShowProfilingForBackward(this.props.config.configInfo[activeDs])

    dataSource?.forEach((layer: FeatureLayerDataSource) => {
      const eachLayer: any = layer
      if (eachLayer && eachLayer.layerDefinition && eachLayer.layerDefinition.geometryType &&
        eachLayer.layerDefinition.geometryType === 'esriGeometryPolyline') {
        if ((this.props.config.configInfo[activeDs]?.hasOwnProperty('advanceOptions') ||
          this.props.config.configInfo[activeDs]?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled'))) {
          if (this.props.config.configInfo[activeDs]?.hasOwnProperty('advanceOptions') ||
            (this.props.config.configInfo[activeDs]?.profileSettings?.isProfileSettingsEnabled)) {
            //if selectable layers customize option is enabled in config then display all the configured layers in layers dropdown
            if ((this.props.config.configInfo[activeDs]?.advanceOptions ||
              (this.props.config.configInfo[activeDs]?.profileSettings?.isProfileSettingsEnabled)) && isSelectableLayerCustomized) {
              this.props.config.configInfo[activeDs]?.profileSettings.layers?.forEach((currentSetting) => {
                if (currentSetting.layerId === layer.id) {
                  selectedLayers.push(layer.id)
                }
              })
            } else {
              selectedLayers.push(layer.id)
            }
          }
        }
      }
    })
    this._selectableLayersAtRuntime = selectedLayers
    this.setState({
      updatedSelectableLayersAtRuntime: this.isSupportAddedLayers() ? selectedLayers.concat(this._addedNewLayerOnMap).filter((layer, index, self) => self.indexOf(layer) === index) : selectedLayers
    })
  }

  /**
   * Check if selected record is of type polyline
   * Check if selected record have layer id
   * Check if selected record's layer is currently selectable
  */
  getValidFeatureRecord = (featureRecords) => {
    let validRecord = null
    // eslint-disable-next-line array-callback-return
    featureRecords.some((selectedRecord) => {
      let selectedLayersId = null
      if (selectedRecord?.feature?.layer?.id) {
        selectedLayersId = selectedRecord.feature.layer.id
      } else if (selectedRecord?.dataSource?.layer?.id) {
        selectedLayersId = selectedRecord.dataSource.layer.id
      }
      if (selectedLayersId && selectedRecord.feature?.geometry?.type === 'polyline') {
        const dsLayerId = this.getDSLayerID(selectedLayersId)
        if (this.state.currentDatasource === 'default') {
          this.getValidAddedLayers(this.state.jimuMapView)
          if (this._addedNewLayerOnMap.includes(selectedRecord.dataSource.id)) {
            validRecord = {}
            validRecord.record = selectedRecord
            validRecord.dsLayerId = selectedRecord.dataSource.id
            this._selectableLayersAtRuntime = [selectedRecord.dataSource.id]
            return true
          }
        } else {
          if (!this._isSelectableLayersChangedAtRuntime) {
            this.getSelectableLayers(this.state.currentDatasource)
          }
          if (this._selectableLayersAtRuntime.includes(dsLayerId)) {
            validRecord = {}
            validRecord.record = selectedRecord
            validRecord.dsLayerId = dsLayerId
            return true
          }
        }
      }
    })
    return validRecord
  }

  getDSLayerID = (layerId: string): string => {
    let dsLayerId = ''
    if (this.state?.jimuMapView?.dataSourceId) {
      const dataSource: DataSource[] = getAllLayersFromDataSource(this.state.jimuMapView.dataSourceId)
      dataSource?.forEach((ds) => {
        if (ds.jimuChildId === layerId) {
          dsLayerId = ds.id
          return true
        }
      })
    }
    return dsLayerId
  }

  /**
   * Get out fields for datasource instance
   * @param dsLayer data source layer instance
   * @returns out fields
   */
  getOutfieldsForDs = (dsLayer: FeatureLayerDataSource): string[] => {
    let outFields = []
    const objectIdField = dsLayer.getIdField()
    let useDataSources = this.props.useDataSources
    //in case of useDataSources are empty try getting the use data sources from all the data sources
    if (useDataSources.length === 0) {
      useDataSources = Immutable(getUseDataSourcesForAllDs(this.props.config.configInfo))
    }
    useDataSources.forEach((ds) => {
      if (ds.dataSourceId === dsLayer.id && ds.fields) {
        outFields = [...ds.fields]
      }
    })
    if (!outFields.includes(objectIdField)) {
      outFields.push(objectIdField)
    }
    return outFields
  }

  getFeatureFromLayer = async (dsLayerId: string, oid) => {
    const dataSource = DataSourceManager.getInstance().getDataSource(dsLayerId) as FeatureLayerDataSource
    const query: FeatureLayerQueryParams = {}
    query.where = dataSource.getIdField() + ' = ' + oid
    query.outFields = this.getOutfieldsForDs(dataSource)
    query.returnGeometry = true
    query.returnFullGeometry = true
    query.returnZ = true
    query.notAddFieldsToClient = true
    query.outSR = this._mapView.view.spatialReference.toJSON()
    return new Promise((resolve) => {
      return dataSource.query(query).then((results) => {
        if (results?.records.length > 0) {
          let feature
          results.records.forEach((record: FeatureDataRecord) => {
            feature = record.feature
            return feature ?? null
          })
          resolve(feature)
        }
      })
    })
  }

  displayFeaturesResult = (layerDsId, selectedFeature) => {
    const featuresByLayer = {}
    featuresByLayer[layerDsId] = selectedFeature
    this.setState({
      isCancelButtonClick: false,
      initialStage: false,
      resultStage: true,
      selectModeActive: true,
      drawModeActive: false,
      onDrawingComplete: false,
      startChartRendering: false,
      viewModelErrorState: false
    }, () => {
      //Clear the draw tool
      if (this._defaultViewModel) {
        this._defaultViewModel.clear()
      }
      //Clear select tool symbol from map
      if (this.state.drawModeActive || this.state.selectModeActive) {
        this.state.currentSketchVM?.cancel()
      }
      //remove the previously selection from other widgets
      this._selectedFeaturesRecords = []
      this._selectedRecordsDsId = []
      //hide chart position
      this.hideChartPosition()
      //apply the same logic for displaying the profile as selected line feature from elevation profile widget
      this.queryForNewSelection(featuresByLayer, false)
    })
  }

  componentDidUpdate = (prevProps) => {
    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo?.[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState || currentWidgetState === WidgetState.Hidden ) {
      //check for feature selected using message action
      // if featureRecord found and prev selected record is not matching with the current then only load the profile for selected feature
      const featureRecords = this.props?.selectedFeatureRecords as any
      if (featureRecords?.length > 0 &&
        (!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedFeatureRecords ||
          prevProps?.mutableStatePropsVersion?.selectedFeatureRecords !== this.props.mutableStatePropsVersion?.selectedFeatureRecords)) {
        const validRecord = this.getValidFeatureRecord(featureRecords)
        if (validRecord?.record) {
          this.getFeatureFromLayer(validRecord.dsLayerId, validRecord.record.getId()).then((feature) => {
            this.displayFeaturesResult(validRecord.dsLayerId, [feature])
          })
        } else {
          return
        }
      }
    }

    if (this.props.state !== prevProps.state && (currentWidgetState === WidgetState.Closed || currentWidgetState === WidgetState.Hidden)) {
      //if widget is closed/hidden then deactivate the active sketch tools
      if (this._defaultViewModel) {
        this._defaultViewModel.stop()
      }
      if (this.state.drawModeActive || this.state.selectModeActive) {
        this.state.currentSketchVM?.cancel()
      }
      this._deActivateAddToSelectionTool()
      //if keep results when widget closed/hidden is disabled from config then clear profile and the drawing from the map
      if (!this.props.config.generalSettings.keepResultsWhenClosed) {
        this.clearAll()
      }
    }

    if (this.props.state !== prevProps.state && (currentWidgetState === WidgetState.Opened || (!currentWidgetState && prevProps.state === (WidgetState.Hidden || WidgetState.Closed)))) {
      //if profile is present then check if there was any next possible selection
      if (this.state.profileResult) {
        if (this.state.selectionModeOptions.selectionMode === SelectionMode.Multiple) {
          this.highlightNextPossibleSelection(true)
        }
      }
    }

    if (this.props.appMode !== prevProps.appMode && this.props.appMode === AppMode.Run) {
      if (this.state.addToSelectionTool) {
        this._displayAddToSelectionCursor()
      }
    } else if (this.props.appMode !== prevProps.appMode && this.props.appMode === AppMode.Design) {
      this._displayDefaultCursor()
    }
    if (!this._mapView) {
      return
    }
    //if map or active data source configuration is changed, update SketchVM and map instance
    if (prevProps.useMapWidgetIds !== this.props.useMapWidgetIds ||
      prevProps.config.activeDataSource !== this.props.config.activeDataSource) {
      if (this.props.config.configInfo[this.props.config.activeDataSource]) {
        this.setState({
          currentDatasource: this.props.config.activeDataSource
        }, () => {
          this.checkLineLayerAvailableInDsAndConfig(this.state.currentDatasource)
          this.getSelectedFeatureRecords(this._mapView?.dataSourceId)
          this.setState({
            addedElevationLayers: this.props.config.configInfo[this.state.currentDatasource].elevationLayersSettings?.addedElevationLayers
          })
        })
      }
    }

    if (prevProps.state !== this.props.state && (!this.state.profileResult && (this.state.drawModeActive || this.state.selectModeActive))) {
      //check widget the state open/close in live view
      const widgetState = getAppStore().getState().widgetsRuntimeInfo[this.props.id].state
      if (widgetState === WidgetState.Opened || !widgetState) {
        this.loadSelectDrawToolOnLoad(this._activeCurrentDs)
        this.getSelectedFeatureRecords(this._mapView?.dataSourceId)
      }
    }

    const currentConfig = this.props.config.configInfo?.[this.state.currentDatasource]
    const prevConfig = prevProps.config.configInfo?.[this.state.currentDatasource]

    if (this.props.config.configInfo.hasOwnProperty(this.state.currentDatasource)) {
      this.checkLineLayerAvailableInDsAndConfig(this.state.currentDatasource)
      this.setConfigForDataSources()
    }

    //elevation layers settings
    if (this.didElevationLayersColorLabelChanged(prevConfig?.elevationLayersSettings?.addedElevationLayers,
      currentConfig?.elevationLayersSettings?.addedElevationLayers) ||
      prevProps.mapSelectionHighlightColor !== this.props.mapSelectionHighlightColor
    ) {
      this.setState({
        graphicsHighlightColor: this.props.mapSelectionHighlightColor || '#00ffff',
        addedElevationLayers: currentConfig?.elevationLayersSettings?.addedElevationLayers
      }, () => {
        if (this._drawingLayer && this._drawingLayer.graphics.length > 0) {
          const polylineSymbol = {
            type: 'simple-line',
            color: this.state.graphicsHighlightColor,
            width: 5
          }
          const graphics: any = this._drawingLayer.graphics
          const individualGraphicItems = graphics.items
          individualGraphicItems.forEach((graphic) => {
            graphic.symbol = polylineSymbol
          })
        }
        if (this._defaultViewModel) {
          this.createEpViewModel(this._mapView, true)
        }
      })
    }

    //update next possible selection settings
    if (!lodash.isDeepEqual(prevConfig?.profileSettings?.selectionModeOptions, currentConfig?.profileSettings?.selectionModeOptions)) {
      this.setState({
        selectionModeOptions: currentConfig?.profileSettings?.selectionModeOptions
      }, () => {
        if (this.state.selectionModeOptions?.selectionMode === SelectionMode.Multiple) {
          if (this._nextPossibleSelectionLayer && this._nextPossibleSelectionLayer.graphics.length > 0) {
            const nextSelectableStyle = this.state.selectionModeOptions.style
            const polylineSymbol = {
              type: 'simple-line',
              color: nextSelectableStyle.lineColor,
              style: nextSelectableStyle.lineType === 'dotted-line'
                ? 'short-dot'
                : nextSelectableStyle.lineType === 'dashed-line'
                  ? 'short-dash'
                  : 'solid',
              width: this.state?.jimuMapView?.view?.type === '3d' ? nextSelectableStyle.lineThickness + 3 : nextSelectableStyle.lineThickness
            }
            const graphics: any = this._nextPossibleSelectionLayer.graphics
            const individualGraphicItems = graphics.items
            individualGraphicItems.forEach((graphic) => {
              graphic.symbol = polylineSymbol
            })
          } else {
            this.highlightNextPossibleSelection()
          }
        } else {
          this._displayDefaultCursor()
          this._nextPossibleSelectionLayer.removeAll()
          this.setState({
            addToSelectionTool: false,
            noGraphicAfterFirstSelection: true
          })
        }
      })
    }

    //if ground layer changes in live view then clear all the graphics and chart
    if (prevConfig?.elevationLayersSettings?.groundLayerId !== currentConfig?.elevationLayersSettings?.groundLayerId) {
      this.setState({
        groundLayerId: currentConfig?.elevationLayersSettings?.groundLayerId,
        addedElevationLayers: currentConfig?.elevationLayersSettings?.addedElevationLayers
      }, () => {
        if (!this.state.initialStage) {
          this.activateToolForNewProfile()
        }
        this.createEpViewModel(this._mapView, true)
      })
    }

    // support added layers config options changes or if its enabled and selectable layers option is changed then update the selectable layers at runtime
    if (prevConfig?.profileSettings?.supportAddedLayers !== currentConfig?.profileSettings?.supportAddedLayers ||
      (prevConfig?.hasOwnProperty('advanceOptions') && prevConfig?.advanceOptions) !==
      (currentConfig?.hasOwnProperty('advanceOptions') && currentConfig?.advanceOptions) ||
      (prevConfig?.profileSettings.hasOwnProperty('isProfileSettingsEnabled') && prevConfig?.profileSettings?.isProfileSettingsEnabled) !==
        (currentConfig?.profileSettings.hasOwnProperty('isProfileSettingsEnabled') && currentConfig?.profileSettings?.isProfileSettingsEnabled)
    ) {
      if (currentConfig?.profileSettings?.isProfileSettingsEnabled && currentConfig?.profileSettings?.supportAddedLayers) {
        this.getValidAddedLayers(this._mapView)
      } else {
        this._addedNewLayerOnMap = []
        this._defaultProfileSettingsForNewAddedLayer = []
        this.setState({
          newAddedLayer: [],
          profileSettingsForNewAddedLayer: [],
          updatedSelectableLayersAtRuntime: this._selectableLayersAtRuntime
        })
      }
    }

    if (prevConfig?.elevationLayersSettings?.elevationUnit !== currentConfig?.elevationLayersSettings?.elevationUnit ||
      prevConfig?.elevationLayersSettings?.linearUnit !== currentConfig?.elevationLayersSettings?.linearUnit) {
      this.setState({
        selectedLinearUnit: currentConfig?.elevationLayersSettings?.linearUnit,
        selectedElevationUnit: currentConfig?.elevationLayersSettings?.elevationUnit
      })
    }

    //clear the chart when elevation layer changed in live view
    if (this.didElevationLayersInfoChanged(prevConfig?.elevationLayersSettings?.addedElevationLayers,
      currentConfig?.elevationLayersSettings?.addedElevationLayers)) {
      if (currentConfig && prevConfig) {
        this.setState({
          addedElevationLayers: currentConfig?.elevationLayersSettings?.addedElevationLayers
        }, () => {
          this.createEpViewModel(this._mapView, true)
        })
      }
    }

    //check if profile layers config are updated in live view mode
    if (this.didProfileLayersSettingsChanged(prevConfig?.profileSettings.layers, currentConfig?.profileSettings.layers) ||
      this.checkForPrevCurrentAdvanceConfig(prevConfig, currentConfig, this.nls('selectableLayersLabel'))) {
      this.setState({
        profileLineLayers: currentConfig?.profileSettings.layers
      }, () => {
        this.getSelectableLayers(this.state.currentDatasource)
        let noLineConfigured: boolean = false
        if (currentConfig?.profileSettings.isProfileSettingsEnabled && this.state.profileLineLayers.length === 0 && !this.state.drawModeActive &&
           ((!currentConfig?.profileSettings.isCustomizeOptionEnabled && !this.state.selectModeActive) ||
          (currentConfig?.profileSettings.isCustomizeOptionEnabled && this.state.selectModeActive))) {
          this.onBackClick()
          noLineConfigured = true
        }

        if (!currentConfig?.profileSettings.isProfileSettingsEnabled && !this.state.drawModeActive) {
          this.onBackClick()
          noLineConfigured = true
        }

        if (!currentConfig?.assetSettings?.isAssetSettingsEnabled) {
          if (this._bufferLayer) {
            this._bufferLayer.removeAll()
          }
        } else {
          this.createBufferGraphics()
        }
        this.setState({
          lineLayersNotFound: noLineConfigured
        })
      })
    }

    //check if intersecting layers are modified in live view mode
    if (this.didIntersectingLayersSettingsChanged(prevConfig?.assetSettings?.layers, currentConfig?.assetSettings?.layers) ||
      this.checkForPrevCurrentAdvanceConfig(prevConfig, currentConfig, this.nls('intersectingLayersLabel'))) {
      if (currentConfig?.assetSettings?.isAssetSettingsEnabled) {
        this.createBufferGraphics()
      } else if (this._bufferLayer) {
        this._bufferLayer.removeAll()
      }
    }

    //check if volumetric objects config are updated in live view mode
    if (!lodash.isDeepEqual(prevConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.style, currentConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.style) ||
    prevConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel !== currentConfig?.elevationLayersSettings?.volumetricObjSettingsOptions?.volumetricObjLabel ||
    prevConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph !== currentConfig?.elevationLayersSettings?.showVolumetricObjLineInGraph) {
      if (this._defaultViewModel && this.state.jimuMapView.view?.type === '3d') {
        this.createEpViewModel(this._mapView, true)
      }
    }
  }

  didElevationLayersColorLabelChanged = (prevSettings, newSettings) => {
    let elevationLayersList = false
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newStatsSettings, index) => {
      if (newStatsSettings.style.lineColor !== prevSettings?.[index]?.style.lineColor ||
        newStatsSettings.label !== prevSettings?.[index]?.label
      ) {
        elevationLayersList = true
        return true
      }
    })
    return elevationLayersList
  }

  didElevationLayersInfoChanged = (prevSettings, newSettings) => {
    let elevationLayersList = false
    if (newSettings?.length !== prevSettings?.length) {
      return true
    }
    // eslint-disable-next-line array-callback-return
    newSettings?.some((newStatsSettings, index) => {
      if (newStatsSettings.id !== prevSettings[index]?.id ||
        !lodash.isDeepEqual(newStatsSettings.useDataSource, prevSettings[index]?.useDataSource) ||
        newStatsSettings.elevationLayerUrl !== prevSettings[index]?.elevationLayerUrl) {
        elevationLayersList = true
        return true
      }
    })
    return elevationLayersList
  }

  //for backward comaptibility check for the prev and current config for advance and profile or asset settings
  checkForPrevCurrentAdvanceConfig = (prevConfig, currentConfig, configLayerType: string) => {
    let isLayersSettingsEnabled: boolean = false
    if (configLayerType === this.nls('selectableLayersLabel')) {
      if (prevConfig && (((prevConfig?.hasOwnProperty('advanceOptions') && prevConfig?.advanceOptions) !==
      (currentConfig?.hasOwnProperty('advanceOptions') && currentConfig?.advanceOptions)) ||
        ((prevConfig?.profileSettings.hasOwnProperty('isProfileSettingsEnabled') && prevConfig?.profileSettings?.isProfileSettingsEnabled) !==
          (currentConfig?.profileSettings.hasOwnProperty('isProfileSettingsEnabled') && currentConfig?.profileSettings?.isProfileSettingsEnabled)) ||
          ((prevConfig?.profileSettings.hasOwnProperty('isCustomizeOptionEnabled') && prevConfig?.profileSettings?.isCustomizeOptionEnabled) !==
          (currentConfig?.profileSettings.hasOwnProperty('isCustomizeOptionEnabled') && currentConfig?.profileSettings?.isCustomizeOptionEnabled)))) {
        isLayersSettingsEnabled = true
      }
    }
    if (configLayerType === this.nls('intersectingLayersLabel')) {
      if (prevConfig && (((prevConfig?.hasOwnProperty('advanceOptions') && prevConfig?.advanceOptions) !==
      (currentConfig?.hasOwnProperty('advanceOptions') && currentConfig?.advanceOptions)) ||
        (prevConfig?.hasOwnProperty('assetSettings') && (prevConfig?.assetSettings?.hasOwnProperty('isAssetSettingsEnabled') && prevConfig?.assetSettings?.isAssetSettingsEnabled) !==
          (currentConfig?.assetSettings?.hasOwnProperty('isAssetSettingsEnabled') && currentConfig?.assetSettings?.isAssetSettingsEnabled)))) {
        isLayersSettingsEnabled = true
      }
    }
    return isLayersSettingsEnabled
  }

  didProfileLayersSettingsChanged = (prevProfileLayers, currentProfileLayers) => {
    let profileSettingsChanged = false
    if (prevProfileLayers?.length !== currentProfileLayers?.length) {
      profileSettingsChanged = true
    }
    return profileSettingsChanged
  }

  didIntersectingLayersSettingsChanged = (prevIntersectingLayers, currentIntersectingLayers) => {
    let intersectingSettingsChanged = false
    if (prevIntersectingLayers?.length !== currentIntersectingLayers?.length) {
      intersectingSettingsChanged = true
    }
    return intersectingSettingsChanged
  }

  componentWillUnmount = () => {
    if (this._defaultViewModel) {
      this._defaultViewModel.clear()
    }
    if (this.state.currentSketchVM) {
      this.state.currentSketchVM?.cancel()
    }
    //remove previously drawn graphics
    this.destroyDrawingLayers()
    //this will reset the cursor to default
    this._displayDefaultCursor()
    //clear the selected features from map if any present
    this._mapView?.clearSelectedFeatures()
  }

  buildOutputStatistics = (selectedElevationUnit, selectedLinearUnit, isFlip) => {
    this.buildStatsValuesAsOutput(this._defaultViewModel?.visibleProfiles, this.props.outputDataSources?.[0], selectedElevationUnit, selectedLinearUnit, isFlip)
  }

  //get output data source from data source manager instance
  getOutputDataSource = (outputDs) => {
    return DataSourceManager.getInstance().getDataSource(outputDs)
  }

  //create output statistics for other widgets
  buildStatsValuesAsOutput = (visibleProfiles, outputDs, selectedElevationUnit, selectedLinearUnit, isFlip) => {
    if (!this.getOutputDataSource(outputDs)) {
      return
    }
    let statsFields = []
    // statistics values which will be displayed or use in other widgets
    const sourceFeatures: Graphic[] = []
    const configuredGroundLayer = this.state.addedElevationLayers.filter((layerInfo) => layerInfo.id === this.state.groundLayerId)
    const isGroundProfileAvailable = this._defaultViewModel?.chartData?.lines?.filter((linesInfo) => linesInfo.id === configuredGroundLayer?.[0]?.id)
    if (this._defaultViewModel?.chartData?.lines.length === 0 || !isGroundProfileAvailable?.length) {
      this.props?.outputDataSources?.forEach((outputDsId) => {
        this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.NotReady)
      })
      return
    }
    this.state.addedElevationLayers?.forEach((layerInfo, index) => {
      //show the statistics info for all the multiple configured elevation layers
      const profileResult = visibleProfiles?.filter((profile) => profile.id === layerInfo.id)
      const visibleProfileResult = this._defaultViewModel?.chartData?.lines?.filter((linesInfo) => linesInfo.id === profileResult?.[0]?.id)
      if (visibleProfileResult?.length) {
        statsFields = []
        const statsValues: any = {}

        statsFields.push({
          alias: this.nls('name'),
          type: 'string',
          name: 'name'
        }, {
          alias: 'OBJECTID',
          type: 'double',
          name: 'OBJECTID'
        })

        epStatistics.forEach((stats) => {
          statsFields.push({
            alias: this.nls(stats.value).replace(/ /g, ''),
            type: 'string',
            name: stats.value
          })
        })

        const statsResult = this.outputStatisticsValueDisplay(profileResult?.[0], selectedElevationUnit, selectedLinearUnit, isFlip)
        statsValues.name = profileResult?.[0]?.result ? layerInfo.label : this.nls('noStatsValue')
        statsValues.OBJECTID = index
        statsResult.forEach((stats, index) => {
          statsValues[statsFields[index + 2]?.name] = stats?.statValue
        })
        //to fix the backward compatility issue
        //push the stats fields schema again with the field name same as alias
        const statsFieldsLength = statsFields.length
        epStatistics.forEach((stats) => {
          statsFields.push({
            alias: this.nls(stats.value).replace(/ /g, ''),
            type: 'string',
            name: this.nls(stats.value).replace(/ /g, '')
          })
        })
        // also assign the stats values again to the fields name
        statsResult.forEach((stats, index) => {
          statsValues[statsFields[index + statsFieldsLength]?.name] = stats?.statValue
        })

        //define dummy geometry as for profile stats value we don't have any geometry
        const dummyGeometry = {
          type: 'polyline',
          paths: [],
          spatialReference: { wkid: 4326 }
        } as __esri.geometryGeometry
        const statGraphic = new Graphic({
          attributes: statsValues,
          geometry: this._defaultViewModel?.input?.geometry ?? dummyGeometry
        })
        sourceFeatures.push(statGraphic)
      }
    })

    const fieldsInPopupTemplate = []
    statsFields.forEach((stats) => {
      if (stats.name) {
        const fieldsItem = {
          fieldName: stats.name,
          label: stats.alias
        }
        fieldsInPopupTemplate.push(fieldsItem)
      }
    })

    const messages = Object.assign({}, jimuUIDefaultMessages)
    //create custom feature layer with all the statistics info
    const layer = new FeatureLayer({
      id: outputDs + '_layer',
      title: this.props.intl.formatMessage({ id: 'outputStatistics', defaultMessage: messages.outputStatistics }, { name: this.props.label }),
      fields: statsFields,
      geometryType: 'polyline',
      source: sourceFeatures,
      objectIdField: 'OBJECTID',
      popupTemplate: { //feature info widget popup title
        title: this.props.intl.formatMessage({ id: 'outputStatistics', defaultMessage: messages.outputStatistics }, { name: this.props.label }),
        fieldInfos: fieldsInPopupTemplate,
        content: [{
          type: 'fields',
          fieldInfos: fieldsInPopupTemplate
        }]
      }
    })
    const featureLayerDs = this.getOutputDataSource(outputDs) as FeatureLayerDataSource
    if (layer && featureLayerDs) {
      featureLayerDs.layer = layer
    }
    //update the data source status
    this.getOutputDataSource(outputDs)?.setStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDs)?.setCountStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDs)?.addSourceVersion()
  }

  outputStatisticsValueDisplay = (profileResult, selectedElevationUnit, selectedLinearUnit, isFlip) => {
    const items = []
    let statsValueWithUnit = ''
    let statsValue = null
    let statisticsName = ''
    epStatistics.forEach((stat) => {
      statisticsName = stat.value
      if (!profileResult?.statistics) {
        statsValueWithUnit = this.nls('noStatsValue')
      } else {
        if (isFlip) {
          if (statisticsName !== ElevationProfileStatisticsName.AvgElevation &&
            statisticsName !== ElevationProfileStatisticsName.MaxDistance &&
            statisticsName !== ElevationProfileStatisticsName.MaxElevation &&
            statisticsName !== ElevationProfileStatisticsName.MinElevation) {
            statisticsName = getReverseStatsOnFlip(statisticsName)
          }
        }
        statsValue = profileResult?.statistics?.[statisticsName]
        statsValueWithUnit = this.getStatsValueWithUnit(profileResult, statsValue, statisticsName, selectedElevationUnit, selectedLinearUnit)
      }
      items.push({
        statName: stat.value,
        statValue: statsValueWithUnit
      })
    })
    return items
  }

  getStatsValueWithUnit = (profileResult, statVal, name, selectedElevationUnit, selectedLinearUnit) => {
    let roundOffStat = ''
    let convertedStats: number = null
    unitOptions.forEach((unit) => {
      if (name === ElevationProfileStatisticsName.MaxDistance) {
        if (unit.value === selectedLinearUnit) {
          convertedStats = convertSingle(statVal, profileResult?.effectiveUnits.distance, selectedLinearUnit)
          roundOffStat = this.props.intl.formatNumber(convertedStats, { maximumFractionDigits: 2 }) + ' ' + this.nls(unit.abbreviation)
        }
      } else if (name === ElevationProfileStatisticsName.MaxPositiveSlope || name === ElevationProfileStatisticsName.MaxNegativeSlope ||
        name === ElevationProfileStatisticsName.AvgPositiveSlope || name === ElevationProfileStatisticsName.AvgNegativeSlope) { //Slope values in degree unit
        if (statVal === null) {
          roundOffStat = this.nls('noStatsValue')
        } else {
          roundOffStat = this.props.intl.formatNumber(statVal, { maximumFractionDigits: 2 }) + ' ' + '\u00b0'
        }
      } else {
        if (unit.value === selectedElevationUnit) {
          convertedStats = convertSingle(statVal, profileResult?.effectiveUnits.elevation, selectedElevationUnit)
          roundOffStat = this.props.intl.formatNumber(convertedStats, { maximumFractionDigits: 2 }) + ' ' + this.nls(unit.abbreviation)
        }
      }
    })
    return roundOffStat
  }

  queryForNewSelection = async (featuresByLayer, selectedUsingEPSelectTool: boolean) => {
    let newSelectedFeature: Graphic = null
    if (Object.keys(featuresByLayer).length > 0) {
      for (const dsLayerId in featuresByLayer) {
        let selectedLayerDsId = dsLayerId
        let feature
        const layerDataSource = DataSourceManager.getInstance().getDataSource(dsLayerId)
        if (layerDataSource.type === DataSourceTypes.SubtypeGroupLayer &&
          (layerDataSource as SubtypeGroupLayerDataSource).getSelectedRecordIds().length) {
          //get the sublayer datasource by record id
          const subLayerDataSource = await (layerDataSource as SubtypeGroupLayerDataSource).getSublayerDataSourceByRecordId((layerDataSource as SubtypeGroupLayerDataSource).getSelectedRecordIds()[0])
          selectedLayerDsId = subLayerDataSource.id
          feature = await this.getFeatureFromLayer(selectedLayerDsId, subLayerDataSource.getSelectedRecordIds())
        }
        const features = feature ? [feature] : featuresByLayer[selectedLayerDsId]
        if (features.length > 0) {
          //In current release we will be dealing with only first feature out of multiple features from multiple layers
          //TODO: In future we may have to provide the features list and allow user to select one feature
          if (features[0].geometry?.type === 'polyline' && this._selectableLayersAtRuntime.includes(selectedLayerDsId)) {
            //In 3d, update the elevation info of drawing and nextPossibleSelectionLayer according to the first selected feature
            if (this.state.jimuMapView.view.type === '3d' && features[0]?.layer?.elevationInfo) {
              const elevationInfo = features[0]?.layer?.elevationInfo
              this._drawingLayer.set('elevationInfo', elevationInfo)
              this._nextPossibleSelectionLayer.set('elevationInfo', elevationInfo)
            }
            this._newFeatureSelection = true
            this.setState({
              noGraphicAfterFirstSelection: true
            })
            newSelectedFeature = new Graphic(
              {
                geometry: features[0]?.geometry,
                attributes: features[0]?.attributes ? features[0]?.attributes : {}
              }
            )
            newSelectedFeature.attributes.esriCTFeatureLayerId = selectedLayerDsId
            //to remove the extra selection form map view, done by system while showing info-window of selected features
            //this should be done only when selecting features using EP select tool
            if (selectedUsingEPSelectTool) {
              this._mapView.clearSelectedFeatures()
            }
            break
          }
        }
      }
    }
    //clear the graphics added by drawing tool
    if (this._drawingLayer || this._bufferLayer) {
      this._drawingLayer.removeAll()
      this._bufferLayer.removeAll()
    }
    if (newSelectedFeature) {
      this.setState({
        drawModeActive: false,
        noFeaturesError: false,
        viewModelErrorState: false
      })
      //get the geometry in map SR
      geometryUtils.projectToSpatialReference([newSelectedFeature.geometry],
        this.state.jimuMapView.view.spatialReference).then((projectedGeometries) => {
        //On success return the projected geometry
        //as are passing only one geometry we are looking for only the first result
        if (projectedGeometries?.length > 0) {
          newSelectedFeature.geometry = projectedGeometries[0] as __esri.geometryGeometry
        }
        this.selectFeatureForProfiling(newSelectedFeature)
      }, (err) => {
        console.log(err)
        //In case of error return the original geometry and log error
        this.selectFeatureForProfiling(newSelectedFeature)
      })
    } else {
      //reactivate sketch view model to select another point
      if (this.state.selectModeActive) {
        this.state.currentSketchVM.create('point')
      }
      //show error in widget panel
      this.setState({
        loadingIndicator: false,
        noFeaturesError: true
      }, () => {
        setTimeout(() => {
          //clear the selected features from map if no profile is generated
          this._mapView?.clearSelectedFeatures()
        }, 100)
      })
    }
  }

  checkForIntersectingLayer = (skipSettingResultState: boolean | undefined): Promise<any[]> => {
    return new Promise((resolve) => {
      const defArr: Array<Promise<LayerIntersectionInfo | null>> = []
      if (this._intersectingLayersAtRuntime?.length > 0) {
        const selectableLineGeom = this._defaultViewModel?.input?.geometry
        const dsManager = DataSourceManager.getInstance()
        const assetLayersCurrentConfig = this.props.config.configInfo[this.state.currentDatasource]?.assetSettings?.layers
        assetLayersCurrentConfig.forEach((currentSetting) => {
          if (this._intersectingLayersAtRuntime.includes(currentSetting.layerId)) {
            const layerDs = dsManager.getDataSource(currentSetting.layerId) as FeatureLayerDataSource
            if (layerDs && layerDs.layer && this.considerLayerVisibility(layerDs.id)) {
              defArr.push(this.queryForIntersectingLayers(currentSetting, selectableLineGeom))
            }
          }
        })
      }
      Promise.all(defArr).then((intersectionResult: Array<LayerIntersectionInfo | null>) => {
        if (!skipSettingResultState) {
          this.setState({
            intersectionResult: intersectionResult
          })
        }
        resolve(intersectionResult)
      })
    })
  }

  queryForIntersectingLayers = async (assetLayerSettings, selectableLineGeom?): Promise<LayerIntersectionInfo | null> => {
    const bufferGraphics = this._bufferGraphics
    const ds: any = DataSourceManager.getInstance().getDataSource(assetLayerSettings?.layerId) as QueriableDataSource
    return new Promise((resolve) => {
      if (ds?.layerDefinition?.geometryType === 'esriGeometryPolyline' || ds?.layerDefinition?.geometryType === 'esriGeometryPoint') {
        //create the query params
        const intersectingFeatureQuery: FeatureLayerQueryParams = {}
        intersectingFeatureQuery.geometry = bufferGraphics?.geometry ? bufferGraphics.geometry.toJSON() : selectableLineGeom.toJSON()
        intersectingFeatureQuery.returnGeometry = true
        intersectingFeatureQuery.returnZ = true

        //get ids of the features which are used for selection, and skip those features from intersection
        const selectedFeaturesQueryString = this.filterExistingFeatures(ds)
        if (selectedFeaturesQueryString) {
          intersectingFeatureQuery.where = selectedFeaturesQueryString
        }
        //always get the objectId
        intersectingFeatureQuery.outFields = [ds.getIdField()]
        //get the configured display field
        if (assetLayerSettings.displayField && !intersectingFeatureQuery.outFields.includes(assetLayerSettings.displayField)) {
          intersectingFeatureQuery.outFields.push(assetLayerSettings.displayField)
        }
        //get the configured field1 for elevation
        if (assetLayerSettings.elevationSettings?.field1 && !intersectingFeatureQuery.outFields.includes(assetLayerSettings.elevationSettings.field1)) {
          intersectingFeatureQuery.outFields.push(assetLayerSettings.elevationSettings.field1)
        }
        //get the configured field2 for elevation
        if (assetLayerSettings.elevationSettings?.field2 && !intersectingFeatureQuery.outFields.includes(assetLayerSettings.elevationSettings.field2)) {
          intersectingFeatureQuery.outFields.push(assetLayerSettings.elevationSettings.field2)
        }
        intersectingFeatureQuery.outFields = this.getOutfieldsForDs(ds)
        intersectingFeatureQuery.notAddFieldsToClient = true
        intersectingFeatureQuery.outSR = this._mapView.view.spatialReference.toJSON()
        // Adding extra 0.1 meters buffer to get the features which are on the edge
        //this is to fix the issue we had observed and was getting fixed after adding 0.1m buffer
        intersectingFeatureQuery.distance = 0.1
        intersectingFeatureQuery.units = 'esriSRUnit_Meter'
        try {
          ds.query(intersectingFeatureQuery).then((results) => {
            const intersectionResultForLayer: IntersectionResult[] = []
            //selected polyline or buffer
            if (results?.records.length > 0) {
              results.records.forEach((record) => {
                const feature = record.feature
                const disconnectedFeatureForProfiling = []
                const connectedFeatureForProfiling = []

                const iResult: IntersectionResult = {
                  connectedFeatureForProfiling: connectedFeatureForProfiling,
                  disconnectedFeatureForProfiling: disconnectedFeatureForProfiling,
                  intersectingFeature: feature,
                  record: record
                }
                const intersectingFeatureGeom = feature.geometry
                //in case of polyline find the intersecting segments and disconnected points
                if (intersectingFeatureGeom.type === 'polyline') {
                  let selectedOrBufferLineGeom = selectableLineGeom
                  //get all intersecting polyline (Parallel lines with same x and y)
                  //if buffer preset use buffer to get intersecting line else use the selected line geometry
                  const intersectingLineToTheLine: __esri.geometryGeometry | __esri.geometryGeometry[] =
                    intersectionOperator.execute(intersectingFeatureGeom, bufferGraphics ? bufferGraphics.geometry : selectedOrBufferLineGeom)
                    //consider all the intersecting lines to be shown in graph, these could be multiple paths
                  if (intersectingLineToTheLine) {
                    connectedFeatureForProfiling.push(intersectingLineToTheLine)
                  }
                  //if buffer present, construct buffer outline by passing the buffer rings to a polyline geometry.
                  //this is for finding the intersecting points on buffer edges or the selected line
                  if (bufferGraphics) {
                    const bufferGeom: any = bufferGraphics.geometry
                    selectedOrBufferLineGeom = new Polyline({
                      hasZ: bufferGeom.hasZ,
                      hasM: bufferGeom.hasM,
                      paths: bufferGeom.rings,
                      spatialReference: bufferGeom.spatialReference
                    })
                  }
                  //now to find the disconnected points to be plotted on graph
                  const intersectingPointToTheLineFeature = intersectionOperator.executeMany([intersectingFeatureGeom], selectedOrBufferLineGeom)
                  const multiPointFeatures: any = intersectingPointToTheLineFeature.filter((feature) => feature.type === 'multipoint')
                  const multiPointFeature = multiPointFeatures && multiPointFeatures.length && multiPointFeatures[0]
                  if (multiPointFeature?.points?.length > 0) {
                    multiPointFeature.points.forEach((eachPoint, index) => {
                      const intersectingPointFeature = multiPointFeature.getPoint(index) as __esri.geometryGeometry
                      //when any points are intersecting the selectedOrBufferLineGeom
                      //if those points are intersecting with result in intersectingLineToTheLine Geometry means those points are already considered
                      //and hence skip them and for those which are not intersecting add them to disconnected points
                      if (!intersectingLineToTheLine) {
                        disconnectedFeatureForProfiling.push(intersectingPointFeature)
                      } else {
                        const checkFeatureForProfiling = intersectsOperator.execute(intersectingPointFeature, intersectingLineToTheLine)
                        if (!checkFeatureForProfiling) {
                          disconnectedFeatureForProfiling.push(intersectingPointFeature)
                        }
                      }
                    })
                  }
                }
                intersectionResultForLayer.push(iResult)
              })
            }
            const layerIntersectionInfo: LayerIntersectionInfo = {
              title: ds.getLabel(),
              settings: assetLayerSettings,
              intersectionResult: intersectionResultForLayer,
              inputGeometry: selectableLineGeom
            }
            resolve(layerIntersectionInfo)
          }, (err) => {
            console.log(err)
            resolve(null)
          })
        } catch (e) {
          resolve(null)
        }
      } else {
        resolve(null)
      }
    })
  }

  /**
   *
   * If layer is invisible by scale-dependent visibility, layer definitions and filters then user will unable to select the feature
  */

  considerLayerVisibility = (dsId): boolean => {
    const mapLayer = this._mapView.getJimuLayerViewByDataSourceId(dsId)?.layer
    const layersVisibility = mapLayer && mapLayer.visible &&
      ((mapLayer.minScale >= this._mapView.view.scale && mapLayer.maxScale <= this._mapView.view.scale) ||
        (mapLayer.minScale === 0 && mapLayer.maxScale <= this._mapView.view.scale) ||
        (mapLayer.maxScale === 0 && mapLayer.minScale >= this._mapView.view.scale) ||
        (mapLayer.minScale === 0 && mapLayer.maxScale === 0))
    return layersVisibility
  }

  queryForIndividualLayers = (geometry) => {
    const defArr = []
    const dsManager = DataSourceManager.getInstance()
    //use configured line layers of selection
    this._selectableLayersAtRuntime.forEach((selectableLayerId) => {
      const layerDs = dsManager.getDataSource(selectableLayerId) as FeatureLayerDataSource
      if (layerDs && this.considerLayerVisibility(layerDs.id)) {
        defArr.push(this.queryIndividualLayer(layerDs, geometry))
      }
    })
    return defArr
  }

  queryIndividualLayer = async (layerDs: any, selectedGeometry): Promise<any[]> => {
    const metersPerVSRForLayer = this.getMetersForVerticalSR(layerDs)
    const queryString = this.filterExistingFeatures(layerDs)
    const currentDateTime = Date.now() // To dirty the query string so that data will be fetched from server
    const lineLayerQuery: FeatureLayerQueryParams = {}
    lineLayerQuery.geometry = selectedGeometry.toJSON()
    lineLayerQuery.returnFullGeometry = true
    lineLayerQuery.returnGeometry = true
    lineLayerQuery.returnZ = true
    lineLayerQuery.outFields = layerDs.getAllUsedFields()
    lineLayerQuery.notAddFieldsToClient = true
    lineLayerQuery.outSR = this._mapView.view.spatialReference.toJSON()
    if (queryString) {
      lineLayerQuery.where = queryString + ' AND ' + currentDateTime + '=' + currentDateTime
    } else {
      lineLayerQuery.where = currentDateTime + '=' + currentDateTime
    }
    let result = []
    try {
      await layerDs.query(lineLayerQuery).then((results) => {
        const resultFeatures = []
        if (results?.records.length > 0) {
          //get features from each records
          results.records.forEach((record) => {
            const feature = record.feature
            resultFeatures.push(feature)
            // Z value after queryFeatures are returned in SR of the map, only if layer don't have vertical SR
            // so in case when we have vertical SR for layer, convert the z values in map sr unit
            // multiply the value with metersPerSRForLayer will convert z value in meters
            // after that divide the value by metersPerSRForMap will give the value in mapSR unit
            if (metersPerVSRForLayer) {
              const metersPerSRForMap = unitUtils.getMetersPerUnitForSR(new SpatialReference(this._mapView.view.spatialReference.toJSON()))
              const eachGeometry = feature.geometry
              if (eachGeometry.paths.length > 0) {
                eachGeometry.paths.forEach((eachPath) => {
                  if (eachPath.length > 0) {
                    eachPath.forEach((eachPoint) => {
                      if (eachPoint.length > 1) {
                        eachPoint[2] = (eachPoint[2] * metersPerVSRForLayer) / metersPerSRForMap
                      }
                    })
                  }
                })
              }
            }
            feature.attributes.esriCTFeatureLayerId = layerDs.dataSourceJson.id
          })
        }
        result = resultFeatures
      }, (err) => {
        console.log(err)
      })
    } catch (e) {
      result = []
    }
    return result
  }

  getMetersForVerticalSR = (layer) => {
    let metersPerSR = 1
    const layerDefinition = layer.layerDefinition
    //get Units from VCS of layers source SR
    //in case of newly added layer through other widgets we cannot get the layer in layer data source
    //so to get the sourceSpatialReference always fetch it from the layerDefinition
    if (layerDefinition?.sourceSpatialReference?.vcsWkid) {
      metersPerSR = unitUtils.getMetersPerVerticalUnitForSR(new SpatialReference({ wkid: layerDefinition?.sourceSpatialReference.vcsWkid }))
    } else if (layerDefinition?.sourceSpatialReference?.vcsWkt) {
      metersPerSR = unitUtils.getMetersPerVerticalUnitForSR(new SpatialReference({ wkid: layerDefinition?.sourceSpatialReference.vcsWkt }))
    } else {
      metersPerSR = null
    }
    return metersPerSR
  }

  filterExistingFeatures = (layer: FeatureLayerDataSource) => {
    let oIdQueryString = ''
    const oIdField = layer.getIdField()
    //Get the collection of graphics from the respective layer
    const layerFeatureGraphics = this._drawingLayer.graphics.filter((graphic) => {
      if (graphic?.attributes?.hasOwnProperty('esriCTFeatureLayerId') &&
        graphic.attributes.esriCTFeatureLayerId === layer.getDataSourceJson().id) {
        return true
      } else {
        return false
      }
    })
    layerFeatureGraphics.forEach((graphic, index) => {
      if (graphic?.attributes?.hasOwnProperty('esriCTFeatureLayerId') &&
        graphic.attributes.esriCTFeatureLayerId === layer.getDataSourceJson().id) {
        if (index === layerFeatureGraphics.length - 1) {
          oIdQueryString += oIdField + ' <> ' +
            graphic.attributes[oIdField]
        } else {
          oIdQueryString += oIdField + ' <> ' +
            graphic.attributes[oIdField] + ' and '
        }
      }
    })
    return oIdQueryString
  }

  selectFeatureForProfiling = (feature) => {
    let addAtFirst = false
    let reverse = false
    const graphicsLength = this._drawingLayer.graphics.length
    //if any features is already added then check the new selected one should be added as the first or last in the layer
    if (graphicsLength > 0) {
      const firstGeometry: any = this._drawingLayer.graphics.getItemAt(0).geometry
      const lastGeometry: any = this._drawingLayer.graphics.getItemAt(graphicsLength - 1).geometry

      const oldStartPoint = firstGeometry.getPoint(0, 0)
      const oldEndPoint = lastGeometry.getPoint(0, lastGeometry.paths[0].length - 1)

      const newStartPoint = feature.geometry.getPoint(0, 0)
      const newEndPoint = feature.geometry.getPoint(0, feature.geometry.paths[0].length - 1)

      //Old Start is same as new Start
      if (intersectsOperator.execute(newStartPoint, oldStartPoint)) {
        addAtFirst = true
        reverse = true
        //Old Start is same as new End
      } else if (intersectsOperator.execute(newEndPoint, oldStartPoint)) {
        addAtFirst = true
        reverse = false
        // Old End is same as new End
      } else if (intersectsOperator.execute(newEndPoint, oldEndPoint)) {
        addAtFirst = false
        reverse = true
        // Old End is same as new Start
      } else if (intersectsOperator.execute(newStartPoint, oldEndPoint)) {
        addAtFirst = false
        reverse = false
      }
    }

    const color = new Color(this.state.graphicsHighlightColor ? this.state.graphicsHighlightColor : '#00ffff')
    const rgbaColor = color.toRgba()
    const polylineSymbol = {
      type: 'simple-line',
      color: rgbaColor,
      width: 5
    }
    const polylineGeometry: Polyline = feature.geometry
    //flip the polyline geometry direction to get proper sequence
    if (reverse) {
      const flippedPaths = []
      for (let j = polylineGeometry.paths.length - 1; j >= 0; j--) {
        const arr1 = []
        for (let i = polylineGeometry.paths[j].length - 1; i >= 0; i--) {
          arr1.push(polylineGeometry.paths[j][i])
        }
        flippedPaths.push(arr1)
      }
      polylineGeometry.paths = flippedPaths
    }
    //create new graphic with the newly selected geometry
    const polylineGraphic = new Graphic({
      geometry: polylineGeometry,
      attributes: feature.attributes,
      symbol: polylineSymbol as unknown as __esri.SymbolUnion
    })
    let addedToSelection: boolean = false
    //On selecting new feature render the chart
    if (!this.state.addToSelectionTool && this._defaultViewModel) {
      this._defaultViewModel.input = polylineGraphic
      addedToSelection = true
    }
    //in case of newly added layer through other widgets, the new selection of drawing layer is displaying below the selected layer
    //so to resolve this issue, always reorder the drawing layer to be dispalyed on the top in the map
    this.state.jimuMapView?.view.map.reorder(this._drawingLayer, this.state.jimuMapView?.view.map.layers.length - 1)
    if (addAtFirst) {
      this._drawingLayer.graphics.add(polylineGraphic, 0)
    } else {
      this._drawingLayer.graphics.add(polylineGraphic)
    }
    //#319: broadcast selected features from EP to the app data source
    this.broadcastSelectedFeatures(feature)
    //remove previous possible selection and highlight the new nextPossible selection
    this._nextPossibleSelectionLayer.removeAll()
    setTimeout(() => {
      //render chart dynamically on select lines
      this.renderChartOnSelect(addedToSelection)
      if (this.state.selectionModeOptions.selectionMode === SelectionMode.Multiple) {
        this.highlightNextPossibleSelection()
      }
    }, 200)
  }

  broadcastSelectedFeatures = (feature) => {
    const layerDs = DataSourceManager.getInstance().getDataSource(feature.attributes.esriCTFeatureLayerId) as FeatureLayerDataSource
    const selectedRecord = layerDs.buildRecord(feature)
    if (selectedRecord) {
      const recordsInfo = {}
      const recordsIds = {}
      this._selectedFeaturesRecords.push(selectedRecord)
      this._selectedRecordsDsId.push(layerDs.id)
      this._selectedFeaturesRecords.forEach((eachRecord) => {
        const dsId = eachRecord.dataSource.id
        if (!recordsInfo[dsId]) {
          recordsInfo[dsId] = []
        }
        recordsInfo[dsId].push(eachRecord)
        if (!recordsIds[dsId]) {
          recordsIds[dsId] = []
        }
        recordsIds[dsId].push(eachRecord.getId())
      })
      for (const dsId in recordsInfo) {
        const ds = DataSourceManager.getInstance().getDataSource(dsId) as FeatureLayerDataSource
        ds?.selectRecordsByIds(recordsIds[dsId], recordsInfo[dsId])
      }
      //publish record select message
      MessageManager.getInstance().publishMessage(
        new DataRecordsSelectionChangeMessage(this.props.id, this._selectedFeaturesRecords, this._selectedRecordsDsId)
      )
    }
  }

  //If selected feature have multiple paths then the distance calculations was getting impacted
  //Whenever new feature is selected create its data into on single path and then add in to drawing layer
  createSinglePathPolyline = (polylineGeometry: Polyline) => {
    const singlePath = []
    polylineGeometry.paths.forEach((eachPath) => {
      eachPath.forEach((eachPoint) => singlePath.push(eachPoint))
    })
    // create new merged polyline feature to generate ground profile
    const newPolyLine = new Polyline({
      hasZ: polylineGeometry.hasZ,
      spatialReference: polylineGeometry.spatialReference.toJSON()
    })
    newPolyLine.addPath(singlePath)
    return newPolyLine
  }

  renderChartOnSelect = (graphicAddedToSelection: boolean) => {
    if (this.state.addToSelectionTool) {
      let graphic
      //If selected line features length is more than one then merge them and create one single polyline for generating profile
      //Make union of the selected features by merging points in each path of each feature in to a single path and create only one graphic with one path
      if (this._drawingLayer.graphics.length > 1) {
        // create new merged polyline feature to generate ground profile
        const newPolyLine = new Polyline({
          spatialReference: this._drawingLayer.graphics.getItemAt(0).geometry.spatialReference.toJSON(),
          hasZ: false
        })
        let singlePath = []
        //get geometries of all selected/drawn features and merge to create single polyline with only one path
        //If any line have multiple path keep them as it is, don't merge multiple paths of single line, it will corrupt the geometry
        this._drawingLayer.graphics.forEach((eachFeature) => {
          const eachGeometry: Polyline = eachFeature.geometry as Polyline
          if (eachGeometry.hasZ) {
            newPolyLine.hasZ = true
          }
          //if geometry have multiple paths then add those paths into new polyline directly
          //else add points in single path array
          if (eachGeometry.paths.length > 1) {
            eachGeometry.paths.forEach((eachPath) => {
              if (singlePath.length > 0) {
                eachPath.forEach((eachPoint) => singlePath.push(eachPoint))
                newPolyLine.addPath(singlePath)
                singlePath = []
              } else {
                newPolyLine.addPath(eachPath)
              }
            })
          } else {
            const newLinesPathLength = newPolyLine.paths.length
            if (newLinesPathLength > 0) {
              eachGeometry.paths.forEach((eachPath) => {
                eachPath.forEach((eachPoint) => newPolyLine.paths[newLinesPathLength - 1].push(eachPoint))
              })
            } else {
              eachGeometry.paths.forEach((eachPath) => {
                eachPath.forEach((eachPoint) => singlePath.push(eachPoint))
              })
            }
          }
        })
        if (singlePath.length > 0) {
          newPolyLine.addPath(singlePath)
        }
        graphic = new Graphic({
          geometry: newPolyLine
        })
      } else if (this._drawingLayer.graphics.length === 1) {
        graphic = this._drawingLayer.graphics.getItemAt(0)
      }
      if (!graphicAddedToSelection && this._defaultViewModel) {
        this._defaultViewModel.input = graphic
      }
    }
  }

  highlightNextPossibleSelection = (widgetClosedStateOpened?: boolean) => {
    let firstPoint: Point, lastPoint: Point, firstGeometry, lastGeometry
    const graphicsLength = this._drawingLayer.graphics.length
    if (graphicsLength > 0) {
      firstGeometry = this._drawingLayer.graphics.getItemAt(0).geometry
      firstPoint = firstGeometry.getPoint(0, 0)
      let lastIdx = firstGeometry.paths[0].length - 1
      lastPoint = firstGeometry.getPoint(0, lastIdx)
      //if more than one graphics then use last point of the last graphics
      if (graphicsLength > 1) {
        lastGeometry = this._drawingLayer.graphics.getItemAt(graphicsLength - 1).geometry
        lastIdx = lastGeometry.paths[0].length - 1
        lastPoint = lastGeometry.getPoint(0, lastIdx)
      }
      const fg = new Graphic({
        geometry: firstPoint
      })
      //in case of newly added layer through other widgets, the next possible selection layer is displaying below the selected layer
      //so to resolve this issue, always reorder the nextPossibleSelectionLayer to be dispalyed on the top in the map
      this.state.jimuMapView?.view.map.reorder(this._nextPossibleSelectionLayer, this.state.jimuMapView?.view.map.layers.length - 1)
      this._nextPossibleSelectionLayer.graphics.add(fg)
      const lg = new Graphic({
        geometry: lastPoint
      })
      this._nextPossibleSelectionLayer.graphics.add(lg)
      this.queryForNextPossibleSelection([firstPoint, lastPoint], widgetClosedStateOpened)
    }
  }

  queryForNextPossibleSelection = (endPointsGeometry: Point[], widgetClosedStateOpened: boolean) => {
    let defArrResult = []
    endPointsGeometry.forEach((point) => {
      defArrResult = defArrResult.concat(this.queryForIndividualLayers(this.pointToExtent(point)))
    })
    this.setState({
      nextPossibleloadingIndicator: !widgetClosedStateOpened
    })
    Promise.all(defArrResult).then((results: any) => {
      this.setState({
        nextPossibleloadingIndicator: false
      })
      const nextSelectableFeatures = []
      //Merge all the arrays into a single array
      const combinedResults = results.flat()
      if (combinedResults?.length > 0) {
        combinedResults.forEach((feature) => {
          if (feature?.geometry?.paths?.length > 0) {
            const firstPoint = feature.geometry?.getPoint?.(0, 0)
            const lastIdx = feature.geometry.paths[feature.geometry.paths.length - 1].length - 1
            const lastPoint = feature.geometry?.getPoint?.(0, lastIdx)
            //need to check returned geometries end point is intersecting with one of the endpoint of already selected line
            //since the intersection query will return the lines intersecting in between to the endpoints.
            if ((firstPoint && intersectsOperator.execute(endPointsGeometry[0], firstPoint)) ||
              (lastPoint && intersectsOperator.execute(endPointsGeometry[0], lastPoint)) ||
              (firstPoint && intersectsOperator.execute(endPointsGeometry[1], firstPoint)) ||
              (lastPoint && intersectsOperator.execute(endPointsGeometry[1], lastPoint))) {
              const nextSelectableStyle = this.state.selectionModeOptions.style
              const polylineSymbol = {
                type: 'simple-line',
                color: nextSelectableStyle.lineColor,
                style: nextSelectableStyle.lineType === 'dotted-line'
                  ? 'short-dot'
                  : nextSelectableStyle.lineType === 'dashed-line'
                    ? 'short-dash'
                    : 'solid',
                width: this.state?.jimuMapView?.view?.type === '3d' ? nextSelectableStyle.lineThickness + 3 : nextSelectableStyle.lineThickness
              }
              const polylineGraphic = new Graphic({
                geometry: feature.geometry,
                attributes: feature.attributes,
                symbol: polylineSymbol as unknown as __esri.SymbolUnion
              })
              nextSelectableFeatures.push(polylineGraphic)
            }
          }
        })
        if (nextSelectableFeatures && nextSelectableFeatures.length > 0 && !this.state.isCancelButtonClick) {
          this._nextPossibleSelectionLayer.graphics.addMany(nextSelectableFeatures)
        }
      }
      setTimeout(() => {
        this.updateStateCanAddToSelection()
      }, 200)
    }, (err) => {
      console.log(err)
      this.updateStateCanAddToSelection()
    })
  }

  updateStateCanAddToSelection = () => {
    this.state.currentSketchVM?.cancel()
    //based on possible next selection show or hide the addToSelection tool
    const results = this._nextPossibleSelectionLayer.graphics.filter((graphic) => {
      return graphic.geometry.type === 'polyline'
    })
    let newState: boolean = false
    if (results.length > 0) {
      newState = true
    } else {
      if (this._newFeatureSelection) {
        this.setState({
          noGraphicAfterFirstSelection: true
        })
      } else {
        this.setState({
          noGraphicAfterFirstSelection: false
        })
      }
    }
    if (newState) {
      this._activateAddToSelectionTool()
    } else {
      this._deActivateAddToSelectionTool()
    }
  }

  _activateAddToSelectionTool = () => {
    if (!this.state.addToSelectionTool) {
      this.setState({
        addToSelectionTool: true
      })
    }

    if (this.state.jimuMapView && this.state.jimuMapView.view) {
      this.state.jimuMapView.view.popupEnabled = false
    }
    this._displayAddToSelectionCursor()
    this._nextPossibleSelectionLayer?.set('visible', true)
  }

  _deActivateAddToSelectionTool = () => {
    if (this.state.addToSelectionTool) {
      this.setState({
        addToSelectionTool: false
      })
    }
    if (this.state.jimuMapView && this.state.jimuMapView.view) {
      this.state.jimuMapView.view.popupEnabled = true
    }
    this._displayDefaultCursor()
    this._nextPossibleSelectionLayer?.set('visible', false)
  }

  _displayAddToSelectionCursor = () => {
    if (this.state.jimuMapView && this.state.jimuMapView.view) {
      if (this.state.jimuMapView.view && this.state.jimuMapView.view.container &&
        this.state.jimuMapView.view.container.style.cursor !== null) {
        this.state.jimuMapView.view.container.style.cursor = 'copy'
      }
    }
  }

  activateDrawOrSelectTool = () => {
    //Check for a valid sketch modal and then do the further processing
    if (this.state.currentSketchVM) {
      //Cancel sketchVM if newSelection or drawTool is active
      if (this.state.drawModeActive || this.state.selectModeActive) {
        this.state.currentSketchVM.cancel()
      }
      this.setState({
        onDrawingComplete: false,
        startChartRendering: false,
        viewModelErrorState: false,
        loadingIndicator: false,
        isCancelButtonClick: false
      }, () => {
        //Activate draw tool
        if (this.state.drawModeActive) {
          if (this._defaultViewModel) {
            this._defaultViewModel.start({ mode: 'sketch' })
          }
        }
        //Activate select tool
        if (this.state.selectModeActive) {
          this.state.currentSketchVM.create('point')
        }
      })
    }
  }

  destroyDrawingLayers = () => {
    if (this._drawingLayer) {
      this._drawingLayer.removeAll()
      this._drawingLayer.destroy()
    }
    if (this._nextPossibleSelectionLayer) {
      this._nextPossibleSelectionLayer.removeAll()
      this._nextPossibleSelectionLayer.destroy()
    }
    if (this._bufferLayer) {
      this._bufferLayer.removeAll()
      this._bufferLayer.destroy()
    }
    if (this._intersectionHighlightLayer) {
      this._intersectionHighlightLayer.removeAll()
      this._intersectionHighlightLayer.destroy()
    }
    this.hideChartPosition()
  }

  _displayDefaultCursor = () => {
    if (this.state.jimuMapView && this.state.jimuMapView.view) {
      if (this.state.jimuMapView.view && this.state.jimuMapView.view.container &&
        this.state.jimuMapView.view.container.style.cursor !== null) {
        this.state.jimuMapView.view.container.style.cursor = null
      }
    }
  }

  pointToExtent = (point, pixelTolerance: number = 5): Extent => {
    //calculate map coords represented per pixel
    const viewExtentWidth: number = this.state.jimuMapView.view.extent.width
    const viewWidth: number = this.state.jimuMapView.view.width
    const pixelWidth = viewExtentWidth / viewWidth
    //calculate map coords for tolerance in pixel
    const toleranceInMapCoords: number = pixelTolerance * pixelWidth
    //calculate & return computed extent
    const areaExtent = {
      xmin: (point.x - toleranceInMapCoords),
      ymin: (point.y - toleranceInMapCoords),
      xmax: (point.x + toleranceInMapCoords),
      ymax: (point.y + toleranceInMapCoords),
      spatialReference: this.state.jimuMapView.view.spatialReference
    }
    return new Extent(areaExtent)
  }

  selectableLayersAvailableAtRuntime = (layers: string[]) => {
    this._selectableLayersAtRuntime = layers
    this._isSelectableLayersChangedAtRuntime = true
    this.setState({
      updatedSelectableLayersAtRuntime: layers
    })
  }

  intersectingLayersAvailableAtRuntime = (layers: string[]) => {
    this._intersectingLayersAtRuntime = layers
    if (this._resultsAfterIntersectionTimeout) {
      clearTimeout(this._resultsAfterIntersectionTimeout)
    }
    this._resultsAfterIntersectionTimeout = setTimeout(() => {
      this._resultsAfterIntersectionTimeout = null
      this.createBufferGraphics()
    }, 500)
  }

  onSelectButtonClicked = () => {
    this.setState({
      initialStage: false,
      resultStage: true,
      selectModeActive: true,
      drawModeActive: false
    }, () => {
      this.activateDrawOrSelectTool()
    })
  }

  onDrawButtonClicked = () => {
    this.setState({
      initialStage: false,
      resultStage: true,
      selectModeActive: false,
      drawModeActive: true
    }, () => {
      this.activateDrawOrSelectTool()
    })
  }

  onBackClick = () => {
    this.clearAll()
    this.getSelectableLayers(this.state.currentDatasource)
    this.setState({
      initialStage: true,
      startChartRendering: false,
      onDrawingComplete: false,
      resultStage: false,
      drawModeActive: false,
      selectModeActive: false
    })
  }

  clearAll = (skipClearingSelectedFeatures?: boolean) => {
    if (this._defaultViewModel) {
      this._defaultViewModel.clear()
    }
    if (this.state.drawModeActive || this.state.selectModeActive) {
      this.state.currentSketchVM?.cancel()
    }
    this._deActivateAddToSelectionTool()
    this.clearGraphics()
    //remove the previously selection from other widgets
    this._selectedRecordsDsId = []
    this._selectedFeaturesRecords = []
    !skipClearingSelectedFeatures && this._mapView.clearSelectedFeatures()
    this.clearChart()
  }

  clearGraphics = () => {
    //remove drawn, chartPosition, selected and nextPossible selection graphics layer
    if (this._drawingLayer) {
      this._drawingLayer.removeAll()
    }
    if (this._nextPossibleSelectionLayer) {
      this._nextPossibleSelectionLayer.removeAll()
    }
    if (this._bufferLayer) {
      this._bufferLayer.removeAll()
    }
    if (this._intersectionHighlightLayer) {
      this._intersectionHighlightLayer.removeAll()
    }
    this.hideChartPosition()
  }

  clearChart = () => {
    //clear profile result, which will result in clearing the chart
    this.setState({
      profileResult: null,
      noFeaturesError: false
    }, () => {
      this.props?.outputDataSources?.forEach((outputDsId) => {
        this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.NotReady)
      })
    })
  }

  activateToolForNewProfile = () => {
    //Clear all the previous chart and graphics and create New Profile
    this.clearAll()
    this.setState({
      isCancelButtonClick: false,
      initialStage: false,
      resultStage: true
    }, () => {
      this.activateDrawOrSelectTool()
    })
  }

  onDoneButtonCLicked = (): boolean => {
    let enableNewProfileOption: boolean = false
    this._defaultViewModel.stop()
    if (this._defaultViewModel.state === 'created' || this._defaultViewModel.state === 'selected') {
      enableNewProfileOption = true
    }
    if (enableNewProfileOption) {
      this.stopFurtherSelectingLines()
    } else {
      this.activateDrawOrSelectTool()
    }
    this.setState({
      isCancelButtonClick: false
    })
    return enableNewProfileOption
  }

  stopFurtherSelectingLines = () => {
    this._deActivateAddToSelectionTool()
    if (this._nextPossibleSelectionLayer) {
      this._nextPossibleSelectionLayer.removeAll()
    }
  }

  highlightChartPosition = (x) => {
    if (this._defaultViewModel) {
      this._defaultViewModel.hoveredChartPosition = x
    }
  }

  hideChartPosition = () => {
    if (this._defaultViewModel) {
      this._defaultViewModel.hoveredChartPosition = null
    }
  }

  onViewsCreate = (views: { [viewId: string]: JimuMapView }) => {
    this.setState({
      isMapLoaded: true
    })
  }

  renderFrontLandingPage = () => {
    const activeDsConfigInfo = this.props.config.configInfo[this.state.currentDatasource]
    let isProfileSettingsEnabled = false
    if ((activeDsConfigInfo?.hasOwnProperty('advanceOptions') ||
      (activeDsConfigInfo?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled')))) {
      if ((activeDsConfigInfo?.hasOwnProperty('advanceOptions') || activeDsConfigInfo?.profileSettings?.isProfileSettingsEnabled)) {
        isProfileSettingsEnabled = true
      }
    }
    return (
      <div tabIndex={-1} className={'h-100 w-100 d-flex align-items-center mainSection'}>
        <div tabIndex={-1} className={'adjust-cards'}>
          <Card aria-label={this.nls('selectLinesDesc')} clickable data-testid='selectButton'
            className={classNames('front-cards mt-4 mb-4 shadow-2', this.state.updatedSelectableLayersAtRuntime.length > 0 && isProfileSettingsEnabled ? 'front-section' : 'hidden')}
            onClick={this.onSelectButtonClicked} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.onSelectButtonClicked()
              }
            }}>
            <CardBody className={'w-100 h-100 p-4'}>
              <div className={'title1 text-truncate'} style={{ textAlign: 'center' }}>{this.nls('selectLinesLabel')}</div>
              <p title={this.nls('selectLinesDesc')} className={'label1 m-4 userGuideInfo'}>
                {this.nls('selectLinesDesc')}
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button role={'button'} aria-label={this.nls('selectButtonLabel')} title={this.nls('selectButtonLabel')}
                  size={'default'} type='secondary' className={'text-break'}>
                  {this.props.config.generalSettings?.buttonStyle === ButtonTriggerType.IconText &&
                    <React.Fragment>
                      <Icon size='12' icon={epIcon.selectIcon} />
                      {this.nls('selectButtonLabel')}
                    </React.Fragment>
                  }
                </Button>
              </div>
            </CardBody>
          </Card>
          <Card aria-label={this.nls('drawProfileDesc')} clickable data-testid='drawButton'
            className={classNames('front-cards front-section mt-4 mb-4 shadow-2', this.state.updatedSelectableLayersAtRuntime.length === 0 || !isProfileSettingsEnabled ? 'h-100 ' : '')}
            onClick={this.onDrawButtonClicked} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.onDrawButtonClicked()
              }
            }}>
            <CardBody className={'w-100 h-100 p-4'}>
              <div className={'title1 text-truncate'} style={{ textAlign: 'center' }}>{this.nls('drawProfileLabel')}</div>
              <p title={this.nls('drawProfileDesc')} className={'label1 m-4 userGuideInfo'}>
                {this.nls('drawProfileDesc')}
              </p>
              <div style={{ textAlign: 'center' }}>
                <Button role={'button'} aria-label={this.nls('drawButtonLabel')} title={this.nls('drawButtonLabel')}
                  size={'default'} type='secondary' className={'text-break'}>
                  {this.props.config.generalSettings?.buttonStyle === ButtonTriggerType.IconText &&
                    <React.Fragment>
                      <Icon size='12' icon={epIcon.drawIcon} />
                      {this.nls('drawButtonLabel')}
                    </React.Fragment>
                  }
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  resetToDefault = () => {
    //clears the output data source statistics
    this.buildStatsValuesAsOutput(null, this.props.outputDataSources?.[0], this.state.selectedElevationUnit, this.state.selectedLinearUnit, false)
    if (this.state.drawModeActive || this.state.selectModeActive) {
      this.state.currentSketchVM?.cancel()
    }
    if (this._defaultViewModel) {
      this._defaultViewModel.clear()
    }
    this.clearGraphics()
    this._displayDefaultCursor()
  }

  render () {
    const frontPage = this.renderFrontLandingPage()
    let jmc
    const useMapWidget = this.props.useMapWidgetIds &&
                         this.props.useMapWidgetIds[0]
    // If the user has selected a map, include JimuMapViewComponent.
    if (this.props.hasOwnProperty('useMapWidgetIds') &&
      this.props.useMapWidgetIds &&
      this.props.useMapWidgetIds.length === 1) {
      jmc = <JimuMapViewComponent
        useMapWidgetId={this.props.useMapWidgetIds[0]} onActiveViewChange={this.activeViewChangeHandler.bind(this)}
        onViewsCreate={this.onViewsCreate} />
    }

    //If map widget is not available or deleted then widget should revert to placeholder instantly
    if (!useMapWidget) {
      this.resetToDefault()
      return (
        <WidgetPlaceholder
          icon={epIcon.elevationIcon} widgetId={this.props.id} data-testid={'widgetPlaceholder'}
          name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: this.nls('_widgetLabel') })}
        />
      )
    }

    const useAllDs = []
    let dsToGetSelectedOnLoad = null
    const activeDsConfigInfo = this.props.config.configInfo[this.state.currentDatasource]
    if (this.state.dsToGetSelectedOnLoad) {
      if (activeDsConfigInfo && (activeDsConfigInfo?.hasOwnProperty('advanceOptions') ||
      (activeDsConfigInfo?.profileSettings?.hasOwnProperty('isProfileSettingsEnabled') &&
      activeDsConfigInfo?.profileSettings?.hasOwnProperty('isCustomizeOptionEnabled')))) {
        if (!activeDsConfigInfo?.advanceOptions || (activeDsConfigInfo?.profileSettings?.isProfileSettingsEnabled &&
          !activeDsConfigInfo?.profileSettings?.isCustomizeOptionEnabled)) {
        //if ground option is enabled in config then get all the layer from data source
          const dataSource: DataSource[] = getAllLayersFromDataSource(this.state.currentDatasource)
          dataSource?.forEach((layer: FeatureLayerDataSource) => {
            if (layer && layer.getLayerDefinition() && layer.getLayerDefinition().geometryType &&
              layer.getLayerDefinition().geometryType === 'esriGeometryPolyline') {
              useAllDs.push({
                dataSourceId: layer.id,
                mainDataSourceId: layer.id,
                rootDataSourceId: this.state.currentDatasource,
                fields: []
              })
              dsToGetSelectedOnLoad = useAllDs?.filter((ds) => ds.dataSourceId === this.state.dsToGetSelectedOnLoad)
            }
          })
        } else { //if customize option is enabled in config then use the configured layers from config
          dsToGetSelectedOnLoad = this.props.useDataSources?.filter((ds) => ds.dataSourceId === this.state.dsToGetSelectedOnLoad)
        }
      }
      dsToGetSelectedOnLoad = dsToGetSelectedOnLoad.length > 0 ? dsToGetSelectedOnLoad[0] : null
    }
    return (
      <Paper css={getStyle(this.props.theme)} shape='none' className='jimu-widget'>
        <div className='widget-elevation-profile'>
          {!this.state.layersLoaded &&
            <React.Fragment >
              <Loading type={LoadingType.Donut} />
              <p className='loading-text pt-2'>{this.nls('mapLoadingMsg')}</p>
            </React.Fragment>
          }
          {this.state.layersLoaded && this.state.onWidgetLoadShowLoadingIndicator && this.state.isMapLoaded &&
            <Loading type={LoadingType.Donut} />
          }
          {jmc}
          {dsToGetSelectedOnLoad &&
            <DataSourceComponent
              useDataSource={dsToGetSelectedOnLoad}
              onDataSourceInfoChange={this.onDataSourceInfoChange}
              widgetId={this.props.id}
            />
          }
          {!this.state.onWidgetLoadShowLoadingIndicator && this.state.initialStage &&
            frontPage
          }
          {!this.state.onWidgetLoadShowLoadingIndicator && this.state.resultStage &&
            <ResultPane
              theme={this.props.theme}
              intl={this.props.intl}
              widgetId={this.props.id}
              isMobile={this.props.browserSizeMode === BrowserSizeMode.Small}
              displayLoadingIndicator={this.state.loadingIndicator || this.state.nextPossibleloadingIndicator}
              activeDataSource={this.state.currentDatasource}
              commonDsGeneralSettings={this.props.config.generalSettings}
              defaultConfig={this._defaultConfig}
              activeDatasourceConfig={this.props.config.configInfo[this.state.currentDatasource]}
              profileResult={this.state.profileResult}
              intersectionResult={this.state.intersectionResult}
              visibleGroundProfileStats={this._defaultViewModel?.visibleProfiles}
              selectMode={this.state.selectModeActive}
              drawMode={this.state.drawModeActive}
              onDrawingComplete={this.state.onDrawingComplete}
              isNewSegmentsForSelection={this.state.addToSelectionTool}
              noGraphicAfterFirstSelection={this.state.noGraphicAfterFirstSelection}
              chartRender={this.state.startChartRendering}
              noFeaturesFoundError={this.state.noFeaturesError}
              onNavBack={this.onBackClick}
              doneClick={this.onDoneButtonCLicked}
              activateDrawSelectToolForNewProfile={this.activateToolForNewProfile}
              selectableLayersRuntime={this.selectableLayersAvailableAtRuntime}
              intersectingLayersRuntime={this.intersectingLayersAvailableAtRuntime}
              chartPosition={this.highlightChartPosition}
              hideChartPosition={this.hideChartPosition}
              buildOutputStatistics={this.buildOutputStatistics}
              intersectingBufferRuntime={this.onBufferChange}
              cancelButtonClicked={this.onCancelButtonClick}
              drawingLayer={this._drawingLayer}
              intersectionHighlightLayer={this._intersectionHighlightLayer}
              jimuMapView={this.state.jimuMapView}
              viewModelErrorState={this.state.viewModelErrorState}
              profileErrorMsg={this.state.profileErrorMsg}
              chartDataUpdateTime={this.state.chartDataUpdateTime}
              currentPageId={this.props.currentPageId}
              addedElelvationProfileLayers={this.state.addedElevationLayers}
              groundLayerId={this.state.groundLayerId}
              newAddedLayer={this.state.newAddedLayer}
              profileSettingsForNewAddedLayer={this.state.profileSettingsForNewAddedLayer}
            />
          }
        </div >
      </Paper>
    )
  }
}
