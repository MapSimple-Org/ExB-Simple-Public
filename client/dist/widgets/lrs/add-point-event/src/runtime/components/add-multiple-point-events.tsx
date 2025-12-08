/** @jsx jsx */
import {
  React,
  jsx,
  type ImmutableArray,
  classNames,
  css,
  type ImmutableObject,
  type DataSource,
  hooks,
  Immutable,
  type IntlShape,
  focusElementInKeyboardMode,
  type FeatureLayerDataSource
} from 'jimu-core'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import type { DefaultInfo, OperationType } from '../../config'
import { AddPointEventFormHeader } from './add-point-event-form-header'
import { Button, FOCUSABLE_CONTAINER_CLASS, Label } from 'jimu-ui'
import { DataSourceManager } from '../data-source/data-source-manager'
import { AddPointEventRouteSelectionForm } from './add-point-event-route-selection-form'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { AddMultiplePointEventsAttributes } from './add-multiple-point-events-attributes'
import { AddPointEventConcurrencies } from './add-point-event-concurrencies'
import { AddToDominantRouteForm } from './add-to-dominant-route-form'
import { AttributeSetDataSourceManager } from '../data-source/attribute-set-data-source-manager'
import {
  type AttributeSet,
  type AttributeSets,
  type LrsLayer,
  LrsLayerType,
  type RouteInfo,
  SearchMethod,
  InlineEditableDropdown,
  isDefined,
  type LrsLocksInfo,
  getIntialLocksInfo,
  LockAction,
  LockManagerComponent,
  getInitialRouteInfoState,
  waitTime,
  type ConcurrenciesResponse,
  QueryRouteConcurrencies,
  type Concurrency,
  getRoutesByRouteIds,
  type RouteMapInfo,
  type LrsAttributesInfo,
  type DateRange
} from 'widgets/shared-code/lrs'
import { AddPointEventOperationType } from './add-point-operation-type'
import { round } from 'lodash-es'
import { getTheme } from 'jimu-theme'

export interface AddMultiplePointEventsProps {
  intl: IntlShape
  widgetId: string
  lrsLayers: ImmutableArray<LrsLayer>
  jimuMapView: JimuMapView
  operationType: OperationType
  networkLayers: ImmutableArray<string>
  defaultNetwork: DefaultInfo
  defaultMethod: SearchMethod
  defaultAttributeSet: string
  attributeSets: ImmutableObject<AttributeSets>
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  conflictPreventionEnabled: boolean
  hideNetwork: boolean
  hideMethod: boolean
  hideType: boolean
  hideAttributeSet: boolean
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

    &.wrapped .add-multiple-point-event-form {
      height: 100%;
    }
    .add-multiple-point-event__content {
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

// Todo: implement in later user story.
export function AddMultiplePointEvents (props: AddMultiplePointEventsProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    widgetId,
    lrsLayers,
    jimuMapView,
    operationType,
    networkLayers,
    defaultNetwork,
    defaultMethod,
    defaultAttributeSet,
    attributeSets,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    conflictPreventionEnabled,
    hideNetwork,
    hideMethod,
    hideType,
    hideAttributeSet,
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
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [selectedAttributeSetLayers, setSelectedAttributeSetLayers] = React.useState<ImmutableArray<LrsLayer>>(null)
  const [isNetworkDSReady, setNetworkIsDSReady] = React.useState<boolean>(false)
  const [isAttributeSetsDSReady, setAttributeSetsIsDSReady] = React.useState<boolean>(false)
  const [selectedMethod, setSelectedMethod] = React.useState(defaultMethod)
  const [selectedAttributeSetName, setSelectedAttributeSetName] = React.useState<string>(defaultAttributeSet)
  const [selectedAttributeSet, setSelectedAttributeSet] = React.useState<AttributeSet>(null)
  const [reset, setReset] = React.useState<boolean>(false)
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(null)
  const [revalidateRouteFromDataAction, setRevalidateRouteFromDataAction] = React.useState<boolean>(false)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const containerWrapperRef = React.useRef<HTMLDivElement>(null)
  const [isValidInput, setIsValidInput] = React.useState<boolean>(true)
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

  const handleNetworkDataSourcesReady = React.useCallback(() => {
    setNetworkIsDSReady(true)
  }, [setNetworkIsDSReady])

  const handleAttributeSetDataSourcesReady = React.useCallback(() => {
    setAttributeSetsIsDSReady(true)
  }, [setAttributeSetsIsDSReady])

  const handleNetworkChanged = React.useCallback((value: string) => {
    const networkLayer = lrsLayers.find(layer => layer.name === value)
    if (isDefined(networkLayer)) {
      setSelectedNetwork(Immutable(networkLayer))
    }
  }, [lrsLayers])

  React.useEffect(() => {
    setSection(0)
    setReset(true)
    waitTime(800).then(() => {
      setReset(false)
    })
  }, [lrsLayers])

  React.useEffect(() => {
    focusElementInKeyboardMode(containerWrapperRef.current)
  }, [])

  React.useEffect(() => {
    setRevalidateRouteFromDataAction(isDefined(routeInfoFromDataAction))
  }, [routeInfoFromDataAction])

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
        const networkName = lrsLayer.name
        handleNetworkChanged(networkName)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDataSourceFromDataAction])

  React.useEffect(() => {
    setRevalidateRouteFromDataAction(isDefined(routeInfoFromDataAction))
  }, [routeInfoFromDataAction])

  React.useEffect(() => {
    if (!isDefined(selectedNetwork)) {
      if (isDefined(defaultNetwork)) {
        const networkLayer = lrsLayers.find(
          (item) => item.name === defaultNetwork.name
        )
        if (networkLayer) {
          setSelectedNetwork(Immutable(networkLayer))
        } else {
          setSelectedNetwork(null)
        }
      } else {
        const networkLayer = lrsLayers.find(layer => layer.layerType === LrsLayerType.Network)
        if (networkLayer) {
          setSelectedNetwork(Immutable(networkLayer))
        } else {
          setSelectedNetwork(null)
        }
      }
    }
    if (!isDefined(selectedAttributeSet)) {
      const attributeSet = attributeSets.attributeSet.find(set => set.title === selectedAttributeSetName)
      if (attributeSet) {
        setSelectedAttributeSet(attributeSet)
      } else if (attributeSets.attributeSet.length === 1) {
        setSelectedAttributeSet(attributeSets.attributeSet[0].asMutable({deep: true}))
        setSelectedAttributeSetName(attributeSets.attributeSet[0].title)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsLayers, defaultNetwork])

  React.useEffect(() => {
    if (conflictPreventionEnabled) {
      buildLockInfo()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, selectedAttributeSet, selectedNetwork])

  const buildLockInfo = React.useCallback((action: LockAction = LockAction.None, routeInfo?: RouteInfo) => {
    const updatedLockInfo = { ...lockInfo }
    if (isDefined(selectedNetwork)) {
      updatedLockInfo.networkId = [selectedNetwork.networkInfo.lrsNetworkId]
    }
    if (isDefined(selectedAttributeSet)) {
      const eventIds = selectedAttributeSet.layers.map(layer => layer.layerId)
      updatedLockInfo.eventServiceLayerIds = eventIds
    }
    if (isDefined(routeInfo)) {
      updatedLockInfo.routeInfo = routeInfo
      updatedLockInfo.routeOrLineId = []
    }
    updatedLockInfo.lockAction = action
    setLockInfo(updatedLockInfo)
  }, [selectedNetwork, selectedAttributeSet, lockInfo])

  React.useEffect(() => {
    if (isDefined(selectedAttributeSet) && isDefined(selectedNetwork)) {
      const events: LrsLayer[] = []
      selectedAttributeSet.layers.forEach((layer) => {
        const lrsEvent = lrsLayers.find(item => item.serviceId === layer.layerId)
        if (lrsEvent && selectedNetwork.networkInfo.lrsNetworkId === lrsEvent.eventInfo.parentNetworkId) {
          events.push(lrsEvent)
        }
      })
      setSelectedAttributeSetLayers(Immutable(events))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAttributeSet, selectedNetwork])

  const handleAttributeSetChanged = React.useCallback((value: string) => {
    const attributeSet = attributeSets.attributeSet.find(set => set.title === value)
    if (attributeSet) {
      setSelectedAttributeSet(attributeSet)
    }
    setSelectedAttributeSetName(value)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMethodChanged = React.useCallback((value: SearchMethod) => {
    setSelectedMethod(value)
  }, [])

  const isReady = React.useMemo(() => {
    if (isNetworkDSReady && isAttributeSetsDSReady && isDefined(jimuMapView) && isDefined(jimuMapView?.view) && jimuMapView?.view.ready) {
      return true
    }
    return false
  }, [isNetworkDSReady, isAttributeSetsDSReady, jimuMapView])

  // Open attributes section
  const handleNextAttributes = React.useCallback((routeInfo) => {
    setRouteInfo(routeInfo)
    setResetConcurrencies(false)
    setSection(2)
  }, [])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = React.useCallback(() => {
    const routeInfo = getInitialRouteInfoState()
    setRouteInfo(routeInfo)
    buildLockInfo(LockAction.Clear, routeInfo)
    setReset(true)
    setTimeout(() => {
      setReset(false)
    }, 800)
  }, [buildLockInfo])

  const getAttributeItems = (): string[] => {
    const attributeItemNames: string[] = []
    attributeSets.attributeSet.forEach((item) => {
      attributeItemNames.push(item.title)
    })
    return attributeItemNames
  }

  const handleRouteInfoUpdate = React.useCallback((routeInfo: RouteInfo) => {
    setRouteInfo(routeInfo)
    buildLockInfo(LockAction.Release, routeInfo)
  }, [buildLockInfo])

  const handleQueryLocksCompleted = React.useCallback((lockInfo: LrsLocksInfo, success: boolean) => {
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

  const handleResetClicked = React.useCallback((reset: boolean) => {
    if (reset) {
      setResetConcurrencies(reset)
      setTimeout(() => {
        setResetConcurrencies(false)
      }, 800)
    }
  }, [])

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

  // Open concurrencies section
  const handleNextConcurrencies = React.useCallback(async (routeInfo, networkDS, network, addToDominantRouteIsChecked) => {
    setRouteInfo(routeInfo)
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

  return (
   <div className="add-multiple-point-event h-100 d-flex" ref={containerWrapperRef} tabIndex={-1} css={getFormStyle()}>
      <DataSourceManager
        network={selectedNetwork}
        dataSourcesReady={handleNetworkDataSourcesReady}
        onCreateNetworkDs={handleNetworkDsCreated }
      />
      <AttributeSetDataSourceManager
        events={selectedAttributeSetLayers}
        dataSourcesReady={handleAttributeSetDataSourcesReady}
      />
      {!hideTitle && <AddPointEventFormHeader/>}
      <div className={classNames('add-multiple-point-event__content', {
        'd-none': section !== 0,
        [FOCUSABLE_CONTAINER_CLASS]: section === 0
      })}>
        {conflictPreventionEnabled && (
          <LockManagerComponent
            intl={intl}
            showAlert={false}
            featureDS={networkDS as FeatureLayerDataSource}
            lockInfo={lockInfo}
            networkName={selectedNetwork?.networkInfo?.datasetName}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onQueryAndReleaseComplete={handleQueryLocksCompleted}
            onMessageClear={handleMessageClear}
          />
        )}
        {!hideType && (
          <AddPointEventOperationType
            operationType={operationType}
            onOperationTypeChanged={onOperationTypeChanged}
          />
        )}
        {!hideNetwork && (
          <InlineEditableDropdown
            label={getI18nMessage('networkLabel')}
            isDisabled={networkLayers.length === 1}
            defaultItem={isDefined(selectedNetwork) ? selectedNetwork.name : ''}
            listItems={networkLayers}
            onSelectionChanged={handleNetworkChanged}
          />
        )}
        {!hideAttributeSet && (
          <InlineEditableDropdown
            label={getI18nMessage('attributeSetLabel')}
            isDisabled={attributeSets.attributeSet.length === 1}
            defaultItem={selectedAttributeSetName}
            listItems={getAttributeItems()}
            onSelectionChanged={handleAttributeSetChanged}
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
          jimuMapView={jimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedGraphic}
          flashGraphic={flashGraphic}
          lockAquired={true}
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
      <div className='add-point-footer__action w-100 d-flex'>
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
            className='active'
            type='primary'
            aria-label={getI18nMessage('nextLabel')}
            size='sm'
            disabled={!isValidInput}
            onClick={submitForm}
          >
              {getI18nMessage('nextLabel')}
          </Button>
        </div>
      </div>
    </div>

    <div className={classNames('add-multiple-point-event__content', {
      'd-none': section !== 1,
      [FOCUSABLE_CONTAINER_CLASS]: section === 1
    })}>
        <AddPointEventConcurrencies
          intl={intl}
          networkDS={networkDS}
          network={selectedNetwork}
          routeInfo={routeInfo}
          reset={reset || resetConcurrencies}
          conflictPreventionEnabled={false}
          onNavBack={handleNavBackMain}
          onNavNext={handleNextAttributes}
          concurrenciesResponse={concurrenciesResponse}
          onConcurrenciesResponseUpdated={handleConcurrenciesResponseUpdated}
          onResetClicked={handleResetClicked}
          dateRanges={dateRanges}
        />
      </div>

    <div className={classNames('add-multiple-point-event__content', {
      'd-none': section !== 2,
      [FOCUSABLE_CONTAINER_CLASS]: section === 2
    })}>
        <AddMultiplePointEventsAttributes
          intl={intl}
          widgetId={widgetId}
          networkDS={networkDS}
          network={selectedNetwork}
          eventLayers={selectedAttributeSetLayers}
          attributeSet={selectedAttributeSet}
          routeInfo={routeInfo}
          reset={reset}
          isReady={isReady}
          jimuMapView={jimuMapView}
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
