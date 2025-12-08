import { Immutable, type extensionSpec, type IMAppConfig, type ImmutableArray } from 'jimu-core'
import defaultMessages from '../setting/translations/default'
import type { CoordinateConfig, IMConfig } from '../config'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'coordinates-builder-operation'
  widgetId: string

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const {
      coordinateSystem = Immutable([]) as ImmutableArray<CoordinateConfig>,
    } = config
    const keys: extensionSpec.TranslationKey[] = []
    const coordinateSystemKeys = getKeysInCoordinateSystem(coordinateSystem, `widgets.${this.widgetId}.config`)
    coordinateSystemKeys.length > 0 && keys.push(...coordinateSystemKeys)
    return Promise.resolve(keys)
  }
}

export function getKeysInCoordinateSystem (coordinateSystem: ImmutableArray<CoordinateConfig> = Immutable([]), path: string) {
  const keys: extensionSpec.TranslationKey[] = []
  coordinateSystem.forEach((sysItem, sysIndex) => {
    const systemName = sysItem.name
    const systemPath = `${path}.coordinateSystem[${sysIndex}]`
    keys.push({
      keyType: 'value',
      key: `${systemPath}.name`,
      label: {
        key: 'systemLabel',
        enLabel: defaultMessages.systemLabel
      },
      nav: systemName,
      valueType: 'text'
    })
  })
  return keys
}
