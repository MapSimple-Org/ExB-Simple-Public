/** @jsx jsx */
import {
  React,
  Immutable,
  jsx,
  type ImmutableArray,
  type ImmutableObject
} from 'jimu-core'
import { hooks, defaultMessages as jimuUIDefaultMessages, Select } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { AllWidgetSettingProps, SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { EmptyPlaceholder, LrsLoader, ModeType, LrsLayerType, lrsDefaultMessages, type LrsLayer, type MapViewConfig, getConfigValue, isDefined } from 'widgets/shared-code/lrs'
import { constructSettingsPerView, getDefaultNetwork, getDefaultReferent, resetConfig } from '../common/utils'
import { ReferentItemConfig } from './components/referent-item-config'
import { NetworkItemConfig } from './components/network-item-config'
import { DefaultSettings } from './components/default-settings'

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
    (!isMapMode && config?.lrsLayers?.length > 0) ||
    (isMapMode && config?.mapViewsConfig &&
      Object.keys(config.mapViewsConfig)?.length > 0 &&
      isDefined(config?.mapViewsConfig[mapViewIdMapSettings]) )
  const hasLrsConfig =
    (!isMapMode && config?.lrsLayers?.length !== 0) ||
    (isMapMode && config?.settingsPerView && config?.settingsPerView[mapViewIdMapSettings])

  const supportedLrsTypes = Immutable([
    LrsLayerType.Network,
    LrsLayerType.Event,
    LrsLayerType.PointEvent,
    LrsLayerType.Intersection,
    LrsLayerType.Addressing,
    LrsLayerType.CalibrationPoint,
    LrsLayerType.NonLrs,
    LrsLayerType.NonLrsPoint
  ])

  const requiredLrsTypes = Immutable([LrsLayerType.Network])
  const getI18nMessage = hooks.useTranslate(defaultMessages, jimuUIDefaultMessages, lrsDefaultMessages)

  React.useEffect(() => {
    if (config.mode === undefined) {
      const newMode = config?.lrsLayers?.length > 0 ? ModeType.Layer : ModeType.Map
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

  const updateWidgetJson: SettingChangeFunction = React.useCallback(
    (...args) => {
      const [changedWidgetJson, ...restArgs] = args
      const widgetJson = Object.assign({
        id: id,
        ...changedWidgetJson
      })
      onSettingChange(widgetJson, ...restArgs)
    },
    [id, onSettingChange]
  )

  const handleMapWidgetIdUpdated = (values: string[], mode: ModeType) => {
    props.onSettingChange({
      id: widgetId,
      config: resetConfig(config, mode),
      useMapWidgetIds: values
    })
  }

  const handleReset = React.useCallback(
    (mode: ModeType) => {
      onSettingChange({
        id: widgetId,
        config: resetConfig(config, mode),
        useDataSources: []
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
    (lrsLayers: ImmutableArray<LrsLayer>, allDataSources: any) => {
      // Update the configuration with the new LRS layers
      let updatedConfig = config.set('lrsLayers', lrsLayers)

      const defaultNetwork = getDefaultNetwork(lrsLayers, config.defaultNetwork)
      const resultConfig = getDefaultReferent(lrsLayers, config.resultConfig)
      updatedConfig = updatedConfig.set('defaultNetwork', defaultNetwork).set('resultConfig', resultConfig)

      // Save the updated configuration and data sources
      updateWidgetJson(
        {
        config: updatedConfig,
        useDataSources: Object.values(allDataSources.useDataSourceMap)
        },
        allDataSources.outputDataSources,
      )
    },
    [config, updateWidgetJson]
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
            const lrsLayers = mapViewsConfig[mapId]?.lrsLayers
            let settingForView = useConfigRef.current.settingsPerView?.[mapId] || constructSettingsPerView()

            const defaultNetwork = getDefaultNetwork(lrsLayers, settingForView.defaultNetwork)
            const resultConfig = getDefaultReferent(lrsLayers, settingForView.resultConfig)
            settingForView = settingForView.set('defaultNetwork', defaultNetwork).set('resultConfig', resultConfig)

            if (!updatedConfig?.settingsPerView) {
              updatedConfig = updatedConfig.set('settingsPerView', Immutable({}))
            }
            const settingsPerView = updatedConfig?.settingsPerView.set(mapId, settingForView)
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
    [mapViewIdMapSettings, updateWidgetJson]
  )

  const lrsLayers: LrsLayer[] = React.useMemo(() => {
    return getConfigValue(config, 'lrsLayers', mapViewIdLayerSettings) || []
  }, [config, mapViewIdLayerSettings])

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
          outputDataSourceWidgetType='searchByRoute'
          onLrsLayersUpdated={handleLrsLayersUpdated}
          onMapViewsConfigUpdated={handleMapViewsConfigUpdated}
          onMapWidgetSelected={handleMapWidgetIdUpdated}
          onReset={handleReset}
          onSelectionChanged={handleSelectionChanged}
        >
          {selectedIndex > -1 && (
            <div>
              {lrsLayers[selectedIndex]?.layerType === LrsLayerType.Network && (
                <NetworkItemConfig
                  intl={intl}
                  widgetId={widgetId}
                  index={selectedIndex}
                  config={config}
                  activeMapViewId={mapViewIdLayerSettings}
                  onSettingChange={onSettingChange}
                />
              )}
              {lrsLayers[selectedIndex]?.isReferent && (
                <ReferentItemConfig
                  widgetId={widgetId}
                  index={selectedIndex}
                  config={config}
                  activeMapViewId={mapViewIdLayerSettings}
                  onSettingChange={onSettingChange}
                />
              )}
            </div>
          )}
        </LrsLoader>
        {hasMap && hasLrsConfig && (
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
          </React.Fragment>
        )}
        {!isMapMode && !hasConfig && !hasLrsConfig && <EmptyPlaceholder isMapMode={false} />}
        {isMapMode && !hasMap && <EmptyPlaceholder isMapMode={true} />}
      </div>
    </div>
  )
}

export default Setting
