/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { React, type ImmutableObject, MessageManager, DataSourcesChangeType, DataSourcesChangeMessage, type DataSource, DataSourceManager, SessionManager, ServiceManager, css, ReactRedux, type IMState, type ImmutableArray } from 'jimu-core'
import { MessageLevel, ToolType, type ToolConfig, type CustomToolOption } from '../config'

import { toCamelToolName, convertEsriMessageType, isEmptyValue, formatAnalysisEngineSuffix, canPerformStandardAnalysis, canPerformGeoAnalytics, canPerformRasterAnalysis, hasNAPrivilege, isStandardAnalysisServerAdvanced, type AnalysisHistoryItem, getRFxDefKeyFromRFT, type SerializedHistoryItem, isFeatureLayer, ErrorKeywords } from '@arcgis/analysis-shared-utils'
import { AnalysisToolParamDataType, type AnalysisToolInfo, type GPFeatureRecordSetLayer, AnalysisEngine, type AnalysisToolItem, UserPrivileges, VisibilityModes, AnalysisType, type RFxTemplate, type AnalysisToolParam, AnalysisToolParamDirection, type AnalysisServiceInfo } from '@arcgis/analysis-ui-schema'
import { useToolInfoStrings, useTranslatedRFTNamesMap } from './strings'
import { getDisplayedCustomToolName, getDisplayedStandardToolName } from './shared-utils'

const toolIconByToolName = new Map([
  // Group: SummarizeData
  ['AggregatePoints', require('jimu-icons/svg/outlined/gis/service-aggregate-points.svg')],
  ['JoinFeatures', require('jimu-icons/svg/outlined/gis/service-join-features.svg')],
  ['SummarizeCenterAndDispersion', require('jimu-icons/svg/outlined/gis/summarize-center-dispersion.svg')],
  ['SummarizeNearby', require('jimu-icons/svg/outlined/gis/service-summarize-nearby.svg')],
  ['SummarizeWithin', require('jimu-icons/svg/outlined/gis/service-summarize-within.svg')],

  // Group: FindLocations
  ['FindCentroids', require('jimu-icons/svg/outlined/gis/service-find-centroids.svg')],
  ['CreateViewshed', require('jimu-icons/svg/outlined/gis/service-create-viewshed.svg')],
  ['ChooseBestFacilities', require('jimu-icons/svg/outlined/gis/choose-best-facilities.svg')],
  ['FindExistingLocations', require('jimu-icons/svg/outlined/gis/find-by-attributes-and-locations.svg')],
  ['FindSimilarLocations', require('jimu-icons/svg/outlined/gis/find-similar-locations.svg')],
  ['CreateWatersheds', require('jimu-icons/svg/outlined/gis/service-create-watershed.svg')],
  ['TraceDownstream', require('jimu-icons/svg/outlined/gis/service-trace-downstream.svg')],

  // Group: DataEnrichment
  ['EnrichLayer', require('jimu-icons/svg/outlined/gis/service-enrich-layer.svg')],

  // Group: AnalyzePatterns
  ['CalculateDensity', require('jimu-icons/svg/outlined/gis/calculate-density.svg')],
  ['FindHotSpots', require('jimu-icons/svg/outlined/gis/service-find-hot-spots.svg')],
  ['FindOutliers', require('jimu-icons/svg/outlined/gis/service-find-outliers.svg')],
  ['FindPointClusters', require('jimu-icons/svg/outlined/gis/find-point-clusters.svg')],
  ['InterpolatePoints', require('jimu-icons/svg/outlined/gis/interpolate-points.svg')],

  // Group: UseProximity
  ['CreateBuffers', require('jimu-icons/svg/outlined/gis/create-buffers.svg')],
  ['CreateDriveTimeAreas', require('jimu-icons/svg/outlined/gis/generate-travel-areas.svg')],
  ['PlanRoutes', require('jimu-icons/svg/outlined/gis/plan-routes.svg')],
  ['FindNearest', require('jimu-icons/svg/outlined/gis/service-find-closest.svg')],
  ['ConnectOriginsToDestinations', require('jimu-icons/svg/outlined/gis/calculate-travel-cost.svg')],

  // Group: ManageData
  ['DissolveBoundaries', require('jimu-icons/svg/outlined/gis/dissolve-boundaries.svg')],
  ['ExtractData', require('jimu-icons/svg/outlined/gis/extract-data.svg')],
  ['GenerateTessellations', require('jimu-icons/svg/outlined/gis/generate-tessellations.svg')],
  ['OverlayLayers', require('jimu-icons/svg/outlined/gis/overlay-layers.svg')],
  ['MergeLayers', require('jimu-icons/svg/outlined/gis/merge-layers.svg')]
])

export function getToolIcon (toolName: string, toolType: ToolType, analysisEngine: AnalysisEngine) {
  if (toolType === ToolType.Standard) {
    if (!analysisEngine || analysisEngine === AnalysisEngine.Standard) {
      return toolIconByToolName.get(toolName) || require('jimu-icons/svg/outlined/application/hammer.svg')
    } else {
      return require('jimu-icons/svg/outlined/gis/raster-tool.svg')
    }
  }
  if (toolType === ToolType.RasterFunction) {
    return require('jimu-icons/svg/outlined/gis/raster-function.svg')
  }
  return require('jimu-icons/svg/outlined/application/hammer.svg')
}

export const useGetDisplayedToolName = () => {
  const utilitiesState = ReactRedux.useSelector((state: IMState) => {
    if (window.jimuConfig.isBuilder) {
      return state.appStateInBuilder.appConfig.utilities
    }
    return state.appConfig.utilities
  })
  const toolInfoStrings = useToolInfoStrings()

  const translatedRFTNamesMap = useTranslatedRFTNamesMap()

  return (toolInfo: ImmutableObject<ToolConfig> | ToolConfig) => {
    if (!toolInfo) {
      return ''
    }

    if (toolInfo.type === ToolType.Standard) {
      return getDisplayedStandardToolName(toolInfo.toolName, toolInfo.analysisEngine, toolInfoStrings, formatAnalysisEngineSuffix, toCamelToolName)
    }

    if (toolInfo.type === ToolType.RasterFunction) {
      return translatedRFTNamesMap.get(toolInfo.toolName) || toolInfo.toolName
    }

    return getDisplayedCustomToolName(toolInfo, utilitiesState)
  }
}

export const getCustomToolParamDisplayName = (toolJson: ImmutableObject<AnalysisToolInfo>, paramName: string) => {
  return toolJson.parameters?.find((param) => param.name === paramName)?.displayName ?? paramName
}

export function destroyDataSources (dsMapArray: Array<Map<string, DataSource>>, widgetId: string, publishMessage = true): Promise<void> {
  const dataSources = dsMapArray.reduce((acc, dsMap) => {
    dsMap.forEach((ds) => {
      acc.push(ds)
    })
    return acc
  }, [])
  // publish message
  if (publishMessage && dataSources.length > 0) {
    const dataSourcesChangeMessage = new DataSourcesChangeMessage(widgetId, DataSourcesChangeType.Remove, dataSources)
    MessageManager.getInstance().publishMessage(dataSourcesChangeMessage)
  }

  return Promise.resolve().then(() => {
    dataSources.forEach(ds => {
      DataSourceManager.getInstance().destroyDataSource(ds.id)
    })
  })
}

/**
 * Extend @arcgis/analysis-shared-utils. We have message level customize function, so cannot use the method in @arcgis/analysis-shared-utils directly
 * Filters the messages for a historyItem to not include extraneous messages.
 * Part of the intended effect here is to reduce storage size.
 * @param {__esri.GPMessage[]} messages the messages to be filtered
 * @returns {__esri.GPMessage[]} the filtered messages
 */
export function filterHistoryItemMessages (messages: __esri.GPMessage[], toolType: ToolType, messageLevel?: MessageLevel, filterByMessageLevel = true): __esri.GPMessage[] {
  if (!messages?.length) {
    return []
  }
  if (toolType === ToolType.Custom && filterByMessageLevel) {
    if (messageLevel === MessageLevel.None) {
      return []
    }
  }
  const convertedMessages = messages.map((msg) => {
    msg.type = convertEsriMessageType(msg.type) as __esri.GPMessage['type']
    return msg
  })
  return convertedMessages.filter((message: __esri.GPMessage) => {
    let parsedMessage: { [key: string]: string }
    try {
      parsedMessage = JSON.parse(message.description)
      // JSON.parse return type: The Object, Array, string, number, boolean, or null value corresponding to the given JSON text.
      const parsedMessageType = typeof parsedMessage
      // if message.description is number, string, boolean, JSON.parse won't throw error, convert to an object to avoid "in" operator below throw error
      if (['number', 'string', 'boolean'].includes(parsedMessageType) || parsedMessage === null) {
        parsedMessage = { description: parsedMessage as any }
      }
    } catch (e) {
      // if JSON.parse throw error, catch the error here and convert to an object to avoid "in" operator below throw error
      parsedMessage = { description: message.description }
    }

    const isCreditMessage = 'cost' in parsedMessage
    const isTranslatableMessage = 'messageCode' in parsedMessage

    if (toolType !== ToolType.Custom) {
      return (message.type === 'warning' || message.type === 'error') && (isCreditMessage || isTranslatableMessage)
    }
    if (!filterByMessageLevel) {
      return true
    }
    // filter messages by message level stored in config for custom tool
    switch (messageLevel) {
      case MessageLevel.None:
        return false
      case MessageLevel.Error:
        return message.type === 'error'
      case MessageLevel.Info:
        return true
      case undefined: // if not set message level, use warning level
      case MessageLevel.Warning:
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      default:
        return message.type === 'warning' || message.type === 'error'
    }
  })
}

export function getEnumerableObjectFromAccessor (accessor: __esri.Accessor): { [key: string]: any } {
  let obj = {}
  if (typeof (accessor as any)?.keys === 'function' && (accessor as any)?.keys()?.length) {
    const keys = (accessor as any)?.keys()
    keys.forEach((key) => {
      obj[key] = accessor?.[key]
    })
  } else {
    obj = accessor
  }
  return obj
}

export function wait (time: number = 0) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export const useAnalysisComponentDefined = (tagName: string) => {
  const [defined, setDefined] = React.useState(false)
  React.useEffect(() => {
    customElements.whenDefined(tagName).then(function () {
      setDefined(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return defined
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function depthTraversalProcessingValue<T> (value: __esri.ParameterValue['value'], rootId: string, callback: (...args: any) => T) {
  if (Array.isArray(value)) {
    return value.map((v, index) => {
      const id = `${rootId}-${index}`
      return depthTraversalProcessingValue(v, id, callback)
    })
  }
  return callback(rootId, value)
}

export function setValueToResultById (id: string, result: __esri.ParameterValue, newValue: any) {
  const keys = id.split('-').map((n) => Number(n)).slice(1)
  // if no keys, change the value directly
  if (!keys.length) {
    result.value = newValue as __esri.ParameterValue['value']
    return
  }
  const finalKey = keys.pop()
  let target = result.value
  keys.forEach((k) => {
    target = target[k]
  })
  target[finalKey] = newValue
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useUpdateObjectByStateEffect<T, K> (obj: T, state: K, key: string, callback?: () => void) {
  React.useEffect(() => {
    if (!obj) {
      return
    }
    obj[key] = state ?? undefined
    if (callback) {
      callback()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, obj])
}

export function outputParameterNeedAddToMapAuto (parameter: AnalysisToolParam) {
  if (parameter.direction === 'esriGPParameterDirectionOutput') {
    return ([
      AnalysisToolParamDataType.GPFeatureRecordSetLayer,
      'MapServiceLayer'
    ] as string[]).includes(parameter.dataType)
  }
  return false
}

export function isLayerInputType (dataType: string) {
  return ([
    AnalysisToolParamDataType.GPFeatureRecordSetLayer,
    AnalysisToolParamDataType.GPMultiValueFeatureRecordSetLayer,
    AnalysisToolParamDataType.GPRecordSet,
    AnalysisToolParamDataType.GPMultiValueRecordSet,
    AnalysisToolParamDataType.GPRasterDataLayer
  ] as string[]).includes(dataType)
}

export function getCustomToolUrlWithToken (url) {
  const isHosted = !!ServiceManager.getInstance().getServerInfoByServiceUrl(url)?.owningSystemUrl
  if (isHosted) {
    const token = SessionManager.getInstance().getSessionByUrl(url)?.token
    return token ? `${url}?token=${token}` : url
  }
  return url
}

export function getLimitLineContentStyle (line: number = 2) {
  return css`
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    word-break: break-word;
    -webkit-line-clamp: ${line};
  `
}

export async function getActiveAnalysisEngines (portal: __esri.Portal): Promise<AnalysisEngine[]> {
  const engineArray: AnalysisEngine[] = []

  if (canPerformStandardAnalysis(portal)) {
    engineArray.push(AnalysisEngine.Standard)
  }

  if (canPerformGeoAnalytics(portal) && portal !== undefined && portal.isPortal) {
    engineArray.push(AnalysisEngine.GeoAnalytics)
  }

  const canPerformRaster = await canPerformRasterAnalysis(portal)
  if (canPerformRaster) {
    engineArray.push(AnalysisEngine.Raster)
  }

  return engineArray
}

export function useAnalysisEnginesAccess (portal: __esri.Portal) {
  const [activeAnalysisEngines, setActiveAnalysisEngines] = React.useState<AnalysisEngine[]>([])
  React.useEffect(() => {
    if (!portal) {
      return
    }
    getActiveAnalysisEngines(portal).then(setActiveAnalysisEngines)
  }, [portal])

  const canAccessAnalysisEngines = React.useCallback((analysisEngine: AnalysisEngine) => {
    return activeAnalysisEngines.includes(analysisEngine || AnalysisEngine.Standard)
  }, [activeAnalysisEngines])

  return canAccessAnalysisEngines
}

export function getValidToolsList (activeAnalysisEngines: AnalysisEngine[], userHasNaPrivilege: boolean, toolsArray: AnalysisToolItem[], portal: __esri.Portal, hasAdvancedLevelLicense: boolean): AnalysisToolItem[] {
  const toolsWithAnalysisEngine = toolsArray.filter((tool: AnalysisToolItem) => {
    const engineMatches = activeAnalysisEngines.includes(tool.analysisEngine)
    const privilegeMatches = tool.privilegeRequirements !== undefined && tool.privilegeRequirements.includes(UserPrivileges.Network) ? userHasNaPrivilege : true

    const isPortal = portal?.isPortal ?? false

    const isVisible = (isPortal && tool.visibilityMode === VisibilityModes.Enterprise) || (!isPortal && tool.visibilityMode === VisibilityModes.Online) || tool.visibilityMode === VisibilityModes.Both || isEmptyValue(tool.visibilityMode)

    // helperServices is an object on the portal in the store and we check if it is allowed by
    // checking that helperServices[service] !== undefined
    const helperServices = portal?.helperServices ?? {}
    // each tool will have a list of helperServices that are required for it, and empty if it does
    // not require any. These will be checked against the helperServices in the portal.
    const additionalHelperServiceRequirements = tool.additionalHelperServiceRequirements ?? []

    // loop through each helper service requirement and ensure that every one is met.
    // however, we will not preform this operation if there are no requirements
    // e.g. helperServiceRequirements.length === 0, in that case we default to true (allowing the tool).
    const allowedByHelperServices = additionalHelperServiceRequirements?.length > 0
      ? !additionalHelperServiceRequirements.some((service: string) => helperServices[service] === undefined || helperServices[service]?.url === undefined)
      : true
    const needsAdvancedLicense = (isPortal && tool.needsAdvancedLicense) ?? false
    const serverMetLicenseLevel = needsAdvancedLicense ? hasAdvancedLevelLicense : true

    return engineMatches && privilegeMatches && isVisible && allowedByHelperServices && serverMetLicenseLevel
  })

  return toolsWithAnalysisEngine
}

export async function getAllValidToolsList (toolsArray: AnalysisToolItem[], portal: __esri.Portal) {
  let activeAnalysisEngines: AnalysisEngine[] = []
  let hasAdvancedLevelLicense = false
  const userHasNaPrivilege = hasNAPrivilege(portal?.user)
  try {
    activeAnalysisEngines = await getActiveAnalysisEngines(portal)
    hasAdvancedLevelLicense = await isStandardAnalysisServerAdvanced(portal)
  } catch (error) {}

  return getValidToolsList(activeAnalysisEngines, userHasNaPrivilege, toolsArray, portal, hasAdvancedLevelLicense)
}

export function resultValueIsFeatureSet (value: __esri.ParameterValue['value'] | GPFeatureRecordSetLayer): value is __esri.FeatureSet {
  return value != null && typeof value === 'object' && 'features' in value && Array.isArray(value.features)
}

export function resultValueIsFeatureCollectionJson (value: __esri.ParameterValue['value'] | GPFeatureRecordSetLayer): value is __esri.FeatureSet {
  return value != null && typeof value === 'object' && 'featureSet' in value
}

export function resultValueIsFeatureLayer (value: __esri.ParameterValue['value'] | GPFeatureRecordSetLayer): value is __esri.FeatureLayer {
  return value != null && typeof value === 'object' && 'type' in value && isFeatureLayer(value as any)
}

export function getRFxNameFromHistoryItem (historyItem: AnalysisHistoryItem | SerializedHistoryItem) {
  const { rasterFunction } = historyItem.jobParams
  return getRFxDefKeyFromRFT(rasterFunction as RFxTemplate) || historyItem.toolName
}

export function isSameToolAsHistoryItem (toolConfig: ToolConfig, historyItem: AnalysisHistoryItem | SerializedHistoryItem) {
  let historyItemToolName = historyItem.toolName
  if (historyItem.analysisType === AnalysisType.RasterFunction) {
    historyItemToolName = getRFxNameFromHistoryItem(historyItem)
  }

  const toolAnalysisType = toolConfig.type === ToolType.RasterFunction ? AnalysisType.RasterFunction : AnalysisType.Tool

  return toolConfig.toolName === historyItemToolName &&
    toolAnalysisType === historyItem.analysisType &&
    toolConfig.analysisEngine === historyItem.analysisEngine
}

export function getToolTypeByAnalysisType (analysisType: AnalysisType) {
  switch (analysisType) {
    case AnalysisType.RasterFunction:
      return ToolType.RasterFunction
    case AnalysisType.WebTool:
      return ToolType.Custom
    case AnalysisType.Tool:
      return ToolType.Standard
  }
}

function isMapServiceLayerOutputParam (parameter: AnalysisToolParam) {
  return (parameter.dataType as any) === 'MapServiceLayer' && parameter.direction === AnalysisToolParamDirection.Output
}

export function customToolHasMapServiceLayerOutput (parameters: AnalysisToolParam[] | ImmutableArray<AnalysisToolParam>) {
  return !!parameters.find((p) => isMapServiceLayerOutputParam(p))
}

export function outputIsIncludedInMapServiceLayer (parameter: AnalysisToolParam | ImmutableObject<AnalysisToolParam>) {
  if (parameter.direction === AnalysisToolParamDirection.Input) {
    return false
  }
  const singleLayerTypes: AnalysisToolParamDataType[] = [
    AnalysisToolParamDataType.GPFeatureRecordSetLayer,
    AnalysisToolParamDataType.GPRasterDataLayer,
    AnalysisToolParamDataType.GPRecordSet
  ]
  if (singleLayerTypes.includes(parameter.dataType)) {
    return true
  }
  return false
}

export function getNeedHideOutputParams (parameters: AnalysisToolParam[] | ImmutableArray<AnalysisToolParam>, ignoreResultMapServer?: boolean) {
  const hasMapServiceLayerOutput = customToolHasMapServiceLayerOutput(parameters)
  if (!hasMapServiceLayerOutput) {
    return []
  }
  // do not use result map server, hide the "resultMapServerName" type parameter
  if (ignoreResultMapServer) {
    return parameters.filter((p) => isMapServiceLayerOutputParam(p)).map((p) => p.name)
  }
  return parameters.filter((p) => outputIsIncludedInMapServiceLayer(p)).map((p) => p.name)
}

export const parameterUseFileUploadComponent = (parameter: AnalysisToolParam) => {
  const typesUseFileUploadComponent = [
    AnalysisToolParamDataType.GPDataFile,
    AnalysisToolParamDataType.GPRasterDataLayer
  ] as AnalysisToolParamDataType[]
  return parameter.direction === 'esriGPParameterDirectionInput' && typesUseFileUploadComponent.includes(parameter.dataType)
}

export const serviceSupportUpload = (serviceInfo: AnalysisServiceInfo) => {
  return !!serviceInfo?.capabilities?.includes?.('Uploads')
}

export const getMessageLevel = (toolInfo: ToolConfig) => {
  if (toolInfo.type === ToolType.Custom) {
    return (toolInfo.config.option as CustomToolOption)?.messageLevel
  }
}

export const isAccessBlockedError = (error) => {
  const accessBlockedCode = 'OAUTH_0070'
  return error?.details?.messageCode === accessBlockedCode || error.code === accessBlockedCode || error?.name === ErrorKeywords.AccessBlocked
}
