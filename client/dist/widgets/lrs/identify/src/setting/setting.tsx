/** @jsx jsx */
import {
  Immutable,
  React,
  jsx,
  type ImmutableArray,
  type ImmutableObject,

} from 'jimu-core'
import type { SettingChangeFunction, AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import {
  EmptyPlaceholder,
  getAttributeSets,
  getDefaultAttributeSet,
  getDefaultEvent,
  getDefaultNetwork,
  getLayersByType,
  isDefined,
  lrsDefaultMessages,
  type LrsLayer,
  LrsLayerType,
  LrsLoader,
  type MapViewConfig,
  ModeType,
  updateDefaultForMapMode
} from 'widgets/shared-code/lrs'
import defaultMessages from './translations/default'
import type { IMConfig } from '../config'
import { hooks, defaultMessages as jimuUIDefaultMessages, Select } from 'jimu-ui'
import { constructSettingsPerView, resetConfig, setValuesForView } from '../common/utils'
import { LayerConfig } from './componenets/layer-item-config'
import { DefaultSettings } from './componenets/default-settings'
export type ValueManSetByKeyType = [string, any, { [optionKey: string]: any }?] // represents: [key, value, options]

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { id, intl, widgetId, config, useMapWidgetIds, portalUrl, theme, onSettingChange } = props

  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [mapViewIdMapSettings, setMapViewIdMapSettings] = React.useState<string>('')
  const [mapViewIdLayerSettings, setMapViewIdLayerSettings] = React.useState<string>('')
  const [idToNameMap, setIdToNameMap] = React.useState<{ [key: string]: string }>({})

  const useConfigRef = React.useRef(config)

  const isMapMode = config.mode === ModeType.Map
  const hasMap = useMapWidgetIds?.length > 0

  const hasConfig = (!isMapMode && config.lrsLayers.length > 0) || (isMapMode && config.mapViewsConfig && Object.keys(config.mapViewsConfig).length > 0)
  const hasEventConfig =
    (!isMapMode && config.eventLayers && config.eventLayers.length !== 0) ||
    (isMapMode && config.settingsPerView && config.settingsPerView[mapViewIdMapSettings] && config.settingsPerView[mapViewIdMapSettings].eventLayers.length > 0)
  const supportedLrsTypes = Immutable([
    LrsLayerType.Event,
    LrsLayerType.LineEvent,
    LrsLayerType.PointEvent,
    LrsLayerType.Network,
    LrsLayerType.Intersection
  ])
  const requiredLrsTypes = Immutable([LrsLayerType.Network])
  const getI18nMessage = hooks.useTranslate(defaultMessages, jimuUIDefaultMessages, lrsDefaultMessages)

  React.useEffect(() => {
    if (config.mode === undefined) {
      const newMode = config.lrsLayers.length > 0 ? ModeType.Layer : ModeType.Map
      props.onSettingChange({
        id: widgetId,
        config: config.set('mode', newMode),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (config) {
      useConfigRef.current = config
    }
  }, [config])

  const updateWidgetJson: SettingChangeFunction = React.useCallback(
    (...args) => {
      const [changedWidgetJson, ...restArgs] = args
      const widgetJson = Object.assign({
        id: id,
        ...changedWidgetJson,
      })
      onSettingChange(widgetJson, ...restArgs)
    },
    [id, onSettingChange]
  )

  const handleMapWidgetIdUpdated = (values: string[], mode: ModeType) => {
    props.onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),

      useMapWidgetIds: values,
    })
  }

  const handleReset = React.useCallback(
    (mode: ModeType) => {
      onSettingChange({
        id: widgetId,
        config: resetConfig(config, mode),
        useDataSources: [],
      })
    },
    [config, onSettingChange, widgetId]
  )

  const handleSelectionChanged = React.useCallback(
    (index: number, mapId: string) => {
      setSelectedIndex(index)
      if (isMapMode && mapId !== '') {
        setMapViewIdLayerSettings(mapId)
      }
    },
    [isMapMode]
  )

  const onMapSelectionChanged = React.useCallback((event) => {
    const selectedMapId = event.target.value
    setMapViewIdMapSettings(selectedMapId)
  }, [])

  const handleLrsLayersUpdated = React.useCallback(
    async (lrsLayers: ImmutableArray<LrsLayer>, allDataSources: any) => {
      // Update the configuration with the new LRS layers
      let updatedConfig = config.set('lrsLayers', lrsLayers)

      // Update the network, event, and intersection layers based on the new LRS layers
      const { networks, lineEvents, pointEvents } = getLayersByType(lrsLayers, Immutable([]))
      const allEvents = [...lineEvents, ...pointEvents]
      updatedConfig = updatedConfig.set('networkLayers', networks).set('eventLayers', allEvents)

      if (networks.length > 0) {
        const network = updatedConfig.lrsLayers.find((layer) => layer.layerType === LrsLayerType.Network)
        if (isDefined(network)) {
          const allAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl, false)
          const defaultPointAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), updatedConfig.defaultPointAttributeSet, true)
          const defaultLineAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), updatedConfig.defaultLineAttributeSet, false)

          updatedConfig = updatedConfig.setIn(['attributeSets'], allAttributeSets)
            .setIn(['defaultPointAttributeSet'], defaultPointAttributeSet)
            .setIn(['defaultLineAttributeSet'], defaultLineAttributeSet)
        }
      }
      const defaultNetwork = getDefaultNetwork(updatedConfig.lrsLayers, updatedConfig.defaultNetwork)
      const defaultEvent = getDefaultEvent(updatedConfig.lrsLayers, updatedConfig.defaultEvent, true)
      updatedConfig = updatedConfig.set('defaultNetwork', defaultNetwork).set('defaultEvent', defaultEvent)

      // Save the updated configuration and data sources
      updateWidgetJson(
        {
        config: updatedConfig,
        useDataSources: Object.values(allDataSources.useDataSourceMap)
        },
        allDataSources.outputDataSources,
      )
    },
    [config, portalUrl, updateWidgetJson]
  )

  const isRunning = React.useRef(false)
  const waitForSemaphore = async () => {
    while (isRunning.current) {
      await new Promise((resolve) => setTimeout(resolve, 10)) // Wait for 10ms before checking again
    }
  }

  const handleMapViewsConfigUpdated = React.useCallback(
    async (
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
            if (mapViewIdMapSettings === '') {
              setMapViewIdMapSettings(mapId)
            }
            setIdToNameMap(mapIdToNameMap)
          } else {
            // Update the configuration with the new map views configuration
            updatedConfig = updatedConfig.set('mapViewsConfig', mapViewsConfig)

            // Update the LRS layers for the specific map view
            const mapViewConfig = mapViewsConfig[mapId]
            let settingForView = useConfigRef.current.settingsPerView?.[mapId] || constructSettingsPerView()

            const { networks, lineEvents } = getLayersByType(mapViewConfig.lrsLayers, mapViewConfig.disabledLayerIds)
            settingForView = settingForView.setIn(['networkLayers'], networks).setIn(['eventLayers'], lineEvents)

            //Handle conflict prevention and attribute sets
            if (networks.length > 0) {
              const network = mapViewConfig.lrsLayers.find((layer) => layer.layerType === LrsLayerType.Network)
              if (isDefined(network)) {
                try {
                  const allAttributeSets = await getAttributeSets(network.lrsUrl, portalUrl, false)
                  const defaultPointAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), settingForView.defaultPointAttributeSet, true)
                  const defaultLineAttributeSet = getDefaultAttributeSet(Immutable(allAttributeSets), settingForView.defaultLineAttributeSet, false)

                  settingForView = settingForView.setIn(['attributeSets'], allAttributeSets)
                    .setIn(['defaultPointAttributeSet'], defaultPointAttributeSet)
                    .setIn(['defaultLineAttributeSet'], defaultLineAttributeSet)
                } catch (error) {
                  console.error('Error fetching conflict prevention or attribute sets:', error)
                }
              }
            }

            settingForView = setValuesForView(settingForView, mapViewConfig.lrsLayers, false)
            settingForView = updateDefaultForMapMode(settingForView, mapViewConfig, LrsLayerType.Network, 'defaultNetwork')
            settingForView = updateDefaultForMapMode(settingForView, mapViewConfig, LrsLayerType.Event, 'defaultEvent', true)

            if (!updatedConfig?.settingsPerView) {
              updatedConfig = updatedConfig.set('settingsPerView', Immutable({}))
            }
            const settingsPerView = updatedConfig.settingsPerView.set(mapId, settingForView)
            updatedConfig = updatedConfig.set('settingsPerView', settingsPerView)

            if (mapViewIdMapSettings === '') {
              setMapViewIdMapSettings(mapId)
            }
            setIdToNameMap(mapIdToNameMap)
          }
        }
        updateWidgetJson(
          {
          config: updatedConfig,
          useDataSources: Object.values(allDataSources.useDataSourceMap)
          },
          allDataSources.outputDataSources,
        )
      } finally {
        // Release the semaphore
        useConfigRef.current = updatedConfig
        isRunning.current = false
      }
    },
    [mapViewIdMapSettings, portalUrl, updateWidgetJson]
  )

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
          outputDataSourceWidgetType='identify'
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
        {hasMap && hasEventConfig && (
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
            <DefaultSettings
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