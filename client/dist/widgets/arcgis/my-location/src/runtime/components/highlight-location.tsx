import Graphic from 'esri/Graphic'
import type { Geometry } from 'esri/geometry'
import Circle from 'esri/geometry/Circle'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import type { JimuMapView } from 'jimu-arcgis'
import { React } from 'jimu-core'
import { useRef } from 'react'
interface HighLightLocationProps {
  jimuMapView: JimuMapView
  highlightLocation: boolean
  showCompassOrientation: boolean
  showLocationAccuracy: boolean
  position: GeolocationCoordinates
  graphicsLayerId: string
  watchLocation: boolean
  layerVisible: boolean
}
export default function (props: HighLightLocationProps) {
  const { highlightLocation, position, jimuMapView, showCompassOrientation, showLocationAccuracy, graphicsLayerId, watchLocation, layerVisible } = props

  const graphicsLayer = useRef(null)
  const currentGraphic = useRef(null)
  const accuracyGraphic = useRef(null)
  const Locate = require('../assets/locate.png')
  const LocateCompass = require('../assets/locate-compass.png')
  const fillSymbol = {
    type: 'simple-fill',
    color: 'rgba(11,100,244,0.2)',
    style: 'solid',
    outline: {
      color: 'rgba(11,100,244,0.2)',
      width: 1
    }
  }
  const locateCompassSymbol = {
    type: 'picture-marker',
    url: LocateCompass,
    width: 48,
    height: 48,
    angle: 0
  }
  const locateSymbol = {
    type: 'picture-marker',
    url: Locate,
    width: 18,
    height: 18
  }
  React.useEffect(() => {
    return () => {
      removeGraphicsLayer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (graphicsLayer.current) {
      graphicsLayer.current.visible = layerVisible
    }
  }, [layerVisible])

  React.useEffect(() => {
    if (jimuMapView && highlightLocation) {
      addGraphicsLayer()
    } else {
      removeGraphicsLayer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView])

  React.useEffect(() => {
    if (highlightLocation) {
      addGraphicsLayer()
    } else {
      removeGraphicsLayer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightLocation, watchLocation])

  React.useEffect(() => {
    if (jimuMapView && graphicsLayer.current) {
      updateLocation()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, showCompassOrientation, showLocationAccuracy])

  function updateLocation () {
    if (props.position) {
      const { longitude, latitude, accuracy, heading } = props.position
      const x = longitude
      const y = latitude
      makeCircle(x, y, accuracy)
      makeMarker(x, y, heading)
    } else {
      if (graphicsLayer.current) {
        graphicsLayer.current.removeAll()
      }
      currentGraphic.current = null
      accuracyGraphic.current = null
    }
  }

  function addGraphicsLayer () {
    if (graphicsLayer.current && jimuMapView) {
      jimuMapView?.view?.map?.remove(graphicsLayer.current)
      graphicsLayer.current = null
      currentGraphic.current = null
      accuracyGraphic.current = null
    }
    if (jimuMapView) {
      const graphLayer = new GraphicsLayer({
        id: graphicsLayerId,
        listMode: 'hide',
        title: graphicsLayerId,
        visible: layerVisible
      })

      if (!jimuMapView?.view?.map?.findLayerById(graphicsLayerId)) {
        graphicsLayer.current = graphLayer
        // make the graphics layer on the top
        jimuMapView.view.map.layers.on('after-add', () => {
          const layers = jimuMapView.view.map.layers
          let currentLayerIndex = -1
          const graphicsLayerIndexes = []
          layers.forEach((l, index) => {
            if (l.id.slice(-27) === '-point-of-sight-track-layer') {
              graphicsLayerIndexes.push(index)
            }
            if (l.id === graphicsLayerId) {
              currentLayerIndex = index
            }
          })
          if (graphicsLayerIndexes.length === 1 && currentLayerIndex !== layers.length - 1) {
            layers.reorder(layers.getItemAt(currentLayerIndex), layers.length - 1)
          } else {
            if (currentLayerIndex !== -1 && !graphicsLayerIndexes.includes(currentLayerIndex)) {
              layers.reorder(layers.getItemAt(currentLayerIndex), layers.length - 1)
            }
          }
        })
        jimuMapView.view.map.add(graphLayer)
      }
      updateLocation()
    }
  }
  function removeGraphicsLayer () {
    if (graphicsLayer.current && jimuMapView) {
      jimuMapView?.view?.map?.remove(graphicsLayer.current)
    }
    graphicsLayer.current = null
    currentGraphic.current = null
    accuracyGraphic.current = null
  }

  function addGraphic (graphic: Graphic) {
    if (graphicsLayer.current) {
      graphicsLayer.current.graphics.add(graphic)
    }
  }

  function removeGraphic (graphic: Graphic) {
    if (graphicsLayer.current) {
      graphicsLayer.current.graphics.remove(graphic)
    }
  }

  function makeMarker (x: number, y: number, heading: number) {
    const geometry = {
      type: 'point',
      x: x,
      y: y
    } as Geometry
    if (currentGraphic.current) {
      currentGraphic.current.geometry = geometry
    } else {
      const graphic = new Graphic({ geometry: geometry })
      currentGraphic.current = graphic
      addGraphic(graphic)
    }
    if (props.showCompassOrientation && heading !== undefined && heading !== null) {
      locateCompassSymbol.angle = heading
      currentGraphic.current.symbol = locateCompassSymbol
    } else {
      currentGraphic.current.symbol = locateSymbol
    }
  }

  function makeCircle (x: number, y: number, accuracy: number) {
    if (showLocationAccuracy && accuracy !== undefined && accuracy !== null) {
      const accuracyGeom = new Circle({
        center: { x: x, y: y },
        geodesic: true,
        numberOfPoints: 60,
        radius: accuracy,
        radiusUnit: 'meters'
      })
      if (accuracyGraphic.current) {
        accuracyGraphic.current.geometry = accuracyGeom
      } else {
        const graphic = new Graphic({ geometry: accuracyGeom, symbol: fillSymbol as unknown as __esri.SymbolUnion })
        addGraphic(graphic)
        accuracyGraphic.current = graphic
      }
    } else {
      if (accuracyGraphic.current) {
        removeGraphic(accuracyGraphic.current)
        accuracyGraphic.current = null
      }
    }
  }

  return null
}
