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
  type NetworkInfo,
  type RouteInfo,
  SearchMethod,
  getGeometryGraphic,
  getInitialRouteInfoState,
  getSimpleLineGraphic,
  getSimplePointGraphic,
  getDateWithoutTime,
  isDefined
} from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { RouteAndMeasureForm } from './route-and-measure-form'
import { AddPointEventDateForm } from './add-point-event-date-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { colorCyan, colorGreen } from '../constants'
import { useImperativeHandle } from 'react'

export interface AddPointEventRouteSelectionFormProps {
  intl: IntlShape
  widgetId: string
  network: ImmutableObject<NetworkInfo>
  routeInfoFromDataAction: RouteInfo
  isReady: boolean
  networkDS: DataSource
  method: SearchMethod
  reset: boolean
  jimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  lockAquired: boolean
  hideDates: boolean
  useRouteStartEndDate: boolean
  revalidateRouteFromDataAction: boolean
  onResetDataAction: () => void
  onsubmit: (routeInfo: RouteInfo, networkDS: DataSource, network: ImmutableObject<NetworkInfo>, addToDominantRouteIsChecked: boolean) => void
  onRouteInfoUpdate: (routeInfo: RouteInfo) => void
  onValidationChanged: (isValid: boolean) => void
  addToDominantRoute: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .add-single-point-event-route-selection-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .add-single-point-event-route-selection-form__actions {
      height: 100%;
    }
  `
}

export const AddPointEventRouteSelectionForm = React.forwardRef((props: AddPointEventRouteSelectionFormProps, ref) => {
  const {
    intl,
    widgetId,
    network,
    isReady,
    networkDS,
    routeInfoFromDataAction,
    method,
    reset,
    jimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    lockAquired,
    hideDates,
    useRouteStartEndDate,
    revalidateRouteFromDataAction,
    onResetDataAction,
    onsubmit,
    onRouteInfoUpdate,
    onValidationChanged,
    addToDominantRoute
  } = props
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(getInitialRouteInfoState())

  useImperativeHandle(ref, () => ({
    handleNextClicked
  }))

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

  const handleNextClicked = () => {
    onsubmit(routeInfo, networkDS, network, addToDominantRoute)
  }

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
    if (isDefined(jimuMapView)) {
      setTimeout(() => {
        jimuMapView.clearSelectedFeatures()
      }, 100)
    }
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (newRouteInfo: RouteInfo, flash: boolean = false) => {
    setRouteInfo(newRouteInfo)
    onRouteInfoUpdate(newRouteInfo)
    updateGraphics(newRouteInfo, flash)
  }

  // Returns if the current input data is valid.
  const isValidRouteSelection = React.useCallback(() => {
    if (!lockAquired) {
      return false
    }

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

    // To Measure check.
    if (isNaN(routeInfo.toMeasure)) {
      return false
    }
    if (routeInfo.selectedMeasure > routeInfo.toMeasure) {
      return false
    }

    // Dates check.
    if (!isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
      // No date selected.
      return false
    }

    const routeInfoFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.fromDate)
    const routeInfoToDateWithoutTime: Date = getDateWithoutTime(routeInfo.toDate)
    const routeInfoSelectedFromDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedFromDate)
    const routeInfoSelectedToDateWithoutTime: Date = getDateWithoutTime(routeInfo.selectedToDate)

    if (isDefined(routeInfo.selectedFromDate) && !isDefined(routeInfo.selectedToDate)) {
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
    if (!isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Only to date provided.
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedToDateWithoutTime < routeInfoFromDateWithoutTime) {
        // Selected to date less than routes from date.
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedToDateWithoutTime > routeInfoToDateWithoutTime) {
        // Selected to date greater than routes to date.
        return false
      }
    }
    if (isDefined(routeInfo.selectedFromDate) && isDefined(routeInfo.selectedToDate)) {
      // Both from and to date provided.
      if (routeInfoSelectedFromDateWithoutTime > routeInfoSelectedToDateWithoutTime) {
        return false
      }
      if (isDefined(routeInfo.fromDate) && routeInfoSelectedFromDateWithoutTime < routeInfoFromDateWithoutTime) {
        return false
      }
      if (isDefined(routeInfo.toDate) && routeInfoSelectedToDateWithoutTime > routeInfoToDateWithoutTime) {
        return false
      }
    }

    return true
  }, [routeInfo, lockAquired])

  React.useEffect(() => {
    onValidationChanged(isValidRouteSelection() && isReady)
  }, [isReady, isValidRouteSelection, onValidationChanged])

  return (
    <div className='add-single-point-event-route-selection-form__content h-100 d-flex' css={getFormStyle()}>
      <div className='d-flex w-100'>
        {method === SearchMethod.Measure && (
          <RouteAndMeasureForm
            intl={intl}
            widgetId={widgetId}
            isReady={isReady}
            network={network}
            networkDS={networkDS}
            routeInfo={routeInfo}
            jimuMapView={jimuMapView}
            hoverGraphic={hoverGraphic}
            reset={reset}
            routeInfoFromDataAction={routeInfoFromDataAction}
            revalidateRouteFromDataAction={revalidateRouteFromDataAction}
            onResetDataAction={onResetDataAction}
            clearPickedGraphic={clearPickedGraphics}
            onRouteInfoUpdated={handleRouteInfoUpdate}
          />
        )}
        {method === SearchMethod.Coordinate && (
          <div>
              {/* Todo: coordinate form implementation */}
          </div>
        )}
        {method === SearchMethod.LocationOffset && (
          <div>
              {/* Todo: locationOffset form implementation */}
          </div>
        )}
      </div>
      <div className='d-flex w-100 h-100'>
        <AddPointEventDateForm
          hideDates={hideDates}
          useRouteStartEndDate={useRouteStartEndDate}
          routeInfo={routeInfo}
          reset={reset}
          onUpdateRouteInfo={handleRouteInfoUpdate }
        />
      </div>
  </div>
  )
})
