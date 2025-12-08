/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  type ImmutableObject,
  css,
  type IntlShape
} from 'jimu-core'
import {
  type RouteInfo,
  type NetworkInfo,
  getGeometryGraphic,
  getSimpleLineGraphic,
  getSimplePointGraphic,
  getInitialRouteInfoState,
  isDefined,
  flash,
  getDateWithoutTime
} from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { RouteAndMeasureForm } from './route-and-measure-form'
import { SplitEventDateForm } from './split-event-date-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan, colorGreen } from '../constants'

export interface SplitEventRouteSelectionFormProps {
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  isReady: boolean
  networkDS: DataSource
  reset: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  onUpdateRouteInfo: (newRouteInfo: RouteInfo) => void
  intl: IntlShape
  hideDate: boolean
  useRouteStartDate: boolean
  routeInfoFromDataAction?: RouteInfo
  revalidateRouteFromDataAction: boolean
  onResetDataAction: () => void
  onValidationChanged: (isValid: boolean) => void
}

const getFormStyle = () => {
  return css`
    display: flex;
    flex-direction: column;

    .split-event-route-selection-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .split-event-route-selection-form__actions {
      height: 100%;
    }
  `
}

export function SplitEventRouteSelectionForm (props: SplitEventRouteSelectionFormProps) {
  const {
    widgetId,
    network,
    networkDS,
    reset,
    jimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    onUpdateRouteInfo,
    intl,
    hideDate,
    useRouteStartDate,
    routeInfoFromDataAction,
    revalidateRouteFromDataAction,
    onResetDataAction,
    isReady,
    onValidationChanged
  } = props
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(getInitialRouteInfoState())

  // Reset routeInfo when network changes.
  React.useEffect(() => {
    if (isDefined(network) && !revalidateRouteFromDataAction) {
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
    setRouteInfo(newRouteInfo)
    onUpdateRouteInfo(newRouteInfo)
    updateGraphics(newRouteInfo, flash)
  }

  // Returns if the current input data is valid.
  const isValidRouteSelection = React.useCallback(() => {
    // Route id check.
    if (!routeInfo.validRoute) {
      return false
    }
    if (routeInfo.routeId?.length === 0) {
      return false
    }

    // Selected measure check.
    if (isNaN(routeInfo.selectedMeasure)) {
      return false
    }

    // From Measure check.
    if (isNaN(routeInfo.fromMeasure)) {
      return false
    }
    if (routeInfo.selectedMeasure < routeInfo.fromMeasure) {
      return false
    }

    // Dates check.
    if (!isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      // No date selected.
      return false
    }

    if (isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedFromDate)
      const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.fromDate)
      const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo.toDate)

      // Only from date provided.
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedFromDateWithoutTime < routeInfoFromDateWithoutTime) {
        // Selected from date less than routes from date.
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedFromDateWithoutTime > routeInfoToDateWithoutTime) {
        // Selected from date greater than routes to date.
        return false
      }
    }

    return true
  }, [routeInfo])

  React.useEffect(() => {
    onValidationChanged(isValidRouteSelection() && isReady)
  }, [isReady, isValidRouteSelection, onValidationChanged])

  return (
    <div className='split-event-route-selection-form__content d-flex' css={getFormStyle()}>
      <div className='d-flex w-100'>
        <RouteAndMeasureForm
          widgetId={widgetId}
          isReady={isReady}
          network={network}
          networkDS={networkDS}
          routeInfo={routeInfo}
          jimuMapView={jimuMapView}
          hoverGraphic={hoverGraphic}
          reset={reset}
          clearPickedGraphic={clearPickedGraphics}
          onRouteInfoUpdated={handleRouteInfoUpdate}
          routeInfoFromDataAction={routeInfoFromDataAction}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onResetDataAction={onResetDataAction}
          intl={intl}
          measureLabelId='splitMeasureWithUnits'
        />
      </div>
      <div className='d-flex w-100'>

      <SplitEventDateForm
        routeInfo={routeInfo}
        reset={reset}
        onUpdateRouteInfo={handleRouteInfoUpdate}
        hideDate={hideDate}
        useRouteStartDate={useRouteStartDate}
        revalidateRouteFromDataAction={revalidateRouteFromDataAction}
      />
      </div>
  </div>
  )
}
