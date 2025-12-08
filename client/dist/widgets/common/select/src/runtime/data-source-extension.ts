import {
  type ArcGISQueriableDataSource, type FeatureLayerQueryParams, type QueryProgressCallback,
  MessageManager, DataRecordsSelectionChangeMessage, dataSourceUtils, DataSourceSelectionMode, type DataRecord
} from 'jimu-core'

import type { JimuLayerView, JimuFeatureLayerView, JimuSceneLayerView } from 'jimu-arcgis'

/**
 * Wrapper of data source.
 */
export default class DataSourceExtension {
  readonly ds: ArcGISQueriableDataSource
  private readonly widgetId: string

  constructor (ds: ArcGISQueriableDataSource, widgetId: string) {
    this.ds = ds
    this.widgetId = widgetId
  }

  async clearSelection (): Promise<void> {
    const records: DataRecord[] = []

    await this.ds.selectRecords({
      widgetId: this.widgetId,
      records
    })

    this.publishMessage(records)
  }

  async selectRecords (
    query: FeatureLayerQueryParams,
    selectionMode: DataSourceSelectionMode,
    signal: AbortSignal,
    jimuLayerView: JimuLayerView, // jimuLayerView maybe null
    progressCallback: QueryProgressCallback, // progress is in range of [0, 1]
    updateSelectionIfAborted: () => boolean
  ): Promise<void> {
    const validSelectionModes = Object.values(selectionMode)

    if (validSelectionModes.includes(selectionMode)) {
      // If the selectionMode is invalid, set it to DataSourceSelectionMode.New.
      selectionMode = DataSourceSelectionMode.New
    }

    let records: DataRecord[] = null

    const widgetId = this.widgetId
    const ds = this.ds

    if (selectionMode === DataSourceSelectionMode.New && !query.objectIds && !query.geometry && (!query.where || query.where === '1=1')) {
      // return empty array if only don't set any query condition
      records = []
      ds.selectRecords({
        widgetId,
        records
      })
    } else {
      const selectResult = await dataSourceUtils.selectBySelectionMode({
        widgetId,
        ds,
        query,
        selectionMode,
        signal,
        checkLayerVisibility: false,
        jimuLayerView: jimuLayerView as JimuFeatureLayerView | JimuSceneLayerView,
        progressCallback,
        updateSelectionIfAborted
      })

      if (selectResult) {
        records = selectResult.records
      }
    }

    if (records) {
      this.publishMessage(records)
    }
  }

  private publishMessage (records: DataRecord[]): void {
    const message = new DataRecordsSelectionChangeMessage(this.widgetId, records, [this.ds.id])
    MessageManager.getInstance().publishMessage(message)
  }
}
