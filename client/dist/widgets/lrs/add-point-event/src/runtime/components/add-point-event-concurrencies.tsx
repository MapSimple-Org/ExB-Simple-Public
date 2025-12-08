/** @jsx jsx */
import {
  React,
  jsx,
  hooks,
  css,
  type ImmutableObject,
  type DataSource,
  type FeatureLayerDataSource,
  type IntlShape,
} from 'jimu-core'
import {
  PointConcurrencyTable,
  type LrsLayer,
  type RouteInfo,
  isDefined,
  getDateWithTZOffset,
  type LrsLocksInfo,
  LockManagerComponent,
  LockAction,
  type AcquireLockResponse,
  type ConcurrenciesResponse,
  type DateRange,
  type ConcurrenciesLocation
} from 'widgets/shared-code/lrs'

import defaultMessages from '../translations/default'
import { Button, Label, Select } from 'jimu-ui'

export interface AddPointEventConcurrenciesProps {
  intl: IntlShape
  networkDS: DataSource
  network: ImmutableObject<LrsLayer>
  routeInfo: RouteInfo
  reset: boolean
  conflictPreventionEnabled: boolean
  onNavBack: (reset: boolean) => void
  onNavNext: (routeInfo: RouteInfo) => void
  concurrenciesResponse: ConcurrenciesResponse
  onConcurrenciesResponseUpdated: (response: ConcurrenciesResponse) => void
  onResetClicked: (reset: boolean) => void
  eventLayer?: ImmutableObject<LrsLayer>
  dateRanges: DateRange[]
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .add-point-event-edit-attributes__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
    .add-point-event-edit-attributes__toast-container {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.7);
      height: 100%;
    }
    .add-point-event-edit-attributes__toast {
      position: relative;
      top: 4%;
    }
    .add-point-event-edit-attributes__action {
      height: auto;
    }
    .add-point-attributes-footer {
      display: flex;
      height: auto;
      padding: 12px;
    }
  `
}

export function AddPointEventConcurrencies (props: AddPointEventConcurrenciesProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const {
    intl,
    networkDS,
    network,
    routeInfo,
    reset,
    conflictPreventionEnabled,
    onNavBack,
    onNavNext,
    concurrenciesResponse,
    onConcurrenciesResponseUpdated,
    onResetClicked,
    eventLayer,
    dateRanges
  } = props
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange>(null)
  const [lockInfo, setLockInfo] = React.useState<LrsLocksInfo>()

  React.useEffect(() => {
    if (dateRanges?.length > 0) {
      setSelectedDateRange(dateRanges[0])
    }
  }, [dateRanges])

  const navBack = (reset: boolean) => {
    onNavBack(reset)
  }

  const onSubmitClicked = () => {
    if (conflictPreventionEnabled) {

      const updatedLockInfos = { ...lockInfo, lockAction: LockAction.QueryAndAcquire }

      if (isDefined(concurrenciesResponse)) {
        updatedLockInfos.isLine = []
        updatedLockInfos.routeOrLineId = []
        updatedLockInfos.eventServiceLayerIds = []

        concurrenciesResponse?.locations?.forEach((location) => {
          location?.concurrencies?.forEach((concurrency) => {
            if (concurrency.isChosen) {
              updatedLockInfos.isLine.push(network.networkInfo.supportsLines)
              updatedLockInfos.routeOrLineId.push(network.networkInfo.supportsLines ? concurrency.lineId : concurrency.routeId)
              updatedLockInfos.eventServiceLayerIds.push(eventLayer.serviceId)
            }
          })
        })
      }
      setLockInfo(updatedLockInfos)
    } else {
      onNavNext(routeInfo)
    }
  }

  const handleReset = React.useCallback((response:ConcurrenciesResponse) => {
    if (isDefined(response)) {
      response?.locations?.forEach((location) => {
        location.concurrencies?.forEach((concurrency) => {
          concurrency.isChosen = concurrency.isDominant
        })
      })

      onConcurrenciesResponseUpdated(response)
      onResetClicked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDateRangeChange = (event) => {
    const dateRange = event?.target?.value
    setSelectedDateRange(dateRange)
  }

  // Set lock info
  React.useEffect(() => {
    if (conflictPreventionEnabled) {
      const updatedLockInfo = { ...lockInfo }
      if (isDefined(network)) {
        updatedLockInfo.networkId = [network.networkInfo.lrsNetworkId]
      }
      if (isDefined(eventLayer)) {
        updatedLockInfo.eventServiceLayerIds = [eventLayer.serviceId]
      }
      if (isDefined(routeInfo)) {
        updatedLockInfo.routeInfo = routeInfo
        updatedLockInfo.routeOrLineId = []
      }
      setLockInfo(updatedLockInfo)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [networkDS, network, eventLayer, routeInfo])

  const handleConcurrenciesLocationUpdated = (concurrenciesLocation: ConcurrenciesLocation) => {
    for (let i = 0; i < concurrenciesResponse.locations.length; i++) {
      const location:ConcurrenciesLocation = concurrenciesResponse.locations[i]
      if (location.routeId === concurrenciesLocation.routeId && location.fromMeasure === concurrenciesLocation.fromMeasure) {
        concurrenciesResponse.locations[i] = concurrenciesLocation
        break
      }
    }
    onConcurrenciesResponseUpdated(concurrenciesResponse)
  }

  const handleQueryLocksCompleted = (lockInfo: LrsLocksInfo, acquiredInfo: AcquireLockResponse, success: boolean) => {
    setLockInfo(lockInfo)
    if (success) {
      onNavNext(routeInfo)
    }
  }

  const handleMessageClear = () => {
    const updatedLockInfos = { ...lockInfo, lockAction: LockAction.None }
    setLockInfo(updatedLockInfos)
  }

  return (
    <div className='h-100' css={getFormStyle()}>
      <div className='add-point-event-edit-attributes__content'>
        {conflictPreventionEnabled && (
          <LockManagerComponent
              intl={intl}
              featureDS={networkDS as FeatureLayerDataSource}
              lockInfo={lockInfo}
              showAlert={true}
              networkName={network?.networkInfo?.datasetName}
              conflictPreventionEnabled={conflictPreventionEnabled}
              onQueryAndAcquireComplete={handleQueryLocksCompleted}
              onMessageClear={handleMessageClear}
            />
        )}
        <div className="reset px-3">
          <hr
              css={css`
                border: none;
                height: 1px;
                background-color: var(--ref-palette-neutral-400);
              `}
          />
          <div>
            {getI18nMessage('concurrenciesHeaderText')}
          </div>
          <hr
              css={css`
                border: none;
                height: 1px;
                background-color: var(--ref-palette-neutral-400);
              `}
          />
          <div className='ml-auto'>
            <Label
              size='sm'
              className=' mt-auto mr-auto'
              style={{ fontWeight: 500, marginBottom: 0, alignItems: 'center', float: 'right', textAlign: 'right', color: 'var(--sys-color-primary-main)' }}
              onClick={() => { handleReset(concurrenciesResponse) }}
            >
              {getI18nMessage('resetForm')}
            </Label>
          </div>
        </div>
        <div className='h-100'>
          <div className="time-range px-3">
            <div>
              <Label size="sm" centric className="text-truncate mb-0 pt-2 w-100" style={{ textOverflow: 'ellipsis', fontWeight: 500 }}>
                {getI18nMessage('dateRange')}
              </Label>
            </div>
            <div>
              {/*// @ts-expect-error */}
              <Select size='sm' value={selectedDateRange} onChange={(event) => { handleDateRangeChange(event) }} disabled={dateRanges?.length < 2}>
                {dateRanges?.map((info: any, i) =>
                //@ts-expect-error
                  <Option key={i} title={getI18nMessage('dateToDate',
                    {fromDate: isDefined(info.fromDate) ? getDateWithTZOffset(info.fromDate, networkDS).toLocaleDateString() : getI18nMessage('nullStr'),
                    toDate: isDefined(info.toDate) ? getDateWithTZOffset(info.toDate, networkDS).toLocaleDateString() : getI18nMessage('nullStr')})}
                    value={info}>
                      <span>{isDefined(info.fromDate) ? getDateWithTZOffset(info.fromDate, networkDS).toLocaleDateString() : getI18nMessage('nullStr')}</span>
                      <span style={{ paddingLeft: '0.3rem', paddingRight: '0.3rem' }}>{getI18nMessage('toStr')}</span>
                      <span>{isDefined(info.toDate) ? getDateWithTZOffset(info.toDate, networkDS).toLocaleDateString() : getI18nMessage('nullStr')}</span>
                  </Option>
                )}
              </Select>
            </div>
          </div>
          {isDefined(concurrenciesResponse) && concurrenciesResponse?.locations.length > 0 && (
            concurrenciesResponse?.locations.map((location, locIndex) => {
              if (concurrenciesResponse?.locations[locIndex].concurrencies.length > 0) {
                return location.concurrencies.map((concurrency, index) => {
                  if ((!isDefined(concurrency.fromDate) || (isDefined(selectedDateRange?.fromDate) && concurrency.fromDate <= selectedDateRange?.fromDate)) &&
                  (!isDefined(concurrency.toDate) || (isDefined(selectedDateRange?.toDate) && selectedDateRange?.toDate <= concurrency.toDate)) &&
                  concurrency.routeId === concurrenciesResponse?.locations[locIndex].routeId) {

                    return (
                      <div key={index}>
                      <PointConcurrencyTable
                        intl={intl}
                        network={network?.networkInfo}
                        key={index}
                        isReset={reset}
                        concurrenciesLocation={concurrenciesResponse?.locations[locIndex]}
                        concurrenciesDateRange={selectedDateRange}
                        locationConcurrency={concurrency}
                        onConcurrenciesLocationUpdated={handleConcurrenciesLocationUpdated}
                        />
                      </div>
                    )
                  } else {
                    return ''
                  }
                })
              } else {
                return ''
              }
            })
          )}
        </div>
      </div>
      <div className='add-point-attributes-footer w-100'>
        <div className='add-point-event-edit-attributes__action w-100 d-flex'>
          <div className='mt-auto mr-auto'>
            <Button
              aria-label={getI18nMessage('backLabel')}
              size='sm'
              type='secondary'
              onClick={() => { navBack(false) }}
            >
                {getI18nMessage('backLabel')}
            </Button>
          </div>
          <div className='mt-auto ml-auto'>
            <Button
              type='primary'
              className='active'
              aria-label={getI18nMessage('nextLabel')}
              size='sm'
              onClick={onSubmitClicked}
            >
                {getI18nMessage('nextLabel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
