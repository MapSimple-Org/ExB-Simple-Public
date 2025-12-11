/** @jsx jsx */
import {
  React,
  jsx,
  css,
  CONSTANTS,
  type FeatureLayerDataSource,
  type ImmutableObject,
  type QueryParams,
  type DataRecord,
  type FeatureDataRecord,
  classNames,
  hooks
} from 'jimu-core'
import { Loading, LoadingType } from 'jimu-ui'
import { type QueryItemType, ListDirection } from '../config'
import { EntityStatusType } from 'widgets/shared-code/common'
import { QueryResultItem } from './query-result-item'
import { executeQuery, getPopupTemplate } from './query-utils'
import { useAutoHeight } from './useAutoHeight'

const { useRef, useState } = React

export interface LazyListProps {
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  outputDS: FeatureLayerDataSource
  resultCount: number
  records: DataRecord[]
  queryParams: QueryParams
  /** Whether result items should be expanded by default. Controlled by expand/collapse all button. */
  expandByDefault?: boolean
  direction: ListDirection
  onEscape: () => void
  defaultPageSize?: number
  onRenderDone?: (options: { dataItems: any[] }) => void
  onSelectChange: (data: FeatureDataRecord) => void
  onRemove: (data: FeatureDataRecord) => void
  /** Set of record IDs that have been removed and should be filtered out */
  removedRecordIds?: Set<string>
}

const getStyle = (isAutoHeight: boolean) => {
  return css`
    display: flex;
    flex: 1 1 ${isAutoHeight ? 'auto' : 0};
    overflow: auto;
    max-height: ${isAutoHeight ? 'calc(61.8vh - 100px)' : 'none'};

    .query-result-item + .query-result-item {
      margin-left: 0.5rem;
      margin-top: 0;
    }

    &.vertical {
      flex-direction: column;
      .list-items {
        position: relative;
        flex-direction: column;
      }

      .feature-info-component {
        width: 100%;
      }

      .query-result-item + .query-result-item {
        margin-left: 0;
        margin-top: 0.5rem;
      }
    }
    .list-items {
      display: flex;
    }
    .lazyload-detector {
      height: 2px;
      width: 2px;
      opacity: 0;
    }
  `
}

export function LazyList (props: LazyListProps) {
  const {
    widgetId,
    outputDS,
    queryParams,
    resultCount,
    records,
    queryItem,
    direction,
    onRenderDone,
    onEscape,
    onSelectChange,
    onRemove,
    removedRecordIds,
    defaultPageSize = CONSTANTS.DEFAULT_QUERY_PAGE_SIZE
  } = props
  const [dataItems, setDataItems] = useState(records)
  const [popupTemplate, setPopupTemplate] = useState<any>()
  const [defaultPopupTemplate, setDefaultPopupTemplate] = useState<any>()
  const [loadStatus, setLoadStatus] = useState<EntityStatusType>(EntityStatusType.Init)
  const dataItemsRef = hooks.useLatest(dataItems)
  const resultCountRef = hooks.useLatest(resultCount)
  const loadStatusRef = hooks.useLatest(loadStatus)
  const allDataItemsLoadedRef = hooks.useLatest(dataItems?.length === resultCount)
  const pageRef = useRef(0)
  const resultContainerRef = useRef<HTMLDivElement>(undefined)
  const el = useRef(null)
  const isAutoHeight = useAutoHeight()
  const previousRecordIdsRef = useRef<string[]>([])
  const scrollPosRef = useRef<number>(0)

  // Update dataItems when records change (filtering, etc.) - Preserve scroll position
  React.useEffect(() => {
    // Check if records have actually changed by comparing IDs
    const currentRecordIds = records?.map(r => r.getId()) || []
    const previousRecordIds = previousRecordIdsRef.current || []
    const recordsChanged = currentRecordIds.length !== previousRecordIds.length ||
      currentRecordIds.some((id, index) => id !== previousRecordIds[index])
    
    if (recordsChanged) {
      // Capture current scroll position before updating
      scrollPosRef.current = resultContainerRef.current?.scrollTop || 0
      setDataItems(records)
      previousRecordIdsRef.current = currentRecordIds
    }
  }, [records])

  // Restore scroll position synchronously after DOM updates but before paint
  React.useLayoutEffect(() => {
    if (scrollPosRef.current > 0 && resultContainerRef.current) {
      const container = resultContainerRef.current
      const maxScroll = container.scrollHeight - container.clientHeight
      // Clamp scroll position to valid range to prevent browser from resetting
      const clampedScroll = Math.min(scrollPosRef.current, Math.max(0, maxScroll))
      container.scrollTop = clampedScroll
      scrollPosRef.current = 0 // Reset after restoring
    }
  })

  // Only reset scroll when resultCount changes (new query)
  React.useEffect(() => {
    pageRef.current = 1
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTop = 0
    }
    // Reset previous record IDs when resultCount changes (new query)
    previousRecordIdsRef.current = []
    scrollPosRef.current = 0
  }, [resultCount])

  const loadByPages = async () => {
    if (allDataItemsLoadedRef.current || loadStatusRef.current === EntityStatusType.Loading) {
      return
    }
    pageRef.current = pageRef.current + 1
    setLoadStatus(EntityStatusType.Loading)

    if (!queryParams.pageSize) {
      queryParams.pageSize = defaultPageSize
    }
    const { records } = await executeQuery(widgetId, queryItem, outputDS, {
      ...queryParams,
      page: pageRef.current
    })
    if (resultCountRef.current > 0 && dataItemsRef.current.length + records.length >= resultCountRef.current) {
      allDataItemsLoadedRef.current = true
    }
    const updatedItems = dataItemsRef.current.concat(records)
    setDataItems(updatedItems)
    
    // Filter out removed records before passing to onRenderDone
    // This prevents removed records from being re-selected during lazy loading
    const allLoadedRecords = outputDS.getAllLoadedRecords() || []
    const filteredRecords = removedRecordIds && removedRecordIds.size > 0
      ? allLoadedRecords.filter(record => !removedRecordIds.has(record.getId()))
      : allLoadedRecords
    
    onRenderDone?.({
      dataItems: filteredRecords
    })
    setLoadStatus(EntityStatusType.Loaded)
  }

  React.useEffect(() => {
    getPopupTemplate(outputDS, queryItem).then((rs) => {
      setPopupTemplate(rs.popupTemplate)
      setDefaultPopupTemplate(rs.defaultPopupTemplate)
    })
  }, [outputDS, queryItem])

  hooks.useEffectOnce(() => {
    const elLoadDetector = el?.current
    if (elLoadDetector) {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          loadByPages()
        }
      })
      observer?.observe(elLoadDetector)
      return () => {
        observer?.disconnect()
      }
    }
  })

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
    <div onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} className={classNames({ vertical: direction === ListDirection.Vertical })} css={getStyle(isAutoHeight)} ref={resultContainerRef}>
      <div className='list-items px-4 py-1' role='listbox'>
        {dataItems?.map((dataItem) => (
          <QueryResultItem
            key={dataItem.getId()}
            data={dataItem as FeatureDataRecord}
            dataSource={outputDS}
            widgetId={widgetId}
            popupTemplate={popupTemplate}
            defaultPopupTemplate={defaultPopupTemplate}
            expandByDefault={props.expandByDefault ?? true}
            onClick={onSelectChange}
            onRemove={onRemove}
          />
        ))}
      </div>
      <div ref={el} className='lazyload-detector'>
        &nbsp;
      </div>
      {loadStatus === EntityStatusType.Loading && <Loading type={LoadingType.Donut} />}
    </div>
  )
}
