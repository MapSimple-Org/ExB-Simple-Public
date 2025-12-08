/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  type ImmutableObject,
  css,
  type IntlShape
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { RouteAndMeasureForm } from './route-and-measure-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import {
  type RouteInfo,
  type NetworkInfo,
  type LrsLayer,
  type RouteMeasurePickerInfo,
  SearchMethod,
  isDefined
} from 'widgets/shared-code/lrs'
import { useImperativeHandle } from 'react'

export interface AddLineEventRouteSelectionFormProps {
  intl: IntlShape
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  event?: ImmutableObject<LrsLayer>
  dsReady: boolean
  networkDS: DataSource
  method: SearchMethod
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  isFrom: boolean
  routeInfo: RouteInfo
  routeMeasurePickerInfo: RouteMeasurePickerInfo
  reset: boolean
  revalidateRouteFromDataAction: boolean
  canSpanRoutes: boolean
  onResetDataAction: () => void
  useStartMeasure: boolean
  useEndMeasure: boolean
  hideMeasures: boolean
  onUpdateRouteInfo: (updatedRouteInfo: RouteInfo, flash?: boolean) => void
  onUpdateRouteMeasurePickerInfo: (updatedRouteMeasurePickerInfo: RouteMeasurePickerInfo) => void
  onsubmit: (routeInfo: RouteInfo, networkDS: DataSource, network: ImmutableObject<NetworkInfo>, addToDominantRouteIsChecked: boolean) => void
  addToDominantRoute: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .add-line-event-route-selection-form {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
      fontWeight: 500;
    }
  `
}

export const AddLineEventRouteSelectionForm = React.forwardRef((props: AddLineEventRouteSelectionFormProps, ref) => {
  const {
    intl,
    widgetId,
    network,
    event,
    networkDS,
    method,
    jimuMapView,
    hoverGraphic,
    pickedGraphic,
    isFrom,
    routeInfo,
    routeMeasurePickerInfo,
    reset,
    revalidateRouteFromDataAction,
    canSpanRoutes,
    onResetDataAction,
    useStartMeasure,
    useEndMeasure,
    hideMeasures,
    onUpdateRouteInfo,
    onUpdateRouteMeasurePickerInfo,
    onsubmit,
    addToDominantRoute
  } = props

  // Graphics
  const clearPickedGraphics = (): void => {
    if (isDefined(pickedGraphic)) {
      pickedGraphic.removeAll()
    }
  }

  const clearHoverGraphic = (): void => {
    if (isDefined(hoverGraphic)) {
      hoverGraphic.removeAll()
    }
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (
    newRouteInfo: RouteInfo,
    flash: boolean = false
  ) => {
    onUpdateRouteInfo(newRouteInfo, flash)
  }

  // Update routeMeasurePickerInfo state changes.
  const handleRouteMeasurePickerInfoUpdate = (
    newRouteMeasurePickInfo: RouteMeasurePickerInfo
  ) => {
    onUpdateRouteMeasurePickerInfo(newRouteMeasurePickInfo)
  }

  useImperativeHandle(ref, () => ({
    handleNextClicked
  }))

  const handleNextClicked = () => {
    onsubmit(routeInfo, networkDS, network, addToDominantRoute)
  }

  return (
    <div className="add-line-event-route-selection-form d-flex" css={getFormStyle()}>
      <div className="d-flex w-100">
        {method === SearchMethod.Measure && (
          <RouteAndMeasureForm
            intl={intl}
            widgetId={widgetId}
            network={network}
            event={event}
            networkDS={networkDS}
            routeInfo={routeInfo}
            jimuMapView={jimuMapView}
            hoverGraphic={hoverGraphic}
            clearPickedGraphic={clearPickedGraphics}
            clearHoverGraphic={clearHoverGraphic}
            onRouteInfoUpdated={handleRouteInfoUpdate}
            onRouteMeasurePickerInfoUpdated={handleRouteMeasurePickerInfoUpdate}
            routeMeasurePickerInfo={routeMeasurePickerInfo}
            isFrom={isFrom}
            canSpanRoutes={canSpanRoutes}
            reset={reset}
            revalidateRouteFromDataAction={revalidateRouteFromDataAction}
            onResetDataAction={onResetDataAction}
            useStartMeasure={useStartMeasure}
            useEndMeasure={useEndMeasure}
            hideMeasures={hideMeasures}
          />
        )}
        {method === SearchMethod.Coordinate && (
          <div>{/* Todo: coordinate form implementation */}</div>
        )}
        {method === SearchMethod.LocationOffset && (
          <div>{/* Todo: locationOffset form implementation */}</div>
        )}
      </div>
    </div>
  )
})
