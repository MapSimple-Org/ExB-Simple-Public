import type { extensionSpec, IMAppConfig, ImmutableObject } from 'jimu-core'
import { type CustomToolConfig, ToolType, type IMConfig } from '../config'

export default class AppConfigOperation implements extensionSpec.AppConfigOperationsExtension {
  id = 'analysis-app-config-operation'
  widgetId: string

  utilityWillRemove (appConfig: IMAppConfig, removedUtilityId: string): IMAppConfig {
    const utilities = appConfig.utilities
    const toolList = (appConfig.widgets[this.widgetId]?.config as IMConfig)?.toolList
    if (toolList?.length) {
      const newToolList = toolList.filter((tool) => {
        if (tool.type !== ToolType.Custom) {
          return true
        }
        const utility = (tool.config as ImmutableObject<CustomToolConfig>).utility
        const { utilityId, task } = utility || {}
        if (utilityId === removedUtilityId) {
          // has utility info in tool config, can find utility, but url can't match
          const { url } = utilities[utilityId]
          const utilityTaskUrl = task ? `${url}/${task}` : url
          const toolUrl = (tool.config as ImmutableObject<CustomToolConfig>).toolUrl
          // if remove a utility and then add a new one, the utilityId will be re-used, but the tool with the old utility may not be removed and the url won't match
          // so only if the utility url and id match the tool url and id, the tool will be removed
          if (utilityTaskUrl === toolUrl) {
            return false
          }
        }
        return true
      })
      if (newToolList.length !== toolList.length) {
        appConfig = appConfig.setIn(['widgets', this.widgetId, 'config', 'toolList'], newToolList)
      }
    }
    return appConfig
  }
}
