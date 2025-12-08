/** @jsx jsx */
import { React, jsx, hooks, type ImmutableArray } from 'jimu-core'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { getAllValidToolsList } from '../../utils/util'
import type { ToolConfig } from '../../config'
import tools from '../../utils/tools.json'
import { type AnalysisEngine, type AnalysisToolItem, AnalysisToolCategories, type LocaleItem, AnalysisType } from '@arcgis/analysis-ui-schema'
import { fetchLocalizedMessages, hasGeoEnrichmentPrivilege } from '@arcgis/analysis-shared-utils'
import ToolSelectorUI from './tool-selector-ui'

export interface Props {
  disabled?: boolean
  toolList: ImmutableArray<ToolConfig>
  portal: __esri.Portal
  toolInfoStrings: LocaleItem
  onWarningNoMap: () => void
  onChange: (toolName: string, analysisEngine: AnalysisEngine) => void
}

const StandardAnalysisToolSelector = (props: Props): React.ReactElement => {
  const { disabled, toolList, portal, toolInfoStrings, onWarningNoMap, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)

  const getLocalizedData = (toolList: AnalysisToolItem[], t9nStrings: LocaleItem) => {
    const localizedData: AnalysisToolItem[] = toolList.map((tool: AnalysisToolItem) => {
      return {
        ...tool,
        ...fetchLocalizedMessages<AnalysisToolItem, keyof AnalysisToolItem>(tool, t9nStrings),
        keys: tool.keys?.map((key) => {
          const formattedKey = key.replace('$', '')
          return t9nStrings[formattedKey] as string
        })
      }
    })
    return localizedData
  }

  const [toolsArray, setToolsArray] = React.useState<AnalysisToolItem[]>([])

  React.useEffect(() => {
    if (!toolInfoStrings || !portal) {
      return
    }

    getAllValidToolsList(tools.map((tool) => ({ ...tool, analysisType: AnalysisType.Tool })), portal).then((toolList) => {
      let displayedTools = toolList
      if (!hasGeoEnrichmentPrivilege(portal?.user)) {
        displayedTools = displayedTools.filter((tool) => {
          return !tool.toolName.includes('EnrichLayer')
        })
      }
      const localizedToolsInfo = getLocalizedData(displayedTools, toolInfoStrings)
      setToolsArray(localizedToolsInfo)
    })
  }, [portal, toolInfoStrings])

  return (
    <ToolSelectorUI
      disabled={disabled} buttonDisabled={!toolsArray.length}
      buttonTitle={translate('addStandardTool')} sidePopperTitle={translate('selectTool')}
      toolsArray={toolsArray} categories={AnalysisToolCategories} toolList={toolList}
      icon={require('jimu-icons/svg/outlined/gis/spatial-analysis-tool.svg')}
      onSelectTool={onChange} onDisabledStateClick={onWarningNoMap} />
  )
}

export default StandardAnalysisToolSelector
