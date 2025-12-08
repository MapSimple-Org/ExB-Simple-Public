/** @jsx jsx */
import {
  React,
  jsx,
  type ImmutableObject,
  type DataSource,
  Immutable,
  type UseDataSource,
  DataSourceComponent,
  DataSourceStatus,
  type IMDataSourceInfo
} from 'jimu-core'
import type { LrsLayer } from 'widgets/shared-code/lrs'

export interface DataSourceManagerProps {
  lrsLayer: ImmutableObject<LrsLayer>
  dataSourceReady: (boolean) => void
  onCreateDs: (DataSource) => void
  onCreatePointDs: (DataSource) => void
  onCreateLineDs: (DataSource) => void
}

export function DataSourceManager (props: DataSourceManagerProps) {
  const { lrsLayer, dataSourceReady, onCreateDs, onCreatePointDs, onCreateLineDs } = props
  const [selectedNetwork, setSelectedNetwork] = React.useState<ImmutableObject<LrsLayer>>(lrsLayer ?? null)

  React.useEffect(() => {
    if (lrsLayer) {
      setSelectedNetwork(lrsLayer)
    }
  }, [lrsLayer])

  const useLineOutputDs: ImmutableObject<UseDataSource> = React.useMemo(
    () =>
      Immutable({
        dataSourceId: selectedNetwork.networkInfo.outputLineDsId,
        mainDataSourceId: selectedNetwork.networkInfo.outputLineDsId
      }),
    [selectedNetwork.networkInfo.outputLineDsId]
  )

  const usePointOutputDs: ImmutableObject<UseDataSource> = React.useMemo(
    () =>
      Immutable({
        dataSourceId: selectedNetwork.networkInfo.outputPointDsId,
        mainDataSourceId: selectedNetwork.networkInfo.outputPointDsId
      }),
    [selectedNetwork.networkInfo.outputPointDsId]
  )

  const handleDsCreated = React.useCallback((ds: DataSource) => {
    onCreateDs(ds)
  }, [onCreateDs])

  const handleDsInfoChange = React.useCallback((info: IMDataSourceInfo) => {
    if (info) {
      const { status, instanceStatus } = info
      if (instanceStatus === DataSourceStatus.NotCreated ||
          instanceStatus === DataSourceStatus.CreateError ||
          status === DataSourceStatus.LoadError ||
          status === DataSourceStatus.NotReady) {
        dataSourceReady(false)
      } else {
        dataSourceReady(true)
      }
    }
  }, [dataSourceReady])

  const handleDsCreateFailed = React.useCallback(() => {
    dataSourceReady(false)
  }, [dataSourceReady])

  const handleLineOutputDataSourceCreated = (ds: DataSource) => {
    onCreateLineDs(ds)
  }

  const handlePointOutputDataSourceCreated = (ds: DataSource) => {
    onCreatePointDs(ds)
  }

  const handlePointOutputDataSourceFailed = () => {
    //dataSourceReady(false)
  }

  return (
    <div>
      <DataSourceComponent
        useDataSource={useLineOutputDs}
        onDataSourceCreated={handleLineOutputDataSourceCreated} />
      <DataSourceComponent
        useDataSource={usePointOutputDs}
        onDataSourceCreated={handlePointOutputDataSourceCreated}
        onCreateDataSourceFailed={handlePointOutputDataSourceFailed} />
      <DataSourceComponent
        useDataSource={selectedNetwork.useDataSource}
        onDataSourceInfoChange={handleDsInfoChange}
        onCreateDataSourceFailed={handleDsCreateFailed}
        onDataSourceCreated={handleDsCreated} />
    </div>
  )
}
