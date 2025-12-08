/** @jsx jsx */
import {
  React,
  jsx,
  type ImmutableArray,
  css,
  type ImmutableObject,
  Immutable,
  type IntlShape,
  type DataSource,
  hooks,
  type FeatureLayerDataSource
} from 'jimu-core'
import {
  getInitialRouteInfoState,
  LrsLayerType,
  type RouteInfo,
  type DefaultInfo,
  isDefined,
  type LrsLayer,
  formatMessage,
  LockAction,
  type AcquireLockResponse,
  type LrsLocksInfo,
  getIntialLocksInfo,
  LockManagerComponent,
  waitTime
} from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import type { DisplayConfig } from '../../config'
import { Label, Select, Alert, Tooltip, Button, Option } from 'jimu-ui'
import { MergeEventsFormHeader } from './merge-events-form-header'
import { MergeEventsAttributes } from './merge-events-attributes'
import { DataSourceManager } from '../data-source/data-source-manager'
import { MergeEventsEventSelectionForm } from './merge-events-event-selection-form'
import { MergeEventsRouteSelectionForm } from './merge-events-route-selection-form'
import type SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import type { AlertType } from 'jimu-ui/lib/components/alert/type'
import defaultMessages from '../translations/default'
import { getTheme } from 'jimu-theme'

export interface MergeEventsProps {
  widgetId: string
  lrsLayers: ImmutableArray<LrsLayer>
  hideTitle: boolean
  eventLayers: ImmutableArray<string>
  networkLayers: ImmutableArray<string>
  instersectionLayers: ImmutableArray<string>
  defaultEvent: DefaultInfo
  JimuMapView: JimuMapView
  hoverGraphic: GraphicsLayer
  pickedGraphic: GraphicsLayer
  flashGraphic: GraphicsLayer
  conflictPreventionEnabled: boolean
  onClearGraphic: () => void
  displayConfig: DisplayConfig
  currentSketchVM: SketchViewModel
  onUpdateSelectedEventLayer: (newEventLayer: ImmutableObject<LrsLayer>) => void
  onUpdateSelectedNetworkLayer: (newEventLayer: ImmutableObject<LrsLayer>) => void
  eventFeatures: any[]
  onEventRemoved: (index: number) => void
  preservedEventIndex: number
  onPreservedEventIndexChanged: (index: number) => void
  onUpdateEventFeatures: (features: any) => void
  routeInfo: RouteInfo
  onUpdateRouteInfo: (info: RouteInfo) => void
  eventDS: DataSource
  eventLayer: ImmutableObject<LrsLayer>
  onUpdateEventDS: (ds: DataSource) => void
  networkDS: DataSource
  onUpdateNetworkDS: (ds: DataSource) => void
  intl: IntlShape
  isEventPickerActive: boolean
  onUpdateIsEventPickerActive: (isActive: boolean) => void
  onUpdateToastMsgType: (type: AlertType) => void
  onUpdateToastMsg: (msg: string) => void
  onUpdateToastOpen: (open: boolean) => void
  toastMsgType: AlertType
  toastMsg: string
  toastOpen: boolean
  onUpdateStopQuery: (stopQuery: boolean) => void
  resetForDataAction: boolean
  onUpdateResetForDataAction: (reset: boolean) => void
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    &.wrapped .merge-events-form {
      height: 100%;
    }

    .merge-events__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .merge-events__toast-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      height: 100%;
    }
    .merge-events__toast {
      position: relative;
      top: 4%;
    }
    .merge-events-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function MergeEvents (props: MergeEventsProps) {
  const {
    widgetId,
    lrsLayers,
    hideTitle,
    eventLayers,
    defaultEvent,
    JimuMapView,
    hoverGraphic,
    pickedGraphic,
    flashGraphic,
    conflictPreventionEnabled,
    onClearGraphic,
    displayConfig,
    currentSketchVM,
    onUpdateSelectedEventLayer,
    onUpdateSelectedNetworkLayer,
    eventFeatures,
    onEventRemoved,
    preservedEventIndex,
    onPreservedEventIndexChanged,
    onUpdateEventFeatures,
    routeInfo,
    onUpdateRouteInfo,
    eventDS,
    eventLayer,
    onUpdateEventDS,
    networkDS,
    onUpdateNetworkDS,
    intl,
    isEventPickerActive,
    onUpdateIsEventPickerActive,
    onUpdateToastMsgType,
    onUpdateToastMsg,
    onUpdateToastOpen,
    onUpdateStopQuery,
    toastMsgType,
    toastMsg,
    toastOpen,
    resetForDataAction,
    onUpdateResetForDataAction
  } = props
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(null)
  const [isDSReady, setIsDSReady] = React.useState<boolean>(false)
  const [reset, setReset] = React.useState<boolean>(false)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>(getIntialLocksInfo())
  const [lockAquired, setLockAquired] = React.useState<boolean>(!conflictPreventionEnabled)
  const [isValidInput, setIsValidInput] = React.useState<boolean>(true)
  const attributesRef = React.useRef(null)
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  // Reset routeInfo when network changes.
  React.useEffect(() => {
    if (isDefined(selectedNetwork)) {
      onUpdateRouteInfo(getInitialRouteInfoState())
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNetwork])

  React.useEffect(() => {
    setReset(true)
    waitTime(800).then(() => {
      setReset(false)
    })
  }, [lrsLayers])

  React.useEffect(() => {
    if (reset) {
      onUpdateRouteInfo(getInitialRouteInfoState())
      if (resetForDataAction) {
        if (eventFeatures.length > 0) {
          onPreservedEventIndexChanged(0)
        }
      } else {
        onUpdateEventFeatures([])
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset])

  const handleDataSourcesReady = React.useCallback(() => {
    setIsDSReady(true)
  }, [setIsDSReady])

  // Set defaults
  React.useEffect(() => {
      const hasValidSelectedEvent = isDefined(eventLayer) && lrsLayers.some((item) => item.name === eventLayer.name)

    if (hasValidSelectedEvent) {
      const networkLayer = lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === eventLayer.eventInfo.parentNetworkId)
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
        onUpdateSelectedNetworkLayer(Immutable(networkLayer))
      } else {
        setSelectedNetwork(null)
      }
    } else {
      const defaultEventLayer = lrsLayers.find(item => item.name === defaultEvent.name)
      onUpdateSelectedEventLayer(Immutable(defaultEventLayer))
    }
  }, [defaultEvent, lrsLayers, eventLayer, onUpdateSelectedEventLayer, onUpdateSelectedNetworkLayer])

  // Query locks when routeInfo changes.
  React.useEffect(() => {
    buildLockInfo(LockAction.QueryAndAcquire, routeInfo)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeInfo])

  // Set Lock Info.
  React.useEffect(() => {
    buildLockInfo(LockAction.None)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, eventLayer, selectedNetwork])

  const buildLockInfo = React.useCallback((action: LockAction = LockAction.None, routeInfo?: RouteInfo) => {
    if (conflictPreventionEnabled) {
      const updatedLockInfo = { ...lockInfo }
      if (isDefined(selectedNetwork)) {
        updatedLockInfo.networkId = [selectedNetwork.networkInfo.lrsNetworkId]
      }
      if (isDefined(eventLayer)) {
        updatedLockInfo.eventServiceLayerIds = [eventLayer.serviceId]
      }
      if (isDefined(routeInfo)) {
        updatedLockInfo.routeInfo = routeInfo
        updatedLockInfo.routeOrLineId = []
      }
      updatedLockInfo.lockAction = action
      setLockInfo(updatedLockInfo)
    }
  }, [conflictPreventionEnabled, eventLayer, lockInfo, selectedNetwork])

  // Event changed
  const handleEventChanged = React.useCallback((value: string) => {
    const eventLayer = lrsLayers.find(item => item.name === value)
    if (eventLayer) {
      const networkLayer = lrsLayers.find(item => isDefined(item.networkInfo) && item.networkInfo.lrsNetworkId === eventLayer.eventInfo.parentNetworkId)
      if (networkLayer && networkLayer.layerType === LrsLayerType.Network) {
        setSelectedNetwork(Immutable(networkLayer))
        onUpdateSelectedNetworkLayer(Immutable(networkLayer))
      }
      onUpdateSelectedEventLayer(Immutable(eventLayer))
    }
  }, [lrsLayers, onUpdateSelectedEventLayer, onUpdateSelectedNetworkLayer])

  // Open attributes section
  const handleNext = React.useCallback((routeInfo) => {
    onUpdateRouteInfo(routeInfo)
  }, [onUpdateRouteInfo])

  const handleReset = React.useCallback(() => {
    onUpdateRouteInfo(getInitialRouteInfoState())
    buildLockInfo(LockAction.Clear, getInitialRouteInfoState())
    setReset(true)
    setTimeout(() => {
      setReset(false)
    }, 800)
  }, [buildLockInfo, onUpdateRouteInfo])

  const onClickReset = React.useCallback(() => {
    handleReset()
    JimuMapView.clearSelectedFeatures()
  }, [JimuMapView, handleReset])

  React.useEffect(() => {
    if (resetForDataAction) {
      onPreservedEventIndexChanged(-1)
      handleReset()
      setTimeout(() => {
        onUpdateResetForDataAction(false)
      }, 100)
    }
  }, [resetForDataAction, handleReset, onUpdateResetForDataAction, onPreservedEventIndexChanged])

  const isReady = React.useMemo(() => {
    if (isDSReady && isDefined(JimuMapView) && isDefined(JimuMapView?.view)) {
      return true
    }
    return false
  }, [JimuMapView, isDSReady])

  // Back to route selection.
  const handleSubmit = React.useCallback(() => {
    onClearGraphic()
    handleReset()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="merge-events h-100 d-flex" css={getFormStyle()}>
      {!hideTitle && <MergeEventsFormHeader />}
      <div className="merge-events__content">
        <DataSourceManager
          network={selectedNetwork}
          event={eventLayer}
          dataSourcesReady={handleDataSourcesReady}
          onCreateNetworkDs={onUpdateNetworkDS}
          onCreateEventDs={onUpdateEventDS}
        />
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
        {!displayConfig.hideEvent && (
          <div>
            <Label size='sm' className='mb-0 pt-3 px-3 w-100 title3' >
              {formatMessage(intl, 'eventRequiredLabel')}
            </Label>
            <Select
              aria-label={formatMessage(intl, 'eventRequiredLabel')}
              className='w-100 px-3'
              size='sm'
              value={eventLayer ? eventLayer.name : ''}
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
        <MergeEventsEventSelectionForm
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          isReady={isReady && JimuMapView?.view?.ready}
          networkDS={networkDS}
          eventDS={eventDS}
          eventLayer={eventLayer}
          reset={reset}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedGraphic}
          flashGraphic={flashGraphic}
          onsubmit={handleNext}
          onReset={handleReset}
          currentSketchVM={currentSketchVM}
          eventFeatures={eventFeatures}
          onEventRemoved={onEventRemoved}
          onPreservedEventIndexChanged={onPreservedEventIndexChanged}
          preservedEventIndex={preservedEventIndex}
          isEventPickerActive={isEventPickerActive}
          onUpdateIsEventPickerActive={onUpdateIsEventPickerActive}/>
        <MergeEventsRouteSelectionForm
          widgetId={widgetId}
          network={selectedNetwork ? selectedNetwork.networkInfo : null}
          isReady={isReady && JimuMapView?.view?.ready}
          networkDS={networkDS}
          reset={reset}
          jimuMapView={JimuMapView}
          hoverGraphic={hoverGraphic}
          pickedGraphic={pickedGraphic}
          flashGraphic={flashGraphic}
          onsubmit={handleNext}
          onReset={handleReset}
          eventLayer={eventLayer}
          eventFeatures={eventFeatures}
          routeInfo={routeInfo}
          onUpdateRouteInfo={onUpdateRouteInfo}
          intl={intl}
          resetForDataAction={resetForDataAction}
        />
        {networkDS && eventDS && (
          <MergeEventsAttributes
            ref={attributesRef}
            widgetId={widgetId}
            network={selectedNetwork}
            jimuMapView={JimuMapView}
            eventDS={eventDS}
            networkDS={networkDS}
            eventLayer={eventLayer}
            networkLayer={selectedNetwork}
            routeInfo={routeInfo}
            reset={reset}
            eventFeatures={eventFeatures}
            preservedEventIndex={preservedEventIndex}
            flashGraphic={flashGraphic}
            onSubmit={handleSubmit}
            onUpdateToastMsgType={onUpdateToastMsgType}
            onUpdateToastMsg={onUpdateToastMsg}
            onUpdateToastOpen={onUpdateToastOpen}
            onUpdateStopQuery={onUpdateStopQuery}
            onValidationChanged={handleValidationChanged}
            intl={intl}
            lockAquired={lockAquired}
            conflictPreventionEnabled={conflictPreventionEnabled}
            toastMsgType={toastMsgType}
          />
        )}
      </div>
      <div className='merge-events-footer w-100'>
        <div className='merge-events-edit-attributes__action w-100 d-flex'>
          <Label
            size='sm'
            className=' mt-auto mr-auto title3'
            centric
            style={{ color: getTheme()?.sys.color.primary.main }}
            onClick={onClickReset}
          >
            Reset
          </Label>
          <Tooltip
            title={getI18nMessage('mergeLabel')}>
              <div className='mt-auto ml-auto'>
                <Button
                  type='primary'
                  className='active'
                  aria-label={getI18nMessage('mergeLabel')}
                  size='sm'
                  disabled={!isValidInput}
                  onClick={onSubmitClicked}
                >
                    {getI18nMessage('mergeLabel')}
                </Button>
              </div>
          </Tooltip>
        </div>
      </div>
      {toastOpen && (
        <div className='merge-events__toast-container px-3 w-100'>
          <Alert
            className='merge-events__toast w-100'
            type={toastMsgType}
            text={toastMsg}
            closable={true}
            withIcon={true}
            open={toastOpen}
            onClose={() => { onUpdateToastOpen(false) }}
          />
        </div>
      )}
    </div>
  )
}
