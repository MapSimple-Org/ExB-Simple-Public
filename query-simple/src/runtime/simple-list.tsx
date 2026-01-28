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
  // r021.77: itemExpandStates removed - doesn't persist with no-rerender approach
  removedRecordIds?: Set<string>
  onRenderDone?: (options: { dataItems: any[] }) => void
  // r021.87: Queries array for looking up config by __queryConfigId
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
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
    // r021.77: itemExpandStates removed
    removedRecordIds,
    onRenderDone,
    queries
  } = props
  
  const isAutoHeight = useAutoHeight()
  const resultContainerRef = React.useRef<HTMLDivElement>(null)
  
  // r021.76: Cache popup templates per queryConfig
  // Key: queryConfig.configId, Value: { popupTemplate, defaultPopupTemplate }
  const popupTemplateCacheRef = React.useRef<Map<string, { popup: any, default: any }>>(new Map())
  
  // r021.77: Cleanup cache on unmount
  React.useEffect(() => {
    return () => {
      debugLogger.log('RESULTS-MODE', {
        event: 'SimpleList-cleanup-popup-template-cache',
        widgetId,
        cacheSize: popupTemplateCacheRef.current.size,
        cachedConfigIds: Array.from(popupTemplateCacheRef.current.keys()),
        timestamp: Date.now()
      })
      popupTemplateCacheRef.current.clear()
    }
  }, [widgetId])
  
  // r021.87: Diagnostic - log queries received
  React.useEffect(() => {
    debugLogger.log('RESULTS-MODE', {
      event: 'SimpleList-queries-received',
      widgetId,
      hasQueries: !!queries,
      queriesCount: queries?.length || 0,
      timestamp: Date.now()
    })
  }, [queries, widgetId])

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

  // r021.87: Fetch and cache popup templates for all queryConfigs found in records
  React.useEffect(() => {
    if (!queries || !filteredRecords) return
    
    // Get unique queryConfigIds from records
    const uniqueConfigIds = new Set<string>()
    filteredRecords.forEach(record => {
      const configId = (record as any).feature?.attributes?.__queryConfigId
      if (configId) {
        uniqueConfigIds.add(configId)
      }
    })
    
    // Fetch templates for any config we haven't cached yet
    uniqueConfigIds.forEach(configId => {
      if (!popupTemplateCacheRef.current.has(configId)) {
        const queryConfig = queries.find(q => q.configId === configId)
        if (queryConfig) {
          debugLogger.log('RESULTS-MODE', {
            event: 'fetching-popup-template-for-config',
            widgetId,
            queryConfigId: configId,
            cachedConfigIds: Array.from(popupTemplateCacheRef.current.keys()),
            timestamp: Date.now()
          })
          
          getPopupTemplate(outputDS, queryConfig).then(rs => {
            popupTemplateCacheRef.current.set(configId, {
              popup: rs.popupTemplate,
              default: rs.defaultPopupTemplate
            })
            
            // Force re-render to show new templates
            setPopupTemplateVersion(prev => prev + 1)
          })
        }
      }
    })
  }, [filteredRecords, queries, outputDS, widgetId])
  
  // State to force re-render when new templates are cached
  const [popupTemplateVersion, setPopupTemplateVersion] = React.useState(0)

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
          const record = dataItem as FeatureDataRecord
          
          // r021.87: Read queryConfigId directly from record (stamped when added)
          const recordQueryConfigId = record.feature?.attributes?.__queryConfigId
          
          // Look up the query config to get popup template
          let recordPopupTemplate: any
          let recordDefaultPopupTemplate: any
          
          if (recordQueryConfigId) {
            const recordConfig = queries.find(q => q.configId === recordQueryConfigId)
            if (recordConfig) {
              const cachedTemplates = popupTemplateCacheRef.current.get(recordConfig.configId)
              if (cachedTemplates) {
                recordPopupTemplate = cachedTemplates.popup
                recordDefaultPopupTemplate = cachedTemplates.default
                
                debugLogger.log('RESULTS-MODE', {
                  event: 'record-template-lookup',
                  widgetId,
                  recordId,
                  queryConfigId: recordQueryConfigId,
                  hasPopupTemplate: !!recordPopupTemplate,
                  hasDefaultPopupTemplate: !!recordDefaultPopupTemplate,
                  timestamp: Date.now()
                })
              } else {
                debugLogger.log('RESULTS-MODE', {
                  event: 'record-template-not-in-cache',
                  widgetId,
                  recordId,
                  queryConfigId: recordQueryConfigId,
                  queryConfigId: recordConfig.configId,
                  cachedConfigIds: Array.from(popupTemplateCacheRef.current.keys()),
                  timestamp: Date.now()
                })
              }
              } else {
                debugLogger.log('RESULTS-MODE', {
                  event: 'record-config-not-found-by-id',
                  widgetId,
                  recordId,
                  queryConfigId: recordQueryConfigId,
                  availableQueries: queries?.length || 0,
                  timestamp: Date.now()
                })
              }
            }
          
          // r021.77: Always use expandByDefault - individual state tracking removed
          const expandByDefaultValue = expandByDefault ?? true
          
          // r021.94: Use composite key to prevent React key collisions when multiple records share same ID
          const compositeKey = recordQueryConfigId ? `${recordId}__${recordQueryConfigId}` : recordId
          
          return (
            <QueryResultItem
              key={compositeKey}
              data={dataItem as FeatureDataRecord}
              dataSource={outputDS}
              widgetId={widgetId}
              popupTemplate={recordPopupTemplate}
              defaultPopupTemplate={recordDefaultPopupTemplate}
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

