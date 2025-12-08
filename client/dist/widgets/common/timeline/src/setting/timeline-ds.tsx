/** @jsx jsx */
import {
  React, jsx, DataSourceComponent, type IMUseDataSource, type DataSource
} from 'jimu-core'

interface Props {
  useDataSource: IMUseDataSource
  onCreateDataSourceCreatedOrFailed: (dataSourceId: string, dataSource: DataSource) => void
}

export default class TimelineDataSource extends React.PureComponent<Props> {
  onDataSourceCreated = (ds: DataSource) => {
    this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId, ds)
  }

  onCreateDataSourceFailed = () => {
    this.props.onCreateDataSourceCreatedOrFailed(this.props.useDataSource.dataSourceId, null)
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
