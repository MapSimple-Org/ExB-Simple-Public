/** @jsx jsx */
import {
  React,
  jsx,
  css,
  classNames,
  type FeatureLayerDataSource,
  type ImmutableObject,
  type DataRecord,
  type FeatureDataRecord
} from 'jimu-core'
import { type QueryItemType, ListDirection } from '../config'
import { QueryResultItem } from './query-result-item'
import { getPopupTemplate } from './query-utils'
import { useAutoHeight } from './useAutoHeight'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

export interface SimpleListProps {
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  outputDS: FeatureLayerDataSource
  records: DataRecord[]
  direction: ListDirection
  onEscape: () => void
  onSelectChange: (data: FeatureDataRecord) => void
  onRemove: (data: FeatureDataRecord) => void
  expandByDefault?: boolean
  itemExpandStates?: Map<string, boolean>
  removedRecordIds?: Set<string>
  onRenderDone?: (options: { dataItems: any[] }) => void
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
  `
}

export function SimpleList (props: SimpleListProps) {
  const {
    widgetId,
    outputDS,
    queryItem,
    records,
    direction,
    onEscape,
    onSelectChange,
    onRemove,
    expandByDefault,
    itemExpandStates,
    removedRecordIds,
    onRenderDone
  } = props
  
  const [popupTemplate, setPopupTemplate] = React.useState<any>()
  const [defaultPopupTemplate, setDefaultPopupTemplate] = React.useState<any>()
  const isAutoHeight = useAutoHeight()
  const resultContainerRef = React.useRef<HTMLDivElement>(null)

  // Filter out removed records
  const filteredRecords = React.useMemo(() => {
    return records?.filter(record => !removedRecordIds?.has(record.getId())) || []
  }, [records, removedRecordIds])

  // Notify parent when records are rendered (for auto-switch logic)
  React.useEffect(() => {
    if (onRenderDone && filteredRecords.length > 0) {
      debugLogger.log('RESULTS-MODE', {
        event: 'SimpleList-onRenderDone-called',
        widgetId,
        queryItemConfigId: queryItem.configId,
        filteredRecordsCount: filteredRecords.length,
        totalRecordsCount: records.length,
        removedRecordIdsCount: removedRecordIds?.size || 0,
        timestamp: Date.now()
      })
      onRenderDone({ dataItems: filteredRecords })
    }
  }, [filteredRecords, onRenderDone, widgetId, queryItem.configId, records.length, removedRecordIds])

  React.useEffect(() => {
    getPopupTemplate(outputDS, queryItem).then(rs => {
      setPopupTemplate(rs.popupTemplate)
      setDefaultPopupTemplate(rs.defaultPopupTemplate)
    })
  }, [outputDS, queryItem])

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
    <div 
      onKeyUp={handleKeyUp} 
      onKeyDown={handleKeyDown} 
      className={classNames({ vertical: direction === ListDirection.Vertical })} 
      css={getStyle(isAutoHeight)}
      ref={resultContainerRef}
    >
      <div className='list-items px-4 py-1' role='listbox'>
        {filteredRecords.map((dataItem) => {
          const recordId = dataItem.getId()
          // Use individual state from map if available, otherwise fall back to expandByDefault
          const individualExpandState = itemExpandStates?.get(recordId)
          const expandByDefaultValue = individualExpandState !== undefined ? individualExpandState : (expandByDefault ?? true)
          return (
            <QueryResultItem
              key={recordId}
              data={dataItem as FeatureDataRecord}
              dataSource={outputDS}
              widgetId={widgetId}
              popupTemplate={popupTemplate}
              defaultPopupTemplate={defaultPopupTemplate}
              expandByDefault={expandByDefaultValue}
              onClick={onSelectChange}
              onRemove={onRemove}
            />
          )
        })}
      </div>
    </div>
  )
}

