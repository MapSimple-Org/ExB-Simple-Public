/** @jsx jsx */
import { SettingSection, SettingRow, MapWidgetSelector, SearchDataSetting, SearchDataType, getAllDsByDataConfigWithMapCentric, getAllDataSourceBySearchDataConfig, type IMDataSourceConfigWithMapCentric, type IMDataSourceConfigItemWithMapCentric, type DataSourceConfigItemWithMapCentric, getDsInWidgetJson, getDefaultGeocodeConfig, type PropsForDataSourceSelector } from 'jimu-ui/advanced/setting-components'
import { React, css, jsx, classNames, type UseDataSource, type ImmutableArray, type DataSourceJson, hooks, defaultMessages as jimuUiDefaultMessages, Immutable, DataSourceManager } from 'jimu-core'
import { type SettingChangeFunction, getAppConfigAction } from 'jimu-for-builder'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Radio, Button, Switch, Loading, LoadingType } from 'jimu-ui'
import { type IMConfig, SearchServiceType, type SearchDataConfig, SourceType, DEFAULT_GEOCODE_KEY } from '../../config'
import { getDataSourceConfigWithMapCentric, checkIsDsChangedInMap, getAllPropsForDataSourceSelectorByJimuMapViews } from '../../utils/utils'
import { addShowOnMapAndZoomToActionWithMapCentric, removeShowOnMapAndZoomToActionWithMapCentric } from '../utils/util'
import defaultMessage from '../translations/default'
import { DataMapOutlined } from 'jimu-icons/outlined/gis/data-map'
import { DataSceneOutlined } from 'jimu-icons/outlined/gis/data-scene'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
const { useEffect, useRef } = React

interface Props {
  config?: IMConfig
  id: string
  portalUrl: string
  showPlaceholder: boolean
  useDataSources?: ImmutableArray<UseDataSource>
  useMapWidgetIds?: ImmutableArray<string>
  onSettingChange: SettingChangeFunction
}

interface AllPropsForDataSourceSelector {
  [viewId: string]: PropsForDataSourceSelector
}

const STYLE = css`
  &.con-border {
    border-bottom: 1px solid var(--sys-color-secondary-light);
  }
  .loading-con {
    height: 80px;
  }
  .data-setting-con-with-custom-search-source {
    .jimu-widget-setting--section {
      padding-left: 0;
      padding-right: 0;
    }
  }
  .radio-con {
    cursor: pointer;
  }
  .hide-padding-bottom.jimu-widget-setting--section {
    padding-bottom: 0;
  }
  .data-icon-con {
    width: 16px;
  }
`

const CustomSearchDataSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessages)
  const jimuMapViewsRef = useRef(null as { [viewId: string]: JimuMapView })
  const allPropsForDataSourceSelectorRef = useRef(null as AllPropsForDataSourceSelector)
  const setMapActionWithMapCentricTimeOutRef = useRef(null)
  const removeMapActionWithMapCentricTimeOutRef = useRef(null)
  const defaultGeocodeConfigRef = useRef(null as SearchDataConfig[])
  const useMapWidgetIdsRef = useRef(null as string)
  const configRef = useRef(null as IMConfig)
  const showLoadingListRef = useRef(Immutable({}))

  const { config, id, useMapWidgetIds, portalUrl, useDataSources, showPlaceholder, onSettingChange } = props
  const [jimuMapViews, setJimuMapViews] = React.useState(null as { [viewId: string]: JimuMapView })
  const [openSettingList, setOpenSettingList] = React.useState(Immutable({}))
  const [defaultGeocodeConfig, setDefaultGeocodeConfig] = React.useState(null as SearchDataConfig[])
  const [showLoadingList, setShowLoadingList] = React.useState(Immutable({}))
  const [allViewsCreated, setAllViewsCreated] = React.useState(false)
  const dsManager = DataSourceManager.getInstance()

  useEffect(() => {
    configRef.current = config
    if (config.sourceType !== SourceType.MapCentric && typeof config?.datasourceConfig === 'undefined') {
      //When sourceType is 'CustomSearchSources', automatic addition default geocode service for search widget
      restDataConfigOfCustomSearchSource()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useEffect(() => {
    if (useMapWidgetIdsRef.current) {
      if (useMapWidgetIdsRef.current === useMapWidgetIds?.[0] && configRef.current.sourceType === SourceType.MapCentric) {
        updateDataConfigWhenHasDsAddedOrDeletedInMap(jimuMapViews)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapViews, useMapWidgetIds])

  /**
   * When map widget delete or add ds, update widget config
  */
  const updateDataConfigWhenHasDsAddedOrDeletedInMap = (jimuMapViews) => {
    const newConfig = configRef.current?.asMutable({ deep: true })
    const layerChangeRes = checkIsDsChangedInMap(jimuMapViews, configRef.current)
    if (!layerChangeRes?.changed) return
    const { added, deleted } = layerChangeRes
    if (deleted?.length > 0) {
      deleted.forEach(viewId => {
        delete newConfig.dataSourceConfigWithMapCentric[viewId]
      })
    }
    if (added.length > 0) {
      const dataSourceConfigWithMapCentric = newConfig.dataSourceConfigWithMapCentric || {}
      added.forEach(id => {
        dataSourceConfigWithMapCentric[id] = null
      })

      newConfig.dataSourceConfigWithMapCentric = dataSourceConfigWithMapCentric
    }

    if (deleted?.length > 0 || added.length > 0) {
      confirmChangeWidgetJson(Immutable(newConfig))
    }
  }

  const handleMapWidgetChange = (useMapWidgetIds: string[]): void => {
    if (!useMapWidgetIds || useMapWidgetIds?.length === 0) {
      const newConfig = config.set('dataSourceConfigWithMapCentric', null)
      onSettingChange({
        id: id,
        config: newConfig,
        useMapWidgetIds: useMapWidgetIds
      })
    } else {
      onSettingChange({
        id: id,
        useMapWidgetIds: useMapWidgetIds
      })
    }
  }

  const onDataSettingChange = (dataSourceConfig: ImmutableArray<SearchDataConfig>, allDsInWidgetJson, viewId?: string) => {
    if (!dataSourceConfig) return false
    const newConfig = viewId ? config?.setIn(['dataSourceConfigWithMapCentric', viewId, 'dataSourceConfig'], dataSourceConfig) : config?.setIn(['datasourceConfig'], dataSourceConfig)
    const { dsInWidgetJson } = getNewWidgetJsonAndAllDs(newConfig)
    const newWidgetJson = { id, config: newConfig }
    handleWidgetJsonChange(newWidgetJson, dsInWidgetJson)
  }

  const getNewWidgetJsonAndAllDs = (config: IMConfig) => {
    if (config?.sourceType === SourceType.MapCentric) {
      const dataSourceConfigWithMapCentric = config?.dataSourceConfigWithMapCentric || {}
      let isHasUseDataSource = false
      Object.keys(dataSourceConfigWithMapCentric).forEach(key => {
        const synchronizeSettings = dataSourceConfigWithMapCentric?.[key]?.synchronizeSettings !== false
        if (!synchronizeSettings) {
          isHasUseDataSource = true
        }
      })
      if (!isHasUseDataSource) {
        return {
          allDataSources: undefined,
          dsInWidgetJson: undefined
        }
      }
    }
    const allDataSources = config?.sourceType === SourceType.MapCentric ? getAllDsByDataConfigWithMapCentric(config?.dataSourceConfigWithMapCentric?.asMutable({ deep: true })) : getAllDataSourceBySearchDataConfig(config?.datasourceConfig, true)
    const dsInWidgetJson = getDsInWidgetJson(allDataSources, id, true)
    return {
      allDataSources: allDataSources,
      dsInWidgetJson: dsInWidgetJson
    }
  }

  const createOutputDs = (outputDsJsonList: DataSourceJson[], dataSourceConfig: ImmutableArray<SearchDataConfig>, allDsInWidgetJson, viewId?: string) => {
    if (!dataSourceConfig) return false
    const newConfig = viewId ? config?.setIn(['dataSourceConfigWithMapCentric', viewId, 'dataSourceConfig'], dataSourceConfig) : config?.setIn(['datasourceConfig'], dataSourceConfig)
    const { dsInWidgetJson, allDataSources } = getNewWidgetJsonAndAllDs(newConfig)
    const newWidgetJson = {
      id,
      config: newConfig,
      useUtilities: getUseUtilities(newConfig)
    }
    handleWidgetJsonChange(newWidgetJson, dsInWidgetJson, allDataSources?.outputDataSources)
  }

  const handleWidgetJsonChange = (newWidgetJson, dsInWidgetJson, outputDsJsonList?: DataSourceJson[]) => {
    const appConfigAction = getAppConfigAction()
    if (dsInWidgetJson?.isWidgetJsonDsChanged && dsInWidgetJson?.dsInWidgetJson) {
      newWidgetJson = {
        ...newWidgetJson,
        ...dsInWidgetJson?.dsInWidgetJson
      }
    }

    if (!dsInWidgetJson) {
      newWidgetJson.outputDataSources = undefined
      newWidgetJson.useDataSources = undefined
    }

    if (outputDsJsonList) {
      appConfigAction.editWidget(newWidgetJson, outputDsJsonList).exec()
    } else {
      appConfigAction.editWidget(newWidgetJson).exec()
    }
  }

  const getUseUtilities = (config: IMConfig) => {
    const useUtilities = []
    config?.datasourceConfig?.forEach(configItem => {
      if (configItem?.searchServiceType === SearchServiceType.GeocodeService) {
        useUtilities.push(configItem?.useUtility)
      }
    })
    return useUtilities
  }

  const toggleSetting = (viewId: string) => {
    let newOpenSettingList = openSettingList
    if (typeof newOpenSettingList?.[viewId] !== 'boolean') {
      newOpenSettingList = newOpenSettingList.set(viewId, false)
    } else {
      newOpenSettingList = newOpenSettingList.set(viewId, !newOpenSettingList[viewId])
    }
    setOpenSettingList(newOpenSettingList)
  }

  const handleEnableFilteringChange = (value: boolean) => {
    onSettingChange({ id: id, config: config.set('enableFiltering', value) })
  }

  const handleSearchSourceChange = hooks.useEventCallback((sourceType: SourceType) => {
    let newConfig = config.set('sourceType', sourceType)
    if (sourceType === SourceType.CustomSearchSources) {
      onSettingChange({ id: id, config: newConfig, useMapWidgetIds: null })
      restDataConfigOfCustomSearchSource()
    } else {
      onSettingChange({ id: id, config: newConfig })
      newConfig = newConfig.set('enableFiltering', false)
      if (!jimuMapViewsRef.current) {
        newConfig = newConfig.set('datasourceConfig', []).set('isAutoSelectFirstResult', true)
        onSettingChange({ id: id, config: newConfig })
        addNewShowOnMapAction()
      } else {
        resetDataConfigOfMapCentric(jimuMapViewsRef.current, newConfig)
      }
    }
  })

  const onViewsCreate = (views: { [viewId: string]: JimuMapView }) => {
    const viewsKeys = Object.keys(views)
    const viewsCount = viewsKeys.length
    const viewsLoaded = {}
    let index = 0
    viewsKeys.forEach(async viewId => {
      viewsLoaded[viewId] = false
      const jimuMapView = views[viewId]
      await jimuMapView.whenJimuMapViewLoaded()
      await jimuMapView.whenAllJimuLayerViewLoaded()
      viewsLoaded[viewId] = true
      index++
      if (index === viewsCount) {
        const isAllLoaded = Object.values(viewsLoaded).every(tag => tag)
        if (isAllLoaded) {
          setAllViewsCreated(true)
          setJimuMapViews(views)
          jimuMapViewsRef.current = views
          const useMapChange = useMapWidgetIdsRef.current && useMapWidgetIdsRef.current !== useMapWidgetIds[0]
          initAllPropsForDataSourceSelector(views)
          if ((!config?.dataSourceConfigWithMapCentric || useMapChange) && config?.sourceType === SourceType.MapCentric) {
            resetDataConfigOfMapCentric(views, config)
          }
          useMapWidgetIdsRef.current = useMapWidgetIds[0]
        }
      }
    })
  }

  const initAllPropsForDataSourceSelector = (views: { [viewId: string]: JimuMapView }) => {
    const allPropsForDataSourceSelector = getAllPropsForDataSourceSelectorByJimuMapViews(views)
    allPropsForDataSourceSelectorRef.current = allPropsForDataSourceSelector
  }

  const resetDataConfigOfMapCentric = (views: { [viewId: string]: JimuMapView }, config: IMConfig) => {
    const dataSourceConfigWithMapCentric = {}
    Object.keys(views || {})?.forEach(viewId => {
      dataSourceConfigWithMapCentric[viewId] = null
    })
    config = config.set('dataSourceConfigWithMapCentric', dataSourceConfigWithMapCentric).set('datasourceConfig', []).set('isAutoSelectFirstResult', true)
    confirmChangeWidgetJson(config)
    addNewShowOnMapAction()
  }

  const addNewShowOnMapAction = () => {
    clearTimeout(setMapActionWithMapCentricTimeOutRef.current)
    setMapActionWithMapCentricTimeOutRef.current = setTimeout(() => {
      useMapWidgetIdsRef.current && addShowOnMapAndZoomToActionWithMapCentric(id, useMapWidgetIdsRef.current)
    }, 200)
  }

  const removeShowOnMapActionsWithMapCentric = () => {
    clearTimeout(removeMapActionWithMapCentricTimeOutRef.current)
    removeMapActionWithMapCentricTimeOutRef.current = setTimeout(() => {
      useMapWidgetIdsRef.current && removeShowOnMapAndZoomToActionWithMapCentric(id, useMapWidgetIdsRef.current)
    }, 200)
  }

  const toggleLoading = (viewId: string[] = [], showLoading = false) => {
    let newShowLoadingList = showLoadingListRef.current
    viewId?.forEach(id => {
      newShowLoadingList = newShowLoadingList.set(id, showLoading)
    })
    showLoadingListRef.current = newShowLoadingList
    setShowLoadingList(newShowLoadingList)
  }

  const restDataConfigOfCustomSearchSource = () => {
    getDefaultGeocodeDataConfig().then(defaultGeocodeConfigRes => {
      if (configRef.current.sourceType !== SourceType.MapCentric) {
        let config = configRef.current.set('datasourceConfig', defaultGeocodeConfigRes).set('dataSourceConfigWithMapCentric', null)
        config = config.set('isAutoSelectFirstResult', false).set('enableFiltering', true)
        confirmChangeWidgetJson(config)
        removeShowOnMapActionsWithMapCentric()
      }
    })
  }

  const confirmChangeWidgetJson = (newConfig: IMConfig) => {
    const { dsInWidgetJson, allDataSources } = getNewWidgetJsonAndAllDs(newConfig)
    const newWidgetJson = {
      id,
      config: newConfig,
      useUtilities: getUseUtilities(newConfig)
    }
    handleWidgetJsonChange(newWidgetJson, dsInWidgetJson, allDataSources?.outputDataSources)
    configRef.current = newConfig
  }

  const mergeDataConfigWithDefaultGeocode = (defaultGeocodeConfig, dataSourceConfigItemWithMapCentric: DataSourceConfigItemWithMapCentric): DataSourceConfigItemWithMapCentric => {
    if (!defaultGeocodeConfig) {
      return dataSourceConfigItemWithMapCentric
    } else {
      let newDataSourceConfigItem = dataSourceConfigItemWithMapCentric?.dataSourceConfig || [] as any
      newDataSourceConfigItem = newDataSourceConfigItem.concat(defaultGeocodeConfig)
      dataSourceConfigItemWithMapCentric.dataSourceConfig = newDataSourceConfigItem
      return dataSourceConfigItemWithMapCentric
    }
  }

  const getDefaultGeocodeDataConfig = async (viewId?: string) => {
    if (defaultGeocodeConfigRef.current) {
      const newDefaultGeocodeConfig = viewId ? initDefaultGeocodeDataConfigWithViewId(defaultGeocodeConfig, viewId) : defaultGeocodeConfig
      return Promise.resolve(newDefaultGeocodeConfig)
    } else {
      const option = {
        nls: nls,
        id,
        createOutputDs: true,
        viewId: DEFAULT_GEOCODE_KEY,
        isSingle: false
      }
      toggleLoading([DEFAULT_GEOCODE_KEY], true)
      return getDefaultGeocodeConfig(option).then(res => {
        setDefaultGeocodeConfig(res)
        defaultGeocodeConfigRef.current = res
        toggleLoading([DEFAULT_GEOCODE_KEY], false)
        return Promise.resolve(res)
      }, err => {
        toggleLoading([DEFAULT_GEOCODE_KEY], false)
        return Promise.reject(new Error(err))
      })
    }
  }

  const initDefaultGeocodeDataConfigWithViewId = (defaultGeocodeConfig: SearchDataConfig[], viewId: string): SearchDataConfig[] => {
    return defaultGeocodeConfig?.map(item => {
      return {
        ...item,
        outputDataSourceId: `${item.outputDataSourceId}_${viewId}`,
        configId: `${item.configId}_${viewId}`
      }
    })
  }

  const handleSynchronizeSettingsChange = (viewId: string) => {
    const synchronizeSettings = (config?.dataSourceConfigWithMapCentric?.[viewId]?.synchronizeSettings as any) === false
    let newConfig = config.setIn(['dataSourceConfigWithMapCentric', viewId, 'synchronizeSettings'], synchronizeSettings)
    !defaultGeocodeConfigRef.current && onSettingChange({ id: id, config: newConfig })
    configRef.current = newConfig
    if (!synchronizeSettings) {
      toggleLoading([viewId], true)
      getDefaultGeocodeDataConfig(viewId).then(async defaultGeocodeConfigRes => {
        if (configRef.current.sourceType === SourceType.MapCentric) {
          newConfig = configRef.current.setIn(['dataSourceConfigWithMapCentric', viewId, 'dataSourceConfig'], null)
          const newDataConfigItemWithDefaultGeocodeForMapCentric = await getNewDataConfigItemWithDefaultGeocodeForMapCentric(viewId, defaultGeocodeConfigRes, synchronizeSettings)
          newConfig = newConfig.setIn(['dataSourceConfigWithMapCentric', viewId], newDataConfigItemWithDefaultGeocodeForMapCentric)
          addNewShowOnMapAction()
          confirmChangeWidgetJson(newConfig)
        }
        toggleLoading([viewId], false)
      }, err => {
        toggleLoading([viewId], false)
      })
    } else {
      newConfig = newConfig.setIn(['dataSourceConfigWithMapCentric', viewId, 'dataSourceConfig'], null).set('isAutoSelectFirstResult', true).set('enableFiltering', false)
      confirmChangeWidgetJson(newConfig)
      addNewShowOnMapAction()
    }
  }

  const getNewDataConfigItemWithDefaultGeocodeForMapCentric = async (viewId: string, defaultGeocodeConfig: SearchDataConfig[], synchronizeSettings: boolean, dataSourceConfigItemWithMapCentric?: DataSourceConfigItemWithMapCentric): Promise<DataSourceConfigItemWithMapCentric> => {
    let newDataSourceConfigItemWithMapCentric = dataSourceConfigItemWithMapCentric || {
      synchronizeSettings: synchronizeSettings,
      dataSourceConfig: null
    }
    if ((synchronizeSettings as any) === false) {
      const views = {}
      viewId !== DEFAULT_GEOCODE_KEY && (views[viewId] = jimuMapViewsRef.current[viewId])
      if (dataSourceConfigItemWithMapCentric) {
        newDataSourceConfigItemWithMapCentric = dataSourceConfigItemWithMapCentric
      } else {
        const newDataSourceConfig = await getDataSourceConfigWithMapCentric(views)
        if (newDataSourceConfig?.[viewId]) {
          newDataSourceConfigItemWithMapCentric = newDataSourceConfig?.[viewId]
        }
      }
      newDataSourceConfigItemWithMapCentric = mergeDataConfigWithDefaultGeocode(defaultGeocodeConfig, newDataSourceConfigItemWithMapCentric)
      newDataSourceConfigItemWithMapCentric.synchronizeSettings = synchronizeSettings
      return Promise.resolve(newDataSourceConfigItemWithMapCentric)
    } else {
      newDataSourceConfigItemWithMapCentric.dataSourceConfig = []
      return Promise.resolve(newDataSourceConfigItemWithMapCentric)
    }
  }

  const renderDataSettingWithMapCentric = () => {
    return (
      <div className='mt-2 data-setting-con-with-custom-search-source'>
        <SettingRow flow='wrap' role='group'>
          <MapWidgetSelector autoSelect onSelect={handleMapWidgetChange} useMapWidgetIds={useMapWidgetIds} />
        </SettingRow>
        {(useMapWidgetIds && useMapWidgetIds?.length > 0) && renderDataItemSettingWidthMapCentric(jimuMapViews)}
      </div>
    )
  }

  const getDataSourceConfigWithMapCentricFromAppConfig = (jimuMapViews: { [viewId: string]: JimuMapView }, config: IMConfig): IMDataSourceConfigWithMapCentric => {
    const dataSourceConfigWithMapCentric = config?.asMutable({ deep: true })?.dataSourceConfigWithMapCentric || {}
    const viewIds = Object.keys(jimuMapViews || {})
    if (dataSourceConfigWithMapCentric && Object.keys(dataSourceConfigWithMapCentric).length > 0) {
      Object.keys(dataSourceConfigWithMapCentric).forEach(key => {
        if (!viewIds.includes(key)) {
          //Clicking the undo button may cause inconsistencies `dataSourceConfigWithMapCentric` config and `jimuMapView`. https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/22732
          delete dataSourceConfigWithMapCentric[key]
        }
      })
      if (Object.keys(dataSourceConfigWithMapCentric).length > 0) {
        return Immutable(dataSourceConfigWithMapCentric)
      }
    }

    //When no `dataSourceConfigWithMapCentric` in widget config, should add a default dataSource config
    let defaultKeys
    const defaultDataSourceConfigWithMapCentric = {}
    Object.keys(jimuMapViews || {}).forEach(viewId => {
      !defaultKeys && (defaultKeys = viewId)
    })
    defaultDataSourceConfigWithMapCentric[defaultKeys] = {}
    return Immutable(defaultDataSourceConfigWithMapCentric) as any
  }

  const renderDataItemSettingWidthMapCentric = (jimuMapViews) => {
    const dataSourceConfigWithMapCentric = getDataSourceConfigWithMapCentricFromAppConfig(jimuMapViews, config)
    const lengthOfDataSourceConfigWithMapCentric = Object.keys(dataSourceConfigWithMapCentric).length

    const useCollapsablePanel = lengthOfDataSourceConfigWithMapCentric > 1
    if (!useCollapsablePanel) {
      return (
        <div className='mt-2'>
          {Object.keys(dataSourceConfigWithMapCentric).map(viewId => {
            const dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric[viewId]
            return renderSearchDataSettingItemWithMapCentric(dataSourceConfigItemWithMapCentric, viewId)
          })}
        </div>
      )
    } else {
      return (
        <div>
          {Object.keys(dataSourceConfigWithMapCentric).map(viewId => {
            if (viewId === DEFAULT_GEOCODE_KEY) return null
            const dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric[viewId]
            const jimuMapView = jimuMapViews?.[viewId]
            const isWebScene = jimuMapView?.view?.type === '3d'
            const mapDataSource = dsManager.getDataSource(jimuMapView?.dataSourceId)
            const mapDataSourceLabel = mapDataSource?.getLabel() || ''
            return (
              <div className='mt-3' key={viewId} role='group' aria-label={mapDataSourceLabel}>
                <div className='d-flex align-items-center'>
                  <SettingRow
                    label={<div className='d-flex align-items-center flex-grow-1'>
                      <div className='data-icon-con mr-2'>
                        {isWebScene ? <DataSceneOutlined/> : <DataMapOutlined/>}
                      </div>
                      <div className='flex-grow-1'>{mapDataSourceLabel}</div>
                    </div>}
                    className='w-100'
                    aria-label={mapDataSourceLabel}
                  >
                    <Button
                      className='layer-list-toggle-btn p-0 border-0'
                      type='tertiary'
                      icon={true}
                      size='sm'
                      onClick={() => { toggleSetting(viewId) }}
                      title={nls('expand')}
                      aria-label={nls('expand')}
                      aria-expanded={openSettingList?.[viewId] !== false}
                    >
                      {openSettingList?.[viewId] !== false ? <UpOutlined size={16} /> : <DownOutlined size={16} />}
                    </Button>
                  </SettingRow>
                </div>
                {openSettingList?.[viewId] !== false && renderSearchDataSettingItemWithMapCentric(dataSourceConfigItemWithMapCentric, viewId)}
              </div>
            )
          })}
        </div>
      )
    }
  }

  const renderSearchDataSettingItemWithMapCentric = (dataSourceConfigItemWithMapCentric: IMDataSourceConfigItemWithMapCentric, viewId: string) => {
    return (
      <div className='mt-2' key={viewId}>
        <SettingRow role='group' tag='label' aria-label={nls('customizeSearchSources')} label={nls('customizeSearchSources')}>
          <Switch disabled={!allViewsCreated} checked={(dataSourceConfigItemWithMapCentric?.synchronizeSettings as any) === false} title={nls('customizeSearchSources')} onChange={() => { handleSynchronizeSettingsChange(viewId) }}/>
        </SettingRow>
        {(dataSourceConfigItemWithMapCentric?.synchronizeSettings as any) === false && <SearchDataSetting
          hideEnableFiltering
          hideTitleOfNewSearchSource
          id={id}
          portalUrl={portalUrl}
          useDataSources={useDataSources}
          createOutputDs={true}
          viewId={viewId}
          onSettingChange={onDataSettingChange}
          onOutputDsSettingChange={createOutputDs}
          datasourceConfig={showLoadingList?.[viewId] ? Immutable([] as any) : dataSourceConfigItemWithMapCentric?.dataSourceConfig}
          searchDataSettingType={SearchDataType.Both}
          enableFiltering={config?.enableFiltering}
          onEnableFilteringChange={handleEnableFilteringChange}
          propsForDataSourceSelector={allPropsForDataSourceSelectorRef.current?.[viewId]}
          showSearchInCurrentMapExtentSetting
          showEnableLocalSearchSetting
        />}
        {showLoadingListRef.current?.[viewId] && <div className='position-relative mt-3 mb-3 loading-con'>
          <Loading type={LoadingType.Secondary}/>
        </div>}
      </div>
    )
  }

  const renderDataSettingWithCustomSearchSource = () => {
    return (
      <div className='data-setting-con-with-custom-search-source'>
        {showLoadingList?.[DEFAULT_GEOCODE_KEY] && <div className='position-relative mt-3 mb-3 loading-con'>
          <Loading type={LoadingType.Secondary}/>
        </div>}
        {!showLoadingList?.[DEFAULT_GEOCODE_KEY] && <SearchDataSetting
          id={id}
          portalUrl={portalUrl}
          useDataSources={useDataSources}
          createOutputDs={true}
          onSettingChange={onDataSettingChange}
          onOutputDsSettingChange={createOutputDs}
          datasourceConfig={config?.datasourceConfig}
          searchDataSettingType={SearchDataType.Both}
          enableFiltering={config?.enableFiltering}
          onEnableFilteringChange={handleEnableFilteringChange}
        />}
      </div>
    )
  }

  return (
    <div css={STYLE} className={classNames({ 'con-border': config?.sourceType === SourceType?.MapCentric && !showPlaceholder })}>
      <SettingSection className={classNames({'hide-padding-bottom': config?.sourceType !== SourceType?.MapCentric })} role='group' aria-label={nls('source')} title={nls('source')}>
        <div role='radiogroup' aria-label={nls('source')}>
          <SettingRow>
            <div className='d-flex align-items-center radio-con' onClick={() => { handleSearchSourceChange(SourceType.CustomSearchSources) }}>
              <Radio aria-label={nls('addCustomSearchSources')} checked={!config?.sourceType || config.sourceType === SourceType.CustomSearchSources}/>
              <div className='flex-grow-1 ml-1'>{nls('addCustomSearchSources')}</div>
            </div>
          </SettingRow>
          <SettingRow>
            <div className='d-flex align-items-center ' onClick={() => { handleSearchSourceChange(SourceType.MapCentric) }}>
              <Radio aria-label={nls('interactWithMapWidget')} checked={config?.sourceType === SourceType.MapCentric}/>
              <div className='flex-grow-1 ml-1'>{nls('interactWithMapWidget')}</div>
            </div>
          </SettingRow>
        </div>
        {config?.sourceType === SourceType.MapCentric && renderDataSettingWithMapCentric()}
        {(!config?.sourceType || config?.sourceType === SourceType.CustomSearchSources) && renderDataSettingWithCustomSearchSource()}
      </SettingSection>
      {(!showPlaceholder && config?.sourceType === SourceType.MapCentric) && <SettingSection>
        <SettingRow tag='label' label={nls('enableSearchFilter')}>
          <Switch
            checked={config?.enableFiltering}
            onChange={() => { handleEnableFilteringChange(!config?.enableFiltering) }}
            title={nls('enableSearchFilter')}
          />
        </SettingRow>
      </SettingSection>}
      {useMapWidgetIds?.[0] && <JimuMapViewComponent
        useMapWidgetId={useMapWidgetIds?.[0]}
        onViewsCreate={onViewsCreate}
      />}
    </div>
  )
}

export default CustomSearchDataSetting
