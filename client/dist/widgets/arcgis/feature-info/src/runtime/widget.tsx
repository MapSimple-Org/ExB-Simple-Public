/** @jsx jsx */
import {
  React, Immutable, jsx, type AllWidgetProps, MessageManager, DataRecordsSelectionChangeMessage, DataSourceStatus, type IMUseDataSource, uuidv1, esri,
  type DataSource, type ArcGISQueriableDataSource, type MapDataSource, type FeatureLayerDataSource, getAppStore, appConfigUtils, type IMState, type Timezone, DataSourceManager
/*, appActions, DataRecord, IMSqlExpression */ } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent, type JimuLayerView, MapViewManager } from 'jimu-arcgis'
import { Button, WidgetPlaceholder, DataActionList, DataActionListStyle, defaultMessages as jimuDefaultMessages, Alert } from 'jimu-ui'
// import { IMDataSourceJson, IMUseDataSource } from './types/app-config';
import { type IMConfig, FontSizeType, type DSConfig } from '../config'
import { getStyle } from './lib/style'
import defaultMessages from './translations/default'
//import FeatureInfo from './components/feature-info'
import FeatureInfos from './components/features-info'
import { DataLoader, type CurrentData } from './components/data-loader'
import { versionManager } from '../version-manager'
import featureInfoIcon from '../../icon.svg'
import { DSSelector } from './components/ds-selector'
import { getDefaultConfig, createDefaultDSConfig, createDefaultUseDataSource, isSupportedDataType } from '../utils'
import { ClearSelectionGeneralOutlined } from 'jimu-icons/outlined/editor/clear-selection-general'

export interface DataSourceWidgetLabelInfo {
  dataSourceId: string
  label: string
}

export interface WidgetProps extends AllWidgetProps<IMConfig> {
  dataSourceWidgetLabelInfos: DataSourceWidgetLabelInfo[]
  timezone: Timezone
}

export interface WidgetState {
  currentDataId: string
  currentDataIndex: number
  currentDataObjectId: string
  currentDataSourceVersion: number
  loadDataStatus: DataSourceStatus
  dataSourceWidgetId: string
  dataSourceLabel: string
  currentDSConfigId: string
  widthOfDSSelector: number
  jimuMapViewId: string
  jimuLayerViewChangedFlag: string
  useDataSourceChangedFlag: string
}

export default class Widget extends React.PureComponent<WidgetProps, WidgetState> {
  public viewFromMapWidget: __esri.MapView | __esri.SceneView
  private previousData: CurrentData
  private currentData: CurrentData
  private dataSource: DataSource
  private lockSelection: boolean
  private dsConfigsOfMapView: DSConfig[]
  private useDataSourcesOfMapView: IMUseDataSource[]
  private jimuLayerViewCreatedListener
  private jimuLayerViewRemovedListener
  private jimuLayerViewsVisibleChangedListener
  private prevJimuMapView: JimuMapView
  featureInfoConRef = React.createRef<HTMLDivElement>()

  static getFullConfig = (config) => {
    return getDefaultConfig().merge(config)
  }

  constructor (props) {
    super(props)
    this.previousData = null
    this.currentData = null
    this.lockSelection = true
    this.dsConfigsOfMapView = []
    this.useDataSourcesOfMapView = []
    this.jimuLayerViewCreatedListener = null
    this.jimuLayerViewRemovedListener = null
    this.jimuLayerViewsVisibleChangedListener = null
    this.prevJimuMapView = null

    const config = this.props.config
    this.state = {
      currentDataId: null,
      currentDataIndex: 0,
      currentDataObjectId: '',
      currentDataSourceVersion: null,
      loadDataStatus: DataSourceStatus.Loaded,
      dataSourceWidgetId: null,
      dataSourceLabel: '',
      currentDSConfigId: config.dsConfigs && config.dsConfigs[0] && config.dsConfigs[0].id,
      widthOfDSSelector: 80,
      jimuMapViewId: null,
      jimuLayerViewChangedFlag: '',
      useDataSourceChangedFlag: ''
    }
  }

  static versionManager = versionManager

  static mapExtraStateProps = (state: IMState, ownProps: AllWidgetProps<IMConfig>) => {
    //const useDataSource = ownProps.useDataSources && ownProps.useDataSources[0]
    //const dataSourceWidgetId = appConfigUtils.getWidgetIdByOutputDataSource(useDataSource)
    const useDataSources = ownProps.useDataSources || []
    const dataSourceWidgetLabelInfos = useDataSources.map(useDataSource => {
      const dataSourceWidgetId = appConfigUtils.getWidgetIdByOutputDataSource(useDataSource)
      return {
        dataSourceId: useDataSource.dataSourceId,
        label: state.appConfig?.widgets[dataSourceWidgetId]?.label
      }
    })

    return {
      dataSourceWidgetLabelInfos,
      timezone: state.appConfig?.attributes?.timezone
    }
  }

  componentDidUpdate (prevProps: WidgetProps) {
    // response ds change from setting
    if (this.props?.stateProps?.currentDSConfigId && prevProps?.stateProps?.currentDSConfigId !== this.props.stateProps.currentDSConfigId) {
      this.onCurrentDSChange(this.props?.stateProps?.currentDSConfigId)
      return
    }
    const currentDSConfig = this.getCurrentDSConfig()
    const defaultDSConfig = this.getDefaultDSConfig()
    const validData = this.isValidData((currentDSConfig || defaultDSConfig)?.useDataSourceId)
    if (!validData) {
      this.dsConfigsOfMapView = []
      this.useDataSourcesOfMapView = []
      this.setState({
        currentDSConfigId: '',
        currentDataId: null,
        currentDataIndex: 0
      })
      this.currentData = null
      return
    }

    if (!currentDSConfig) {
      this.setState({
        currentDSConfigId: defaultDSConfig?.id
        //dataSourceWidgetId: appConfigUtils.getWidgetIdByOutputDataSource(useDataSource)
      })
    }
  }

  getDSConfigs = () => {
    let dsConfigs
    if (this.props.config.useMapWidget) {
      const jimuLayerDsConfig = []
      const jimuTableDsConfig = []
      const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(this.state.jimuMapViewId)
      this.dsConfigsOfMapView.forEach(dsConfig => {
        const jimuLayerView = jimuMapView?.getJimuLayerViewByDataSourceId(dsConfig.useDataSourceId)
        const isTable = !jimuLayerView
        if (isTable) {
          jimuTableDsConfig.push(dsConfig)
        } if (jimuLayerView?.isLayerVisible()) {
          jimuLayerDsConfig.push(dsConfig)
        }
      })
      return jimuLayerDsConfig.concat(jimuTableDsConfig)
    } else {
      dsConfigs = this.props.config.dsConfigs || Immutable([])
      return dsConfigs.map(dsConfig => {
        if (dsConfig.label === null || dsConfig.label === undefined) {
          // label is null or undefined means the config was upgraded from a previous version
          // cannot get data source label in version manager because the data sources haven't been loaded
          const dataSource = DataSourceManager.getInstance().getDataSource(dsConfig.useDataSourceId)
          return dsConfig.set('label', dataSource?.getLabel() || '')
        } else {
          return dsConfig
        }
      })
    }
  }

  getDSConfigById = (dsConfigId) => {
    const dsConfigs = this.getDSConfigs()
    if (dsConfigs) {
      return dsConfigs.find(dsConfig => dsConfig.id === dsConfigId)
    } else {
      return null
    }
  }

  getCurrentDSConfig = () => {
    return this.getDSConfigById(this.state.currentDSConfigId)
  }

  getDefaultDSConfig = () => {
    return this.getDSConfigs()[0]
  }

  isValidData = (dataSourceId) => {
    if (this.props.config.useMapWidget) {
      return this.props.useMapWidgetIds?.length > 0
    } else {
      const useDataSources = this.props.useDataSources || Immutable([])
      return useDataSources.some(useDataSource => useDataSource.dataSourceId === dataSourceId)
    }
  }

  loadUseDataSourceById = (dataSourceId: string) => {
    const jimuMapView = MapViewManager.getInstance().getJimuMapViewById(this.state.jimuMapViewId)
    const jimuLayerView = jimuMapView?.getJimuLayerViewByDataSourceId(dataSourceId)
    jimuLayerView?.createLayerDataSource().then(dataSource => {
      const useDataSource = createDefaultUseDataSource(dataSource)
      this.useDataSourcesOfMapView.push(useDataSource)
      this.setState({
        useDataSourceChangedFlag: uuidv1()
      })
    })
  }

  getUseDataSourceById = (dataSourceId: string) => {
    // there is no use data source if add add data from map widget
    if (this.props.config.useMapWidget) {
      return this.useDataSourcesOfMapView.find(useDataSource => useDataSource.dataSourceId === dataSourceId)
    } else {
      const useDataSources = this.props.useDataSources || Immutable([])
      return useDataSources.find(useDataSource => useDataSource.dataSourceId === dataSourceId)
    }
  }

  selectGraphic () {
    const record = this.currentData?.record
    if (record && this.dataSource) {
      MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(this.props.id, [record], [this.dataSource.id]))
      const selectedRecordIds = this.dataSource.getSelectedRecordIds()
      const recordId = record.getId()
      if (!selectedRecordIds.includes(recordId)) {
        (this.dataSource as FeatureLayerDataSource).queryById(recordId).then((record) => {
          this.dataSource.selectRecordsByIds([recordId], [record])
        })
      }
    }
  }

  clearSelection = () => {
    const selectedRecordIds = this.dataSource?.getSelectedRecordIds() || []
    if (selectedRecordIds.length > 0) {
      this.dataSource.selectRecordsByIds([])
      MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(this.props.id, [], [this.dataSource.id]))
    }
  }

  getStyleConfig () {
    const config = this.props.config
    if (config.style) {
      return config.style
    } else {
      return {
        textColor: '',
        fontSizeType: FontSizeType.auto,
        fontSize: null,
        backgroundColor: ''
      }
    }
  }

  onPreGraphicBtnClick = () => {
    let index = this.state.currentDataIndex
    if (index > 0) {
      this.setState({
        currentDataIndex: --index
      })
      this.lockSelection = false
    }
  }

  onNextGraphicBtnClick = () => {
    let index = this.state.currentDataIndex
    if (!this.props.config.showCount || index < this.currentData.count - 1) {
      this.setState({
        currentDataIndex: ++index
      })
      this.lockSelection = false
    }
  }

  onClearSelectionBtnClick = () => {
    this.clearSelection()
  }

  onSelectedRecordIdChanged = (dsConfigId, index, objectId) => {
    this.setState({
      currentDSConfigId: dsConfigId,
      currentDataIndex: index,
      currentDataObjectId: objectId
    })
  }

  onUnselectedRecordIdChanged = (dataSourceId) => {
    if (this.dataSource?.id === dataSourceId) {
      MessageManager.getInstance().publishMessage(new DataRecordsSelectionChangeMessage(this.props.id, [], [dataSourceId]))
    }
  }

  onDataSourceStatusChanged = (status: DataSourceStatus, dataSourceLabel?: string) => {
    this.setState({
      loadDataStatus: status,
      dataSourceLabel: dataSourceLabel
    })
  }

  onDataChanged = (dsConfigId: string, dataSource, currentData, isFirstLoad) => {
    if (dsConfigId !== this.state.currentDSConfigId) return
    this.dataSource = dataSource
    this.previousData = this.currentData
    this.currentData = currentData
    this.setState({
      currentDataId: this.currentData ? this.currentData.id : null,
      currentDataIndex: this.currentData ? this.currentData.index : 0,
      currentDataSourceVersion: this.currentData ? this.currentData.dataSourceVersion : null
      //loadDataStatus: DataSourceStatus.Loaded
    })

    //if(!isFirstLoad && this.previousData?.id !== this.currentData?.id) {
    if (!this.lockSelection) {
      this.selectGraphic()
      this.lockSelection = true
    }
  }

  onCurrentFeatureClick = () => {
    this.selectGraphic()
  }

  onCurrentDSChange = (dsConfigId) => {
    this.setState({
      currentDSConfigId: dsConfigId,
      currentDataIndex: 0
    })
  }

  onResize = ({ width, height }) => {
    let widthOfDSSelector = 80
    if (width < 350) {
      widthOfDSSelector = width / 3
    } else {
      widthOfDSSelector = width / 2
    }

    widthOfDSSelector = Math.floor(widthOfDSSelector / 10) * 10
    this.setState({
      widthOfDSSelector: Math.floor(widthOfDSSelector)
    })
  }

  onJimuLayerViewCreate = async (jimuLayerView: JimuLayerView, loadedJimuLayerViews: JimuLayerView[]) => {
    const jimuLayerViewAlreadyLoaded = loadedJimuLayerViews.find(loadedJimuLayerView => jimuLayerView.id === loadedJimuLayerView.id)
    if (jimuLayerViewAlreadyLoaded || !jimuLayerView.isLayerVisible()) {
      return
    }
    const dataSource = await jimuLayerView.createLayerDataSource()
    if (!isSupportedDataType(dataSource)) {
      return
    }

    const useDataSource = createDefaultUseDataSource(dataSource)
    this.useDataSourcesOfMapView.push(useDataSource)
    this.dsConfigsOfMapView.push(createDefaultDSConfig(jimuLayerView.layerDataSourceId, jimuLayerView.layer?.title))
    this.setState({
      jimuLayerViewChangedFlag: jimuLayerView.id,
      currentDSConfigId: this.getDefaultDSConfig()?.id
    })
  }

  onJimuLayerViewRemove = (jimuLayerView: JimuLayerView) => {
    this.dsConfigsOfMapView.some((dsConfig, index) => {
      if (dsConfig.useDataSourceId === jimuLayerView.layerDataSourceId) {
        this.dsConfigsOfMapView.splice(index, 1)
        return true
      } else {
        return false
      }
    })

    this.useDataSourcesOfMapView.some((useDataSource, index) => {
      if (useDataSource.dataSourceId === jimuLayerView.layerDataSourceId) {
        this.useDataSourcesOfMapView.splice(index, 1)
        return true
      } else {
        return false
      }
    })

    const currentDSConfigId = this.getDefaultDSConfig()?.id
    if (!currentDSConfigId) {
      this.currentData = null
      this.dataSource = null
    }

    this.setState({
      jimuLayerViewChangedFlag: uuidv1(),
      currentDSConfigId
    })
  }

  onJimuLayerViewVisibilityChange = (jimuLayerViews: JimuLayerView[]) => {
    jimuLayerViews.forEach(async jimuLayerView => {
      const dsConfigExisted = this.getDSConfigs().find(dsConfig => dsConfig.useDataSourceId === jimuLayerView.layerDataSourceId)
      if (!jimuLayerView.isLayerVisible() || dsConfigExisted) {
        return
      }
      const dataSource = await jimuLayerView.createLayerDataSource()
      if (isSupportedDataType(dataSource)) {
        const useDataSource = createDefaultUseDataSource(dataSource)
        this.useDataSourcesOfMapView.push(useDataSource)
        this.dsConfigsOfMapView.push(createDefaultDSConfig(jimuLayerView.layerDataSourceId, jimuLayerView.layer?.title))
        this.setState({
          jimuLayerViewChangedFlag: uuidv1(),
          currentDSConfigId: this.getDefaultDSConfig()?.id
        })
      }
    })

    const currentDSConfigId = this.getDefaultDSConfig()?.id
    if (!currentDSConfigId) {
      this.currentData = null
      this.dataSource = null
    }
    this.setState({
      jimuLayerViewChangedFlag: uuidv1(),
      currentDSConfigId
    })
  }

  addNewDataForMapView = (dataSource: DataSource, title?: string) => {
    if (isSupportedDataType(dataSource)) {
      const useDataSource = createDefaultUseDataSource(dataSource)
      this.useDataSourcesOfMapView.push(useDataSource)
      this.dsConfigsOfMapView.push(createDefaultDSConfig(dataSource.id, title))
      this.setState({
        jimuLayerViewChangedFlag: dataSource.id,
        currentDSConfigId: this.getDefaultDSConfig()?.id
      })
    }
  }

  onJimuMapViewLoaded = (jimuMapView) => {
    const mapDataSource = DataSourceManager.getInstance().getDataSource(jimuMapView.dataSourceId) as MapDataSource
    // there is no map data source if it's a default map
    if (mapDataSource) {
      jimuMapView.getJimuTables().forEach(async jimuTable => {
        const dataSourceId = jimuMapView.getDataSourceIdByAPILayer(jimuTable.table)
        const dataSource = await mapDataSource.createDataSourceById(dataSourceId)
        this.addNewDataForMapView(dataSource, jimuTable.table?.title)
      })
    }
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    this.currentData = null
    this.dataSource = null
    this.dsConfigsOfMapView = []
    this.useDataSourcesOfMapView = []
    this.onDataSourceStatusChanged(DataSourceStatus.Loaded)
    if (!jimuMapView) {
      this.setState({ jimuMapViewId: null })
      return
    }
    const loadedJimuLayerViews = jimuMapView.getAllJimuLayerViews()
    loadedJimuLayerViews.forEach(async jimuLayerView => {
      if (!jimuLayerView.isLayerVisible()) {
        return
      }
      const dataSource = await jimuLayerView.createLayerDataSource()
      if (isSupportedDataType(dataSource)) {
        const useDataSource = createDefaultUseDataSource(dataSource)
        this.useDataSourcesOfMapView.push(useDataSource)
        this.dsConfigsOfMapView.push(createDefaultDSConfig(jimuLayerView.layerDataSourceId, jimuLayerView.layer?.title))
        this.setState({
          jimuLayerViewChangedFlag: jimuLayerView.id,
          currentDSConfigId: this.getDefaultDSConfig()?.id
        })
      }
    })

    if (this.prevJimuMapView) {
      this.jimuLayerViewCreatedListener && this.prevJimuMapView.removeJimuLayerViewCreatedListener(this.jimuLayerViewCreatedListener)
      this.jimuLayerViewRemovedListener && this.prevJimuMapView.removeJimuLayerViewRemovedListener(this.jimuLayerViewRemovedListener)
      this.jimuLayerViewsVisibleChangedListener && this.prevJimuMapView.removeJimuLayerViewsVisibleChangeListener(this.jimuLayerViewsVisibleChangedListener)
    }
    this.prevJimuMapView = jimuMapView
    this.jimuLayerViewCreatedListener = (jimuLayerView: JimuLayerView) => {
      this.onJimuLayerViewCreate(jimuLayerView, loadedJimuLayerViews)
    }
    jimuMapView.addJimuLayerViewCreatedListener(this.jimuLayerViewCreatedListener)

    this.jimuLayerViewRemovedListener = (jimuLayerView: JimuLayerView) => {
      this.onJimuLayerViewRemove(jimuLayerView)
    }
    jimuMapView.addJimuLayerViewRemovedListener(this.jimuLayerViewRemovedListener)

    this.jimuLayerViewsVisibleChangedListener = (jimuLayerViews: JimuLayerView[]) => {
      this.onJimuLayerViewVisibilityChange(jimuLayerViews)
    }
    jimuMapView.addJimuLayerViewsVisibleChangeListener(this.jimuLayerViewsVisibleChangedListener)

    // handle tables
    jimuMapView.whenJimuMapViewLoaded().then(() => {
      this.onJimuMapViewLoaded(jimuMapView)
    })

    this.setState({ jimuMapViewId: jimuMapView.id })
  }

  isDataSourceAccessible = (dataSourceId: string) => {
    if (this.props.config.useMapWidget) {
      return true
    } else {
      return !!this.props.useDataSources?.find(useDs => dataSourceId === useDs.dataSourceId)
    }
  }

  getPlaceholderContent = () => {
    return (
      <div className='widget-featureInfo'>
        <WidgetPlaceholder icon={featureInfoIcon} name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
      </div>
    )
  }

  getLoadingContent = () => {
    let loadingContent = null
    if (this.state.loadDataStatus === DataSourceStatus.Loading) {
      loadingContent = (
        <div style={{ position: 'absolute', left: '50%', top: '50%' }} className='jimu-secondary-loading' />
      )
    }
    return loadingContent
  }

  getHeaderContent = () => {
    // data action
    //let dataActionPlaceholder = null
    let dataActionContent = null
    const dataName = this.props.intl.formatMessage({ id: 'featureInfoDataActionLabel', defaultMessage: defaultMessages.featureInfoDataActionLabel },
      { layer: this.dataSource?.getLabel() || '' })
    // show dataAction by default (this.props.enableDataAction is undefined)
    const enableDataAction = (this.props.enableDataAction === undefined ? true : this.props.enableDataAction) && this.dataSource && this.currentData
    if (enableDataAction) {
      dataActionContent = (
        <div className='data-action-dropdown-content'>
          <DataActionList
            widgetId={this.props.id}
            dataSets={[{ dataSource: this.dataSource, records: this.currentData?.record ? [this.currentData?.record] : [], name: dataName, type: 'current', fields: (this.dataSource as ArcGISQueriableDataSource).getPopupInfoFields() }]}
            listStyle={DataActionListStyle.Dropdown}
            buttonType='tertiary'
          />
        </div>
      )
    }

    // nav operation
    let navContent = null
    const isValidCount = this.props.config.showCount ? this.currentData?.count > 1 : true
    const enableNavFeature = this.currentData && this.props.config.featureNavigator && isValidCount
    if (enableNavFeature) {
      const featureNumbers = this.props.intl.formatMessage({ id: 'featureNumbers', defaultMessage: defaultMessages.featureNumbers },
        { index: this.currentData.index + 1, count: this.currentData.count })
      navContent = (
        <div className='nav-section d-flex justify-content-center align-items-center'>
          <Button className='nav-btn' type='tertiary' size='sm' disabled={this.currentData.index <= 0} onClick={this.onPreGraphicBtnClick}
            aria-label={this.props.intl.formatMessage({ id: 'previous', defaultMessage: jimuDefaultMessages.previous })}
            aria-describedby={'feature-numbers'}> {'<'} </Button>
          <span id='feature-numbers'> {this.props.config.showCount ? featureNumbers : ''} </span>
          <Button className='nav-btn' type='tertiary' size='sm' disabled={this.props.config.showCount ? this.currentData.index + 1 >= this.currentData.count : false} onClick={this.onNextGraphicBtnClick}
            aria-label={this.props.intl.formatMessage({ id: 'next', defaultMessage: jimuDefaultMessages.next })}
           aria-describedby={'feature-numbers'}> {'>'} </Button>
        </div>
      )
    }

    // ds selector
    let dsSelectorContent = null
    const enableNavDS = this.props.config.dsNavigator && (this.getDSConfigs().length > 1)
    if (enableNavDS) {
      const dsConfigs = this.getDSConfigs().filter(dsConfig => {
        return this.isDataSourceAccessible(dsConfig.useDataSourceId)
      })
      dsSelectorContent = (<DSSelector dsConfigs={dsConfigs} activeDSConfigId={this.state.currentDSConfigId} onCurrentDSChange={this.onCurrentDSChange} />)
    }

    // clear selection
    let clearSelectionContent = null
    const title = this.props.intl.formatMessage({ id: 'clearSelection', defaultMessage: 'Clear selection'})

    if (this.props.config.clearSelection) {
      const selectedRecordIds = this.dataSource?.getSelectedRecordIds() || []
      clearSelectionContent = (
        <div className='clear-selection d-flex justify-content-center align-items-center'>
          <Button title={title} type='tertiary' size='sm' icon disabled={selectedRecordIds.length <= 0} onClick={this.onClearSelectionBtnClick} aria-label={title}>
            <ClearSelectionGeneralOutlined size={16} />
          </Button>
        </div>
      )
    }

    let headerContent = null
    if ((enableNavFeature || enableNavDS || enableDataAction) && this.state.loadDataStatus !== DataSourceStatus.CreateError && this.state.loadDataStatus !== DataSourceStatus.NotReady) {
      headerContent = (
        <div className='header-section'>
          {navContent}
          <div className='header-operation-section'>
            {dsSelectorContent}
            <div className='header-control-section'>
              {clearSelectionContent}
              {dataActionContent}
            </div>
          </div>
        </div>
      )
    }
    return headerContent
  }

  getDsErrorMessageContent = () => {
    return (
      <div className='widget-featureInfo'>
        <WidgetPlaceholder icon={featureInfoIcon} name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
        <Alert
          className='warning-inaccessible'
          type='warning'
          withIcon
          text={this.props.intl.formatMessage({ id: 'dataSourceCreateError', defaultMessage: 'warning' })}
        />
      </div>
    )
  }

  getWarningMessageContent = () => {
    const dataSourceWidgetLabelInfo = this.props.dataSourceWidgetLabelInfos.find(dataSourceWidgetLabelInfo => dataSourceWidgetLabelInfo.dataSourceId === this.getCurrentDSConfig()?.useDataSourceId)
    const warningMessage = this.props.intl.formatMessage({ id: 'outputDataIsNotGenerated', defaultMessage: 'warning' },
      { outputDsLabel: this.state.dataSourceLabel, sourceWidgetName: dataSourceWidgetLabelInfo?.label || '' })
    return (
      <div className='widget-featureInfo'>
        <WidgetPlaceholder icon={featureInfoIcon} name={this.props.intl.formatMessage({ id: '_widgetLabel', defaultMessage: defaultMessages._widgetLabel })} widgetId={this.props.id} />
        <Alert className='warning-icon' form='tooltip' size='small' type='warning' text={warningMessage} />
      </div>
    )
  }

  getDefaultMessageContent = () => {
    const sanitizer = new esri.Sanitizer()
    return (
      <div
        className='no-data-message p-5 font-weight-bold'
        dangerouslySetInnerHTML={{
          __html: sanitizer.sanitize(this.props.config.noDataMessage) ||
            this.props.intl.formatMessage({ id: 'noDataMessageDefaultText', defaultMessage: defaultMessages.noDataMessageDefaultText })
        }}
      />
    )
  }

  getFeaturesContent = () => {
    const dsConfig = this.getCurrentDSConfig()
    const contentConfig = dsConfig?.contentConfig
    const visibleElements = {
      title: contentConfig?.title,
      content: {
        fields: contentConfig?.fields ?? true,
        text: contentConfig?.fields ?? true,
        media: contentConfig?.media ?? true,
        attachments: contentConfig?.attachments ?? true,
        expression: true
      },
      lastEditedInfo: contentConfig?.lastEditInfo ?? true
    }

    const selectedRecordIds = this.dataSource?.getSelectedRecordIds() || []
    const currentFeatureIsSelected = selectedRecordIds.some(selectedRecordId => selectedRecordId === this.currentData?.id)
    const cursor = currentFeatureIsSelected ? 'default' : 'pointer'
    return (
      <div style={{ cursor: cursor }} onClick={this.onCurrentFeatureClick} >
        <FeatureInfos
          graphic={this.currentData.graphic}
          defaultPopupTemplate={this.currentData.defaultPopupTemplate}
          visibleElements={visibleElements}
          dataSource={this.dataSource}
          timezone={this.props.timezone}
          useMapWidget={this.props.config.useMapWidget}
        />
      </div>
    )
  }

  getFeatureInfoContent = () => {
    let featureInfoContent
    if (this.state.loadDataStatus === DataSourceStatus.CreateError) {
      featureInfoContent = this.getDsErrorMessageContent()
    } else if (this.state.loadDataStatus === DataSourceStatus.NotReady) {
      featureInfoContent = this.getWarningMessageContent()
    } else if (this.currentData && this.dataSource) {
      featureInfoContent = this.getFeaturesContent()
    } else if (this.state.loadDataStatus === DataSourceStatus.Loaded) {
      featureInfoContent = this.getDefaultMessageContent()
    }
    return featureInfoContent
  }

  getDataSourceContent = () => {
    let dataLoaderContent = null
    let dataSourceContent = null
    dataLoaderContent = this.getDSConfigs().map((dsConfig, index) => {
      const useDataSource = this.getUseDataSourceById(dsConfig?.useDataSourceId)
      const isBaseOnObjectId = !this.props.config.featureNavigator
      return (<DataLoader
        key={index}
        active={this.state.currentDSConfigId === dsConfig.id}
        useDataSource={useDataSource}
        dsConfigId={dsConfig.id}
        widgetId={this.props.id}
        index={this.state.currentDataIndex}
        objectId={isBaseOnObjectId ? this.state.currentDataObjectId : null}
        limitGraphics={this.props.config.limitGraphics}
        maxGraphics={this.props.config.maxGraphics}
        onSelectedRecordIdChanged={this.onSelectedRecordIdChanged}
        onUnselectedRecordIdChanged={this.onUnselectedRecordIdChanged}
        onDataSourceStatusChanged={this.onDataSourceStatusChanged}
        needCountInfo={this.props.config.showCount}
        isBaseOnObjectId={isBaseOnObjectId}
        onDataChanged={this.onDataChanged} />)
    })
    dataSourceContent = (
      <div style={{ position: 'absolute', display: 'block' }}>
        {dataLoaderContent}
        {this.props.config.useMapWidget && this.props.useMapWidgetIds?.[0] && (
          <JimuMapViewComponent
            useMapWidgetId={this.props.useMapWidgetIds?.[0]}
            onActiveViewChange={this.onActiveViewChange}
          />
        )}
      </div>
    )
    return dataSourceContent
  }

  render () {
    let content = null
    const validData = this.isValidData(this.getCurrentDSConfig()?.useDataSourceId)
    if (!validData) {
      content = this.getPlaceholderContent()
      this.currentData = null
    } else {
      content = (
        <div className='widget-featureInfo' ref={this.featureInfoConRef}>
          {this.getLoadingContent()}
          {this.getHeaderContent()}
          {this.getFeatureInfoContent()}
          {this.getDataSourceContent()}
          {/*<ReactResizeDetector targetRef={this.featureInfoConRef} handleWidth onResize={this.onResize} />*/}
        </div>
      )
    }
    const enableNavDS = this.props.config.dsNavigator && (this.getDSConfigs().length > 1)
    return (
      <div css={getStyle(this.props.theme, this.props.config.styleType, this.getStyleConfig(), getAppStore().getState()?.appContext?.isRTL, this.props.autoWidth, enableNavDS)} className='jimu-widget'>
        {content}
      </div>
    )
  }
}
