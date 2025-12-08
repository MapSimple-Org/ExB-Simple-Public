import { AnalysisToolParamDataType, type AnalysisToolInfo, AnalysisEngine, AnalysisToolParamDirection, AnalysisToolParamParameterType, type AnalysisToolParam } from '@arcgis/analysis-ui-schema'
import { React, type UseUtility, uuidv1, type ImmutableObject, hooks, loadArcGISJSAPIModule } from 'jimu-core'
import { type ToolConfig, ToolType, type StandardToolConfig, type CustomToolConfig, type CustomToolParam } from '../config'
import { isLayerInputType } from '../utils/util'
import { helpUtils } from 'jimu-for-builder'

export function getDefaultStandardToolConfig (toolName: string, analysisEngine: AnalysisEngine): ToolConfig {
  return {
    id: uuidv1(),
    type: ToolType.Standard,
    toolName,
    analysisEngine,
    config: {
      input: {
        selectFromMapLayer: false,
        allowBrowserLayers: false,
        allowDrawingOnTheMap: false,
        allowLocalFileUpload: false,
        allowServiceUrl: false,
        selectFromOtherWidget: false
      },
      output: {
        addResultLayersToMapAuto: false,
        allowExportResults: false
      },
      option: {}
    } as StandardToolConfig
  }
}

export function getDefaultRFxConfig (toolName: string): ToolConfig {
  return {
    id: uuidv1(),
    type: ToolType.RasterFunction,
    toolName,
    analysisEngine: AnalysisEngine.Raster,
    config: {
      input: {},
      output: {
        addResultLayersToMapAuto: false,
        allowExportResults: false
      },
      option: {}
    } as StandardToolConfig
  }
}

export function getDefaultCustomToolConfig (utility: UseUtility, toolInfo: AnalysisToolInfo, toolUrl: string) {
  // check select from map layers by default
  toolInfo.parameters.forEach((p) => {
    if (p.direction === 'esriGPParameterDirectionInput' && isLayerInputType(p.dataType)) {
      (p as CustomToolParam).selectFromMapLayer = true
    }
  })
  return {
    id: uuidv1(),
    type: ToolType.Custom,
    toolName: toolInfo.name,
    analysisEngine: AnalysisEngine.Standard,
    config: {
      toolInfo,
      utility,
      toolUrl,
      output: {
        ignored: {},
        allowExport: {},
        decimalPlace: {},
        dateFormat: {},
        timeFormat: {},
        addResultLayersToMapAuto: {}
      },
      option: {
        showHelpLink: true,
        link: toolInfo.helpUrl || ''
      }
    } as CustomToolConfig
  }
}

export function customToolHasLayerInputParameter (toolInfo: AnalysisToolInfo) {
  return !!toolInfo.parameters.find((p) => p.direction === 'esriGPParameterDirectionInput' && isLayerInputType(p.dataType))
}

export function customToolHasUnsupportedParameterType (toolInfo: ImmutableObject<AnalysisToolInfo>) {
  const supportedParameterTypes = [
    AnalysisToolParamDataType.GPString,
    AnalysisToolParamDataType.GPMultiValueString,
    AnalysisToolParamDataType.GPBoolean,
    AnalysisToolParamDataType.GPDouble,
    AnalysisToolParamDataType.GPMultiValueDouble,
    AnalysisToolParamDataType.GPLong,
    AnalysisToolParamDataType.GPMultiValueLong,
    AnalysisToolParamDataType.GPDate,
    AnalysisToolParamDataType.GPLinearUnit,
    AnalysisToolParamDataType.GPFeatureRecordSetLayer,
    AnalysisToolParamDataType.GPMultiValueFeatureRecordSetLayer,
    AnalysisToolParamDataType.GPRecordSet,
    AnalysisToolParamDataType.GPMultiValueRecordSet,
    AnalysisToolParamDataType.GPField,
    AnalysisToolParamDataType.GPMultiValueField,
    AnalysisToolParamDataType.GPRasterDataLayer,
    AnalysisToolParamDataType.GPDataFile,
    AnalysisToolParamDataType.GPArealUnit,
    AnalysisToolParamDataType.GPValueTable,
    AnalysisToolParamDataType.GPMultiValueDate,
    AnalysisToolParamDataType.GPMultiValueLinearUnit,
    AnalysisToolParamDataType.GPMultiValueArealUnit,
    AnalysisToolParamDataType.GPComposite
  ] as AnalysisToolParamDataType[]
  return toolInfo.parameters.some((p) => p.direction === 'esriGPParameterDirectionInput' && !supportedParameterTypes.includes(p.dataType))
}

export const usePreviousLength = (length: number) => {
  const prevLength = hooks.usePrevious(length)
  return prevLength || 0
}

export const getMapServiceLayerParameter = (resultMapServerName: string): AnalysisToolParam => {
  return {
    name: resultMapServerName,
    displayName: resultMapServerName,
    description: resultMapServerName,
    dataType: 'MapServiceLayer' as any,
    direction: AnalysisToolParamDirection.Output,
    parameterType: AnalysisToolParamParameterType.Optional
  }
}

export const getResultMapServerNameByToolUrl = async (toolUrl: string) => {
  try {
    const esriRequest: typeof __esri.request = await loadArcGISJSAPIModule('esri/request')

    const webToolServerUrl = toolUrl.slice(0, toolUrl.lastIndexOf('/')) // toolUrl like: "https://xxxxx/xxx/GPServer/taskName"
    const { data: serverDescription } = await esriRequest(webToolServerUrl, { query: { f: 'json' }, responseType: 'json' })
    return serverDescription?.resultMapServerName as string
  } catch (error) {
    return ''
  }
}
export const useWidgetHelpLink = () => {
  const [helpLink, setHelpLink] = React.useState('')
  React.useEffect(() => {
    helpUtils.getWidgetHelpLink('analysis').then(url => {
      setHelpLink(url)
    })
  }, [])
  return helpLink
}
