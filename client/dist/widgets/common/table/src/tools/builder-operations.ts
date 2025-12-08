import { Immutable, type extensionSpec, type IMAppConfig, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import defaultMessages from '../setting/translations/default'
import { TableModeType, type LayersConfig, type IMConfig, type MapViewConfig } from '../config'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'table-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const {
      tableMode,
      layersConfig = Immutable([]) as ImmutableArray<LayersConfig>,
      mapViewsConfig = Immutable({}) as ImmutableObject<MapViewConfig>
    } = config
    const keys: extensionSpec.TranslationKey[] = []
    if (tableMode === TableModeType.Layer) {
      const layersConfigKeys = getKeysInLayersConfig(layersConfig, `widgets.${this.widgetId}.config`)
      layersConfigKeys.length > 0 && keys.push(...layersConfigKeys)
    } else if (tableMode === TableModeType.Map) {
      for (const [jimuMapViewId, mapViewConfig] of Object.entries(mapViewsConfig)) {
        const layersConfigKeys = getKeysInLayersConfig(mapViewConfig.layersConfig, `widgets.${this.widgetId}.config.mapViewsConfig.${jimuMapViewId}`)
        layersConfigKeys.length > 0 && keys.push(...layersConfigKeys)
      }
    }
    return Promise.resolve(keys)
  }
}

export function getKeysInLayersConfig (layersConfig: ImmutableArray<LayersConfig> = Immutable([]), path: string) {
  const keys: extensionSpec.TranslationKey[] = []
  layersConfig.forEach((layerConfig, layerIndex) => {
    const layerName = layerConfig.name
    const layerPath = `${path}.layersConfig[${layerIndex}]`
    keys.push({
      keyType: 'value',
      key: `${layerPath}.name`,
      label: {
        key: 'tableLayerLabel',
        enLabel: defaultMessages.tableLayerLabel
      },
      nav: layerName,
      valueType: 'text'
    })
    if (layerConfig.enableSearch && layerConfig.searchHint) {
      keys.push({
        keyType: 'value',
        key: `${layerPath}.searchHint`,
        label: {
          key: 'tableSearchHint',
          enLabel: defaultMessages.tableSearchHint
        },
        nav: layerName,
        valueType: 'text'
      })
    }
  })
  return keys
}
