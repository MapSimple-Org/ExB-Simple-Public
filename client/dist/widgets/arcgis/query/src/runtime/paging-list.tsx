/** @jsx jsx */
import {
  React,
  jsx,
  css,
  classNames,
  CONSTANTS,
  type FeatureLayerDataSource,
  type ImmutableObject,
  type DataRecord,
  type FeatureDataRecord,
  type QueryParams
} from 'jimu-core'
import { Pagination, Loading, LoadingType } from 'jimu-ui'
import { ListDirection, type QueryItemType } from '../config'
import { EntityStatusType } from '../common/common-components'
import { QueryResultItem } from './query-result-item'
import { executeQuery, getPopupTemplate } from './query-utils'
import { useAutoHeight } from './useAutoHeight'

const { useRef, useState } = React

export interface PagingListProps {
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  outputDS: FeatureLayerDataSource
  resultCount: number
  maxPerPage: number
  records: DataRecord[]
  queryParams: QueryParams
  onEscape: () => void
  direction?: ListDirection
  defaultPageSize?: number
  onRenderDone?: (options: { dataItems: any[], pageSize?: number, page?: number }) => void
  onSelectChange: (data: FeatureDataRecord) => void
}

const getStyle = (isAutoHeight: boolean) => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;

    .list_items {
      flex: 1 1 ${isAutoHeight ? 'auto' : 0};
      max-height: ${isAutoHeight ? 'calc(61.8vh - 100px)' : 'none'};
      overflow: auto;
      display: flex;
      flex-direction: row;
    }

    .query-result-item + .query-result-item {
      margin-left: 0.5rem;
      margin-top: 0;
    }

    &.vertical {
      .list_items {
        flex-direction: column;
      }
      .feature-info-component {
        width: 100%;
      }
      .query-result-item + .query-result-item {
        margin-top: 0.5rem;
        margin-left: 0;
      }
    }
    .page-size-selector {
      width: auto;
    }

    .query-editable-select {
      .jimu-numeric-input {
        width: 60px;
      }
    }
  `
}

export function PagingList (props: PagingListProps) {
  const {
    widgetId,
    outputDS,
    queryItem,
    queryParams,
    resultCount,
    records,
    onRenderDone,
    onSelectChange,
    direction,
    onEscape,
    defaultPageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE
  } = props
  const [dataItems, setDataItems] = useState(records)
  const [popupTemplate, setPopupTemplate] = useState<any>()
  const [defaultPopupTemplate, setDefaultPopupTemplate] = useState<any>()
  const [loadStatus, setLoadStatus] = useState<EntityStatusType>(EntityStatusType.Init)
  const pageRef = useRef(1)
  const pageSizeRef = useRef(defaultPageSize)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const isAutoHeight = useAutoHeight()

  const pageSizeOptions = React.useMemo(() => {
    const result = [defaultPageSize]
    if (Math.round(defaultPageSize / 2) !== result[0]) {
      result.push(Math.round(defaultPageSize / 2))
    }
    if (Math.round(defaultPageSize / 5) !== result[1]) {
      result.push(Math.round(defaultPageSize / 5))
    }
    return result.reverse()
  }, [defaultPageSize])

  React.useEffect(() => {
    pageRef.current = 1
    setDataItems(records)
    setPageSize(pageSizeRef.current)
  }, [records])

  React.useEffect(() => {
    getPopupTemplate(outputDS, queryItem).then(rs => {
      setPopupTemplate(rs.popupTemplate)
      setDefaultPopupTemplate(rs.defaultPopupTemplate)
    })
  }, [outputDS, queryItem])

  const loadByPages = React.useCallback(async (currentPage: number, size: number) => {
    pageRef.current = currentPage
    setLoadStatus(EntityStatusType.Loading)
    const result = await executeQuery(widgetId, queryItem, outputDS, { ...queryParams, page: currentPage, pageSize: size })
    setDataItems(result.records)
    onRenderDone?.({
      dataItems: outputDS.getAllLoadedRecords(),
      pageSize: size,
      page: pageRef.current
    })
    setLoadStatus(EntityStatusType.Loaded)
  }, [onRenderDone, outputDS, queryItem, queryParams, widgetId])

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

  const handlePageSizeChange = (size: number) => {
    if (size > 0) {
      setPageSize(size)
      loadByPages(1, size)
    }
  }

  const handleKeyUp = React.useCallback((evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation()
      onEscape()
    }
  }, [onEscape])

  const handleKeyDown = React.useCallback((evt) => {
    if (evt.key === ' ') {
      evt.preventDefault()
    }
  }, [])

  return (
    <div onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} className={classNames({ vertical: direction === ListDirection.Vertical })} css={getStyle(isAutoHeight)}>
      <div className='list_items mb-2 px-4 py-1' role='listbox'>
        {dataItems?.map((dataItem) => (
          <QueryResultItem
            key={dataItem.getId()}
            data={dataItem as FeatureDataRecord}
            dataSource={outputDS}
            widgetId={widgetId}
            popupTemplate={popupTemplate}
            defaultPopupTemplate={defaultPopupTemplate}
            expandByDefault={queryItem.resultExpandByDefault}
            onClick={onSelectChange}
          />
        ))}
      </div>
      {loadStatus === EntityStatusType.Loading && <Loading type={LoadingType.Donut}/>}
      {resultCount > 0 && (
        <div className='d-flex justify-content-between align-items-center px-4'>
          <Pagination
            className='d-flex justify-content-end'
            disabled={loadStatus === EntityStatusType.Loading}
            current={pageRef.current}
            totalPage={Math.ceil(resultCount / pageSize)}
            onChangePage={(pageNum) => loadByPages(pageNum, pageSize)}
            pageSize={pageSize}
            maxPageSize={1000}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={handlePageSizeChange}
            showSizeChanger
          />
        </div>
      )}
    </div>
  )
}
