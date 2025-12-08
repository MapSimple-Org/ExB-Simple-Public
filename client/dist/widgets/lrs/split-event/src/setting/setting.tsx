/** @jsx jsx */
import {
  Immutable,
  type ImmutableArray,
  type ImmutableObject,
  React,
  jsx
} from 'jimu-core'
import {
  type LrsLayer,
  LrsLayerType,
  lrsDefaultMessages,
  ModeType,
  getLayersByType,
  getDefaultEvent,
  type MapViewConfig,
  updateDefaultForMapMode,
  LrsLoader,
  EmptyPlaceholder
} from 'widgets/shared-code/lrs'
import { Select, defaultMessages as jimuUIDefaultMessages, hooks } from 'jimu-ui'
import type { SettingChangeFunction, AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { constructSettingsPerView, resetConfig, setValuesForView } from '../common/utils'
import { LayerConfig } from './layer-config'
import { DefaultSettings } from './default-settings'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { id, intl, widgetId, config, useMapWidgetIds, portalUrl, theme, onSettingChange } = props

  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [mapViewIdMapSettings, setMapViewIdMapSettings] = React.useState<string>('')
  const [mapViewIdLayerSettings, setMapViewIdLayerSettings] = React.useState<string>('')
  const [idToNameMap, setIdToNameMap] = React.useState<{ [key: string]: string }>({})

  const useConfigRef = React.useRef(config)

  const isMapMode = config.mode === ModeType.Map
  const hasMap = useMapWidgetIds?.length > 0

  const hasConfig =
    (!isMapMode && config.lrsLayers.length > 0) ||
    (isMapMode && config.mapViewsConfig && Object.keys(config.mapViewsConfig).length > 0)
  const hasLrsConfig =
    (!isMapMode && config.lrsLayers && config.lrsLayers.length !== 0) ||
    (isMapMode &&
      config.settingsPerView &&
      config.settingsPerView[mapViewIdMapSettings])
  const supportedLrsTypes = Immutable([
    LrsLayerType.Event,
    LrsLayerType.Event,
    LrsLayerType.LineEvent,
    LrsLayerType.Network,
    LrsLayerType.Intersection
  ])
  const requiredLrsTypes = Immutable([
    LrsLayerType.LineEvent,
    LrsLayerType.Network
  ])
  const getI18nMessage = hooks.useTranslate(defaultMessages, jimuUIDefaultMessages, lrsDefaultMessages)

  //#region useEffects
  React.useEffect(() => {
    if (config.mode === undefined) {
      const newMode = config.lrsLayers.length > 0 ? ModeType.Layer : ModeType.Map
      props.onSettingChange({
        id: widgetId,
        config: config.set('mode', newMode)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (config) {
      useConfigRef.current = config
    }
  }, [config])
  //#endregion

  //#region utility
  const updateWidgetJson: SettingChangeFunction = React.useCallback((...args) => {
    const [changedWidgetJson, ...restArgs] = args
    const widgetJson = Object.assign({id: id, ...changedWidgetJson })
    onSettingChange(widgetJson, ...restArgs)
  }, [id, onSettingChange])

  const onMapSelectionChanged = React.useCallback((event) => {
    const selectedMapId = event.target.value
    setMapViewIdMapSettings(selectedMapId)
  }, [])
  //#endregion

  //#region LrsLoader
  const handleMapWidgetIdUpdated = (values: string[], mode: ModeType) => {
    props.onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),
      useMapWidgetIds: values,
    })
  }

  const handleReset = React.useCallback((mode: ModeType) => {
    onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),
      useDataSources: [],
    })
  }, [config, onSettingChange, widgetId])

  const handleSelectionChanged = React.useCallback((index: number, mapId: string) => {
    setSelectedIndex(index)
    if (isMapMode && mapId !== '') {
      setMapViewIdLayerSettings(mapId)
    }
  }, [isMapMode])

  const handleLrsLayersUpdated = React.useCallback((lrsLayers: ImmutableArray<LrsLayer>, allDataSources: any) => {

    // Update the configuration with the new LRS layers
    let updatedConfig = config.set('lrsLayers', lrsLayers)

    // Update the network, event, and intersection layers based on the new LRS layers
    const { networks, lineEvents, intersections } = getLayersByType(lrsLayers, Immutable([]))
    updatedConfig = updatedConfig
      .set('networkLayers', networks)
      .set('eventLayers', lineEvents)
      .set('intersectionLayers', intersections)

    const defaultEvent = getDefaultEvent(updatedConfig.lrsLayers, updatedConfig.defaultEvent, false)
    updatedConfig = updatedConfig.set('defaultEvent', defaultEvent)

    // Save the updated configuration and data sources
    updateWidgetJson({
      config: updatedConfig,
      useDataSources: Object.values(allDataSources.useDataSourceMap)
    })
  }, [config, updateWidgetJson])

  const isRunning = React.useRef(false)
  const waitForSemaphore = async () => {
    while (isRunning.current) {
      await new Promise((resolve) => setTimeout(resolve, 10)) // Wait for 10ms before checking again
    }
  }

  const handleMapViewsConfigUpdated = React.useCallback(async (
      mapViewsConfig: ImmutableObject<{ [jimuMapViewId: string]: ImmutableObject<MapViewConfig> }>,
      mapIdToNameMap: { [key: string]: string },
      allDataSources: any,
      update: boolean
    ) => {
    // Wait for the semaphore to be released
    // This prevents multiple calls to this function from running at the same time
    await waitForSemaphore()
    isRunning.current = true

    let updatedConfig = useConfigRef.current
    try {
      for (const mapId in mapViewsConfig) {
        if (!update) {
          if (mapViewIdLayerSettings === '') {
            setMapViewIdMapSettings(mapId)
          }
          setIdToNameMap(mapIdToNameMap)
        } else {
          // Update the configuration with the new map views configuration
          updatedConfig = updatedConfig.set('mapViewsConfig', mapViewsConfig)

          // Update the LRS layers for the specific map view
          const mapViewConfig = mapViewsConfig[mapId]
          let settingForView = useConfigRef.current.settingsPerView?.[mapId] || constructSettingsPerView()

          const { networks, lineEvents, intersections } = getLayersByType(mapViewConfig.lrsLayers, mapViewConfig.disabledLayerIds)
          settingForView = settingForView
            .setIn(['networkLayers'], networks)
            .setIn(['eventLayers'], lineEvents)
            .setIn(['intersectionLayers'], intersections)

          settingForView = setValuesForView(settingForView, mapViewConfig.lrsLayers, false)
          settingForView = updateDefaultForMapMode(settingForView, mapViewConfig, LrsLayerType.Event, 'defaultEvent', false)

          if (!updatedConfig?.settingsPerView) {
            updatedConfig = updatedConfig.set('settingsPerView', Immutable({}))
          }
          const settingsPerView = updatedConfig.settingsPerView.set(mapId, settingForView)
          updatedConfig = updatedConfig.set('settingsPerView', settingsPerView)


          if (mapViewIdLayerSettings === '') {
            setMapViewIdMapSettings(mapId)
          }
          setIdToNameMap(mapIdToNameMap)
        }
      }
      updateWidgetJson({
        config: updatedConfig,
        useDataSources: Object.values(allDataSources.useDataSourceMap)
      })
    } finally {
      // Release the semaphore
      useConfigRef.current = updatedConfig
      isRunning.current = false
    }
  }, [mapViewIdLayerSettings, updateWidgetJson])
 //#endregion

  return (
    <div className='setting-add-point-event h-100'>
      <div className='jimu-widget-setting setting-add-point-event__setting-content h-100'>
        <LrsLoader
          intl={intl}
          portalUrl={portalUrl}
          theme={theme}
          widgetId={widgetId}
          mode={config.mode}
          useMapWidgetIds={useMapWidgetIds}
          lrsLayers={config.lrsLayers}
          mapViewsConfig={config.mapViewsConfig}
          supportedLrsTypes={supportedLrsTypes}
          requiredLrsTypes={requiredLrsTypes}
          outputDataSourceWidgetType='sld'
          onLrsLayersUpdated={handleLrsLayersUpdated}
          onMapViewsConfigUpdated={handleMapViewsConfigUpdated}
          onMapWidgetSelected={handleMapWidgetIdUpdated}
          onReset={handleReset}
          onSelectionChanged={handleSelectionChanged}>
          {selectedIndex > -1 &&
            <LayerConfig
              widgetId={widgetId}
              config={config}
              index={selectedIndex}
              activeMapViewId={mapViewIdLayerSettings}
              onSettingChange={onSettingChange}
            />
          }
        </LrsLoader>
        {hasMap && hasLrsConfig && (
          <React.Fragment>
            {Object.keys(idToNameMap).length > 1 && (
              <SettingSection role='none'>
                <SettingRow flow='wrap' label={getI18nMessage('selectMapToEditSettings')}>
                  <Select className='w-100' size='sm' value={mapViewIdMapSettings} onChange={onMapSelectionChanged}>
                    {Object.keys(idToNameMap).map((mapId) => {
                      return (
                        <option key={mapId} value={mapId}>
                          {idToNameMap[mapId]}
                        </option>
                      )
                    })}
                  </Select>
                </SettingRow>
              </SettingSection>
            )}
          </React.Fragment>
        )}
        {hasConfig && hasLrsConfig && (
          <React.Fragment>
            <DefaultSettings intl={intl} widgetId={widgetId} config={config} activeMapViewId={mapViewIdMapSettings} onSettingChange={onSettingChange} />
          </React.Fragment>
        )}
        {!isMapMode && !hasConfig && !hasLrsConfig && <EmptyPlaceholder isMapMode={false} />}
        {isMapMode && !hasMap && <EmptyPlaceholder isMapMode={true} />}
      </div>
    </div>
  )
}

export default Setting