/** @jsx jsx */
import {
  React, jsx, DataSourceComponent, type IMUseDataSource, type DataSource
} from 'jimu-core'

interface Props {
  useDataSource: IMUseDataSource
  onDataSourceCreatedOrFailed: (dataSourceId: string, dataSource: DataSource) => void
}
export default class LayerConfigDataSource extends React.PureComponent<Props> {
  onDataSourceCreated = (ds: DataSource) => {
    this.props.onDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId, ds)
  }

  onCreateDataSourceFailed = (err) => {
    this.props.onDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId, null)
  }

  render () {
    return (
      <DataSourceComponent
        useDataSource={this.props.useDataSource}
        onDataSourceCreated={this.onDataSourceCreated}
        onCreateDataSourceFailed={this.onCreateDataSourceFailed}
      />
    )
  }
}
