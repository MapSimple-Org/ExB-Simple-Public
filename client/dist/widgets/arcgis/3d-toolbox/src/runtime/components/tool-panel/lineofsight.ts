/** @jsx jsx */
import { React } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import LineOfSight from 'esri/widgets/LineOfSight'
import LineOfSightViewModel from 'esri/widgets/LineOfSight/LineOfSightViewModel'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import type { LineOfSightConfig } from '../../../constraints'
// import Graphic from 'esri/Graphic'
// import GraphicsLayer from 'esri/layers/GraphicsLayer'

export interface LineOfSightProps {
  jimuMapView: JimuMapView
  lineOfSightConfig: LineOfSightConfig
  onUpdated: () => void
}
export const useLineOfSight = (props: LineOfSightProps) => {
  const { onUpdated } = props
  const widgetRef = React.useRef<__esri.LineOfSight>(null)

  // handlers
  const lineOfSightHandlerRef = React.useRef<__esri.WatchHandle>(null)

  // Loading for API btn disabled state, before inited ,#10112
  const [widgetReadyState, setWidgetReadyState] = React.useState<boolean>(false)
  const [viewModelReadyState, setViewModelReadyState] = React.useState<boolean>(false)
  React.useEffect(() => {
    if (widgetReadyState && viewModelReadyState) {
      onUpdated()
    }
  }, [widgetReadyState, viewModelReadyState,
    onUpdated])

  //1
  const _updateWidget = React.useCallback((domRef: HTMLDivElement) => {
    //addGraphicsLayer()

    widgetRef.current = new LineOfSight({
      //id: props.id,
      container: domRef,
      view: props.jimuMapView?.view as __esri.SceneView,
      viewModel: new LineOfSightViewModel({
        view: props.jimuMapView?.view as __esri.SceneView
      })
    })

    // subscribe to the loading status ,#10112
    lineOfSightHandlerRef.current = reactiveUtils.watch(() => (widgetRef?.current.viewModel.state),
      (value) => {
        if (value === 'ready') {
          setViewModelReadyState(true)
        }
      }
    )

    widgetRef.current.when(() => {
      setWidgetReadyState(true)
    })

    return widgetRef.current
  }, [props.jimuMapView])

  const _destroyWidget = React.useCallback(() => {
    lineOfSightHandlerRef?.current?.remove()
    //removeGraphicsLayer()
  }, [])

  // export interfaces
  return {
    // ref
    lineOfSightRef: widgetRef.current,
    // update
    updateLineOfSightWidget: _updateWidget,
    // remove
    destroyLineOfSightWidget: _destroyWidget
  }
}

// 3DToolbox: Research widgets setting ,#9551
// 0 symbol
// Observer symbol
// function setObserverMarker (lineOfSightViewModel: __esri.LineOfSightViewModel) {
//   const observerSymbol = {
//     type: 'point-3d',
//     symbolLayers: [
//       {
//         type: 'object',
//         resource: { primitive: 'inverted-cone' },
//         material: { color: [255, 255, 0] },
//         height: 50,
//         depth: 20,
//         width: 20,
//         anchor: 'relative',
//         anchorPosition: { x: 0, y: 0, z: 0 }
//       }
//     ]
//   }

//   const graphic = new Graphic({
//     symbol: observerSymbol as any,
//     geometry: lineOfSightViewModel.observer //Point
//   })
//   //view.graphics.add(graphic)
//   graphicLayerRef.current.add(graphic)
// }
// // intersection points symbol
// function setIntersectionMarkers (lineOfSightViewModel: __esri.LineOfSightViewModel) {
//   // an inverted cone marks the intersection that occludes the view
//   const intersectionSymbol = {
//     type: 'point-3d',
//     symbolLayers: [
//       {
//         type: 'object',
//         resource: { primitive: 'inverted-cone' },
//         material: { color: [0, 0, 255] },
//         height: 20,
//         depth: 20,
//         width: 50,
//         anchor: 'relative',
//         anchorPosition: { x: 0, y: 0, z: -0.7 }
//       }
//     ]
//   }

//   lineOfSightViewModel?.targets?.forEach((target) => {
//     if (target.intersectedLocation) {
//       const graphic = new Graphic({
//         symbol: intersectionSymbol as any,
//         geometry: target.intersectedLocation
//       })
//       //view.graphics.add(graphic)
//       graphicLayerRef.current.add(graphic)
//     }
//   })
// }

// layers
// const graphicLayerRef = React.useRef<__esri.GraphicsLayer>(null)
// function addGraphicsLayer () {
//   const graphicLayerId = 'line-of-sight-layer-' + props.jimuMapView.id
//   graphicLayerRef.current = new GraphicsLayer({
//     id: graphicLayerId,
//     listMode: 'hide',
//     title: graphicLayerId //,
//     //elevationInfo: { mode: props.elevationInfo }
//   })
//   if (!props.jimuMapView.view.map.findLayerById(graphicLayerId)) {
//     props.jimuMapView.view.map.add(graphicLayerRef.current)
//   }
// }
// function removeGraphicsLayer () {
//   if (graphicLayerRef.current && props.jimuMapView?.view) {
//     props.jimuMapView?.view.map.remove(graphicLayerRef.current)
//   }
// }
