
import { jsx, dynamicStyleUtils } from 'jimu-core'
import type { ImmutableArray, UseDataSource, DuplicateContext, IMWidgetJson } from 'jimu-core'
import type { IMConfig } from '../config'
export function updateDynamicStyleConfig(config: IMConfig, widgetId: string, preUseDataSources: ImmutableArray<UseDataSource>, newUseDataSource: ImmutableArray<UseDataSource>): IMConfig {
  let newConfig = config
  //Update dynamic style config when select new data source
  if (newConfig.cardConfigs) {
    const cardConfigs = newConfig.cardConfigs
    Object.keys(cardConfigs).forEach(status => {
      let cardConfig = cardConfigs[status]
      const dynamicStyleConfig = cardConfig?.dynamicStyleConfig
      if (dynamicStyleConfig && Object.keys(dynamicStyleConfig).length > 0) {
        if (!newUseDataSource) {
          cardConfig = cardConfig.without('dynamicStyleConfig').set('enableDynamicStyle', false)
        } else {
          const newDynamicStyleConfig = dynamicStyleUtils.updateDynamicStyleWhenUseDataSourcesChange(widgetId, preUseDataSources, newUseDataSource, dynamicStyleConfig)
          cardConfig = cardConfig.set('dynamicStyleConfig', newDynamicStyleConfig)
          if (!newDynamicStyleConfig) {
            cardConfig = cardConfig.set('enableDynamicStyle', false)
          }
        }
      }
      newConfig = newConfig.setIn(['cardConfigs', status], cardConfig)
    })
  }
  return newConfig
}

export function updateDynamicStyleConfigAfterWidgetCopied(config: IMConfig, contentMap: DuplicateContext, sourceWidgetJson: IMWidgetJson): IMConfig {
  let newConfig = config
  //Update dynamic style config when select new data source
  if (newConfig.cardConfigs) {
    const cardConfigs = newConfig.cardConfigs
    Object.keys(cardConfigs).forEach(status => {
      let cardConfig = cardConfigs[status]
      const dynamicStyleConfig = cardConfig?.dynamicStyleConfig
      if (dynamicStyleConfig && Object.keys(dynamicStyleConfig).length > 0) {
        const newDynamicStyleConfig = dynamicStyleUtils.getCopiedDynamicStyleConfig(contentMap, sourceWidgetJson, dynamicStyleConfig)
        cardConfig = cardConfig.set('dynamicStyleConfig', newDynamicStyleConfig)
      }
      newConfig = newConfig.setIn(['cardConfigs', status], cardConfig)
    })
  }
  return newConfig
}