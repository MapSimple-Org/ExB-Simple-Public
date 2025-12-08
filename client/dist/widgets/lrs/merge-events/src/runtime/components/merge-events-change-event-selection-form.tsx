/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  hooks
} from 'jimu-core'
import {
  type RouteInfo,
  isDefined
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import { Button } from 'jimu-ui'
import type SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import type { JimuMapView } from 'jimu-arcgis'

export interface MergeEventsChangeEventSelectionFormProps {
  routeInfo: RouteInfo
  reset: boolean
  onUpdateRouteInfo: (updatedRouteInfo: RouteInfo) => void
  networkDS: DataSource
  jimuMapView: JimuMapView
  currentSketchVM: SketchViewModel
  isEventPickerActive: boolean
  onUpdateIsEventPickerActive: (isActive: boolean) => void
}

export type Status = 'invalid' | 'valid' | 'idle'

export function MergeEventsChangeEventSelectionForm (props: MergeEventsChangeEventSelectionFormProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { routeInfo, reset, onUpdateRouteInfo, currentSketchVM, isEventPickerActive, onUpdateIsEventPickerActive } = props
  const [useRouteFromDate, setUseRouteFromDate] = React.useState<boolean>(false)
  const [useRouteToDate, setUseRouteToDate] = React.useState<boolean>(false)
  const [selectModeActive, setSelectModeActive] = React.useState<boolean>(true)

  React.useEffect(() => {
    if (reset) {
      setUseRouteFromDate(false)
      setUseRouteToDate(false)
    }
  }, [reset])

  React.useEffect(() => {
    let didUpdate = false
    const updateRouteInfo = { ...routeInfo }

    // Update selected if the check is enabled, the routes from/to date has been set and the
    // date isn't already set to the current date. This gets hit every time routeInfo updates so
    // make sure we don't continue unnessasary updates.
    if (
      isDefined(routeInfo.selectedFromDate) &&
      useRouteFromDate &&
      routeInfo.selectedFromDate !== routeInfo.fromDate
    ) {
      updateRouteInfo.selectedFromDate = routeInfo.fromDate
      didUpdate = true
    }
    if (
      useRouteToDate &&
      routeInfo.selectedToDate !== routeInfo.toDate
    ) {
      updateRouteInfo.selectedToDate = routeInfo.toDate
      didUpdate = true
    }

    if (didUpdate) {
      onUpdateRouteInfo(updateRouteInfo)
    }

    //createApiWidget(jimuMapView)
  }, [onUpdateRouteInfo, routeInfo, useRouteFromDate, useRouteToDate])

  const onSelectButtonClicked = () => {
    setSelectModeActive(true)
    activateDrawOrSelectTool()
    const isPickerActive = !isEventPickerActive
    onUpdateIsEventPickerActive(isPickerActive)
  }

  const activateDrawOrSelectTool = () => {
    //Check for a valid sketch modal and then do the further processing
    if (currentSketchVM) {
      //Cancel sketchVM if newSelection or drawTool is active
      if (selectModeActive) {
        currentSketchVM.cancel()
      }
      //Activate select tool
      currentSketchVM.create('rectangle')
    }
  }

  return (
    <div className='merge-events-change-event-selection-form px-3 w-100 pt-3'>
      <Button role={'button'} aria-label={getI18nMessage('selectButtonLabel')} title={getI18nMessage('selectButtonLabel')}
        size={'sm'} type={isEventPickerActive ? 'primary' : 'secondary'} className='w-100 px-3' onClick={onSelectButtonClicked}>
        {getI18nMessage('selectButtonLabel')}
      </Button>
    </div>
  )
}
