/** @jsx jsx */
/**
 * Results Menu Component
 * 
 * Custom hamburger menu for the Results tab that provides a curated set of actions:
 * - Pan to: Centers the map on ALL results without changing zoom (uses cached resultsExtent)
 * - View in table: Opens the Table widget with results (supports multiple sources as tabs)
 * - Export CSV: Downloads results as CSV (single file or zip for multiple sources)
 * - Select on map: Selects features on the map (blue outline)
 * 
 * This replaces the DataActionList dropdown with a focused set of custom options.
 * 
 * IMPORTANT: This component is designed to be stable and not recreate on every render.
 * It uses refs for handlers and memoizes expensive computations to avoid memory leaks.
 */

import {
  React,
  jsx,
  css,
  type DataRecordSet,
  type DataSource,
  type IntlShape,
  type ImmutableArray,
  type ImmutableObject,
  type FeatureDataRecord,
  type DataRecord,
  type QueriableDataSource,
  type FeatureLayerDataSource
} from 'jimu-core'
import JSZip from 'jszip'
import { 
  Dropdown, 
  DropdownButton, 
  DropdownMenu, 
  DropdownItem,
  Icon,
  Tooltip
} from 'jimu-ui'
import { MenuOutlined } from 'jimu-icons/outlined/editor/menu'
import { TableOutlined } from 'jimu-icons/outlined/data/table'
import { HandOutlined } from 'jimu-icons/outlined/editor/hand'
import { DownloadOutlined } from 'jimu-icons/outlined/editor/download'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import type { QueryItemType } from '../config'

// Import action handlers
// r024.75: handlePanTo removed - now uses cached resultsExtent directly
import { handleViewInTable, isTableWidgetAvailable } from '../data-actions/view-in-table-action'
import { handleSelectOnMap as executeSelectOnMap } from '../data-actions/add-to-map-action'

// Custom icon for "Select on map"
const showOnMapIcon = require('./assets/icons/show-on-map.svg')

// r024.78: Helper functions for CSV export
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50) || 'results'
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function recordsToCSV(records: DataRecord[], fields?: string[]): Blob {
  if (!records || records.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8' })
  }
  
  const firstRecord = records[0] as FeatureDataRecord
  const attributes = firstRecord.feature?.attributes || firstRecord.getData?.() || {}
  
  // Get field names: use provided fields, or extract from first record (excluding internal fields)
  const fieldNames = fields?.length 
    ? fields 
    : Object.keys(attributes).filter(key => !key.startsWith('__'))
  
  // Build CSV header
  const header = fieldNames.map(f => escapeCSVValue(f)).join(',')
  
  // Build CSV rows
  const rows = records.map(record => {
    const featureRecord = record as FeatureDataRecord
    const data = featureRecord.feature?.attributes || featureRecord.getData?.() || {}
    return fieldNames.map(field => escapeCSVValue(data[field])).join(',')
  })
  
  const csvContent = [header, ...rows].join('\r\n')
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
}

// r024.79: Fetch full attributes from data source before CSV export
// Matches the pattern used by View in Table action
async function fetchFullRecordsAndExportCSV(
  dataSource: DataSource,
  records: DataRecord[],
  fields?: string[]
): Promise<Blob> {
  if (!records || records.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8' })
  }
  
  let fullRecords = records
  let gotFullRecords = false  // Track if we successfully fetched full records
  
  // Debug: Log data source info
  debugLogger.log('DATA-ACTION', {
    action: 'exportCSV-fetchFullRecords-start',
    dataSourceId: dataSource?.id,
    dataSourceType: (dataSource as any)?.type,
    recordsCount: records.length,
    firstRecordAttrsCount: Object.keys((records[0] as FeatureDataRecord).feature?.attributes || {}).length,
    firstRecordAttrs: Object.keys((records[0] as FeatureDataRecord).feature?.attributes || {}).slice(0, 10)
  })
  
  try {
    // Get objectIdField from data source layer definition
    const objectIdField = (dataSource as FeatureLayerDataSource)
      ?.getLayerDefinition?.()?.objectIdField ||
      (dataSource as any)?.layer?.objectIdField ||
      'OBJECTID'
    
    // Build WHERE clause from actual OBJECTID values in feature attributes
    // Note: r.getId() returns internal IDs which don't match the layer's OBJECTID
    // for accumulated records from different sources
    const recordIds = records.map(r => {
      const featureRecord = r as FeatureDataRecord
      return featureRecord.feature?.attributes?.[objectIdField]
    }).filter(id => id != null)
    
    debugLogger.log('DATA-ACTION', {
      action: 'exportCSV-fetchFullRecords-ids',
      objectIdField,
      extractedIdsCount: recordIds.length,
      sampleIds: recordIds.slice(0, 5)
    })
    
    if (recordIds.length > 0) {
      const whereClause = `${objectIdField} IN (${recordIds.join(',')})`
      
      debugLogger.log('DATA-ACTION', {
        action: 'exportCSV-fetchFullRecords-query',
        objectIdField,
        recordCount: recordIds.length,
        whereClause: whereClause.substring(0, 100)
      })
      
      // Re-query with outFields: ['*'] to get all attributes
      // Use notAddFieldsToClient like View in Table does
      const result = await (dataSource as QueriableDataSource).query({
        where: whereClause,
        returnGeometry: false,
        notAddFieldsToClient: true,
        outFields: ['*']
      } as any)
      
      debugLogger.log('DATA-ACTION', {
        action: 'exportCSV-fetchFullRecords-result',
        resultRecordsCount: result?.records?.length || 0,
        resultFieldsCount: result?.records?.[0] ? Object.keys((result.records[0] as FeatureDataRecord).feature?.attributes || {}).length : 0
      })
      
      if (result?.records?.length > 0) {
        fullRecords = result.records
        gotFullRecords = true  // Successfully fetched all fields
        debugLogger.log('DATA-ACTION', {
          action: 'exportCSV-fetchFullRecords-success',
          originalFields: Object.keys((records[0] as FeatureDataRecord).feature?.attributes || {}).length,
          fullFields: Object.keys((fullRecords[0] as FeatureDataRecord).feature?.attributes || {}).length
        })
      } else {
        debugLogger.log('DATA-ACTION', {
          action: 'exportCSV-fetchFullRecords-empty-result',
          usingOriginalRecords: true
        })
      }
    } else {
      debugLogger.log('DATA-ACTION', {
        action: 'exportCSV-fetchFullRecords-no-ids',
        objectIdField,
        reason: 'Could not extract any record IDs from attributes'
      })
    }
  } catch (error) {
    // Fallback to original records if query fails
    debugLogger.log('DATA-ACTION', {
      action: 'exportCSV-fetchFullRecords-fallback',
      error: error instanceof Error ? error.message : String(error)
    })
  }
  
  // If we got full records, export ALL fields (ignore the fields parameter)
  // Only use fields parameter as fallback when we couldn't re-query
  return recordsToCSV(fullRecords, gotFullRecords ? undefined : fields)
}

const debugLogger = createQuerySimpleDebugLogger()

export interface ResultsMenuProps {
  widgetId: string
  dataSets: DataRecordSet[]
  outputDS: DataSource
  mapView?: __esri.MapView | __esri.SceneView
  resultsExtent?: __esri.Extent | null  // r024.75: Cached extent for pan action
  intl: IntlShape
  queryItem?: ImmutableObject<QueryItemType>
  graphicsLayer?: __esri.GraphicsLayer | __esri.GroupLayer
  queries?: ImmutableArray<ImmutableObject<QueryItemType>>
}

const menuStyles = css`
  .results-menu-button {
    min-width: 36px;
    min-height: 36px;
  }
  
  .results-menu-dropdown {
    min-width: 180px;
  }
`

// Check table availability once at module load (stable)
const TABLE_AVAILABLE = isTableWidgetAvailable()

export function ResultsMenu(props: ResultsMenuProps): React.ReactElement {
  const { 
    widgetId,
    dataSets, 
    outputDS, 
    mapView,
    resultsExtent,
    intl
  } = props
  
  // Use refs to store current values for handlers - avoids recreating callbacks
  const propsRef = React.useRef(props)
  propsRef.current = props
  
  const [isOpen, setIsOpen] = React.useState(false)
  
  // Get total record count - memoized
  const totalRecords = React.useMemo(() => {
    return dataSets.reduce((sum, ds) => sum + (ds.records?.length || 0), 0)
  }, [dataSets])
  
  // Collect all feature records from data sets - use ref to avoid recreating
  const getAllFeatureRecords = React.useCallback((): FeatureDataRecord[] => {
    const currentDataSets = propsRef.current.dataSets
    const allRecords: FeatureDataRecord[] = []
    currentDataSets.forEach(dataSet => {
      if (dataSet.records && dataSet.records.length > 0) {
        const featureRecords = dataSet.records.filter(
          (record): record is FeatureDataRecord => {
            return record && typeof (record as FeatureDataRecord).getGeometry === 'function'
          }
        )
        allRecords.push(...featureRecords)
      }
    })
    return allRecords
  }, [])
  
  // Stable handlers that use refs
  // r024.75: Pan to uses cached resultsExtent instead of calculating on click
  const handlePanToClick = React.useCallback(async () => {
    const { mapView, resultsExtent } = propsRef.current
    debugLogger.log('DATA-ACTION', { 
      action: 'resultsMenu-panTo-clicked',
      hasExtent: !!resultsExtent,
      hasMapView: !!mapView
    })
    setIsOpen(false)
    
    if (!resultsExtent || !mapView) {
      debugLogger.log('DATA-ACTION', {
        action: 'resultsMenu-panTo-skipped',
        reason: !resultsExtent ? 'no-extent' : 'no-mapView'
      })
      return
    }
    
    // Pan to center of cached extent (no zoom change)
    debugLogger.log('DATA-ACTION', {
      action: 'resultsMenu-panTo-executing',
      center: { x: resultsExtent.center.x, y: resultsExtent.center.y }
    })
    
    await mapView.goTo({
      center: resultsExtent.center
    }, {
      animate: true,
      duration: 500
    })
    
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-panTo-complete' })
  }, [])
  
  const handleViewInTableClick = React.useCallback(async () => {
    const { widgetId, dataSets } = propsRef.current
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-viewInTable-clicked' })
    setIsOpen(false)
    await handleViewInTable(widgetId, dataSets)
  }, [])
  
  const handleSelectOnMapClick = React.useCallback(async () => {
    const { widgetId, outputDS, graphicsLayer, queries } = propsRef.current
    const allRecords = getAllFeatureRecords()
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-selectOnMap-clicked' })
    setIsOpen(false)
    
    if (allRecords.length > 0 && outputDS) {
      await executeSelectOnMap(widgetId, outputDS, allRecords, graphicsLayer, queries)
    }
  }, [getAllFeatureRecords])
  
  // r024.78: Export CSV handler - single file or zip for multiple sources
  // r024.79: Now fetches full attributes via re-query before export
  const handleExportCSVClick = React.useCallback(async () => {
    const { dataSets } = propsRef.current
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-exportCSV-clicked' })
    setIsOpen(false)
    
    const validDataSets = dataSets.filter(ds => ds.records?.length > 0 && ds.dataSource)
    
    if (validDataSets.length === 0) {
      debugLogger.log('DATA-ACTION', {
        action: 'resultsMenu-exportCSV-skipped',
        reason: 'no-valid-datasets'
      })
      return
    }
    
    try {
      if (validDataSets.length === 1) {
        // Single source - direct CSV download with full attributes
        const ds = validDataSets[0]
        const blob = await fetchFullRecordsAndExportCSV(ds.dataSource, ds.records, ds.fields as string[])
        const filename = `${sanitizeFilename(ds.label || ds.name || 'results')}.csv`
        downloadBlob(blob, filename)
        
        debugLogger.log('DATA-ACTION', {
          action: 'resultsMenu-exportCSV-complete',
          type: 'single',
          filename,
          recordsCount: ds.records.length
        })
      } else {
        // Multiple sources - zip file with one CSV per source (each with full attributes)
        const zip = new JSZip()
        
        for (const ds of validDataSets) {
          const blob = await fetchFullRecordsAndExportCSV(ds.dataSource, ds.records, ds.fields as string[])
          const text = await blob.text()
          const filename = `${sanitizeFilename(ds.label || ds.name || ds.dataSource?.id || 'source')}.csv`
          zip.file(filename, text)
          
          debugLogger.log('DATA-ACTION', {
            action: 'resultsMenu-exportCSV-addedToZip',
            filename,
            recordsCount: ds.records.length
          })
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(zipBlob, 'QueryResults.zip')
        
        debugLogger.log('DATA-ACTION', {
          action: 'resultsMenu-exportCSV-complete',
          type: 'zip',
          sourcesCount: validDataSets.length,
          totalRecords: validDataSets.reduce((sum, ds) => sum + ds.records.length, 0)
        })
      }
    } catch (error) {
      debugLogger.log('DATA-ACTION', {
        action: 'resultsMenu-exportCSV-error',
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }, [])
  
  // i18n messages - memoized
  const labels = React.useMemo(() => ({
    panTo: intl.formatMessage({ id: 'panTo', defaultMessage: 'Pan to' }),
    viewInTable: intl.formatMessage({ id: 'viewInTable', defaultMessage: 'View in table' }),
    exportCSV: intl.formatMessage({ id: 'exportCSV', defaultMessage: 'Export CSV' }),
    selectOnMap: intl.formatMessage({ id: 'addToMap', defaultMessage: 'Select on map' }),
    actionsMenu: intl.formatMessage({ id: 'actionsMenu', defaultMessage: 'More actions' })
  }), [intl])
  
  const hasRecords = totalRecords > 0
  const hasMapView = !!mapView
  
  return (
    <div css={menuStyles}>
      <Dropdown 
        isOpen={isOpen} 
        toggle={() => setIsOpen(!isOpen)}
        direction="down"
      >
        <Tooltip title={labels.actionsMenu} placement="bottom">
          <DropdownButton
            className="results-menu-button"
            size="sm"
            type="tertiary"
            icon
            aria-label={labels.actionsMenu}
          >
            <MenuOutlined />
          </DropdownButton>
        </Tooltip>
        <DropdownMenu className="results-menu-dropdown">
          {/* r024.75: Pan to uses cached resultsExtent */}
          <DropdownItem onClick={handlePanToClick} disabled={!resultsExtent || !hasMapView}>
            <HandOutlined className="mr-2" />
            {labels.panTo}
          </DropdownItem>
          
          {TABLE_AVAILABLE && (
            <DropdownItem onClick={handleViewInTableClick} disabled={!hasRecords}>
              <TableOutlined className="mr-2" />
              {labels.viewInTable}
            </DropdownItem>
          )}
          
          {/* r024.78: Export CSV */}
          <DropdownItem onClick={handleExportCSVClick} disabled={!hasRecords}>
            <DownloadOutlined className="mr-2" />
            {labels.exportCSV}
          </DropdownItem>
          
          <DropdownItem onClick={handleSelectOnMapClick} disabled={!hasRecords}>
            <Icon icon={showOnMapIcon} className="mr-2" />
            {labels.selectOnMap}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
