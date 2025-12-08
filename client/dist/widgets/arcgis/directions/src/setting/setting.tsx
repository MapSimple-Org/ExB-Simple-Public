/** @jsx jsx */
import { jsx, React, css, polished, lodash, type ImmutableArray, Immutable, DataSourceTypes, type DataSourceJson, classNames, type UseUtility, SupportedUtilityType, loadArcGISJSAPIModules, hooks, getAppStore, UtilityManager, AllDataSourceTypes, DataSourceManager, type IMDataSourceJson, type ImmutableObject, JSAPILayerTypes } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Select, Switch, Option, CollapsablePanel, Tooltip, Button } from 'jimu-ui'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow, SettingSection, SearchGeneralSetting, SearchDataSetting, SearchSuggestionSetting, SearchDataType, type IMSearchSuggestionConfig, type SearchDataConfig, type SearchSuggestionConfig, JimuLayerViewSelectorDropdown } from 'jimu-ui/advanced/setting-components'
import { addNewUtility, extractService, UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import mapOutlined from 'jimu-icons/svg/outlined/gis/data-map.svg'
import sceneOutlined from 'jimu-icons/svg/outlined/gis/data-scene.svg'

import defaultMessages from './translations/default'
import { type RouteConfig, type IMConfig, UnitOption } from '../config'
import { DEFAULT_ROUTE_URL, MAX_SUGGESTIONS } from '../constants'
import { getDirectionPointOutputDsId, getDirectionLineOutputDsId, getRouteOutputDsId, getStopOutputDsId, convertJSAPIFieldsToJimuFields, getDefaultOrgUnit } from '../utils'
import type { GeometryType } from '@esri/arcgis-rest-request'
import { type JimuLayerView, type JimuMapView, JimuMapViewComponent, MapViewManager } from 'jimu-arcgis'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { StopsSelector } from './components/stops-selector'

const { useMemo, useEffect, useState } = React
const DEFAULT_SEARCH_SUGGESTION_SETTINGS = {
  maxSuggestions: MAX_SUGGESTIONS
} as SearchSuggestionConfig
const supportedUtilityTypes = [SupportedUtilityType.Routing]

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { onSettingChange, id, config, useMapWidgetIds, useUtilities, portalUrl } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const routeConfig = config?.routeConfig
  const searchDataConfig = config.searchConfig?.dataConfig
  const searchGeneralConfig = config.searchConfig?.generalConfig
  const searchSuggestionConfig = useMemo(() => (Immutable(DEFAULT_SEARCH_SUGGESTION_SETTINGS).merge(config.searchConfig?.suggestionConfig || {})), [config.searchConfig?.suggestionConfig]) as IMSearchSuggestionConfig
  const configRef = React.useRef(null)
  const [defaultRouteUtilityId, setDefaultRouteUtilityId] = useState(null)
  const [isDefaultRouteUsed, setIsDefaultRouteUsed] = useState(false)
  const [jimuMapViews, setJimuMapViews] = useState<{ [jmvId: string]: JimuMapView }>(null)

  useEffect(() => {
    configRef.current = config
  }, [config])

  const onMapWidgetSelected = async (ids: string[]) => {
    const outputDsJsons = await getOutputDataSourceJsons(id, ids, translate)
    onSettingChange({
      id: id,
      useMapWidgetIds: ids
    }, outputDsJsons)
  }

  const onSearchDataSettingsChange = React.useCallback((settings: ImmutableArray<SearchDataConfig>) => {
    if (!lodash.isDeepEqual(settings, searchDataConfig)) {
      const newConfig = configRef.current.setIn(['searchConfig', 'dataConfig'], settings)
      onSettingChange({
        id: id,
        config: newConfig,
        useUtilities: getUsedUtilities(configRef.current?.routeConfig?.useUtility, settings?.filter(c => !!c.useUtility).map(c => c.useUtility)?.asMutable())
      })
    }
  }, [id, searchDataConfig, onSettingChange])

  const onSearchGeneralSettingsChange = (key: string[], hint: string) => {
    if (typeof hint === 'string' && hint !== searchGeneralConfig?.hint) {
      const generalConfig = config.searchConfig?.generalConfig || Immutable({})
      const newGeneralConfig = generalConfig.setIn(key, hint)
      onSettingChange({
        id: id,
        config: config.setIn(['searchConfig', 'generalConfig'], newGeneralConfig)
      })
    }
  }

  const onSearchSuggestionSettingsChange = (settings: IMSearchSuggestionConfig) => {
    if (!lodash.isDeepEqual(settings, searchSuggestionConfig)) {
      onSettingChange({
        id: id,
        config: config.setIn(['searchConfig', 'suggestionConfig'], settings)
      })
    }
  }

  const onRouteUtilityChange = (utilities: ImmutableArray<UseUtility>) => {
    if (utilities?.[0]?.utilityId !== routeConfig?.useUtility?.utilityId) {
      let newConfig = config
      // Only set the useUtility field when the new value is valid, otherwise, remove it
      if (utilities?.[0]) {
        newConfig = config.setIn(['routeConfig', 'useUtility'], utilities?.[0])
      } else {
        const newRouteConfig = config.getIn(['routeConfig']).without('useUtility')
        newConfig = config.setIn(['routeConfig'], newRouteConfig)
      }
      onSettingChange({
        id: id,
        config: newConfig,
        useUtilities: getUsedUtilities(utilities?.[0], config.searchConfig?.dataConfig?.map(c => c.useUtility)?.asMutable())
      })
    }
  }

  const onShowRuntimeLayersChange = (event) => {
    const showRuntimeLayers = event.target.checked
    onSettingChange({
      id: id,
      config: config.set('showRuntimeLayers', showRuntimeLayers)
    })
  }

  const onEnableRouteSavingChange = (event) => {
    const enableRouteSaving = event.target.checked
    onSettingChange({
      id: id,
      config: config.set('enableRouteSaving', enableRouteSaving)
    })
  }

  const onUnitOptionChange = (event) => {
    const unit = event.target.value
    onSettingChange({
      id: id,
      config: config.set('unit', unit)
    })
  }

  const hideNonPointDs = (dsJson: IMDataSourceJson) => {
    const ds = DataSourceManager.getInstance().getDataSource(dsJson.id)
    const geometryType: GeometryType = ds.getGeometryType()
    return geometryType !== "esriGeometryPoint"
  }

  const onBarrierLayersChange = (jmvId: string) => {
    return (jlvIds: string[]) => {
      if (jlvIds.length === 0) {
        onSettingChange({
          id: id,
          config: config.setIn(['routeConfig', 'barrierLayers'], config.getIn(['routeConfig', 'barrierLayers']).without(jmvId))
        })
      } else {
        onSettingChange({
          id: id,
          config: config.setIn(['routeConfig', 'barrierLayers', jmvId], jlvIds)
        })
      }
    }
  }

  const disableNonBarrierLayers = (jimuLayerView: JimuLayerView) => {
    const supportedFeatures = ['point', 'polyline', 'polygon']
    return !(jimuLayerView.type === JSAPILayerTypes.FeatureLayer && (supportedFeatures.includes((jimuLayerView.layer as __esri.FeatureLayer)?.geometryType)))
  }

  const hasMap = useMemo(() => useMapWidgetIds?.length > 0, [useMapWidgetIds])

  const ariaDescId = `${id}-desc`

  useEffect(() => {
    const validSearchDataConfig = searchDataConfig && getValidSearchDataConfig(searchDataConfig, useUtilities)
    const validRouteConfig = routeConfig && getValidRouteConfig(routeConfig, useUtilities)

    if (!lodash.isDeepEqual(validSearchDataConfig, searchDataConfig) || !lodash.isDeepEqual(validRouteConfig, routeConfig)) {
      onSettingChange({
        id: id,
        config: config.setIn(['searchConfig', 'dataConfig'], validSearchDataConfig).setIn(['routeConfig'], validRouteConfig),
        useUtilities: getUsedUtilities(validRouteConfig?.useUtility, validSearchDataConfig?.map(c => c.useUtility)?.asMutable())
      })
    }
  }, [config, id, onSettingChange, routeConfig, searchDataConfig, useUtilities])

  useEffect(() => {
    // Add org route utility if it is not added
    if (defaultRouteUtilityId) {
      return
    }
    const routingUtility = getAllRoutingUtility(translate)
    // Skip if can not get any route utility
    if (!routingUtility || routingUtility.length === 0) {
      return
    }
    const utility = routingUtility[0]
    addNewUtility(utility)
    const uid = UtilityManager.getInstance().getIdOfOrgUtility(utility.name, utility.url, utility.index, utility.label)
    if (!defaultRouteUtilityId && uid) {
      setDefaultRouteUtilityId(uid)
    }
  }, [defaultRouteUtilityId, translate])

  hooks.useEffectWithPreviousValues((prevValue) => {
    const [oldConfig] = prevValue as any
    if (oldConfig?.routeConfig && !config?.routeConfig) {
      return
    }
    // Use added default route utility if no route utility is chosen
    if (defaultRouteUtilityId && !config?.routeConfig && !isDefaultRouteUsed) {
      const useUtility = {
        utilityId: defaultRouteUtilityId
      }
      onSettingChange({
        id: id,
        config: config.setIn(['routeConfig', 'useUtility'], useUtility),
        useUtilities: getUsedUtilities(useUtility, config.searchConfig?.dataConfig?.map(c => c.useUtility)?.asMutable())
      })
      setIsDefaultRouteUsed(true)
    }
  }, [config, isDefaultRouteUsed, defaultRouteUtilityId, id, onSettingChange, translate])

  return (
    <div className='widget-setting-directions jimu-widget-setting' css={style}>
      <SettingSection title={translate('selectMapWidget')} className={classNames({ 'border-0': !hasMap })}>
        <SettingRow>
          <MapWidgetSelector onSelect={onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} />
        </SettingRow>
      </SettingSection>
      {
        hasMap
          ? <div>
            <JimuMapViewComponent
              useMapWidgetId={useMapWidgetIds?.[0]}
              onViewsChange={(views) => {
                const onlyHasDefaultView = Object.keys(views).length === 1 && Object.keys(views)[0] === `${useMapWidgetIds?.[0]}-`
                setJimuMapViews(onlyHasDefaultView ? null : views)
              }}
            />
            <SettingSection role='group' aria-label={translate('routeSettings')} title={translate('routeSettings')}>
              <SettingRow flow='wrap' label={translate('routeUrl')}>
                <UtilitySelector
                  useUtilities={Immutable(routeConfig?.useUtility && useUtilities?.some(u => routeConfig.useUtility.utilityId === u.utilityId) ? [routeConfig.useUtility] : [])}
                  onChange={onRouteUtilityChange}
                  showRemove
                  closePopupOnSelect
                  types={supportedUtilityTypes}
                  aria-describedby={ariaDescId}
                />
              </SettingRow>
              <SettingRow className='mt-0'>
                <i className='text-break example-url' id={ariaDescId}>
                  {translate('exampleUrl', { url: DEFAULT_ROUTE_URL })}
                </i>
              </SettingRow>
              <SettingRow flow='wrap' label={translate('presetStops')}>
                <StopsSelector
                  directionsProps={props}
                  buttonLabel={translate('specifyStops')}
                  title={translate('specifyStops')}
                  id={props.useMapWidgetIds?.[0]}
                  jimuMapConfig={getAppStore().getState().appStateInBuilder.appConfig.widgets[props.useMapWidgetIds?.[0]].config}
                  useDataSources={getAppStore().getState().appStateInBuilder.appConfig.widgets[props.useMapWidgetIds?.[0]].useDataSources}
                ></StopsSelector>
              </SettingRow>
              {
                jimuMapViews &&
                <SettingRow flow='no-wrap' label={translate('barrierLayers')} >
                  <Tooltip title={translate('barrierDescription')}>
                    <Button icon variant='text' disableHoverEffect disableRipple className='p-0'>
                      <InfoOutlined></InfoOutlined>
                    </Button>
                  </Tooltip>
                </SettingRow>
              }
              <SettingRow flow='wrap' className='mt-2'>
                {
                  jimuMapViews && (hasMultipleJimuMapViews(jimuMapViews) ?
                    Object.keys(jimuMapViews).map(jmvId => {
                      return <CollapsablePanel
                        leftIcon={jimuMapViews[jmvId].view.type === '2d' ? mapOutlined : sceneOutlined}
                        key={jmvId}
                        label={getJmvLabel(jmvId)}
                      >
                        <JimuLayerViewSelectorDropdown
                          jimuMapViewId={jmvId}
                          onChange={onBarrierLayersChange(jmvId)}
                          selectedValues={routeConfig?.barrierLayers?.[jmvId]?.asMutable()}
                          isMultiSelection
                          autoHeight
                          disableLayers={disableNonBarrierLayers}
                        />
                      </CollapsablePanel>
                    })
                    :
                    <JimuLayerViewSelectorDropdown
                      jimuMapViewId={Object.keys(jimuMapViews)[0]}
                      onChange={onBarrierLayersChange(Object.keys(jimuMapViews)[0])}
                      selectedValues={routeConfig?.barrierLayers?.[Object.keys(jimuMapViews)[0]]?.asMutable()}
                      isMultiSelection
                      autoHeight
                      disableLayers={disableNonBarrierLayers}
                    />
                  )
                }
              </SettingRow>
            </SettingSection>
            <SettingSection role='group' aria-label={translate('searchSettings')} title={translate('searchSettings')} className='search-settings'>
              <SearchDataSetting id={id} datasourceConfig={searchDataConfig as unknown as ImmutableArray<SearchDataConfig>}
                createOutputDs={false} portalUrl={portalUrl}
                searchDataSettingType={SearchDataType.Both} onSettingChange={onSearchDataSettingsChange}
                autoSelectAllOrgGeocodeService
                hideIconSetting
                hideEnableFiltering
                showSearchInCurrentMapExtentSetting
                supportedDsTypes={[AllDataSourceTypes.FeatureLayer]}
                hideDs={hideNonPointDs}
              />
              <SearchGeneralSetting id={id} hint={searchGeneralConfig?.hint} onGeneralSettingChange={onSearchGeneralSettingsChange} />
              <SearchSuggestionSetting id={id} settingConfig={searchSuggestionConfig} onSettingChange={onSearchSuggestionSettingsChange} hideRecentSearchSetting={true} />
            </SettingSection>
            <SettingSection role='group' aria-label={translate('generalSettings')} title={translate('generalSettings')} className='general-settings'>
              <SettingRow flow='wrap' tag='label' label={translate('unitSystem')}>
                <Select value={config?.unit ?? getDefaultOrgUnit()} onChange={onUnitOptionChange}>
                  <Option value={UnitOption.Metric}>
                    {translate('unitsLabelMetric')}
                  </Option>
                  <Option value={UnitOption.Imperial}>
                    {translate('unitsLabelImperial')}
                  </Option>
                </Select>
              </SettingRow>
              <SettingRow tag='label' label={translate('enableRouteSaving')}>
                <Switch
                  checked={config?.enableRouteSaving ?? true}
                  onChange={onEnableRouteSavingChange}
                />
              </SettingRow>
              <SettingRow tag='label' label={translate('showRoutesInLayerLists')}>
                <Switch
                  checked={config?.showRuntimeLayers ?? true}
                  onChange={onShowRuntimeLayersChange}
                />
              </SettingRow>
            </SettingSection>
          </div>
          : <div className='d-flex justify-content-center align-items-center placeholder-container'>
              <div className='text-center'>
                <ClickOutlined size={48} className='d-inline-block placeholder-icon mb-2' />
                <p className='placeholder-hint'>{translate('selectMapHint')}</p>
              </div>
            </div>
      }
    </div>
  )
}

export default Setting

const style = css`
.route-url-input{
  min-height: ${polished.rem(100)}
}
.example-url{
  font-size: ${polished.rem(12)};
  color: var(--ref-palette-neutral-1000);
}
.warning-icon{
  color: var(--sys-color-error-main);
}
.warning-hint{
  width: calc(100% - 20px);
  margin: 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--sys-color-error-main);
}
.placeholder-container{
  height: calc(100% - 100px);
  .placeholder-hint{
    font-size: ${polished.rem(14)};
    font-weight: 500;
    color: var(--ref-palette-neutral-1000);
    max-width: ${polished.rem(160)};
  }
  .placeholder-icon{
    color: var(--ref-palette-neutral-800);
  }
}
.search-settings{
  >div>div {
    padding-left: 0 !important;
    padding-right: 0 !important;
    padding-top: 0 !important;
    border: 0 !important;
  }
}
`

async function getOutputDataSourceJsons (widgetId: string, mapWidgetIds: string[], translate: (id: string) => string): Promise<DataSourceJson[]> {
  // If do not have used map widget, won't generate any output data sources.
  if (!mapWidgetIds || mapWidgetIds.length === 0) {
    return Promise.resolve([])
  }
  try {
    const [Stop, DirectionPoint, DirectionLine, RouteInfo] = await loadArcGISJSAPIModules(['esri/rest/support/Stop', 'esri/rest/support/DirectionPoint', 'esri/rest/support/DirectionLine', 'esri/rest/support/RouteInfo'])
    return [
      {
        id: getStopOutputDsId(widgetId),
        label: translate('outputStops'),
        type: DataSourceTypes.FeatureLayer,
        isOutputFromWidget: true,
        geometryType: 'esriGeometryPoint',
        schema: {
          idField: Stop.fields.find(f => f.type === 'esriFieldTypeOID')?.name || '__OBJECTID',
          fields: { ...convertJSAPIFieldsToJimuFields(Stop.fields) }
        }
      },
      {
        id: getDirectionPointOutputDsId(widgetId),
        label: translate('outputDirectionPoints'),
        type: DataSourceTypes.FeatureLayer,
        isOutputFromWidget: true,
        geometryType: 'esriGeometryPoint',
        schema: {
          idField: DirectionPoint.fields.find(f => f.type === 'esriFieldTypeOID')?.name || '__OBJECTID',
          fields: { ...convertJSAPIFieldsToJimuFields(DirectionPoint.fields) }
        }
      },
      {
        id: getDirectionLineOutputDsId(widgetId),
        label: translate('outputDirectionLines'),
        type: DataSourceTypes.FeatureLayer,
        isOutputFromWidget: true,
        geometryType: 'esriGeometryPolyline',
        schema: {
          idField: DirectionLine.fields.find(f => f.type === 'esriFieldTypeOID')?.name || '__OBJECTID',
          fields: { ...convertJSAPIFieldsToJimuFields(DirectionLine.fields) }
        }
      },
      {
        id: getRouteOutputDsId(widgetId),
        label: translate('outputRoute'),
        type: DataSourceTypes.FeatureLayer,
        isOutputFromWidget: true,
        geometryType: 'esriGeometryPolyline',
        schema: {
          idField: RouteInfo.fields.find(f => f.type === 'esriFieldTypeOID')?.name || '__OBJECTID',
          fields: { ...convertJSAPIFieldsToJimuFields(RouteInfo.fields) }
        }
      }
    ]
  } catch (err) {
    console.warn('Failed to create output data source in directions widget. ', err)
    return Promise.resolve([])
  }
}

function getUsedUtilities (routeUtility: UseUtility, searchUtilities: UseUtility[]): UseUtility[] {
  return (routeUtility ? [routeUtility] : []).concat(searchUtilities).filter(u => !!u)
}

function getValidSearchDataConfig(searchDataConfig: ImmutableArray<SearchDataConfig>, useUtilities: ImmutableArray<UseUtility>) {
  return searchDataConfig.filter(searchConfig => {
    if (searchConfig.useDataSource) {
      // Layer source case
      return true
    } else {
      // Utility case, filter out utilities in the useUtility
      return useUtilities.some(useUtility => useUtility.utilityId === searchConfig?.useUtility?.utilityId)
    }
  })
}

function getValidRouteConfig(routeConfig: ImmutableObject<RouteConfig>, useUtilities: ImmutableArray<UseUtility>) {
  if (routeConfig && routeConfig.useUtility && useUtilities.some(useUtility => useUtility.utilityId === routeConfig.useUtility.utilityId)) {
    return routeConfig
  }
  return routeConfig.without('useUtility')
}

function getAllRoutingUtility (nls) {
  const helperServices = getAppStore().getState().portalSelf?.helperServices
  return extractService(helperServices, SupportedUtilityType.Routing, null, null, nls)
}

function hasMultipleJimuMapViews(mapViews) {
  if (!mapViews) {
    return false
  }
  return Object.keys(mapViews).length > 1
}

function getJmvLabel(jmvId: string) {
  const jmv = MapViewManager.getInstance().getJimuMapViewById(jmvId)
  return jmv.getMapDataSource().getLabel()
}