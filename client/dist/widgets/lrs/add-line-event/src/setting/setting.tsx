/** @jsx jsx */
import { Immutable, type ImmutableArray, type ImmutableObject, React, jsx } from 'jimu-core'
import { Select, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { SettingChangeFunction, AllWidgetSettingProps } from 'jimu-for-builder'
import {
  LrsLayerType,
  isDefined,
  EmptyPlaceholder,
  ModeType,
  lrsDefaultMessages,
  getLayersByType,
  LrsLoader,
  type LrsLayer,
  type MapViewConfig,
  getDefaultNetwork,
  getDefaultEvent,
  updateDefaultForMapMode,
  getAttributeSets,
  getDefaultAttributeSet
} from 'widgets/shared-code/lrs'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { LayerConfig } from './layer-config'
import { DefaultSettings } from './default-settings'
import { constructSettingsPerView, resetConfig, setValuesForView } from '../common/utils'
import { DisplaySettings } from './display-settings'
import { ConcurrencySettings } from './concurrency-settings'

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

  const hasEventConfig =
    (!isMapMode && config.eventLayers && config.eventLayers.length !== 0) ||
    (isMapMode &&
      config.settingsPerView &&
      config.settingsPerView[mapViewIdMapSettings] &&
      config.settingsPerView[mapViewIdMapSettings].eventLayers.length > 0)

  const supportedLrsTypes = Immutable([
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
      console.log('useConfigRef.current', useConfigRef.current)
    }
  }, [config])

  const updateWidgetJson: SettingChangeFunction = React.useCallback((...args) => {
    const [changedWidgetJson, ...restArgs] = args
    const widgetJson = Object.assign({
      id: id,
      ...changedWidgetJson
    })
    onSettingChange(widgetJson, ...restArgs)
  },[id, onSettingChange])

  const handleMapWidgetIdUpdated = (values: string[], mode: ModeType) => {
    props.onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),
      useMapWidgetIds: values
    })
  }

  const handleReset = React.useCallback((mode: ModeType) => {
    onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),
      useDataSources: []
    })
  }, [config, onSettingChange, widgetId])

  const handleSelectionChanged = React.useCallback((index: number, mapId: string) => {
    setSelectedIndex(index)
    if (isMapMode && mapId !== '') {
      setMapViewIdLayerSettings(mapId)
    }
  }, [isMapMode])

  const onMapSelectionChanged = React.useCallback((event) => {
    const selectedMapId = event.target.value
    setMapViewIdMapSettings(selectedMapId)
  }, [])

  const handleLrsLayersUpdated = React.useCallback(async (lrsLayers: ImmutableArray<LrsLayer>, allDataSources: any) => {
    // Update the configuration with the new LRS layers
    let updatedConfig = config.set('lrsLayers', lrsLayers)

    // Update the network, event, and intersection layers based on the new LRS layers
    const { networks, lineEvents, intersections } = getLayersByType(lrsLayers, Immutable([]))
    updatedConfig = updatedConfig
      .set('networkLayers', networks)
      .set('eventLayers', lineEvents)
      .set('intersectionLayers', intersections)

    if (networks.length > 0) {
      const network = updatedConfig.lrsLayers.find((layer) => layer.layerType === LrsLayerType.Network)
      if (isDefined(network)) {
        const lineAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl, true)
        const defaultAttributeSet = getDefaultAttributeSet(Immutable(lineAttributeSets), '', false)
        updatedConfig = updatedConfig
          .setIn(['attributeSets'], lineAttributeSets)
          .setIn(['defaultAttributeSet'], defaultAttributeSet)
      }
    }

    const defaultNetwork = getDefaultNetwork(updatedConfig.lrsLayers, updatedConfig.defaultNetwork)
    const defaultEvent = getDefaultEvent(updatedConfig.lrsLayers, updatedConfig.defaultEvent, false)

    updatedConfig = updatedConfig.set('defaultNetwork', defaultNetwork).set('defaultEvent', defaultEvent)
    // Save the updated configuration and data sources
    updateWidgetJson({
      config: updatedConfig,
      useDataSources: Object.values(allDataSources.useDataSourceMap)
    })
  },[config, portalUrl, updateWidgetJson])

  const isRunning = React.useRef(false)
  const waitForSemaphore = async () => {
    while (isRunning.current) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
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

            //Handle conflict prevention and attribute sets
            if (networks.length > 0) {
              const network = mapViewConfig.lrsLayers.find((layer) => layer.layerType === LrsLayerType.Network)
              if (isDefined(network)) {
                try {
                  const lineAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl, true)
                  const defaultAttributeSet = getDefaultAttributeSet(Immutable(lineAttributeSets), '', false)
                  settingForView = settingForView
                    .setIn(['attributeSets'], lineAttributeSets)
                    .setIn(['defaultAttributeSet'], defaultAttributeSet)
                } catch (error) {
                  console.error('Error fetching conflict prevention or attribute sets:', error)
                }
              }
            }

            settingForView = await setValuesForView(settingForView, mapViewConfig.lrsLayers, false)
            settingForView = updateDefaultForMapMode(settingForView, mapViewConfig, LrsLayerType.Network, 'defaultNetwork')
            settingForView = updateDefaultForMapMode(settingForView, mapViewConfig, LrsLayerType.Event,'defaultEvent', false)

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
        console.log('useConfigRef.current load', useConfigRef.current)

        isRunning.current = false
      }
    }, [mapViewIdLayerSettings, portalUrl, updateWidgetJson])

  return (
    <div className="setting-add-line-event h-100">
      <div className="jimu-widget-setting setting-add-line-event__setting-content h-100">
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
          onLrsLayersUpdated={handleLrsLayersUpdated}
          onMapViewsConfigUpdated={handleMapViewsConfigUpdated}
          onMapWidgetSelected={handleMapWidgetIdUpdated}
          onReset={handleReset}
          onSelectionChanged={handleSelectionChanged}
        >
          {selectedIndex > -1 && (
            <LayerConfig
              widgetId={widgetId}
              config={config}
              index={selectedIndex}
              activeMapViewId={mapViewIdLayerSettings}
              onSettingChange={onSettingChange}
            />
          )}
        </LrsLoader>
        {hasMap && hasEventConfig && (
          <React.Fragment>
            {Object.keys(idToNameMap).length > 1 && (
              <SettingSection role="none">
                <SettingRow flow="wrap" label={getI18nMessage('selectMapToEditSettings')}>
                  <Select className="w-100" size="sm" value={mapViewIdMapSettings} onChange={onMapSelectionChanged}>
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
            <DefaultSettings
              intl={intl}
              widgetId={widgetId}
              config={config}
              activeMapViewId={mapViewIdMapSettings}
              onSettingChange={onSettingChange}
            />
            <DisplaySettings
              intl={intl}
              widgetId={widgetId}
              config={config}
              activeMapViewId={mapViewIdMapSettings}
              onSettingChange={onSettingChange}
            />
            <ConcurrencySettings
              intl={intl}
              widgetId={widgetId}
              config={config}
              activeMapViewId={mapViewIdMapSettings}
              onSettingChange={onSettingChange}
            />
          </React.Fragment>
        )}
        {!isMapMode && !hasConfig && !hasEventConfig && <EmptyPlaceholder isMapMode={false} />}
        {isMapMode && !hasMap && <EmptyPlaceholder isMapMode={true} />}
      </div>
    </div>
  )
}

export default Setting
