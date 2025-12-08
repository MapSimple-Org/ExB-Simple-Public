import {
  React,
  DataRecordsSelectionChangeMessage,
  hooks,
  lodash,
  MessageManager,
  ReactRedux,
  type DataSource,
  type DataRecord,
  type ImmutableArray,
  type IMState
} from 'jimu-core'
import { getSplitByField, type WebChartDataItem, type SelectionData, type ArcgisChartCustomEvent, type SelectionCompletePayload } from 'jimu-ui/advanced/chart'
import type { WebChartSeries } from '../../../../config'

const isRecordMatch = (rec1: { [x: string]: any }, rec2: { [x: string]: any }): boolean => {
  return Object.keys(rec2).every(key => rec1[key] === rec2[key])
}

const getNormalizedSelectionItems = (selectionItems: Array<{ [x: string]: any }>, splitByField?: string) => {
  return selectionItems.map((item) => {
    const data = { ...item }
    if (typeof data.arcgis_charts_slice_id !== 'undefined') {
      delete data.arcgis_charts_slice_id
    }
    if (typeof data.__outputid__ !== 'undefined') {
      delete data.__outputid__
    }
    if (splitByField) {
      delete data[splitByField]
    }
    if (typeof data.arcgis_charts_type_domain_field_name !== 'undefined') {
      const domainField = data.arcgis_charts_type_domain_field_name
      const domainFieldValue = data.arcgis_charts_type_domain_id_value
      data[domainField] = domainFieldValue
    }
    return data
  })
}

const normalizeRecordData = (input: { [x: string]: any }) => {
  let output = input
  output = { ...input }
  if (typeof output.__outputid__ !== 'undefined') {
    delete output.__outputid__
  }
  if (typeof output.arcgis_charts_slice_id !== 'undefined') {
    delete output.arcgis_charts_slice_id
  }
  return output
}

/**
 * Match the data in the records based on the selected data. If the selected data completely matches the data in some of the records, return them.
 * Note1: The number of fields in record is different from select item. For example, there is `objectid` in record but not in select item.
 * Note2: There is a potential problem with `no aggregation` in this matching pair. There may be two records whose fields (non-objectid) and values are exactly the same.
 */
const getMatchedRecords = (records: DataRecord[], selectionItems: Array<{ [x: string]: any }>) => {
  return records.filter(record => {
    const data = normalizeRecordData(record.getData())
    return selectionItems.some(item => {
      return isRecordMatch(data, item)
    })
  })
}

/**
 * Get selection items by the selected id from data source.
 */
const getSelectedItems = (
  selectedIds: string[],
  records: DataRecord[]
): WebChartDataItem[] => {
  const items = selectedIds.map((id) => {
    const record = records.find((record) => record.getId() === id)
    let data = null
    if (record) {
      data = normalizeRecordData(record.getData())
      if (typeof data.arcgis_charts_type_domain_field_name !== 'undefined') {
        const domainField = data.arcgis_charts_type_domain_field_name
        const domainFieldLabel = data.arcgis_charts_type_domain_id_label
        data[domainField] = domainFieldLabel
      }
    }
    return data
  }).filter((item) => !!item)
  return items
}

/**
 * Keep the selection of chart and output data source, publish message when selection changes.
 * @param widgetId
 * @param outputDataSource
 * @param dataItems
 * @param seriesLength
 */
export const useSelection = (
  widgetId: string,
  outputDataSource: DataSource,
  series: ImmutableArray<WebChartSeries>
): [SelectionData, (event: ArcgisChartCustomEvent<SelectionCompletePayload>) => any] => {
  const preSelectedIdsRef = React.useRef<string[]>(null)
  const handleSelectionChange = hooks.useEventCallback((e: ArcgisChartCustomEvent<SelectionCompletePayload>) => {
    const dataSourceId = outputDataSource?.id
    const sourceRecords = outputDataSource?.getSourceRecords()
    if (!dataSourceId || !sourceRecords?.length) return

    const selectionSource = e.detail.selectionData?.selectionSource
    // Only trigger selection change message if selection source is from the user operation
    const selectionByUser =
      selectionSource === 'SelectionByClick' ||
      selectionSource === 'SelectionByRange' ||
      selectionSource === 'ClearSelection'
    if (!selectionByUser) return
    const where = series[0].query?.where
    const splitByField = getSplitByField(where)

    const selectionItems = getNormalizedSelectionItems(e.detail.selectionData?.selectionItems ?? [], splitByField)
    const selectedRecords = getMatchedRecords(sourceRecords, selectionItems)
    const selectedIds = selectedRecords.map(record => record.getId())

    preSelectedIdsRef.current = selectedIds

    //Publish records selection change message
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(widgetId, selectedRecords, [dataSourceId])
    )

    outputDataSource.selectRecordsByIds(selectedIds)
  })

  const originalSelectedIds = ReactRedux.useSelector((state: IMState) => state.dataSourcesInfo?.[outputDataSource?.id]?.selectedIds)
  const [selectionItems, setSelectionItems] = React.useState<WebChartDataItem[]>()

  const getSelectionItems = hooks.useEventCallback((selectedIds) => {
    const sourceRecords = outputDataSource?.getSourceRecords()
    if (!sourceRecords?.length) return
    const items = getSelectedItems(selectedIds ?? [], sourceRecords)
    return items
  })

  React.useEffect(() => {
    if (!originalSelectedIds) return
    const mutableSelectionIds = originalSelectedIds.asMutable()
    // if the selected ids is same as the current selected ids, just return.
    if (lodash.isDeepEqual(mutableSelectionIds, preSelectedIdsRef.current)) return
    preSelectedIdsRef.current = mutableSelectionIds
    const selectionItems = getSelectionItems(mutableSelectionIds)
    setSelectionItems(selectionItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalSelectedIds])
  const selectionData = React.useMemo(() => ({ selectionItems }), [selectionItems])
  return [selectionData, handleSelectionChange]
}
