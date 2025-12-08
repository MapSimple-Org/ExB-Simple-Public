/** @jsx jsx */
import {
  React, jsx
} from 'jimu-core'
import { Loading } from 'jimu-ui'
import type { AnalysisToolAppContainerCustomEvent } from '@arcgis/analysis-tool-app'
import type { ToolProps } from './config'
import { useUpdateObjectByStateEffect } from '../../utils/util'
import { useAnalysisMapLayersFromMap } from '../utils'
import { useTranslatedRFTNamesMap } from '../../utils/strings'
import { changeDisplayOfAnalysisToolButtons, useJobStatusChangeListener } from './utils'

const { useState, useMemo, useEffect, useRef } = React

const RFxTool = (props: ToolProps) => {
  const { appContainer, jimuMapView, toolInfo, portal, jobParams, disableBack, onBack } = props

  const { toolName, id: toolId, analysisEngine } = toolInfo
  // const { input } = config as StandardToolConfig

  const translatedRFTNamesMap = useTranslatedRFTNamesMap()
  const rfxTitle = useMemo(() => translatedRFTNamesMap.get(toolName) || toolName, [toolName, translatedRFTNamesMap])

  const map = useMemo(() => {
    return jimuMapView?.view?.map
  }, [jimuMapView])


  const [analysisRFxContainer, setAnalysisRFxContainer] = useState<HTMLAnalysisRfxAppContainerElement>(null)

  const [analysisRFxAppLoaded, setAnalysisRFxAppLoaded] = useState(false)

  const runAnalysisDisabledRef = useRef(false)

  const analysisRFxContainerRef = useRef<HTMLAnalysisRfxAppContainerElement>(null)
  const analysisRFxDivRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    analysisRFxContainerRef.current = analysisRFxContainer
  }, [analysisRFxContainer])

  useEffect(() => {
    if (analysisRFxContainer) {
      changeDisplayOfAnalysisToolButtons(disableBack, analysisRFxContainer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableBack])

  const setAnalysisRFxRef = (ref: HTMLDivElement) => {
    if (analysisRFxContainer || !ref) {
      return
    }

    const container = document.createElement('analysis-rfx-app-container')
    container.style.height = '100%'
    container.analysisEngine = analysisEngine
    container.showHeader = true
    container.usePanel = true
    container.panelClosable = false
    container.appContainer = appContainer
    container.addEventListener('analysisRFxAppPanelChange', () => {
      onBack()
    })
    container.addEventListener('analysisRFxAppLoaded', () => {
      setAnalysisRFxAppLoaded(true)
      changeDisplayOfAnalysisToolButtons(disableBack, container)
    })
    container.addEventListener('analysisRFxAppJobSubmissionAttempt', (e: AnalysisToolAppContainerCustomEvent<boolean>) => {
      runAnalysisDisabledRef.current = e.detail
    })
    ref.appendChild(container)
    setAnalysisRFxContainer(container)
  }

  const mapLayers = useAnalysisMapLayersFromMap(map)

  useUpdateObjectByStateEffect(analysisRFxContainer, portal, 'portal')
  useUpdateObjectByStateEffect(analysisRFxContainer, toolName, 'rfxName')
  useUpdateObjectByStateEffect(analysisRFxContainer, rfxTitle, 'rfxTitle')
  useUpdateObjectByStateEffect(analysisRFxContainer, jimuMapView?.view, 'mapView')
  useUpdateObjectByStateEffect(analysisRFxContainer, jobParams, 'serializedJobParams')
  // @arcgis/raster-function-editor code:
  // const changedMapLayer = arrayDifference(newMapLayers, oldMapLayers, "id");
  // and in arrayDifference method, there has these code: array1.filter((obj) => !array2.some((obj2) => obj[value] == obj2[value]));
  // obviously they did not check if array1 and array2 is undefined or null
  // so if oldMapLayers or newMapLayers is undefined or null, this code will throw error and cause crash
  // so if mapLayers is undefined or null, must pass an empty array here
  useUpdateObjectByStateEffect(analysisRFxContainer, mapLayers || [], 'mapLayers')

  useJobStatusChangeListener(appContainer, toolId, runAnalysisDisabledRef, analysisRFxContainerRef, analysisRFxDivRef)

  return (
    <React.Fragment>
      {portal?.user && toolName && <div
        ref={(ref) => {
          analysisRFxDivRef.current = ref
          setAnalysisRFxRef(ref)
        }}
        // stop keydown event to make Ctrl+V event effective
        onKeyDown={(e) => { e.stopPropagation() }}
        className='analysis-rfx-container h-100'></div>}
      {!analysisRFxAppLoaded && <Loading />}
    </React.Fragment>
  )
}

export default RFxTool
