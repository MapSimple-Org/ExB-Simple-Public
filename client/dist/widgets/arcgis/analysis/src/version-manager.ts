import { BaseVersionManager, getAppStore, type ImmutableObject } from 'jimu-core'
import { type CustomToolConfig, ToolType, type IMConfig } from './config'
import { AnalysisEngine } from '@arcgis/analysis-ui-schema'

class VersionManager extends BaseVersionManager {
  versions = [
    {
      version: '1.14.0',
      description: 'Add analysisEngine in toolConfig',
      upgrader: (oldConfig: IMConfig) => {
        if (!oldConfig.toolList.length) return oldConfig

        if (oldConfig.toolList.every((tool) => !!tool.analysisEngine)) {
          return oldConfig
        }

        const newConfig = oldConfig.set('toolList', oldConfig.toolList.asMutable({ deep: true }).map((tool) => {
          if (!tool.analysisEngine) {
            tool.analysisEngine = AnalysisEngine.Standard
          }
          return tool
        }))

        return newConfig
      }
    },
    {
      version: '1.16.0',
      description: 'Change name for SummarizeRasterWithin and CreateViewshed tools',
      upgrader: (oldConfig: IMConfig) => {
        let newConfig = oldConfig

        const renamedTools = {
          SummarizeRasterWithin: 'ZonalStatistics',
          CreateViewshed: 'GeodesicViewshed'
        }

        const renamedToolOldNames = Object.keys(renamedTools)

        if (oldConfig.toolList?.find((t) => renamedToolOldNames.includes(t.toolName))) {
          newConfig = newConfig.set('toolList', oldConfig.toolList.asMutable({ deep: true }).map((tool) => {
            if (renamedToolOldNames.includes(tool.toolName)) {
              tool.toolName = renamedTools[tool.toolName]
            }
            return tool
          }))
        }
        if (oldConfig.historyResourceItemsFromMap?.find((h) => renamedToolOldNames.includes(h.toolName))) {
          newConfig = newConfig.set('historyResourceItemsFromMap', oldConfig.historyResourceItemsFromMap.asMutable({ deep: true }).map((history) => {
            if (renamedToolOldNames.includes(history.toolName)) {
              history.toolName = renamedTools[history.toolName]
            }
            return history
          }))
        }

        return newConfig
      }
    },
    {
      version: '1.18.0',
      description: 'Remove the custom tools has no matched utility in useUtilities',
      upgrader: (oldConfig: IMConfig, widgetId: string) => {

        const hasCustomTools = oldConfig.toolList?.find((t) => t.type === ToolType.Custom)
        if (!hasCustomTools) {
          return oldConfig
        }

        const { useUtilities } = getAppStore().getState()?.appConfig?.widgets[widgetId] || {}

        const newToolList = oldConfig.toolList.filter((tool) => {
          if (tool.type === ToolType.Custom) {
            const utility = (tool.config as ImmutableObject<CustomToolConfig>).utility
            const { utilityId } = utility || {}
            if (!useUtilities?.find((u) => u.utilityId === utilityId)) {
              return false
            }
          }
          return true
        })

        if (newToolList.length === oldConfig.toolList.length) {
          return oldConfig
        }

        return oldConfig.set('toolList', newToolList)
      }
    }
  ]
}

export const versionManager: BaseVersionManager = new VersionManager()
