import { React, DataSourceComponent, type IMUseDataSource, type DataSource, type ImmutableArray, type IMDataSourceInfo } from 'jimu-core'
import { idsArrayEquals } from './utils'

interface DataSourceProps {
  useDataSource: IMUseDataSource
  onDataSourceCreated?: (dataSourceId: string, dataSource?: DataSource) => void
  onSelectionChange: (dataSourceId: string) => void
  onSourceVersionChange?: (dataSourceId: string, sourceVersion: number) => void
}

export default class EditItemDataSource extends React.PureComponent<DataSourceProps> {
  onDataSourceCreated = (ds: DataSource) => {
    this.props?.onDataSourceCreated?.(this.props.useDataSource.dataSourceId, ds)
  }

  onSelectionChange = (selection: ImmutableArray<string>, preSelection?: ImmutableArray<string>) => {
    const selectedChange = !idsArrayEquals(selection, preSelection) && (selection?.length !== 0 || preSelection?.length !== 0)
    if (selectedChange) {
      this.props.onSelectionChange?.(this.props.useDataSource.dataSourceId)
    }
  }

  onDataSourceInfoChange = (info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => {
    if (!info) return
    const sourceVersionChange = info.sourceVersion !== preInfo?.sourceVersion
    if (sourceVersionChange) {
      this.props.onSourceVersionChange?.(this.props.useDataSource.dataSourceId, info.sourceVersion)
    }
  }

  render () {
    const { useDataSource } = this.props
    return (
      <DataSourceComponent
        useDataSource={useDataSource}
        onDataSourceCreated={this.onDataSourceCreated}
        onSelectionChange={this.onSelectionChange}
        onDataSourceInfoChange={this.onDataSourceInfoChange}
      />
    )
  }
}
