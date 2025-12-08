import type { AnalysisEngine, LocaleItem } from '@arcgis/analysis-ui-schema'
import type { CustomToolConfig, ToolConfig } from '../config'
import { urlUtils, type ImmutableObject, type UtilitiesJson } from 'jimu-core'
import React from 'react'
import { StringsManager } from './strings-manager'

export function getDisplayedCustomToolName (toolInfo: ImmutableObject<ToolConfig> | ToolConfig, utilities: ImmutableObject<UtilitiesJson>) {
  if (!toolInfo) {
    return ''
  }
  const toolConfig = (toolInfo.config as CustomToolConfig)
  const { toolDisplayName } = toolConfig.option || {}
  if (toolDisplayName) {
    return toolDisplayName
  }
  if (toolConfig.utility) {
    const { utilityId, task } = toolConfig.utility
    const utilityJson = utilities?.[utilityId]
    if (task) {
      const taskInfo = utilityJson && utilityJson.tasks ? utilityJson.tasks.find((t) => t.name === task) : null
      if (taskInfo && taskInfo.label) {
        return taskInfo.label
      }
    } else if (utilityJson && utilityJson.label) {
      return utilityJson.label
    }
  }
  return (toolInfo.config as CustomToolConfig).toolInfo?.displayName || toolInfo.toolName
}

export function getDisplayedStandardToolName (toolName: string, analysisEngine: AnalysisEngine, toolInfoStrings: LocaleItem, formatAnalysisEngineSuffix: (analysisEngine?: AnalysisEngine) => string, toCamelToolName: (toolName: string) => string) {
  const displayedToolNameT9NKey = `${toCamelToolName(toolName)}${formatAnalysisEngineSuffix(analysisEngine)}`
  return toolInfoStrings?.[displayedToolNameT9NKey] as string || toolName
}

export function getAssetsPathByFolderName (folderName: string) {
  const widgetUrl = `${window.location.protocol}//${window.location.host}${urlUtils.getFixedRootPath()}widgets/arcgis/analysis/`
  return `${widgetUrl}dist/assets/${folderName}/`
}

export function getAnalysisAssetPath () {
  return getAssetsPathByFolderName('arcgis-analysis-assets')
}

export const useStrings = (path: string) => {
  const [strings, setStrings] = React.useState<LocaleItem>()
  React.useEffect(() => {
    StringsManager.getInstance().getStrings(path).then(setStrings).catch(() => {
      setStrings({})
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return strings
}

export const useCommonStringsByLocale = (locale: string) => {
  return useStrings(`${getAnalysisAssetPath()}assets/t9n/common.t9n.${locale ?? 'en-US'}.json`)
}

export const useToolInfoStringsByLocale = (locale: string) => {
  const commonStrings = useCommonStringsByLocale(locale)
  return React.useMemo(() => {
    return commonStrings ? { ...(commonStrings.toolInfo as LocaleItem || {}), ...(commonStrings.toolInfoKeys as LocaleItem || {}) } : null
  }, [commonStrings])
}

export const localizeStandardToolParamLabel = (label: string | undefined, toolUIStrings: LocaleItem | undefined): string | undefined => {
  let localizedLabel = label
  if (toolUIStrings !== undefined && label !== undefined && label.startsWith('$')) {
    localizedLabel = toolUIStrings[label.replace('$', '')] as string
  }
  return localizedLabel
}
