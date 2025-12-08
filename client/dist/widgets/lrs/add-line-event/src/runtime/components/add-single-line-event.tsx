/** @jsx jsx */
import { React, jsx, hooks, type ImmutableArray, css, classNames, type ImmutableObject, Immutable, type DataSource, type IntlShape, focusElementInKeyboardMode, type FeatureLayerDataSource } from 'jimu-core'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import type { OperationType, DefaultInfo } from '../../config'
import {
  type EventInfo,
  type LrsLayer,
  type RouteInfo,
  type RouteMeasurePickerInfo,
  InlineEditableDropdown,
  LrsLayerType,
  SearchMethod,
  getGeometryGraphic,
  getInitialEventInfoState,
  getInitialRouteInfoState,
  getInitialRouteMeasurePickerInfoState,
  getSimpleLineGraphic,
  getSimplePointGraphic,
  isDefined,
  LockManagerComponent,
  LockAction,
  type LrsLocksInfo,
  type AcquireLockResponse,
  getIntialLocksInfo,
  getRouteMeasures,
  type ConcurrenciesResponse,
  type DateRange,
  waitTime
} from 'widgets/shared-code/lrs'
import { Checkbox, FOCUSABLE_CONTAINER_CLASS, Label, Select, Button, Option } from 'jimu-ui'
import { AddLineEventFormHeader } from './add-line-event-form-header'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { AddLineEventAttributes } from './add-line-event-attributes'
import { DataSourceManager } from '../data-source/data-source-manager'
import { AddLineEventRouteSelectionForm } from './add-line-event-route-selection-form'
import { AddLineEventDateForm } from './add-line-event-date-form'
import { colorCyan, colorGreen, colorRed } from '../constants'
import { MergeRetireAddForm } from './merge-retire-add-form'
import { AddLineEventOperationType } from './add-line-event-operation-type'
import { isValidRouteSelectionUtil } from '../utilities/validation-utils'
import { AddLineEventConcurrencies } from './add-line-event-concurrencies'
import { getLineConcurrencies, type ConcurrenciesResult } from '../utilities/concurrencies-utils'
import { getTheme } from 'jimu-theme'

export interface AddSingleLineEventProps {
  intl: IntlShape
  widgetId: string
  lrsLayers: ImmutableArray<LrsLayer>
  lineEventLayers: ImmutableArray<string>
  networkLayers: ImmutableArray<string>
  intersectionLayers: ImmutableArray<string>
  defaultEvent: DefaultInfo
  defaultFromMethod: SearchMethod
  defaultToMethod: SearchMethod
  JimuMapView: JimuMapView
  operationType: OperationType
  hoverGraphic: GraphicsLayer
  pickedFromGraphic: GraphicsLayer
  pickedToGraphic: GraphicsLayer
  pickedConcurrencyGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  hideMethod: boolean
  hideEvent: boolean
  hideNetwork: boolean
  hideType: boolean
  hideMeasures: boolean
  hideDates: boolean
  hideTitle: boolean
  useRouteStartEndDate: boolean
  conflictPreventionEnabled: boolean
  networkDataSourceFromDataAction: DataSource
  routeInfoFromDataAction: RouteInfo
  onResetDataAction: () => void
  onClearGraphics: () => void
  onClearHoverGraphic: () => void
  onOperationTypeChanged: (type: OperationType) => void
  hideAddToDominantRouteOption: boolean
  enableAddToDominantRouteOption: boolean
  notAllowOverrideEventReplacement: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    &.wrapped .add-single-line-event-form {
      height: 100%;
    }
    .add-single-line-event__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .add-single-line-event__actions {
      height: 100%;
    }
    .add-line-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function AddSingleLineEvent (props: AddSingleLineEventProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    lrsLayers,
    lineEventLayers,
    networkLayers,
    defaultEvent,
    defaultFromMethod,
    defaultToMethod,
    JimuMapView,
    operationType,
    hoverGraphic,
    pickedFromGraphic,
    pickedToGraphic,
    pickedConcurrencyGraphic,
    flashGraphic,
    hideEvent,
    hideNetwork,
    hideType,
    hideMethod,
    hideMeasures,
    hideDates,
    hideTitle,
    useRouteStartEndDate,
    conflictPreventionEnabled,
    networkDataSourceFromDataAction,
    routeInfoFromDataAction,
    onResetDataAction,
    onClearGraphics,
    onClearHoverGraphic,
    onOperationTypeChanged,
    hideAddToDominantRouteOption,
    enableAddToDominantRouteOption,
    notAllowOverrideEventReplacement
  } = props
  const [section, setSection] = React.useState(0)
  const [networkDS, setNetworkDS] = React.useState<DataSource>(null)
  const [eventDS, setEventDS] = React.useState<DataSource>(null)
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [isDSReady, setIsDSReady] = React.useState<boolean>(false)
  const [selectedFromMethod, setSelectedFromMethod] = React.useState(defaultFromMethod)
  const [selectedToMethod, setSelectedToMethod] = React.useState(defaultToMethod)
  const [reset, setReset] = React.useState<boolean>(false)
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(getInitialRouteInfoState())
  const [revalidateRouteFromDataAction, setRevalidateRouteFromDataAction] = React.useState<boolean>(false)
  const [useStartMeasure, setUseStartMeasure] = React.useState<boolean>(false)
  const [useEndMeasure, setUseEndMeasure] = React.useState<boolean>(false)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const [lockAquired, setLockAquired] = React.useState<boolean>(!conflictPreventionEnabled)
  const containerWrapperRef = React.useRef<HTMLDivElement>(null)
  const [resetSelectedField, setResetSelectedField] = React.useState<boolean>(false)
  const [concurrenciesResponse, setConcurrenciesResponse] = React.useState<ConcurrenciesResponse>(null)
  const [addToDominantRoute, setAddToDominantRoute] = React.useState<boolean>(enableAddToDominantRouteOption)
  const [resetConcurrencies, setResetConcurrencies] = React.useState<boolean>(false)
  const [hasConcurrencies, setHasConcurrencies] = React.useState<boolean>(false)
  const [dateRanges, setDateRanges] = React.useState<DateRange[]>([])
  const methodRef = React.useRef(null)

  // DS
  const handleNetworkDsCreated = React.useCallback(
    (ds: DataSource) => {
      setNetworkDS(ds)
    },
    [setNetworkDS]
  )

  const handleEventDsCreated = React.useCallback(
    (ds: DataSource) => {
      setEventDS(ds)
    },
    [setEventDS]
  )

  const handleDataSourcesReady = React.useCallback(() => {
    setIsDSReady(true)
  }, [setIsDSReady])

  React.useEffect(() => {
    focusElementInKeyboardMode(containerWrapperRef.current)
  }, [])

  React.useEffect(() => {
    setSection(0)
    setReset(true)
    waitTime(800).then(() => {
      setReset(false)
    })
  }, [lrsLayers])

  React.useEffect(()=> {
    if (useEndMeasure) {
      const updateRouteInfo = routeInfo
      updateRouteInfo.selectedToMeasure = updateRouteInfo.toRouteToMeasure
      handleRouteInfoUpdate(updateRouteInfo)
    }
    if (useStartMeasure) {
      const updateRouteInfo = routeInfo
      updateRouteInfo.selectedMeasure = updateRouteInfo.fromMeasure
      handleRouteInfoUpdate(updateRouteInfo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo, useStartMeasure, useEndMeasure])

  // Set defaults
  React.useEffect(() => {
    const hasValidSelectedEvent = isDefined(selectedEvent) && lrsLayers.some((item) => item.name === selectedEvent.name)

    if (hasValidSelectedEvent) {
      const networkLayer = lrsLayers.find(
        (item) => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === selectedEvent.eventInfo.parentNetworkId
      )
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
      } else {
        setSelectedNetwork(null)
      }
    } else {
      const defaultEventLayer = lrsLayers.find(
        (item) => item.name === defaultEvent.name
      )
      setSelectedEvent(Immutable(defaultEventLayer))
    }
  }, [defaultEvent, lrsLayers, selectedEvent])

  React.useEffect(() => {
    async function fetchMeasures() {
      if (isDefined(routeInfoFromDataAction)
          && (isNaN(routeInfoFromDataAction.fromMeasure) || isNaN(routeInfoFromDataAction.toRouteToMeasure))) {
          const rteInfo = await getRouteMeasures(routeInfoFromDataAction, selectedNetwork, networkDS)
          if (isDefined(rteInfo.fromMeasure) && isDefined(rteInfo.toRouteToMeasure)) {
            routeInfoFromDataAction.fromMeasure = rteInfo.fromMeasure
            routeInfoFromDataAction.toRouteToMeasure = rteInfo.toRouteToMeasure
          }
        }
    }

    fetchMeasures()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDataSourceFromDataAction, routeInfoFromDataAction])

  React.useEffect(() => {
    const newDataAction = isDefined(networkDataSourceFromDataAction) || isDefined(routeInfoFromDataAction)
    if (newDataAction) {
      handleReset()
    }

    if (newDataAction) {
      setTimeout(() => {
        if (isDefined(networkDataSourceFromDataAction)) {
          if (networkDataSourceFromDataAction.id !== selectedNetwork?.id) {
            setNetworkDS(networkDataSourceFromDataAction)
            let nds = networkDataSourceFromDataAction
            if (networkDataSourceFromDataAction.id.includes('output_point') || networkDataSourceFromDataAction.id.includes('output_line')) {
              nds = networkDataSourceFromDataAction.getOriginDataSources()[0] as FeatureLayerDataSource
            }

            let lrsLayer: ImmutableObject<LrsLayer>
            lrsLayers.forEach((layer) => {
              if (layer.id === nds.id && isDefined(layer.networkInfo)) {
                lrsLayer = layer
              }
            })
            const eventLayer = lrsLayers.find((item) => item.eventInfo.parentNetworkId === lrsLayer.networkInfo.lrsNetworkId && !item.eventInfo.isPointEvent)
            if (isDefined(eventLayer)) {
              handleEventChanged(eventLayer.name)
            }
          }
        }
        if (isDefined(routeInfoFromDataAction)) {
          // Two records were selected for dataAction but event is non-spanning so change toRoute to be fromRoute
          if (!selectedEvent.eventInfo.canSpanRoutes && routeInfoFromDataAction.routeId !== routeInfoFromDataAction.toRouteId) {
            routeInfoFromDataAction.toRouteId = routeInfoFromDataAction.routeId
            routeInfoFromDataAction.toRouteName = routeInfoFromDataAction.routeName
            routeInfoFromDataAction.toRouteFromMeasure = routeInfoFromDataAction.fromMeasure
            routeInfoFromDataAction.toRouteToMeasure = routeInfoFromDataAction.toMeasure
            routeInfoFromDataAction.selectedToPolyline = routeInfoFromDataAction.selectedPolyline
            routeInfoFromDataAction.toRouteFromDate = routeInfoFromDataAction.fromDate
            routeInfoFromDataAction.toRouteToDate = routeInfoFromDataAction.toDate
          }
          handleRouteInfoUpdate(routeInfoFromDataAction)
          setRevalidateRouteFromDataAction(true)
        }
      }, 2000)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDataSourceFromDataAction, routeInfoFromDataAction])

  // Set lock info
  React.useEffect(() => {
    if (conflictPreventionEnabled) {
      buildLockInfo()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, selectedNetwork])

  const buildLockInfo = (action: LockAction = LockAction.None, routeInfo?: RouteInfo) => {
    const updatedLockInfo = { ...lockInfo }
    if (isDefined(selectedNetwork)) {
      updatedLockInfo.networkId = [selectedNetwork.networkInfo.lrsNetworkId]
    }
    if (isDefined(selectedEvent)) {
      updatedLockInfo.eventServiceLayerIds = [selectedEvent.serviceId]
    }
    if (isDefined(routeInfo)) {
      updatedLockInfo.routeInfo = routeInfo
      updatedLockInfo.routeOrLineId = []
    }
    updatedLockInfo.lockAction = action
    setLockInfo(updatedLockInfo)
  }

  // Event changed
  const handleEventChanged = React.useCallback(
    (value: string) => {
      const eventLayer = lrsLayers.find((item) => item.name === value)
      if (eventLayer) {
        const networkLayer = lrsLayers.find(
          (item) => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === eventLayer.eventInfo.parentNetworkId
        )
        // reset the pickers to default state
        const newRouteMeasurePickerInfo = getInitialRouteMeasurePickerInfoState()
        handleRouteMeasurePickerInfoUpdate(newRouteMeasurePickerInfo)
        if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
          if (selectedEvent && (selectedEvent.eventInfo.parentNetworkId !== eventLayer.eventInfo.parentNetworkId || eventLayer.eventInfo.canSpanRoutes ||
            (selectedEvent.eventInfo.canSpanRoutes && !eventLayer.eventInfo.canSpanRoutes))) {
            setSelectedNetwork(Immutable(networkLayer))

            if (!isDefined(routeInfoFromDataAction)) {
              const updateRouteInfo = getInitialRouteInfoState()
              handleRouteInfoUpdate(updateRouteInfo)
            }

            // reset the state of useStartMeasure and useEndMeasure
            if (!hideMeasures) {
              setUseStartMeasure(false)
              setUseEndMeasure(false)
            }
          }
        }
        setResetSelectedField(true)
        setSelectedEvent(Immutable(eventLayer))
        onClearHoverGraphic()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lrsLayers, selectedEvent, selectedNetwork, routeInfoFromDataAction]
  )

  // Network changed
  const handleNetworkChanged = React.useCallback(
    (value: string) => {
      const networkLayer = lrsLayers.find((layer) => layer.name === value)
      if (isDefined(networkLayer)) {
        setSelectedNetwork(Immutable(networkLayer))
      }
    },
    [lrsLayers]
  )

  // From Method picker changed
  const handleFromMethodChanged = React.useCallback((value: SearchMethod) => {
    setSelectedFromMethod(value)
  }, [])

  // To Method picker changed
  const handleToMethodChanged = React.useCallback((value: SearchMethod) => {
    setSelectedToMethod(value)
  }, [])

  // Back to route selection.
  const handleNavBackMain = React.useCallback((reset: boolean) => {
    if (reset) {
      handleReset()
    }
    setSection(0)
    if (containerWrapperRef.current) {
      focusElementInKeyboardMode(containerWrapperRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Back to concurrencies.
  const handleNavBackConcurrencies = React.useCallback((reset: boolean, concurrenciesFound: boolean, addToDominantRouteIsChecked: boolean) => {
    if (reset) {
      handleReset()
    }

    if (concurrenciesFound && addToDominantRouteIsChecked && !notAllowOverrideEventReplacement) {
      setSection(1) // concurrencies page
    } else{
      setSection(0) // main page
    }

    if (containerWrapperRef.current) {
      focusElementInKeyboardMode(containerWrapperRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    setUseStartMeasure(hideMeasures)
    setUseEndMeasure(hideMeasures)
  }, [hideMeasures])

  React.useEffect(() => {
    if (hideMeasures) {
      setUseStartMeasure(hideMeasures)
      setUseEndMeasure(hideMeasures)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset form to initial configuration
  const handleReset = () => {
    onClearGraphics()
    const updateRouteInfo = getInitialRouteInfoState()
    handleRouteInfoUpdate(updateRouteInfo, false, true)
    const updateEventInfo = getInitialEventInfoState()
    handleEventInfoUpdate(updateEventInfo)
    const newRouteMeasurePickerInfo = getInitialRouteMeasurePickerInfoState()
    handleRouteMeasurePickerInfoUpdate(newRouteMeasurePickerInfo)
    if (!hideMeasures) {
      setUseStartMeasure(false)
      setUseEndMeasure(false)
    }
    setAddToDominantRoute(enableAddToDominantRouteOption)
    setResetConcurrencies(true)
    setReset(true)
    setTimeout(() => {
      setResetConcurrencies(false)
      setReset(false)
    }, 800)
  }

  // Update data action reset
  const resetDataAction = () => {
    setRevalidateRouteFromDataAction(false)
    onResetDataAction()
  }

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (
    newRouteInfo: RouteInfo,
    flash: boolean = false,
    reset: boolean = false
  ) => {
    if (newRouteInfo === undefined) {
      // RouteInfo at minimum should be set to initial routeInfo state. Never undefined.
      return
    }
    // Ensure new object is created and used to trigger state change.
    setRouteInfo(prev => ({ ...prev, ...newRouteInfo }))
    updateGraphics(newRouteInfo, flash)
    if (conflictPreventionEnabled) {
      const action = reset ? LockAction.Clear : LockAction.QueryAndAcquire
      buildLockInfo(action, newRouteInfo)
    }
  }

  const [eventInfo, setEventInfo] = React.useState<EventInfo>(
    getInitialEventInfoState()
  )

  // Update eventInfo state changes.
  const handleEventInfoUpdate = (
    newEventInfo: EventInfo
  ) => {
    setEventInfo(newEventInfo)
  }

  // Set initial state of RouteMeasurePickerInfo
  const [routeMeasurePickerInfo, setRouteMeasurePickerInfo] = React.useState<RouteMeasurePickerInfo>(
    getInitialRouteMeasurePickerInfoState()
  )

  // Update RouteMeasurePickerInfo state changes
  const handleRouteMeasurePickerInfoUpdate = (
    newRouteMeasurePickerInfo: RouteMeasurePickerInfo
  ) => {
    setRouteMeasurePickerInfo(newRouteMeasurePickerInfo)
  }

  // Reset routeInfo when network changes.
  React.useEffect(() => {
    if (isDefined(selectedNetwork) && !isDefined(networkDataSourceFromDataAction)) {
      setRouteInfo(getInitialRouteInfoState())
      setEventInfo(getInitialEventInfoState())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork])

  const handleNextAttributes = () => {
    setResetSelectedField(false)
    setResetConcurrencies(false)
    setSection(2)
  }

  // Graphics
  const clearFromPickedGraphic = (): void => {
    if (isDefined(pickedFromGraphic)) {
      pickedFromGraphic.removeAll()
    }
  }

  const clearToPickedGraphic = (): void => {
    if (isDefined(pickedToGraphic)) {
      pickedToGraphic.removeAll()
    }
  }

  const updateFromPickedGraphic = (graphic: __esri.Graphic) => {
    if (!isDefined(graphic)) {
      clearFromPickedGraphic()
    } else {
      pickedFromGraphic.removeAll()
      pickedFromGraphic.add(graphic)
    }
  }

  const updateToPickedGraphic = (graphic: __esri.Graphic) => {
    if (!isDefined(graphic)) {
      clearToPickedGraphic()
    } else {
      pickedToGraphic.removeAll()
      pickedToGraphic.add(graphic)
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
      flashSelectedGeometry(
        await getGeometryGraphic(
          await getSimpleLineGraphic(routeInfo.selectedPolyline),
          colorCyan
        )
      )
    }
    // From point
    if (isDefined(routeInfo.selectedPoint)) {
      updateFromPickedGraphic(
        await getGeometryGraphic(
          await getSimplePointGraphic(routeInfo.selectedPoint),
          colorGreen
        )
      )
    } else {
      clearFromPickedGraphic()
    }
    // To point
    if (isDefined(routeInfo.selectedToPoint)) {
      updateToPickedGraphic(
        await getGeometryGraphic(
          await getSimplePointGraphic(routeInfo.selectedToPoint),
          colorRed
        )
      )
    } else {
      clearToPickedGraphic()
    }

    if (isDefined(JimuMapView)) {
      JimuMapView.clearSelectedFeatures()
    }
  }

  // Returns if the current input data is valid.
  const isValidRouteSelection = React.useCallback(() => {
    return isValidRouteSelectionUtil(routeInfo, selectedEvent, lockAquired, selectedNetwork)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo, lockAquired])

  const handleQueryLocksCompleted = React.useCallback((lockInfo: LrsLocksInfo, acquiredInfo: AcquireLockResponse, success: boolean) => {
    if (success) {
      setLockAquired(true)
    } else {
      setLockAquired(false)
    }
    setLockInfo(lockInfo)
  }, [])

  const handleMessageClear = () => {
    buildLockInfo(LockAction.None)
  }

  const handleUseStartMeasure = (e, checked: boolean) => {
    if (checked) {
      const updateRouteInfo = routeInfo
      updateRouteInfo.selectedMeasure = updateRouteInfo.fromMeasure
      handleRouteInfoUpdate(updateRouteInfo)
    }

    setUseStartMeasure(checked)
  }

  const handleUseEndMeasure = (e, checked: boolean) => {
    if (checked) {
      const updateRouteInfo = routeInfo
      updateRouteInfo.selectedToMeasure = updateRouteInfo.toRouteToMeasure
      handleRouteInfoUpdate(updateRouteInfo)
    }

    setUseEndMeasure(checked)
  }

  const handleAddToDominantRouteUpdate = React.useCallback((checked: boolean) => {
    setAddToDominantRoute(checked)
  }, [])

  const handleConcurrenciesResponseUpdated = React.useCallback((response: ConcurrenciesResponse) => {
    setConcurrenciesResponse(response)
  }, [])

  const handleResetClicked = React.useCallback((reset: boolean) => {
    if (reset) {
      setResetConcurrencies(true)
      setTimeout(() => {
        setResetConcurrencies(false)
      }, 800)
    }
  }, [])

  // Open concurrencies section
  const handleNextConcurrencies = React.useCallback(async (routeInfo, networkDS, network, addToDominantRouteIsChecked) => {
    setRouteInfo(routeInfo)
    setResetSelectedField(false)
    setResetConcurrencies(false)

    if (addToDominantRouteIsChecked) {
      const concurrenciesResult: ConcurrenciesResult = await getLineConcurrencies(routeInfo, network, networkDS)
      setDateRanges(concurrenciesResult.dateRanges)
      setConcurrenciesResponse(concurrenciesResult.newResponse)

      if (concurrenciesResult.response.locations.length > 0 && concurrenciesResult.concurrenciesAdded && !notAllowOverrideEventReplacement)
      {
        setHasConcurrencies(true)
        setSection(1) // concurrencies page
      }
      else
      {
        setHasConcurrencies(false)
        setSection(2) // attributes page
      }
    } else {
     setSection(2) // attributes page
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitForm = React.useCallback(() => {
    methodRef.current?.handleNextClicked()
  }, [])

  return (
    <div className="add-single-line-event h-100 d-flex" ref={containerWrapperRef} tabIndex={-1} css={getFormStyle()}>
      <DataSourceManager
        network={selectedNetwork}
        event={selectedEvent}
        dataSourcesReady={handleDataSourcesReady}
        onCreateNetworkDs={handleNetworkDsCreated}
        onCreateEventDs={handleEventDsCreated}
      />
      {!hideTitle && <AddLineEventFormHeader />}
      <div
        className={classNames('add-single-line-event__content', {
          'd-none': section !== 0,
          [FOCUSABLE_CONTAINER_CLASS]: section === 0
        })}
      >
        {conflictPreventionEnabled && (
          <LockManagerComponent
            intl={intl}
            showAlert={true}
            featureDS={networkDS as FeatureLayerDataSource}
            lockInfo={lockInfo}
            networkName={selectedNetwork?.networkInfo?.datasetName}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onQueryAndAcquireComplete={handleQueryLocksCompleted}
            onMessageClear={handleMessageClear}
          />
        )}
        {!hideType && (
          <AddLineEventOperationType
            operationType={operationType}
            onOperationTypeChanged={onOperationTypeChanged}
          />
        )}
        {!hideEvent && (
          <div>
            <Label size="sm" className="pt-2 mb-0 px-3 w-100 title3">
              {getI18nMessage('eventLayerLabel')}
            </Label>
            <Select
              aria-label={getI18nMessage('eventLayerLabel')}
              className="w-100 px-3"
              size="sm"
              value={selectedEvent ? selectedEvent.name : ''}
              disabled={lineEventLayers.length === 1}
              onChange={(evt) => {
                handleEventChanged(evt.target.value)
              }}
            >
              {lineEventLayers.map((element, index) => {
                return (
                  <Option key={index} value={element}>
                    {element}
                  </Option>
                )
              })}
            </Select>
          </div>
        )}
        {!hideNetwork && (
          <InlineEditableDropdown
            label={getI18nMessage('networkLabel')}
            isDisabled={true}
            defaultItem={isDefined(selectedNetwork) ? selectedNetwork.name : ''}
            listItems={networkLayers}
            onSelectionChanged={handleNetworkChanged}
          />
        )}
        {!hideMethod && (
          <InlineEditableDropdown
            label={getI18nMessage('fromMethodLabel')}
            defaultItem={selectedFromMethod}
            isDisabled={true}
            listItems={[SearchMethod.Measure]}
            altItemDescriptions={[
              getI18nMessage('routeAndMeasure')
            ]}
            onSelectionChanged={handleFromMethodChanged}
          />
        )}
        <AddLineEventRouteSelectionForm
          intl={intl}
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          event={selectedEvent}
          dsReady={!isDSReady}
          networkDS={networkDS}
          method={selectedFromMethod}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedFromGraphic}
          isFrom={true}
          routeInfo={routeInfo}
          routeMeasurePickerInfo={routeMeasurePickerInfo}
          reset={reset}
          hideMeasures={hideMeasures}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onResetDataAction={resetDataAction}
          canSpanRoutes={isDefined(selectedEvent) && isDefined(selectedEvent.eventInfo) ? selectedEvent.eventInfo.canSpanRoutes : false}
          onUpdateRouteInfo={handleRouteInfoUpdate}
          onUpdateRouteMeasurePickerInfo={handleRouteMeasurePickerInfoUpdate}
          useStartMeasure={useStartMeasure}
          useEndMeasure={useEndMeasure}
          onsubmit={handleNextConcurrencies}
          ref={methodRef}
          addToDominantRoute={addToDominantRoute}
        />
        {!hideMeasures && (
          <Label size="sm" className="pt-2 mb-0 px-3 w-100 label2" centric check>
            <Checkbox
              checked={useStartMeasure}
              className="mr-2"
              disabled={!isDefined(routeInfo) || isNaN(routeInfo.fromMeasure)}
              onChange={handleUseStartMeasure}
            />
            {getI18nMessage('useStartMeasureLabel')}
          </Label>
        )}
        {!hideMethod && (
          <InlineEditableDropdown
            label={getI18nMessage('toMethodLabel')}
            defaultItem={selectedToMethod}
            isDisabled={true}
            listItems={[SearchMethod.Measure]}
            altItemDescriptions={[
              getI18nMessage('routeAndMeasure')
            ]}
            onSelectionChanged={handleToMethodChanged}
          />
        )}
        <AddLineEventRouteSelectionForm
          intl={intl}
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          event={selectedEvent}
          dsReady={!isDSReady}
          networkDS={networkDS}
          method={selectedToMethod}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedToGraphic}
          isFrom={false}
          routeInfo={routeInfo}
          routeMeasurePickerInfo={routeMeasurePickerInfo}
          reset={reset}
          hideMeasures={hideMeasures}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onResetDataAction={resetDataAction}
          canSpanRoutes={isDefined(selectedEvent) && isDefined(selectedEvent.eventInfo) ? selectedEvent.eventInfo.canSpanRoutes : false}
          onUpdateRouteInfo={handleRouteInfoUpdate}
          onUpdateRouteMeasurePickerInfo={handleRouteMeasurePickerInfoUpdate}
          useStartMeasure={useStartMeasure}
          useEndMeasure={useEndMeasure}
          onsubmit={handleNextConcurrencies}
          ref={methodRef}
          addToDominantRoute={addToDominantRoute}
        />
        {!hideMeasures && (
          <Label size="sm" className="pt-2 mb-0 px-3 w-100 label2" centric check>
            <Checkbox
              checked={useEndMeasure}
              className="mr-2"
              disabled={!isDefined(routeInfo?.toRouteToMeasure) || isNaN(routeInfo.toRouteToMeasure)}
              onChange={handleUseEndMeasure}
            />
            {getI18nMessage('useEndMeasureLabel')}
          </Label>
        )}
        <AddLineEventDateForm
          intl={intl}
          hideDates={hideDates}
          useRouteStartEndDate={useRouteStartEndDate}
          routeInfo={routeInfo}
          eventInfo={selectedEvent ? selectedEvent.eventInfo : null}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onUpdateRouteInfo={handleRouteInfoUpdate}
        />
        <MergeRetireAddForm
          eventInfo={eventInfo}
          onUpdateEventInfo={handleEventInfoUpdate}
          hideAddToDominantRouteOption={hideAddToDominantRouteOption}
          addToDominantRoute={addToDominantRoute}
          onUpdateAddToDominantRoute={handleAddToDominantRouteUpdate}
        />
      </div>
      <div className={classNames('add-line-footer w-100', {
        'd-none': section !== 0,
        [FOCUSABLE_CONTAINER_CLASS]: section === 0
      })}>
        <Label
          size='sm'
          className='mt-auto mr-auto title3'
          centric
          style={{ color: getTheme()?.sys.color.primary.main }}
          onClick={handleReset}
        >
          {getI18nMessage('resetForm')}
        </Label>
          <div className="mt-auto ml-auto">
            <Button
              type='primary'
              className="active"
              aria-label={getI18nMessage('nextLabel')}
              size="sm"
              disabled={!isValidRouteSelection() && isDSReady}
              onClick={submitForm}
            >
              {getI18nMessage('nextLabel')}
            </Button>
          </div>
      </div>

      <div className={classNames('add-single-line-event__content', {
        'd-none': section !== 1,
        [FOCUSABLE_CONTAINER_CLASS]: section === 1
      })}>
        <AddLineEventConcurrencies
          intl={intl}
          networkDS={networkDS}
          network={selectedNetwork}
          eventLayer={selectedEvent}
          routeInfo={routeInfo}
          reset={reset || resetSelectedField || resetConcurrencies}
          conflictPreventionEnabled={conflictPreventionEnabled}
          onNavBack={handleNavBackMain}
          onNavNext={handleNextAttributes}
          concurrenciesResponse={concurrenciesResponse}
          onConcurrenciesResponseUpdated={handleConcurrenciesResponseUpdated}
          onResetClicked={handleResetClicked}
          dateRanges={dateRanges}
          pickedConcurrencyGraphic={pickedConcurrencyGraphic}
        />
      </div>

      <div
        className={classNames('add-single-line-event__content', {
          'd-none': section !== 2,
          [FOCUSABLE_CONTAINER_CLASS]: section === 2
        })}>
          {networkDS && eventDS &&
            <AddLineEventAttributes
              intl={intl}
              widgetId={widgetId}
              networkDS={networkDS}
              network={selectedNetwork}
              eventDS={eventDS}
              eventLayer={selectedEvent}
              routeInfo={routeInfo}
              eventInfo={eventInfo}
              reset={reset || resetSelectedField}
              jimuMapView={JimuMapView}
              hoverGraphic={hoverGraphic}
              conflictPreventionEnabled={conflictPreventionEnabled}
              onNavBack={handleNavBackConcurrencies}
              hasConcurrencies={hasConcurrencies}
              addToDominantRoute={addToDominantRoute}
              concurrenciesResponse={concurrenciesResponse}
            />
          }
      </div>
    </div>
  )
}
