import { buildProcessInfoReport, updateItemProperties, isEmptyValue, formatAnalysisEngineSuffix, getResultParams, generateUniqueId, ErrorKeywords, throwError } from '@arcgis/analysis-shared-utils'
import type { ItemId, AnalysisToolInfo, LocaleItem } from '@arcgis/analysis-ui-schema'
import { type HistoryItemWithDs, ToolType, type ToolConfig, type CustomToolConfig, type SynchronousJobExecuteResult } from '../config'
import memoize from 'lodash-es/memoize'
import { type ImmutableArray, loadArcGISJSAPIModule } from 'jimu-core'
import { getAnalysisAssetPath } from './strings'
import type { ExecuteProps } from '@arcgis/analysis-core'
import { notifyJobStatus, notifyResultData } from './events'
import { isAccessBlockedError, outputIsIncludedInMapServiceLayer } from './util'

export async function addProcessInfoToItems (results: __esri.ParameterValue[], processInfo?: string): Promise<void> {
  const itemUpdatePromises: Array<Promise<__esri.PortalItem>> = []
  results.forEach((result) => {
    // The result must have an item id for the process info to be added to the description
    const hasItemId = typeof result.value === 'object' && 'itemId' in result.value && !isEmptyValue(result.value.itemId)
    if (hasItemId && processInfo !== undefined) {
      const itemId = (result.value as ItemId).itemId
      itemUpdatePromises.push(updateItemProperties(itemId, { description: processInfo }))
    }
  })
  await Promise.all(itemUpdatePromises)
}

// eslint-disable-next-line max-params
export async function waitForJobCompletionAndGetResults (
  jobInfo: __esri.JobInfo,
  toolUrl: string,
  statusCallback: (j: __esri.JobInfo) => void,
  gpMessages: LocaleItem,
  resultParams: string[],
  resultMapServerName: string,
  resultParamsNotInMapService: string[],
  formatResultFn?: (result: __esri.ParameterValue, resultParam: string, id: string) => Promise<__esri.ParameterValue>
) {
  const options = {
    interval: 1500,
    statusCallback: (j: __esri.JobInfo) => {
      statusCallback(j)
    }
  }
  // returnFeatureCollection is not in the typings
  const gpOptions: any = { returnFeatureCollection: !!toolUrl }
  try {
    await jobInfo.waitForJobCompletion(options)
    let processInfo: string | undefined
    if (resultParams.includes('processInfo')) {
      try {
        const processInfoParamValue = await jobInfo.fetchResultData('processInfo', gpOptions)
        processInfo = buildProcessInfoReport(processInfoParamValue.value as string[], gpMessages as { [key: string]: string })
        // We have processed it specially, delete in place
        const indexToDelete = resultParams.indexOf('processInfo')
        resultParams.splice(indexToDelete, 1)
      } catch {
        // no-op, process the rest of the results on fail
      }
    }

    const getResultsByParams = async (params: string[]) => {
      const resultPromises = params.map(async (resultParam, index) => {
        const result = await jobInfo.fetchResultData(resultParam, gpOptions)
        if (typeof formatResultFn === 'function') {
          return await formatResultFn(result, resultParam, `${index}`)
        }
        return result
      })
      const allResults = await Promise.allSettled(resultPromises)
      return allResults
        .map((res, index) => {
          if (res.status === 'fulfilled') {
            res.value.paramName = params[index]
            return res
          }
          return res
        })
        .filter((res) => res.status === 'fulfilled')
        .map((fulfilledRes: PromiseFulfilledResult<__esri.ParameterValue>) => fulfilledRes.value)
    }

    if (!isEmptyValue(resultMapServerName)) {
      const ParameterValue: typeof __esri.ParameterValue = await loadArcGISJSAPIModule('esri/rest/support/ParameterValue')
      const resultMapServiceUrl = `${toolUrl.slice(0, toolUrl.lastIndexOf('/')).replace('GPServer', 'MapServer')}/jobs/${jobInfo.jobId}`
      /**
       * FIXME: Potential change discussed below can be done but requires more changes in many places , so read the below comments for clarification.
       * We could have used the following code to get the result map service, but our results fetching in studio app container assumes
       * results always returned as GPValue , here it is a JSAPI Map image layer. So we are using the above url to get the map image layer.
       * const resultMapService = await jobInfo.fetchResultMapImageLayer(jobInfo.jobId);
       * Also below we map to GPFeatureRecordSetLayer because map-image-layer is not in listed types for GPParameterValue.
       */
      const mapServiceResult = ParameterValue.fromJSON({
        dataType: 'GPFeatureRecordSetLayer',
        paramName: resultMapServerName,
        value: {
          url: resultMapServiceUrl
        }
      })

      if (resultParamsNotInMapService.length > 0) {
        const resultsNotInMapService = await getResultsByParams(resultParamsNotInMapService)
        return { results: [mapServiceResult, ...resultsNotInMapService], jobInfo: jobInfo }
      }

      return { results: [mapServiceResult], jobInfo: jobInfo }
    } else {
      const results = await getResultsByParams(resultParams)
      // Do not await so the result notifying is not waiting for the portal item to load
      addProcessInfoToItems(results, processInfo)
      return { results: results, jobInfo }
    }
  } catch (e) {
    return { jobInfo }
  }
}

async function memoizeHelperFetchPath (path: string): Promise<any> {
  const response = await fetch(path)
  const results = await response.json()
  return results
}

export async function completeHistoryInfo (historyItem: HistoryItemWithDs, importedFromMap: boolean, toolList: ImmutableArray<ToolConfig>, gpMessages: LocaleItem) {
  let resultParams: string[] = []
  historyItem.isImportedFromMap = importedFromMap
  // If the history is imported from the map, this is a standard tool, get toolJson by toolName
  // if the history is not imported from the map, and the tool is a standard tool, get toolJson by toolName
  const toolInfo = toolList.asMutable().find((tool) => tool.id === historyItem.toolId)?.asMutable({ deep: true })
  // importedFromMap && historyItem.analysisType === 'tool' means: standard tool or raster tool(ToolType.Standard)
  // if importedFromMap is true and history is from standard tool or raster tool, there will be no toolId, so toolInfo will be undefined
  // raster function does not need toolInfo
  let resultMapServerName: string
  let resultParamsNotInMapService: string[] = []
  if ((importedFromMap && historyItem.analysisType === 'tool') || toolInfo.type === ToolType.Standard) {
    const lowercaseToolName = `${historyItem.toolName.toLowerCase()}${formatAnalysisEngineSuffix(historyItem.analysisEngine)}`
    const toolJsonPath = `${getAnalysisAssetPath()}assets/tool-json/${lowercaseToolName}.tool.json`
    try {
      const toolJSON = await memoize(memoizeHelperFetchPath)(toolJsonPath) as AnalysisToolInfo
      resultParams = getResultParams(toolJSON)
    } catch (error) {
      // if fetch toolJson failed, return historyItem directly
      return historyItem
    }
  } else if (toolInfo.type === ToolType.RasterFunction) {
    resultParams = ['outputRaster']
  } else {
    // If the history is not imported from the map, and the tool is a custom tool, get toolJson from toolInfo
    const toolConfig = toolInfo.config as CustomToolConfig
    const toolJSON = toolConfig.toolInfo
    resultParams = getResultParams(toolJSON)
    resultMapServerName = toolConfig.output.ignoreResultMapServer ? undefined : (toolJSON?.serviceInfo?.resultMapServerName ?? undefined)
    resultParamsNotInMapService = toolJSON.parameters.filter((p) => !outputIsIncludedInMapServiceLayer(p)).map((p) => p.name)
  }
  const toolUrl = (toolInfo.config as CustomToolConfig).toolUrl || ''
  const { jobInfo, results } = await waitForJobCompletionAndGetResults(historyItem.jobInfo, toolUrl, (jobInfo) => null, gpMessages, resultParams, resultMapServerName, resultParamsNotInMapService)

  return { jobInfo, results }
}

/**
 * For sync jobs we don't have jobId as it is only for async jobs.
 * History workflow need a jobId so we generate a unique id for such jobs.
 * @returns {string} A unique id generated by client for job
 */
async function generateClientJobId (): Promise<string> {
  const { ClientJobIdPrefix } = await import('@arcgis/analysis-core')
  return ClientJobIdPrefix + generateUniqueId()
}

export async function executeJob (geoprocessor: __esri.geoprocessor, params: ExecuteProps, toolJson: AnalysisToolInfo, toolUrl: string, webToolServerUrl: string, ignoreResultMapServer?: boolean) {
  if (typeof geoprocessor?.submitJob !== 'function' || typeof geoprocessor?.execute !== 'function') {
    return
  }
  const {
    jobParamsPayload,
    jobParams,
    toolUiParameters,
    analysisEngine,
    analysisType,
    resultParams,
    containerElement,
    gpMessages
  } = params

  // returnFeatureCollection is not in the typings
  const gpOptions: any = { returnFeatureCollection: true }

  // for synchronous execution
  if (toolJson.executionType === 'esriExecutionTypeSynchronous') {
    // add fake jobId
    const jobId = await generateClientJobId()
    const JobInfo: typeof __esri.JobInfo = await loadArcGISJSAPIModule('esri/rest/support/JobInfo')
    try {
      const res: SynchronousJobExecuteResult = await geoprocessor.execute(toolUrl, jobParamsPayload, gpOptions)
      const { messages, results } = res

      const jobInfo = JobInfo.fromJSON({
        jobId,
        jobStatus: 'job-succeeded',
        messages,
        sourceUrl: webToolServerUrl
      })

      notifyJobStatus(containerElement, {
        jobInfo,
        submissionData: {
          toolName: toolJson.name,
          analysisEngine,
          analysisType,
          jobParams,
          toolUiParameters: toolUiParameters
        }
      })

      notifyResultData(containerElement, {
        results: results,
        jobInfo
      })
    } catch (error) {
      notifyJobStatus(containerElement, {
        jobInfo: JobInfo.fromJSON({
          jobId,
          jobStatus: 'job-failed',
          messages: Array.isArray(error?.details?.messages) ? error.details.messages.map((msg) => ({ description: msg, type: 'error' } as __esri.GPMessage)) : [],
          sourceUrl: webToolServerUrl
        }),
        submissionData: {
          toolName: toolJson.name,
          analysisEngine,
          analysisType,
          jobParams,
          toolUiParameters: toolUiParameters
        }
      })
    }
    return
  }

  // for asynchronous execution
  let jobInfo: __esri.JobInfo
  try {
    jobInfo = await geoprocessor.submitJob(toolUrl, jobParamsPayload, gpOptions)
    notifyJobStatus(containerElement, {
      jobInfo,
      submissionData: {
        toolName: toolJson.name,
        analysisEngine,
        analysisType,
        jobParams,
        toolUiParameters
      }
    })
  } catch (error) {
    // Notebook tools have an item id associated. Differentiates between notebook tool execution and gp tool execution
    // The key will be aligned in a future release. webToolItemId in online & itemId in enterprise
    const isNotebookTool = toolJson !== undefined && ('webToolItemId' in toolJson || 'itemId' in toolJson)
    // Special handling for notebook tools permission rejection
    if (error.name === 'identity-manager:not-authorized' && isNotebookTool) {
      return throwError(ErrorKeywords.NoPermissionToAccessTool, error.message)
    } else if (isNotebookTool && isAccessBlockedError(error)) {
      return throwError(ErrorKeywords.AccessBlocked, error.message)
    }

    // TODO: Change to generic permissions error without learn more link
    return throwError(ErrorKeywords.Default, error.message)
  }

  const resultMapServerName = ignoreResultMapServer ? undefined : toolJson?.serviceInfo?.resultMapServerName
  const resultParamsNotInMapService = toolJson.parameters.filter((p) => !outputIsIncludedInMapServiceLayer(p)).map((p) => p.name)

  const { results } = await waitForJobCompletionAndGetResults(jobInfo, toolUrl, (jobInfo) => {
    notifyJobStatus(containerElement, { jobInfo })
  }, gpMessages, resultParams, resultMapServerName, resultParamsNotInMapService)
  if (results) {
    notifyResultData(containerElement, { results, jobInfo })
  } else {
    notifyJobStatus(containerElement, { jobInfo })
  }
}
