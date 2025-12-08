/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type ImmutableArray,
  css,
  classNames,
  type ImmutableObject,
  Immutable,
  type DataSource,
  type IntlShape,
  focusElementInKeyboardMode,
  type FeatureLayerDataSource
} from 'jimu-core'
import {
  InlineEditableDropdown,
  type LrsLayer,
  LrsLayerType,
  type RouteInfo,
  SearchMethod,
  isDefined,
  type LrsLocksInfo,
  getIntialLocksInfo,
  LockManagerComponent,
  getInitialRouteInfoState,
  LockAction,
  type AcquireLockResponse,
  waitTime,
  type ConcurrenciesResponse,
  QueryRouteConcurrencies,
  type Concurrency,
  getRoutesByRouteIds,
  type RouteMapInfo,
  type LrsAttributesInfo,
  type DateRange
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import type { OperationType, DefaultInfo } from '../../config'
import { Button, FOCUSABLE_CONTAINER_CLASS, Label, Option, Select } from 'jimu-ui'
import { AddPointEventFormHeader } from './add-point-event-form-header'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { AddPointEventAttributes } from './add-point-event-attributes'
import { AddPointEventConcurrencies } from './add-point-event-concurrencies'
import { DataSourceManager } from '../data-source/data-source-manager'
import { AddPointEventRouteSelectionForm } from './add-point-event-route-selection-form'
import { AddPointEventOperationType } from './add-point-operation-type'
import { AddToDominantRouteForm } from './add-to-dominant-route-form'
import { round } from 'lodash-es'
import { getTheme } from 'jimu-theme'

export interface AddSinglePointEventProps {
  intl: IntlShape
  widgetId: string
  lrsLayers: ImmutableArray<LrsLayer>
  eventLayers: ImmutableArray<string>
  networkLayers: ImmutableArray<string>
  instersectionLayers: ImmutableArray<string>
  defaultEvent: DefaultInfo
  defaultMethod: SearchMethod
  JimuMapView: JimuMapView
  operationType: OperationType
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  conflictPreventionEnabled: boolean
  hideMethod: boolean
  hideEvent: boolean
  hideNetwork: boolean
  hideType: boolean
  hideDates: boolean
  hideTitle: boolean
  useRouteStartEndDate: boolean
  networkDataSourceFromDataAction: DataSource
  routeInfoFromDataAction: RouteInfo
  onResetDataAction: () => void
  onClearGraphic: () => void
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

    .add-single-point-event__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .add-point-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function AddSinglePointEvent (props: AddSinglePointEventProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    lrsLayers,
    eventLayers,
    networkLayers,
    defaultEvent,
    defaultMethod,
    JimuMapView,
    operationType,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    conflictPreventionEnabled,
    hideEvent,
    hideNetwork,
    hideType,
    hideMethod,
    hideDates,
    hideTitle,
    useRouteStartEndDate,
    networkDataSourceFromDataAction,
    routeInfoFromDataAction,
    onResetDataAction,
    onClearGraphic,
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
  const [selectedMethod, setSelectedMethod] = React.useState(defaultMethod)
  const [reset, setReset] = React.useState<boolean>(false)
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(getInitialRouteInfoState())
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const [lockAquired, setLockAquired] = React.useState<boolean>(!conflictPreventionEnabled)
  const [revalidateRouteFromDataAction, setRevalidateRouteFromDataAction] = React.useState<boolean>(false)
  const containerWrapperRef = React.useRef<HTMLDivElement>(null)
  const [isValidInput, setIsValidInput] = React.useState<boolean>(true)
  const [resetSelectedField, setResetSelectedField] = React.useState<boolean>(false)
  const methodRef = React.useRef(null)
  const [concurrenciesResponse, setConcurrenciesResponse] = React.useState<ConcurrenciesResponse>(null)
  const [addToDominantRoute, setAddToDominantRoute] = React.useState<boolean>(enableAddToDominantRouteOption)
  const [resetConcurrencies, setResetConcurrencies] = React.useState<boolean>(false)
  const [hasConcurrencies, setHasConcurrencies] = React.useState<boolean>(false)
  const [dateRanges, setDateRanges] = React.useState<DateRange[]>([])

  // DS
  const handleNetworkDsCreated = React.useCallback((ds: DataSource) => {
    setNetworkDS(ds)
  }, [setNetworkDS])

  const handleEventDsCreated = React.useCallback((ds: DataSource) => {
    setEventDS(ds)
  }, [setEventDS])

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

  // Set defaults
  React.useEffect(() => {
    const hasValidSelectedEvent = isDefined(selectedEvent) && lrsLayers.some((item) => item.name === selectedEvent.name)

    if (hasValidSelectedEvent) {
      const networkLayer = lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === selectedEvent.eventInfo.parentNetworkId)
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
      } else {
        setSelectedNetwork(null)
      }
    } else {
      const defaultEventLayer = lrsLayers.find(item => item.name === defaultEvent.name)
      setSelectedEvent(Immutable(defaultEventLayer))
    }
  }, [defaultEvent, lrsLayers, selectedEvent])

  React.useEffect(() => {
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
        const eventLayer = lrsLayers.find((item) => item.eventInfo.parentNetworkId === lrsLayer?.networkInfo.lrsNetworkId)
        if (isDefined(eventLayer)) {
          handleEventChanged(eventLayer.name)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDataSourceFromDataAction])

  React.useEffect(() => {
    setRevalidateRouteFromDataAction(isDefined(routeInfoFromDataAction))
  }, [routeInfoFromDataAction])

  React.useEffect(() => {
    buildLockInfo(LockAction.None)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, selectedEvent, selectedNetwork])

  const buildLockInfo = React.useCallback((action: LockAction = LockAction.None, routeInfo?: RouteInfo) => {
    if (conflictPreventionEnabled) {
      const updatedLockInfo = { ...lockInfo }
      if (isDefined(selectedNetwork) &&
        isDefined(selectedEvent) &&
        isDefined(routeInfo)) {
          updatedLockInfo.networkId = [selectedNetwork.networkInfo.lrsNetworkId]
          updatedLockInfo.eventServiceLayerIds = [selectedEvent.serviceId]
          updatedLockInfo.routeInfo = routeInfo
          updatedLockInfo.routeOrLineId = []
          updatedLockInfo.lockAction = action
          setLockInfo(updatedLockInfo)
      } else if (action !== LockAction.None) {
        updatedLockInfo.lockAction = action
        setLockInfo(updatedLockInfo)
      }
    }
  }, [conflictPreventionEnabled, lockInfo, selectedEvent, selectedNetwork])

  // Event changed
  const handleEventChanged = React.useCallback((value: string) => {
    const eventLayer = lrsLayers.find(item => item.name === value)
    if (eventLayer) {
      const networkLayer = lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === eventLayer.eventInfo.parentNetworkId)
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
      }
      setResetSelectedField(true)
      setSelectedEvent(Immutable(eventLayer))
    }
  }, [lrsLayers])

  // Event picker changed
  const handleNetworkChanged = React.useCallback((value: string) => {
    const networkLayer = lrsLayers.find(layer => layer.name === value)
    if (isDefined(networkLayer)) {
      setSelectedNetwork(Immutable(networkLayer))
    }
  }, [lrsLayers])

  // Method picker changed
  const handleMethodChanged = React.useCallback((value: SearchMethod) => {
    setSelectedMethod(value)
  }, [])

  // Open concurrencies section
  const handleNextConcurrencies = React.useCallback(async (routeInfo, networkDS, network, addToDominantRouteIsChecked) => {
    setRouteInfo(routeInfo)
    setResetSelectedField(false)
    setResetConcurrencies(false)

    if (addToDominantRouteIsChecked) {
      // Check for concurrencies
      const info: LrsAttributesInfo = {
        routeId: routeInfo.routeId,
        fromMeasure: routeInfo.selectedMeasure,
        toMeasure: routeInfo.selectedMeasure
      }
      const fromDate: Date = routeInfo.selectedFromDate
      const toDate: Date = !isDefined(routeInfo.selectedToDate) ? new Date(253402300799999) : routeInfo.selectedToDate
      const response:ConcurrenciesResponse = await QueryRouteConcurrencies(networkDS, network, fromDate, toDate, [info])

      const dates: Date[] = []

      let addSelectedFromDate: boolean = true
      let addSelectedToDate: boolean = true
      const routeIds:string[] = []

      response?.locations.forEach((location) => {
        if (!routeIds.includes(location.routeId)) {
          routeIds.push(location.routeId)
        }
        location.concurrencies.forEach((concurrency) => {
          if (!routeIds.includes(concurrency.routeId)) {
            routeIds.push(concurrency.routeId)
          }
          concurrency.isChosen = concurrency.isDominant
          concurrency.isAdded = false

          if (isDefined(concurrency.fromDate) && !dates.includes(concurrency.fromDate)) {
            if (!isDefined(routeInfo.selectedFromDate) || concurrency.fromDate >= routeInfo.selectedFromDate) {
              dates.push(concurrency.fromDate)
            }

            if (isDefined(routeInfo.selectedFromDate) && concurrency.fromDate === routeInfo.selectedFromDate.getTime()) {
              addSelectedFromDate = false
            }
          }
          if (isDefined(concurrency.toDate) && !dates.includes(concurrency.toDate)) {
            if (!isDefined(routeInfo.selectedToDate) || concurrency.toDate <= routeInfo.selectedToDate) {
              dates.push(concurrency.toDate)
            }

            if (isDefined(routeInfo.selectedToDate) && concurrency.toDate === routeInfo.selectedToDate.getTime()) {
              addSelectedToDate = false
            }
          }
        })
      })

      if (addSelectedFromDate && isDefined(routeInfo.selectedFromDate) && !dates.includes(routeInfo.selectedFromDate)) {
        const date = new Date(routeInfo.selectedFromDate.getFullYear(), routeInfo.selectedFromDate.getMonth(), routeInfo.selectedFromDate.getDate())
        dates.push(date)
      }

      if (addSelectedToDate && isDefined(routeInfo.selectedToDate) && !dates.includes(routeInfo.selectedToDate)) {
        const date = new Date(routeInfo.selectedToDate.getFullYear(), routeInfo.selectedToDate.getMonth(), routeInfo.selectedToDate.getDate())
        dates.push(date)
      }

      dates.sort((a, b) => Number(a) - Number(b))

      if (!isDefined(routeInfo.selectedToDate)) {
        dates.push(null)
      }

      const dateRanges: DateRange[] = []
      for (let i = 0; i < dates.length - 1; i++) {
        const dateRange: DateRange = {
          fromDate: dates[i],
          toDate: dates[i + 1]
        }
        dateRanges.push(dateRange)
      }
      setDateRanges(dateRanges)

      const routeIdToNameAndLineId = new Map<string, RouteMapInfo>()

      if (routeIds.length > 0 && (network?.useRouteName || network?.supportsLines)) {
        const isValid = getRoutesByRouteIds(routeIds, network, networkDS)
        await Promise.all([isValid]).then((results) => {
          const queryResults = results?.[0]
          if (isDefined(queryResults)) {
            queryResults.features.forEach((feature) => {
              const routeMapInfo: RouteMapInfo = {}

              if (network?.useRouteName) {
                routeMapInfo.routeName = feature.attributes[network.routeNameFieldSchema.jimuName]
              }
              if (network?.supportsLines) {
                routeMapInfo.lineId = feature.attributes[network.lineIdFieldSchema.jimuName]
              }

              const routeId: string = feature.attributes[network.routeIdFieldSchema.jimuName]
              if (!routeIdToNameAndLineId.has(routeId)) {
                routeIdToNameAndLineId.set(routeId, routeMapInfo)
              }
            })
          }
        })
      }

      const newResponse: ConcurrenciesResponse = { locations: [] }

      newResponse.locations.push({
        routeId: response?.locations[0].routeId,
        fromMeasure: response?.locations[0].fromMeasure,
        toMeasure: response?.locations[0].toMeasure,
        concurrencies: []
      })

      dateRanges.forEach((dateRange) => {
        response?.locations.forEach((location, locationIndex) => {
          let hasSelectedDateRangeConcurrencies: boolean = false
          location.concurrencies.sort((a, b) => a.fromMeasure - b.fromMeasure)

          location.concurrencies.forEach((concurrency) => {
            if ((!isDefined(concurrency.fromDate) || (isDefined(dateRange.fromDate) && concurrency.fromDate <= dateRange.fromDate)) &&
            (!isDefined(concurrency.toDate) || (isDefined(dateRange.toDate) && dateRange.toDate <= concurrency.toDate))) {
                const newConcurrency: Concurrency = {
                  routeId: concurrency.routeId,
                  fromMeasure: round(concurrency.fromMeasure, network.measurePrecision),
                  toMeasure: round(concurrency.toMeasure, network.measurePrecision),
                  fromDate: dateRange.fromDate,
                  toDate: dateRange.toDate,
                  sectionId: concurrency.sectionId,
                  isDominant: concurrency.isDominant,
                  isChosen: concurrency.isDominant,
                  isAdded: false
                }
                newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
                hasSelectedDateRangeConcurrencies = true
            }
          })

          // measure for the selected route and date range that have no concurrencies
          if (!hasSelectedDateRangeConcurrencies) {
            const newConcurrency: Concurrency = {
              routeId: location.routeId,
              fromMeasure: location.fromMeasure,
              toMeasure: location.toMeasure,
              fromDate: dateRange.fromDate,
              toDate: dateRange.toDate,
              sectionId: -Number.MAX_VALUE,
              isDominant: true,
              isChosen: true,
              isAdded: true
            }
            newResponse.locations[locationIndex].concurrencies.push(newConcurrency)
          }
        })
      })

      if (routeIdToNameAndLineId.size > 0) {
        newResponse?.locations.forEach((location) => {
          const routeMapInfo: RouteMapInfo = routeIdToNameAndLineId.get(location.routeId)
          location.routeName = routeMapInfo.routeName
          location.lineId = routeMapInfo.lineId

          location.concurrencies.forEach((concurrency) => {
            const routeMapInfo: RouteMapInfo = routeIdToNameAndLineId.get(concurrency.routeId)
            concurrency.routeName = routeMapInfo.routeName
            concurrency.lineId = routeMapInfo.lineId
          })
        })
      }

      setConcurrenciesResponse(newResponse)

      if (response.locations.length > 0 && response.locations[0].concurrencies.length > 0 && !notAllowOverrideEventReplacement)
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

  // Open attributes section
  const handleNextAttributes = React.useCallback((routeInfo) => {
    setRouteInfo(routeInfo)
    setResetSelectedField(false)
    setResetConcurrencies(false)
    setSection(2)
  }, [])

  const handleReset = React.useCallback(() => {
    const routeInfo = getInitialRouteInfoState()
    setRouteInfo(routeInfo)
    buildLockInfo(LockAction.Clear, routeInfo)
    setRevalidateRouteFromDataAction(false)
    setAddToDominantRoute(enableAddToDominantRouteOption)
    setReset(true)
    setResetConcurrencies(true)
    setTimeout(() => {
      setReset(false)
      setResetConcurrencies(false)
    }, 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildLockInfo])

  // Back to route selection.
  const handleNavBackMain = React.useCallback((reset: boolean) => {
    if (reset) {
      onClearGraphic()
      handleReset()
    }
    setSection(0)
    if (containerWrapperRef.current) {
      focusElementInKeyboardMode(containerWrapperRef.current)
    }
  }, [handleReset, onClearGraphic])

  // Back to concurrencies.
  const handleNavBackConcurrencies = React.useCallback((reset: boolean, concurrenciesFound: boolean, addToDominantRouteIsChecked: boolean) => {
    if (reset) {
      onClearGraphic()
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
  }, [handleReset, onClearGraphic])

  const handleResetClicked = React.useCallback((reset: boolean) => {
    if (reset) {
      setResetConcurrencies(reset)
      setTimeout(() => {
        setResetConcurrencies(false)
      }, 800)
    }
  }, [])

  const handleRouteInfoUpdate = React.useCallback((routeInfo: RouteInfo) => {
    setRouteInfo(routeInfo)
    buildLockInfo(LockAction.QueryAndAcquire, routeInfo)
  }, [buildLockInfo])

  const isReady = React.useMemo(() => {
    if (isDSReady && isDefined(JimuMapView?.view)) {
      return true
    }
    return false
  }, [JimuMapView?.view, isDSReady])

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

  const submitForm = React.useCallback(() => {
    methodRef.current?.handleNextClicked()
  }, [])

  const handleValidationChanged = React.useCallback((isValid: boolean) => {
    setIsValidInput(isValid)
  }, [])

  const handleAddToDominantRouteUpdate = React.useCallback((checked: boolean) => {
    setAddToDominantRoute(checked)
  }, [])

  const handleConcurrenciesResponseUpdated = React.useCallback((response: ConcurrenciesResponse) => {
    setConcurrenciesResponse(response)
  }, [])

  return (
    <div className="add-single-point-event h-100 d-flex" ref={containerWrapperRef} tabIndex={-1} css={getFormStyle()}>
      <DataSourceManager
        network={selectedNetwork}
        event={selectedEvent}
        dataSourcesReady={handleDataSourcesReady}
        onCreateNetworkDs={handleNetworkDsCreated }
        onCreateEventDs={handleEventDsCreated}
      />
      {!hideTitle && <AddPointEventFormHeader/>}
      <div className={classNames('add-single-point-event__content', {
        'd-none': section !== 0,
        [FOCUSABLE_CONTAINER_CLASS]: section === 0
      })}>
        {conflictPreventionEnabled && (
          <LockManagerComponent
            intl={intl}
            featureDS={networkDS as FeatureLayerDataSource}
            showAlert={true}
            lockInfo={lockInfo}
            networkName={selectedNetwork?.networkInfo?.datasetName}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onQueryAndAcquireComplete={handleQueryLocksCompleted}
            onMessageClear={handleMessageClear}
          />
        )}
        {!hideType && (
          <AddPointEventOperationType
            operationType={operationType}
            onOperationTypeChanged={onOperationTypeChanged}
          />
        )}
        {!hideEvent && (
          <div>
            <Label size='sm' className='mb-0 pt-3 px-3 w-100 title3' >
              {getI18nMessage('eventLayerLabel')}
            </Label>
            <Select
              aria-label={getI18nMessage('eventLayerLabel')}
              className='w-100 px-3'
              size='sm'
              value={selectedEvent ? selectedEvent.name : ''}
              disabled={eventLayers.length === 1}
              onChange={evt => { handleEventChanged(evt.target.value) }}>
              {eventLayers.map((element, index) => {
                return (
                  <Option key={index} value={element}>{element}</Option>
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
            label={getI18nMessage('methodLabel')}
            isDisabled={true}
            defaultItem={selectedMethod}
            listItems={[SearchMethod.Measure]}
            altItemDescriptions={[getI18nMessage('routeAndMeasure')]}
            onSelectionChanged={handleMethodChanged}
          />
        )}
        <AddPointEventRouteSelectionForm
          ref={methodRef}
          intl={intl}
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          routeInfoFromDataAction={routeInfoFromDataAction}
          isReady={isReady}
          networkDS={networkDS}
          method={selectedMethod}
          reset={reset}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedGraphic}
          flashGraphic={flashGraphic}
          lockAquired={lockAquired}
          hideDates={hideDates}
          useRouteStartEndDate={useRouteStartEndDate}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onResetDataAction={onResetDataAction}
          onsubmit={handleNextConcurrencies}
          onRouteInfoUpdate={handleRouteInfoUpdate}
          onValidationChanged={handleValidationChanged}
          addToDominantRoute={addToDominantRoute}
        />
      {!hideAddToDominantRouteOption && (
        <AddToDominantRouteForm
          addToDominantRoute={addToDominantRoute}
          onUpdateAddToDominantRoute={handleAddToDominantRouteUpdate}
        />
      )}
    </div>
    <div className={classNames('add-point-footer w-100', {
      'd-none': section !== 0,
      [FOCUSABLE_CONTAINER_CLASS]: section === 0
    })}>
      <Label
        size='sm'
        className=' mt-auto mr-auto title3'
        centric
        style={{ color: getTheme()?.sys.color.primary.main }}
        onClick={handleReset}
      >
        {getI18nMessage('resetForm')}
      </Label>
      <div className='mt-auto ml-auto'>
        <Button
          type='primary'
          className='active'
          aria-label={getI18nMessage('nextLabel')}
          size='sm'
          disabled={!isValidInput}
          onClick={submitForm}
        >
            {getI18nMessage('nextLabel')}
        </Button>
      </div>
    </div>

    <div className={classNames('add-single-point-event__content', {
      'd-none': section !== 1,
      [FOCUSABLE_CONTAINER_CLASS]: section === 1
    })}>
        <AddPointEventConcurrencies
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
        />
      </div>

    <div className={classNames('add-single-point-event__content', {
      'd-none': section !== 2,
      [FOCUSABLE_CONTAINER_CLASS]: section === 2
    })}>
        <AddPointEventAttributes
          intl={intl}
          widgetId={widgetId}
          networkDS={networkDS}
          network={selectedNetwork}
          eventDS={eventDS}
          eventLayer={selectedEvent}
          routeInfo={routeInfo}
          reset={reset || resetSelectedField}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          conflictPreventionEnabled={conflictPreventionEnabled}
          onNavBack={handleNavBackConcurrencies}
          hasConcurrencies={hasConcurrencies}
          addToDominantRoute={addToDominantRoute}
          concurrenciesResponse={concurrenciesResponse}
        />
      </div>
  </div>
  )
}
