/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  type ImmutableArray,
  css,
  type ImmutableObject,
  Immutable,
  type DataSource,
  type IntlShape,
  type FeatureLayerDataSource
} from 'jimu-core'
import {
  InlineEditableDropdown,
  LrsLayerType,
  type RouteInfo,
  isDefined,
  formatMessage,
  type LrsLayer,
  type DefaultInfo,
  LockAction,
  getIntialLocksInfo,
  type LrsLocksInfo,
  LockManagerComponent,
  type AcquireLockResponse,
  getInitialRouteInfoState,
  waitTime
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import { Alert, Button, Label, Option, Select, Tooltip } from 'jimu-ui'
import { SplitEventFormHeader } from './split-event-form-header'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import { SplitEventAttributes } from './split-event-attributes'
import { DataSourceManager } from '../data-source/data-source-manager'
import { SplitEventRouteSelectionForm } from './split-event-route-selection-form'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import { getTheme } from 'jimu-theme'

export interface SplitEventProps {
  widgetId: string
  hideTitle: boolean
  lrsLayers: ImmutableArray<LrsLayer>
  eventLayers: ImmutableArray<string>
  networkLayers: ImmutableArray<string>
  defaultEvent: DefaultInfo
  JimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  conflictPreventionEnabled: boolean
  onClearGraphic: () => void
  hideEvent: boolean
  hideNetwork: boolean
  hideDate: boolean
  useRouteStartDate: boolean
  intl: IntlShape
  selectedEventLyr: ImmutableObject<LrsLayer>
  selectedEventObjectId: number
  selectedEventRouteId: string
  selectedEventFromDate: Date
  networkDataSourceFromDataAction: DataSource
  routeInfoFromDataAction: RouteInfo
  onResetDataAction: () => void
  onUpdateNetworkDS: (ds: DataSource) => void
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    &.wrapped .split-event-form {
      height: 100%;
    }

    .split-event__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .split-event__toast-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      height: 100%;
    }
    .split-event__toast {
      position: relative;
      top: 4%;
    }
    .split-event-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function SplitEvent (props: SplitEventProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    widgetId,
    hideTitle,
    lrsLayers,
    eventLayers,
    networkLayers,
    defaultEvent,
    JimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    conflictPreventionEnabled,
    onClearGraphic,
    hideEvent,
    hideNetwork,
    hideDate,
    useRouteStartDate,
    intl,
    selectedEventLyr,
    selectedEventObjectId,
    routeInfoFromDataAction,
    onUpdateNetworkDS,
    onResetDataAction
  } = props
  const [networkDS, setNetworkDS] = React.useState<DataSource>(null)
  const [eventDS, setEventDS] = React.useState<DataSource>(null)
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [selectedEvent, setSelectedEvent] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [isDSReady, setIsDSReady] = React.useState<boolean>(false)
  const [reset, setReset] = React.useState<boolean>(false)
  const [routeInfo, setRouteInfo] = React.useState<RouteInfo>(null)
  const [eventOid, setEventOid] = React.useState<string>(getI18nMessage('chooseEventLocationFromMap'))
  const [toastOpen, setToastOpen] = React.useState<boolean>(false)
  const [toastMsgType, setToastMsgType] = React.useState<AlertType>()
  const [toastMsg, setToastMsg] = React.useState<string>('')
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const [lockAquired, setLockAquired] = React.useState<boolean>(!conflictPreventionEnabled)
  const [isValidInput, setIsValidInput] = React.useState<boolean>(true)
  const [revalidateRouteFromDataAction, setRevalidateRouteFromDataAction] = React.useState<boolean>(false)
  const attributesRef = React.useRef(null)

  React.useEffect(() => {
    setReset(true)
    waitTime(800).then(() => {
      setReset(false)
    })
  }, [lrsLayers])

  React.useEffect(() => {
    if (isDefined(selectedEventObjectId)) {
      setSelectedEvent(selectedEventLyr)
      setEventOid(selectedEventObjectId?.toString())
    }
    setRevalidateRouteFromDataAction(isDefined(routeInfoFromDataAction))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfoFromDataAction])

  React.useEffect(() => {
    if (isDefined(selectedEventLyr)) {
      if (selectedEventLyr.id !== selectedEvent?.id) {
        if (isDefined(selectedEventLyr)) {
          handleEventChanged(selectedEventLyr.name)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventLyr])

  // DS
  const handleNetworkDsCreated = React.useCallback((ds: DataSource) => {
    setNetworkDS(ds)
    onUpdateNetworkDS(ds)
  }, [setNetworkDS, onUpdateNetworkDS])

  const handleEventDsCreated = React.useCallback((ds: DataSource) => {
    setEventDS(ds)
  }, [setEventDS])

  const handleDataSourcesReady = React.useCallback(() => {
    setIsDSReady(true)
  }, [setIsDSReady])

  const resetEventOid = React.useCallback(() => {
    setEventOid(getI18nMessage('chooseEventLocationFromMap'))
  }, [getI18nMessage])

  // Back to route selection.
  const handleSubmit = React.useCallback(() => {
    onClearGraphic()
    handleReset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = React.useCallback(() => {
    setRouteInfo(getInitialRouteInfoState())
    buildLockInfo(LockAction.Clear, getInitialRouteInfoState())
    resetEventOid()
    setReset(true)
    setTimeout(() => {
      setReset(false)
    }, 800)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    handleReset()
  }, [defaultEvent, lrsLayers, selectedEvent, handleReset])

  React.useEffect(() => {
    buildLockInfo(LockAction.None)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, selectedEvent, selectedNetwork])

  const buildLockInfo = (action: LockAction = LockAction.None, routeInfo?: RouteInfo) => {
    if (conflictPreventionEnabled) {
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
  }

  // Event changed
  const handleEventChanged = React.useCallback((value: string) => {
    const eventLayer = lrsLayers.find(item => item.name === value)
    if (eventLayer) {
      const networkLayer = lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === eventLayer.eventInfo.parentNetworkId)
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
      }
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

  const isReady = React.useMemo(() => {
    if (isDSReady && isDefined(JimuMapView) && isDefined(JimuMapView?.view)) {
      return true
    }
    return false
  }, [JimuMapView, isDSReady])

  // Update routeInfo state changes.
  const handleRouteInfoUpdate = (newRouteInfo: RouteInfo) => {
    setRouteInfo(newRouteInfo)
    buildLockInfo(LockAction.QueryAndAcquire, newRouteInfo)
  }

  const handleEventOidUpdate = (newEventOid: string) => {
    setEventOid(newEventOid)
  }

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

  const handleValidationChanged = React.useCallback((isValid: boolean) => {
    setIsValidInput(isValid)
  }, [])

  const onSubmitClicked = () => {
    attributesRef.current?.onSubmitClicked()
  }

  return (
    <div className="split-event h-100 d-flex" css={getFormStyle()}>
      {!hideTitle && <SplitEventFormHeader />}
      <div className="split-event__content">
        <DataSourceManager
          network={selectedNetwork}
          event={selectedEvent}
          dataSourcesReady={handleDataSourcesReady}
          onCreateNetworkDs={handleNetworkDsCreated }
          onCreateEventDs={handleEventDsCreated}
        />
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
        {!hideEvent && (
          <div>
            <Label size='sm' className='mb-0 pt-3 px-3 w-100 title3'>
              {formatMessage(intl, 'eventRequiredLabel')}
            </Label>
            <Select
              aria-label={formatMessage(intl, 'eventRequiredLabel')}
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
          <div>
            <InlineEditableDropdown
              label={formatMessage(intl, 'networkRequiredLabel')}
              isDisabled={true}
              defaultItem={isDefined(selectedNetwork) ? selectedNetwork.name : ''}
              listItems={networkLayers}
              onSelectionChanged={handleNetworkChanged}
            />
          </div>
        )}
        <SplitEventRouteSelectionForm
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          isReady={isReady && JimuMapView?.view?.ready}
          reset={reset}
          networkDS={networkDS}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedGraphic}
          flashGraphic={flashGraphic}
          onUpdateRouteInfo={handleRouteInfoUpdate}
          hideDate={hideDate}
          useRouteStartDate={useRouteStartDate}
          intl={intl}
          routeInfoFromDataAction={routeInfoFromDataAction}
          revalidateRouteFromDataAction={revalidateRouteFromDataAction}
          onResetDataAction={onResetDataAction}
          onValidationChanged={handleValidationChanged}
        />
        <Label size='sm' className='mb-0 pt-3 px-3 w-100 title3'>
          {getI18nMessage('eventOidLabel') + ' *'}
        </Label>
        <div className='d-flex w-100 px-3'>
          <Label size="sm" className='d-flex mb-0 w-100 label2' centric style={{ width: 100 }}>
              {eventOid}
          </Label>
        </div>
        {networkDS && eventDS && (
          <SplitEventAttributes
            resetClick={reset}
            ref={attributesRef}
            intl={intl}
            table1Label={getI18nMessage('event1Label')}
            table2Label={getI18nMessage('event2Label')}
            widgetId={widgetId}
            networkDS={networkDS}
            network={selectedNetwork}
            eventDS={eventDS}
            eventLayer={selectedEvent}
            routeInfo={routeInfo}
            onUpdateEventOid={handleEventOidUpdate}
            networkLayer={selectedNetwork}
            flashGraphic={flashGraphic}
            onSubmit={handleSubmit}
            onUpdateToastMsgType={setToastMsgType}
            onUpdateToastMsg={setToastMsg}
            onUpdateToastOpen={setToastOpen}
            selectedEventObjectId={selectedEventObjectId}
            lockAquired={lockAquired}
            conflictPreventionEnabled={conflictPreventionEnabled}
            onValidationChanged={handleValidationChanged}
            revalidateRouteFromDataAction={revalidateRouteFromDataAction}
            routeInfoFromDataAction={routeInfoFromDataAction}
            resetEventOid={resetEventOid}
            currentEventOid={eventOid}
          />
        )}
      </div>
      <div className='split-event-footer w-100'>
        <div className='split-event-footer__action w-100 d-flex'>
          <Label
            size='sm'
            className=' mt-auto mr-auto title3'
            centric
            style={{ color: getTheme()?.sys.color.primary.main }}
            onClick={handleReset}
          >
            Reset
          </Label>
          <Tooltip
            title={getI18nMessage('splitLabel')}>
              <div className='mt-auto ml-auto'>
                <Button
                  type='primary'
                  className='active'
                  aria-label={getI18nMessage('splitLabel')}
                  size='sm'
                  disabled={!isValidInput || (!isDefined(eventOid) || eventOid === getI18nMessage('chooseEventLocationFromMap'))}
                  onClick={onSubmitClicked}
                >
                    {getI18nMessage('splitLabel')}
                </Button>
              </div>
          </Tooltip>
        </div>
      </div>
      {toastOpen && (
        <div className='split-event__toast-container px-3 w-100'>
          <Alert
            className='split-event__toast w-100'
            type={toastMsgType}
            text={toastMsg}
            closable={true}
            withIcon={true}
            open={toastOpen}
            onClose={() => { setToastOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}
