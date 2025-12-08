/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  type ImmutableObject,
  type IntlShape,
  css
} from 'jimu-core'
import {
  type RouteInfo,
  type NetworkInfo,
  type LrsLayer,
  getGeometryGraphic,
  getSimpleLineGraphic,
  getSimplePointGraphic,
  isDefined,
  flash
} from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { RouteAndMeasureForm } from './route-and-measure-form'
import { MergeEventsDateForm } from './merge-events-date-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan, colorGreen } from '../constants'

export interface MergeEventsRouteSelectionFormProps {
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  isReady: boolean
  networkDS: DataSource
  reset: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  onsubmit: (routeInfo: RouteInfo) => void
  onReset: () => void
  eventLayer: ImmutableObject<LrsLayer>
  eventFeatures: any[]
  routeInfo: RouteInfo
  onUpdateRouteInfo: (updatedRouteInfo: RouteInfo) => void
  intl: IntlShape
  resetForDataAction: boolean
}

const getFormStyle = () => {
  return css`
    display: flex;
    flex-direction: column;

    .merge-events-route-selection-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .merge-events-route-selection-form__actions {
      height: 100%;
    }
  `
}

export function MergeEventsRouteSelectionForm (props: MergeEventsRouteSelectionFormProps) {
  const {
    widgetId,
    network,
    networkDS,
    reset,
    jimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    eventLayer,
    eventFeatures,
    routeInfo,
    onUpdateRouteInfo,
    intl,
    resetForDataAction
  } = props

  // Reset routeInfo when network changes.
  React.useEffect(() => {
    if (isDefined(network)) {
      clearPickedGraphics()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network])

  React.useEffect(() => {
    if (reset) {
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

  const updateGraphics = async (routeInfo: RouteInfo, toFlash: boolean) => {
    if (isDefined(routeInfo.selectedPolyline) && toFlash) {
      flash(flashGraphic, await getGeometryGraphic(await getSimpleLineGraphic(routeInfo.selectedPolyline), colorCyan))
    }
    if (isDefined(routeInfo.selectedPoint)) {
      updatePickedGraphic(await getGeometryGraphic(await getSimplePointGraphic(routeInfo.selectedPoint), colorGreen))
    } else {
      clearPickedGraphics()
    }
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (newRouteInfo: RouteInfo, flash: boolean = false) => {
    onUpdateRouteInfo(newRouteInfo)
    updateGraphics(newRouteInfo, flash)
  }

  return (
    <div className='merge-events-route-selection-form__content d-flex' css={getFormStyle()}>
      <div className='d-flex w-100'>
        <RouteAndMeasureForm
          widgetId={widgetId}
          network={network}
          networkDS={networkDS}
          routeInfo={routeInfo}
          jimuMapView={jimuMapView}
          hoverGraphic={hoverGraphic}
          reset={reset}
          clearPickedGraphic={clearPickedGraphics}
          onRouteInfoUpdated={handleRouteInfoUpdate}
          eventLayer={eventLayer}
          eventFeatures={eventFeatures}
          intl={intl}
          resetForDataAction={resetForDataAction}
        />
      </div>
      <div className='d-flex w-100'>
        <MergeEventsDateForm
          routeInfo={routeInfo}
          reset={reset}
          eventLayer={eventLayer}
          onUpdateRouteInfo={handleRouteInfoUpdate}
          intl={intl}/>
      </div>
  </div>
  )
}
