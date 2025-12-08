import { Immutable, type extensionSpec, type IMAppConfig, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import { defaultMessages as jimuUiMessages } from 'jimu-ui'
import { EditModeType, LayerHonorModeType, type LayersConfig, type IMConfig, type MapViewConfig } from '../config'
import defaultMessages from '../setting/translations/default'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'edit-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const {
      editMode,
      description,
      noDataMessage,
      layersConfig = Immutable([]) as ImmutableArray<LayersConfig>,
      mapViewsConfig = Immutable({}) as ImmutableObject<MapViewConfig>
    } = config
    const keys: extensionSpec.TranslationKey[] = []
    if (editMode === EditModeType.Attribute) {
      description && keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.description`,
        label: {
          key: 'description',
          enLabel: jimuUiMessages.description
        },
        valueType: 'text'
      })
      noDataMessage && keys.push({
        keyType: 'value',
        key: `widgets.${this.widgetId}.config.noDataMessage`,
        label: {
          key: 'noDataMessage',
          enLabel: jimuUiMessages.noDataMessage
        },
        valueType: 'text'
      })
      const layersConfigKeys = getKeysInLayersConfig(layersConfig, `widgets.${this.widgetId}.config`, true)
      layersConfigKeys.length > 0 &&keys.push(...layersConfigKeys)
    } else if (editMode === EditModeType.Geometry) {
      for (const [jimuMapViewId, mapViewConfig] of Object.entries(mapViewsConfig)) {
        const layersConfigKeys = getKeysInLayersConfig(mapViewConfig.layersConfig, `widgets.${this.widgetId}.config.mapViewsConfig.${jimuMapViewId}`)
        layersConfigKeys.length > 0 && keys.push(...layersConfigKeys)
      }
    }

    return Promise.resolve(keys)
  }
}

export function getKeysInLayersConfig (layersConfig: ImmutableArray<LayersConfig> = Immutable([]), path: string, includeLabel?: boolean) {
  const keys: extensionSpec.TranslationKey[] = []
  layersConfig.forEach((layerConfig, layerIndex) => {
    const layerName = layerConfig.name
    const layerPath = `${path}.layersConfig[${layerIndex}]`
    if (includeLabel) {
      keys.push({
        keyType: 'value',
        key: `${layerPath}.name`,
        label: {
          key: 'layerLabel',
          enLabel: defaultMessages.layerLabel
        },
        nav: layerName,
        valueType: 'text'
      })
    }
    if (layerConfig.layerHonorMode === LayerHonorModeType.Custom && layerConfig.groupedFields.length > 0) {
      layerConfig.groupedFields.forEach((item, itemIndex) => {
        const itemPath = `${layerPath}.groupedFields[${itemIndex}]`
        const itemName = item.alias || item.jimuName || item.name
        const layerItemName = `${layerName} / ${itemName}`
        const isGroup = !!item.groupKey
        if (isGroup) {
          keys.push({
            keyType: 'value',
            key: `${itemPath}.alias`,
            label: {
              key: 'fieldGroupLabel',
              enLabel: defaultMessages.fieldGroupLabel
            },
            nav: layerItemName,
            valueType: 'text'
          })
          if (item.children.length > 0) {
            const childItemName = item.children[0].alias || item.children[0].jimuName || item.children[0].name
            const layerChildItemName = `${layerName} / ${itemName} / ${childItemName}`
            item.children.forEach((childItem, childIndex) => {
              if (childItem.subDescription) {
                keys.push(getItemDescriptionKey(layerChildItemName, `${itemPath}.children[${childIndex}]`, false))
              }
            })
          }
        }
        if (item.subDescription) {
          keys.push(getItemDescriptionKey(layerItemName, itemPath, isGroup))
        }
      })
    }
  })
  return keys
}

function getItemDescriptionKey (layerItemName: string, path: string, isGroup: boolean): extensionSpec.TranslationKey {
  const translateKey = isGroup ? 'groupDescription' : 'fieldDescription'
  return {
    keyType: 'value',
    key: `${path}.subDescription`,
    label: {
      key: translateKey,
      enLabel: defaultMessages[translateKey]
    },
    nav: layerItemName,
    valueType: 'textarea'
  }
}