/** @jsx jsx */
import { React, jsx, css, type FeatureLayerDataSource, type DataRecord, type FeatureDataRecord, type ImmutableObject, type IntlShape, type ImmutableArray } from 'jimu-core'
import { Pagination, Loading, LoadingType } from 'jimu-ui'
import { SearchByRouteResultItem } from './search-by-route-result-item'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import type { JimuMapView } from 'jimu-arcgis'
import type { Style } from '../../config'
import { StatusType } from '../utils/status-utils'
import type { LrsLayer, SearchMethod } from 'widgets/shared-code/lrs'

const { useRef, useState } = React

export interface ResultsListProps {
  lrsLayers: ImmutableArray<LrsLayer>
  widgetId: string
  lrsLayer: ImmutableObject<LrsLayer>
  selectedMethod?: SearchMethod
  outputDS: FeatureLayerDataSource
  inputDS: FeatureLayerDataSource
  resultCount: number
  maxPerPage: number
  records: DataRecord[]
  highlightGraphicsLayer: GraphicsLayer
  flashGraphicsLayer: GraphicsLayer
  highlightStyle: Style
  jimuMapView: JimuMapView
  defaultPageSize?: number
  onRenderDone?: (options: { dataItems: any[], pageSize?: number, page?: number }) => void
  intl: IntlShape
  measureType?: string
}

const getStyle = (isAutoHeight: boolean) => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .list_items {
      flex: 1 1 auto;
      max-height: auto;
      overflow: auto;
      display: flex;
      flex-direction: row;
    }

    .search-by-route-result-item + .search-by-route-result-item {
      margin-left: 0.5rem;
      margin-top: 0;
    }

    &.list {
      .list_items {
        flex-direction: column;
      }
      .feature-info-component {
        width: 100%;
      }
      .search-by-route-result-item + .search-by-route-result-item {
        margin-top: 0.5rem;
        margin-left: 0;
      }
    }
  `
}

export function SearchByRouteResultList (props: ResultsListProps) {
  const {
    lrsLayers,
    widgetId,
    lrsLayer,
    selectedMethod,
    outputDS,
    inputDS,
    resultCount,
    records,
    highlightGraphicsLayer,
    flashGraphicsLayer,
    highlightStyle,
    jimuMapView,
    onRenderDone,
    intl,
    measureType,
    defaultPageSize = 25
  } = props
  const [dataItems, setDataItems] = useState(records)
  const [loadStatus, setLoadStatus] = useState<StatusType>(StatusType.Init)
  const pageRef = useRef(1)
  const pageSizeRef = useRef(defaultPageSize)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  // Updates current list items for page.
  React.useEffect(() => {
    pageRef.current = 1
    setDataItems(records)
    setPageSize(pageSizeRef.current)
  }, [records])

  // Loads new selection of records by page.

  const loadByPages = React.useCallback((currentPage: number, pageSize: number) => {
    pageRef.current = currentPage
    // Set loading status so new page cant be selected.
    setLoadStatus(StatusType.Loading)
    const records = outputDS.getRecordsByPage(currentPage, pageSize)
    setDataItems(records)
    onRenderDone?.({
      dataItems: records,
      pageSize: pageSize,
      page: pageRef.current
    })
    setLoadStatus(StatusType.Loaded)
  }, [onRenderDone, outputDS])

  // Update pageSize if needed.
  React.useEffect(() => {
    if (defaultPageSize !== pageSizeRef.current) {
      if (defaultPageSize < pageSizeRef.current) {
        setDataItems(dataItems.slice(0, defaultPageSize))
      } else {
        loadByPages(1, defaultPageSize)
      }
      pageSizeRef.current = defaultPageSize
      setPageSize(defaultPageSize)
    }
  }, [defaultPageSize, dataItems, loadByPages])

  return (
    <div className='list' css={getStyle(true)}>
      <div className='list_items mb-2 px-3' role='listbox'>
        {dataItems?.map((dataItem, x) => (
          <SearchByRouteResultItem
            lrsLayers={lrsLayers}
            key={dataItem.getId() + x}
            autoSelect={records.length === 1}
            lrsLayer={lrsLayer}
            data={dataItem as FeatureDataRecord}
            outputDS={outputDS}
            inputDS={inputDS}
            widgetId={widgetId}
            highlightGraphicLayer={highlightGraphicsLayer}
            flashGraphicsLayer={flashGraphicsLayer}
            highlightStyle={highlightStyle}
            jimuMapView={jimuMapView}
            intl={intl}
            selectedMethod={selectedMethod}
            measureType={measureType}
          />
        ))}
      </div>
      {loadStatus === StatusType.Loading && <Loading type={LoadingType.Donut}/>}
      {resultCount > 0 && (
        <div className='d-flex justify-content-s align-items-center px-3 pb-3' style={{ justifyContent: 'space-evenly' }}>
          <Pagination
            className='d-flex justify-content-end'
            disabled={loadStatus === StatusType.Loading}
            current={pageRef.current}
            totalPage={Math.ceil(resultCount / pageSize)}
            onChangePage={(pageNum) => { loadByPages(pageNum, pageSize) }}
            pageSize={pageSize}
            showQuickJumper={(Math.ceil(resultCount / pageSize)) > 1}
            />
        </div>
      )}
    </div>
  )
}
