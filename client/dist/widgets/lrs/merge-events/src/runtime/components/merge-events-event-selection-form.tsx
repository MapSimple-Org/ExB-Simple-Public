/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  type ImmutableObject,
  css
} from 'jimu-core'
import {
  isDefined,
  type RouteInfo,
  type NetworkInfo,
  type LrsLayer,
  getInitialRouteInfoState,
  getGeometryGraphic,
  getSimpleLineGraphic,
  getSimplePointGraphic
} from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { MergeEventsListForm } from './merge-events-list-form'
import { MergeEventsChangeEventSelectionForm } from './merge-events-change-event-selection-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan, colorGreen } from '../constants'
import type SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'

export interface MergeEventsEventSelectionFormProps {
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  isReady: boolean
  networkDS: DataSource
  eventDS: DataSource
  eventLayer: ImmutableObject<LrsLayer>
  reset: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  onsubmit: (routeInfo: RouteInfo) => void
  onReset: () => void
  currentSketchVM: SketchViewModel
  eventFeatures: any[]
  onEventRemoved: (index: number) => void
  onPreservedEventIndexChanged: (index: number) => void
  preservedEventIndex: number
  isEventPickerActive: boolean
  onUpdateIsEventPickerActive: (isActive: boolean) => void
}

const getFormStyle = () => {
  return css`
    display: flex;
    flex-direction: column;

    .merge-events-event-selection-form__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    overflow: auto;
    }
    .merge-events-event-selection-form__actions {
    height: 100%;
    }
`
}

export function MergeEventsEventSelectionForm (props: MergeEventsEventSelectionFormProps) {
  const {
    widgetId,
    network,
    networkDS,
    eventDS,
    eventLayer,
    reset,
    jimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    currentSketchVM,
    eventFeatures,
    onEventRemoved,
    onPreservedEventIndexChanged,
    preservedEventIndex,
    isEventPickerActive,
    onUpdateIsEventPickerActive
  } = props
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(getInitialRouteInfoState())

  // Reset routeInfo when network changes.
  React.useEffect(() => {
    if (isDefined(network)) {
      setRouteInfo(getInitialRouteInfoState())
      clearPickedGraphics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  React.useEffect(() => {
    if (reset) {
      setRouteInfo(getInitialRouteInfoState())
      clearPickedGraphics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  // Graphics
  const clearPickedGraphics = (): void => {
    if (isDefined(pickedGraphic)) {
      pickedGraphic.removeAll()
    }
  }

  const updatePickedGraphic = (graphic: __esri.Graphic) => {
    if (!isDefined(graphic)) {
      clearPickedGraphics()
    } else {
      pickedGraphic.removeAll()
      pickedGraphic.add(graphic)
    }
  }

  const flashSelectedGeometry = (graphic: __esri.Graphic) => {
    // Flash 3x
    if (isDefined(graphic)) {
      flashGraphic.add(graphic)
      setTimeout(() => {
        flashGraphic.removeAll()
        setTimeout(() => {
          flashGraphic.add(graphic)
          setTimeout(() => {
            flashGraphic.removeAll()
            setTimeout(() => {
              flashGraphic.add(graphic)
              setTimeout(() => {
                flashGraphic.removeAll()
              }, 800)
            }, 800)
          }, 800)
        }, 800)
      }, 800)
    }
  }

  const updateGraphics = async (routeInfo: RouteInfo, flash: boolean) => {
    if (isDefined(routeInfo.selectedPolyline) && flash) {
      flashSelectedGeometry(await getGeometryGraphic(await getSimpleLineGraphic(routeInfo.selectedPolyline), colorCyan))
    }
    if (isDefined(routeInfo.selectedPoint)) {
      updatePickedGraphic(await getGeometryGraphic(await getSimplePointGraphic(routeInfo.selectedPoint), colorGreen))
    } else {
      clearPickedGraphics()
    }
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (newRouteInfo: RouteInfo, flash: boolean = false) => {
    setRouteInfo(newRouteInfo)
    updateGraphics(newRouteInfo, flash)
  }

  return (
    <div className='merge-events-event-selection-form__content d-flex' css={getFormStyle()}>
      <div className='d-flex w-100'>
        <MergeEventsListForm
          widgetId={widgetId}
          network={network}
          networkDS={networkDS}
          eventDS={eventDS}
          eventLayer={eventLayer}
          routeInfo={routeInfo}
          jimuMapView={jimuMapView}
          hoverGraphic={hoverGraphic}
          reset={reset}
          clearPickedGraphic={clearPickedGraphics}
          eventFeatures={eventFeatures}
          onEventRemoved={onEventRemoved}
          onPreservedEventIndexChanged={onPreservedEventIndexChanged}
          preservedEventIndex={preservedEventIndex}
          flashGraphic={flashGraphic}
        />
      </div>
      <div className='d-flex w-100'>
        <MergeEventsChangeEventSelectionForm
            routeInfo={routeInfo}
            reset={reset}
            onUpdateRouteInfo={handleRouteInfoUpdate }
            networkDS={networkDS}
            jimuMapView={jimuMapView}
            currentSketchVM={currentSketchVM}
            isEventPickerActive={isEventPickerActive}
            onUpdateIsEventPickerActive={onUpdateIsEventPickerActive}/>
      </div>
    </div>
  )
}
