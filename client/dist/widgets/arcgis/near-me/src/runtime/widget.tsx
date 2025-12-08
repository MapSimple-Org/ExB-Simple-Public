/* eslint-disable no-prototype-builtins */
/** @jsx jsx */
import { type JimuMapView, JimuMapViewComponent, geometryUtils, MapViewManager } from 'jimu-arcgis'
import {
  React, type AllWidgetProps, jsx, BaseWidget, getAppStore, OrderRule, lodash,
  type DataRecord, DataSourceManager, type DataSource, WidgetState, type IMState,
  DataActionManager, Immutable, DataSourceTypes, ReactResizeDetector, DataLevel, type QueryParams, type QueriableDataSource, DataSourceStatus, dataSourceUtils, JimuFieldType,
  MessageManager, DataRecordsSelectionChangeMessage,
  css,
  type DataRecordSet,
  type DataAction,
  classNames,
  DataSourceComponent,
  type MessageJson,
  type ImmutableObject,
  MessageType,
  type FeatureLayerDataSource, type FeatureDataRecord, type QueryRequiredInfo,
  type FieldSchema,
  CONSTANTS,
  MultipleDataSourceComponent, UrlManager, urlUtils, type SubtypeGroupLayerDataSource, type UseDataSource, type IMDataSourceInfo
} from 'jimu-core'
import { type IconComponentProps, Loading, LoadingType, WidgetPlaceholder, Alert, Label, Button, defaultMessages as jimuUIDefaultMessages, ConfirmDialog, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Paper, Typography } from 'jimu-ui'
import { type SearchSettings, type AnalysisSettings, type GeneralSettings, type IMConfig, type LayersInfo, type SumOfAreaLengthParam, AnalysisTypeName, type SummaryFieldsInfo, type SummaryAttributes } from '../config'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import LayerAccordion from './components/layer-accordion'
import AoiTool, { type AoiGeometries } from './components/aoi-tool'
import { getAllAvailableLayers, getDisplayField, getPortalUnit, getSelectedLayerInstance, getSearchWorkflow, getOutputDsId, getAllFieldsNames, formatSmallNumberWithSignificantDigits } from '../common/utils'
import { getALLFeatures } from '../common/query-feature-utils'
import FeatureSet from './components/features-set'
import { distanceUnitWithAbbr } from './constant'
import * as unionOperator from 'esri/geometry/operators/unionOperator'
import * as equalsOperator from 'esri/geometry/operators/equalsOperator'
import * as intersectionOperator from 'esri/geometry/operators/intersectionOperator'
import * as geodeticAreaOperator from 'esri/geometry/operators/geodeticAreaOperator'
import * as areaOperator from 'esri/geometry/operators/areaOperator'
import * as geodeticLengthOperator from 'esri/geometry/operators/geodeticLengthOperator'
import * as geodesicProximityOperator from 'esri/geometry/operators/geodesicProximityOperator'
import * as lengthOperator from 'esri/geometry/operators/lengthOperator'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import FeatureForm from 'esri/widgets/FeatureForm'
import { getHighLightSymbol } from '../common/highlight-symbol-utils'
import type { FormatNumberOptions } from 'react-intl'
import { CommonSummaryFieldValue, NumberFormatting, defaultHighlightResultsColor, transparentColor } from '../setting/constants'
import { RefreshOutlined } from 'jimu-icons/outlined/editor/refresh'
import { SaveOutlined } from 'jimu-icons/outlined/application/save'
import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import FeatureLayer from 'esri/layers/FeatureLayer'
import Graphic from 'esri/Graphic'
import SummaryResult from './components/summary-result'
import { versionManager } from '../version-manager'
import { ExportOutlined } from 'jimu-icons/outlined/editor/export'
import { colorUtils } from 'jimu-theme'
import Report from './components/report'
import { LeftOutlined } from 'jimu-icons/outlined/directional/left'
import workers from 'esri/core/workers/workers'

const widgetIcon = require('./assets/icons/nearme-icon.svg')
const closestIconComponent = require('jimu-icons/svg/outlined/gis/service-find-closest.svg')
const proximityIconComponent = require('jimu-icons/svg/outlined/gis/service-proximity.svg')
const summaryComponent = require('jimu-icons/svg/outlined/gis/service-summarize-within.svg')

interface ExtraProps {
  currentLocation: __esri.Point
  selectedIncidentLocation: DataRecord[]
  selectedDataSource: DataSource
  messageConfigs: ImmutableObject<{ [messageConfigId: string]: MessageJson }>
}

interface State {
  jimuMapView: JimuMapView
  searchSettings: SearchSettings
  analysisSettings: AnalysisSettings
  activeDataSource: string
  generalSettings: GeneralSettings
  aoiGeometries: AoiGeometries
  displayLayerAccordion: React.JSX.Element[]
  isClosestAddressShowing: boolean
  isMapAreaWarningMsgShowing: boolean
  listMaxHeight: string
  noResultsFoundMsg: string
  showNoResultsFoundMsg: boolean
  queryAborted: boolean
  msgActionGeometry: __esri.Geometry
  showExportButton: boolean
  isLayerAvailable: boolean
  isAnalysisLayerConfigured: boolean
  widgetWidth: number
  loadingAllFeaturesFromDs: boolean
  promptForDataAction: boolean
  showExportOptions: boolean
  dataSetArray: DataRecordSet[]
  actionNames: string[]
  actionNamesGroups: any
  isDropDownLoading: boolean
  actionElement: React.ReactElement
  dataSetUpdated: boolean
  onWidgetLoadShowLoadingIndicator: boolean
  isFilterActionBinded: boolean
  analysisTakingLongerTime: boolean
  showSaveIcon: boolean
  showFeatureForm: boolean
  currentPage: number
  formFailedMsg: string
  isSubmittingForm: boolean
  widgetClosed: boolean
  dsToGetSelectedOnLoad: string[]
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig> & ExtraProps, State> {
  //all required graphics layers for the widget
  public drawingLayer: __esri.GraphicsLayer
  public bufferLayer: __esri.GraphicsLayer
  public flashLayer: __esri.GraphicsLayer
  public highlightLayer: __esri.GraphicsLayer
  public highlightGraphicsLayers: __esri.GraphicsLayer[]
  public featuresByDsId: any
  public featuresByAnalysisId: any
  public closestFeaturesByIndexAndDsId: any
  public mapView: __esri.MapView | __esri.SceneView
  public portalUnit: string
  public activeCurrentDs: string
  public availableLayersIds: string[]
  public readonly divRef: React.RefObject<HTMLDivElement>
  public geometriesFromAction: any
  public actionTimeout: any
  private filtersAppliedOnDsId: string[]
  aoiToolRef = React.createRef<AoiTool>()
  dropdownRef = React.createRef<HTMLButtonElement>()
  widgetConRef = React.createRef<HTMLDivElement>()
  private abortControllerRef: AbortController[] = []
  private selectedPopupContainer: HTMLDivElement | null
  private selectedRecordsKey: string
  private selectedRecord: DataRecord
  private incidentGraphic: Graphic
  private skipHighlightRecordsOnMap: boolean
  private skipDsInfoChange: boolean
  private analysisLayersResults: any
  private summaryAttributes: SummaryAttributes
  private readonly proximityCountDataSetArr: DataRecordSet[]
  incidentGeomfeatureForm: __esri.FeatureForm
  bufferGeomfeatureForm: __esri.FeatureForm
  aoiValue: string

  static versionManager = versionManager
  static mapExtraStateProps = (state: IMState,
    props: AllWidgetProps<IMConfig>): ExtraProps => {
    return {
      currentLocation: props?.mutableStateProps?.currentLocation,
      selectedIncidentLocation: props?.mutableStateProps?.selectedIncidentLocation,
      selectedDataSource: props?.mutableStateProps?.selectedDataSource,
      messageConfigs: state?.appConfig?.messageConfigs
    }
  }

  constructor (props) {
    super(props)
    this.divRef = React.createRef()
    this.featuresByDsId = {}
    this.featuresByAnalysisId = {}
    this.closestFeaturesByIndexAndDsId = {}
    this.highlightGraphicsLayers = []
    this.geometriesFromAction = {}
    this.actionTimeout = null
    this.filtersAppliedOnDsId = []
    this.selectedPopupContainer = null
    this.selectedRecordsKey = ''
    this.selectedRecord = null
    this.incidentGraphic = null
    this.skipHighlightRecordsOnMap = false
    this.skipDsInfoChange = false
    this.analysisLayersResults = {}
    this.summaryAttributes = {}
    this.proximityCountDataSetArr = []
    this.aoiValue = ''
    this.state = {
      jimuMapView: null,
      searchSettings: null,
      activeDataSource: null,
      analysisSettings: null,
      generalSettings: this.props.config.generalSettings,
      aoiGeometries: null,
      displayLayerAccordion: [],
      isClosestAddressShowing: false,
      isMapAreaWarningMsgShowing: false,
      listMaxHeight: '',
      noResultsFoundMsg: this.props.config.generalSettings.noResultsFoundText !== '' ? this.props.config.generalSettings.noResultsFoundText : this.nls('noDataMessageDefaultText'),
      showNoResultsFoundMsg: false,
      queryAborted: false,
      msgActionGeometry: null,
      showExportButton: this.props.enableDataAction !== undefined ? this.props.enableDataAction : true,
      isLayerAvailable: true,
      isAnalysisLayerConfigured: true,
      widgetWidth: null,
      loadingAllFeaturesFromDs: false,
      promptForDataAction: false,
      showExportOptions: false,
      dataSetArray: [],
      actionNames: [],
      actionNamesGroups: {},
      isDropDownLoading: false,
      actionElement: null,
      dataSetUpdated: false,
      onWidgetLoadShowLoadingIndicator: true,
      isFilterActionBinded: false,
      analysisTakingLongerTime: false,
      showSaveIcon: false,
      showFeatureForm: false,
      currentPage: 1,
      formFailedMsg: '',
      isSubmittingForm: false,
      widgetClosed: false,
      dsToGetSelectedOnLoad: []
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = async () => {
    if (!geodeticLengthOperator.isLoaded()) {
      await geodeticLengthOperator.load()
    }
    if (!geodeticAreaOperator.isLoaded()) {
      await geodeticAreaOperator.load()
    }
    if (!geodesicProximityOperator.isLoaded()) {
      await geodesicProximityOperator.load()
    }
    if (this.props.mutableStatePropsVersion?.selectedDataSource && this.props.selectedDataSource) {
      this.setState({
        promptForDataAction: true
      })
    } else if (this.props.mutableStatePropsVersion?.selectedIncidentLocation) {
      this.geometriesByDsIdFromAction(this.props?.selectedIncidentLocation)
    } else if (this.props.mutableStatePropsVersion?.currentLocation) {
      this.recordSelectedFromAction(this.props?.currentLocation)
    }
  }

  /**
   * Check the current config property or runtime property changed in live view
   * @param prevProps previous property
   * @param prevState previous state
   */
  componentDidUpdate = (prevProps, prevState) => {
    const currentWidgetState = getAppStore()?.getState()?.widgetsRuntimeInfo[this.props.id]?.state
    if (currentWidgetState === WidgetState.Opened || !currentWidgetState || currentWidgetState === WidgetState.Hidden) {
      //check for feature selected using message action
      // if featureRecord found and prev selected record is not matching with the current then only load the analysis info for selected feature location
      if (this.props?.selectedIncidentLocation) {
        const geometriesByDsId: any = this.props?.selectedIncidentLocation
        if (geometriesByDsId && (!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedIncidentLocation ||
          prevProps?.mutableStatePropsVersion?.selectedIncidentLocation !== this.props.mutableStatePropsVersion?.selectedIncidentLocation)) {
          this.geometriesByDsIdFromAction(geometriesByDsId)
        }
      }
      if (this.props?.selectedDataSource) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.selectedDataSource ||
          prevProps?.mutableStatePropsVersion?.selectedDataSource !== this.props.mutableStatePropsVersion?.selectedDataSource)) {
          this.setState({
            promptForDataAction: true
          })
        }
      }
      if (this.props?.currentLocation) {
        if ((!prevProps || !prevProps.mutableStatePropsVersion || !prevProps.mutableStatePropsVersion.currentLocation ||
          prevProps?.mutableStatePropsVersion?.currentLocation !== this.props.mutableStatePropsVersion?.currentLocation)) {
          this.recordSelectedFromAction(this.props?.currentLocation)
        }
      }
    }

    if (this.props.state !== prevProps.state && (currentWidgetState === WidgetState.Closed || currentWidgetState === WidgetState.Hidden)) {
      //if widget is closed/hidden then deactivate the active sketch tools
      this.setState({
        widgetClosed: true
      })
      //if keep results when widget closed/hidden is disabled from config then clear the analysis results and the drawing from the map
      if (!this.props.config.generalSettings.keepResultsWhenClosed) {
        this.aoiToolRef?.current?.clearAll()
      }
    }

    //if widget is open then update the sketch tools and results according to the widget config option
    if (this.props.state !== prevProps.state && currentWidgetState === WidgetState.Opened) {
      this.setState({
        widgetClosed: false
      })
    }

    //if map is changed, then get the updated active jimuMapView or if map gets undo/redo
    if (prevProps.useMapWidgetIds !== this.props.useMapWidgetIds) {
      const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(this.state.jimuMapView?.id)
      if (jimuMapView) {
        this.setState({
          jimuMapView: jimuMapView
        })
      }
    }

    //check if active datasource is changed
    if (prevState.state?.activeDataSource !== this.state.activeDataSource) {
      this.setState({
        activeDataSource: this.state.activeDataSource
      })
    }

    //check if the search settings are changed
    if (this.state.activeDataSource) {
      const currentActiveDsConfig = this.props.config.configInfo?.[this.state.activeDataSource]
      const prevActiveDsConfig = prevProps.config.configInfo?.[this.state.activeDataSource]
      if (!lodash.isDeepEqual(prevActiveDsConfig?.searchSettings, currentActiveDsConfig?.searchSettings)) {
        if (this.didSearchSettingsChanged(prevActiveDsConfig?.searchSettings, currentActiveDsConfig?.searchSettings)) {
          this.resetFeatureForm()
          //clear incident/buffer geometries if any search settings changed except heading label
          this.setState({
            aoiGeometries: null,
            searchSettings: currentActiveDsConfig?.searchSettings,
            showExportOptions: false
          }, () => {
            this.isValidLayerConfigured()
            const { searchCurrentExtent, showAllFeatures } = getSearchWorkflow(this.state.searchSettings)
            if (searchCurrentExtent) {
              this.checkIfFilterMessageActionBinded()
            }
            if (showAllFeatures && this.state.jimuMapView) {
              this.onClear()
              this.queryLayers()
              this.resizeLayerListHeight()
            } else {
              this.setState({
                showNoResultsFoundMsg: false,
                queryAborted: false,
                displayLayerAccordion: []
              })
            }
          })
        } else {
          //only heading label is changed
          this.setState({
            searchSettings: currentActiveDsConfig?.searchSettings
          }, () => {
            this.resizeLayerListHeight()
            const { searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
            if (searchCurrentExtent) {
              this.checkIfFilterMessageActionBinded()
            }
          })
        }
      }

      //check if analysis settings is changed
      if (this.didAnalysisSettingsChanged(prevActiveDsConfig?.analysisSettings?.layersInfo,
        currentActiveDsConfig?.analysisSettings?.layersInfo) ||
        prevActiveDsConfig?.analysisSettings?.displayAnalysisIcon !== currentActiveDsConfig?.analysisSettings?.displayAnalysisIcon ||
        prevActiveDsConfig?.analysisSettings?.displayMapSymbols !== currentActiveDsConfig?.analysisSettings?.displayMapSymbols ||
        prevActiveDsConfig?.analysisSettings?.showDistFromInputLocation !== currentActiveDsConfig?.analysisSettings?.showDistFromInputLocation ||
        prevActiveDsConfig?.analysisSettings?.onlyShowLayersResult !== currentActiveDsConfig?.analysisSettings?.onlyShowLayersResult ||
        prevActiveDsConfig?.analysisSettings?.displayAllLayersResult !== currentActiveDsConfig?.analysisSettings?.displayAllLayersResult ||
        prevActiveDsConfig?.analysisSettings?.enableProximitySearch !== currentActiveDsConfig?.analysisSettings?.enableProximitySearch ||
        !lodash.isDeepEqual(prevActiveDsConfig?.analysisSettings?.saveFeatures, currentActiveDsConfig?.analysisSettings?.saveFeatures)
      ) {
        let isLayerAvailable = this.state.isLayerAvailable
        if (!isLayerAvailable) {
          this.availableLayersIds = []
          const allDsLayers = getAllAvailableLayers(this.state.jimuMapView.id)
          if (allDsLayers.length > 0) {
            allDsLayers.forEach((layer: any) => {
              if (layer?.layerDefinition?.geometryType) {
                this.availableLayersIds.push(layer.id)
              }
            })
          }
          isLayerAvailable = this.availableLayersIds.length > 0
        }
        this.setState({
          analysisSettings: currentActiveDsConfig?.analysisSettings,
          isLayerAvailable: isLayerAvailable,
          onWidgetLoadShowLoadingIndicator: false
        }, () => {
          if (!lodash.isDeepEqual(prevActiveDsConfig?.analysisSettings?.saveFeatures, currentActiveDsConfig?.analysisSettings?.saveFeatures)) {
            this.resetFeatureForm()
          }
          if (this.state.displayLayerAccordion.length > 0 &&
            prevActiveDsConfig?.analysisSettings?.displayAllLayersResult !== currentActiveDsConfig?.analysisSettings?.displayAllLayersResult) {
            //enable the visibility of all configured layers and
            //return search results when they are turned off in the web map or during runtime using Layer List widget.
            currentActiveDsConfig?.analysisSettings?.layersInfo.forEach((layerInfo) => {
              if (this.availableLayersIds.includes(layerInfo.useDataSource.dataSourceId) ||
                (layerInfo.useDataSource.dataViewId && this.availableLayersIds.includes(layerInfo.useDataSource.mainDataSourceId))) {
                const mapFeatureLayer = this.state.jimuMapView.getJimuLayerViewByDataSourceId(layerInfo.useDataSource.dataSourceId)?.layer
                if (mapFeatureLayer && !mapFeatureLayer.visible && this.state.analysisSettings.displayAllLayersResult) {
                  mapFeatureLayer.visible = true
                }
              }
            })
            return
          }
          this.isValidLayerConfigured()
          // if only show layers results changed update the filter according to current state
          if (this.state.analysisSettings?.onlyShowLayersResult !== prevState.analysisSettings?.onlyShowLayersResult) {
            this.onOnlyShowLayerResultsChanged()
          } else if (this.isLayerQueryNeeded(prevActiveDsConfig?.analysisSettings?.layersInfo,
            currentActiveDsConfig?.analysisSettings?.layersInfo)) {
              this.onRefreshResult()
            if (this.state.searchSettings?.searchByActiveMapArea) {
              this.aoiToolRef.current?.getMapExtentGeometry()
            }
          } else {
            this.setState({
              dataSetArray: []
            }, () => {
              this.displayAnalysisLayerInfo()
            })
            if (this.state.searchSettings?.searchByActiveMapArea) {
              this.aoiToolRef.current?.getMapExtentGeometry()
            }
          }
        })
      }
    }

    //check if general settings is changed
    if (!lodash.isDeepEqual(prevProps.config.generalSettings, this.props.config.generalSettings)) {
      this.setState({
        generalSettings: this.props.config.generalSettings
      })
    }

    //check if enable data action and individual action props is changed
    if (prevProps.enableDataAction !== this.props.enableDataAction ||
      !lodash.isDeepEqual(this.props.dataActions, prevProps.dataActions)
    ) {
      this.setState({
        showExportButton: this.props.enableDataAction !== undefined ? this.props.enableDataAction : true
      }, () => {
        this.setState({
          dataSetArray: []
        })
        this.displayAnalysisLayerInfo()
      })
    }

    //update the highlight bar in popup details
    if (this.selectedPopupContainer && prevProps.theme?.sys.color?.primary.main !== this.props.theme?.sys.color?.primary.main) {
      this.selectedPopupContainer.style.borderColor = this.props.theme?.sys.color?.primary.main
    }

    //On font size percentage change update the list to avoid double scrollbar
    if (prevProps.theme.ref.typeface.htmlFontSize !== this.props.theme.ref.typeface.htmlFontSize) {
      this.resizeLayerListHeight()
    }

    //on message config change update the hide or show the Update result button in case current map area
    if (!lodash.isDeepEqual(prevProps.messageConfigs, this.props.messageConfigs) ||
      !lodash.isDeepEqual(prevProps.useDataSources, this.props.useDataSources)) {
      const { searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      if (searchCurrentExtent) {
        this.checkIfFilterMessageActionBinded()
      }
    }
  }

  /**
   * Check if the filter message action is binded in the map widget
   */
  checkIfFilterMessageActionBinded = () => {
    //consider 'filter data record action' is not binded
    let isFilterActionBinded = false
    //loop through all the actions and find 'filter data record action' for the mapWidget used in nearme and has datasource used in the widget
    for (const messageId in this.props.messageConfigs) {
      const messageActionConfigItem = this.props.messageConfigs[messageId]
      //if current messageActionConfigItem is for map which is configured in near me and the action is for Extent change
      if (this.props.useMapWidgetIds.includes(messageActionConfigItem?.widgetId) && messageActionConfigItem?.messageType === MessageType.ExtentChange) {
        //in Extent change  look for 'filter data record action'
        const allUsedDSIds = this.props.useDataSources.map(obj => obj.dataSourceId)
        messageActionConfigItem.actions?.some((action) => {
          if (action.actionName === 'filter data record action' && action.useDataSources?.length) {
            const results = action.useDataSources.filter(useDs => allUsedDSIds.includes(useDs.dataSourceId))
            if (results.length) {
              isFilterActionBinded = true
              return true
            }
          }
          return false
        })
      }
    }
    //finally set the filterActionBinded state which will control the visibility of update button
    //if this is false we will see the update button
    this.setState({
      isFilterActionBinded: isFilterActionBinded
    })
  }

  /**
   * On widget delete clear all the graphics from the map
   */
  componentWillUnmount = () => {
    this.onClear()
  }

  /**
   * Get the selected feature record on initial load of the app in the preview mode
   * Checks the URL parameters on load to find any pre-selected features.
   * It identifies the data sources and specific records that are selected
   * and updates the state to trigger the analysis for them.
   */
  getSelectedFeatureRecordsOnLoad = async () => {
    const urlManager = UrlManager.getInstance()
    const dsInfos = urlUtils.getDataSourceInfosFromUrlParams(urlManager.getQueryObject(), urlManager.getHashObject())
    const selectedLayerDsIds: string[] = []
    for (const dsLayerId in dsInfos) {
      let selectedLayerDsId = dsLayerId
      const layerDataSource = DataSourceManager.getInstance().getDataSource(dsLayerId)
      if (layerDataSource?.type === DataSourceTypes.SubtypeGroupLayer) {
        //get the sublayer datasource by record id
        const subLayerDataSource = await (layerDataSource as SubtypeGroupLayerDataSource).getSublayerDataSourceByRecordId((dsInfos[dsLayerId]?.selection as any).ids[0])
        selectedLayerDsId = subLayerDataSource.id
      }
      const selection = dsInfos[dsLayerId]?.selection as any
      if (selection?.ids?.length || selection?.queryParams?.geometry || selection?.queryParams?.where) {
        selectedLayerDsIds.push(selectedLayerDsId)
      }
    }
    // If any data sources with selections were found, update the state.
    // This will trigger the onDataSourceInfoChange listener to process the selections.
    if (selectedLayerDsIds.length > 0) {
      this.setState({
        dsToGetSelectedOnLoad: selectedLayerDsIds
      })
    }
  }

  /**
   * Handles data source changes for all the ds having selected records onload.
   * This function extracts their geometries and triggers an action to process them.
   * @param infos - `IMDataSourceInfo` contains information about the ds, including selected record IDs.
   */
  onDataSourceInfoChange = (infos: { [dataSourceId: string]: IMDataSourceInfo }) => {
    // Exit if no info or if any info object is missing selection data.
    if (!infos || Object.values(infos).some(info => !('selectedIds' in info))) {
      return
    }
    // Object to store geometries grouped by their data source ID.
    const geometriesByDsId: { [key: string]: __esri.Geometry[] } = {}

    // Iterate over each data source that has selected records.
    Object.keys(infos).forEach(dsId => {
      // Get the data source instance.
      const ds = DataSourceManager.getInstance().getDataSource(dsId) as FeatureLayerDataSource
      if (!ds) return

      // Get all selected records from the data source.
      const selectedRecords = ds.getSelectedRecords()
      for (const record of selectedRecords) {
        // Extract the geometry from each record's feature.
        const geometry = (record as any).getFeature()?.geometry
        if (geometry) {
          // Initialize the array if it doesn't exist, then add the geometry.
          if (!geometriesByDsId[dsId]) {
            geometriesByDsId[dsId] = []
          }
          geometriesByDsId[dsId].push(geometry)
        }
      }
    })

    if (Object.keys(geometriesByDsId).length > 0) {
      this.skipHighlightRecordsOnMap = true
      this.geometriesByDsIdFromAction(geometriesByDsId)
    }

    this.setState({
      dsToGetSelectedOnLoad: []
    })
  }

  /**
   * Get all features from datasource and each geometries by ds id from action
   */
  getAllFeaturesFromSelectedDs = () => {
    // use abortController to make the selecting task cancelable
    const abortController = new AbortController()
    this.abortControllerRef.push(abortController)

    const geometriesByDsId = {}
    let dsID: string = ''
    dsID = this.props.selectedDataSource?.id
    if (!geometriesByDsId[dsID]) {
      geometriesByDsId[dsID] = []
    }
    this.setState({
      loadingAllFeaturesFromDs: true,
      analysisTakingLongerTime: false
    }, () => {
      let minTimeOut = setTimeout(() => {
        if (minTimeOut) {
          clearTimeout(minTimeOut)
          minTimeOut = null
        }
        this.setState({
          analysisTakingLongerTime: true
        })
      }, 10000)
      let outFields
      this.props.useDataSources.forEach((dataS) => {
        if (dataS.dataSourceId === this.props.selectedDataSource.id) {
          outFields = dataS.fields ?? []
        }
      })
      getALLFeatures(this.props.selectedDataSource, null, true, this.state.jimuMapView.view.spatialReference, outFields, abortController.signal).then((features) => {
        if (minTimeOut) {
          clearTimeout(minTimeOut)
          minTimeOut = null
        }
        if (features?.length > 0) {
          features.forEach((eachFeature: any) => {
            geometriesByDsId[dsID].push(eachFeature.feature.geometry)
          })
          this.geometriesByDsIdFromAction(geometriesByDsId)
        } else {
          this.setState({
            loadingAllFeaturesFromDs: false,
            analysisTakingLongerTime: false
          })
        }
      }, () => {
        if (minTimeOut) {
          clearTimeout(minTimeOut)
          minTimeOut = null
        }
        this.setState({
          loadingAllFeaturesFromDs: false,
          analysisTakingLongerTime: false
        })
      })
    })
  }

  /**
   * On Proceed button click close the prompt and get all the features and perform the analysis
   */
  analyzeAllFeatures = () => {
    this.setState({
      promptForDataAction: false
    })
    this.getAllFeaturesFromSelectedDs()
  }

  /**
   * On prompt close button click do not perform any process
   */
  onCancelButtonClicked = () => {
    this.setState({
      promptForDataAction: false,
      loadingAllFeaturesFromDs: false
    })
  }

  /**
   * Set the multiple features selected by other widgets as a set location in NM
   * @param selectedGeometriesByDsId selected feature geometry from action
   */
  geometriesByDsIdFromAction = (selectedGeometriesByDsId) => {
    const dsIds = Object.keys(selectedGeometriesByDsId)
    //Get the keys of each selected geometries and
    //loop through the array of datasource id and assign geometry of selected features to the class level variable
    dsIds.forEach((dsId) => {
      this.geometriesFromAction[dsId] = selectedGeometriesByDsId[dsId]
    })
    if (this.actionTimeout) {
      clearTimeout(this.actionTimeout)
    }
    this.actionTimeout = setTimeout(async () => {
      const geometryByTypes = {
        point: [],
        polyline: [],
        polygon: [],
        multipoint: []
      }
      const uniqueGeometryTypes = []
      const dsIds = Object.keys(this.geometriesFromAction)
      const dsManager = DataSourceManager.getInstance()
      //1. create array of unique geometry types
      //2. create object of geometries by geometry type
      dsIds.forEach((dsId) => {
        const dataSource = dsManager?.getDataSource(dsId)
        if (dataSource?.getGeometryType()) {
          const geometryType = dataSourceUtils.changeRestAPIGeometryTypeToJSAPIGeometryType(dataSource.getGeometryType())
          if (!uniqueGeometryTypes.includes(geometryType)) {
            uniqueGeometryTypes.push(geometryType)
          }
          geometryByTypes[geometryType] = geometryByTypes[geometryType].concat(this.geometriesFromAction[dsId])
        }
      })
      let unionGeometry = null
      //If all the geometries are of one type
      if (uniqueGeometryTypes.length === 1) {
        //If multiple features are selected then get the union of all the geometries else get the only one selected geometry
        if (geometryByTypes[uniqueGeometryTypes[0]].length > 1) {
          unionGeometry = unionOperator.executeMany(geometryByTypes[uniqueGeometryTypes[0]]) //union
        } else {
          unionGeometry = geometryByTypes[uniqueGeometryTypes[0]][0]
        }
      } else if (uniqueGeometryTypes.length > 1) {
        //If geometries with different types are selected, create buffer for all the points, multipoints and lines geometries
        //and then union the buffer geometries with selected polygon geometry.
        //As a result we will get only one polygon geometry at the end
        let pointLineArray = geometryByTypes.point.concat(geometryByTypes.polyline)
        pointLineArray = pointLineArray.concat(geometryByTypes.multipoint)
        const bufferGeometry: any = await geometryUtils.createBuffer(pointLineArray, [0.1], 'meters')
        const allPolygonsArray = bufferGeometry.concat(geometryByTypes.polygon)
        unionGeometry = unionOperator.executeMany(allPolygonsArray) //union
      }
      this.recordSelectedFromAction(unionGeometry)
      this.geometriesFromAction = {}
    }, 1000)
  }

  /**
   * Once received the features from
   * 1. RecordSelectionChange
   * 2. After searching in the search tool of the map
   * 3. After using current location tool of the map
   * set it in the state and the analysis will be performed using it
   * @param featureRecordGeometry selected feature record geometry
   */
  recordSelectedFromAction = async (featureRecordGeometry: any) => {
    //whenever record is selected, perform the action only when search by location is enabled,
    //in case of show all features and show features in current map area, skip the selection
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    if (searchByLocation) {
      const mapSR = this.state.jimuMapView?.view?.spatialReference
      if (mapSR) {
        const projectedGeometries = await geometryUtils.projectToSpatialReference([featureRecordGeometry], mapSR)
        if (projectedGeometries?.length > 0 && projectedGeometries[0]) {
          this.setState({
            msgActionGeometry: projectedGeometries[0]
          })
        }
      }
    }
  }

  /**
   * check valid analysis layers are configured or not based on search settings
   */
  isValidLayerConfigured = () => {
    let validLayers: LayersInfo[]
    //filter closest analysis in case of current map extent or show all features
    const { showAllFeatures, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    if ((showAllFeatures || searchCurrentExtent) && this.state.analysisSettings?.layersInfo?.length > 0) {
      validLayers = this.state.analysisSettings?.layersInfo.filter((layerInfo: any) => {
        const analysisType = layerInfo.analysisInfo.analysisType
        return analysisType === AnalysisTypeName.Proximity || analysisType === AnalysisTypeName.Summary
      })
    }
    if (validLayers && this.hasValidDsIds()) {
      ///define search is off or search by map area is on and proximity and summary layers also configured
      this.setState({
        isAnalysisLayerConfigured: validLayers?.length > 0
      })
    } else {
      this.setState({
        isAnalysisLayerConfigured: this.hasValidDsIds() && this.state.analysisSettings?.layersInfo?.length > 0
      }, () => {
        //clear all highlights, geometries.... no analysis layer is configured
        if (!this.state.isAnalysisLayerConfigured) {
          this.onClear()
        }
      })
    }
  }

  /**
   * Check if the configured layer analysis includes valid available layer datasources
   */
  hasValidDsIds = () => {
    let validDs = false
    this.state.analysisSettings?.layersInfo?.some((layerInfo, index: number) => {
      if (this.availableLayersIds.includes(layerInfo.useDataSource.dataSourceId) ||
      (layerInfo.useDataSource.dataViewId && this.availableLayersIds.includes(layerInfo.useDataSource.mainDataSourceId))) {
        validDs = true
        return validDs
      }
      return false
    })
    return validDs
  }

  /**
   * check analysis Settings Changed or not
   * @param prevSettings old props
   * @param newSettings new props
   * @returns  boolean analysis Settings Change true or false
   */
  didAnalysisSettingsChanged = (prevSettings, newSettings): boolean => {
    let analysisSettingsChange = false
    newSettings?.some((newSettings, index: number) => {
      if (!prevSettings || newSettings.useDataSource.dataSourceId !== prevSettings[index]?.useDataSource.dataSourceId ||
        newSettings.label !== prevSettings[index]?.label ||
        !lodash.isDeepEqual(newSettings.analysisInfo, prevSettings[index]?.analysisInfo)) {
        analysisSettingsChange = true
        return true
      }
      return false
    })
    return newSettings?.length !== prevSettings?.length ? true : analysisSettingsChange
  }

  /**
   * check search Settings Changed or not
   * @param prevSearchSettings old search settings
   * @param newSearchSettings new searchSettings props
   * @returns  boolean search Settings Change true or false
  */
  didSearchSettingsChanged = (prevSearchSettings: SearchSettings, newSearchSettings: SearchSettings): boolean => {
    let searchSettingsChange = false
    if (!prevSearchSettings || !newSearchSettings || newSearchSettings.includeFeaturesOutsideMapArea !== prevSearchSettings.includeFeaturesOutsideMapArea ||
      newSearchSettings.bufferDistance !== prevSearchSettings.bufferDistance ||
      newSearchSettings.distanceUnits !== prevSearchSettings.distanceUnits ||
      newSearchSettings.searchByActiveMapArea !== prevSearchSettings.searchByActiveMapArea) {
      searchSettingsChange = true
      return true
    }
    return searchSettingsChange
  }

  /**
  * check layer query is needed or not based on analysis settings parameter change(dataSourceId,type,analysis settings length)
  * @param prevSettings old props
  * @param newSettings new props
  * @returns  boolean analysis Settings (dataSourceId,type,analysis settings length) Change true or false
  */
  isLayerQueryNeeded = (prevSettings, newSettings): boolean => {
    let analysisSettingsChange = false
    newSettings?.some((newSettings, index: number) => {
      if (!prevSettings || newSettings.useDataSource.dataSourceId !== prevSettings[index]?.useDataSource.dataSourceId ||
        ((newSettings.analysisInfo.analysisType === AnalysisTypeName.Closest || newSettings.analysisInfo.analysisType === AnalysisTypeName.Proximity) &&
        newSettings.analysisInfo.returnIntersectedPolygons !== prevSettings[index]?.analysisInfo.returnIntersectedPolygons) ||
        !lodash.isDeepEqual(newSettings.analysisInfo.fieldsToExport, prevSettings[index]?.analysisInfo.fieldsToExport) ||
        newSettings.analysisInfo.includeApproxDistance !== prevSettings[index]?.analysisInfo.includeApproxDistance) {
        analysisSettingsChange = true
        return true
      }
      return false
    })
    return newSettings?.length !== prevSettings?.length ? true : analysisSettingsChange
  }

  /**
   * Load configured analysis data sources
   * @param currentDataSourceId current data source id
   * @returns created data source
   */
  loadConfiguredDataSources = (currentDataSourceId: string): Array<Promise<DataSource>> => {
    const mapDs = DataSourceManager.getInstance().getDataSource(currentDataSourceId)
    const createdDs = []
    const uniqueUsedDsId = []
    this.props.config?.configInfo?.[currentDataSourceId]?.analysisSettings?.layersInfo?.forEach((individualLayer) => {
      !uniqueUsedDsId.includes(individualLayer.useDataSource.dataSourceId) && uniqueUsedDsId.push(individualLayer.useDataSource.dataSourceId)
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

  /**
   * handles map view change event
   * @param jimuMapView active map view
   */
  onActiveViewChange = async (jimuMapView: JimuMapView) => {
    this.availableLayersIds = []
    if (!(jimuMapView && jimuMapView.view)) {
      this.setState({
        isLayerAvailable: false,
        loadingAllFeaturesFromDs: false
      })
      return
    }
    this.setState({
      onWidgetLoadShowLoadingIndicator: true
    })
    await Promise.all(this.loadConfiguredDataSources(jimuMapView.dataSourceId))
    const allDsLayers = getAllAvailableLayers(jimuMapView.id)
    if (allDsLayers.length > 0) {
      allDsLayers.forEach((layer: any) => {
        if (layer?.layerDefinition?.geometryType) {
          this.availableLayersIds.push(layer.id)
        }
      })
      if (this.availableLayersIds.length) {
        this.setState({
          isLayerAvailable: true,
          onWidgetLoadShowLoadingIndicator: false
        })
      } else {
        this.setState({
          isLayerAvailable: false
        })
      }
    } else {
      this.setState({
        isLayerAvailable: false
      })
    }
    this.mapView = jimuMapView.view
    if (this.state.jimuMapView) {
      this.onClear()
      this.setState({
        analysisSettings: null
      })
    }
    if (jimuMapView) {
      //Check for the search tool from the map, and handle the select-result event
      //so that if anything is searched in the tool we can use that location as incident geometry
      jimuMapView.jimuMapTools?.forEach((tools) => {
        if (tools?.instance && tools.name === 'Search') {
          (tools.instance as HTMLArcgisSearchElement)?.addEventListener('arcgisSelectResult', (selection) => {
            if (selection?.detail?.result?.feature?.geometry) {
              this.recordSelectedFromAction(selection.detail.result.feature.geometry)
            }
          })
        }
      })
      this.setState({
        jimuMapView: jimuMapView
      }, () => {
        this.createGraphicsLayers()
        if (jimuMapView.dataSourceId === null) {
          this.setState({
            activeDataSource: null
          })
        } else if (this.state.jimuMapView.dataSourceId || this.props.config.configInfo[this.state.jimuMapView.dataSourceId]) {
          this.setState({
            activeDataSource: this.state.jimuMapView.dataSourceId
          }, () => {
            this.setConfigForDataSources()
          })
        }
      })
    }
  }

  /**
   * Set the configured settings for the respective datasource
   */
  setConfigForDataSources = () => {
    if (this.state.jimuMapView.dataSourceId !== '') {
      const activeDsConfig = this.props.config.configInfo[this.state.jimuMapView.dataSourceId]
      this.setState({
        searchSettings: activeDsConfig?.searchSettings,
        analysisSettings: activeDsConfig?.analysisSettings
      }, () => {
        this.isValidLayerConfigured()
        const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
        if (searchCurrentExtent) {
          this.checkIfFilterMessageActionBinded()
        }
        if (searchByLocation) {
          this.getSelectedFeatureRecordsOnLoad()
        }
        //only in case of show all features query the layers once the active data source is changed
        if (showAllFeatures && this.state.jimuMapView && this.state.analysisSettings) {
          this.queryLayers()
          this.resizeLayerListHeight()
        }
      })
    }
  }

  /**
   * handles aoiComplete event of aoi-tool component
   * @param aoiGeometries current aoi(buffer/incident) geometries
   */
  onAoiComplete = (aoiGeometries: AoiGeometries) => {
    this.featuresByDsId = {}
    this.featuresByAnalysisId = {}
    this.closestFeaturesByIndexAndDsId = {}
    this.setState({
      aoiGeometries: aoiGeometries
    }, () => {
      this.calculateAoiForPrint(aoiGeometries)
      this.queryLayers()
    })
  }

  /**
   * Calculate the area of interest value for pdf print
   * @param aoiGeometries current aoi(buffer/incident) geometries
   */
  calculateAoiForPrint = (aoiGeometries: AoiGeometries) => {
    this.aoiValue = ''
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    if (searchByLocation && aoiGeometries.bufferGeometry !== null && aoiGeometries.bufferGeometry.type === 'polygon') {
      const sr = aoiGeometries.bufferGeometry.spatialReference
      let value: number
      if (sr.wkid === 4326 || sr.isWebMercator || (sr.isGeographic)) {
        value = geodeticAreaOperator.execute(aoiGeometries.bufferGeometry as __esri.Polygon, { unit: ('square-' + aoiGeometries.distanceUnit) as __esri.AreaUnit })
      } else {
        value = areaOperator.execute(aoiGeometries.bufferGeometry as __esri.Polygon, { unit: ('square-' + aoiGeometries.distanceUnit) as __esri.AreaUnit })
      }
      this.aoiValue = this.props.intl.formatNumber(value, { maximumFractionDigits: 2 }) + ' ' + this.getSelectedUnitsAbbr(aoiGeometries.distanceUnit as __esri.LengthUnit) + '&sup2'
    }
  }

  /**
   * handles clear event of aoi-tool component, clears aoiGeometries state
   */
  onClear = () => {
    this.destroyHighlightGraphicsLayer()
    this.flashLayer?.removeAll()
    this.featuresByDsId = {}
    this.featuresByAnalysisId = {}
    this.closestFeaturesByIndexAndDsId = {}
    this.resetFeatureForm()
    this.resetFilters()
    this.clearMessageAction()
    this.props?.outputDataSources?.forEach((outputDsId) => {
      this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.NotReady)
    })
    this.setState({
      aoiGeometries: null,
      displayLayerAccordion: [],
      isClosestAddressShowing: false,
      msgActionGeometry: null,
      showNoResultsFoundMsg: false,
      queryAborted: false
    })
  }

  /**
   * Handles refresh button clicked event and refresh the result with same AOI
   */
  onRefreshResult = (isAutoRefresh?: boolean) => {
    this.destroyHighlightGraphicsLayer()
    this.flashLayer?.removeAll()
    this.featuresByDsId = {}
    this.featuresByAnalysisId = {}
    this.closestFeaturesByIndexAndDsId = {}
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    //reset the applied filters from near me widget
    //if autorefresh is disabled, specify location workflow and filter enabled in near me widget
    if (!isAutoRefresh && searchByLocation && this.state.analysisSettings?.onlyShowLayersResult) {
      this.resetFilters()
    }
    this.clearMessageAction()
    this.props?.outputDataSources?.forEach((outputDsId) => {
      this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.NotReady)
    })
    this.setState({
      dataSetArray: [],
      showExportOptions: false,
      showFeatureForm: false,
      currentPage: 1
    }, () => {
      this.queryLayers(isAutoRefresh)
    })
  }

  /**
   * get analysis type icon for layer
   * @param analysisType analysis type
   * @returns analysis type icon
   */
  getAnalysisTypeIcon = (analysisType: string): IconComponentProps => {
    let analysisTypeIcon: IconComponentProps
    if (analysisType === AnalysisTypeName.Closest) {
      analysisTypeIcon = closestIconComponent
    }
    if (analysisType === AnalysisTypeName.Proximity) {
      analysisTypeIcon = proximityIconComponent
    }
    if (analysisType === AnalysisTypeName.Summary) {
      analysisTypeIcon = summaryComponent
    }
    return analysisTypeIcon
  }

  /**
   * Get the field object with name, alias and type
   * @param field features field
   * @returns each inidvidual field
   */
  getFieldObj = (field: __esri.Field): __esri.Field => {
    // the function is supported to normalize the field.name
    const fieldName = field.name
    return {
      name: fieldName.replace(/\./g, '_').replace(/\(/g, '_').replace(/\)/g, '_'),
      alias: field.alias,
      type: field.type
    } as any
  }

  /**
   * Get the distance between incident geometry and each intersected feature geometry
   * @param incidentGeometry selected/drawn geometry
   * @param featureRecords intersecting feature records
   * @param distanceUnit selected distance unit
   * @returns promise of number array having distances of each intersected feature from incident geometry
   */
  getAllFeaturesDistance = async (incidentGeometry, featureRecords: FeatureDataRecord[], distanceUnit): Promise<number[]> => {
    const promise = new Promise<number[]>((resolve, reject) => {
      //if valid incident geometry found, then only proceed to get the distances
      if (incidentGeometry) {
        const intersectedGeometryJsonArray: any[] = []
        //get all the intersected geometries from the feature records
        for (let i = 0; i < featureRecords.length; i++) {
          if (featureRecords[i].feature.geometry) {
            intersectedGeometryJsonArray.push((featureRecords[i].feature.geometry as any).toJSON())
          }
        }
        if (intersectedGeometryJsonArray.length > 0) {
          let connection
          const workerUrl = `${this.props.context.folderUrl}dist/runtime/assets/workers/worker-distance-utils.js`
          workers.open(workerUrl)
            .then((conn) => {
              connection = conn
              // use abortController to make the worker task cancelable
              const abortController = new AbortController()
              this.abortControllerRef.push(abortController)
              //invoke the get distance method in the worker
              const selectedGeometryJson = incidentGeometry.toJSON()
              return conn.invoke("getDistance",
                {
                  selectedGeometryJson: selectedGeometryJson,
                  intersectedGeometryJsonArray: intersectedGeometryJsonArray,
                  distanceUnit: distanceUnit
                },
                {
                  signal: abortController.signal
                })
            }).then((result) => {
              // close the connection
              connection?.close()
              connection = null
              resolve(result)
            }, (err: Error) => {
              // close the connection
              connection?.close()
              connection = null
              reject(err)
            })
        }
      } else {
        resolve([])
      }
    })
    return promise
  }

  /**
   * get the features distance using distance units
   * @param selectedFeatures selected features on the map
   * @returns selected features
   */
  getFeaturesDistance = async (selectedFeatures: FeatureDataRecord[]) => {
    const promise = new Promise<FeatureDataRecord[]>((resolve) => {
      const { showAllFeatures, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      const portalUnit = getPortalUnit()
      //Use portal unit in case of show all features OR search by extent
      const distanceUnit = showAllFeatures || searchCurrentExtent
        ? portalUnit
        : this.state.aoiGeometries?.distanceUnit || this.state.searchSettings.distanceUnits || portalUnit
      //get the incident geometry
      const incidentGeometry = this.state.aoiGeometries.incidentGeometry4326 as __esri.geometryGeometry || this.state.aoiGeometries.incidentGeometry as __esri.geometryGeometry

      let distances
      this.getAllFeaturesDistance(incidentGeometry, selectedFeatures, distanceUnit)
        .then(result => {
          distances = result
          if (!distances) {
            resolve(null)
            return
          }
          const unitsAbbr = this.getSelectedUnitsAbbr(distanceUnit as __esri.LengthUnit)
          for (let i = 0; i < selectedFeatures.length; i++) {
            const tempFeature: any = selectedFeatures[i].feature
            if (incidentGeometry && tempFeature.geometry) {
              tempFeature.distance = distances[i] as number
              const formattedDistance = this.props.intl.formatNumber(tempFeature.distance, { maximumFractionDigits: 2 }) + ' ' + unitsAbbr
              if (tempFeature.attributes) {
                //add the esriCTApproxDistance attribute in the feature
                tempFeature.attributes.esriCTApproxDistance = formattedDistance
              } else {
                tempFeature.attributes = {
                  esriCTApproxDistance: formattedDistance
                }
              }
            } else {
              tempFeature.distance = 0
            }
          }
          resolve(selectedFeatures)
       }, () => {
        resolve(null)
       })
    })
    return promise
  }

  /**
   * Get the sorted features for sub groups
   * @param selectedFeatures selected features on the map
   * @param layerInfo analysis layers info
   * @param isSortByObjId sort feature by object id
   * @param objectIdField field of the layer
   * @returns selected features and sub group features
   */
  getSortedSubGroupFeatures = (selectedFeatures: DataRecord[], layerInfo: LayersInfo, isSortByObjId: boolean, objectIdField?: string) => {
    let sortingField = 'distance'
    let groupEnabled = false
    let sortByFieldEnabled = false
    let subGroupField = ''
    let subGroupsArr = []
    const layerAnalysisInfo = layerInfo.analysisInfo as any
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity) {
      if (!layerAnalysisInfo.sortFeaturesByDistance && layerAnalysisInfo.sortFeatures?.sortFeaturesByField) {
        sortingField = layerAnalysisInfo.sortFeatures.sortFeaturesByField
        sortByFieldEnabled = true
      }
      if (layerAnalysisInfo.groupFeaturesEnabled && layerAnalysisInfo.groupFeatures.groupFeaturesByField !== '' &&
      layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField !== '') {
        groupEnabled = true
        subGroupField = layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField
      }
    }
    //For show all features and search by map area if sort by distance is enabled then sort proximity features by objectId
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && isSortByObjId && !sortByFieldEnabled) {
      sortingField = objectIdField
    }
    if (groupEnabled) {
      for (let i = 0; i < selectedFeatures.length; i++) {
        const featureRecord = selectedFeatures[i] as any
        const featureValue = featureRecord.feature.attributes[subGroupField]
        const subGroupLabel = featureRecord.getFormattedFieldValue(subGroupField, this.props.intl)
        const gId = 'subGroup_' + layerInfo.useDataSource.dataSourceId + '_' + subGroupField + '_' + featureValue
        let addSubGroup = true
        let subGroup
        if (subGroupsArr.length > 0) {
          for (let j = 0; j < subGroupsArr.length; j++) {
            const groupInfo = subGroupsArr[j]
            if (gId === groupInfo.id) {
              if (featureValue === groupInfo.value) {
                addSubGroup = false
                subGroup = groupInfo
                break
              }
            }
          }
        }
        if (addSubGroup) {
          subGroupsArr.push({
            id: gId,
            value: featureValue,
            count: 1,
            label: subGroupLabel
          })
        } else {
          subGroupsArr.forEach(g => {
            if (g.id === (gId)) {
              subGroup = g
            }
          })
          subGroup.count += 1
        }
      }
    }

    if (groupEnabled && subGroupsArr.length > 0) {
      let subGroupSortingField = ''
      if (layerAnalysisInfo.subGroupFeatures.sortSubGroupsByCount) {
        subGroupSortingField = 'count'
      } else {
        subGroupSortingField = 'value'
      }
      const subGroups = this.divideGroupsByEmptyValue(subGroupsArr, subGroupSortingField)
      subGroupsArr = subGroups.groupsWithNonEmptyValue.sort(this.sortGroups(subGroupSortingField, layerAnalysisInfo.subGroupFeatures.subGroupFeaturesOrder))
      const sortedEmptyValueSubGroups = subGroups.groupsWithEmptyValue.sort(this.sortGroups(subGroupSortingField, layerAnalysisInfo.subGroupFeatures.subGroupFeaturesOrder))
      //show group with no value always at bottom
      if (subGroupSortingField && layerAnalysisInfo.subGroupFeatures.subGroupFeaturesOrder === OrderRule.Desc) {
        subGroupsArr = sortedEmptyValueSubGroups.concat(subGroupsArr)
      } else {
        subGroupsArr = subGroupsArr.concat(sortedEmptyValueSubGroups)
      }
    }

    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity) {
      const records = this.sortRecords(selectedFeatures, sortingField)
      selectedFeatures = records.notEmptyRecordsArr.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType, objectIdField))
      const featuresWithNullValue = records.emptyRecordArr.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType, objectIdField))
      if (sortByFieldEnabled && layerAnalysisInfo?.sortFeatures?.sortFeaturesOrder === OrderRule.Desc) {
        selectedFeatures = featuresWithNullValue.concat(selectedFeatures)
      } else {
        selectedFeatures = selectedFeatures.concat(featuresWithNullValue)
      }
    } else {
      //for closest type
      selectedFeatures = selectedFeatures.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType))
    }

    if (groupEnabled && subGroupsArr.length > 0) {
      subGroupsArr.forEach(group => {
        selectedFeatures.forEach(record => {
          const selectedRecord = record as any
          if (group.value === selectedRecord.feature.attributes[subGroupField]) {
            if (!group.features) {
              group.features = []
            }
            group.features.push(record)
          }
        })
      })
    }
    return {
      features: selectedFeatures,
      featuresSubGroup: subGroupsArr
    }
  }

  /**
   * Get the sorted features
   * @param selectedFeatures selected features on the map
   * @param layerInfo analysis layers info
   * @param isSortByObjId sort feature by object id
   * @param objectIdField field of the layer
   * @returns selected features and group features
   */
  getSortedFeatures = (selectedFeatures: DataRecord[], layerInfo: LayersInfo, isSortByObjId: boolean, objectIdField?: string) => {
    let sortingField = 'distance'
    let groupEnabled = false
    let sortByFieldEnabled = false
    let groupField = ''
    let groupsArr = []
    const layerAnalysisInfo = layerInfo.analysisInfo as any
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity) {
      if (!layerAnalysisInfo.sortFeaturesByDistance && layerAnalysisInfo.sortFeatures?.sortFeaturesByField) {
        sortingField = layerAnalysisInfo.sortFeatures.sortFeaturesByField
        sortByFieldEnabled = true
      }
      if (layerAnalysisInfo.groupFeaturesEnabled && layerAnalysisInfo.groupFeatures.groupFeaturesByField !== '') {
        groupEnabled = true
        groupField = layerAnalysisInfo.groupFeatures.groupFeaturesByField
      }
    }
    //For show all features and search by map area if sort by distance is enabled then sort proximity features by objectId
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && isSortByObjId && !sortByFieldEnabled) {
      sortingField = objectIdField
    }
    if (groupEnabled) {
      for (let i = 0; i < selectedFeatures.length; i++) {
        const featureRecord = selectedFeatures[i] as any
        const featureValue = featureRecord.feature.attributes[groupField]
        const groupLabel = featureRecord.getFormattedFieldValue(groupField, this.props.intl)
        const gId = 'group_' + layerInfo.useDataSource.dataSourceId + '_' + groupField + '_' + featureValue
        let addGroup = true
        let group
        if (groupsArr.length > 0) {
          for (let j = 0; j < groupsArr.length; j++) {
            const groupInfo = groupsArr[j]
            if (gId === groupInfo.id) {
              if (featureValue === groupInfo.value) {
                addGroup = false
                group = groupInfo
                break
              }
            }
          }
        }
        if (addGroup) {
          groupsArr.push({
            id: gId,
            value: featureValue,
            count: 1,
            label: groupLabel
          })
        } else {
          groupsArr.forEach(g => {
            if (g.id === (gId)) {
              group = g
            }
          })
          group.count += 1
        }
      }
    }

    if (groupEnabled && groupsArr.length > 0) {
      let groupSortingField = ''
      if (layerAnalysisInfo.groupFeatures.sortGroupsByCount) {
        groupSortingField = 'count'
      } else {
        groupSortingField = 'value'
      }
      const groups = this.divideGroupsByEmptyValue(groupsArr, groupSortingField)
      groupsArr = groups.groupsWithNonEmptyValue.sort(this.sortGroups(groupSortingField, layerAnalysisInfo.groupFeatures.groupFeaturesOrder))
      const sortedEmptyValueGroups = groups.groupsWithEmptyValue.sort(this.sortGroups(groupSortingField, layerAnalysisInfo.groupFeatures.groupFeaturesOrder))
      //show group with no value always at bottom
      if (groupSortingField && layerAnalysisInfo.groupFeatures.groupFeaturesOrder === OrderRule.Desc) {
        groupsArr = sortedEmptyValueGroups.concat(groupsArr)
      } else {
        groupsArr = groupsArr.concat(sortedEmptyValueGroups)
      }
    }

    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity) {
      const records = this.sortRecords(selectedFeatures, sortingField)
      selectedFeatures = records.notEmptyRecordsArr.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType, objectIdField))
      const featuresWithNullValue = records.emptyRecordArr.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType, objectIdField))
      if (sortByFieldEnabled && layerAnalysisInfo?.sortFeatures?.sortFeaturesOrder === OrderRule.Desc) {
        selectedFeatures = featuresWithNullValue.concat(selectedFeatures)
      } else {
        selectedFeatures = selectedFeatures.concat(featuresWithNullValue)
      }
    } else {
      //for closest type
      selectedFeatures = selectedFeatures.sort(this.sortFeatureList(sortingField, layerAnalysisInfo.analysisType))
    }

    if (groupEnabled && groupsArr.length > 0) {
      groupsArr.forEach(group => {
        selectedFeatures.forEach(record => {
          const selectedRecord = record as any
          if (group.value === selectedRecord.feature.attributes[groupField]) {
            if (!group.features) {
              group.features = []
            }
            group.features.push(record)
          }
        })
      })

      //Create subgroup info only if subGroup field configured and it is not same as group field
      if (layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField !== '' &&
        layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField !== groupField) {
        groupsArr.forEach(group => {
          group.subGroupInfo = this.getSortedSubGroupFeatures(group.features, layerInfo, false, objectIdField)
        })
      }
    }
    return {
      features: selectedFeatures,
      featuresGroup: groupsArr
    }
  }

  /**
   * Sort records according to sorting field
   * @param features features
   * @param sortingField configure field for sorting
   * @returns records array
   */
  sortRecords = (features: DataRecord[], sortingField: string) => {
    const emptyRecordArr: DataRecord[] = []
    const notEmptyRecordsArr: DataRecord[] = []
    features.forEach((record: DataRecord, i) => {
      const featureRecord = record as any
      const sortFieldValue = sortingField === 'distance' ? featureRecord.feature[sortingField] : featureRecord.feature.attributes[sortingField]
      if (typeof (sortFieldValue) === 'undefined' || sortFieldValue === null || sortFieldValue === '') {
        emptyRecordArr.push(record)
      } else {
        notEmptyRecordsArr.push(record)
      }
    })
    return {
      emptyRecordArr: emptyRecordArr,
      notEmptyRecordsArr: notEmptyRecordsArr
    }
  }

  /**
   * Divide Groups By EmptyValue and NonEmptyValue to show EmptyValue always at bottom
   * @param groups groups
   * @param groupSortingField configure field for group sorting
   * @returns records array
   */
  divideGroupsByEmptyValue = (groups: any[], groupSortingField: string) => {
    const groupsWithEmptyValue = []
    const groupsWithNonEmptyValue = []
    groups.forEach((group) => {
      const sortFieldValue = group[groupSortingField]
      if (typeof (sortFieldValue) === 'undefined' || sortFieldValue === null || sortFieldValue === '') {
        groupsWithEmptyValue.push(group)
      } else {
        groupsWithNonEmptyValue.push(group)
      }
    })
    return {
      groupsWithEmptyValue: groupsWithEmptyValue,
      groupsWithNonEmptyValue: groupsWithNonEmptyValue
    }
  }

  /**
   * Sort groups according to the group sorting field
   * @param groupSortingField configured group sorting field
   * @param groupSortFieldOrder configured group field sorting order
   * @returns sorting field object
   */
  sortGroups = (groupSortingField: string, groupSortFieldOrder: OrderRule) => {
    return (a: any, b: any) => {
      //proximity grouping enabled and groups are sort by count
      //sort same feature count group with group value and group field sort order
      if (a[groupSortingField] === b[groupSortingField] || (a[groupSortingField] === null && b[groupSortingField] === null)) {
        if (a.value < b.value) {
          return groupSortFieldOrder === OrderRule.Desc ? -1 : 1
        }
        if (a.value > b.value) {
          return groupSortFieldOrder === OrderRule.Desc ? 1 : -1
        }
      }
      if (a[groupSortingField] < b[groupSortingField]) {
        return -1
      }
      if (a[groupSortingField] > b[groupSortingField]) {
        return 1
      }
      return 0
    }
  }

  /**
   * Sorted features list
   * @param sortingField configured sorting field
   * @param analysisType configured analysis type
   * @param objectIdField field of the layer
   * @returns Object of data records
   */
  sortFeatureList = (sortingField: string, analysisType: string, objectIdField?: string) => {
    return (aRecord: DataRecord, bRecord: DataRecord) => {
      const aFeatureRecord = aRecord as any
      let a = aFeatureRecord.feature
      const bFeatureRecord = bRecord as any
      let b = bFeatureRecord.feature
      const _a = a
      const _b = b
      if (sortingField !== 'distance') {
        a = a.attributes
        b = b.attributes
      }

      if (analysisType === AnalysisTypeName.Proximity) {
        if (a[sortingField] === b[sortingField] || (a[sortingField] === null && b[sortingField] === null)) {
          if (sortingField !== 'distance') {
            if (_a.distance !== _b.distance) {
              if (_a.distance < _b.distance) {
                return -1
              }
              if (_a.distance > _b.distance) {
                return 1
              }
            } else {
              if (a[objectIdField] < b[objectIdField]) {
                return -1
              }
              if (a[objectIdField] > b[objectIdField]) {
                return 1
              }
            }
          } else {
            if (a.attributes[objectIdField] < b.attributes[objectIdField]) {
              return -1
            }
            if (a.attributes[objectIdField] > b.attributes[objectIdField]) {
              return 1
            }
          }
        }
      }

      if (a[sortingField] < b[sortingField]) {
        return -1
      }
      if (a[sortingField] > b[sortingField]) {
        return 1
      }
    }
  }

  /**
   * Get the selected units abbreviation
   * @param selectedUnit selected unit
   * @returns selected unit with abbreviation
   */
  getSelectedUnitsAbbr = (selectedUnit: __esri.LengthUnit): string => {
    const distanceUnit = distanceUnitWithAbbr.find(unit => unit.value === selectedUnit)
    const selectedUnitAbbreviation = this.nls(distanceUnit.abbreviation)
    return selectedUnitAbbreviation
  }

  /**
   * Check if to display approximate distance UI
   * @param layerInfo analysis layers info
   * @returns whether to approximate distance UI
   */
  displayApproximateDistanceUI = (layerInfo: LayersInfo): boolean => {
    let showApproximateDistanceUI: boolean = false
    const layerAnalysisInfo: any = layerInfo.analysisInfo
    const analysisType = layerInfo.analysisInfo.analysisType
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    //search by distance settings is enabled show approximate distance for closest and for proximity if expand list and expand feature details are on
    //for search by map area and show all features don't show approximate distance
    if (searchByLocation) {
      if ((analysisType === AnalysisTypeName.Closest) || (analysisType === AnalysisTypeName.Proximity && layerAnalysisInfo.expandOnOpen &&
        layerAnalysisInfo.expandFeatureDetails)) {
        showApproximateDistanceUI = true
      }
    }
    return showApproximateDistanceUI
  }

  /**
   * Create each graphics layers to show on the map
   */
  createGraphicsLayers = () => {
    if (this.bufferLayer) {
      this.bufferLayer.destroy()
    }
    if (this.drawingLayer) {
      this.drawingLayer.destroy()
    }
    if (this.flashLayer) {
      this.flashLayer.destroy()
    }
    if (this.highlightLayer) {
      this.highlightLayer.destroy()
    }
    this.bufferLayer = new GraphicsLayer({ listMode: 'hide' })
    this.drawingLayer = new GraphicsLayer({ listMode: 'hide' })
    this.highlightLayer = new GraphicsLayer({ listMode: 'hide' })
    this.flashLayer = new GraphicsLayer({ listMode: 'hide', effect: 'bloom(0.8, 1px, 0)' })
    this.state.jimuMapView?.view?.map?.addMany([this.bufferLayer, this.drawingLayer, this.flashLayer, this.highlightLayer])
  }

  /**
   * Clears the record selection change message action executed by widget
   * Removes the highlight bar
   */
  clearMessageAction = () => {
    //unselects all the records selected by widget
    //clear the selection from the map only when the feature is selected
    if (this.selectedRecord?.dataSource && this.selectedRecord.dataSource.dataViewId !== CONSTANTS.SELECTION_DATA_VIEW_ID) {
      MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(this.props.id, [], [this.selectedRecord?.dataSource?.id]))
    }
    //removes the highlight bar from popup
    if (this.selectedPopupContainer) {
      this.selectedPopupContainer.style.borderColor = transparentColor
    }
    this.selectedPopupContainer?.classList?.remove('record-selected')
    //clears the highlight selection of the record from map
    if (this.selectedRecord?.dataSource?.dataViewId !== CONSTANTS.SELECTION_DATA_VIEW_ID) {
      this.selectedRecord?.dataSource?.clearSelection()
    }
    //clear all the variables related to selected record
    this.selectedRecord = null
    this.selectedPopupContainer = null
    this.selectedRecordsKey = ''
  }

  /**
   * Highlights the popup html dom and publish record selection change message action
   * @param record DataRecord to be selected
   */
  selectMessageAction = (record: DataRecord) => {
    //add class to show highlight bar in popup
    if (this.selectedPopupContainer) {
      this.selectedPopupContainer.style.borderColor = this.props.theme?.sys.color?.primary.main
    }
    this.selectedPopupContainer?.classList?.add('record-selected')
    if (record?.dataSource?.dataViewId !== CONSTANTS.SELECTION_DATA_VIEW_ID) {
      //publish record select message
      MessageManager.getInstance().publishMessage(
        new DataRecordsSelectionChangeMessage(this.props.id, [record], [record.dataSource?.id])
      )
      //highlight the record on map
      if (!this.skipHighlightRecordsOnMap) {
        this.skipDsInfoChange = true
        record.dataSource?.selectRecordsByIds([record.getId()], [record])
      }
    }
    this.skipHighlightRecordsOnMap = false
    this.selectedRecord = record
  }

  /**
   * Highlight hovered feature on map even though the layers are hide from the map
   * @param featureRecord hovered feature record
   * @param showLayer if hovered then show highlight layer
   */
  highlightFeatureOnMap = (featureRecord: DataRecord, showHighlight: boolean) => {
    if (showHighlight) {
      this.highlightLayer.removeAll()
      //reorder the highlight layer to be on top so that the hover highlight graphics is visible on map
      this.state.jimuMapView?.view.map.reorder(this.highlightLayer, this.state.jimuMapView?.view.map.layers.length - 1)
      const graphics = getHighLightSymbol((featureRecord as any).getFeature(), '#FFFF00')
      this.highlightLayer?.add(graphics)
    } else {
      this.highlightLayer.removeAll()
    }
  }

  /**
   * On clicking or opening the feature details selects or unselect the records
   * Currently only single selection is supported
   * @param key Unique index for each feature
   * @param popupContainer HTML dom ref to show the highlight bar
   * @param record DataRecord to be selected/unselected
   */
  executeSelectMessageAction = (key: string, popupContainer: HTMLDivElement, record: DataRecord) => {
    if (this.selectedRecordsKey === key) {
      this.clearMessageAction()
    } else if (this.selectedRecordsKey !== key) {
      if (this.selectedRecordsKey) {
        this.clearMessageAction()
      }
      this.selectedPopupContainer = popupContainer
      this.selectedRecordsKey = key
      this.selectMessageAction(record)
    }
  }

  /**
    * On clicking or closing the feature details unselect the records
    * Clear only when the key is of previously selected record
    * @param key Unique index for each feature
    */
  executeClearMessageAction = (key: string) => {
    if (this.selectedRecordsKey === key) {
      this.clearMessageAction()
    }
  }

  /**
   * Create the feature set list
   * @param featureList features list
   * @param layerInfo Analysis Layers info
   * @param objIdField ObjectId field
   * @param distanceUnit distance unit
   * @param analysisId configured analysis id
   * @returns Object of feature set, features count, layers info and records
   */
  createFeatureSet = (featureList: DataRecord[], layerInfo: LayersInfo, objIdField: string, distanceUnit: __esri.LengthUnit, analysisId: string, isReturnOneAnalysisResult: boolean) => {
    const jsxElements: React.JSX.Element[] = []
    let features: DataRecord[] = []
    const layerAnalysisInfo = layerInfo.analysisInfo as any
    let featuresAndGroup
    let popupTitleField: string = ''
    const enableDataAction = this.props.enableDataAction !== undefined ? this.props.enableDataAction : true
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && layerAnalysisInfo.displayField !== '') {
      popupTitleField = layerAnalysisInfo.displayField
    } else {
      const dsId: string = layerInfo.useDataSource.dataSourceId
      const ds = getSelectedLayerInstance(dsId) as any
      //Get the default selected display field for proximity
      popupTitleField = getDisplayField(ds)
    }
    //check config parameters to decide feature details/groups should be expanded or collapse
    const expandFeaturesOrGroups = layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity
      ? (layerAnalysisInfo.expandOnOpen && layerAnalysisInfo.expandFeatureDetails)
      : true
    features = featureList
    const { searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    if (searchByLocation) {
      //search by distance - 1.sort feature by distance is selected then sort features by distance
      //2.sort feature by field is selected then sort features by field value
      featuresAndGroup = this.getSortedFeatures(features, layerInfo, false, objIdField)
      features = featuresAndGroup.features
    } else {
      //show all features and search by map area - 1.sort feature by distance is selected then sort features by objectId
      //2.sort feature by field is selected then sort features by field value
      featuresAndGroup = this.getSortedFeatures(features, layerInfo, true, objIdField)
      features = featuresAndGroup.features
    }
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Closest) {
      //use only one record for closest analysis
      if (features.length > 1) {
        let closestFeature: DataRecord[] = []
        const firstFeatureGeometry = (features[0] as FeatureDataRecord).feature.geometry as __esri.Geometry
        //if input feature geometry equals to any of the result geometry
        if (this.state.aoiGeometries?.incidentGeometry?.type === firstFeatureGeometry.type) {
          closestFeature = features.filter((f: FeatureDataRecord) => equalsOperator.execute(f.feature.geometry as __esri.geometryGeometry, this.state.aoiGeometries.incidentGeometry as __esri.geometryGeometry))
        }
        //if any result geometry is same as input use it else use the first features geometry form the list as closest
        if (closestFeature.length > 0) {
          features = closestFeature.splice(0, 1)
        } else {
          features = features.splice(0, 1)
        }
      }
    }
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity) {
      if (!layerAnalysisInfo.sortFeaturesByDistance && layerAnalysisInfo.sortFeatures?.sortFeaturesByField &&
        layerAnalysisInfo.sortFeatures.sortFeaturesOrder === OrderRule.Desc) {
        features = features.reverse()
      }
      if (layerAnalysisInfo.groupFeaturesEnabled && (layerAnalysisInfo.groupFeatures.groupFeaturesOrder === OrderRule.Desc ||
        layerAnalysisInfo.groupFeatures.sortGroupsByCount)) {
        featuresAndGroup.featuresGroup = featuresAndGroup.featuresGroup.reverse()
      }
    }
    const layerObj = getSelectedLayerInstance(layerInfo.useDataSource.dataSourceId) as any
    //If groups found then add group elements
    if (layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && featuresAndGroup?.featuresGroup?.length > 0) {
      //show group symbol only when displayMapSymbols is on in config and
      //the analysis layer having the unique-value renderer and
      //the group features field matches with unique-renderer field of the layer
      const showGroupSymbol = this.state.analysisSettings?.displayMapSymbols &&
        layerObj.layer?.renderer?.type === 'unique-value' &&
        layerAnalysisInfo.groupFeatures.groupFeaturesByField === layerObj.layer?.renderer?.field
      featuresAndGroup.featuresGroup.forEach((group, groupIndex: number) => {
        //sort features inside group based on sort field order
        if (!layerAnalysisInfo.sortFeaturesByDistance && layerAnalysisInfo.sortFeatures?.sortFeaturesByField &&
          layerAnalysisInfo.sortFeatures.sortFeaturesOrder === OrderRule.Desc) {
          group.features = group.features.reverse()
        }
        //Feature items for each group
        const featureItems: React.JSX.Element[] = []
        //if subgroup info found add subgroup elements in the featureItems
        if (group.subGroupInfo) {
          //sort subgroup by confugured field and order
          if (layerAnalysisInfo.subGroupFeatures.subGroupFeaturesOrder === OrderRule.Desc ||
            layerAnalysisInfo.subGroupFeatures.sortSubGroupsByCount) {
            group.subGroupInfo.featuresSubGroup = group.subGroupInfo.featuresSubGroup.reverse()
          }
          group.subGroupInfo.featuresSubGroup.forEach((subGroup, subGroupIndex: number) => {
            //Feature items for each subgroup
            const subGroupFeatureItems: React.JSX.Element[] = []
            //sort features inside the subgroup using sort features by field configuration
            if (!layerAnalysisInfo.sortFeaturesByDistance && layerAnalysisInfo.sortFeatures?.sortFeaturesByField &&
              layerAnalysisInfo.sortFeatures.sortFeaturesOrder === OrderRule.Desc) {
              subGroup.features = subGroup.features.reverse()
            }
            subGroup.features.forEach((feature: FeatureDataRecord, featureIndex: number) => {
              subGroupFeatureItems.push(
                <FeatureSet
                  index={groupIndex + '_' + subGroupIndex + '_' + analysisId + '_' + featureIndex}
                  key={analysisId + '_' + subGroupIndex + '_' + featureIndex}
                  widgetId={this.props.id}
                  intl={this.props.intl}
                  theme={this.props.theme}
                  config={this.props.config}
                  jimuMapView={this.state.jimuMapView}
                  popupTitleField={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity ? popupTitleField : null}
                  selectedRecord={feature}
                  showPlanRoute={this.canShowPlanRouteButton(feature, layerAnalysisInfo.analysisType, searchByLocation)}
                  distanceUnit={(searchByLocation || searchCurrentExtent) ? this.getSelectedUnitsAbbr(distanceUnit) : null}
                  selectedFeatureLength={subGroup.features.length}
                  ifOneAnalysisResult={isReturnOneAnalysisResult}
                  isExpanded={expandFeaturesOrGroups}
                  expandOnOpen={layerAnalysisInfo.expandOnOpen}
                  approximateDistanceUI={this.displayApproximateDistanceUI(layerInfo)}
                  showDistFromInputLocation={this.state.analysisSettings?.showDistFromInputLocation}
                  displayMapSymbol={this.state.analysisSettings?.displayMapSymbols}
                  isEnableProximitySearch={this.state.analysisSettings?.enableProximitySearch }
                  showDataActions={enableDataAction && searchByLocation}
                  isGroup={true}
                  selectRecord={this.executeSelectMessageAction}
                  clearRecord={this.executeClearMessageAction}
                  graphicLayer={this.flashLayer}
                  selectedLayerDsId={layerInfo.useDataSource.dataSourceId}
                  showClippedFeaturesInfo={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && searchByLocation && layerAnalysisInfo.clipFeatures}
                  startingPointGraphic={this.incidentGraphic}
                  highlightFeature={this.highlightFeatureOnMap}></FeatureSet>)
            })
            featureItems.push(<LayerAccordion
              theme={this.props.theme}
              key={subGroupIndex}
              index={subGroupIndex}
              intl={this.props.intl}
              label={subGroup.label ?? layerAnalysisInfo.subGroupFeatures.noValueSubGroupLabel}
              analysisIcon={null}
              featureCount={layerInfo.analysisInfo.displayFeatureCount ? subGroup.count : null}
              isExpanded={expandFeaturesOrGroups}
              dsId={layerInfo.useDataSource.dataSourceId}
              analysisId={layerInfo.analysisInfo.analysisId}
              analysisType={layerAnalysisInfo.analysisType}
              isListView={false}
              canShowMoreFeatures={subGroup?.count > 20}
              selectedRecord={subGroup.features[0]}
              displayMapSymbol={showGroupSymbol}
              canToggle>
              {subGroupFeatureItems}
            </LayerAccordion>)
          })
        } else {
          group.features.forEach((feature: FeatureDataRecord, featureIndex: number) => {
            featureItems.push(
              <FeatureSet
                index={groupIndex + '_' + analysisId + '_' + featureIndex}
                key={analysisId + '_' + featureIndex}
                widgetId={this.props.id}
                intl={this.props.intl}
                theme={this.props.theme}
                config={this.props.config}
                jimuMapView={this.state.jimuMapView}
                popupTitleField={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity ? popupTitleField : null}
                selectedRecord={feature}
                showPlanRoute={this.canShowPlanRouteButton(feature, layerAnalysisInfo.analysisType, searchByLocation)}
                distanceUnit={(searchByLocation || searchCurrentExtent) ? this.getSelectedUnitsAbbr(distanceUnit) : null}
                selectedFeatureLength={features.length}
                ifOneAnalysisResult={isReturnOneAnalysisResult}
                isExpanded={expandFeaturesOrGroups}
                expandOnOpen={layerAnalysisInfo.expandOnOpen}
                approximateDistanceUI={this.displayApproximateDistanceUI(layerInfo)}
                showDistFromInputLocation={this.state.analysisSettings?.showDistFromInputLocation}
                displayMapSymbol={this.state.analysisSettings?.displayMapSymbols}
                isEnableProximitySearch={this.state.analysisSettings?.enableProximitySearch}
                showDataActions={enableDataAction && searchByLocation}
                isGroup={true}
                selectRecord={this.executeSelectMessageAction}
                clearRecord={this.executeClearMessageAction}
                graphicLayer={this.flashLayer}
                selectedLayerDsId={layerInfo.useDataSource.dataSourceId}
                startingPointGraphic={this.incidentGraphic}
                showClippedFeaturesInfo={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && searchByLocation && layerAnalysisInfo.clipFeatures}
                highlightFeature={this.highlightFeatureOnMap}></FeatureSet>)
          })
        }

        jsxElements.push(<LayerAccordion
          theme={this.props.theme}
          key={groupIndex}
          index={groupIndex}
          intl={this.props.intl}
          label={group.label ?? layerAnalysisInfo.groupFeatures.noValueGroupLabel}
          analysisIcon={null}
          featureCount={layerAnalysisInfo.displayFeatureCount ? group.count : null}
          isExpanded={expandFeaturesOrGroups}
          dsId={layerInfo.useDataSource.dataSourceId}
          analysisId={layerInfo.analysisInfo.analysisId}
          analysisType={layerAnalysisInfo.analysisType}
          isListView={false}
          canShowMoreFeatures={group?.count > 20}
          selectedRecord={group.features[0]}
          displayMapSymbol={showGroupSymbol}
          canToggle>
          {featureItems}
        </LayerAccordion>)
      })
    } else {
      features.forEach((feature: FeatureDataRecord, featureIndex: number) => {
        jsxElements.push(
          <FeatureSet
            intl={this.props.intl}
            widgetId={this.props.id}
            index={analysisId + '_' + featureIndex}
            key={analysisId + '_' + featureIndex}
            theme={this.props.theme}
            config={this.props.config}
            popupTitleField={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity ? popupTitleField : null}
            jimuMapView={this.state.jimuMapView}
            selectedRecord={feature}
            distanceUnit={(searchByLocation || searchCurrentExtent) ? this.getSelectedUnitsAbbr(distanceUnit) : null}
            showPlanRoute={this.canShowPlanRouteButton(feature, layerAnalysisInfo.analysisType, searchByLocation)}
            selectedFeatureLength={features.length}
            ifOneAnalysisResult={isReturnOneAnalysisResult}
            isExpanded={expandFeaturesOrGroups}
            expandOnOpen={layerAnalysisInfo.expandOnOpen}
            approximateDistanceUI={this.displayApproximateDistanceUI(layerInfo)}
            showDistFromInputLocation={this.state.analysisSettings?.showDistFromInputLocation}
            displayMapSymbol={this.state.analysisSettings?.displayMapSymbols}
            isEnableProximitySearch={this.state.analysisSettings?.enableProximitySearch}
            showDataActions={enableDataAction && searchByLocation}
            isGroup={false}
            selectRecord={this.executeSelectMessageAction}
            clearRecord={this.executeClearMessageAction}
            highlightFeature={this.highlightFeatureOnMap}
            startingPointGraphic={this.incidentGraphic}
            selectedLayerDsId={layerInfo.useDataSource.dataSourceId}
            showClippedFeaturesInfo={layerAnalysisInfo.analysisType === AnalysisTypeName.Proximity && searchByLocation && layerAnalysisInfo.clipFeatures}
            graphicLayer={this.flashLayer}></FeatureSet>)
      })
    }
    return ({
      items: jsxElements,
      count: features.length,
      layerInfo: layerInfo,
      records: features,
      allowExport: false,
      featuresAndGroup
    })
  }

  /**
   * Verify whether to show Plan Route button
   * @param selectedRecord selected record
   * @param analysisType analysis type
   * @param searchByLocation search by location method
   * @returns can show Plan Route Button in feature info
   */
  canShowPlanRouteButton = (selectedRecord: FeatureDataRecord, analysisType: string, searchByLocation: boolean): boolean => {
    return (this.incidentGraphic && (selectedRecord?.feature?.geometry as __esri.Geometry)?.type === 'point' &&
      searchByLocation && analysisType !== AnalysisTypeName.Summary)
  }

  /**
   * Get the feature record list
   * @param useDataSource configured use datasource
   * @returns records promise
   */
  getRecords = async (layerInfo: LayersInfo) => {
    const dsId = layerInfo.useDataSource.dataSourceId
    const ds = getSelectedLayerInstance(layerInfo.useDataSource.dataSourceId) as FeatureLayerDataSource
    if (!ds) {
      return Promise.resolve()
    }
    const promise = new Promise((resolve, reject) => {
      // use abortController to make the selecting task cancelable
      const abortController = new AbortController()
      this.abortControllerRef.push(abortController)

      let bufferGeometry = null
      //in case of show all features return geometry will be false, we will get geometry only when search area is defined
      const { searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      let returnGeometry: boolean = false
      if (searchByLocation || searchCurrentExtent) {
        //set return geometry to true only in case of search by distance
        //as we need geometry to show closest distance when search area is defined
        if (!searchCurrentExtent) {
          returnGeometry = true
        }
        //set buffer geometry
        if (this.state.aoiGeometries?.bufferGeometry) {
          bufferGeometry = this.state.aoiGeometries.bufferGeometry
        } else {
          bufferGeometry = this.state.aoiGeometries.incidentGeometry
        }
      }
      let outFields
      this.props.useDataSources.forEach((dataS) => {
        if (dataS.dataSourceId === ds.id) {
          outFields = dataS.fields ?? []
        }
      })
      getALLFeatures(ds, bufferGeometry, returnGeometry, this.state.jimuMapView.view.spatialReference, outFields, abortController.signal).then(async (recordsList: FeatureDataRecord[]) => {
        if (searchByLocation && recordsList?.length > 0) {
          //show feature distance only in case of define search area with distance
          recordsList = await this.getFeaturesDistance(recordsList)
          if (!recordsList) {
            resolve(null)
            return
          }
        }
        this.featuresByDsId[dsId] = recordsList
        resolve(recordsList)
      }, (err) => {
        resolve(null)
      })
    })
    return promise
  }

  /**
   * perform the analysis on the features
   * @param layerInfo configured layers info
   * @param analysisId configured analysis id
   * @returns promise of the feature set
   */
  performAnalysis = async (layerInfo, analysisId: string, isReturnOneAnalysisResult: boolean) => {
    const dsId: string = layerInfo.useDataSource.dataSourceId
    const ds = getSelectedLayerInstance(dsId) as any
    const allowExport = await ds.allowToExportData()
    const promise = new Promise((resolve, reject) => {
      const objIdField = ds?.getIdField()
      let bufferGeometry = null
      const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      if (searchByLocation || searchCurrentExtent) {
        //set buffer geometry
        if (this.state.aoiGeometries?.bufferGeometry) {
          bufferGeometry = this.state.aoiGeometries.bufferGeometry
        } else {
          bufferGeometry = this.state.aoiGeometries?.incidentGeometry
        }
      }
      if (this.featuresByDsId.hasOwnProperty(dsId)) {
        //clone the featuresByDsId array
        let featureList = [...this.featuresByDsId[dsId]]
        if (searchByLocation && layerInfo.analysisInfo.returnIntersectedPolygons && ds.getGeometryType() === 'esriGeometryPolygon') {
          featureList = featureList.filter((eachRecord) => intersectionOperator.execute(this.state.aoiGeometries?.incidentGeometry as __esri.geometryGeometry, eachRecord.feature.geometry))
          this.featuresByAnalysisId[analysisId] = featureList
        }
        let featureSet = {
          items: [],
          count: featureList.length,
          layerInfo: layerInfo,
          records: featureList,
          allowExport: allowExport
        }
        const portalUnit = getPortalUnit()
        //Use portal unit in case of show all features OR search by extent
        const distanceUnit = showAllFeatures || searchCurrentExtent
          ? portalUnit
          : this.state.aoiGeometries.distanceUnit || this.state.searchSettings.distanceUnits || portalUnit

        if (featureList.length > 0) {
          if (layerInfo.analysisInfo.analysisType === AnalysisTypeName.Summary) {
            featureSet = this.summaryAnalysis(featureList, layerInfo, distanceUnit, bufferGeometry, analysisId)
            featureSet.allowExport = allowExport
            resolve(featureSet)
          } else if ((layerInfo.analysisInfo.analysisType === AnalysisTypeName.Closest && searchByLocation) ||
            layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity) {
            featureSet = this.createFeatureSet(featureList, layerInfo, objIdField, distanceUnit as __esri.LengthUnit, analysisId, isReturnOneAnalysisResult)
            featureSet.allowExport = allowExport
            resolve(featureSet)
          }
        } else {
          resolve(featureSet)
        }
      }
    })
    return promise
  }

  /**
   * Render the summary fields cards according to its config
   * @param featureList Summary features list
   * @param layerInfo config layers info
   * @param distanceUnit config distance units
   * @param geometry calculated geometry
   * @param analysisId configured analysis id
   * @returns result for summary analysis
   */
  summaryAnalysis = (featureList: DataRecord[], layerInfo: LayersInfo, distanceUnit: string, geometry: __esri.geometryGeometry, analysisId: string) => {
    const jsxElements: React.JSX.Element[] = []
    let value
    value = null
    const analysisInfo: any = layerInfo.analysisInfo
    const analysisLabel: string = layerInfo.label
    const { showAllFeatures, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    //skip the length or area field when search by location is not enabled
    const skipAreaOrLengthField = showAllFeatures || searchCurrentExtent
    if (analysisInfo.summaryFields.length > 0) {
      // get the value of SumOfIntersectedArea/SumOfIntersectedLength
      analysisInfo.summaryFields.forEach((summaryField: SummaryFieldsInfo, index: number) => {
        //if define search is off or search by map are is on then skip sum of intersected area/length fields of summary
        if (!(skipAreaOrLengthField && summaryField.summaryFieldInfo.hasOwnProperty('summaryBy'))) {
          if (summaryField.summaryFieldInfo?.summaryBy === CommonSummaryFieldValue.SumOfIntersectedArea) {
            value = this.getArea(featureList, geometry, distanceUnit)
            value = this.getSummaryDisplayValue(value, summaryField.summaryFieldInfo, distanceUnit, true)
          }
          if (summaryField.summaryFieldInfo?.summaryBy === CommonSummaryFieldValue.SumOfIntersectedLength) {
            value = this.getLength(featureList, geometry, distanceUnit)
            value = this.getSummaryDisplayValue(value, summaryField.summaryFieldInfo, distanceUnit, false)
          }
        }
      })
      //If skipAreaOrLengthField and only SumOfIntersectedArea/SumOfIntersectedLength then we don't need any summary fields
      //as in search by current map area we cannot calculate SumOfIntersectedArea/SumOfIntersectedLength
      //else create the list of summary fields
      if (skipAreaOrLengthField && analysisInfo.summaryFields.length === 1 && analysisInfo.summaryFields[0]?.summaryFieldInfo?.hasOwnProperty('summaryBy')) {
        this.updateSummaryOutputDS(analysisLabel, layerInfo.useDataSource.dataSourceId, analysisInfo.summaryFields, analysisId, featureList.length)
      } else {
        jsxElements.push(<SummaryResult
          key={analysisId}
          widgetId={this.props.widgetId}
          records={featureList}
          theme={this.props.theme}
          useDataSource={layerInfo.useDataSource}
          summaryFieldInfos={analysisInfo.summaryFields}
          sumOfAreaOrLengthValue={value}
          singleFieldColor={analysisInfo.isSingleColorMode ? analysisInfo.singleFieldColor : null}
          onSummaryFieldsResolved={(summaryAttributes: SummaryAttributes) => {
            this.updateSummaryOutputDS(analysisLabel, layerInfo.useDataSource.dataSourceId, analysisInfo.summaryFields, analysisId, featureList.length, summaryAttributes)
          }}
        ></SummaryResult>)
      }
    } else {
      this.updateSummaryOutputDS(analysisLabel, layerInfo.useDataSource.dataSourceId, analysisInfo.summaryFields, analysisId, featureList.length)
    }
    return ({
      items: jsxElements,
      count: featureList.length,
      layerInfo: layerInfo,
      records: featureList,
      allowExport: false
    })
  }

  /**
   * Updates the output dataSource with the resolved summary values
   * @param analysisLabel - Configured analysis label
   * @param dsId - use data source id
   * @param summaryFields - Configured SummaryFieldsInfo for the analysis
   * @param analysisId - Analysis id
   * @param intersectingFeaturesCount - Total number of features intersecting the AOI
   * @param resolvedAttributes - Resolved values of configured summary expressions
   */
  updateSummaryOutputDS = (analysisLabel: string, dsId: string, summaryFields: SummaryFieldsInfo[], analysisId: string, intersectingFeaturesCount: number, resolvedAttributes?: SummaryAttributes) => {
    const summaryAttributes: SummaryAttributes = resolvedAttributes ? { ...resolvedAttributes } : {}
    this.summaryAttributes = summaryAttributes
    const outputDsId = getOutputDsId(this.props.widgetId, AnalysisTypeName.Summary, analysisId)
    summaryAttributes.esriCTCOUNT = intersectingFeaturesCount
    this.buildOutputDsResultsForSummary(analysisLabel, dsId, summaryFields, analysisId, outputDsId, summaryAttributes)
  }

  /**
   * Get summary field display value
   * @param summaryValue sum of intersected Length/Area
   * @param summaryFieldInfo Sum Of Area/Length Params
   * @param distanceUnit  selected unit
   * @param isIntersectingArea if intersecting area is selected
   * @returns formatted value or area
   */
  getSummaryDisplayValue = (summaryValue: number, summaryFieldInfo: SumOfAreaLengthParam, distanceUnit: string, isIntersectingArea?: boolean): string => {
    const defaultNumberFormat: FormatNumberOptions = {
      useGrouping: summaryFieldInfo.showSeparator,
      notation: 'standard'
    }
    let formattedValue: string
    if (summaryFieldInfo.numberFormattingOption === NumberFormatting.Round) {
      defaultNumberFormat.maximumFractionDigits = summaryFieldInfo.significantDigits
      defaultNumberFormat.minimumFractionDigits = summaryFieldInfo.significantDigits
      formattedValue = this.props.intl.formatNumber(summaryValue, defaultNumberFormat)
    } else if (summaryFieldInfo.numberFormattingOption === NumberFormatting.Truncate) {
      defaultNumberFormat.minimumSignificantDigits = summaryFieldInfo.significantDigits
      if (!isNaN(summaryValue) && summaryValue !== null) {
        const truncatePlaces = summaryFieldInfo.significantDigits
        const truncateExp = new RegExp(truncatePlaces > 0 ? '^\\d*[.]?\\d{0,' + truncatePlaces + '}' : '^\\d*')
        formattedValue = truncateExp.exec(summaryValue.toString())[0]
      }
      formattedValue = this.props.intl.formatNumber(Number(formattedValue), defaultNumberFormat)
    } else {
      formattedValue = this.props.intl.formatNumber(summaryValue, defaultNumberFormat)
    }
    let unitAbbr = this.getSelectedUnitsAbbr(distanceUnit as __esri.LengthUnit)
    //show square unit for area
    if (isIntersectingArea) {
      unitAbbr = unitAbbr + '\u00b2'
    }
    return this.summaryIntersectValueAndUnitLabel(formattedValue, unitAbbr)
  }

  /**
   * Get label for sum of intersected area/length value and unit
   * @param formattedSummaryValue formatted sum of intersected area/length value
   * @param unit unit
   * @returns formatted sum of intersected area/length value unit label
   */
  summaryIntersectValueAndUnitLabel = (formattedSummaryValue: string, unit: string): string => {
    let summaryIntersectValueAndUnitLabel = ''
    summaryIntersectValueAndUnitLabel = this.props.intl.formatMessage({
      id: 'summaryIntersectValueAndUnit', defaultMessage: defaultMessages.summaryIntersectValueAndUnit
    }, { summaryIntersectValue: formattedSummaryValue, unitLabel: unit })
    return summaryIntersectValueAndUnitLabel
  }

  /**
   * Get the intersected area for polygon feature
   * @param featureRecords selected features records
   * @param geoms geometry of the features
   * @param distanceUnits config distance units
   * @returns formatted value or area
   */
  getArea = (featureRecords: DataRecord[], geoms: __esri.geometryGeometry, distanceUnits: string): number => {
    let value: number = 0
    const units = ('square' + '-' + distanceUnits) as __esri.AreaUnit
    featureRecords.forEach(featureRecord => {
      const selectedFeatureRecord = featureRecord as any
      let intersectGeom
      if (geoms) {
        intersectGeom = intersectionOperator.execute(selectedFeatureRecord.feature.geometry, geoms)
      } else {
        intersectGeom = selectedFeatureRecord.feature.geometry
      }
      if (intersectGeom !== null) {
        const sr = intersectGeom.spatialReference
        if (sr.wkid === 4326 || sr.isWebMercator || (sr.isGeographic)) {
          value += geodeticAreaOperator.execute(intersectGeom, { unit: units })
        } else {
          value += areaOperator.execute(intersectGeom, { unit: units })
        }
      }
    })
    return value
  }

  /**
   * Get the intersected length for polyline feature
   * @param featureRecords selected features records
   * @param geoms geometry of the features
   * @param distanceUnits config distance units
   * @returns formatted value or length
   */
  getLength = (featureRecords: DataRecord[], geoms: __esri.geometryGeometry, distanceUnits: string): number => {
    let value: number = 0
    const units = distanceUnits as __esri.LengthUnit
    featureRecords.forEach(featureRecord => {
      const selectedFeatureRecord = featureRecord as any
      let intersectGeom
      if (geoms) {
        intersectGeom = intersectionOperator.execute(selectedFeatureRecord.feature.geometry, geoms)
      } else {
        intersectGeom = selectedFeatureRecord.feature.geometry
      }
      if (intersectGeom !== null) {
        const sr = intersectGeom.spatialReference
        if (sr.wkid === 4326 || sr.isWebMercator || (sr.isGeographic)) {
          value += geodeticLengthOperator.execute(intersectGeom, { unit: units })
        } else {
          value += lengthOperator.execute(intersectGeom, { unit: units })
        }
      }
    })
    return value
  }

  /**
   * Resize the layers list height depending whether the closest address is showing
   * @param isClosestAddressShowing whether the closest address is showing
   */
  resizeLayerListHeight = () => {
    if (this.divRef?.current) {
      const { searchByLocation, showAllFeatures, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      const offsetHeight = this.divRef?.current?.offsetHeight
      //Height of the refresh/delete button to be added if title is in multiple rows
      const refreshDeleteButtonHeight = this.props.theme.ref.typeface.htmlFontSize === '125%' ? 35 : 27
      //calculate the value of list height
      let divHeight = offsetHeight
      //In case of Search by location, we will always have delete and refresh button, so add refreshDeleteButtonHeight in the offset height
      //In case of Show all feature, based on if multiple rows are shown or single or no heading label calculate height
      //In case of current extent, we will show the batch export button, so add refreshDeleteButtonHeight in the offset height
      if (searchByLocation || searchCurrentExtent) {
        divHeight = offsetHeight + refreshDeleteButtonHeight
      } else if (showAllFeatures) {
        if (this.props.theme.ref.typeface.htmlFontSize === '125%') {
          //means no label
          if (offsetHeight <= 34) {
            divHeight = 35
          } else if (offsetHeight > 34) {
            //means multiple rows
            divHeight = offsetHeight + refreshDeleteButtonHeight
          }
        } else {
          //means no label
          if (offsetHeight <= 28) {
            divHeight = 28
          } else if (offsetHeight > 28) {
            //means multiple rows
            divHeight = offsetHeight + refreshDeleteButtonHeight
          }
        }
      }
      this.setState({
        listMaxHeight: 'calc(100% -' + ' ' + divHeight + 'px)'
      })
    }
  }

  /**
   * Create highlighting graphics for the selected feature
   * @param records feature records
   * @param isVisible whether highlight layer is visible
   * @param highlightResults whether layer results highlighted on map
   * @param highlightResultsColor highlight layer with configured color
   */
  createHighlightGraphicsForLayer = (records: DataRecord[], isVisible: boolean, highlightResults: boolean, highlightResultsColor: string, clipFeatures: boolean) => {
    if (highlightResults) {
      const highlightLayer = new GraphicsLayer({ listMode: 'hide', visible: isVisible })
      this.highlightGraphicsLayers.push(highlightLayer)
      this.state.jimuMapView?.view.map.addMany([highlightLayer])
      //reorder the flash layer to be on top so that the flashed graphics is visible on map
      this.state.jimuMapView?.view.map.reorder(this.flashLayer, this.state.jimuMapView?.view.map.layers.length - 1)
      records.forEach((record) => {
        const featureRecord = record as any
        const feature = featureRecord.getFeature()
        const graphic = getHighLightSymbol(feature, colorUtils.parseThemeVariable(highlightResultsColor, this.props.theme))
        if(clipFeatures && this.state.aoiGeometries?.incidentGeometry) {
          //clip the geometry if clip feature is enabled and AOI geometry is present
          const clippedGeometry = intersectionOperator.execute(feature.geometry, (this.state.aoiGeometries.bufferGeometry ?? this.state.aoiGeometries.incidentGeometry) as __esri.geometryGeometry)
          if(clippedGeometry) {
            graphic.geometry = clippedGeometry
          }
          //calculate area or lenght based on the type of clipped geometry
          if (clippedGeometry?.type === 'polygon') {
            const area = this.getArea([record], clippedGeometry, this.state.aoiGeometries.distanceUnit || this.state.searchSettings.distanceUnits || getPortalUnit())
            feature.attributes = {
              ...graphic.attributes,
              esriCTClippedInfo: Number(area).toString()
            }
          } else if (clippedGeometry?.type === 'polyline') {
            const length = this.getLength([record], clippedGeometry, this.state.aoiGeometries.distanceUnit || this.state.searchSettings.distanceUnits || getPortalUnit())
            feature.attributes = {
              ...graphic.attributes,
              esriCTClippedInfo: Number(length).toString()
            }
          }
        }
        if (highlightLayer && graphic) {
          highlightLayer.add(graphic)
        }
      })
    } else {
      //pushed null for the layers(proximity/summary) whose highlight features setting is off
      this.highlightGraphicsLayers.push(null)
    }
  }

  /**
   * Destroy/remove the highlight graphics layers
   */
  destroyHighlightGraphicsLayer = () => {
    this.highlightGraphicsLayers.forEach((layer) => {
      if (layer) {
        layer.removeAll()
        layer.destroy()
      }
    })
    this.highlightGraphicsLayers = []
  }

  /**
   * On layer toggle make the layer visible
   * @param index Index of each layer toggle
   * @param isExpanded check whether the layer section is expanded
   */
  onLayerToggle = (index: number, isExpanded: boolean) => {
    if (this.highlightGraphicsLayers?.length > 0 && this.highlightGraphicsLayers[index]) {
      const layer = this.highlightGraphicsLayers[index]
      if (layer) {
        if (isExpanded) {
          layer.visible = true
        } else {
          layer.visible = false
        }
      }
    }
  }

  /**
   * Queries only unique layers from the configured analysis starts display layer analysis
   */
  queryLayers = lodash.debounce((isAutoRefresh?: boolean) => {
    this.setState({
      showNoResultsFoundMsg: false,
      queryAborted: false,
      displayLayerAccordion: [],
      analysisTakingLongerTime: false
    }, () => {
      let minTimeOut = setTimeout(() => {
        if (minTimeOut) {
          clearTimeout(minTimeOut)
          minTimeOut = null
        }
        this.setState({
          analysisTakingLongerTime: true
        })
      }, 10000)
      this.destroyHighlightGraphicsLayer()
      const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
      //reset the applied filters from near me widget
      //if autorefresh is disabled, specify location workflow and filter enabled in near me widget
      if (!isAutoRefresh && searchByLocation && this.state.analysisSettings?.onlyShowLayersResult) {
        this.resetFilters()
      }
      this.clearMessageAction()
      const defArray: Array<Promise<any>> = []
      const queriedLayers: string[] = []
      if ((showAllFeatures || ((searchByLocation || searchCurrentExtent) && this.state.aoiGeometries)) && this.state.jimuMapView &&
        this.state.analysisSettings?.layersInfo?.length > 0) {
        this.state.analysisSettings.layersInfo.forEach((layerInfo: LayersInfo) => {
          //Loop through all analysis layers settings configuration
          //Any layer which does not falls in the layer arrays
          //are not present in the webmap/webscene
          //skip analysis for those layers
          if (this.availableLayersIds.includes(layerInfo.useDataSource.dataSourceId) ||
          (layerInfo.useDataSource.dataViewId && this.availableLayersIds.includes(layerInfo.useDataSource.mainDataSourceId))) {
            const dsId: string = layerInfo?.useDataSource?.dataSourceId
            if (dsId && !queriedLayers.includes(dsId)) {
              queriedLayers.push(dsId)
              //Live mode: if analysis setting is changed then query only for newly added layers
              if (!this.featuresByDsId[dsId]) {
                defArray.push(this.getRecords(layerInfo))
              }
            }
          }
        })
      }
      Promise.all(defArray).then(() => {
        this.abortControllerRef = []
        if (minTimeOut) {
          clearTimeout(minTimeOut)
          minTimeOut = null
        }
        this.setState({
          analysisTakingLongerTime: false
        }, () => {
          setTimeout(() => {
            this.displayAnalysisLayerInfo(isAutoRefresh)
          }, 500)
        })
      })
    })
  }, 300)

  /**
   * Get configured fields to export
   * @param analysisId analysis id
   * @returns configured fields to export
   */
  getFieldsToExport = (analysisId): string[] => {
    let configFieldsToExport: string[] = []
    const configLayersInfo = this.state.analysisSettings?.layersInfo
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    configLayersInfo.forEach((layerInfo) => {
      if (layerInfo.analysisInfo.analysisId === analysisId) {
        if (layerInfo.analysisInfo.fieldsToExport?.length > 0) {
          const updatedFieldsToExport = [...layerInfo.analysisInfo.fieldsToExport]
          //in case of only search by location show the approximate distance fields in the exported CSV if available
          if (!searchByLocation && layerInfo.analysisInfo.fieldsToExport.includes('esriCTApproxDistance')) {
            updatedFieldsToExport.splice(layerInfo.analysisInfo.fieldsToExport.indexOf('esriCTApproxDistance'), 1)
          }
          configFieldsToExport = updatedFieldsToExport
        } else { //if no configured fields then fallback to take all the field names
          configFieldsToExport = getAllFieldsNames(layerInfo.useDataSource.dataSourceId)
        }
      }
    })
    return configFieldsToExport
  }

  /**
   * loop through analysis setting layer infos and display layers accordion
   */
  displayAnalysisLayerInfo = (isAutoRefresh?: boolean) => {
    const items: React.JSX.Element[] = []
    this.setState({
      dataSetArray: []
    })
    if (this.state.displayLayerAccordion.length > 0) {
      this.setState({
        showNoResultsFoundMsg: false,
        queryAborted: false,
        displayLayerAccordion: []
      })
      this.destroyHighlightGraphicsLayer()
      this.clearMessageAction()
    }
    const defArray = []
    const configLayersInfo = this.state.analysisSettings?.layersInfo
    const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    if ((showAllFeatures || ((searchByLocation || searchCurrentExtent) && this.state.aoiGeometries)) && this.state.jimuMapView &&
      configLayersInfo?.length > 0) {
      let totalAnalysisResult: number = 0
      //find out the number of analysis results returned
      configLayersInfo.forEach((layerInfo, index) => {
        const analysisId = layerInfo.analysisInfo.analysisId ?? index.toString()
        const filteredFeatures = this.featuresByAnalysisId[analysisId] ?? this.featuresByDsId[layerInfo.useDataSource.dataSourceId]
        if (layerInfo.analysisInfo.analysisType === AnalysisTypeName.Closest) {
          if (filteredFeatures?.length > 0) {
            totalAnalysisResult += 1
          }
        } else {
          totalAnalysisResult += filteredFeatures?.length ?? 0
        }
      })
      const isReturnOneAnalysisResult = totalAnalysisResult === 1
      configLayersInfo.forEach((layerInfo, index) => {
        //if show all features or map area is on then don't show closest analysis type layers
        if (!((showAllFeatures || searchCurrentExtent) && layerInfo.analysisInfo.analysisType === AnalysisTypeName.Closest)) {
          //Loop through all analysis layers settings configuration
          //Any layer which does not falls in the layer arrays
          //are not present in the webmap/webscene
          //skip analysis for those layers
          if (this.availableLayersIds.includes(layerInfo.useDataSource.dataSourceId) ||
          (layerInfo.useDataSource.dataViewId && this.availableLayersIds.includes(layerInfo.useDataSource.mainDataSourceId))) {
            const analysisId = layerInfo.analysisInfo.analysisId ?? index.toString()
            defArray.push(this.performAnalysis(layerInfo, analysisId, isReturnOneAnalysisResult))
          }
        }
      })
      Promise.all(defArray).then((results: any) => {
        if (results.length) {
          this.analysisLayersResults = results
        }
        results.forEach((result, index: number) => {
          //Build output data source for proximity and closest analysis
          //for summary output ds will be built once expressions are resolved
          if (result) {
            const analysisId: string = result.layerInfo.analysisInfo.analysisId ?? index.toString()
            const outputDsId = getOutputDsId(this.props.widgetId, result.layerInfo.analysisInfo.analysisType, analysisId)
            if (result.layerInfo.analysisInfo.analysisType === AnalysisTypeName.Summary) {
              if (result.count === 0) {
                this.updateSummaryOutputDS(result.layerInfo.label, result.layerInfo.useDataSource.dataSourceId, result.layerInfo.analysisInfo.summaryFields, analysisId, 0)
              }
            } else {
              this.buildOutputDsResults(result.layerInfo.label, outputDsId, result.records, result)
            }
          }
          if (result?.count > 0) {
            let canToggle: boolean = true
            // don't expand features list if summary is not added
            if (result.layerInfo.analysisInfo.analysisType === 'summary' && result.items.length === 0) {
              canToggle = false
            }
            const dsId = result.layerInfo.useDataSource.dataSourceId
            const canExportData: boolean = this.state.showExportButton && result.allowExport
            const expandLayer: boolean = result.layerInfo.analysisInfo.expandOnOpen
            this.closestFeaturesByIndexAndDsId[items.length + '_' + dsId] = result.records

            //Filter layers to show only the result
            //when only closest configured for any data source, filter to show only one closest feature else show the  result
            if (!isAutoRefresh && searchByLocation && this.state.analysisSettings?.onlyShowLayersResult) {
              if (this.checkOnlyClosestConfiguredForDS(dsId)) {
                this.filterToOnlyShowResultFeatures(dsId, result.records)
              } else {
                this.filterToOnlyShowResultFeatures(dsId)
              }
            }

            //create highlight graphics
            //in case of show all features and show features in Current Map Area
            //we will not fetch the geometries and hence no need to highlight them
            //only highlight the graphics in case when search area is defined for distance
            if (searchByLocation) {
              let highlightResults = true
              let highlightResultsColor = defaultHighlightResultsColor
              highlightResults = result.layerInfo.analysisInfo.highlightResultsOnMap
              highlightResultsColor = result.layerInfo.analysisInfo.highlightColorOnMap
              const clipFeatures = result.layerInfo.analysisInfo.clipFeatures && result.layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity
              this.createHighlightGraphicsForLayer(result.records, expandLayer, highlightResults, highlightResultsColor, clipFeatures)
            }
            const records = this.featuresByAnalysisId[result.layerInfo.analysisInfo.analysisId] ?? this.featuresByDsId[dsId]
            items.push(<LayerAccordion
              theme={this.props.theme}
              key={index}
              intl={this.props.intl}
              widgetId={this.props.widgetId}
              label={result.layerInfo.label}
              analysisIcon={this.state.analysisSettings?.displayAnalysisIcon ? this.getAnalysisTypeIcon(result.layerInfo.analysisInfo.analysisType) : null}
              featureCount={result.layerInfo.analysisInfo.displayFeatureCount ? result?.count : null}
              isExpanded={expandLayer}
              isListView={true}
              index={items.length}
              dsId={dsId}
              analysisId={result.layerInfo.analysisInfo.analysisId}
              analysisType={result.layerInfo.analysisInfo.analysisType}
              showExportButton={canExportData}
              onToggle={this.onLayerToggle}
              records={records}
              searchSettings={this.state.searchSettings}
              analysisSettings={this.state.analysisSettings}
              canShowMoreFeatures={result.layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity && result?.count > 20}
              canToggle={canToggle}>
              {result.items}
            </LayerAccordion>)
          }
        })
        const saveFeatureConfig = this.getSaveFeaturesConfig(items.length > 0)
        this.setState({
          showSaveIcon: saveFeatureConfig.anyInputFeatureEnabled || saveFeatureConfig.onlySearchAreaEnabled,
          displayLayerAccordion: items,
          showNoResultsFoundMsg: items.length === 0,
          loadingAllFeaturesFromDs: false
        }, () => {
          if (this.state.displayLayerAccordion.length > 0) {
            //enable the visibility of all configured layers and
            //return search results when they are turned off in the web map or during runtime using Layer List widget.
            configLayersInfo.forEach((layerInfo, index) => {
              if (this.availableLayersIds.includes(layerInfo.useDataSource.dataSourceId) ||
                (layerInfo.useDataSource.dataViewId && this.availableLayersIds.includes(layerInfo.useDataSource.mainDataSourceId))) {
                const mapFeatureLayer = this.state.jimuMapView.getJimuLayerViewByDataSourceId(layerInfo.useDataSource.dataSourceId)?.layer
                if (mapFeatureLayer && !mapFeatureLayer.visible && this.state.analysisSettings.displayAllLayersResult) {
                  mapFeatureLayer.visible = true
                }
              }
            })
          }
        })
      })
    }
  }

  /**
   * Retrieves config value of save input features and search area
   * @param resultsFound
   * @returns save features config
   */
  getSaveFeaturesConfig = (resultsFound: boolean) => {
    const saveFeatureConfig = {
      anyInputFeatureEnabled: false,
      onlySearchAreaEnabled: false
    }
    if (resultsFound && !(this.state.searchSettings?.searchByActiveMapArea && this.state.searchSettings?.includeFeaturesOutsideMapArea)) {
      if (this.state.analysisSettings?.saveFeatures?.saveInputLocation) {
        const drawnIncidentGeometryType = this.state.aoiGeometries.incidentGeometry.type
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        switch (drawnIncidentGeometryType) {
          case 'point':
            saveFeatureConfig.anyInputFeatureEnabled = this.state.analysisSettings.saveFeatures.pointFeature.enabled && !!this.state.analysisSettings.saveFeatures.pointFeature.useDataSource
            break
          case 'polyline':
            saveFeatureConfig.anyInputFeatureEnabled = this.state.analysisSettings.saveFeatures.polylineFeature.enabled && !!this.state.analysisSettings.saveFeatures.polylineFeature.useDataSource
            break
          case 'polygon':
            saveFeatureConfig.anyInputFeatureEnabled = this.state.analysisSettings.saveFeatures.polygonFeature.enabled && !!this.state.analysisSettings.saveFeatures.polygonFeature.useDataSource
            break
        }
      }
      // if all input locations are disabled then only check for save search area
      if (!saveFeatureConfig.anyInputFeatureEnabled) {
        saveFeatureConfig.onlySearchAreaEnabled = this.state.aoiGeometries?.bufferDistance > 0 && this.state.analysisSettings.saveFeatures?.searchAreaFeature?.enabled && !!this.state.analysisSettings.saveFeatures?.searchAreaFeature?.useDataSource
      }
    }
    return saveFeatureConfig
  }

  /**
   * Build output data source results for Proximity and Closest analysis
   * @param analysisLabel - Configured analysis label
   * @param outputDsId output dataSource id
   * @param featureRecords resultant feature records
   * @param result analysis result
   */
  buildOutputDsResults = async (analysisLabel: string, outputDsId: string, featureRecords: DataRecord[], result: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500))//TODO: check for the outputds json delay in saving in the app config
    const { showAllFeatures, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    let outputDS = this.getOutputDataSource(outputDsId)
    const dsManager = DataSourceManager.getInstance()
    const ds = dsManager.getDataSource(result.layerInfo.useDataSource.dataSourceId) as FeatureLayerDataSource
    if (!outputDS) {
      outputDS = await dsManager.createDataSource(outputDsId) as FeatureLayerDataSource
    }
    if (!outputDS) {
      return
    }

    const schema = outputDS.getSchema()
    const fieldsToExport = this.getFieldsToExport(result.layerInfo.analysisInfo.analysisId)
    const newSchema = schema

    const dsJson = { ...outputDS.getDataSourceJson() }
    // If user is in search by current extent or show all features mode,
    // We will create output ds as tables since we don't have geometries of intersecting features in this mode
    if (searchCurrentExtent || showAllFeatures) {
      delete dsJson.geometryType
    } else {
      //in case of specify location only we can have clipped features functionality
      //if we have esriCTClippedInfo update the alias to show the current selected unit
      const esriCTClippedInfoField: any = dsJson.schema?.fields?.esriCTClippedInfo
      //Set the Area or Length label along with the Units
      if (esriCTClippedInfoField) {
        const distanceUnit = this.state.aoiGeometries?.distanceUnit || this.state.searchSettings?.distanceUnits || getPortalUnit()
        const unitAbbr = this.getSelectedUnitsAbbr(distanceUnit as __esri.LengthUnit)
        //show square unit for area
        if (dsJson.geometryType === "esriGeometryPolygon") {
          esriCTClippedInfoField.alias = this.props.intl.formatMessage({
            id: 'areaUnitForDSColumn', defaultMessage: defaultMessages.areaUnitForDSColumn
          }, { unitLabel: unitAbbr })
        } else {
          esriCTClippedInfoField.alias = this.props.intl.formatMessage({
            id: 'lengthUnitLabel', defaultMessage: defaultMessages.lengthUnitLabel
          }, { unitLabel: unitAbbr })
        }
      }
    }
    // Update the disableExport option based on allowExport in the output data source instance.
    dsManager.updateDataSourceByDataSourceJson(outputDS, Immutable({ ...dsJson, disableExport: !result.allowExport, exportOptions: ds.getExportOptions() }))
    //filter the schema fields depending on the configured exported fields
    const featureFields = Object.keys(newSchema?.fields)
      .filter(key => fieldsToExport.includes(key) || result.layerInfo.analysisInfo.includeApproxDistance)
      .reduce((obj, key) => {
        obj[key] = schema?.fields[key]
        return obj
      }, {})

    const fieldsInPopupTemplate: any[] = []
    //create field infos for layer and popupTemplate
    for (const key in featureFields) {
      const popupFieldItem = {
        fieldName: featureFields[key].name,
        label: featureFields[key].alias
      }
      //create fields in popup template
      fieldsInPopupTemplate.push(popupFieldItem)
    }

    const featureLayerDs = this.getOutputDataSource(outputDsId) as FeatureLayerDataSource
    const layerDef = { ...dataSourceUtils.getLayerDefinitionIntersection(ds.getLayerDefinition(), featureLayerDs), timeInfo: null }
    //update the layerDefinition with the layer definition of the data source so that the domain values will shown
    featureLayerDs?.setLayerDefinition(layerDef)
    //create custom feature layer with all the analysis layer info
    const layer = await dataSourceUtils.createJSAPIFeatureLayerByRecords(featureLayerDs, featureRecords as FeatureDataRecord[], null, {
      id: outputDsId + '_layer',
      title: outputDsId,
      popupTemplate: { //feature info widget popup title
        title: analysisLabel ?? outputDS.getLabel() ?? outputDsId,
        fieldInfos: fieldsInPopupTemplate,
        content: [{
          type: 'fields',
          fieldInfos: fieldsInPopupTemplate
        }]
      },
      visible: false,
      listMode: 'hide',
      customParameters: {
        moveFeaturesToCenterWhenPrinting: true
      }
    }).then(res => res.layer)

    // If user is in search by current extent or show all features mode,
    // Set the layer's isTable property to true and set isTable to true as we don't have geometries in this mode
    if (searchCurrentExtent || showAllFeatures) {
      Object.defineProperty(layer, 'isTable', {
        writable: true,
      })
      // @ts-expect-error
      layer.isTable = true
    }

    if (layer && featureLayerDs) {
      featureLayerDs.layer = layer
    }

    if (result.allowExport) {
      const dataSetArr = this.state.dataSetArray
      dataSetArr.push({
        records: featureRecords,
        dataSource: outputDS,
        name: outputDS.getLabel(),
        fields: fieldsToExport
      })
      if (result.layerInfo.analysisInfo.analysisType === AnalysisTypeName.Proximity) {
        this.buildOutputDataSetForProximityCount(result, analysisLabel, featureRecords, outputDS, outputDsId)
      }
      await this.updateDataActionDataSet(dataSetArr)
    }

    //update the data source status
    this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDsId)?.setCountStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDsId)?.addSourceVersion()
  }

  /**
   * Build output data set for the proximity total feature count in the exported CSV
   * @param result analysis result
   * @param analysisLabel Configured analysis label
   * @param featureRecords resultant feature records
   * @param outputDS output data source
   * @param outputDsId output dataSource id
   */
  buildOutputDataSetForProximityCount = (result: any, analysisLabel: string, featureRecords: DataRecord[],
    outputDS: DataSource, outputDsId: string) => {
    const proximityFieldsArr: __esri.FieldProperties[] = [
      {
        alias: 'OBJECTID',
        type: 'double',
        name: 'OBJECTID'
      },
      {
        alias: this.nls('layer'),
        type: 'string',
        name: 'layerName'
      },
      {
        alias: this.nls('count'),
        type: 'double',
        name: 'esriCTProximityLayerCount'
      }]
    const proximityFieldsValues: any = {}
    proximityFieldsValues.OBJECTID = 0
    proximityFieldsValues.layerName = analysisLabel
    proximityFieldsValues.esriCTProximityLayerCount = featureRecords.length
    //define dummy point geometry as for proximity analysis feature count value we don't have any geometry
    const dummyPointGeometry = {
      type: 'point',
      x: this.state.jimuMapView?.view?.extent.center.x,
      y: this.state.jimuMapView?.view?.extent.center.y,
      spatialReference: { wkid: this.mapView.spatialReference.wkid }
    } as __esri.geometryGeometry

    const proximityFieldsGraphic = new Graphic({
      attributes: proximityFieldsValues,
      geometry: dummyPointGeometry
    })

    const fieldsInPopupTemplate: any[] = []
    proximityFieldsArr.forEach((fields) => {
      if (fields.name) {
        fieldsInPopupTemplate.push({
          fieldName: fields.name,
          label: fields.alias
        })
      }
    })

    //create custom feature layer with all the feature count info
    const layer = new FeatureLayer({
      id: outputDsId + '_layer',
      title: outputDsId,
      fields: proximityFieldsArr,
      geometryType: 'point',
      source: [proximityFieldsGraphic],
      objectIdField: 'OBJECTID',
      popupTemplate: { //feature info widget popup title
        title: analysisLabel ?? outputDS.getLabel() ?? outputDsId,
        fieldInfos: fieldsInPopupTemplate,
        content: [{
          type: 'fields',
          fieldInfos: fieldsInPopupTemplate
        }]
      },
      visible: false,
      listMode: 'hide',
      customParameters: {
        moveFeaturesToCenterWhenPrinting: true
      }
    })

    const fields: any = {}

    const proximityFieldsSchema: FieldSchema[] = [
      {
        alias: 'OBJECTID',
        type: JimuFieldType.Number,
        jimuName: 'OBJECTID',
        name: 'OBJECTID'
      },
      {
        alias: this.nls('layer'),
        type: JimuFieldType.String,
        jimuName: 'layerName',
        name: 'layerName'
      },
      {
        alias: this.nls('count'),
        type: JimuFieldType.Number,
        jimuName: 'esriCTProximityLayerCount',
        name: 'esriCTProximityLayerCount'
      }]
    proximityFieldsSchema?.forEach((fieldSchema, index) => {
      if (index === 0) {
        fields.OBJECTID = fieldSchema
      } else if (fieldSchema?.name === 'esriCTProximityLayerCount') {
        fields.esriCTProximityLayerCount = fieldSchema
      } else {
        fields[fieldSchema?.jimuName] = fieldSchema
      }
    })

    const proximityCountDsId = outputDsId + '_Count'
    const dsLabel = analysisLabel + ' (' + this.nls(result.layerInfo.analysisInfo.analysisType) + ' ' + this.nls('count') + ')'
    const dsManager = DataSourceManager.getInstance()
    if (dsManager.getDataSource(proximityCountDsId)) {
      dsManager.destroyDataSource(proximityCountDsId)
    }
    result.allowExport && dsManager.createDataSource(Immutable({
      id: proximityCountDsId,
      type: DataSourceTypes.FeatureLayer,
      isDataInDataSourceInstance: true,
      schema: {
        idField: 'OBJECTID',
        fields: fields,
        label: dsLabel
      },
      layer: layer
    })).then(ds => {
      const record = ds.buildRecord(proximityFieldsGraphic)
      ds.setSourceRecords([record])
      const dataSets = {
        records: [record],
        dataSource: ds,
        name: dsLabel
      }
      this.proximityCountDataSetArr.push(dataSets)
    })
  }

  /**
   * Build output dataSource result for summary
   * @param analysisLabel - Configured analysis label
   * @param dsId - use data source id
   * @param summaryFields summary result fields info
   * @param outputDsId Output data source id
   * @param attributesValues resolved summary fields values
   */
  buildOutputDsResultsForSummary = async (analysisLabel: string, dsId: string, summaryFields: SummaryFieldsInfo[], analysisId: string, outputDsId: string, attributesValues: SummaryAttributes) => {
    let outputDS = this.getOutputDataSource(outputDsId)
    if (!outputDS) {
      outputDS = await DataSourceManager.getInstance().createDataSource(outputDsId) as FeatureLayerDataSource
    }
    if (!outputDS) {
      return
    }
    const dsManager = DataSourceManager.getInstance()
    const dataSource = dsManager?.getDataSource(dsId) as FeatureLayerDataSource
    const allowExport = await (dataSource as QueriableDataSource).allowToExportData()

    const dsJson = Object.assign(outputDS.getDataSourceJson())
    // Update the disableExport option based on allowExport in the output data source instance.
    DataSourceManager.getInstance().updateDataSourceByDataSourceJson(outputDS, Immutable({ ...dsJson, disableExport: !allowExport, exportOptions: dataSource.getExportOptions() }))
    const fieldsToExport = this.getFieldsToExport(analysisId)
    //We will always have objectId and count in summary analysis
    //if summary fields are not configured user can still see the count
    const summaryFieldsArr: __esri.FieldProperties[] = [
      {
        alias: 'OBJECTID',
        type: 'double',
        name: 'OBJECTID'
      },
      {
        alias: this.nls('count'),
        type: 'double',
        name: 'esriCTCOUNT'
      }
    ]
    const summaryFieldsValues: any = {}
    // Add objectid and count attributeValues
    summaryFieldsValues.OBJECTID = 0
    if (attributesValues.hasOwnProperty('esriCTCOUNT')) {
      summaryFieldsValues.esriCTCOUNT = attributesValues.esriCTCOUNT
    }
    //push all the configured summary fields
    summaryFields.forEach((fieldInfos) => {
      const fieldName = fieldInfos.fieldLabel.replace(/ /g, '')
      summaryFieldsArr.push({
        alias: fieldInfos.fieldLabel,
        type: 'string',
        name: fieldName
      })
      //if attributesValues are available set it
      if (attributesValues.hasOwnProperty(fieldName)) {
        summaryFieldsValues[fieldName] = attributesValues[fieldName]
      }
    })

    //define dummy point geometry as for summary analysis stats value we don't have any geometry
    const dummyPointGeometry = {
      type: 'point',
      x: this.state.jimuMapView?.view?.extent.center.x,
      y: this.state.jimuMapView?.view?.extent.center.y,
      spatialReference: { wkid: this.mapView.spatialReference.wkid }
    } as __esri.geometryGeometry

    const summaryFieldsGraphic = new Graphic({
      attributes: summaryFieldsValues,
      geometry: dummyPointGeometry
    })

    const fieldsInPopupTemplate: any[] = []
    summaryFieldsArr.forEach((fields) => {
      if (fields.name) {
        fieldsInPopupTemplate.push({
          fieldName: fields.name,
          label: fields.alias
        })
      }
    })

    //create custom feature layer with all the statistics info
    const layer = new FeatureLayer({
      id: outputDsId + '_layer',
      title: outputDsId,
      fields: summaryFieldsArr,
      geometryType: 'point',
      source: [summaryFieldsGraphic],
      objectIdField: 'OBJECTID',
      popupTemplate: { //feature info widget popup title
        title: analysisLabel ?? outputDS.getLabel() ?? outputDsId,
        fieldInfos: fieldsInPopupTemplate,
        content: [{
          type: 'fields',
          fieldInfos: fieldsInPopupTemplate
        }]
      },
      visible: false,
      listMode: 'hide',
      customParameters: {
        moveFeaturesToCenterWhenPrinting: true
      }
    })
    const featureLayerDs = this.getOutputDataSource(outputDsId) as FeatureLayerDataSource
    featureLayerDs.layer = layer
    //query on output ds to get the feature records
    //we need feature to be store in output datasource sumamry
    //to convert the features into feature record in the output ds we have to build the record
    let records
    const query = featureLayerDs.layer.createQuery()
    query.outSpatialReference = this.mapView.spatialReference
    query.returnGeometry = true
    query.outFields = ['*']
    query.where = '1=1'
    featureLayerDs.layer.queryFeatures(query).then(async (results) => {
      if (results.features?.length > 0) {
        records = results.features.map((feature) => {
          return featureLayerDs.buildRecord(feature)
        })
      }
      const dataSetSummaryArr = this.state.dataSetArray
      const summaryFeatureRecords = this.featuresByDsId[dsId]
      allowExport && dataSetSummaryArr.push({
        records: attributesValues.esriCTCOUNT > 0 ? records : [],
        dataSource: outputDS,
        name: outputDS.getLabel()
      })

      allowExport && dsManager.createDataSource(Immutable({
        id: 'downloadCsv_output' + new Date().getTime(),
        type: DataSourceTypes.FeatureLayer,
        isDataInDataSourceInstance: true,
        schema: dataSource.getSchema(),
        exportOptions: dataSource.getExportOptions()
      })).then(ds => {
        const newDsJson = Object.assign(ds.getDataSourceJson())
        DataSourceManager.getInstance().updateDataSourceByDataSourceJson(ds, Immutable({ ...newDsJson, disableExport: !allowExport, exportOptions: dataSource.getExportOptions() }))
        ds.setSourceRecords(summaryFeatureRecords)
        const dataSets = {
          records: summaryFeatureRecords,
          dataSource: ds,
          name: dataSource.getLabel(),
          fields: fieldsToExport
        }
        dataSetSummaryArr.push(dataSets)
      })
      await this.updateDataActionDataSet(dataSetSummaryArr)
    })
    //update the data source status
    this.getOutputDataSource(outputDsId)?.setStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDsId)?.setCountStatus(DataSourceStatus.Unloaded)
    this.getOutputDataSource(outputDsId)?.addSourceVersion()
  }

  /**
   * Update data action data set
   * @param dataActionDataSet data record set array
   * @returns promise
   */
  updateDataActionDataSet (dataActionDataSet: DataRecordSet[]): Promise<void> {
    return new Promise((resolve) => {
      this.setState({
        dataSetArray: dataActionDataSet,
        dataSetUpdated: !this.state.dataSetUpdated
      }, () => {
        resolve()
      })
    })
  }

  /**
   * Get output data source from data source manager instance
   * @param outputDs output data source id
   * @returns output data source
   */
  getOutputDataSource = (outputDsId: string) => {
    return DataSourceManager.getInstance().getDataSource(outputDsId)
  }

  /**
   * Set current widget width
   * @param widgetWidth widget width
   */
  onResize = ({ width, height }) => {
    //if widget size is below 306 then show value in next row
    //else show label and value in one row
    this.setState({
      widgetWidth: width
    })
    this.resizeLayerListHeight()
  }

  /**
   * Update state to know closest Address is Showing or not
   * @param isClosestAddressShowing if closest address is showing
   */
  updateClosestAddressState = (isClosestAddressShowing: boolean) => {
    this.setState({
      isClosestAddressShowing: isClosestAddressShowing
    }, () => {
      this.resizeLayerListHeight()
    })
  }

  /**
   * When onlyShowLayerResults configuration is changed in live mode
   * Update the filters on each layers according to the curent state of onlyShowLayerResults
   */
  onOnlyShowLayerResultsChanged = () => {
    //if only show results enabled apply filters to the layers
    //else clear the filters
    if (this.state.analysisSettings?.onlyShowLayersResult) {
      this.featuresByDsId && Object.keys(this.featuresByDsId).forEach((dsId) => {
        let records
        //when only closest configured for any data source, then only one record should be shown
        if (this.checkOnlyClosestConfiguredForDS(dsId) && this.closestFeaturesByIndexAndDsId) {
          //loop through the closestFeaturesByIndex and get the only closest feature record
          Object.keys(this.closestFeaturesByIndexAndDsId).some((indexAndDsId) => {
            /* @ts-expect-error */
            if (indexAndDsId.split(/_(.*)/s)[1] === dsId) {
              records = this.closestFeaturesByIndexAndDsId[indexAndDsId]
              return true
            }
            return false
          })
        }
        this.filterToOnlyShowResultFeatures(dsId, records)
      })
    } else {
      this.resetFilters(true)
    }
  }

  /**
   * Filters the Data Source to show only the resultant features
   * @param ds - DataSource
   * @param records - Features to be filtered, if passed only those features will be shown else features from the variable featuresByDsId will only be shown
   */
  filterToOnlyShowResultFeatures = (dsId, records?) => {
    if (this.state.analysisSettings?.onlyShowLayersResult && dsId && this.featuresByDsId[dsId]) {
      const ds = getSelectedLayerInstance(dsId) as any
      if (ds) {
        const recordsList = records || this.featuresByDsId[dsId]
        const objIdField = ds?.getIdField()
        const oIds: any[] = []
        recordsList.forEach((record) => { oIds.push(record?.feature?.attributes[objIdField]) })
        let queryParams = {} as QueryParams
        if (oIds.length > 0) {
          queryParams = { where: '(((' + objIdField + ' IN (' + oIds.join(',') + '))))' } as QueryParams
        } else if (oIds.length === 0) {
          queryParams = { where: '1=2' } as QueryParams
        }
        (ds as QueriableDataSource).updateQueryParams?.(queryParams, this.props.id)
        //store the dsId in filtersAppliedOnDsId array, so that we can use the array to reset them
        if (!this.filtersAppliedOnDsId.includes(dsId)) {
          this.filtersAppliedOnDsId.push(dsId)
        }
      }
    }
  }

  /**
   * Removes all filters applied by the widget
   * @param forceReset if need to force reset
   */
  resetFilters = (forceReset?: boolean) => {
    const emptyQueryParams = { where: '1=1', sqlExpression: null } as QueryParams
    if ((this.state.analysisSettings?.onlyShowLayersResult || forceReset) && this.state.jimuMapView) {
      //reset the filters applied by near-me widget
      this.filtersAppliedOnDsId.forEach((dsId) => {
        const ds = getSelectedLayerInstance(dsId) as any
        if (ds) {
          (ds as QueriableDataSource).updateQueryParams?.(emptyQueryParams, this.props.id)
        }
      })
      //empty the array, so next time we can reset filters only for those ds which are applied by near-me
      this.filtersAppliedOnDsId = []
    }
  }

  /**
   * Checks if only closest is configured for the dsId
   * @param dsId string dataSourceId
   * @returns true if only closest configured for the dsId
   */
  checkOnlyClosestConfiguredForDS = (dsId: string): boolean => {
    const analysisForDsId: string[] = []
    //get all the analysis types configured for the dsId
    this.state.analysisSettings?.layersInfo.forEach((layerInfo) => {
      if (dsId === layerInfo.useDataSource.dataSourceId) {
        analysisForDsId.push(layerInfo.analysisInfo.analysisType)
      }
    })
    //if proximity or summary is include return false else return true
    if (analysisForDsId.includes(AnalysisTypeName.Proximity) || analysisForDsId.includes(AnalysisTypeName.Summary)) {
      return false
    }
    return true
  }

  /**
   * Emits event on search by rest button is clicked
   */
  onResetButtonClick = () => {
    this.aoiToolRef.current?.refreshButtonClicked()
    this.setState({
      showExportOptions: false,
      showFeatureForm: false,
      currentPage: 1
    })
  }

  /**
   * Emits when save button is clicked
   */
  onSaveInputLocationClick = () => {
    const saveFeaturesConfig = this.getSaveFeaturesConfig(true)
    // if only saveSearchArea is enabled from config then direct render to 2nd page
    this.setState({
      showFeatureForm: true,
      currentPage: saveFeaturesConfig.onlySearchAreaEnabled ? 2 : 1
    }, () => {
      let geometryType
      // if page number is 1 then geometry type is incident geometry
      if (this.state.currentPage === 1) {
        geometryType = this.state.aoiGeometries.incidentGeometry.type
      } else {
        geometryType = this.state.aoiGeometries.bufferGeometry.type
      }
      this.initializeForm(geometryType)
    })
  }

  /**
   * Retrieves the layer to save the feature
   * @param geometryType Geometry type of the feature
   * @returns feature layer
   */
  getLayerToSaveFeature = (geometryType) => {
    let dsId: string
    if (this.state.currentPage === 2) {
      dsId = this.state.analysisSettings.saveFeatures.searchAreaFeature.useDataSource.dataSourceId
    } else {
      switch (geometryType) {
        case 'point':
          dsId = this.state.analysisSettings.saveFeatures.pointFeature.useDataSource.dataSourceId
          break
        case 'polyline':
          dsId = this.state.analysisSettings.saveFeatures.polylineFeature.useDataSource.dataSourceId
          break
        case 'polygon':
          dsId = this.state.analysisSettings.saveFeatures.polygonFeature.useDataSource.dataSourceId
          break
      }
    }
    const layerObj = getSelectedLayerInstance(dsId) as FeatureLayerDataSource
    return layerObj.layer
  }

  /**
   * Initialized the feature form
   * @param geometryType Geometry type of the feature
   */
  initializeForm = (geometryType) => {
    // if feature form is already initialized then don't initialize it again
    if (this.state.currentPage === 1 && this.incidentGeomfeatureForm) {
      return
    } else if (this.state.currentPage === 2 && this.bufferGeomfeatureForm) {
      return
    }
    const layer = this.getLayerToSaveFeature(geometryType)
    // if page number is 2 and AOI geometry type is polygon then show form for bufferGeometry
    // else show form for incident geometry
    let geometry = geometryType === 'polygon' && this.state.currentPage === 2
      ? this.state.aoiGeometries.bufferGeometry
      : this.state.aoiGeometries.incidentGeometry

    // Remove Z and M values if the layer doesn't support them
    if (geometry && (geometry.hasZ || geometry.hasM)) {
      const layerHasZ = layer.capabilities?.data?.supportsZ || layer.hasZ || false
      const layerHasM = layer.capabilities?.data?.supportsM || layer.hasM || false

      // Clone the geometry to avoid modifying the original
      const clonedGeometry = geometry.clone()

      // Remove Z values if layer doesn't support Z coordinates
      if (geometry.hasZ && !layerHasZ) {
        clonedGeometry.hasZ = false
      }

      // Remove M values if layer doesn't support M coordinates
      if (geometry.hasM && !layerHasM) {
        clonedGeometry.hasM = false
      }

      geometry = clonedGeometry
    }
    const container = geometryType === 'polygon' && this.state.currentPage === 2 ? 'buffer-feature-form' : 'incident-feature-form'
    const graphic = new Graphic({
      geometry: geometry
    })
    const featureForm = new FeatureForm({
      container: container,
      layer: layer,
      feature: graphic
    })

    if (this.state.currentPage === 1) {
      this.incidentGeomfeatureForm = featureForm
    } else {
      this.bufferGeomfeatureForm = featureForm
    }
    this.handleFormSubmit()
  }

  /**
   * Handles the form submission
   */
  handleFormSubmit = () => {
    const incidentFormPromise = new Promise((resolve) => {
      this.incidentGeomfeatureForm?.on('submit', (e) => {
        if (e.invalid.length) {
          this.pageChanged(1)
        } else if (!this.bufferGeomfeatureForm) {
          this.submitForm()
        } else {
          resolve(true)
        }
      })
    })

    const bufferFormPromise = new Promise((resolve) => {
      this.bufferGeomfeatureForm?.on('submit', (e) => {
        if (this.incidentGeomfeatureForm) {
          incidentFormPromise.then(() => {
            if (e.invalid.length) {
              this.pageChanged(2)
            } else {
              resolve(true)
            }
          })
        } else {
          if (e.invalid.length) {
            this.pageChanged(2)
          } else {
            this.submitForm()
          }
        }
      })
    })
    // Wait for both forms to finish submission
    Promise.all([incidentFormPromise, bufferFormPromise]).then(() => {
      this.submitForm()
    })
  }

  /**
   * Resets the feature form
   */
  resetFeatureForm = () => {
    if (this.state.showFeatureForm) {
      this.incidentGeomfeatureForm = undefined
      this.bufferGeomfeatureForm = undefined
      this.setState({
        showFeatureForm: false,
        currentPage: 1,
        formFailedMsg: ''
      })
    }
  }

  /**
   * Changes the page
   * @param evt page number
   */
  pageChanged = (evt) => {
    this.setState({
      currentPage: evt
    }, () => {
      this.initializeForm(this.state.currentPage === 1 ? this.state.aoiGeometries.incidentGeometry.type : this.state.aoiGeometries.bufferGeometry.type)
    })
  }

  /**
   * Emits the submit event when submit button is clicked
   */
  submitBtnClicked = () => {
    if (this.incidentGeomfeatureForm) {
      this.incidentGeomfeatureForm.submit()
    }
    if (this.bufferGeomfeatureForm) {
      this.bufferGeomfeatureForm.submit()
    }
  }

  /**
   * Submits the feature form
   */
  submitForm = async () => {
    this.setState({
      isSubmittingForm: true
    })
    try {
      if (this.incidentGeomfeatureForm) {
        const incidentFeatureLayer: any = this.incidentGeomfeatureForm.layer
        this.incidentGeomfeatureForm.feature.attributes = this.incidentGeomfeatureForm.getValues()
        await incidentFeatureLayer.applyEdits({
          addFeatures: [this.incidentGeomfeatureForm.feature]
        })
      }
      if (this.bufferGeomfeatureForm) {
        try {
          const bufferFeatureLayer: any = this.bufferGeomfeatureForm.layer
          this.bufferGeomfeatureForm.feature.attributes = this.bufferGeomfeatureForm.getValues()
          await bufferFeatureLayer.applyEdits({
            addFeatures: [this.bufferGeomfeatureForm.feature]
          })
          this.incidentGeomfeatureForm = undefined
          this.bufferGeomfeatureForm = undefined
          this.setState({
            showFeatureForm: false,
            currentPage: 1,
            isSubmittingForm: false,
            formFailedMsg: ''
          })
        } catch (bufferError) {
          console.error(bufferError)
          this.setState({
            formFailedMsg: bufferError.message,
            showFeatureForm: true,
            isSubmittingForm: false
          }, () => {
            this.handleFormSubmit()
          })
        }
      } else {
        this.incidentGeomfeatureForm = undefined
        this.bufferGeomfeatureForm = undefined
        this.setState({
          showFeatureForm: false,
          isSubmittingForm: false,
          currentPage: 1,
          formFailedMsg: ''
        })
      }
    } catch (incidentError) {
      console.error(incidentError)
      this.setState({
        formFailedMsg: incidentError.message,
        isSubmittingForm: false
      }, () => {
        this.pageChanged(1)
        this.handleFormSubmit()
      })
    }
  }

  /**
   * Aborts the query
   */
  stopLoading = () => {
    const abortController = this.abortControllerRef
    abortController.forEach((abortController) => {
      abortController.abort()
    })
    this.onResetButtonClick()
    this.featuresByDsId = {}
    this.featuresByAnalysisId = {}
    this.closestFeaturesByIndexAndDsId = {}
    this.setState({
      queryAborted: true,
      loadingAllFeaturesFromDs: false
    })
  }

  /**
   * Get the Prompt display message in alert
   * @param layerName selected layer name
   * @returns prompt message string
   */
  getPromptMessageString = (layerName: string): string => {
    let getPromptTitleMessage = ''
    getPromptTitleMessage = this.props.intl.formatMessage({
      id: 'promptTitleMessageFromDataAction', defaultMessage: defaultMessages.promptTitleMessageFromDataAction
    }, { layerName: layerName })
    return getPromptTitleMessage
  }

  /**
   * @param layerName
   * @returns save location header
   */
  getSaveInputLocationHeaderString = (layerName: string): string => {
    let saveLocationHeader = ''
    saveLocationHeader = this.props.intl.formatMessage({
      id: 'saveInputLocationLabel', defaultMessage: defaultMessages.saveInputLocationLabel
    }, { layerName: layerName })
    return saveLocationHeader
  }

  /**
   * @param layerName
   * @returns save search area header
   */
  getSaveSearchAreaLabelHeaderString = (layerName: string): string => {
    let saveSearchAreaHeader = ''
    saveSearchAreaHeader = this.props.intl.formatMessage({
      id: 'saveSearchAreaLabel', defaultMessage: defaultMessages.saveSearchAreaLabel
    }, { layerName: layerName })
    return saveSearchAreaHeader
  }

  /**
   * Export batch export files
   */
  onBatchExportToggle = async () => {
    if (!this.state.showExportOptions) { // open the dropdown menu
      this.setState({
        isDropDownLoading: true
      })
      try {
        const [recordActions] = await this.getAvailableActions()
        const recordActionNames = Object.keys(recordActions)
        this.setState({
          actionNames: recordActionNames,
          actionNamesGroups: recordActions
        })
      } catch (err) {
        console.error(err)
        this.setState({
          actionNamesGroups: {}
        })
      }
      this.setState({
        showExportOptions: !this.state.showExportOptions
      })
      this.setState({
        isDropDownLoading: false
      })
    } else {
      this.setState({
        showExportOptions: !this.state.showExportOptions
      })
    }
  }

  /**
   * Get all the available data action
   * @returns records action promise
   */
  getAvailableActions = () => {
    // If no records, return empty record action list
    let recordActionsPromise = null
    const recordsCount = this.getRecordsCount()
    if (recordsCount !== 0) {
      recordActionsPromise = DataActionManager.getInstance().getSupportedActions(this.props.widgetId, this.state.dataSetArray, DataLevel.Records)
    }
    return Promise.all([recordActionsPromise || {}])
  }

  /**
   * Get available records count
   * @returns records count
   */
  getRecordsCount = () => {
    let count = 0
    for (const dataSet of this.state.dataSetArray) {
      count += dataSet.records?.length
    }
    return count
  }

  /**
   * Show a feature form functionality for saving input location
   * @returns Feature form for saving the input location
   */
  renderFormForSavingInputLocation = () => {
    const theme = this.props.theme
    const saveSearchAreaEnabled = this.state.analysisSettings?.saveFeatures.searchAreaFeature.enabled && !!this.state.analysisSettings.saveFeatures.searchAreaFeature.useDataSource && this.state.aoiGeometries.bufferDistance > 0
    const currentPage = this.state.currentPage
    const buttonText = saveSearchAreaEnabled && currentPage === 1 ? this.nls('next') : this.nls('submit')
    const geometryType = currentPage === 1 ? this.state.aoiGeometries.incidentGeometry.type : this.state.aoiGeometries.bufferGeometry.type
    const layer = this.getLayerToSaveFeature(geometryType)
    const formHeaderText = currentPage === 1 ? this.getSaveInputLocationHeaderString(layer.title) : this.getSaveSearchAreaLabelHeaderString(layer.title)

    const formContainer = css`
        display: flex;
        flex-direction: column;
        height: 100%;
        `
    const formHeader = css`
        position: sticky;
        top: 0;
        display: flex;
        `
    const backButton = css`
        flex-shrink: 0;
        `
    const formHeaderTitle = css`
        border-left: ${currentPage === 2 ? `1px solid ${theme.sys.color.divider.secondary}` : 'none'};
        `
    const formBody = css`
        flex: 1;
        overflow-y: auto;
        border-top: 1px solid ${theme.sys.color.divider.secondary};
        border-bottom: 1px solid ${theme.sys.color.divider.secondary};
        `
    const formFooterButtons = css`
        position: sticky;
        bottom: 5px;
        display: flex;
        `
    const buttonBorder = css`
        border-radius: 0px !important;
       `
    return (
      <React.Fragment>
        <div css={formContainer}>
          <div css={formHeader}>
            {this.state.currentPage === 2 && this.incidentGeomfeatureForm &&
              <Button css={backButton} aria-label={this.nls('back')} type='tertiary' icon onClick={() => { currentPage === 2 ? this.pageChanged(1) : this.resetFeatureForm() }}>
                <LeftOutlined autoFlip />
              </Button>}
            <Typography css={formHeaderTitle} variant="title2" color="paperText" className="py-3 px-2">
              {formHeaderText}
            </Typography>

          </div>
          <div css={formBody} className={'mb-3'}>
            {this.state.formFailedMsg && <Alert
              style={{ width: '100%' }}
              aria-live="polite"
              closable
              form="basic"
              onClose={() => { this.setState({ formFailedMsg: '' }) }}
              open
              shape="none"
              size="medium"
              text={this.state.formFailedMsg}
              title={this.nls('formSubmissionFailedMsg')}
              type="error"
              variant="contained"
              withIcon
            />}
            <div style={{ display: currentPage === 1 ? 'block' : 'none' }} id='incident-feature-form'></div>
            <div style={{ display: currentPage === 2 ? 'block' : 'none' }} id='buffer-feature-form'></div>
          </div>
          <div css={formFooterButtons} className='px-3'>
            <Button block role={'button'} aria-label={this.nls('cancel')} title={this.nls('cancel')}
              size={'default'} type='secondary'
              css={buttonBorder}
              onClick={this.resetFeatureForm}>
              {this.nls('cancel')}
            </Button>
            <Button block role={'button'} aria-label={buttonText} title={buttonText}
              size={'default'} type='primary'
              css={buttonBorder}
              onClick={() => {
                currentPage === 2 ? this.submitBtnClicked() : saveSearchAreaEnabled && currentPage === 1 ? this.pageChanged(2) : this.submitBtnClicked()
              }}>
              {buttonText}
            </Button>
          </div>
        </div>
      </React.Fragment>
    )
  }

  /**
   * Render the batch Export dropdown list
   * @returns export options dropdown list
   */
  renderBatchExportList = () => {
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    let showAOI = false
    if (searchByLocation) {
      showAOI = true
    }
    const isRTL = getAppStore().getState().appContext.isRTL
    const printReportData = []
    let isAnyAnalysisGroupingEnabled: boolean = false
    let reportData
    if (this.analysisLayersResults.length || this.summaryAttributes) {
      reportData = this.createPrintReportData(printReportData)
    }
    //if grouping is enabled then only show the merge rows for groups and subgroups in PDF popup
    this.analysisLayersResults.forEach((result) => {
      if (result.layerInfo.analysisInfo.groupFeaturesEnabled && result.layerInfo.analysisInfo.groupFeatures.groupFeaturesByField !== '' &&
            result.featuresAndGroup?.featuresGroup?.length > 0) {
        isAnyAnalysisGroupingEnabled = true
      }
    })
    const actionButton = css`
     padding-top: 7px!important;
    `
    const loadingStyle = css`
        @keyframes loading {
          0% {transform: rotate(0deg); };
          100% {transform: rotate(360deg)};
        }
        position: absolute;
        width: 60%;
        height: 60%;
        top: 20%;
        left: 20%;
        border: 2px solid var(--sys-color-secondary-light);
        border-radius: 50%;
        border-top: 2px solid var(--sys-color-primary-main);
        box-sizing: border-box;
        animation:loading 2s infinite linear;
      `
    return (
      <React.Fragment>
        <Dropdown className={'float-right'} direction='down' size='sm' aria-label={this.nls('exportBtnTitle')}
          useKeyUpEvent toggle={this.onBatchExportToggle} isOpen={this.state.showExportOptions}>
          <DropdownButton size='sm' arrow={false} css={actionButton} icon ref={this.dropdownRef}
            className='data-action-button' onClick={this.onBatchExportToggle} type='tertiary' title={this.nls('exportBtnTitle')}>
            {!this.state.isDropDownLoading && <ExportOutlined size='m' />}
            {this.state.isDropDownLoading && <div css={loadingStyle} />}
          </DropdownButton>
          <DropdownMenu>
            <Dropdown key={this.state.actionNames.length + 1} direction={'right'} isSubMenuItem={true}>
              <DropdownButton size={'sm'} type={'default'} arrowRight={true} onClick={this.onExportPdfOptionClick}>
                <div className='d-flex align-items-center'>
                  {<span>{this.nls('exportToPdf')}</span>}
                </div>
              </DropdownButton>
              <DropdownMenu>
                <div onClick={this.pdfPopupClick} className='p-3 w-100'>
                  <Report
                    theme={this.props.theme}
                    intl={this.props.intl}
                    mapView={this.state.jimuMapView}
                    reportData={reportData}
                    showAreaOfInterest={showAOI}
                    aoiValue={this.aoiValue}
                    isGroupingEnabled={isAnyAnalysisGroupingEnabled}
                    isRTL={isRTL}
                    folderUrl={this.props.context.folderUrl}
                    onReportExported={this.onExportPdfClick} />
                </div>
              </DropdownMenu>
            </Dropdown>
            {this.state.actionNames?.length > 0 &&
              this.state.actionNames.map(actionName => this.createActionItem(this.state.actionNamesGroups, actionName, DataLevel.Records))}
          </DropdownMenu>
        </Dropdown>
        {this.state.actionElement}
      </React.Fragment>
    )
  }

  /**
   * Zoom to the incident Geometry or a BufferGeometry on export pdf option click
   */
  onExportPdfOptionClick = () => {
    const { searchByLocation } = getSearchWorkflow(this.state.searchSettings)
    if (searchByLocation) {
      const geometryToZoom = this.state.aoiGeometries?.bufferGeometry ? this.state.aoiGeometries.bufferGeometry : this.state.aoiGeometries.incidentGeometry
      //zoom to the incident/buffer geometry
      this.state.jimuMapView?.view.goTo({
        center: geometryToZoom.type === 'point' ? geometryToZoom : geometryToZoom.extent.clone().expand(1.5)
      })
    }
  }

  /**
   * Perform the functionality on export button click
   */
  onExportPdfClick = () => {
    this.setState({
      showExportOptions: false
    })
  }

  /**
   * Stop event propagation on pdf popup click
   * @param evt event
   */
  pdfPopupClick = (evt) => {
    evt.stopPropagation()
  }

  /**
   * Create the report data for exporting pdf
   * @param reportData report data details
   * @returns print report data
   */
  createPrintReportData = (reportData) => {
    const printReportData = reportData
    const showRowIndex = true
    this.analysisLayersResults.forEach((result) => {
      const cols: string[] = [] // array of table columns which will have field aliases/fieldName
      const rows = [] // array of table rows which will have field values
      let attrKeys:string[] = [] // array of field names which will be used to get the field values

      //create print data for only those analysis layers which allowExport is true
      if (result.allowExport) {
        //if the analysis type is summary then get the summary attributes from the output data source
        if (result.layerInfo.analysisInfo.analysisType === AnalysisTypeName.Summary) {
          //Get the summary attributes from the output datasource created for this summary analysis
          const outputDsId = getOutputDsId(this.props.widgetId, AnalysisTypeName.Summary, result.layerInfo.analysisInfo.analysisId)
          const featureLayerDs = this.getOutputDataSource(outputDsId) as FeatureLayerDataSource
          //Summary will always have only one feature with each summary field as attribute
          const summaryFeature = featureLayerDs?.layer?.source?.at(0)
          const eachRow: any[] = []
          //Create cols for each summary field
          result.layerInfo.analysisInfo.summaryFields.forEach((fieldInfos) => {
            const fieldName = fieldInfos.fieldLabel.replace(/ /g, '')
            if (summaryFeature?.attributes.hasOwnProperty(fieldName)) {
              cols.push(fieldInfos.fieldLabel)
              eachRow.push(summaryFeature.attributes[fieldName])
            }
          })
          //Show count column only when no summary fields are configured, if we don't add this then Summary table for this analysis will not be shown
          if (summaryFeature?.attributes.esriCTCOUNT > 0 && cols.length === 0 && eachRow.length === 0) {
            cols.push(this.nls('count'))
            eachRow.push(summaryFeature.attributes.esriCTCOUNT)
          }
          //push the row in rows array
          rows.push(eachRow)
          //push the summary data in printReportData
          printReportData.push({
            data: {
              cols: cols,
              rows: rows,
              showRowIndex: true
            },
            title: result.layerInfo.label,
            totalCount: result.records.length,
            maxNoOfCols: 5
          })
        } else {
          const fieldsToExport = this.getFieldsToExport(result.layerInfo.analysisInfo.analysisId)
          const layerAnalysisInfo = result.layerInfo.analysisInfo
          let records = result.records //get the records from the analysis result if groups are not defiend
          let groupFieldCol: null|number = null
          let subgroupFieldCol: null|number = null
          //if group features are enabled then get the records from the featuresAndGroup
          if (layerAnalysisInfo.groupFeaturesEnabled && layerAnalysisInfo.groupFeatures.groupFeaturesByField !== '' &&
            result.featuresAndGroup?.featuresGroup?.length > 0) {
            records = []
            //loop through the group and get the records
            //if subgroup features are enabled then loop through the subGroupInfo and get the records
            //else get the records from the featuresGroup
            result.featuresAndGroup?.featuresGroup.forEach(featureGroup => {
              if (featureGroup.subGroupInfo?.featuresSubGroup?.length > 0) {
                featureGroup.subGroupInfo.featuresSubGroup.forEach((subGroup) => {
                  records.push(...subGroup.features)
                })
              } else {
                records.push(...featureGroup.features)
              }
            })
          }
          //As we have group and subgroup features, we need to show group field as first column and subgroup field as second column
          //so we need to add group and subgroup field as first two columns in the cols array
          //similarly the key for group and subgroup field should be added as first two keys in the attrKeys array
          //and the rest of the fields should be added in the end of the cols and attrKeys array
          //so that we can show group and subgroup field as first two columns in the table
          let groupCol: string = ''
          let subGroupCol: string = ''
          let groupFieldKey: string = ''
          let subGroupFieldKey: string = ''
          for (const attrKey in records[0]?.feature.attributes) {
            let fieldName: string
            const fields = records[0].feature.layer.fields
            if (fieldsToExport.includes(attrKey)) {
              if (attrKey === 'esriCTApproxDistance') {
                fieldName = this.nls('closestApproxDistance')
              } else if (attrKey === 'esriCTClippedInfo') {
                //Set the Area or Length label along with the Units
                const distanceUnit = this.state.aoiGeometries?.distanceUnit || this.state.searchSettings?.distanceUnits || getPortalUnit()
                let unitAbbr = this.getSelectedUnitsAbbr(distanceUnit as __esri.LengthUnit)
                //show square unit for area
                if (records[0].feature.geometry?.type === 'polygon') {
                  unitAbbr = unitAbbr + '\u00b2'
                  fieldName = this.props.intl.formatMessage({
                    id: 'areaUnitLabel', defaultMessage: defaultMessages.areaUnitLabel
                  }, { unitLabel: unitAbbr })
                } else{
                  fieldName = this.props.intl.formatMessage({
                    id: 'lengthUnitLabel', defaultMessage: defaultMessages.lengthUnitLabel
                  }, { unitLabel: unitAbbr })
                }
              } else if (attrKey !== undefined) {
                const filteredField = fields.filter((field) => { return field.name === attrKey })
                fieldName = filteredField[0]?.alias || attrKey
              }
              if (fieldName !== undefined) {
                if (!cols.includes(fieldName)) {
                  if (attrKey === layerAnalysisInfo.groupFeatures?.groupFeaturesByField || attrKey === layerAnalysisInfo.subGroupFeatures?.subGroupFeaturesByField) {
                      if (attrKey === layerAnalysisInfo.groupFeatures.groupFeaturesByField) {
                        groupFieldCol = showRowIndex ? 1 : 0
                        groupCol = fieldName
                        groupFieldKey = attrKey
                      }
                      if (layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField !== '' &&
                        attrKey === layerAnalysisInfo.subGroupFeatures.subGroupFeaturesByField) {
                        subgroupFieldCol = showRowIndex ? 2 : 1
                        subGroupCol = fieldName
                        subGroupFieldKey = attrKey
                      }
                  } else {
                    cols.push(fieldName)
                    attrKeys.push(attrKey)
                  }
                }
              }
            }
          }
          //when group and subgroup field are same then remove the subgroup field from the cols and attrKeys array
          if(groupFieldKey && subGroupFieldKey && groupFieldKey === subGroupFieldKey) {
            subGroupCol = ''
            subgroupFieldCol = null
            subGroupFieldKey = ''
          }
          //if group and subgroup field are not found in the attributes then add them to the first and secound cols and attrKeys array
          //as we are using unshift to add the group and subgroup field as first two columns, first add subgroup and then group field
          // so that group will be first and subgroup will be second column
          if (subGroupFieldKey) {
            cols.unshift(subGroupCol)
            attrKeys.unshift(subGroupFieldKey)
          }
          if (groupFieldKey) {
            cols.unshift(groupCol)
            attrKeys.unshift(groupFieldKey)
          }
          //loop through the records and get the field values for each record
          records.forEach((eachRecord) => {
            const eachRow = []
            //if attrKeys is empty then get the keys from the attributes
            //this is used to get the field values for each record
            if (!attrKeys.length) {
              attrKeys = Object.keys(eachRecord.feature.attributes)
            }
            //loop through the attrKeys and get the field values for each record
            //this will be in same sequence as the cols array and it will have group and subgroup field as first two columns
            //and the rest of the fields in the end
            //so that we can show group and subgroup field as first two columns in the table
            attrKeys.forEach(attrKey => {
              if (fieldsToExport.includes(attrKey)) {
                let fieldValue = eachRecord.getFormattedFieldValue(attrKey, this.props.intl) ?? ''
                if (fieldValue === undefined || fieldValue === "" || fieldValue === null || fieldValue.toString().trim() === "") {
                  fieldValue = this.nls('noData')
                }
                if (attrKey === 'esriCTClippedInfo' && fieldValue !== this.nls('noData')) {
                  // Format the clipped area/length value with grouping, separator, and 2 decimal places for PDF export
                  const defaultNumberFormat: FormatNumberOptions = {
                    useGrouping: true,
                    notation: 'standard',
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  }
                  fieldValue = this.props.intl.formatNumber(fieldValue, defaultNumberFormat)
                  // if the value is 0.00 show the actual value
                  if (fieldValue === "0.00") {
                    const originalValue = eachRecord.getFormattedFieldValue(attrKey, this.props.intl) ?? ''
                    fieldValue = originalValue !== '' ? formatSmallNumberWithSignificantDigits(originalValue as number) : ''
                  }
                }
                eachRow.push(fieldValue)
              }
            })
            rows.push(eachRow)
          })
          printReportData.push({
            data: {
              cols: cols,
              rows: rows,
              showRowIndex: showRowIndex
            },
            title: result.layerInfo.label,
            totalCount: result.records.length,
            maxNoOfCols: 5,
            groupFieldCol: groupFieldCol,
            subgroupFieldCol: subgroupFieldCol
          })
        }
      }
    })
    return printReportData
  }

  /**
   * On action item click export the respective item
   * @param action clicked action
   * @param dataLevel data level
   */
  onActionItemClick = async (action: DataAction, dataLevel: DataLevel): Promise<void> => {
    const ACTIVE_CLASSNAME = 'active-data-action-item'
    const prevActive = document.querySelector(`.${ACTIVE_CLASSNAME}`)

    if (prevActive) {
      // Clean up the active className first
      prevActive.classList.remove(ACTIVE_CLASSNAME)
    }

    this.dropdownRef.current.className = classNames(this.dropdownRef.current.className, ACTIVE_CLASSNAME)
    let newDataSetArr = this.state.dataSetArray
    //For batch export
    //if CSV export action is clicked then push the proximity feature count dataSet in the array
    if (action.id === 'export-csv' && this.proximityCountDataSetArr.length > 0) {
      newDataSetArr = [...newDataSetArr, this.proximityCountDataSetArr[0]]
    }
    // Execute the data action
    const actionElement = await DataActionManager.getInstance().executeDataAction(action, newDataSetArr, dataLevel, this.props.widgetId)

    // This is used for close the modal
    if (actionElement !== null && typeof actionElement !== 'boolean') {
      this.setState({
        actionElement: React.cloneElement(
          actionElement,
          {
            onClose: () => { this.setState({ actionElement: null }) },
            onConfirm: (...args) => {
              !actionElement.props.keepOpenAfterConfirm && this.setState({ actionElement: null })
              return actionElement.props.onConfirm(...args)
            }
          }
        )
      })
    }
    this.setState({
      showExportOptions: false
    })
  }

  /**
   * Create the action items to display in the dropdown
   * @param actionGroups available action groups
   * @param actionName available action names
   * @param dataLevel data level
   * @returns dropdown export items
   */
  createActionItem = (actionGroups: any, actionName: string, dataLevel: DataLevel): React.JSX.Element => {
    const actions: DataAction[] = actionGroups[actionName]
    if (actionName === 'export' && actions?.length > 0 && this.state.dataSetArray.length > 0) {
      if (actions.length > 0) {
        return (
          <React.Fragment key={'exportAction'}>
            {actions.map((action, index) => {
              let label = action.label
              if (action.widgetId) {
                const widget = getAppStore().getState().appConfig.widgets[action.widgetId]
                label = widget?.label ?? action.label
              }
              return (
                <DropdownItem
                  key={index}
                  header={false}
                  onClick={async () => { await this.onActionItemClick(action, dataLevel) }}
                >
                  {label}
                </DropdownItem>
              )
            })}
          </React.Fragment>
        )
      }
    }
    return null
  }

  /**
   * Update the incident graphic to used in the direction widget to get the updated directions
   * @param graphic incident drawn graphic
   */
  onIncidentGraphicChange = (graphic) => {
    this.incidentGraphic = graphic.geometry.type === 'point' ? graphic : null
  }

  /**
   * Update  results on query changed
   * On map extent change or the data is filtered from filter widget the update the analysis results
   * @param queryRequiredInfo
   * @param preQueryRequiredInfo
   * @returns
   */
  onQueryRequired = (queryRequiredInfo: QueryRequiredInfo, preQueryRequiredInfo?: QueryRequiredInfo) => {
    //on datasource component mount, it is triggering onQueryRequired which is causing recursion and results are loaded in loop
    if (!preQueryRequiredInfo) {
      return
    }

    for (const dsId in queryRequiredInfo) {
      const info = queryRequiredInfo[dsId]
      const preInfo = preQueryRequiredInfo?.[dsId]
      //Return in following cases
      // 1. invalid info
      // 2. When widgetqueries are not changed at all
      if (!info || lodash.isDeepEqual(info?.widgetQueries, preInfo?.widgetQueries)) {
        //if source version is changed then update the results
        if (info?.sourceVersion !== preInfo?.sourceVersion) {
          this.updateOnDSInfoChange()
          return
        }
        return
      }

      let requireRefresh = false

      if (info.widgetQueries) {
        const { showAllFeatures, searchByLocation } = getSearchWorkflow(this.state.searchSettings)
        //get all widgetIds which have applied filters on the DS
        const allKeys = Object.keys(info.widgetQueries)

        //skip filter-data-record-action in showAllFeatures and searchByLocation case as this is fired on extent change only
        if ((showAllFeatures || searchByLocation) && allKeys.includes('filter-data-record-action')) {
          allKeys.splice(allKeys.indexOf('filter-data-record-action'), 1)
        }

        // Now check if any of the widgets queries other than near-ne are changed then only refresh
        allKeys.some((key) => {
          //skip widgetQueries by self
          const isValidKey = key !== this.props.id
          //refresh only when any widgets queries are changed
          if (isValidKey && !lodash.isDeepEqual(info?.widgetQueries?.[key], preInfo?.widgetQueries?.[key])) {
            requireRefresh = true
            return true
          }
          return false
        })
      }
      if (requireRefresh) {
        this.updateOnDSInfoChange()
      }
    }
  }

  /**
   * Debounce the method to be executed on ds info change as ds info change will be for multiple ds and we would like to execute code only once
   */
  updateOnDSInfoChange = lodash.debounce(() => {
    if (this.skipDsInfoChange) {
      this.skipDsInfoChange = false
      return
    }
    const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)
    //In Case of showAllFeatures and searchByLocation refresh the results only when valid widgetQuries are found
    //this should be executed only when filters are changed on extent change it should not refresh the result, hence skipped filter-data-record-action
    if (showAllFeatures || searchByLocation) {
      this.onRefreshResult(true)
    } else if (searchCurrentExtent) {
      this.aoiToolRef?.current?.onSearchByMapAreaClicked()
    }
  }, 1000)

  /**
   * Render the data source component for the configured useDataSources
   * @returns data source component list
   */
  renderDataSourceComponent = () => {
    const dsComponentList = []
    this.props.useDataSources?.forEach((useDs, index) => {
      dsComponentList.push(<DataSourceComponent
        key={index}
        useDataSource={useDs}
        onQueryRequired={this.onQueryRequired}
        widgetId={this.props.id}
      />)
    })
    return dsComponentList
  }

  render () {
    const { showAllFeatures, searchByLocation, searchCurrentExtent } = getSearchWorkflow(this.state.searchSettings)

    if (!this.props.useMapWidgetIds?.[0]) {
      return (
        <WidgetPlaceholder
          data-testid='widgetPlaceholder'
          icon={widgetIcon} widgetId={this.props.id}
          name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: this.nls('_widgetLabel') })}
        />
      )
    }
    //showing loading indicator
    const showLoadingIndicator = !this.state.onWidgetLoadShowLoadingIndicator && (!this.state?.jimuMapView || this.state.loadingAllFeaturesFromDs ||
      (this.state.displayLayerAccordion.length === 0 && !this.state.showNoResultsFoundMsg &&
        (showAllFeatures || ((searchByLocation || searchCurrentExtent) && this.state.aoiGeometries)) &&
        this.state.analysisSettings?.layersInfo.length > 0 && this.state.jimuMapView !== null)) && !this.state.queryAborted

    const loadingMessage = this.state.analysisTakingLongerTime ? this.nls('analysisTakingLongerMsg') : this.nls('loadingText')
    const dsToGetSelectedOnLoad: UseDataSource[] = []
    if (this.state.dsToGetSelectedOnLoad?.length > 0) {
      this.state.dsToGetSelectedOnLoad.forEach((dsId) => {
        const ds = DataSourceManager.getInstance().getDataSource(dsId)
        ds && dsToGetSelectedOnLoad.push({
          dataSourceId: dsId,
          mainDataSourceId: ds.getMainDataSource()?.id,
          rootDataSourceId: ds.getRootDataSource()?.id
        } as UseDataSource)
      })
    }
    return (
      <Paper ref={this.widgetConRef} variant='flat' shape="none" className='jimu-widget' css={getStyle(this.props.theme, this.state.listMaxHeight, this.state.generalSettings.noResultMsgStyleSettings, this.state.generalSettings.promptTextMsgStyleSettings, this.state.searchSettings?.headingLabelStyle, this.state.showFeatureForm)}>
        <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds?.[0]} onActiveViewChange={this.onActiveViewChange}></JimuMapViewComponent>
        {this.renderDataSourceComponent()}
        {dsToGetSelectedOnLoad.length > 0 &&
          <MultipleDataSourceComponent
            useDataSources={Immutable([...dsToGetSelectedOnLoad])}
            onDataSourceInfoChange={this.onDataSourceInfoChange}
            widgetId={this.props.id} />
        }
        <div className='widget-near-me'>

          {this.state.showFeatureForm && this.renderFormForSavingInputLocation()}
          {this.state.isSubmittingForm && <Loading type={LoadingType.Donut} />}

          <div className='main-row w-100 h-100'>
            <div ref={this.divRef}>
              {(searchByLocation || searchCurrentExtent) && this.state.jimuMapView && this.state.isLayerAvailable && this.state.isAnalysisLayerConfigured &&
                <AoiTool
                  ref={this.aoiToolRef}
                  theme={this.props.theme}
                  intl={this.props.intl}
                  widgetClosed={this.state.widgetClosed}
                  activateToolOnWidgetLoad={this.state.searchSettings.activeToolWhenWidgetOpens}
                  isFilterActionBinded={this.state.isFilterActionBinded}
                  headingLabel={this.state.searchSettings?.headingLabel}
                  showInputAddress={this.state.searchSettings?.showInputAddress}
                  config={this.state.searchSettings}
                  highlightColor={colorUtils.parseThemeVariable(this.state.generalSettings.highlightColor, this.props.theme)}
                  bufferSymbol={this.state.generalSettings.searchAreaSymbol}
                  jimuMapView={this.state.jimuMapView}
                  aoiComplete={this.onAoiComplete}
                  clear={this.onClear}
                  bufferLayer={this.bufferLayer}
                  drawingLayer={this.drawingLayer}
                  updateClosestAddressState={this.updateClosestAddressState}
                  incidentGraphicChange={this.onIncidentGraphicChange}
                  msgActionGeometry={this.state.msgActionGeometry}
                  widgetWidth={this.state.widgetWidth}
                />}

              {/*Heading Label for show all features */}
              {showAllFeatures && this.state.jimuMapView && this.state.isLayerAvailable && this.state.isAnalysisLayerConfigured &&
                <Label className={'headingLabelStyle px-2 pt-2'}>{this.state.searchSettings?.headingLabel}</Label>
              }
              {/**
               * Show refresh button in following cases
               * 1. When layer results are shown OR
               * 2. When No result found msg shown (this condition to be inline with no found msg)
               *                 AND
               * 3. ShowAll features or SearchBy location is selected
              */}
              {(this.state.displayLayerAccordion?.length > 0 ||
                (this.state.displayLayerAccordion.length === 0 && this.state.showNoResultsFoundMsg && (showAllFeatures || (searchByLocation && this.state.aoiGeometries)) &&
                  this.state.analysisSettings?.layersInfo.length > 0 && this.state.isAnalysisLayerConfigured)) && this.state.isLayerAvailable &&
                (searchByLocation || showAllFeatures) && this.state.jimuMapView &&
                <React.Fragment>
                  <div className={'float-right'}>
                    <Button type='tertiary' aria-label={this.nls('refreshTooltip')} icon title={this.nls('refreshTooltip')} onClick={() => { this.onRefreshResult(false) }}><RefreshOutlined /></Button>
                  </div>
                  {searchByLocation &&
                    <div className={'float-right'}>
                      <Button type='tertiary' aria-label={this.nls('clear')} icon title={this.nls('clear')} onClick={this.onResetButtonClick}><TrashOutlined /></Button>
                    </div>
                  }
                  {this.state.showSaveIcon && <div className={'float-right'}>
                    <Button type='tertiary' aria-label={this.nls('saveTooltip')} icon title={this.nls('saveTooltip')} onClick={ this.onSaveInputLocationClick }><SaveOutlined /></Button>
                  </div>}
                </React.Fragment>
              }
              {this.state.displayLayerAccordion?.length > 0 && this.state.isLayerAvailable &&
                (searchByLocation || showAllFeatures) && this.state.jimuMapView && this.state.showExportButton && this.getRecordsCount() > 0 &&
                <React.Fragment>
                  {this.renderBatchExportList()}
                </React.Fragment>
              }

              {this.state.displayLayerAccordion?.length > 0 && this.state.isLayerAvailable &&
                searchCurrentExtent && this.state.jimuMapView && this.state.showExportButton && this.getRecordsCount() > 0 &&
                <div className={'pr-1'}>
                  {this.renderBatchExportList()}
                </div>
              }
            </div>
            <div className={'layerContainer'}>
              {/* Initial widget loading indicator */}
              {(this.state.onWidgetLoadShowLoadingIndicator && this.state.isLayerAvailable) && <React.Fragment >
                <Loading type={LoadingType.Donut} />
                <p data-testid={'mapLoadingMsg'} className='map-loading-text pt-4'>{this.nls('mapLoadingMsg')}</p>
              </React.Fragment>
              }

              {/* Loading indicator */}
              {showLoadingIndicator && <React.Fragment>
                <Loading type={LoadingType.Donut} />
                {(this.state.loadingAllFeaturesFromDs || this.state.analysisSettings?.layersInfo.length > 0) &&
                  <p className='loading-text pt-4'>
                    {loadingMessage}
                    {this.state.analysisTakingLongerTime &&
                      <Button role={'button'} aria-label={this.nls('commonModalCancel')} title={this.nls('stopQueryProgressMsg')}
                        size={'default'} type='default' className={'cancel-button-pos'} onClick={this.stopLoading}>
                        {this.nls('commonModalCancel')}
                      </Button>
                    }
                  </p>}
              </React.Fragment>}

              {/* Layers accordions */}
              {this.state.displayLayerAccordion.length > 0 && this.state.jimuMapView && this.state.isLayerAvailable &&
                <React.Fragment>
                  {this.state.displayLayerAccordion}
                </React.Fragment>}

              {/* Display prompt message*/}
              {!showLoadingIndicator && this.state.displayLayerAccordion.length === 0 && (!this.state.showNoResultsFoundMsg || this.state.queryAborted) &&
                this.state.analysisSettings?.layersInfo.length > 0 && this.state.jimuMapView && this.state.isAnalysisLayerConfigured && this.state.isLayerAvailable &&
                <div className='applyPromptTextStyle'>
                  {this.state.generalSettings.promptTextMessage}
                </div>}

              {/* No result found message*/}
              {!showLoadingIndicator && this.state.displayLayerAccordion.length === 0 && (showAllFeatures || ((searchByLocation || searchCurrentExtent) && this.state.aoiGeometries)) &&
                this.state.analysisSettings?.layersInfo.length > 0 && this.state.jimuMapView && this.state.isAnalysisLayerConfigured && this.state.isLayerAvailable && (this.state.showNoResultsFoundMsg && !this.state.queryAborted) &&
                <div className='applyTextStyle'>
                  {this.state.generalSettings.noResultsFoundText}
                </div>}

              {/* No analysis layer is configured*/}
              {!this.state.isAnalysisLayerConfigured && this.state.isLayerAvailable &&
                <Alert tabIndex={0} withIcon={true} size='small' type='info' className='w-100 shadow-2 mb-1 m-0'>
                  <div className='flex-grow-1 text-break settings-text-level' data-testid={'noAnalysisLayerMsg'}>
                    {this.nls('noAnalysisLayerMsg')}
                  </div>
                </Alert>}

              {/* Map/Scene has no layers*/}
              {!this.state.isLayerAvailable &&
                <Alert tabIndex={0} withIcon={true} size='small' type='info' className='w-100 shadow-2 mb-1 m-0'>
                  <div className='flex-grow-1 text-break settings-text-level'>
                    {this.nls('warningMsgIfNoLayersOnMap')}
                  </div>
                </Alert>}
            </div>
          </div>
        </div>
        <ReactResizeDetector targetRef={this.widgetConRef} handleWidth handleHeight onResize={this.onResize} />

        {/**Confirm Dialog whether to show all features analysis */
        this.state.promptForDataAction &&
          <ConfirmDialog
            level='info'
            title={this.getPromptMessageString(this.props.selectedDataSource?.getLabel())}
            hasNotShowAgainOption={false}
            content={this.nls('promptBottomMessageFromDataAction')}
            confirmLabel={this.nls('okButtonLabel')}
            cancelLabel={this.nls('commonModalCancel')}
            onConfirm={this.analyzeAllFeatures.bind(this)}
            onClose={this.onCancelButtonClicked.bind(this)}
          />
        }
      </Paper>
    )
  }
}
