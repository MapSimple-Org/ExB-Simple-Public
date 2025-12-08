/** @jsx jsx */
import {
  React, jsx
} from 'jimu-core'
import { Loading } from 'jimu-ui'
import type { AnalysisToolData, AnalysisToolAppContainerCustomEvent } from '@arcgis/analysis-tool-app'
import type { ToolProps } from './config'
import { useUpdateObjectByStateEffect } from '../../utils/util'
import { useAnalysisMapLayersFromMap } from '../utils'
import { type AllParameters, changeDisplayOfAnalysisToolButtons, useJobParamsFromOtherWidgets, useJobStatusChangeListener, usePortalHelpMap } from './utils'
import { calculateParameterValues, getJobParams } from '@arcgis/analysis-shared-utils'

const { useState, useMemo, useEffect, useRef } = React

const StandardTool = (props: ToolProps) => {
  const { appContainer, jimuMapView, toolInfo, portal, jobParams, toolUiParameters, disableBack, jobParamsFromOtherWidgets, onBack, updateJobParamsFromOtherWidgets } = props

  const { toolName, id: toolId, analysisEngine } = toolInfo
  // const { input } = config as StandardToolConfig

  const map = useMemo(() => {
    return jimuMapView?.view?.map
  }, [jimuMapView])


  const [analysisToolContainer, setAnalysisToolContainer] = useState<HTMLAnalysisToolAppContainerElement>(null)

  const [analysisToolAppLoaded, setAnalysisToolAppLoaded] = useState(false)

  const runAnalysisDisabledRef = useRef(false)

  const analysisToolContainerRef = useRef<HTMLAnalysisToolAppContainerElement>(null)
  const analysisToolDivRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    analysisToolContainerRef.current = analysisToolContainer
  }, [analysisToolContainer])

  useEffect(() => {
    if (analysisToolContainer) {
      changeDisplayOfAnalysisToolButtons(disableBack, analysisToolContainer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableBack])

  const setAnalysisToolRef = (ref: HTMLDivElement) => {
    if (analysisToolContainer || !ref) {
      return
    }

    const container = document.createElement('analysis-tool-app-container')
    container.style.height = '100%'
    container.analysisEngine = analysisEngine
    container.showHeader = true
    container.usePanel = true
    container.panelClosable = false
    container.appContainer = appContainer
    container.addEventListener('analysisToolAppPanelChange', () => {
      onBack()
    })
    container.addEventListener('analysisToolAppLoaded', () => {
      setAnalysisToolAppLoaded(true)
      changeDisplayOfAnalysisToolButtons(disableBack, container)
    })
    container.addEventListener('analysisToolAppJobSubmissionAttempt', (e: AnalysisToolAppContainerCustomEvent<boolean>) => {
      runAnalysisDisabledRef.current = e.detail
    })
    ref.appendChild(container)
    setAnalysisToolContainer(container)
  }

  const mapLayers = useAnalysisMapLayersFromMap(map)

  const [toolData, setToolData] = useState<AnalysisToolData>()
  const allParametersRef = useRef<AllParameters>(null)
  useEffect(() => {
    if (analysisToolContainer && analysisToolAppLoaded) {
      const analysisToolElement = analysisToolContainer.shadowRoot?.querySelector('calcite-panel')?.querySelector('analysis-tool')
      if (analysisToolElement) {
        analysisToolElement.addEventListener('analysisToolDataChange', (e) => {
          setToolData(e?.detail?.toolData)
          const toolJson = analysisToolElement.toolJson
          const jobParams = getJobParams(toolJson, e?.detail?.toolData)
          const calculatedJobParams = calculateParameterValues(jobParams as AnalysisToolData)
          allParametersRef.current = {
            currentJobParams: { ...calculatedJobParams }
          }
        })
      }
    }
  }, [analysisToolContainer, analysisToolAppLoaded])

  // in standard tools, if toolData is undefined, means tool default parameters(jobParams and toolUiParameters) is not rendered yet,
  // so at this time, the jobParamsFromOtherWidgets cannot pass to analysis component as part of jobParams, otherwise, some default params will be lost
  const { tempLayers, realJobParams } = useJobParamsFromOtherWidgets(toolData ? jobParamsFromOtherWidgets : null, jobParams, allParametersRef, mapLayers, toolData, analysisToolAppLoaded, updateJobParamsFromOtherWidgets)

  const portalHelpMap = usePortalHelpMap(portal)
  const analysisMapLayers = React.useMemo(() => [...tempLayers, ...(mapLayers || [])], [mapLayers, tempLayers])

  useUpdateObjectByStateEffect(analysisToolContainer, portal, 'portal')
  useUpdateObjectByStateEffect(analysisToolContainer, toolName, 'toolName')
  useUpdateObjectByStateEffect(analysisToolContainer, jimuMapView?.view, 'mapView')
  useUpdateObjectByStateEffect(analysisToolContainer, realJobParams, 'jobParams')
  useUpdateObjectByStateEffect(analysisToolContainer, toolUiParameters, 'toolUiParameters')
  // put the tempLayers at top to make the layer match use tempLayers first in analysis component
  // eg: if use output ds from other widget, the output dataSource may has url and query, the original dataSource may only have url and already added to map
  // in this case, we should create a new layer for outputDataSource and put it at top to avoid match the layer of original dataSource
  useUpdateObjectByStateEffect(analysisToolContainer, analysisMapLayers, 'mapLayers')
  useUpdateObjectByStateEffect(analysisToolContainer, portalHelpMap, 'portalHelpMap')

  useJobStatusChangeListener(appContainer, toolId, runAnalysisDisabledRef, analysisToolContainerRef, analysisToolDivRef)

  return (
    <React.Fragment>
      {portal?.user && toolName && <div
        ref={(ref) => {
          analysisToolDivRef.current = ref
          setAnalysisToolRef(ref)
        }}
        // stop keydown event to make Ctrl+V event effective
        onKeyDown={(e) => { e.stopPropagation() }}
        className='spatial-analysis-tool-container h-100'></div>}
      {!analysisToolAppLoaded && <Loading />}
    </React.Fragment>
  )
}

export default StandardTool
