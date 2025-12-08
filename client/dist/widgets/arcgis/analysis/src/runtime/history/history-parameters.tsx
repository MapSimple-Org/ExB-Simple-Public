/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/** @jsx jsx */
import {
  React, jsx, hooks, Immutable, css,
  loadArcGISJSAPIModule
} from 'jimu-core'
import { ToolType, type CombinedHistoryParameter } from '../../config'
import { Button, CollapsablePanel, defaultMessages as jimuiDefaultMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { getLocaleInfo, isTravelModeParameter, isEmptyValue, StraightLineParameterValue, formatNumberToLocale, getPortalItemMemo, MaximumSignificantDigits, getServiceType, sanitizeUrl } from '@arcgis/analysis-shared-utils'
import { type AnalysisToolData, type AnalysisParamModel, type AnalysisToolUITravelMode, type OutputName, AnalysisToolParamDataType, type AnalysisToolDataItem, type LayerUrlFilter, type FeatureCollection, type AnalysisToolContext, type AnalysisExtent, AnalysisEngine, type AnalysisRasterToolContext, AnalysisToolContextKeys, type AnalysisToolUI, AnalysisType, type RFxTemplate, type LocaleItem, type GPDataFile, type AnalysisToolParam, type GPComposite } from '@arcgis/analysis-ui-schema'
import { WrapOffOutlined } from 'jimu-icons/outlined/editor/wrap-off'
import { WrapOnOutlined } from 'jimu-icons/outlined/editor/wrap-on'
import { formatAnalysisUnitValue } from './utils'

interface Props {
  toolName?: string
  analysisType: AnalysisType
  analysisEngine?: AnalysisEngine
  jobParams?: AnalysisToolData
  toolUiParameters?: AnalysisToolData
  paramViewModel: AnalysisParamModel
  toolT9n: LocaleItem
  toolUIJson: AnalysisToolUI
  portal: __esri.Portal
  type: ToolType
  toolUrl?: string
}

interface DataFileParameter {
  itemID?: string
  portalItemID?: string
  name?: string
}

const { useMemo, useEffect, useState } = React

const style = css`
  overflow-x: auto;
  --calcite-color-foreground-2: var(--sys-color-surface-background);
  .wrap-on {
    width: max-content;
    min-width: 100%;
  }
`

const HistoryParameters = (props: Props) => {
  const { toolName, analysisType, analysisEngine, jobParams, toolUiParameters, paramViewModel, toolT9n, toolUIJson, portal, type, toolUrl } = props

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const [userFolders, setUserFolders] = useState<__esri.PortalFolder[]>([])
  const [user, setUser] = useState<__esri.PortalUser>()
  useEffect(() => {
    // custom tools do not need to use user folder info
    if (!portal || type === ToolType.Custom) {
      return
    }
    portal.load().then(() => {
      setUser(portal.user)
      portal.user?.fetchFolders?.().then(setUserFolders)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portal])

  const combinedParameters = useMemo(() => {
    // delete empty parameters
    const filteredToolUiParameters: AnalysisToolData = {}
    Object.keys(toolUiParameters || {}).forEach(key => {
      if (toolUiParameters[key] !== undefined) {
        filteredToolUiParameters[key] = toolUiParameters[key]
      }
    })
    return {
      ...jobParams,
      ...filteredToolUiParameters
    }
  }, [jobParams, toolUiParameters])

  const webToolServerUrl = useMemo(() => toolUrl?.slice(0, toolUrl?.lastIndexOf('/')), [toolUrl])
  const esriRequestRef = React.useRef<typeof __esri.request>(null)

  const fetchIndividualDataFileTitle = async (dataFile: GPDataFile) => {
    let modifiedDataFile
    if ('portalItemID' in dataFile) {
      const portalItem = getPortalItemMemo(dataFile.portalItemID, portal)
      await portalItem.load()
      modifiedDataFile = { ...dataFile, name: portalItem.title }
    } else if ('itemID' in dataFile && webToolServerUrl) {
      try {
        if (!esriRequestRef.current) {
          esriRequestRef.current = await loadArcGISJSAPIModule('esri/request')
        }
        const requestResponse = await esriRequestRef.current(`${webToolServerUrl}/uploads/${dataFile.itemID}?f=json`, { method: 'auto' })
        modifiedDataFile = { ...dataFile, name: requestResponse?.data.itemName }
      } catch (exception) {
        // no-op
      }
    }
    return modifiedDataFile
  }

  const loadDataFiles = async () => {
    // loop through each parameter in job params
    const promises = Object.keys(jobParams ?? {}).map((key: string) => {
      const parameter = jobParams?.[key]
      let dataFilePromises: Array<Promise<unknown>> = []
      const dataType = paramViewModel?.[key]?.dataType
      // handle array structure for data files by mapping it to an array of promises to load each file
      if (dataType === 'GPMultiValue:GPDataFile' || dataType === 'GPMultiValue:GPRasterDataLayer') {
        dataFilePromises = [
          ...dataFilePromises,
          ...((parameter as GPDataFile[])
            .filter((nestedParameter: GPDataFile) => nestedParameter !== undefined && nestedParameter !== null && ('portalItemID' in nestedParameter || 'itemID' in nestedParameter)) ?? [])
            .map((nestedParameter: GPDataFile) => fetchIndividualDataFileTitle(nestedParameter))
        ]
        // handle object structure for value tables which might have nested data files within it
      } else if (dataType === 'GPValueTable') {
        (parameter as Array<{ [key: string]: AnalysisToolDataItem }>)?.forEach(
          (nestedParameter: { [key: string]: AnalysisToolDataItem }) => {
            Array.from(Object.keys(nestedParameter)).forEach((column) => {
              const entryDataType = paramViewModel?.[key]?.parameterInfos?.find((nestedParameterInfo: AnalysisToolParam) => nestedParameterInfo.name === column)?.dataType
              const valueTableEntry = nestedParameter?.[column]
              if (entryDataType === 'GPDataFile' || entryDataType === 'GPRasterDataLayer') {
                dataFilePromises.push(fetchIndividualDataFileTitle(valueTableEntry as GPDataFile))
              }
            })
          }
        )
        // else it is just a simple dataFile in which case we can add that alone to the promises array
      } else if (dataType === 'GPDataFile' || dataType === 'GPRasterDataLayer') {
        dataFilePromises.push(fetchIndividualDataFileTitle(parameter as GPDataFile))
      } else if (dataType === 'GPComposite') {
        const compositeValue = parameter as GPComposite
        const compositeDataType = compositeValue?.dataType
        switch (compositeDataType) {
          case 'GPDataFile':
          case 'GPRasterDataLayer':
            dataFilePromises.push(fetchIndividualDataFileTitle(compositeValue?.value as GPDataFile))
            break
          default:
            break
        }
      }
      return dataFilePromises
    }).filter((promise) => promise !== undefined).flat()
    // this will get consumed when the function is called and set to the dataFile mappings in the component
    const dataFiles = await Promise.all(promises)
    return (dataFiles.filter((dataFile) => dataFile !== undefined) as DataFileParameter[]) ?? []
  }
  const [dataFiles, setDataFiles] = React.useState<DataFileParameter[]>([])

  React.useEffect(() => {
    loadDataFiles().then(setDataFiles)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [parametersContainerNode, setParametersContainerNode] = useState<HTMLDivElement>()
  const [envSettingContainerNode, setEnvSettingContainerNode] = useState<HTMLDivElement>()

  const [parameterContent, setParameterContent] = useState<HTMLAnalysisJsonTableElement>(null)

  const [envSettingContent, setEnvSettingContent] = useState<HTMLAnalysisJsonTableElement>(null)

  const isParameterKey = (key: string): boolean => {
    return key !== 'context' && key !== 'extentCheck' && key !== 'actualOutputName' && (portal?.isPortal ? key !== 'resultType' : true)
  }
  const getCurrentT9nToolValue = (key: string): string => {
    /**
     * Keys in the toolT9n are stored as $key so we preform a slice to remove the $.
     * When there is not a toolT9n (e.g. a web tool or EXB or MB etc) we simply use the label
     * in the parameterViewModel. Earlier in the code we actually store the displayName into the label
     * for these such cases, so the label internally is what the user will have designated for the
     * on-screen appearance for the parameter.
     */
    let label = key
    const parameterLabel = paramViewModel?.[key]?.label
    if (type !== ToolType.Custom && toolT9n !== undefined && parameterLabel !== undefined) {
      // for standard tools
      label = toolT9n[parameterLabel.slice(1)] as string
    } else {
      // for custom tools
      label = parameterLabel ?? key
    }
    return label
  }

  const getT9nForJobParamValue = (value: CombinedHistoryParameter, parameterInfo?: AnalysisParamModel[string]): string | { [key: string]: AnalysisToolDataItem } => {
    let translatedValue: AnalysisToolData | string | undefined = value?.toString()
    if (typeof value === 'object' && value !== undefined && value !== null) {
      let resultObject: { [key: string]: AnalysisToolDataItem } = {}
      Object.keys(value).forEach((key) => {
        const matchingParameterInfo = (
          parameterInfo?.uiParameterInfoSubSet as AnalysisParamModel
        )?.[key]
        // TODO: simplify logic here later
        if (!isEmptyValue(matchingParameterInfo)) {
          let currentValue = (value as any)[key]

          if (typeof currentValue === 'boolean') {
            currentValue = translate(currentValue ? 'trueKey' : 'falseKey')
          }

          const matchingLabel = matchingParameterInfo?.label
          const matchingChoiceListLabels = matchingParameterInfo?.choiceListLabels

          const unslicedToolT9nKey =
            !isEmptyValue(matchingParameterInfo?.label)
              ? matchingLabel
              : matchingChoiceListLabels?.[key]

          const toolT9nKey = unslicedToolT9nKey?.slice(1) ?? key

          const translatedKey = toolT9n?.[toolT9nKey]

          const currentValueOfChoiceListLabels = matchingChoiceListLabels?.[currentValue]

          const translatedNestedValue = toolT9n?.[
            currentValueOfChoiceListLabels?.slice(1) ?? currentValue
          ] ?? currentValue
          resultObject[(translatedKey ?? key) as string] = translatedNestedValue
        } else {
          resultObject = value as { [key: string]: AnalysisToolDataItem }
        }
      })
      translatedValue = { ...resultObject } as AnalysisToolData
    } else if (typeof value === 'string') {
      let choiceListLabel = parameterInfo?.choiceListLabels?.[value]
      if (choiceListLabel !== undefined && toolT9n !== undefined) {
        choiceListLabel = choiceListLabel.replace('$', '')
        translatedValue = toolT9n?.[choiceListLabel] as string
      }
    }
    return translatedValue ?? ''
  }
  const formatParameter = (key: string, parameter?: CombinedHistoryParameter | CombinedHistoryParameter[], existingParameterInfo?: AnalysisParamModel[string]): CombinedHistoryParameter | CombinedHistoryParameter[] => {
    /**
     * output name needs extra logic as `serviceProperties.name` needs to be displayed
     * instead of just accessing the key from jobParams, eventually other keys will need
     * to be parsed similarly to outputName if we want to do special formatting or
     * data access.
     */
    let formattedParameter: CombinedHistoryParameter
    let value: CombinedHistoryParameter | CombinedHistoryParameter[]

    if (combinedParameters !== undefined) {
      const parameterInfo = existingParameterInfo ?? paramViewModel?.[key]
      value = (parameter ?? combinedParameters[key]) as CombinedHistoryParameter | CombinedHistoryParameter[]

      if (!isEmptyValue(value) || key === 'saveResultIn' || value === '') {
        if (toolName !== undefined && isTravelModeParameter(key, toolName)) {
          if (value === StraightLineParameterValue) {
            formattedParameter = toolT9n?.straightLineLabel
          } else {
            formattedParameter = (value as AnalysisToolUITravelMode)?.name
          }
        } else if (key === 'saveResultIn' && typeof value === 'string') {
          if (value.length > 0) {
            formattedParameter = userFolders.find(folder => folder.id === value)?.title ?? value
          } else {
            formattedParameter = user?.username ?? ''
          }
        } else if (typeof value === 'string' && (value.includes('serviceProperties') || value.includes('itemProperties'))) {
          const outputName: OutputName = JSON.parse(value)
          formattedParameter = outputName?.serviceProperties?.name ?? outputName.itemProperties?.title ?? undefined
        } else if (typeof value === 'object' && value !== null) {
          // Here we check if the parameter in question is an expression.
          // It should come in as an array, so below we want to check that the array is not an expression
          const isExpression = parameterInfo?.serializationType === 'stringValue'

          if (Array.isArray(value) && !isExpression) {
            value = (value as CombinedHistoryParameter[]).map(param => {
              let formattedArrayParameter = param
              const tempParam = param
              if (typeof param === 'string') {
                /**
                 * Now we have updated to set formattedArrayParameter because it is possible that the string is just
                 * a string, and not a stringified object. Therefore we should attempt to translate it, and if that fails
                 * then we will parse it.
                 */
                try {
                  formattedArrayParameter = getT9nForJobParamValue(param, parameterInfo) ?? JSON.parse(param)
                } catch {
                  formattedArrayParameter = tempParam
                }
              } else if (parameterInfo?.dataType === 'GPMultiValue:GPDate') {
                formattedArrayParameter = formatGPDate(param as number, parameterInfo, combinedParameters)
              } else if (typeof param === 'number') {
                formattedArrayParameter = formatNumberToLocale(param, { maximumSignificantDigits: MaximumSignificantDigits })
              }

              if (typeof param === 'object' && param !== null && param !== undefined) {
                if (parameterInfo?.dataType === 'GPValueTable') {
                  const valueTableParameters: CombinedHistoryParameter[] = []
                  Object.keys(param).forEach((nestedKey) => {
                    let nestedParameterInfo: AnalysisParamModel['string'] | undefined
                    if ('parameterInfos' in parameterInfo) {
                      nestedParameterInfo = (
                        parameterInfo as AnalysisToolParam
                      )?.parameterInfos?.find((info: AnalysisToolParam) => info.name === nestedKey)
                    } else if ('uiParameterInfoSubSet' in parameterInfo) {
                      nestedParameterInfo = (
                        parameterInfo.uiParameterInfoSubSet as Partial<AnalysisParamModel>
                      )?.[nestedKey]
                    }

                    valueTableParameters.push({
                      [(nestedParameterInfo as AnalysisToolParam)?.displayName ?? nestedParameterInfo?.label ?? '']: formatParameterObject(
                        (param as any)?.[nestedKey],
                        nestedParameterInfo ?? {}
                      )
                    })
                  })
                  formattedArrayParameter = valueTableParameters as any
                } else {
                  formattedArrayParameter = formatParameterObject(
                    param as AnalysisToolData,
                    parameterInfo
                  ) as AnalysisToolData
                }
              }
              return formattedArrayParameter
            })
            // here we check only for expressions and just stringify them because they have too many
            // levels of nesting to be really legible.
            // Note:  this will leave the layers used for expressions formatted as normal and not stringified.
          } else if (isExpression) {
            formattedParameter = JSON.stringify(value)
            // normal handling for objects remains at the end, and happens when both it is not an array
            // and also not an expression.
          } else {
            formattedParameter = formatParameterObject(
              value as AnalysisToolData,
              parameterInfo
            ) as AnalysisToolData
          }
        } else if (parameterInfo?.dataType === AnalysisToolParamDataType.GPDate) {
          formattedParameter = formatGPDate(value as number, parameterInfo, combinedParameters)
        } else if (typeof value === 'boolean') {
          formattedParameter = translate(value ? 'trueKey' : 'falseKey')
        } else {
          // Here we are capturing the vast majority of parameters that would need to be localized
          // So we will perform this operation here.
          formattedParameter = getT9nForJobParamValue(
            value as any,
            parameterInfo
          )
        }
      }
    }
    return formattedParameter ?? value
  }

  const formatGPDate = (param: number, parameterInfo: AnalysisParamModel[string], parameterData: AnalysisToolData) => {
    let formattedDate = ''
    if (!isEmptyValue(param)) {
      const date = new Date(param)
      // there are many reasons we can get an Invalid Date result from `new Date()` however
      // we need not check all these cases--since the result is always a constant string
      // we can assert that it does not equal that and if it does not then we can format it.
      if (date.toString() !== 'Invalid Date') {
        const dateString = date.toLocaleString(getLocaleInfo().formatLocale, { timeZone: 'UTC' })
        const isTrafficTimeInputAndUTC = parameterInfo.componentName === 'analysis-traffic-time-input' && parameterData.timeZoneForTimeOfDay === 'UTC'
        formattedDate = isTrafficTimeInputAndUTC ? translate('nowDate', { dateString }) : dateString
      }
    }
    return formattedDate
  }

  const formatParameterObject = (
    parameter: CombinedHistoryParameter,
    parameterInfo?: AnalysisParamModel[string]
  ): CombinedHistoryParameter => {
    let formattedParameter = parameter
    if (parameter !== undefined) {
      const { url, filter, distance, area, units, layerDefinition, name: fieldName, alias: fieldAlias, itemID, portalItemID } = (parameter as { [key: string]: unknown }) ?? {}
      const { dataType } = parameterInfo ?? {}

      if (!isEmptyValue(formattedParameter)) {
        if (dataType === AnalysisToolParamDataType.GPDataFile || dataType === AnalysisToolParamDataType.GPRasterDataLayer) {
          const dataFileParameter = parameter as { itemID?: string, portalItemID?: string, url?: string }
          const formattedFileParameter: { [key: string]: string | undefined } = {}
          if (url !== undefined) {
            const sanitizedUrl = sanitizeUrl(dataFileParameter.url ?? '')
            const isImageService = getServiceType(sanitizedUrl) === 'ImageServer'
            formattedFileParameter[translate(!isImageService ? 'file' : 'layer')] = sanitizedUrl
          } else if (itemID !== undefined) {
            formattedFileParameter[translate('file')] = dataFiles.find((dataFile) => dataFile.itemID === dataFileParameter.itemID)?.name ?? dataFileParameter.itemID
          } else if (portalItemID !== undefined) {
            formattedFileParameter[translate('item')] = dataFiles.find((dataFile) => dataFile.portalItemID === dataFileParameter.portalItemID)?.name ?? dataFileParameter.portalItemID
          }
          formattedParameter = formattedFileParameter
        } else if (url !== undefined || filter !== undefined) {
          const formattedLayerUrlFilterParameter: AnalysisToolData = {}
          if (typeof url === 'string') {
            formattedLayerUrlFilterParameter[translate('layer')] = sanitizeUrl(url)
          }
          if (filter !== undefined) {
            formattedLayerUrlFilterParameter[translate('filter')] = filter
          }
          formattedParameter = formattedLayerUrlFilterParameter
        } else if (
          ((distance !== undefined && distance !== null) ||
            (area !== undefined && area !== null)) &&
          units !== undefined &&
          units !== null
        ) {
          formattedParameter = formatAnalysisUnitValue((distance ?? area) as number, units as string)
        } else if (layerDefinition !== undefined && layerDefinition !== null) {
          formattedParameter = (layerDefinition as FeatureCollection['layerDefinition']).name
        } else if (
          (dataType === AnalysisToolParamDataType.GPField ||
            dataType === AnalysisToolParamDataType.GPMultiValueField ||
            // Include GPString as well since some tools use it for field names
            dataType === AnalysisToolParamDataType.GPString) &&
          fieldName !== undefined
        ) {
          formattedParameter = fieldAlias ?? fieldName
        } else {
          formattedParameter = getT9nForJobParamValue(formattedParameter, parameterInfo)
        }

        if (dataType?.includes('GPDate')) {
          formattedParameter = formatGPDate(parameter as number, parameterInfo ?? {}, jobParams ?? {})
        }

        if (dataType === 'GPComposite') {
          const { dataType: compositeDataType } = parameter as GPComposite
          const parameterValue = (parameter as GPComposite).value as CombinedHistoryParameter
          let formattedCompositeValue = parameterValue
          if (typeof parameterValue === 'object' && !Array.isArray(parameterValue)) {
            formattedCompositeValue = formatParameterObject(parameterValue, { dataType: compositeDataType })
          } else {
            formattedCompositeValue = formatParameter('', parameterValue, { dataType: compositeDataType }) as CombinedHistoryParameter
          }
          formattedParameter = {
            [translate('value')]: formattedCompositeValue,
            [translate('dataType')]: compositeDataType
          } as CombinedHistoryParameter
        }
      }
    }
    return formattedParameter
  }

  const translateParameter = (parameter: AnalysisToolData): { translatedKeys: AnalysisToolData, translatedJobParams: CombinedHistoryParameter } => {
    const translatedJobParams: AnalysisToolData = {}
    const translatedKeys: AnalysisToolData = {}

    Object.keys(parameter)
      .filter(isParameterKey)
      .forEach((key: string) => {
        const formattedKey = getCurrentT9nToolValue(key)
        translatedKeys[key] = formattedKey
        translatedJobParams[key] = (formatParameter(key) ?? key) as unknown as { [key: string]: AnalysisToolDataItem }
      })
    return { translatedKeys, translatedJobParams }
  }

  const translateRasterEnvironmentSettings = (
    jobParamsContext: AnalysisRasterToolContext | undefined
  ): {
    translatedRasterESKeys: { [key: string]: string }
    formattedRasterEnvironmentSettings: { [key: string]: string | number }
  } => {
    const context = jobParamsContext
    const formattedRasterEnvironmentSettings: { [key: string]: string | number } = {}
    const translatedRasterESKeys: { [key: string]: string } = {}

    translatedRasterESKeys.snapRaster = translate('snapRaster')
    translatedRasterESKeys.cellSize = translate('cellSize')
    translatedRasterESKeys.resamplingMethod = translate('resamplingMethod')
    translatedRasterESKeys.mask = translate('mask')
    translatedRasterESKeys.recycleProcessingWorkers = translate('recycleProcessingWorkers')
    translatedRasterESKeys.parallelProcessingFactor = translate('parallelProcessingFactor')
    translatedRasterESKeys.retryOnFailures = translate('retryOnFailures')
    translatedRasterESKeys.processorType = translate('processorType')
    formattedRasterEnvironmentSettings.snapRaster = translate('none')
    formattedRasterEnvironmentSettings.cellSize = translate('maxOf')
    formattedRasterEnvironmentSettings.resamplingMethod = translate('nearest')
    formattedRasterEnvironmentSettings.mask = translate('none')
    formattedRasterEnvironmentSettings.recycleProcessingWorkers = 0
    formattedRasterEnvironmentSettings.parallelProcessingFactor = translate('default')
    formattedRasterEnvironmentSettings.retryOnFailures = 0
    formattedRasterEnvironmentSettings.processorType = translate('automatic')

    if (isEmptyValue(context?.snapRaster)) {
      formattedRasterEnvironmentSettings.snapRaster = translate('none')
    } else {
      formattedRasterEnvironmentSettings.snapRaster = (context?.snapRaster as LayerUrlFilter)?.url
    }

    if (isEmptyValue(context?.cellSize)) {
      formattedRasterEnvironmentSettings.cellSize = translate('maxOf')
    } else {
      if (typeof context?.cellSize === 'string') {
        if (context?.cellSize === 'MAXOF') {
          formattedRasterEnvironmentSettings.cellSize = translate('maxOf')
        } else if (context?.cellSize === 'MINOF') {
          formattedRasterEnvironmentSettings.cellSize = translate('minOf')
        }
      } else if (typeof context?.cellSize === 'number') {
        formattedRasterEnvironmentSettings.cellSize = context?.cellSize
      } else if (
        typeof context?.cellSize === 'object' &&
        context?.cellSize !== null &&
        // eslint-disable-next-line no-unsafe-optional-chaining
        'url' in context?.cellSize
      ) {
        formattedRasterEnvironmentSettings.cellSize = (
          context?.cellSize as LayerUrlFilter
        ).url
      }
    }

    if (isEmptyValue(context?.resamplingMethod)) {
      formattedRasterEnvironmentSettings.resamplingMethod = translate('nearest')
    } else {
      switch (context?.resamplingMethod) {
        case 'NEAREST':
          formattedRasterEnvironmentSettings.resamplingMethod = translate('nearest')
          break
        case 'BILINEAR':
          formattedRasterEnvironmentSettings.resamplingMethod = translate('bilinear')
          break
        case 'CUBIC':
          formattedRasterEnvironmentSettings.resamplingMethod = translate('cubic')
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          formattedRasterEnvironmentSettings.resamplingMethod = translate('nearest')
      }
    }

    if (isEmptyValue(context?.mask)) {
      formattedRasterEnvironmentSettings.mask = translate('none')
    } else {
      formattedRasterEnvironmentSettings.mask = (context?.mask as LayerUrlFilter)?.url
    }

    if (isEmptyValue(context?.recycleProcessingWorkers)) {
      formattedRasterEnvironmentSettings.recycleProcessingWorkers = 0
    } else {
      formattedRasterEnvironmentSettings.recycleProcessingWorkers = context?.recycleProcessingWorkers
    }

    if (isEmptyValue(context?.parallelProcessingFactor)) {
      formattedRasterEnvironmentSettings.parallelProcessingFactor = translate('default')
    } else {
      formattedRasterEnvironmentSettings.parallelProcessingFactor = context?.parallelProcessingFactor
    }

    if (isEmptyValue(context?.retryOnFailures)) {
      formattedRasterEnvironmentSettings.retryOnFailures = 0
    } else {
      formattedRasterEnvironmentSettings.retryOnFailures = context?.retryOnFailures
    }

    if (isEmptyValue(context?.processorType)) {
      formattedRasterEnvironmentSettings.processorType = translate('automatic')
    } else {
      switch (context?.processorType) {
        case 'CPU':
          formattedRasterEnvironmentSettings.processorType = translate('CPU')
          break
        case 'GPU':
          formattedRasterEnvironmentSettings.processorType = translate('GPU')
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          formattedRasterEnvironmentSettings.processorType = translate('automatic')
      }
    }

    // keep the supported raster tool environment settings displayed on History consistent with tool UI
    const { raster } = toolUIJson?.environmentSettings ?? {} as any
    const isNotPortal = portal === undefined || !(portal?.isPortal)
    // eslint-disable-next-line no-prototype-builtins
    const isRFx = jobParams?.hasOwnProperty('rasterFunction')
    const hideSnapRaster =
      raster?.includes(AnalysisToolContextKeys.SnapRaster) === false
    const hideCellSize =
      raster?.includes(AnalysisToolContextKeys.CellSize) === false
    const hideResamplingMethod =
      raster?.includes(AnalysisToolContextKeys.ResamplingMethod) === false
    let hideMask = raster?.includes(AnalysisToolContextKeys.Mask) === false
    if (analysisType === AnalysisType.RasterFunction) {
      hideMask = true
    }
    const hideRecycleProcessingWorkers =
      raster?.includes(AnalysisToolContextKeys.RecycleProcessingWorkers) === false || isNotPortal
    const hideParallelProcessingFactor =
      raster?.includes(AnalysisToolContextKeys.ParallelProcessingFactor) === false || isNotPortal
    const hideRetryOnFailures =
      raster?.includes(AnalysisToolContextKeys.RetryOnFailures) === false || isNotPortal
    const hideProcessorType =
      raster?.includes(AnalysisToolContextKeys.ProcessorType) === false || isNotPortal || isRFx

    if (hideSnapRaster) {
      delete translatedRasterESKeys.snapRaster
      delete formattedRasterEnvironmentSettings.snapRaster
    }
    if (hideCellSize) {
      delete translatedRasterESKeys.cellSize
      delete formattedRasterEnvironmentSettings.cellSize
    }
    if (hideResamplingMethod) {
      delete translatedRasterESKeys.resamplingMethod
      delete formattedRasterEnvironmentSettings.resamplingMethod
    }
    if (hideMask) {
      delete translatedRasterESKeys.mask
      delete formattedRasterEnvironmentSettings.mask
    }

    if (hideRecycleProcessingWorkers) {
      delete translatedRasterESKeys.recycleProcessingWorkers
      delete formattedRasterEnvironmentSettings.recycleProcessingWorkers
    }
    if (hideParallelProcessingFactor) {
      delete translatedRasterESKeys.parallelProcessingFactor
      delete formattedRasterEnvironmentSettings.parallelProcessingFactor
    }
    if (hideRetryOnFailures) {
      delete translatedRasterESKeys.retryOnFailures
      delete formattedRasterEnvironmentSettings.retryOnFailures
    }
    if (hideProcessorType) {
      delete translatedRasterESKeys.processorType
      delete formattedRasterEnvironmentSettings.processorType
    }

    return { translatedRasterESKeys, formattedRasterEnvironmentSettings }
  }
  const translateEnvironmentSettings = (jobParamsContext: AnalysisToolContext | undefined): {
    translatedESKeys: { [key: string]: string }
    formattedEnvironmentSettings: { [key: string]: string | number | Partial<{ [key in keyof AnalysisExtent]: string | number }> }
  } => {
    type AnalysisExtentCoordinates = Extract<keyof AnalysisExtent, string>
    type IntlAnalysisExtentStrings = Partial<{ [key in keyof AnalysisExtent]: string | number }>
    const context = jobParamsContext

    let formattedEnvironmentSettings: { [key: string]: string | number | IntlAnalysisExtentStrings } = {}
    let translatedESKeys: { [key: string]: string } = {}

    translatedESKeys.extent = translate('processingExtent')
    translatedESKeys.outSR = translate('outputCoordinateSystem')

    if (isEmptyValue(context)) {
      formattedEnvironmentSettings.extent = translate('fullExtent')
      formattedEnvironmentSettings.outSR = translate('sameAsInput')
    } else {
      if (isEmptyValue(context?.extent)) {
        formattedEnvironmentSettings.extent = translate('fullExtent')
      } else {
        // create type with keys of AnalysisExtent and values of string
        const currentExtent = {
          ymax: context?.extent?.ymax,
          ymin: context?.extent?.ymin,
          xmax: context?.extent?.xmax,
          xmin: context?.extent?.xmin,
          spatialReference: context?.extent?.spatialReference
        }
        const extent: IntlAnalysisExtentStrings = {}
        Object.keys(currentExtent ?? {}).forEach((extentKey: AnalysisExtentCoordinates) => {
          translatedESKeys[extentKey] = translate(extentKey)
          if (currentExtent?.[extentKey] !== undefined && extentKey !== 'spatialReference') {
            extent[extentKey] = formatNumberToLocale(currentExtent[extentKey])
          } else {
            extent[extentKey] =
              currentExtent?.spatialReference?.latestWkid ??
              currentExtent?.spatialReference?.wkid ??
              currentExtent?.spatialReference?.wkt
          }
        })
        formattedEnvironmentSettings.extent = extent
      }

      if (isEmptyValue(context?.outSR)) {
        formattedEnvironmentSettings.outSR = translate('sameAsInput')
      } else {
        formattedEnvironmentSettings.outSR = String(
          context?.outSR?.latestWkid ?? context?.outSR?.wkid ?? context?.outSR?.wkt ?? ''
        )
      }

      if (!isEmptyValue(context?.geographicTransformations)) {
        translatedESKeys.geographicTransformations = translate('geographicTransformations')
        formattedEnvironmentSettings.geographicTransformations = (context?.geographicTransformations) ?? ''
      }
    }

    if (analysisEngine === AnalysisEngine.Raster) {
      const { translatedRasterESKeys, formattedRasterEnvironmentSettings } =
        translateRasterEnvironmentSettings(jobParamsContext)
      translatedESKeys = { ...translatedESKeys, ...translatedRasterESKeys }
      formattedEnvironmentSettings = {
        ...formattedEnvironmentSettings,
        ...formattedRasterEnvironmentSettings
      }
    }

    return { translatedESKeys, formattedEnvironmentSettings }
  }

  const [translatedRFTParameters, setTranslatedRFTParameters] = useState<{ translatedKeys: AnalysisToolData, translatedJobParams: CombinedHistoryParameter }>()
  useEffect(() => {
    if (user && analysisType === AnalysisType.RasterFunction) {
      import('@arcgis/arcgis-raster-function-editor').then(({ getTranslatedRFTParameters }) => {
        getTranslatedRFTParameters(
          jobParams?.rasterFunction as RFxTemplate,
          jobParams?.outputName as string,
          getLocaleInfo().locale as any,
          portal?.isPortal
        ).then(({ translatedKeys, translatedJobParams }) => {
          // add save-in-folder name to history details for raster functions
          if (!isEmptyValue(translatedKeys.saveInFolder)) {
            const saveInFolderId: string = translatedJobParams.saveInFolder
            let saveInFolderName = ''
            if (saveInFolderId.length > 0) {
              saveInFolderName = userFolders.find((folder) => folder.id === saveInFolderId)?.title ?? saveInFolderId
            } else {
              saveInFolderName = portal?.user?.username ?? ''
            }
            translatedJobParams.saveInFolder = saveInFolderName
          }

          setTranslatedRFTParameters({ translatedKeys, translatedJobParams })
        })
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (!parametersContainerNode || !combinedParameters || !toolT9n) {
      return
    }
    if (analysisType === AnalysisType.RasterFunction && !translatedRFTParameters) {
      return
    }
    if (type !== ToolType.Custom && !user) {
      return
    }
    if (parameterContent) {
      parametersContainerNode.appendChild(parameterContent)
      return
    }
    const parametersAnalysisJsonTable = document.createElement('analysis-json-table') // json

    const { translatedKeys, translatedJobParams } = analysisType === AnalysisType.RasterFunction
      ? translatedRFTParameters
      : translateParameter(Immutable(combinedParameters).without('context').asMutable({ deep: true }))

    parametersAnalysisJsonTable.json = translatedJobParams as AnalysisToolData
    parametersAnalysisJsonTable.intlKeys = translatedKeys
    parametersContainerNode.appendChild(parametersAnalysisJsonTable)
    setParameterContent(parametersAnalysisJsonTable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parametersContainerNode, toolT9n, translatedRFTParameters, user])

  useEffect(() => {
    if (!envSettingContainerNode || !combinedParameters || !toolT9n) {
      return
    }

    if (type !== ToolType.Custom && !user) {
      return
    }

    if (envSettingContent) {
      envSettingContainerNode.appendChild(envSettingContent)
      return
    }
    const envSettingAnalysisJsonTable = document.createElement('analysis-json-table')

    const contextParameter = combinedParameters.context

    const { translatedESKeys, formattedEnvironmentSettings } = translateEnvironmentSettings(contextParameter)

    envSettingAnalysisJsonTable.json = formattedEnvironmentSettings as AnalysisToolData
    envSettingAnalysisJsonTable.intlKeys = translatedESKeys
    envSettingContainerNode.appendChild(envSettingAnalysisJsonTable)
    setEnvSettingContent(envSettingAnalysisJsonTable)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [envSettingContainerNode, toolT9n, user])

  const [parametersTableWrapOn, setParametersTableWrapOn] = useState(false)

  return (
    <React.Fragment>
      <CollapsablePanel
        label={<div className='d-flex w-100'>
          <span css={css`flex: 1`}>{translate('parameters')}</span>
          <Button title={translate('optimizeTableView')} aria-label={translate('optimizeTableView')} onClick={() => { setParametersTableWrapOn(!parametersTableWrapOn) }}>
            {parametersTableWrapOn ? <WrapOffOutlined /> : <WrapOnOutlined />}
          </Button>
        </div>}
        headerTag='div'
        aria-label={translate('parameters')} type="default" defaultIsOpen>
        <div css={style}>
          <div className={parametersTableWrapOn ? 'wrap-on' : ''} ref={(node) => { setParametersContainerNode(node) }}></div>
        </div>
      </CollapsablePanel>
      {type !== ToolType.Custom && <CollapsablePanel label={translate('environmentSettings')} aria-label={translate('environmentSettings')} type="default" defaultIsOpen>
        <div css={style}>
          <div ref={(node) => { setEnvSettingContainerNode(node) }}></div>
        </div>
      </CollapsablePanel>}
    </React.Fragment>
  )
}

export default HistoryParameters
