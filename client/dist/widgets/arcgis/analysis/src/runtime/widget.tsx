/** @jsx jsx */
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import {
  React, jsx, type AllWidgetProps, loadArcGISJSAPIModules, css, uuidv1, Immutable, hooks, lodash, SessionManager, type IMState, ReactRedux, type ImmutableObject, dataSourceUtils, DataSourceManager,
  MutableStoreManager,
  getAppStore
} from 'jimu-core'
import { type IMConfig, type SubmissionData, type ToolConfig, ToolType, type StandardToolConfig, type HistoryItemWithDs, type StandardToolOption, type AnalysisGPJobSubmitted, type CustomToolOutput } from '../config'
import defaultMessages from './translations/default'
import { Alert, AlertPopup, defaultMessages as jimuiDefaultMessages, Loading, Paper, Tab, Tabs, hooks as uiHooks } from 'jimu-ui'
import HistoryList from './history/history-list'

import 'calcite-components' // Needed to pull calcite in for ArcGis* components
import '@arcgis/analysis-tool-app/dist/analysis-tool-app/analysis-tool-app.css'
import '@arcgis/analysis-components/dist/analysis-components/analysis-components.css'

import HistoryDetail from './history/history-detail'
import { type AnalysisGPJobStatus, AnalysisJobStatus, isWarningCreditMessage, type AnalysisJobResults, sanitizeTokensFromJobParams } from '@arcgis/analysis-shared-utils'
import type { GPFeatureRecordSetLayer, AnalysisToolData } from '@arcgis/analysis-ui-schema'
import { addLayerToMapByDs, createDsByResults, getCustomToolResultIndexByDsMapKey, getDsJsonFromArcGISService, getNextResultDsId, jobDidComplete, removeEmptyResults } from './utils'
import { useHistoryList } from '../utils/history'
import AnalysisTool from './analysis-tool'
import { Placeholder } from './components/placeholder'
import { destroyDataSources, filterHistoryItemMessages, getMessageLevel, useAnalysisEnginesAccess, useGetDisplayedToolName, wait } from '../utils/util'
import ToolList from './analysis-tool/tool-list'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import { getAnalysisAssetPath, getAssetsPathByFolderName, useToolInfoStrings } from '../utils/strings'

import type { AnalysisToolAppContainerCustomEvent } from '@arcgis/analysis-tool-app'
import { AnalysisCoreEvents, notifyJobStatus } from '../utils/events'
import type * as AnalysisCoreType from '@arcgis/analysis-core'
import type { FeatureLayerDataSourceConstructorOptions } from 'jimu-data-source'
import { versionManager } from '../version-manager'
import { Global } from 'jimu-theme'

const { useState, useMemo, useCallback, useEffect, useRef } = React

const useStyle = (isRTL: boolean, hideBorder: boolean, isClassicTheme: boolean) => {
  return useMemo(() => {
    return css`
      ${hideBorder && css`
        border: none !important;
      `}
      .tab-nav {
        height: 2.5rem;
        .nav-link:not(:disabled):not(.disabled).active {
          font-weight: 600;
        }
        .nav-link:not(.active) {
          border-bottom: 1px solid var(--sys-color-divider-secondary);
          font-weight: 500;
        }
        .nav-link:not(.active):hover {
          color: var(--sys-color-primary-main);
        }
        .nav-item+.nav-item {
          margin-left: 0;
        }
      }
      .tab-content {
        flex-basis: 0;
      }
      .job-status-alert {
        position: absolute;
        bottom: 0.25rem;
        left: 0.25rem;
        right: 0.25rem;
        width: auto !important;
        z-index: 1;
      }
      .flip-icon {
        transform: ${`rotate(${isRTL ? 180 : 0}deg)`};
      }
      ${!isClassicTheme && `.tool-container {
        --calcite-panel-background-color: var(--sys-color-surface-paper);
        --calcite-action-text-color: var(--sys-color-action-text);
        --calcite-action-background-color: var(--sys-color-action);
        --calcite-action-background-color-hover: var(--sys-color-action-hover);
        --calcite-action-background-color-pressed: var(--sys-color-action-pressed);
        --calcite-chip-background-color: var(--sys-color-surface-background);
        --calcite-panel-header-background-color: var(--sys-color-surface-paper);
        --calcite-color-foreground-1: var(--sys-color-surface-paper);
        --calcite-block-heading-text-color: var(--sys-color-surface-paper-text);
        --calcite-block-description-text-color: var(--sys-color-surface-paper-hint);
        --calcite-list-content-text-color: var(--sys-color-action-text);
      }`}
    `
  }, [hideBorder, isClassicTheme, isRTL])
}

const getGlobalStyle = () => {
  return css`
    body > [class^='analysis-'] {
      --calcite-color-background: var(--sys-color-surface-background);
      --calcite-panel-background-color: var(--sys-color-surface-overlay);
      --calcite-list-background-color: var(--sys-color-surface-overlay);
      --calcite-list-color: var(--sys-color-surface-overlay-text);
      --calcite-list-label-text-color: var(--sys-color-surface-overlay-text);
      --calcite-list-description-text-color: var(--sys-color-surface-overlay-hint);
      --calcite-panel-heading-text-color: var(--sys-color-surface-overlay-text);
      --calcite-color-text-1: var(--sys-color-surface-overlay-text);
      --calcite-color-text-2: var(--sys-color-surface-overlay-text);
      --calcite-color-transparent: rgba(0, 0, 0, 0);
    }
    body > analysis-item-browser {
      calcite-dialog {
        --calcite-dialog-header-action-background-color-hover: var(--sys-color-action-hover);
      }
      calcite-button[kind='neutral'] {
        --calcite-button-background-color: var(--sys-color-action);
        --calcite-button-text-color: var(--sys-color-action-text);
      }
      calcite-button[kind=brand][appearance=outline] {
        --calcite-button-background-color: rgba(0, 0, 0, 0);
        --calcite-button-text-color: var(--sys-color-primary);
        --calcite-button-border-color: var(--sys-color-primary);
      }
      calcite-button[kind=brand][appearance=solid] {
        --calcite-button-background-color: var(--sys-color-primary);
        --calcite-button-text-color: var(--sys-color-primary-text);
      }
      arcgis-item-browser {
      --calcite-color-background: var(--sys-color-surface-paper);
        arcgis-item-browser-top-bar {
          --calcite-button-text-color: var(--sys-color-action-input-field-text);
          --calcite-color-transparent: var(--sys-color-action-input-field);
          --calcite-color-transparent-hover: var(--sys-color-action-input-field);
          arcgis-item-browser-search {
            display: block;
            background-color: var(--sys-color-action-input-field);
          }
        }
        arcgis-item-browser-sort {
          --calcite-button-background-color: var(--sys-color-action-input-field);
          --calcite-button-border-color: var(--sys-color-action-input-field);
          --calcite-button-text-color: var(--sys-color-action-input-field-text);
        }
        arcgis-item-browser-card {
          --calcite-button-text-color: var(--sys-color-action-input-field-text);
          --calcite-button-background-color: var(--sys-color-action-input-field);
          --calcite-color-background: rgba(0, 0, 0, 0.2);
        }
      }
    }
    arcgis-tunnel arcgis-field-pick-list.analysis-popover {
      --calcite-panel-background-color: var(--sys-color-surface-overlay);
      --calcite-color-background: var(--sys-color-surface-overlay);
    }
    body analysis-summary-fields-popover.analysis-popover {
      --calcite-color-background: var(--sys-color-surface-overlay);
      --calcite-label-text-color: var(--sys-color-surface-overlay-text);
    }
    analysis-geoenrichment-databrowser {
      .esriGECalciteChip.lightBlue {
        --calcite-chip-background-color: var(--sys-color-info-main);
        --calcite-chip-text-color: var(--sys-color-info-text);
      }
      .esriGESelectableTreeList.esriGEFlowList .selectableTree_listItem_selected {
        background-color: transparent;
      }
      .ge-data-browser .browser-variables-view .grid-variables-title {
        background-color: transparent;
      }
      .ge-shopping-cart .shopping-cart-inner-container .variable-count {
        height: auto;
      }
    }
    arcgis-map-config-sketch-layer-editor-tools {
      --calcite-color-foreground-2: var(--sys-color-action-hover);
      --calcite-color-foreground-3: var(--sys-color-action-selected);
    }
    analysis-layer-input-popover.analysis-popover {
      --calcite-color-border-input: var(--sys-color-surface-overlay-text);
      --calcite-filter-input-background-color: var(--sys-color-action-input-field);
      --calcite-filter-input-border-color: var(--sys-color-divider-secondary);
      --calcite-filter-input-text-color: var(--sys-color-action-input-field-text);
      --calcite-input-icon-color: var(--sys-color-action-input-field-text);
      --calcite-filter-input-placeholder-text-color: var(--sys-color-action-input-field-placeholder);
      --calcite-filter-input-icon-color: var(--sys-color-action-input-field-text);
      --calcite-filter-input-actions-icon-color: var(--sys-color-action-input-field-text);
      --calcite-filter-input-actions-icon-color-hover: var(--sys-color-action-input-field-text);
      --calcite-filter-input-actions-background-color: var(--sys-color-action-input-field);
      --calcite-filter-input-actions-background-color-hover: var(--sys-color-action-input-field);
      --calcite-color-background: var(--sys-color-surface-overlay);
    }
  `
}

interface Props extends AllWidgetProps<IMConfig> {
  mutableStateProps: {
    toolId: string
    input: {
      [parameterName: string]: GPFeatureRecordSetLayer
    }
  }
}

const Widget = (props: Props) => {
  const { useMapWidgetIds, portalUrl, config, widgetId, theme, mutableStateProps, locale } = props

  const { toolList } = config

  useEffect(() => {
    // should define @arcgis/map-config-components and @arcgis/common-components before @arcgis/app-components, since they may has same components
    // should use the @arcgis/map-config-components and @arcgis/common-components first
    // eg: arcgis-sketch-layer-editor
    Promise.allSettled([
      import('@arcgis/map-config-components/dist/loader'),
      import('@arcgis/common-components/dist/loader'),
      import('@arcgis/app-components/dist/loader'),
      import('@arcgis/arcgis-raster-function-editor/dist/loader'),
      import('@arcgis/analysis-components/dist/loader'),
      import('@arcgis/analysis-tool-app/dist/loader')
    ]).then((resArr) => {
      const [
        mapConfigComponentsDefineCustomElements,
        commonComponentsDefineCustomElements,
        defineCustomElements,
        arcgisRasterFunctionEditorDefineCustomElements,
        analysisToolDefineCustomElements,
        analysisComponentsDefineCustomElements
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      ] = resArr.map((res) => res.status === 'fulfilled' ? res.value?.defineCustomElements : () => {})
      mapConfigComponentsDefineCustomElements(window, { resourcesUrl: getAssetsPathByFolderName('arcgis-map-config-components') })
      commonComponentsDefineCustomElements(window, { resourcesUrl: getAssetsPathByFolderName('arcgis-common-components') })
      defineCustomElements(window, { resourcesUrl: getAssetsPathByFolderName('arcgis-app-assets') })
      arcgisRasterFunctionEditorDefineCustomElements(window, { resourcesUrl: getAssetsPathByFolderName('arcgis-raster-function-editor-assets') })
      analysisToolDefineCustomElements(window, { resourcesUrl: getAnalysisAssetPath() })
      analysisComponentsDefineCustomElements(window, { resourcesUrl: getAnalysisAssetPath() })
    })
    // import @arcgis-ba/data-browser css and js for Enrich Data Browser
    const headElement = document.getElementsByTagName('head')?.[0]
    const linkClassName = 'arcgis-ba-data-browser-components-style'
    const scriptClassName = 'arcgis-ba-data-browser-components-js'
    if (headElement) {
      if (!headElement.getElementsByClassName(linkClassName)?.length) {
        const linkElement = document.createElement('link')
        linkElement.className = linkClassName
        linkElement.rel = 'stylesheet'
        linkElement.href = `${getAssetsPathByFolderName('data-browser')}main.css`
        headElement.appendChild(linkElement)
      }

      if (!headElement.getElementsByClassName(scriptClassName)?.length) {
        const scriptElement = document.createElement('script')
        scriptElement.className = scriptClassName
        scriptElement.type = 'module'
        scriptElement.src = `${getAssetsPathByFolderName('data-browser')}index.js`
        headElement.appendChild(scriptElement)
      }
    }

    // since in builder, layout will stop propagation for click event on #app,
    // and the sketch tools clear function is called in a document click event listener (useCapture = false)
    // so need to remove the analysis sketch tools manually here
    let documentClickHandler
    if (window.jimuConfig.isInBuilder) {
      documentClickHandler = (event: MouseEvent) => {
        const clickedElement = event.target
        // get the array of elements that the event has passed through
        const path = event.composedPath() as HTMLElement[]
        const clickPosition = { onPencilBtn: false, inAnalysisLayerInput: false }
        for (const el of path) {
          // do not need check the element outside analysis tool container
          // ANALYSIS-RFX-APP-CONTAINER is the container of raster functions, and ANALYSIS-TOOL is the container of standard and custom tools
          if (el.tagName === 'ANALYSIS-RFX-APP-CONTAINER' || el.tagName === 'ANALYSIS-TOOL') {
            break
          }
          if (clickPosition.onPencilBtn && el.tagName === 'ANALYSIS-LAYER-INPUT') {
            clickPosition.inAnalysisLayerInput = true
            break
          } else if (el.tagName === 'CALCITE-BUTTON' && (el as HTMLCalciteButtonElement).iconStart === 'pencil-mark') {
            clickPosition.onPencilBtn = true
          }
        }

        const clickCreateSketchBtn = clickPosition.onPencilBtn && clickPosition.inAnalysisLayerInput
        const elementName = (clickedElement as HTMLElement).tagName

        // if click on the create sketch button, should not remove the sketch tool
        if (!clickCreateSketchBtn && elementName?.includes('ANALYSIS-')) {
          // arcgis-map-config-sketch-layer-editor-tools is marked as @private, so not in the d.ts file
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const sketchTools = document.querySelector('arcgis-map-config-sketch-layer-editor-tools') as any
          const refElement = sketchTools?.refElement?.sketchToolsPopoverProps?.refElement

          // only remove if the sketch tool is created inner analysis-layer-input, avoid affecting other widgets that use the sketch tool
          if (sketchTools && refElement?.tagName === 'ANALYSIS-LAYER-INPUT') {
            const analysisSketch = refElement.shadowRoot.querySelector('analysis-sketch')
            if (analysisSketch) {
              // analysis layer input will listen to this event to remove the sketch tool
              analysisSketch.dispatchEvent(new CustomEvent('analysisSketchRemove'))
            }
          }
        }
      }
      document.addEventListener('click', documentClickHandler, true)
    }

    return () => {
      if (documentClickHandler) {
        document.removeEventListener('click', documentClickHandler, true)
      }
    }
  }, [])

  const analysisCoreRef = useRef<typeof AnalysisCoreType>(null)
  useEffect(() => {
    import('@arcgis/analysis-core').then((module) => {
      analysisCoreRef.current = module
    })
  }, [])

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)
  const toolInfoStrings = useToolInfoStrings()

  const [currentJimuMapView, setCurrentJimuMapView] = useState<JimuMapView>(null)

  useEffect(() => {
    if (!useMapWidgetIds?.[0]) {
      setCurrentJimuMapView(null)
    }
  }, [useMapWidgetIds])

  const [selectedTab, setSelectedTab] = useState('tools')

  const [currentToolId, setCurrentToolId] = useState('')

  const prevToolListLength = hooks.usePrevious(toolList.length)
  useEffect(() => {
    // if only has one tool, open it directly
    if (toolList.length === 1 && currentToolId !== toolList[0].id) {
      setCurrentToolId(toolList[0].id)
      return
    }
    // if the second tool is added, show tool list
    if (prevToolListLength === 1 && toolList.length === 2) {
      setCurrentToolId('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolList.length])

  const currentToolInfo = useMemo(() => {
    if (!currentToolId || !toolList.length) {
      return null
    }
    return toolList.find((t) => t.id === currentToolId)
  }, [currentToolId, toolList])

  const [backFromToolId, setBackFromToolId] = useState('')

  const [openedTool, setOpenedTool] = useState<{ toolInfo: ToolConfig, jobParams: AnalysisToolData, toolUiParameters?: AnalysisToolData }>(null)
  const [openedHistoryId, setOpenedHistoryId] = useState('')

  const updateMutableStateInput = useCallback((value) => {
    MutableStoreManager.getInstance().updateStateValue(widgetId, 'input', value)
  }, [widgetId])

  const updateMutableStateToolId = useCallback((value) => {
    MutableStoreManager.getInstance().updateStateValue(widgetId, 'toolId', value)
  }, [widgetId])

  const onToolBack = useCallback(() => {
    setBackFromToolId(currentToolId || openedTool?.toolInfo.id)
    setCurrentToolId('')
    setOpenedTool(null)

    updateMutableStateToolId(null)
    updateMutableStateInput(null)
  }, [currentToolId, updateMutableStateInput, updateMutableStateToolId, openedTool])

  const [portal, setPortal] = useState<__esri.Portal>()

  const updatePortal = useCallback(async (loadPortal = true) => {
    const [Portal, PortalUser] = await loadArcGISJSAPIModules([
      'esri/portal/Portal', 'esri/portal/PortalUser'
    ]) as [typeof __esri.Portal, typeof __esri.PortalUser]
    const user = getAppStore().getState().user
    const newPortal = new Portal({ url: portalUrl })

    // portal will not load only when anonymous user try to access custom tool.
    if (!loadPortal && !user) {
      if (!newPortal?.user) {
        // need to add a fake user here to make sure the analysis-layer-input component work fine
        const fakeUser = new PortalUser({ portal: newPortal, sourceJSON: {} })
        newPortal.user = fakeUser
        // analysis component need to read urls from portal.helperServices, if portal not loaded, the helperServices will be null
        // so need to add a fake one here to avoid the error.
        newPortal.helperServices = {}
      }
      setPortal(newPortal)
      return
    }
    return newPortal.load().then(() => {
      setPortal(newPortal)
    })
  }, [portalUrl])

  const [loaded, setLoaded] = useState(false)
  // if has multiple tools or no tool, load tool list directly
  useEffect(() => {
    if (toolList.length !== 1) {
      setLoaded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // if only have one tool, will display the tool directly, analysis-tool-app-container will fetch toolJSON use portal, so must wait for portal init
  useEffect(() => {
    if (!loaded && toolList.length === 1) {
      setLoaded(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dsOrderRef = useRef(1)

  const { historyList, historyListFromMap, historyListFromTools, setHistoryListFromTools } = useHistoryList(widgetId, currentJimuMapView, config, dsOrderRef)

  const [jobStatusAlertInfo, setJobStatusAlertInfo] = useState<{ type: AlertType, text: string }>(null)

  const getDisplayedToolName = useGetDisplayedToolName()

  const showJobStatusAlert = useCallback((historyItem: HistoryItemWithDs) => {
    const { jobStatus, messages } = historyItem.jobInfo
    const hasWarnings = messages.some((message: __esri.GPMessage) => message?.type === 'warning' && !isWarningCreditMessage(message))
    const jobCompleted = jobDidComplete(jobStatus)

    // Map each completed job status to a translated string
    const unsuccessfulJobStatusStringMap = {
      [AnalysisJobStatus.Failed]: 'jobAlertStatusFailed',
      [AnalysisJobStatus.Canceled]: 'jobAlertStatusCancelled',
      [AnalysisJobStatus.TimedOut]: 'tobAlertStatusTimedOut',
      [AnalysisJobStatus.Deleted]: 'jobAlertStatusDeleted'
    }

    const tool = toolList.find((tool) => tool.id === historyItem.toolId)
    const translatedToolName = getDisplayedToolName(tool)

    // Get alert message based on job status and warnings
    let alertMessageString: string
    let type: AlertType = 'success'
    if (jobCompleted) {
      if (jobStatus === AnalysisJobStatus.Succeeded) {
        alertMessageString = hasWarnings ? 'jobAlertStatusSucceededWithWarnings' : 'jobAlertStatusSucceededWithoutWarnings'
        type = hasWarnings ? 'warning' : 'success'
      } else {
        alertMessageString = unsuccessfulJobStatusStringMap[jobStatus as keyof typeof unsuccessfulJobStatusStringMap]
        type = 'error'
      }
    } else {
      alertMessageString = 'submittedAlertLabel'
    }

    const text = translate(alertMessageString, { toolName: translatedToolName })

    setJobStatusAlertInfo({ type, text })
  }, [getDisplayedToolName, toolList, translate])

  const handleJobStart = useCallback((toolId: string, jobInfo: __esri.JobInfo, submissionData: SubmissionData) => {
    const toolInfo = toolList.find((tool) => tool.id === toolId)
    if (!toolInfo) {
      return
    }
    jobInfo.messages = filterHistoryItemMessages(jobInfo.messages, toolInfo.type, getMessageLevel(toolInfo))

    // should remove token in jobParams and toolUiParameters
    let jobParamsWithoutToken = submissionData.jobParams
    let toolUiParametersWithoutToken = submissionData.toolUiParameters
    if (jobParamsWithoutToken !== null && jobParamsWithoutToken !== undefined) {
      jobParamsWithoutToken = sanitizeTokensFromJobParams(submissionData.jobParams)
      if (toolUiParametersWithoutToken !== null && toolUiParametersWithoutToken !== undefined) {
        toolUiParametersWithoutToken = sanitizeTokensFromJobParams(submissionData.toolUiParameters)
      }
    }
    const newHistoryItem: HistoryItemWithDs = {
      ...submissionData,
      jobParams: jobParamsWithoutToken,
      toolUiParameters: toolUiParametersWithoutToken,
      id: uuidv1(),
      category: 'tools',
      toolId,
      jobInfo,
      startTimestamp: new Date().getTime(), // UTC timestamp
      endTimestamp: undefined,
      results: null
    }
    setHistoryListFromTools((list) => {
      return [...list, newHistoryItem]
    })
    showJobStatusAlert(newHistoryItem)
    setSelectedTab('history')
    setCurrentHistoryId('')
  }, [setHistoryListFromTools, showJobStatusAlert, toolList])

  const handleJobStatusChange = useCallback(async (jobInfo: __esri.JobInfo, results?: __esri.ParameterValue[]) => {
    const historyIndex = historyListFromTools.findIndex((item) => item.jobInfo?.jobId === jobInfo?.jobId)
    if (historyIndex === -1) {
      return
    }
    const originHistory = historyListFromTools[historyIndex]
    const { toolId } = originHistory
    const toolInfo = toolList.find((tool) => tool.id === toolId)
    if (!toolInfo) {
      return
    }
    jobInfo.messages = filterHistoryItemMessages(jobInfo.messages, toolInfo.type, getMessageLevel(toolInfo))
    const historyProps: Partial<HistoryItemWithDs> = {}
    historyProps.jobInfo = jobInfo

    // Check if job finished
    if (jobDidComplete(jobInfo.jobStatus)) {
      // if (jobInfo.jobStatus !== 'job-succeeded' && jobInfo.jobStatus !== 'job-cancelled') {
      //   // This is set for instances where analysisCoreResultDataComplete is not called.
      //   history.endTimestamp = Date.now()
      // }
      historyProps.endTimestamp = Date.now()
    }

    if (results) {
      const filteredResults = removeEmptyResults(results)
      historyProps.results = filteredResults
    }

    // update the end timestamp and results for history first
    setHistoryListFromTools((list) => {
      const newList = [...list]
      const history = { ...newList[historyIndex], ...historyProps }
      newList[historyIndex] = history

      if (jobDidComplete(history.jobInfo.jobStatus)) {
        showJobStatusAlert(history)
      }
      return newList
    })

    if (results) {
      const { dsMap, dsCreateError } = await createDsByResults(widgetId, toolInfo.type, historyProps.results, toolInfo.config.output, originHistory, dsOrderRef)
      if (toolInfo.type !== ToolType.Custom && (toolInfo.config as StandardToolConfig).output.addResultLayersToMapAuto && dsMap) {
        if (dsMap.size === 1) {
          const ds = Array.from(dsMap.values())[0]
          addLayerToMapByDs(ds, currentJimuMapView, toolInfo.id)
        } else {
          // for standard tools has multiple layers in result, if open add to map auto,
          // use feature service url to create a new temp dataSource to ensure all layers are added to map as a whole like map viewer,
          // destroy the dataSource after added to map
          const featureServiceUrls = new Set<string>(
            results
              .map((r) => (r.value as any)?.url)
              .filter((url) => !!url)
              .map((url) => dataSourceUtils.getFullArcGISServiceUrl(url, false))
          )
          for (const serviceUrl of featureServiceUrls) {
            try {
              const dsId = getNextResultDsId(widgetId, dsOrderRef.current)
              const dsJson = await getDsJsonFromArcGISService(serviceUrl, dsId)
              const ds = await DataSourceManager.getInstance().createDataSource({
                id: dsId,
                dataSourceJson: Immutable(dsJson).set('label', dataSourceUtils.getLabelFromArcGISServiceUrl(serviceUrl))
              } as FeatureLayerDataSourceConstructorOptions)

              await addLayerToMapByDs(ds, currentJimuMapView, toolInfo.id)
              DataSourceManager.getInstance().destroyDataSource(dsId)
            } catch (error) {
              console.log('add to map auto error', error)
            }
          }
        }
      }
      if (toolInfo.type === ToolType.Custom && dsMap) {
        const addToMapAutoInfo = (toolInfo.config as StandardToolConfig).output.addResultLayersToMapAuto
        dsMap.forEach((ds, key) => {
          const index = getCustomToolResultIndexByDsMapKey(key)
          const paramName = results[index].paramName
          const allowAddToMapAuto = addToMapAutoInfo?.[paramName]
          if (allowAddToMapAuto) {
            addLayerToMapByDs(ds, currentJimuMapView, toolInfo.id, toolInfo.config.output as CustomToolOutput, paramName)
          }
        })
      }
      // after data source is created, update the history list
      setHistoryListFromTools((list) => {
        const newList = [...list]
        newList[historyIndex] = { ...newList[historyIndex], dsMap, dsCreateError }
        return newList
      })
    }
  }, [currentJimuMapView, historyListFromTools, setHistoryListFromTools, showJobStatusAlert, toolList, widgetId])

  // use widgetContainer to listen to analysisCore events to ensure the task can be finished even if the tool panel is closed
  const [widgetContainer, setWidgetContainer] = useState<HTMLDivElement>(null)

  const [jobStartInfo, setJobStartInfo] = useState<{ toolId: string, jobInfo: __esri.JobInfo, submissionData: SubmissionData }>()
  const [jobStatusChangeInfo, setJobStatusChangeInfo] = useState<{ jobInfo: __esri.JobInfo, results?: __esri.ParameterValue[] }>()

  useEffect(() => {
    if (jobStartInfo) {
      const { toolId, jobInfo, submissionData } = jobStartInfo
      handleJobStart(toolId, jobInfo, submissionData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStartInfo])

  useEffect(() => {
    if (jobStatusChangeInfo) {
      const { jobInfo, results } = jobStatusChangeInfo
      handleJobStatusChange(jobInfo, results)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobStatusChangeInfo])

  useEffect(() => {
    if (widgetContainer) {
      widgetContainer.addEventListener(AnalysisCoreEvents.JobSubmited, (e: AnalysisToolAppContainerCustomEvent<AnalysisGPJobSubmitted>) => {
        const { toolId, submissionData, jobInfo } = e.detail
        setJobStartInfo({ toolId, jobInfo, submissionData })
      })
      widgetContainer.addEventListener(AnalysisCoreEvents.JobStatus, (e: AnalysisToolAppContainerCustomEvent<AnalysisGPJobStatus>) => {
        const { jobInfo } = e.detail
        setJobStatusChangeInfo({ jobInfo })
      })
      widgetContainer.addEventListener(AnalysisCoreEvents.ResultDataComplete, (e: AnalysisToolAppContainerCustomEvent<AnalysisJobResults>) => {
        const { jobInfo, results } = e.detail
        if (jobInfo.jobId.includes(analysisCoreRef.current.ClientJobIdPrefix)) {
          // For sync jobs JobSubmited and ResultDataComplete events are emitted at the same time,
          // so the update of results should delay to make sure the history item created.
          setTimeout(() => {
            setJobStatusChangeInfo({ jobInfo, results })
          })
        } else {
          setJobStatusChangeInfo({ jobInfo, results })
        }
      })
    }
  }, [widgetContainer])

  const [currentHistoryId, setCurrentHistoryId] = useState('')

  useEffect(() => {
    if (!historyList.length) {
      setCurrentHistoryId('')
    }
  }, [historyList?.length])

  const currentHistoryDetail = useMemo(() => {
    if (!currentHistoryId) {
      return null
    }
    return historyList.find((h) => h.id === currentHistoryId)
  }, [historyList, currentHistoryId])

  const currentHistoryToolInfo = useMemo(() => {
    return toolList.find((tool) => tool.id === currentHistoryDetail?.toolId) as ImmutableObject<ToolConfig>
  }, [currentHistoryDetail?.toolId, toolList])

  const handleOpenTool = (historyId: string) => {
    // when open tool, reset currentToolId and openedTool first, then set openedTool in next render, this can force render the AnalysisTool
    // this can fix both credit clean and console error when click "open tool"
    onToolBack()
    setOpenedHistoryId(historyId)
  }

  useEffect(() => {
    if (openedHistoryId) {
      const historyItem = historyList.find((h) => h.id === openedHistoryId)
      if (!historyItem) {
        return
      }
      const toolInfo = toolList.asMutable({ deep: true }).find((tool) => tool.id === historyItem.toolId)
      if (!toolInfo) {
        return
      }
      setOpenedTool({
        toolInfo,
        jobParams: historyItem?.jobParams,
        toolUiParameters: historyItem?.toolUiParameters
      })
      setSelectedTab('tools')
      setOpenedHistoryId('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedHistoryId])

  const handleRemoveHistory = (historyId: string) => {
    const index = historyListFromTools.findIndex((h) => h.id === historyId)
    if (index < 0) {
      return
    }
    const newHistoryList = [...historyListFromTools]
    const removedHistory = newHistoryList.splice(index, 1)[0]
    if (removedHistory.dsMap) {
      destroyDataSources([removedHistory.dsMap], widgetId)
    }
    setHistoryListFromTools(newHistoryList)
  }

  const [historyIdToCancel, setHistoryIdToCancel] = useState('')

  const handleCancelJob = async (historyId: string) => {
    const index = historyListFromTools.findIndex((h) => h.id === historyId)
    const historyItemToCancel = historyListFromTools[index]
    const tool = toolList.find((tool) => tool.id === historyItemToCancel.toolId)
    if (!tool) {
      return
    }
    const jobInfo = historyItemToCancel.jobInfo
    if (jobInfo.jobStatus !== AnalysisJobStatus.Executing) {
      return
    }
    const { jobStatus, messages } = await analysisCoreRef.current.cancelJob(historyItemToCancel.jobInfo, widgetContainer)

    // for case: job already completed in waitForJobCompletion, but cancelJob return an uncompleted status, like: job-cancelling (depend on the two promises's return order)
    if (jobDidComplete(historyItemToCancel.jobInfo.jobStatus) && !jobDidComplete(jobStatus)) {
      return
    }

    // for case: cancelJob throw error, so after cancelJob, the job is still uncompleted, but cancelJob interrupt the waitForJobCompletion polling, start a new polling here
    if (!jobDidComplete(jobStatus)) {
      let newJobInfo = jobInfo
      while (!jobDidComplete(newJobInfo.jobStatus)) {
        await wait(500)
        newJobInfo = await newJobInfo.checkJobStatus()
        // notify on every update while cancelling
        notifyJobStatus(widgetContainer, { jobInfo: newJobInfo })
      }
      return
    }

    // for case: cancel success and job not completed in waitForJobCompletion
    if (jobStatus !== historyItemToCancel.jobInfo.jobStatus) {
      jobInfo.jobStatus = jobStatus
      jobInfo.messages = filterHistoryItemMessages(messages, tool.type, getMessageLevel(tool))
    }
    handleJobStatusChange(jobInfo)
  }

  const [backFromHistoryId, setBackFromHistoryId] = useState('')

  const handleHistoryBack = useCallback(() => {
    setCurrentHistoryId('')
    setBackFromHistoryId(currentHistoryId)
  }, [currentHistoryId])

  const signIn = useCallback((toolInfo: ImmutableObject<ToolConfig>) => {
    if (toolInfo.type === ToolType.Custom) {
      // custom tool will show tool detail directly, will sign in only if click run button
      return updatePortal(false)
    }
    if (SessionManager.getInstance().getMainSession()) {
      // already signed in, but in other widgets, this widget does not init portal instance yet or does not have user info
      if (!portal?.user?.username) {
        return updatePortal()
      } else {
        // already signed in, and has user info
        return Promise.resolve()
      }
    }
    // not signed in
    return SessionManager.getInstance().signIn().then(() => {
      updatePortal()
    }).catch((error) => {
      return Promise.reject(new Error(error))
    })
  }, [portal, updatePortal])

  const canAccessAnalysisEngines = useAnalysisEnginesAccess(portal)

  const isRTL = ReactRedux.useSelector((state: IMState) => {
    return state.appContext.isRTL
  })

  const currentDisplayedToolProps = useMemo(() => {
    if (!currentToolInfo && !openedTool) {
      return null
    }
    const presetMapHistory = currentToolInfo
      ? historyListFromMap.find((h) => {
        return currentToolInfo.type !== ToolType.Custom && (currentToolInfo.config.option as StandardToolOption).presetFromMapHistoryId === h.id
      })
      : null

    const toolInfo = Immutable(currentToolInfo || openedTool.toolInfo)
    return {
      locale,
      theme,
      appContainer: widgetContainer,
      widgetId,
      jimuMapView: currentJimuMapView,
      portal,
      toolInfo,
      jobParams: lodash.cloneDeep(openedTool ? openedTool.jobParams : presetMapHistory ? presetMapHistory.jobParams : undefined),
      toolUiParameters: openedTool ? openedTool.toolUiParameters : presetMapHistory ? presetMapHistory.toolUiParameters : undefined,
      disableBack: toolList.length === 1,
      translatedTitle: toolList.length === 1 ? getDisplayedToolName(toolInfo) : undefined,
      hasAccess: toolInfo.type === ToolType.Custom ? true : canAccessAnalysisEngines(toolInfo.analysisEngine),
      jobParamsFromOtherWidgets: mutableStateProps?.toolId === toolInfo.id && mutableStateProps?.input ? mutableStateProps?.input : undefined,
      isRTL,
      updateJobParamsFromOtherWidgets: updateMutableStateInput,
      onBack: onToolBack,
      signIn
    }
  }, [canAccessAnalysisEngines, currentJimuMapView, currentToolInfo, getDisplayedToolName, historyListFromMap, isRTL, locale, mutableStateProps?.input, mutableStateProps?.toolId, onToolBack, openedTool, portal, signIn, theme, toolList.length, updateMutableStateInput, widgetContainer, widgetId])

  const isClassicTheme = uiHooks.useClassicTheme()

  const style = useStyle(isRTL, !toolList.length, isClassicTheme)

  // set analysis input data action
  useEffect(() => {
    const currentOpenedToolId = (currentToolInfo || openedTool?.toolInfo)?.id
    if (mutableStateProps?.toolId) {
      if (currentOpenedToolId !== mutableStateProps?.toolId) {
        setCurrentToolId(mutableStateProps.toolId)
      }
      if (selectedTab !== 'tools') {
        setSelectedTab('tools')
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutableStateProps?.toolId])

  const historyListPlaceholderId = useMemo(() => `${widgetId}-analysis-history-list-empty-placeholder`, [widgetId])

  return loaded
    ? <Paper className='widget-analysis jimu-widget' variant='flat' css={style} ref={setWidgetContainer} shape='none'>
      {!isClassicTheme && <Global styles={getGlobalStyle} />}
      <Placeholder show={!toolList.length} />
      {toolList.length > 0 && toolInfoStrings && <Tabs className='h-100' type='underline' fill defaultValue='tools' value={selectedTab} onChange={setSelectedTab}>
        <Tab id='tools' title={translate('tools')}>
          <React.Fragment>
            <div className='tool-container h-100'>
              {currentDisplayedToolProps
                ? <AnalysisTool {...currentDisplayedToolProps} />
                : <ToolList toolList={toolList} backFromToolId={backFromToolId} onSelect={setCurrentToolId} />}
            </div>
          </React.Fragment>
        </Tab>
        <Tab id='history' title={translate('history')} aria-describedby={!historyList.length ? historyListPlaceholderId : undefined}>
          <Alert className='job-status-alert' autoFocus closable withIcon form="basic" open={!!jobStatusAlertInfo} onClose={() => { setJobStatusAlertInfo(null) }} text={jobStatusAlertInfo?.text} type={jobStatusAlertInfo?.type} />
          {currentHistoryDetail && currentHistoryToolInfo
            ? <HistoryDetail historyItem={currentHistoryDetail} portal={portal} widgetId={widgetId} toolInfo={currentHistoryToolInfo} jimuMapView={currentJimuMapView} onBack={handleHistoryBack} signIn={signIn} />
            : <HistoryList
                portal={portal} historyList={historyList}
                toolList={toolList}
                backFromHistoryId={backFromHistoryId}
                placeholderId={historyListPlaceholderId}
                onViewDetails={setCurrentHistoryId} onOpenTool={handleOpenTool}
                onRemove={handleRemoveHistory} onCancelJob={setHistoryIdToCancel} />}
        </Tab>
      </Tabs>}
      <JimuMapViewComponent
        useMapWidgetId={useMapWidgetIds?.[0]}
        onActiveViewChange={setCurrentJimuMapView}
      />
      <AlertPopup
        okLabel={translate('cancelAnalysis')} cancelLabel={translate('keepRunning')} hideHeader isOpen={!!historyIdToCancel}
        onClickOk={() => {
          handleCancelJob(historyIdToCancel)
          setHistoryIdToCancel('')
        }}
        onClickClose={() => { setHistoryIdToCancel('') }}>
        {translate('cancelWarningText')}
      </AlertPopup>
    </Paper>
    : <Loading />
}

Widget.versionManager = versionManager

export default Widget
