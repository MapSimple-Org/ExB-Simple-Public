/** @jsx jsx */
import { React, jsx, css, lodash, hooks, focusElementInKeyboardMode, type ImmutableObject } from 'jimu-core'
import { type HistoryItemWithDs, ToolType, type ToolConfig, type CustomToolConfig } from '../../config'
import { Button, defaultMessages as jimuiDefaultMessages } from 'jimu-ui'
import { type AnalysisToolUIAssets, getLocaleInfo, getToolJSONs, isEmptyValue, getUIOnlyParamsToDisplay, toPascalToolName, filterAndRenameJobParams } from '@arcgis/analysis-shared-utils'
import memoize from 'lodash-es/memoize'
import { ParamViewModelKey, type AnalysisToolUI, type AnalysisEngine, type LocaleItem } from '@arcgis/analysis-ui-schema'
import HistoryParameters from './history-parameters'
import HistoryMessages from './history-messages'
import HistoryResultForCustomTool from './history-result-for-custom-tool'
import HistoryResultForStandardTool from './history-result-for-standard-tool'
import { ArrowLeftOutlined } from 'jimu-icons/outlined/directional/arrow-left'
import { getAnalysisAssetPath } from '../../utils/strings'
import defaultMessages from '../translations/default'
import { useGetDisplayedToolName } from '../../utils/util'
import type { JimuMapView } from 'jimu-arcgis'

interface Props {
  historyItem: HistoryItemWithDs
  portal: __esri.Portal
  widgetId: string
  toolInfo: ImmutableObject<ToolConfig>
  jimuMapView: JimuMapView
  onBack: () => void
  signIn: (toolInfo: ImmutableObject<ToolConfig>) => Promise<void>
}

const { useEffect, useState, useCallback, useMemo } = React

const style = css`
  padding: 1rem;
  .header {
    margin-bottom: 1rem;
    font-size: 0.875rem;
    line-height: 1.1875rem;
    font-weight: 500;
    color: var(--sys-color-surface-paper-text);
    button {
      margin-right: 0.5rem;
      border: 0;
      padding: 0;
    }
  }
  .setting-collapse {
    margin-bottom: 0.5rem;
  }
  .collapse-header {
    margin-bottom: 0.5rem;
    .collapse-label {
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.125rem;
    }
    button {
      border: 0;
      padding: 0;
    }
  }
`

const HistoryDetail = (props: Props) => {
  const { historyItem, portal, widgetId, toolInfo, jimuMapView, onBack, signIn } = props
  const { toolName, type, analysisEngine } = toolInfo

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const memoizeHelperFetchPath = useCallback(async (path: string): Promise<any> => {
    const response = await fetch(path)
    const results = await response.json()
    return results
  }, [])

  useEffect(() => {
    if (!portal && type !== ToolType.Custom) {
      signIn(toolInfo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal])

  /**
   * Gets the current tool json and t9n
   * @param {string} name the name of the tool
   * @param {AnalysisEngine} AnalysisEngine the analysis engine for the tool
   * @returns {Promise<{ toolUIJSON: any, toolT9n: any }>} the toolUIJSON and toolT9n
   */
  const getCurrentToolJSONs = memoize(
    async (name: string, analysisEngine: AnalysisEngine): Promise<AnalysisToolUIAssets> => {
      const toolResponseMemo = memoize(memoizeHelperFetchPath)
      const response = await getToolJSONs({
        locale: getLocaleInfo().locale,
        name,
        analysisEngine,
        memoizedHelper: toolResponseMemo,
        assetPrefix: `${getAnalysisAssetPath()}assets/`
      })
      return response
    }
  )

  const [toolT9n, setToolT9n] = useState<LocaleItem>()
  const [toolUIJSON, setToolUIJSON] = useState<AnalysisToolUI>()

  useEffect(() => {
    if (!toolName) {
      return
    }
    if (toolInfo.type === ToolType.RasterFunction) {
      setToolT9n({})
      return
    }
    // if custom tool, use parameter displayName to generate t9n object
    if (toolInfo.type === ToolType.Custom) {
      const t9nObj = {};
      (toolInfo.config as ImmutableObject<CustomToolConfig>).toolInfo.parameters.forEach((p) => {
        t9nObj[p.name] = p.displayName
      })
      setToolT9n(t9nObj)
      return
    }

    getCurrentToolJSONs(toPascalToolName(toolName), analysisEngine).then((res) => {
      const { toolT9n, toolUIJson } = res
      setToolT9n(toolT9n)
      setToolUIJSON(toolUIJson)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolName])

  const getDisplayedToolName = useGetDisplayedToolName()

  const translatedToolName = useMemo(() => getDisplayedToolName(toolInfo), [getDisplayedToolName, toolInfo])

  const jobParamsToDisplay = useMemo(() => {
    return filterAndRenameJobParams(
      historyItem?.jobParams,
      historyItem?.toolUiParameters,
      historyItem?.toolName
    )
  }, [historyItem?.jobParams, historyItem?.toolName, historyItem?.toolUiParameters])

  const jobParams = useMemo(() => {
    if (!jobParamsToDisplay) {
      return undefined
    }
    const paramsCopy = lodash.clone(jobParamsToDisplay)

    Object.keys(paramsCopy).forEach((key) => {
      if (isEmptyValue(paramsCopy[key])) {
        delete paramsCopy[key]
      }
    })
    return paramsCopy
  }, [jobParamsToDisplay])

  const backBtnRef = React.useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Esc' || e.key === 'Escape') {
      focusElementInKeyboardMode(backBtnRef.current)
    }
  }

  return (
    <div css={style} onKeyDown={handleKeyDown}>
      <div className='header'>
        <Button ref={backBtnRef} type='tertiary' icon onClick={onBack} aria-label={translate('back')} autoFocus><ArrowLeftOutlined className='flip-icon' size={16} /></Button>
        {translatedToolName}
      </div>
      <HistoryMessages
        toolName={toolName}
        type={type}
        translatedToolName={translatedToolName}
        analysisEngine={historyItem?.analysisEngine}
        jobInfo={historyItem.jobInfo}
        startTimeStamp={historyItem.startTimestamp}
        endTimeStamp={historyItem.endTimestamp}
        portal={portal}
        messageLevel={type === ToolType.Custom ? (toolInfo.config as ImmutableObject<CustomToolConfig>)?.option?.messageLevel : undefined}
      />
      {historyItem.results && historyItem.results.length > 0 && (toolInfo.type !== ToolType.Custom
        ? <HistoryResultForStandardTool history={historyItem} toolInfo={toolInfo} widgetId={widgetId} portal={portal} />
        : <HistoryResultForCustomTool history={historyItem} toolInfo={toolInfo} widgetId={widgetId} jimuMapView={jimuMapView} />)}
      <HistoryParameters
        toolName={toolName}
        toolUrl={type === ToolType.Custom ? (toolInfo.config as ImmutableObject<CustomToolConfig>).toolUrl : undefined}
        type={type}
        analysisType={historyItem?.analysisType}
        analysisEngine={historyItem?.analysisEngine}
        jobParams={jobParams}
        toolUiParameters={getUIOnlyParamsToDisplay({
          combinedParams: {
            ...jobParamsToDisplay,
            ...historyItem?.toolUiParameters
          },
          toolName
        })}
        paramViewModel={historyItem?.toolUiParameters?.[ParamViewModelKey]}
        toolT9n={toolT9n}
        toolUIJson={toolUIJSON}
        portal={portal} />
    </div>
  )
}

export default HistoryDetail
