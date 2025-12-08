/** @jsx jsx */
import {
  React,
  jsx,
  type DataSource,
  DataSourceComponent,
  DataSourceStatus,
  type IMDataSourceInfo,
  type ImmutableArray
} from 'jimu-core'
import {
  type LrsLayer,
  isDefined
} from 'widgets/shared-code/lrs'

export interface AttributeSetDataSourceManagerProps {
  events?: ImmutableArray<LrsLayer>
  dataSourcesReady: (boolean) => void
}

export function AttributeSetDataSourceManager (props: AttributeSetDataSourceManagerProps) {
  const { events, dataSourcesReady } = props
  const [lrsEvents, setLrsEvents] = React.useState<ImmutableArray<LrsLayer>>(events ?? null)
  const [eventDsReady, setEventDsReady] = React.useState<boolean[]>([])

  React.useEffect(() => {
    if (events) {
      setLrsEvents(events)
      const setDsReadyFalse: boolean[] = Array(events.length).fill(false)
      setEventDsReady(setDsReadyFalse)
    }
  }, [events])

  React.useEffect(() => {
    const isReady = eventDsReady => eventDsReady.every(Boolean)
    dataSourcesReady(isReady)
  }, [dataSourcesReady, eventDsReady])

  const updateDsReady = React.useCallback((index: number, value: boolean) => {
    const updatedDsReady = { ...eventDsReady }
    updatedDsReady[index] = value
    setEventDsReady(updatedDsReady)
  }, [eventDsReady])

  const handleEventDsCreated = React.useCallback((ds: DataSource, index) => {
    updateDsReady(index, true)
  }, [updateDsReady])

  const handleEventDsInfoChange = React.useCallback((info: IMDataSourceInfo, index) => {
    if (info) {
      const { status, instanceStatus } = info
      if (instanceStatus === DataSourceStatus.NotCreated ||
          instanceStatus === DataSourceStatus.CreateError ||
          status === DataSourceStatus.LoadError ||
          status === DataSourceStatus.NotReady) {
        updateDsReady(index, false)
      } else {
        updateDsReady(index, true)
      }
    }
  }, [updateDsReady])

  const handleEventDsCreateFailed = React.useCallback((index) => {
    updateDsReady(index, false)
  }, [updateDsReady])

  return (
    <div>
      {isDefined(lrsEvents) && (
        lrsEvents.map((event, index) => {
          return (
            <DataSourceComponent
              useDataSource={event.useDataSource}
              onDataSourceInfoChange={(e) => { handleEventDsInfoChange(e, index) }}
              onCreateDataSourceFailed={(e) => { handleEventDsCreateFailed(index) }}
              onDataSourceCreated={(e) => { handleEventDsCreated(e, index) }}
            />
          )
        })
      )}
    </div>
  )
}
