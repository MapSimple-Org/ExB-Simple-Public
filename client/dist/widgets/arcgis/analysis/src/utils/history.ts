import { type AnalysisHistory, loadSavedResource, parseSerializedHistoryItem, InProgressStatuses, type AnalysisHistoryItem, FeatureCollectionResultKey } from '@arcgis/analysis-shared-utils'
import type { JimuMapView } from 'jimu-arcgis'
import { type DataSource, Immutable, React, utils, type ImmutableArray, lodash } from 'jimu-core'
import { type ToolConfig, type HistoryItemWithDs, type SerializedHistoryItem, ToolType, type IMConfig } from '../config'
import { createDsByResults, jobDidComplete } from '../runtime/utils'
import { useGPMessageStrings } from './strings'
import { completeHistoryInfo } from './job'
import { depthTraversalProcessingValue, destroyDataSources, filterHistoryItemMessages, getEnumerableObjectFromAccessor, getMessageLevel, getToolTypeByAnalysisType, isSameToolAsHistoryItem, resultValueIsFeatureCollectionJson, resultValueIsFeatureLayer, resultValueIsFeatureSet, setValueToResultById } from './util'
import { AnalysisType, type LocaleItem } from '@arcgis/analysis-ui-schema'

interface JobCompleteInfo {
  jobInfo: __esri.JobInfo
  results?: __esri.ParameterValue[]
  id: string
}

export const HISTORY_FILE_NAME = 'file1.json'

export const HISTORY_STORAGE_KEY = 'analysis/history'

function getMapHistoryId (history: AnalysisHistoryItem | HistoryItemWithDs) {
  return `${history.toolName}-${history.jobInfo?.jobId}-${history.startTimestamp}-${history.endTimestamp || 0}`
}

export const loadAnalysisHistoryResourceItemsFromMap = async (jimuMapView: JimuMapView, portal: __esri.Portal) => {
  try {
    const loadedResources = await loadSavedResource<AnalysisHistory>(`${HISTORY_STORAGE_KEY}/${HISTORY_FILE_NAME}`, (jimuMapView?.view?.map as __esri.WebMap)?.portalItem)
    if (loadedResources !== undefined) {
      const allItems = loadedResources.items ?? []
      if (!allItems.length) {
        return []
      }
      // const allValidToolsList = await getAllValidToolsList(tools, portal)
      // // tool name is not unique, raster tool and standard tool may have same name, must use toolName-analysisEngine
      // const validToolNames = new Set(allValidToolsList.map((t) => `${t.toolName}-${t.analysisEngine}`))
      // return allItems.filter((item) => validToolNames.has(`${item.toolName}-${item.analysisEngine}`))
      return allItems.filter((item) => item.analysisType !== AnalysisType.WebTool).map((item) => {
        // Change name for SummarizeRasterWithin and CreateViewshed tools
        if (item.toolName === 'SummarizeRasterWithin') {
          item.toolName = 'ZonalStatistics'
        }
        if (item.toolName === 'CreateViewshed') {
          item.toolName = 'GeodesicViewshed'
        }
        return item
      })
    }
  } catch (error) {
    console.error('Load analysis history resource from map error', error)
  }
  return []
}

export const useParsedHistoryResourceFromMap = (config: IMConfig, oldHistoryFromMapList?: HistoryItemWithDs[]) => {
  const { toolList, historyResourceItemsFromMap, displayToolHistoryFromMap } = config
  const parsedHistoryResource = React.useMemo(() => {
    if (!historyResourceItemsFromMap?.length) {
      return []
    }
    return historyResourceItemsFromMap.asMutable({ deep: true }).map((r) => {
      const resource = lodash.cloneDeep(r)
      // since analysis component team did not handle with the history saved in map in old version, must handle it here
      // the new history result structure like: [{ dataType: 'string', paramName: 'outputRaster', value: '{"itemId":"f9110a17f8034f1dac5351fc884a476e","url":"https://tiledimageservices1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/rfx abs r01/ImageServer"}' }]
      // the old history result structure like: [{ itemId: '538aa0f298b64a259b757d940efda712', url: 'https://tiledimageservices1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/test Zonal Statistics history/ImageServer' }]
      // the old history has no value property or has two level property value, so these two cases need to be handled here
      resource.results = resource.results?.map((r: any) => {
        if (!r?.value) {
          return { value: r }
        }
        if (r?.value?.value) {
          return r.value
        }
        return r
      })
      const parsedSerializedHistoryItem = parseSerializedHistoryItem(resource)
      const toolId = toolList.find((t) => isSameToolAsHistoryItem(t, parsedSerializedHistoryItem))?.id
      const historyId = getMapHistoryId(parsedSerializedHistoryItem)
      const oldHistory = oldHistoryFromMapList?.find((h) => h.id === historyId)
      return {
        ...parsedSerializedHistoryItem,
        toolId,
        type: getToolTypeByAnalysisType(parsedSerializedHistoryItem.analysisType),
        id: historyId,
        results: parsedSerializedHistoryItem.results?.map((r: any) => {
          if (r.value?.value) {
            return r.value
          }
          if (!r.value) {
            return { value: r }
          }
          return r
        }),
        // use dsMap of old history to avoid dataSource recreate
        dsMap: oldHistory?.dsMap
      } as unknown as HistoryItemWithDs
    }).filter((item) => item.toolId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyResourceItemsFromMap, toolList])

  return React.useMemo(() => {
    if (!displayToolHistoryFromMap) {
      return []
    }
    return parsedHistoryResource
  }, [displayToolHistoryFromMap, parsedHistoryResource])
}

export function getOldHistoryListStorageKey (widgetId: string) {
  const appKey = utils.getLocalStorageAppKey()
  return `${appKey}-${widgetId}-history-list`
}

export function getHistoryListStorageKey (widgetId: string) {
  const appKey = utils.getLocalStorageAppKey()
  return `${appKey}-analysis-${widgetId}-history-list`
}

export function loadHistoryListFromLocalStorage (widgetId: string, toolList: Immutable.ImmutableArray<ToolConfig>) {
  const useCache = !window.jimuConfig.isInBuilder
  if (!useCache) {
    return []
  }
  const oldKey = getOldHistoryListStorageKey(widgetId)
  const key = getHistoryListStorageKey(widgetId)
  const localListString = utils.readLocalStorage(key) || utils.readLocalStorage(oldKey)
  const list = JSON.parse(localListString) as SerializedHistoryItem[] || []
  return list.map((item) => {
    const parsedHistoryItem = parseSerializedHistoryItem(item as any) as unknown as HistoryItemWithDs
    return parsedHistoryItem
  }).filter((item) => !!toolList.find((tool) => tool.id === item.toolId))
}

function handleNestedValue (value: __esri.ParameterValue['value']) {
  if (Array.isArray(value)) {
    return value.map((v: __esri.ParameterValue['value']) => {
      return handleNestedValue(v)
    })
  } else {
    return getEnumerableObjectFromAccessor(value as __esri.Accessor)
  }
}

export function saveHistoryListToLocalStorage (widgetId: string, newHistoryList: HistoryItemWithDs[], toolList: ImmutableArray<ToolConfig>) {
  const useCache = !window.jimuConfig.isInBuilder
  if (!useCache) {
    return
  }
  const serializedHistoryList = newHistoryList
    .filter((item) => !item.isImportedFromMap && item.jobInfo !== undefined && item.jobInfo.jobId !== undefined && item.jobInfo.jobStatus !== undefined && item.jobInfo.jobStatus !== null)
    .map((historyItem) => {
      const isCustomTool = toolList.find((tool) => tool.id === historyItem.toolId)?.type === ToolType.Custom
      const updatedHistoryItem: SerializedHistoryItem = {
        ...Immutable(historyItem).without(['isImportedFromMap', 'dsMap', 'dsCreateError'] as unknown as keyof HistoryItemWithDs).asMutable({ deep: true }),
        jobInfo: JSON.stringify({
          jobId: historyItem.jobInfo.jobId,
          jobStatus: historyItem.jobInfo.jobStatus,
          messages: historyItem.jobInfo.messages,
          declaredClass: historyItem.jobInfo.declaredClass,
          requestOptions: historyItem.jobInfo.requestOptions,
          sourceUrl: historyItem.jobInfo.sourceUrl
        }),
        results: historyItem.results?.map((r, index) => {
          const storedValue: Partial<__esri.ParameterValue['value']> = handleNestedValue(r.value)
          const result: any = { dataType: r.dataType, value: storedValue }
          if (r.paramName) {
            result.paramName = r.paramName
          }
          // if result is from custom tool, delete featureSet and feature layer values
          if (isCustomTool) {
            depthTraversalProcessingValue(result.value, `${index}`, (id: string, value: __esri.ParameterValue['value']) => {
              if (resultValueIsFeatureSet(value) || resultValueIsFeatureLayer(value) || resultValueIsFeatureCollectionJson(value)) {
                // use FeatureCollectionResultKey to replace locale featureSet or featureCollection data to sync up with components
                // when read FeatureCollectionResultKey value from local storage, should show inaccessible error
                setValueToResultById(id, result, FeatureCollectionResultKey)
              }
            })
          }
          return result
        })
      }
      return updatedHistoryItem
    })
  const key = getHistoryListStorageKey(widgetId)
  if (!serializedHistoryList.length) {
    utils.removeFromLocalStorage(key)
    return
  }
  utils.setLocalStorage(key, JSON.stringify(serializedHistoryList))
}

function getJobInfoUpdatedHistoryList (list: HistoryItemWithDs[], isImportedFromMap: boolean, toolList: Immutable.ImmutableArray<ToolConfig>, gpMessages: LocaleItem) {
  const waitJobCompletePromises: Array<Promise<JobCompleteInfo>> = []
  const updateJobInfoPromises = list.map(async (item) => {
    // Only update jobInfo for historyItems that are still executing.
    const newItem = { ...item }
    let needFilterMessagesByMessageLevel = true
    if (InProgressStatuses.includes(newItem.jobInfo.jobStatus)) {
      try {
        newItem.jobInfo = await newItem.jobInfo.checkJobStatus()
        if (jobDidComplete(newItem.jobInfo.jobStatus)) {
          // if job is completed, wait and update history info directly(for reopen cases: run a job, close page, reopen page after long time)
          const { jobInfo, results } = await completeHistoryInfo(newItem, isImportedFromMap, toolList, gpMessages)
          newItem.jobInfo = jobInfo
          newItem.results = results
        } else {
          // if job is not completed, store and handle it later(for refresh cases: run a job, refresh page)
          waitJobCompletePromises.push(completeHistoryInfo(newItem, isImportedFromMap, toolList, gpMessages).then(({ jobInfo, results }) => {
            return {
              id: newItem.id,
              jobInfo,
              results
            }
          }))
        }
      } catch (error) {
        console.log('check job status error', error)
      }
    } else {
      // if the history has finished, should not filter the messages by message level since they are already filtered when store in local storage.
      needFilterMessagesByMessageLevel = false
    }
    const toolInfo = toolList.find((t) => t.id === item.toolId)
    newItem.jobInfo.messages = filterHistoryItemMessages(newItem.jobInfo.messages, toolInfo.type, getMessageLevel(toolInfo), needFilterMessagesByMessageLevel)
    return {
      ...newItem,
      isImportedFromMap
    } as unknown as HistoryItemWithDs
  })
  return {
    updateJobInfoPromises,
    waitJobCompletePromises
  }
}

export const useHistoryListFromMap = (config: IMConfig, widgetId: string, gpMessages?: LocaleItem) => {
  const [historyListFromMap, setHistoryListFromMap] = React.useState<HistoryItemWithDs[]>([])

  const { toolList } = config

  const parsedHistoryResourceFromMap = useParsedHistoryResourceFromMap(config, historyListFromMap)

  const updateId = React.useRef(0)

  React.useEffect(() => {
    if (!parsedHistoryResourceFromMap?.length) {
      setHistoryListFromMap([])
      return
    }

    updateId.current++
    const currentUpdateId = updateId.current

    const { updateJobInfoPromises, waitJobCompletePromises } = getJobInfoUpdatedHistoryList(parsedHistoryResourceFromMap, true, toolList, gpMessages)
    Promise.allSettled(updateJobInfoPromises).then((res) => {
      if (updateId.current > currentUpdateId) {
        return
      }

      const list = (res.filter((item) => item.status === 'fulfilled') as unknown as Array<PromiseFulfilledResult<HistoryItemWithDs>>).map((item) => item.value)
      setHistoryListFromMap(list)
      Promise.allSettled(waitJobCompletePromises).then((res) => {
        if (updateId.current > currentUpdateId) {
          return
        }
        const resultInfos = (res.filter((item) => item.status === 'fulfilled') as unknown as Array<PromiseFulfilledResult<JobCompleteInfo>>).map((item) => item.value)
        if (resultInfos.length) {
          const newList = list.map((h) => {
            const matchedResult = resultInfos.find((r) => r.id === h.id)
            if (matchedResult) {
              h.jobInfo = matchedResult.jobInfo
              h.results = matchedResult.results
              h.endTimestamp = Date.now()
            }
            return h
          })
          setHistoryListFromMap(newList)

          // destroy dataSource of deleted history
          const dataSourcesNeedToDestroy: Array<Map<string, DataSource>> = []
          historyListFromMap.forEach((history) => {
            if (!newList.find((l) => l.id === history.id) && history.dsMap) {
              dataSourcesNeedToDestroy.push(history.dsMap)
            }
          })
          if (dataSourcesNeedToDestroy.length) {
            destroyDataSources(dataSourcesNeedToDestroy, widgetId)
          }
        }
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedHistoryResourceFromMap])

  return { historyListFromMap, parsedHistoryResourceFromMap }
}

const useUpdateHistoryByJobCompleteInfo = (widgetId: string, dsOrderRef: React.MutableRefObject<number>, jobCompleteInfos: JobCompleteInfo[], toolList: Immutable.ImmutableArray<ToolConfig>, historyList: HistoryItemWithDs[], setHistoryList: (list: HistoryItemWithDs[]) => void) => {
  React.useEffect(() => {
    if (!jobCompleteInfos.length) {
      return
    }
    const createDsPromises = []
    const newList = historyList.map((h) => {
      const matchedResult = jobCompleteInfos.find((r) => r.id === h.id)
      if (matchedResult) {
        h.jobInfo = matchedResult.jobInfo
        h.results = matchedResult.results
        h.endTimestamp = Date.now()
        if (h.results?.length) {
          const tool = toolList.find((tool) => tool.id === h.toolId)
          createDsPromises.push(createDsByResults(widgetId, tool.type, h.results, tool.config.output, h, dsOrderRef))
        }
      }
      return h
    })
    if (createDsPromises.length) {
      Promise.allSettled(createDsPromises).then(() => {
        setHistoryList(newList)
      })
    } else {
      setHistoryList(newList)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobCompleteInfos])
}

// combine with tool history and map history
export const useHistoryList = (widgetId: string, currentJimuMapView: JimuMapView, config: IMConfig, dsOrderRef: React.MutableRefObject<number>) => {
  const { toolList } = config
  const gpMessages = useGPMessageStrings()

  const { historyListFromMap } = useHistoryListFromMap(config, widgetId, gpMessages)
  const [historyListFromTools, setHistoryListFromTools] = React.useState<HistoryItemWithDs[]>([])

  const [historyFromStorageLoaded, setHistoryFromStorageLoaded] = React.useState(false)
  const [jobCompleteInfos, setJobCompleteInfos] = React.useState<JobCompleteInfo[]>([])
  React.useEffect(() => {
    if (!gpMessages) {
      return
    }
    const historyListFromLocalStorage = loadHistoryListFromLocalStorage(widgetId, toolList)
    if (!historyListFromLocalStorage.length) {
      setHistoryFromStorageLoaded(true)
      return
    }
    const { updateJobInfoPromises, waitJobCompletePromises } = getJobInfoUpdatedHistoryList(historyListFromLocalStorage, false, toolList, gpMessages)
    Promise.allSettled(updateJobInfoPromises).then((res) => {
      setHistoryFromStorageLoaded(true)
      const values = res.map((item: PromiseFulfilledResult<HistoryItemWithDs>) => item.value)
      // create ds for history completed from local storage
      Promise.allSettled(values.map((v) => {
        const tool = toolList.find((tool) => tool.id === v.toolId)
        return createDsByResults(widgetId, tool.type, v.results, tool.config.output, v, dsOrderRef)
      })).then(() => {
        setHistoryListFromTools(values)
        // wait for running history completed
        Promise.allSettled(waitJobCompletePromises).then((res) => {
          const resultInfos = (res.filter((item) => item.status === 'fulfilled') as unknown as Array<PromiseFulfilledResult<JobCompleteInfo>>).map((item) => item.value)
          if (resultInfos.length) {
            setJobCompleteInfos(resultInfos)
          }
        })
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gpMessages])

  useUpdateHistoryByJobCompleteInfo(widgetId, dsOrderRef, jobCompleteInfos, toolList, historyListFromTools, setHistoryListFromTools)

  // store history list to localStorage
  React.useEffect(() => {
    if (!historyFromStorageLoaded) {
      return
    }
    saveHistoryListToLocalStorage(widgetId, historyListFromTools, toolList)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyListFromTools])

  React.useEffect(() => {
    if (!historyListFromMap) {
      return
    }
    historyListFromMap.forEach((v) => {
      if (!v.results?.length) {
        return
      }
      const tool = toolList.find((tool) => tool.id === v.toolId)
      if (!v.dsMap) {
        createDsByResults(widgetId, tool.type, v.results, tool.config.output, v, dsOrderRef)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyListFromMap])

  React.useEffect(() => {
    const dataSourcesNeedToDestroy: Array<Map<string, DataSource>> = []
    // if tool is deleted in toolList delete the history and destroy the dataSources
    const listFromTools = historyListFromTools.filter((h) => {
      const tool = toolList.find((tool) => tool.id === h.toolId)
      if (!tool) {
        if (h.dsMap) {
          dataSourcesNeedToDestroy.push(h.dsMap)
        }
        return false
      }
      return true
    })
    if (dataSourcesNeedToDestroy.length) {
      destroyDataSources(dataSourcesNeedToDestroy, widgetId)
    }
    setHistoryListFromTools(listFromTools)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolList])

  const historyList = React.useMemo(() => {
    return [...historyListFromMap, ...historyListFromTools]
  }, [historyListFromMap, historyListFromTools])

  return {
    historyListFromMap: historyListFromMap,
    historyListFromTools,
    historyList,
    setHistoryListFromTools
  }
}
