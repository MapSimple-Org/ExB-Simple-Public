/** @jsx jsx */
import {
  React,
  jsx,
  type ImmutableObject,
  type DataSource,
  DataSourceComponent,
  DataSourceStatus,
  type IMDataSourceInfo
} from 'jimu-core'
import type {
  LrsLayer
} from 'widgets/shared-code/lrs'

export interface DataSourceManagerProps {
  network: ImmutableObject<LrsLayer>
  event: ImmutableObject<LrsLayer>
  dataSourcesReady: (boolean) => void
  onCreateNetworkDs: (DataSource) => void
  onCreateEventDs: (DataSource) => void
}

export function DataSourceManager (props: DataSourceManagerProps) {
  const { network, event, dataSourcesReady, onCreateNetworkDs, onCreateEventDs } = props
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(network ?? null)
  const [selectedEvent, setSelectedEvent] = React.useState<ImmutableObject<LrsLayer>>(event ?? null)
  const [networkDsReady, setNetworkDsReady] = React.useState<boolean>(false)
  const [eventDsReady, setEventDsReady] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (network) {
      setSelectedNetwork(network)
    }
  }, [network])

  React.useEffect(() => {
    if (event) {
      setSelectedEvent(event)
    }
  }, [event])

  React.useEffect(() => {
    dataSourcesReady(networkDsReady && eventDsReady)
  }, [dataSourcesReady, eventDsReady, networkDsReady])

  const handleNetworkDsCreated = React.useCallback((ds: DataSource) => {
    onCreateNetworkDs(ds)
  }, [onCreateNetworkDs])

  const handleEventDsCreated = React.useCallback((ds: DataSource) => {
    onCreateEventDs(ds)
  }, [onCreateEventDs])

  const handleNetworkDsInfoChange = React.useCallback((info: IMDataSourceInfo) => {
    if (info) {
      const { status, instanceStatus } = info
      if (instanceStatus === DataSourceStatus.NotCreated ||
          instanceStatus === DataSourceStatus.CreateError ||
          status === DataSourceStatus.LoadError ||
          status === DataSourceStatus.NotReady) {
        setNetworkDsReady(false)
      } else {
        setNetworkDsReady(true)
      }
    }
  }, [setNetworkDsReady])

  const handleEventDsInfoChange = React.useCallback((info: IMDataSourceInfo) => {
    if (info) {
      const { status, instanceStatus } = info
      if (instanceStatus === DataSourceStatus.NotCreated ||
          instanceStatus === DataSourceStatus.CreateError ||
          status === DataSourceStatus.LoadError ||
          status === DataSourceStatus.NotReady) {
        setEventDsReady(false)
      } else {
        setEventDsReady(true)
      }
    }
  }, [setEventDsReady])

  const handleNetworkDsCreateFailed = React.useCallback(() => {
    setNetworkDsReady(false)
  }, [setNetworkDsReady])

  const handleEventDsCreateFailed = React.useCallback(() => {
    setEventDsReady(false)
  }, [setEventDsReady])

  return (
    <div>
      {selectedNetwork && (
        <DataSourceComponent
          useDataSource={selectedNetwork.useDataSource}
          onDataSourceInfoChange={handleNetworkDsInfoChange}
          onCreateDataSourceFailed={handleNetworkDsCreateFailed}
          onDataSourceCreated={handleNetworkDsCreated}
        />
      )}
      {selectedEvent && (
        <DataSourceComponent
          useDataSource={selectedEvent.useDataSource}
          onDataSourceInfoChange={handleEventDsInfoChange}
          onCreateDataSourceFailed={handleEventDsCreateFailed}
          onDataSourceCreated={handleEventDsCreated}
        />
      )}
    </div>
  )
}
