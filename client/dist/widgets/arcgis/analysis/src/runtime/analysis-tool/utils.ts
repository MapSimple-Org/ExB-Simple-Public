import { type SupportedLayer, type AnalysisGPJobStatus, type PortalHelpMapJSON, getPortalHelpMap } from '@arcgis/analysis-shared-utils'
import type { AnalysisToolData, AnalysisToolAppContainerCustomEvent } from '@arcgis/analysis-tool-app'
import { React, hooks, loadArcGISJSAPIModules, lodash, utils } from 'jimu-core'
import { AnalysisCoreEvents, notifyJobStatus, notifyJobSubmited } from '../../utils/events'
import type { JobParamsFromOtherWidgets } from './config'
import { getAnalysisLayers, sanitizeUrl } from '@arcgis/analysis-shared-utils'
import type { FeatureCollection } from '@arcgis/analysis-ui-schema'


export const changeDisplayOfAnalysisToolButtons = (disableBack: boolean, container: HTMLAnalysisToolAppContainerElement | HTMLAnalysisRfxAppContainerElement) => {
  // if in runtime, disableBack won't change
  if (!disableBack && !window.jimuConfig.isInBuilder) {
    return
  }
  // if disable back, hide back button(including header back button and footer back button) and change run button to full width
  const flowItem = container.shadowRoot.querySelector('calcite-panel')
  if (flowItem) {

    const headerBackButton: HTMLCalciteActionElement = flowItem.querySelector('calcite-action.analysis-panel-back-button')
    if (headerBackButton) {
      headerBackButton.style.display = disableBack ? 'none' : 'flex'
    }

    const buttons: NodeListOf<HTMLCalciteButtonElement> = flowItem.querySelectorAll('.tool-footer calcite-button')
    const runButton = buttons[0]
    const backButton = buttons[1]
    if (runButton) {
      runButton.width = disableBack ? 'full' : 'half'
    }
    if (backButton) {
      backButton.style.display = disableBack ? 'none' : 'inline-block'
    }
  }
}

export const useJobStatusChangeListener = (
  appContainer: HTMLElement,
  toolId: string,
  runAnalysisDisabledRef: React.MutableRefObject<boolean>,

  analysisToolContainerRef: React.MutableRefObject<HTMLAnalysisToolAppContainerElement | HTMLAnalysisRfxAppContainerElement>,
  analysisToolDivRef: React.MutableRefObject<HTMLDivElement>
) => {
  React.useEffect(() => {
    if (appContainer) {
      /**
       * There are three cases to handle here:
       * 1. Click run button and not close the tool panel, in this case, can't remove the analysisCoreJobStatus event listener on appContainer
       * 2. Click run button and close the tool panel immediately,in this case need to listen the analysisCoreJobStatus event with submissionData,
       * so that we can notify the analysisCoreJobSubmited event with toolId, then we can remove the analysisCoreJobStatus event listener.
       * 3. Only enter the tool panel, but not run task and close the tool panel directly, in this case, we can just remove the analysisCoreJobStatus event listener directly.
       */
      const onAnalysisCoreJobStatus = (e: AnalysisToolAppContainerCustomEvent<AnalysisGPJobStatus>) => {
        // for case 3: tool was closed and no running tasks to handle
        if (!runAnalysisDisabledRef.current && !analysisToolDivRef.current) {
          appContainer.removeEventListener(AnalysisCoreEvents.JobStatus, onAnalysisCoreJobStatus)
          return
        }
        // for case 2: tool was closed and has running tasks to handle
        // for case 1: tool was opened and has running tasks to handle
        if (e?.detail?.submissionData) {
          notifyJobSubmited(appContainer, { ...e.detail, toolId })
          // if not dispatch when submit job success, the run button will always disable
          if (analysisToolContainerRef.current && e.target === appContainer) {
            notifyJobStatus(analysisToolContainerRef.current, e.detail)
          }
        }
        // for case 2: tool was closed but has running task, and the running task was handled above
        if (runAnalysisDisabledRef.current && !analysisToolDivRef.current) {
          appContainer.removeEventListener(AnalysisCoreEvents.JobStatus, onAnalysisCoreJobStatus)
        }
      }
      appContainer.addEventListener(AnalysisCoreEvents.JobStatus, onAnalysisCoreJobStatus)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appContainer, toolId])
}

export interface AllParameters {
  currentJobParams: AnalysisToolData
  toolUiParameters?: AnalysisToolData
}

export const useJobParamsFromOtherWidgets = (
  jobParamsFromOtherWidgets: JobParamsFromOtherWidgets,
  historyJobParams: AnalysisToolData,
  allParametersRef: React.MutableRefObject<AllParameters>,
  mapLayers: SupportedLayer[],
  toolData: AnalysisToolData,
  analysisToolAppLoaded: boolean,
  updateJobParamsFromOtherWidgets: (jobParams: JobParamsFromOtherWidgets) => void
// eslint-disable-next-line max-params
) => {
  const [realJobParams, setRealJobParams] = React.useState(historyJobParams)

  const [tempLayers, setTempLayers] = React.useState<__esri.Layer[]>([])

  const [modules, setModules] = React.useState<[typeof __esri.Layer, typeof __esri.FeatureLayer, typeof __esri.Graphic, typeof __esri.Field]>()
  React.useEffect(() => {
    loadArcGISJSAPIModules(['esri/layers/Layer', 'esri/layers/FeatureLayer', 'esri/Graphic', 'esri/layers/support/Field']).then((res: [typeof __esri.Layer, typeof __esri.FeatureLayer, typeof __esri.Graphic, typeof __esri.Field]) => {
      setModules(res)
    })
  }, [])

  const updateRealJobParamsAndTempLayers = async () => {
    const layers: __esri.Layer[] = []
    const [Layer, FeatureLayer, Graphic, Field] = modules
    const tempJobParams = { ...(allParametersRef.current?.currentJobParams || historyJobParams) }
    const paramNames = Object.keys(jobParamsFromOtherWidgets)
    if (paramNames.length) {
      await Promise.all(paramNames.map(async (name) => {
        const originalParamValue = jobParamsFromOtherWidgets[name]
        const isMulti = Array.isArray(originalParamValue) && originalParamValue.length
        const paramValue = isMulti ? originalParamValue[0] : originalParamValue
        const { url, filter, title } = paramValue
        if (url) {
          const findCb = (availableLayer) => {
            const hasLayerId = 'layerId' in availableLayer
            const urlId = hasLayerId ? `/${availableLayer.layerId ?? 0}` : ''
            const compareUrl = `${(availableLayer as __esri.FeatureLayer).url}${urlId}`
            // need to compare definitionExpression, if url is same but definitionExpression is different,
            // we think they are different layers since the count is different
            // nee to create a new layer
            return sanitizeUrl(url) === compareUrl && (filter ? availableLayer.definitionExpression === filter : true)
          }

          const foundLayer = mapLayers.find((availableLayer) => findCb(availableLayer))
          if (!foundLayer) {
            const newLayer = await Layer.fromArcGISServerUrl({ url, properties: { definitionExpression: filter } })
            if (title) {
              newLayer.title = title
            }
            layers.push(newLayer)
          }

          tempJobParams[name] = isMulti ? [paramValue] : paramValue
        } else {
          const featureCollection = paramValue
          const { featureSet, layerDefinition } = featureCollection
          const featureLayer = new FeatureLayer({
            source: (featureSet.features || []).map(f => {
              try {
                return Graphic.fromJSON(f)
              } catch (error) {
                return f.toJSON ? f.toJSON() : f
              }
            }),
            // use layerDefinition.fields instead of featureSet.fields,
            // since both analysisSharedUtils.getGPFeatureRecordSetLayerValue and featureUtils.convertDataRecordSetToFeatureSet
            // won't return fields in featureSet
            fields: (layerDefinition.fields || []).map(f => {
              try {
                return Field.fromJSON(f)
              } catch (error) {
                return f.toJSON ? f.toJSON() : f
              }
            }),
            objectIdField: layerDefinition.objectIdField,
            title: layerDefinition.name
          })
          layers.push(featureLayer)
          tempJobParams[name] = isMulti ? [featureCollection] : featureCollection
        }
      }))
      setTempLayers(layers)
      // wait for analysis layer convert before update job params, otherwise the layers in jobParams cannot been recognized
      lodash.defer(() => {
        getAnalysisLayers([...(mapLayers || []), ...(layers as SupportedLayer[])], {}).then(() => {
          setRealJobParams(tempJobParams)
        })
      })
    } else {
      setRealJobParams(tempJobParams)
      setTempLayers([])
    }
  }

  React.useEffect(() => {
    if (!jobParamsFromOtherWidgets || !modules || !analysisToolAppLoaded) {
      return
    }
    updateRealJobParamsAndTempLayers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobParamsFromOtherWidgets, modules, analysisToolAppLoaded])

  // if toolData related to jobParamsFromOtherWidgets change, need to delete the related value in tempLayer and jobParamsFromOtherWidgets
  const prevToolData = hooks.usePrevious(toolData)
  React.useEffect(() => {
    if (toolData && prevToolData && jobParamsFromOtherWidgets) {
      const updatedJobParamsFromOtherWidgets = lodash.clone(jobParamsFromOtherWidgets)
      let updatedTempLayers = [...tempLayers]
      let needUpdate = false
      Object.keys(updatedJobParamsFromOtherWidgets).forEach((name) => {
        if (utils.isDeepEqual(toolData[name], prevToolData[name])) {
          return
        }
        const toolDataParamValue = toolData[name] as FeatureCollection & { itemId: string } & { url: string }
        const jobParamsParamValue = updatedJobParamsFromOtherWidgets[name] as FeatureCollection & { itemId: string } & { url: string }
        if (
          (jobParamsParamValue?.layerDefinition?.name && jobParamsParamValue?.layerDefinition?.name !== toolDataParamValue?.layerDefinition?.name) ||
          (jobParamsParamValue?.itemId && jobParamsParamValue?.itemId !== toolDataParamValue?.itemId) ||
          (jobParamsParamValue?.url && jobParamsParamValue?.url !== toolDataParamValue?.url)
        ) {
          delete updatedJobParamsFromOtherWidgets[name]
          updatedTempLayers = updatedTempLayers.filter((ly: any) => (
            jobParamsParamValue?.layerDefinition?.name
              ? ly.title !== jobParamsParamValue?.layerDefinition?.name
              : jobParamsParamValue?.itemId
                ? ly.portalItem?.id !== jobParamsParamValue?.itemId
                : ly.url !== jobParamsParamValue?.url
          ))
          if (!needUpdate) {
            needUpdate = true
          }
        }
      })
      if (needUpdate) {
        setTempLayers(updatedTempLayers)
        updateJobParamsFromOtherWidgets(updatedJobParamsFromOtherWidgets)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolData])

  return {
    realJobParams,
    tempLayers
  }
}

export const usePortalHelpMap = (portal) => {
  const [portalHelpMap, setPortalHelpMap] = React.useState<PortalHelpMapJSON>()
  React.useEffect(() => {
    if (portal?.isPortal) {
      // fetching the portal helpMap when it is enterprise
      getPortalHelpMap(portal).then(setPortalHelpMap)
    }
  }, [portal])
  return portalHelpMap
}
