/** @jsx jsx */
import { React, jsx, getAppStore, classNames, Immutable, JimuMapViewStatus, type DataSource, DataSourceManager, DataSourceTypes, type DataSourceJson, type FieldSchema, type DataSourceSchema, JimuFieldType, EsriFieldType, type ImmutableArray, lodash } from 'jimu-core'
import { MapWidgetSelector, MultipleJimuMapConfig, type MultipleJimuMapValidateResult, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { BaseWidgetSetting, type AllWidgetSettingProps } from 'jimu-for-builder'
import { Alert, Label, CollapsablePanel, Tooltip, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { type JimuMapView, loadArcGISJSAPIModules, MapViewManager } from 'jimu-arcgis'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import { type DataSourceOptions, type IMConfig, type LayersInfo, type LayerDsId, type FontStyleSettings, AnalysisTypeName, type SummaryFieldsInfo, type ConfigInfo, type SummaryAnalysis, type SketchTools, type SearchSettings, type SaveFeatureSetting } from '../config'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { getSelectedLayerInstance, getAllAvailableLayers, getOutputDsId, getAllFieldsNames, getUseDataSourcesForAllDs } from '../common/utils'
import GeneralSetting from './components/general-settings'
import SearchSetting from './components/search-settings'
import { defaultConfigInfo } from './constants'
import AnalysisSetting from './components/analysis-settings'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface State {
  dataSources: DataSourceOptions[]
  showDataItemPanel: boolean
  dataSourceName: string
  isNoMapSelected: boolean
  mapWidgetExists: boolean
  isAnalysisSettingsOpen: boolean
  isGeneralSettingsOpen: boolean
  isOutputSettingsOpen: boolean
  isLayerAvailable: boolean
  activeDataSource: string
  popperFocusNode: HTMLElement
  jimuMapViewId: string
  mapView: JimuMapView
}

export default class Setting extends BaseWidgetSetting<AllWidgetSettingProps<IMConfig>, State> {
  readonly mvManager: MapViewManager = MapViewManager.getInstance()
  private Color: typeof __esri.Color = null
  private _mapLoadedTimer = null
  index: number
  constructor (props) {
    super(props)
    this.index = 0
    this.state = {
      dataSources: [],
      showDataItemPanel: false,
      dataSourceName: '',
      isNoMapSelected: true,
      mapWidgetExists: true,
      isAnalysisSettingsOpen: false,
      isGeneralSettingsOpen: true,
      isOutputSettingsOpen: true,
      isLayerAvailable: false,
      activeDataSource: null,
      popperFocusNode: null,
      jimuMapViewId: '',
      mapView: null
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

  /**
   * Perform the required functionality when the config is mounted
  */
  componentDidMount = () => {
    //Compare the saved data with current map view data sources
    //and filter out the data sources which are not available in the map view
    //this will make sure to remove the data sources which are not available in the map view
    //populate configured data sources for map
    let isNoneMapSelected: boolean
    if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0) {
      const useMapWidget = this.props.useMapWidgetIds?.[0]
      const appConfig = getAppStore().getState().appStateInBuilder.appConfig
      const mapWidgetAvailable = appConfig.widgets?.[useMapWidget]
      if (!mapWidgetAvailable) {
        this.resetAnalysisLayersConfig(this.props.useMapWidgetIds)
        isNoneMapSelected = true
      } else {
        isNoneMapSelected = false
        this.checkLayersAvailability(this.props.useMapWidgetIds)
      }
    } else { //display the warning message to select the web map or web scene
      isNoneMapSelected = true
    }

    this.updateConfigForMapWidget(isNoneMapSelected)
  }

  componentDidUpdate = (prevProps) => {
    let isNoneMapSelected: boolean
    if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0) {
      const useMapWidget = this.props.useMapWidgetIds?.[0]
      const appConfig = getAppStore().getState().appStateInBuilder.appConfig
      const mapWidgetAvailable = appConfig.widgets?.[useMapWidget]
      if (!mapWidgetAvailable) {
        isNoneMapSelected = true
      } else {
        isNoneMapSelected = false
      }
    } else { //display the warning message to select the web map or web scene
      isNoneMapSelected = true
    }
    this.setState({
      mapWidgetExists: !isNoneMapSelected,
      isNoMapSelected: isNoneMapSelected
    })

    //if map widget deleted or changes then on UNDO REDO reset the config to the available layers
    if (!lodash.isDeepEqual(this.props.useMapWidgetIds, prevProps.useMapWidgetIds)) {
      let isNoneMapSelected: boolean
      if (this.props.useMapWidgetIds?.length > 0) {
        isNoneMapSelected = false
        this.checkLayersAvailability(this.props.useMapWidgetIds)
      } else {
        isNoneMapSelected = true
      }
      this.updateConfigForMapWidget(isNoneMapSelected)
    }
  }

  /**
   * Check all the layers availability on the web map/web scene
   * @param useMapWidgetIds Array of map widget id
   */
  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    let isNoneMapSelected: boolean
    if (useMapWidgetIds.length > 0) {
      isNoneMapSelected = false
      this.checkLayersAvailability(useMapWidgetIds)
    } else { //display the warning message to select the web map or web scene
      isNoneMapSelected = true
      const newConfig = this.props.config.set('configInfo', {})
      const settings: any = {
        id: this.props.id,
        useMapWidgetIds: useMapWidgetIds,
        config: newConfig
      }
      settings.useDataSources = Immutable([])
      //Reset analysis layers config parameters
      this.props.onSettingChange(settings, [])
    }
    this.updateConfigForMapWidget(isNoneMapSelected)
  }

  /**
   * Reset the analysis layers config when map gets reset
  */
  resetAnalysisLayersConfig = (useMapWidgetIds) => {
    const newConfig = this.props.config.set('configInfo', {})
    newConfig.set('useMapWidget', useMapWidgetIds.length > 0)
    const settings: any = {
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds,
      config: newConfig
    }
    if (useMapWidgetIds.length === 0) {
      settings.useDataSources = Immutable([])
      //Reset analysis layers config parameters
      this.props.onSettingChange(settings, [])
    } else {
      //Reset analysis layers config parameters
      this.props.onSettingChange(settings)
    }
  }

  /**
   * Update the config as per the map selection
   * @param isMapWidgetAvailable Parameter to check map widget availability
   */
  updateConfigForMapWidget = (isMapWidgetAvailable: boolean) => {
    this.setState({
      mapWidgetExists: !isMapWidgetAvailable,
      isNoMapSelected: isMapWidgetAvailable
    })
  }

  /**
   * Set the default config info for the selected data source
   * @param dataSourceId dataSource id for setting the config
   * @param newConfig config info
   */
  setDefaultConfigForDataSource = (dataSourceId: string, newConfig) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!newConfig.configInfo.hasOwnProperty(dataSourceId)) {
      const config = defaultConfigInfo
      //default heading label config of search setting
      config.searchSettings.headingLabel = this.nls('locationLabel')
      return newConfig.setIn(['configInfo', dataSourceId], config)
    }
    return newConfig
  }

  //wait for all the jimu layers and dataSource loaded
  waitForChildDataSourcesReady = async (mapView: JimuMapView): Promise<DataSource> => {
    await mapView?.whenAllJimuLayerViewLoaded()
    const ds = DataSourceManager.getInstance().getDataSource(mapView?.dataSourceId)
    if (ds?.isDataSourceSet() && !ds.areChildDataSourcesCreated()) {
      return ds.childDataSourcesReady().then(() => ds).catch(err => ds)
    }
    return Promise.resolve(ds)
  }

  /**
  *Check feature layers availability in web map/web scene.
   If it is available then only widget will proceed to further settings
  * @param useMapWidgetIds map widget id
  */
  checkLayersAvailability = async (useMapWidgetIds) => {
    let newConfig = this.props.config.configInfo ? this.props.config : this.props.config.set('configInfo', {})
    const updatedMapViewGroups = this.mvManager.getJimuMapViewGroup(useMapWidgetIds)
    const outputDsJsons: DataSourceJson[] = this.getInitOutDataSource(newConfig.configInfo)
    if (updatedMapViewGroups?.jimuMapViews) {
      if (this._mapLoadedTimer) {
        clearTimeout(this._mapLoadedTimer)
      }

      const dataSourceOption = []
      for (const idx in updatedMapViewGroups.jimuMapViews) {
        if (updatedMapViewGroups.jimuMapViews[idx].dataSourceId) {
          if (updatedMapViewGroups.jimuMapViews[idx].status === JimuMapViewStatus.Loaded) {
            const allLayerDsId: LayerDsId[] = []
            const dataSourceId: string = updatedMapViewGroups.jimuMapViews[idx].dataSourceId
            //load the analysis config for selected datasource
            newConfig = this.setDefaultConfigForDataSource(dataSourceId, newConfig)
            const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(updatedMapViewGroups.jimuMapViews[idx].id)
            await this.waitForChildDataSourcesReady(jimuMapView).finally(() => {
              const allDsLayers = getAllAvailableLayers(updatedMapViewGroups.jimuMapViews[idx].id)
              this.setState({
                isLayerAvailable: true,
                jimuMapViewId: updatedMapViewGroups.jimuMapViews[idx].id
              })
              if (updatedMapViewGroups.jimuMapViews[idx].isActive || updatedMapViewGroups.jimuMapViews[idx].isActive === undefined) {
                this.setState({
                  activeDataSource: updatedMapViewGroups.jimuMapViews[idx].dataSourceId,
                  mapView: updatedMapViewGroups.jimuMapViews[idx]
                })
              }
              allDsLayers.forEach((layer: any) => {
                if (layer?.layerDefinition?.geometryType) {
                  allLayerDsId.push({
                    layerDsId: layer.id
                  })
                }
              })
              const addedDsOption = this.canAddDataSource(updatedMapViewGroups.jimuMapViews[idx].dataSourceId, dataSourceOption)
              if (addedDsOption) {
                dataSourceOption.push({
                  label: this.getDataSourceLabel(updatedMapViewGroups.jimuMapViews[idx].dataSourceId),
                  value: updatedMapViewGroups.jimuMapViews[idx].dataSourceId,
                  isValid: allDsLayers.length > 0,
                  availableLayers: allLayerDsId
                })
              }
            })
          } else {
            this._mapLoadedTimer = setTimeout(() => {
              this.checkLayersAvailability(useMapWidgetIds)
            }, 50)
          }
        } else {
          this.setState({
            isLayerAvailable: false
          })
        }
      }
      this.setState({
        dataSources: dataSourceOption
      }, async () => {
        newConfig = await this.updateConfigAsPerNewWebMap(newConfig)

        //On config load save the noResultsFoundText default message config of general setting
        //On config load save the selection color config of general setting
        //On config load save the search area buffer color config of general setting
        newConfig = newConfig.setIn(['generalSettings', 'noResultsFoundText'],
          this.props.config.generalSettings.noResultsFoundText ? this.props.config.generalSettings.noResultsFoundText : this.nls('noDataMessageDefaultText'))
        newConfig = newConfig.setIn(['generalSettings', 'highlightColor'],
          this.props.config.generalSettings.highlightColor ? this.props.config.generalSettings.highlightColor : this.props.theme2.sys.color.primary.dark)
        loadArcGISJSAPIModules([
          'esri/Color'
        ]).then(modules => {
          [this.Color] = modules
          const fillColor = new modules[0](newConfig.generalSettings.highlightColor)
          fillColor.a = 0.3
          const outlineColor = new modules[0](newConfig.generalSettings.highlightColor)
          outlineColor.a = 1
          const bufferSymbol = {
            "type": "esriSFS",
            "color": fillColor,
            "outline": {
              "type": "esriSLS",
              "color": outlineColor,
              "width": 1.5,
              "style": "esriSLSSolid"
            },
            "style": "esriSFSSolid"
          }
          newConfig = newConfig.setIn(['generalSettings', 'searchAreaSymbol'],
            this.props.config.generalSettings?.searchAreaSymbol?.type ? this.props.config.generalSettings.searchAreaSymbol : bufferSymbol)
          //Save the props for config and useDataSources for the added layers
          const settings: any = {
            id: this.props.id,
            useMapWidgetIds: useMapWidgetIds,
            config: newConfig,
            useDataSources: getUseDataSourcesForAllDs(newConfig.configInfo, this.state.dataSources)
          }
          if (useMapWidgetIds?.length === 0) {
            settings.useDataSources = Immutable([])
            this.props.onSettingChange(settings, [])
          } else {
            this.props.onSettingChange(settings, outputDsJsons)
          }
        })
      })
    } else {
      this._mapLoadedTimer = setTimeout(() => {
        this.checkLayersAvailability(useMapWidgetIds)
      }, 50)
    }
  }

  /**
   * Avoid duplicate addition of datasources in map settings
   * @param dataSourceId data source id
   * @param dataSourceOptions datasources to be added
   * @returns returns whether to add datsource
   */
  canAddDataSource = (dataSourceId: string, dataSourceOptions): boolean => {
    let isAddDs: boolean = true

    // eslint-disable-next-line array-callback-return
    dataSourceOptions.some((dsOption) => {
      if (dsOption.value === dataSourceId) {
        isAddDs = false
      }
    })
    return isAddDs
  }

  /**
   * Get data source label
   * @param dataSourceId Specifies data source id
   * @returns data source label
   */
  getDataSourceLabel = (dataSourceId: string): string => {
    if (!dataSourceId) {
      return ''
    }
    const dsObj = getSelectedLayerInstance(dataSourceId)
    const label = dsObj.getLabel()
    return label || dataSourceId
  }

  /**
   * Update the config when new web map is used
   * @param newConfig config info
   */
  updateConfigAsPerNewWebMap = (newConfig) => {
    let dataSourcesToMatch = []
    const config = newConfig.configInfo.asMutable({ deep: true })
    const configInfo = newConfig.configInfo.asMutable({ deep: true })
    if (this.props.useMapWidgetIds?.length > 0) {
      const mapViewGroup = this.mvManager.getJimuMapViewGroup(this.props.useMapWidgetIds[0])
      if (mapViewGroup?.jimuMapViews) {
        for (const id in mapViewGroup.jimuMapViews) {
          if (mapViewGroup.jimuMapViews[id].dataSourceId) {
            dataSourcesToMatch.push(mapViewGroup.jimuMapViews[id].dataSourceId)
          } else {
            dataSourcesToMatch = []
          }
        }

        //Remove unwanted data from config
        for (const dsId in config) {
          if (!dataSourcesToMatch.includes(dsId)) {
            delete config[dsId]
          }
        }

        //remove the layers which are not available in the webmap/scene
        for (const id in mapViewGroup.jimuMapViews) {
          const dsId = mapViewGroup.jimuMapViews[id].dataSourceId
          if (config[dsId] && mapViewGroup.jimuMapViews[id].status === JimuMapViewStatus.Loaded) {
            const allDsLayers = getAllAvailableLayers(mapViewGroup.jimuMapViews[id].id)
            const allLayersIds = []
            allDsLayers.forEach((layer) => {
              allLayersIds.push(layer.id)
            })
            //Loop through all analysis layers settings configuration
            //Any layer which does not falls in the layer arrays
            //are not present in the webmap/webscene
            //delete those layers from the configuration
            config[dsId].analysisSettings?.layersInfo?.forEach((layerDetails) => {
              if (!allLayersIds.includes(layerDetails.useDataSource.mainDataSourceId) ||
                (layerDetails.useDataSource.dataViewId && !allLayersIds.includes(layerDetails.useDataSource.mainDataSourceId))) {
                const analysisLayersInfos: LayersInfo[] = configInfo[dsId].analysisSettings.layersInfo
                const deleteIndex = analysisLayersInfos.findIndex(layerDt => layerDt.useDataSource.dataSourceId === layerDetails.useDataSource.dataSourceId)
                if (deleteIndex > -1) {
                  analysisLayersInfos.splice(deleteIndex, 1)
                }
              }
            })
          }
        }
      }
    }
    return newConfig.set('configInfo', Immutable(configInfo))
  }

  /**
  * Show data source settings in side popper
  * @param dataSourceId data source id
  */
  showDsPanel = (dataSourceId: string) => {
    this.setState({
      activeDataSource: dataSourceId,
      isAnalysisSettingsOpen: false
    }, () => {
      this.setState({
        isAnalysisSettingsOpen: true
      })
    })
  }

  /**
 * Determine whether the data source having the valid feature layers
 * @param dataSourceId
 * @returns boolean
 */
  isDataSourceValid = (dataSourceId: string): MultipleJimuMapValidateResult => {
    if (this.state.dataSources.length === 0) {
      return {
        isValid: false,
        invalidMessage: this.nls('warningMsgIfNoLayersOnMap')
      }
    }
    const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
    const dsHasValidLayers = this.dataSourceHasValidLayers(dataSourceId)
    if (ds?.isDataSourceSet() && ds?.getChildDataSources().length > 0 && dsHasValidLayers) {
      return {
        isValid: true
      }
    } else {
      return {
        isValid: false,
        invalidMessage: this.nls('warningMsgIfNoLayersOnMap')
      }
    }
  }

  /**
  *Close Data source side popper
  */
  onCloseDataItemPanel = () => {
    this.setState({
      showDataItemPanel: false
    })
    this.index = 0
  }

  onToggleGeneralSettings = () => {
    this.setState({
      isGeneralSettingsOpen: !this.state.isGeneralSettingsOpen
    })
  }

  /**
   * On change of config update the value
   * @param property General setting config property
   * @param value General setting config value
   */
  updateGeneralSettings = (property: string, value: string | boolean | FontStyleSettings) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.setIn(['generalSettings', property], value)
    })
  }

  /**
   * On change of config update the value
   * @param property Search setting config property
   * @param value Search setting config value
   * @param isAllSearchSettingsUpdated all search settings update
   */
  updateSearchSettings = (property: string, value: string | boolean | number | FontStyleSettings | SketchTools | SearchSettings, isAllSearchSettingsUpdated: boolean) => {
    let currentConfig
    if (isAllSearchSettingsUpdated) {
      currentConfig = this.props.config.setIn(['configInfo', this.state.activeDataSource, 'searchSettings'], value)
    } else {
      currentConfig = this.props.config.setIn(['configInfo', this.state.activeDataSource, 'searchSettings', property], value)
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: currentConfig
    })
    this.updateOutputDS(currentConfig)
  }

  /**
   * @param property Analysis setting config property
   * @param value Analysis setting config value
   * @param isLayerConfigured Check whether there is changes in the added analysis layers
   */
  updateAnalysisSettings = (property: string, value: string | boolean | LayersInfo[] | SaveFeatureSetting, isSaveFeatures?: boolean) => {
    let currentConfig
    if (isSaveFeatures) {
      currentConfig = this.props.config.setIn(['configInfo', this.state.activeDataSource, 'analysisSettings', 'saveFeatures', property], value)
    } else {
      currentConfig = this.props.config.setIn(['configInfo', this.state.activeDataSource, 'analysisSettings', property], value)
    }
    this.updateOutputDS(currentConfig)
  }

  updateOutputDS = (currentConfig:any) => {
    const outputDsJsons: DataSourceJson[] = this.getInitOutDataSource(currentConfig.configInfo)
    this.props.onSettingChange({
      id: this.props.id,
      config: currentConfig,
      useDataSources: getUseDataSourcesForAllDs(currentConfig.configInfo, this.state.dataSources)
    }, outputDsJsons)
  }

  /**
   * Get the output data sources of the configured analysis
   * @param currentConfig current config
   * @returns output data sources json array
   */
  getInitOutDataSource = (currentConfigInfo: ConfigInfo): DataSourceJson[] => {
    // If do not have used map widget, won't generate any output data sources.
    if (!this.props.useMapWidgetIds || this.props.useMapWidgetIds.length === 0) {
      return []
    }
    try {
      const outputDsJsonArr: DataSourceJson[] = []
      for (const dsId in currentConfigInfo) {
        const searchByActiveMapArea = currentConfigInfo?.[dsId].searchSettings.searchByActiveMapArea
        currentConfigInfo?.[dsId]?.analysisSettings.layersInfo?.forEach((layerDetails, index) => {
          const dsLabel = layerDetails.label + ' (' + this.nls(layerDetails.analysisInfo.analysisType) + ')'
          const dsManager = DataSourceManager.getInstance()
          const getDatasource = dsManager?.getDataSource(layerDetails.useDataSource.dataSourceId)
          const analysisId = layerDetails.analysisInfo.analysisId ?? index.toString()
          let schema
          let filteredSchemaFields
          if (layerDetails.analysisInfo.analysisType === AnalysisTypeName.Summary) {
            schema = this.getInitSchema(dsLabel, (layerDetails.analysisInfo as SummaryAnalysis).summaryFields)
          } else if (getDatasource) {
            schema = getDatasource.getSchema()
            let configFieldsToExport: string[] | ImmutableArray<string> = []
            //if no configured fields then fallback to take all the field names
            configFieldsToExport = layerDetails.analysisInfo?.fieldsToExport?.length > 0
              ? layerDetails.analysisInfo.fieldsToExport
              : getAllFieldsNames(layerDetails.useDataSource.dataSourceId)
            //filter the schema depending on the configured exported fields
            filteredSchemaFields = Object.keys(schema?.fields)
              .filter(key => configFieldsToExport.includes(key))
              .reduce((obj, key) => {
                obj[key] = schema?.fields[key]
                return obj
              }, {})
          }
          if (schema) {
            const outputDsJson: DataSourceJson = {
              id: getOutputDsId(this.props.widgetId, layerDetails.analysisInfo.analysisType, analysisId),
              type: DataSourceTypes.FeatureLayer,
              label: dsLabel,
              isOutputFromWidget: true,
              schema: {
                idField: schema.idField,
                fields: filteredSchemaFields || schema.fields
              },
              geometryType: getDatasource.getGeometryType()
            }
            if (layerDetails.analysisInfo.analysisType !== AnalysisTypeName.Summary &&
              (layerDetails?.analysisInfo as any)?.includeApproxDistance) {
              outputDsJson.schema.fields.esriCTApproxDistance = {
                alias: this.nls('showDistFromInputLoc'),
                esriType: EsriFieldType.String,
                format: null,
                type: JimuFieldType.String,
                jimuName: 'esriCTApproxDistance',
                name: 'esriCTApproxDistance'
              }
            }
            // Add the esriCTClippedInfo field to the output datasource schema if Proximity analysis is used,
            // clipFeatures is enabled, and searchByActiveMapArea is false. This field will store clipped feature info.
            if (!searchByActiveMapArea && layerDetails.analysisInfo.analysisType === AnalysisTypeName.Proximity &&
              (layerDetails?.analysisInfo as any)?.clipFeatures) {
              outputDsJson.schema.fields.esriCTClippedInfo = {
                alias: this.nls('clippedInfoLabel'),
                esriType: EsriFieldType.Double,
                format: {
                  "digitSeparator": true,
                  "places": 2
                },
                type: JimuFieldType.Number,
                jimuName: 'esriCTClippedInfo',
                name: 'esriCTClippedInfo'
              }
            }
            outputDsJsonArr.push(outputDsJson)
          }
        })
      }
      return outputDsJsonArr
    } catch (err) {
      console.warn('Failed to create output data source in near me widget. ', err)
      return []
    }
  }

  /**
   * Get outputDs default schema for Summary analysis to generate the output json
   * @param label configured data source label
   * @param summaryFields configured summary fields array
   * @returns data source schema
   */
  getInitSchema = (label: string = '', summaryFields: SummaryFieldsInfo[]): DataSourceSchema => {
    const fields: any = {}
    const summaryFieldsSchema: FieldSchema[] = [{
      alias: 'OBJECTID',
      type: JimuFieldType.Number,
      jimuName: 'OBJECTID',
      name: 'OBJECTID'
    },
    {
      alias: this.nls('count'),
      type: JimuFieldType.Number,
      jimuName: 'esriCTCOUNT',
      name: 'esriCTCOUNT'
    }]

    summaryFields.forEach((field) => {
      const fieldname = field.fieldLabel.replace(/ /g, '')
      summaryFieldsSchema.push({
        alias: field.fieldLabel,
        type: JimuFieldType.String,
        jimuName: fieldname,
        name: fieldname
      })
    })

    summaryFieldsSchema?.forEach((fieldSchema, index) => {
      if (index === 0) {
        fields.OBJECTID = fieldSchema
      } else if (fieldSchema?.name === 'esriCTCOUNT') {
        fields.esriCTCOUNT = fieldSchema
      } else {
        fields[fieldSchema?.jimuName] = fieldSchema
      }
    })

    return {
      label,
      idField: 'OBJECTID',
      fields: fields
    } as DataSourceSchema
  }

  /**
   * Check whether the data source is having the valid layers for analysis
   * @param dsId data source id
   * @returns is valid layers
   */
  dataSourceHasValidLayers = (dsId) => {
    if (dsId) {
      const validLayers = this.state.dataSources?.filter((dsInfo) => {
        return dsInfo.value === dsId && dsInfo.availableLayers.length
      })
      return validLayers?.length > 0
    }
    return false
  }

  render () {
    const appConfig = getAppStore().getState().appStateInBuilder.appConfig
    const useDataSource = appConfig.widgets?.[this.props.useMapWidgetIds?.[0]]?.useDataSources
    const configInfo = this.props.config.configInfo?.[this.state.activeDataSource]?.asMutable({ deep: true })
    const onWidgetLoadOptions = [{ value: 'none', name: this.nls('none') }]
    configInfo?.searchSettings.sketchTools?.showPoint && onWidgetLoadOptions.push({ value: 'point', name: this.nls('point') })
    configInfo?.searchSettings.sketchTools?.showPolyline && onWidgetLoadOptions.push({ value: 'polyline', name: this.nls('polyline') })
    configInfo?.searchSettings.sketchTools?.showPolygon && onWidgetLoadOptions.push({ value: 'polygon', name: this.nls('polygon') })
    return (
      <div css={getStyle(this.props.theme)} className='h-100'>
        <div className={'widget-setting-near-me'}>
          {/* Map Selector*/}
          <SettingSection className={classNames('map-selector-section', { 'border-0': this.state.isNoMapSelected && !(this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0) })}>
            <SettingRow>
              <div className={'text-truncate flex-grow-1 title3 hint-default'} title={this.nls('selectMapWidgetLabel')}>
                {this.nls('selectMapWidgetLabel')}
              </div>
            </SettingRow>
            <SettingRow>
              <MapWidgetSelector onSelect={this.onMapWidgetSelected.bind(this)} useMapWidgetIds={this.props.useMapWidgetIds} />
            </SettingRow>

            {this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0 && this.state.mapWidgetExists && (!(useDataSource?.length > 0)) &&
              <SettingRow>
                <Alert tabIndex={0}
                  style={{ minWidth: 'auto' }}
                  onClose={() => null}
                  open={!(useDataSource?.length > 0)}
                  text={this.nls('warningMsgIfNoLayersOnMap')}
                  type={'warning'}
                />
              </SettingRow>
            }
          </SettingSection>

          {/* no map tips */}
          {this.state.isNoMapSelected && !(this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0) &&
            <div className='d-flex placeholder-container justify-content-center align-items-center'>
              <div className='d-flex text-center placeholder justify-content-center align-items-center '>
                <ClickOutlined size={48} className='d-flex icon mb-2' />
                <p className='hint'>{this.nls('selectMapHint')}</p>
              </div>
            </div>}

          {/* if map is selected then show the further settings */}
          {this.props.useMapWidgetIds && this.props.useMapWidgetIds.length > 0 && this.state.mapWidgetExists && this.state.isLayerAvailable && (useDataSource?.length > 0) &&
           configInfo?.searchSettings && configInfo?.analysisSettings &&
            <React.Fragment>
              <SettingSection>
                <SettingRow>
                  <Label tabIndex={0} aria-label={this.nls('analysisSettingsLabel')} title={this.nls('analysisSettingsLabel')}
                    className='w-100 d-flex'>
                    <div className='text-truncate flex-grow-1 color-label title2 hint-paper'>
                      {this.nls('analysisSettingsLabel')}
                    </div>
                  </Label>
                </SettingRow>
                <SettingRow>
                  <Label tabIndex={0} aria-label={this.nls('mapSettingsHintMsg')} className='font-italic w-100 d-flex'>
                    <div className='flex-grow-1 text-break title3 hint-default'>
                      {this.nls('mapSettingsHintMsg')}
                    </div>
                  </Label>
                </SettingRow>
                <SettingRow>
                  <div className='w-100'>
                    {this.state.dataSources.length > 0 &&
                      <MultipleJimuMapConfig
                      mapWidgetId={this.props.useMapWidgetIds?.[0]}
                      onClick={this.showDsPanel}
                      isDataSourceValid={this.isDataSourceValid}
                      sidePopperContent={this.state.isAnalysisSettingsOpen &&
                        <React.Fragment>
                          {/* Search Settings */}
                          <SettingSection>
                            <SettingRow>
                              <Label tabIndex={0} aria-label={this.nls('defineSearchAreaLabel')} title={this.nls('defineSearchAreaLabel')}
                                className='w-100 d-flex'>
                                <div className='text-truncate flex-grow-1 title2 text-paper'>
                                  {this.nls('defineSearchAreaLabel')}
                                </div>
                              </Label>
                              <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('defineSearchAreaLabel') + ' ' + this.nls('defineSearchAreaTooltip')}
                                title={this.nls('defineSearchAreaTooltip')} showArrow placement='top'>
                                <div className='title3 text-default d-inline'>
                                  <InfoOutlined />
                                </div>
                              </Tooltip>
                            </SettingRow>
                            <SettingRow flow='wrap'>
                              <SearchSetting
                                intl={this.props.intl}
                                theme={this.props.theme2}
                                config={configInfo?.searchSettings}
                                onWidgetLoadOptions={onWidgetLoadOptions}
                                onSearchSettingsUpdated={this.updateSearchSettings} />
                            </SettingRow>

                            <SettingRow className='border-top pt-3'>
                              <Label tabIndex={0} aria-label={this.nls('analysisLabel')} title={this.nls('analysisLabel')}
                                className='w-100 d-flex'>
                                <div className='text-truncate flex-grow-1 title2 text-paper'>
                                  {this.nls('analysisLabel')}
                                </div>
                              </Label>
                              <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('analysisLabel') + ' ' + this.nls('configureAnalysisTooltip')}
                                title={this.nls('configureAnalysisTooltip')} showArrow placement='top'>
                                <div className='title3 text-default d-inline'>
                                  <InfoOutlined />
                                </div>
                              </Tooltip>
                            </SettingRow>
                            <SettingRow flow='wrap'>
                              <AnalysisSetting
                                widgetId={this.props.id}
                                intl={this.props.intl}
                                theme={this.props.theme}
                                jimuMapView={this.state.mapView}
                                selectedDs={this.state.activeDataSource}
                                activeDsSearchConfig={configInfo?.searchSettings}
                                activeDsLayersConfig={configInfo?.analysisSettings}
                                allFeatureLayers={this.state.dataSources}
                                useDataSourceConfig={this.props.useDataSources as any}
                                onAnalysisSettingsUpdated={this.updateAnalysisSettings}/>
                            </SettingRow>
                          </SettingSection>
                        </React.Fragment>
                        }
                      />
                    }
                  </div>
                </SettingRow>
              </SettingSection>

              {/* General Settings */}
              <SettingSection>
                <CollapsablePanel
                  label={this.nls('generalSettingsLabel')}
                  aria-label={this.nls('generalSettingsLabel')}
                  isOpen={this.state.isGeneralSettingsOpen}
                  onRequestOpen={() => { this.onToggleGeneralSettings() }}
                  onRequestClose={() => { this.onToggleGeneralSettings() }}>
                  <SettingRow flow='wrap'>
                    <GeneralSetting
                      intl={this.props.intl}
                      theme={this.props.theme2}
                      config={this.props.config.generalSettings}
                      onGeneralSettingsUpdated={this.updateGeneralSettings} />
                  </SettingRow>
                </CollapsablePanel>
              </SettingSection>
            </React.Fragment>
          }
        </div>
      </div>
    )
  }
}
