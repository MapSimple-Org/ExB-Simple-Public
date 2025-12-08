import { Fragment, useEffect, useState } from 'react'
import type { AllWidgetProps } from "jimu-core"
import { type JimuMapView, JimuMapViewComponent } from "jimu-arcgis"
import { Loading, LoadingType, Paper } from 'jimu-ui'
import type { IMConfig } from "../config"

import { ImageCollectionExplorer } from "./components/image-collection-explorer"
import { Placeholder } from './components/placeholder'
import { LayerCoachMessage } from './components/layer-coach-message'
import { Header } from './components/header'

import { isQualifiedLayer, getActionDataSets } from "../utils"

const Widget = (props: AllWidgetProps<IMConfig>): React.ReactElement => {
  const { id: widgetId, useMapWidgetIds, enableDataAction, config } = props

  const [activeJimuMapView, setActiveJimuMapView] = useState(null)
  const [activeLayer, setActiveLayer] = useState(null)
  const [qualifiedLayers, setQualifiedLayers] = useState([])
  const [actionDataSets, setActionDataSets] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleActiveViewChange = async (jimuMapView: JimuMapView): Promise<void> => {
    if (!jimuMapView) {
      setActiveLayer(null)
      setQualifiedLayers([])
      setActiveJimuMapView(null)
      return
    }

    await jimuMapView.whenJimuMapViewLoaded()
    setActiveJimuMapView(jimuMapView)
  }

  useEffect(() => {
    if (activeJimuMapView) {
       activeJimuMapView.addJimuLayerViewCreatedListener(handleLayerViewChange)
       activeJimuMapView.addJimuLayerViewRemovedListener(handleLayerViewChange)
    }
    return () => {
      activeJimuMapView?.removeJimuLayerViewCreatedListener(handleLayerViewChange)
      activeJimuMapView?.removeJimuLayerViewRemovedListener(handleLayerViewChange)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJimuMapView, config.customizeLayersOptions, activeLayer, qualifiedLayers])


   const handleMapLayerChange = async () => {
      setIsLoading(true)
       const layerIds = getLayerIds()
       await Promise.allSettled(
        layerIds.map((layerViewId) => activeJimuMapView.jimuLayerViews[layerViewId]?.layer?.load())
      )
      const layers = getQualifiedLayers(layerIds)
      setQualifiedLayers(layers)
      const layerToChange = layers.length > 0 ? layers[0] : null
      await changeActiveLayerAndActionData(layerToChange)
      setIsLoading(false)
    }

    const handleLayerViewChange = async () => {
      setIsLoading(true)
       const layerIds = getLayerIds()
       await Promise.allSettled(
        layerIds.map((layerViewId) => activeJimuMapView.jimuLayerViews[layerViewId]?.layer?.load())
      )
      const layers = getQualifiedLayers(layerIds)
      const hasActiveLayer = layers.map(layer => layer.id).includes(activeLayer?.id)
      if (layers.length > 0 && (!activeLayer || !hasActiveLayer)) {
        const layerToChange = layers.length > 0 ? layers[0] : null
        await changeActiveLayerAndActionData(layerToChange)
      }
      if (layers.length === 0) {
        setActiveLayer(null)
      }
      setQualifiedLayers(layers)
      setIsLoading(false)
    }

  useEffect(() => {
    if (activeJimuMapView?.id) {
      handleMapLayerChange()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.customizeLayersOptions, activeJimuMapView?.id])

  const handleSelectedLayerChange = async (event: any): Promise<void> => {
    const layerId = event.target.value
    const selectedLayer = qualifiedLayers.find(layer => layer.id === layerId)
    await changeActiveLayerAndActionData(selectedLayer)
  }

  const changeActiveLayerAndActionData = async (layer: __esri.Layer): Promise<void> => {
    setIsLoading(true)
    setActiveLayer(layer)
    const newActionDataSets = await getActionDataSets(layer, activeJimuMapView)
    setActionDataSets(newActionDataSets)
    setIsLoading(false)
  }

  const getQualifiedLayers = (layerIds: string[]): __esri.Layer[] => {
    return layerIds
        .filter((layerViewId) => isQualifiedLayer(activeJimuMapView.jimuLayerViews[layerViewId]?.layer))
        .map((layerViewId) => activeJimuMapView.jimuLayerViews[layerViewId].layer)
  }

  const getLayerIds = (): string[] => {
    return config?.customizeLayersOptions?.[activeJimuMapView?.id]?.isEnabled ?
        Array.from(config.customizeLayersOptions[activeJimuMapView?.id].selectedLayerViewIds) :
        Object.keys(activeJimuMapView?.jimuLayerViews)
  }


  const hasMapWidgetSelected = useMapWidgetIds?.length > 0
  const hasQualifiedLayers = qualifiedLayers?.length > 0
  const showCoachMessage = hasMapWidgetSelected && !hasQualifiedLayers && !isLoading
  const showWidget = hasMapWidgetSelected && hasQualifiedLayers && activeLayer && !isLoading

  return (
    <Paper variant="flat" shape="none" className='jimu-widget'>
      <Fragment>
        {<JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds?.[0]}
          onActiveViewChange={handleActiveViewChange}
        />}
        {!hasMapWidgetSelected && <Placeholder/>}
        {isLoading && <Loading type={LoadingType.Secondary} />}
        {showCoachMessage && <LayerCoachMessage />}
        {showWidget && (
          <div className='pt-3 d-flex flex-column h-100 w-100 p-relative'>
            <Header
              widgetId={widgetId}
              layerId={activeLayer.id}
              layerList={qualifiedLayers}
              enableDataAction={enableDataAction}
              actionDataSets={actionDataSets}
              onSelectedLayerChange={handleSelectedLayerChange}
            />
            <ImageCollectionExplorer
              {...props}
              mapView={activeJimuMapView.view}
              layer={activeLayer}
            />
          </div>
        )}
      </Fragment>
    </Paper>
  )
}

export default Widget
