/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { useTheme } from 'jimu-theme'
import type { JimuMapView } from 'jimu-arcgis'
import { LayerSelectors } from './layer-selectors'
import { UpdateReason, useBuildingExplorer } from './building-explorer'
import { StatusTips } from './status-tips'
import { getBuildingLayerViews } from '../../../common/utils'

import { getStyle } from './style'
import type { IMConfig } from '../../../config'

export interface Props {
  widgetId: string
  config: IMConfig
  jimuMapView: JimuMapView
}

export const MainPanel = React.memo((props: Props) => {
  const theme = useTheme()
  const domContainerRef = React.useRef<HTMLDivElement>(null)
  const widgetRef = React.useRef<__esri.BuildingExplorer>(null)

  // config
  const mapConfig = props.config.mapSettings[(props.jimuMapView?.dataSourceId)]

  // layer selector state
  const [selectedLayerViewIdsState, setSelectedLayerViewIdsState] = React.useState<string[]>([])

  // widget
  const { updateBuildingExplorerWidget, destroyBuildingExplorerWidget, clearToInit /*, restoreDsStates*/ } = useBuildingExplorer({
    jimuMapView: props.jimuMapView,
    settingConfig: props.config,
    mapConfig: mapConfig,
    selectedLayerViewIds: selectedLayerViewIdsState,
    widgetId: props.widgetId
  })
  // functions refs
  const updateWidgetRef = React.useRef<(domRef: HTMLDivElement, reason: string) => __esri.BuildingExplorer>(undefined)
  updateWidgetRef.current = updateBuildingExplorerWidget
  const clearToInitRef = React.useRef<() => void>(undefined)
  clearToInitRef.current = clearToInit
  //const destroyBuildingExplorerWidget

  // dom
  function createContainerDom () {
    const c = document.createElement('div')
    c.className = 'widget-container w-100'
    domContainerRef.current.innerHTML = ''
    domContainerRef.current.appendChild(c)

    return c
  }

  const destroyWidget = React.useCallback(() => {
    //console.log('==> destroyWidget ')
    if (widgetRef.current?.view?.map) {
      destroyBuildingExplorerWidget()
    }

    widgetRef?.current?.destroy()
    widgetRef.current = null

    if (domContainerRef?.current) {
      domContainerRef.current.innerHTML = ''
    }
  }, [destroyBuildingExplorerWidget])

  // on unmount
  React.useEffect(() => {
    destroyWidget()
  }, [destroyWidget])

  // when jimuMapView changed (e.g. switch map),
  // 1. init widget
  // 2. switch map
  const jimuMapViewChangedFlagRef = React.useRef<boolean>(false)
  React.useEffect(() => {
    updateWidgetRef.current(createContainerDom(), UpdateReason.SwitchMap) //DO NOT clear filters

    jimuMapViewChangedFlagRef.current = true
  }, [props.jimuMapView?.dataSourceId]) // switch map

  React.useEffect(() => {
    if (!jimuMapViewChangedFlagRef.current) {
      clearToInitRef.current()
      updateWidgetRef.current(createContainerDom(), UpdateReason.Init)
    }

    jimuMapViewChangedFlagRef.current = false
  }, [mapConfig?.layerMode, mapConfig?.layersOnLoad // setting config changed
  ])

  const isNoBuildingLayers = React.useCallback(() => {
    const buildingLayerViews = getBuildingLayerViews(props.jimuMapView)
    return !(buildingLayerViews && buildingLayerViews.length > 0)
  }, [props.jimuMapView])

  // for add-data/remove-data ,#19024
  const [isNoBuildingLayersStates, setIsNoBuildingLayersStates] = React.useState<boolean>(true)
  React.useEffect(() => {
    //1. init state
    setIsNoBuildingLayersStates(isNoBuildingLayers())

    //2. handlers
    //2.1 add
    const jimuLayerViewCreatedListener = (newJimuLayerView) => {
      const buildingLayerViews = getBuildingLayerViews(props.jimuMapView)
      const isNoBuildingLayers = !(buildingLayerViews && buildingLayerViews.length > 0)
      setIsNoBuildingLayersStates(isNoBuildingLayers)
    }
    props.jimuMapView?.addJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
    //2.2 remove
    const jimuLayerViewRemovedListener = (removedJimuLayerView) => {
      const buildingLayerViews = getBuildingLayerViews(props.jimuMapView)
      const isNoBuildingLayers = !(buildingLayerViews && buildingLayerViews.length > 0)
      setIsNoBuildingLayersStates(isNoBuildingLayers)
    }
    props.jimuMapView?.addJimuLayerViewRemovedListener(jimuLayerViewRemovedListener)

    return () => {
      props.jimuMapView?.removeJimuLayerViewCreatedListener(jimuLayerViewCreatedListener)
      props.jimuMapView?.removeJimuLayerViewRemovedListener(jimuLayerViewCreatedListener)
    }
  }, [props.jimuMapView, isNoBuildingLayers])

  const isNoSelectedLayersFlag = ((selectedLayerViewIdsState?.length === 0) || (selectedLayerViewIdsState[0] === ''))
  const isNoToolFlag = !((mapConfig?.enableLevel || typeof mapConfig?.enableLevel === 'undefined') ||
  (mapConfig?.enablePhase || typeof mapConfig?.enablePhase === 'undefined') ||
  (mapConfig?.enableCtegories || typeof mapConfig?.enableCtegories === 'undefined'))
  return (
    <div className={'d-flex flex-column w-100 p-2 '} css={getStyle(theme)}>
      {/* layer selector */}
      {<div className={'w-100 ' + (!isNoBuildingLayersStates ? 'd-flex' : 'd-none')}>
        <LayerSelectors
          generalConfig={props.config.general}
          mapConfig={mapConfig}
          jimuMapView={props.jimuMapView}
          selectedLayerViewIdsState={selectedLayerViewIdsState}
          onLayerSelectChanged={setSelectedLayerViewIdsState}
        ></LayerSelectors>
      </div>}
      {/* no layers tips */}
      {(isNoSelectedLayersFlag || isNoBuildingLayersStates || isNoToolFlag) && <StatusTips
        isNoSelectedLayersFlag={isNoSelectedLayersFlag}
        isNoBuildingLayersFlag={isNoBuildingLayersStates}
        isNoToolFlag={isNoToolFlag}
      ></StatusTips>}

      {/* API UI plane */}
      <div className={isNoSelectedLayersFlag ? 'd-none' : 'd-flex '} ref={domContainerRef}></div>
    </div>
  )
})
