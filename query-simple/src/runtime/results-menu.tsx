/** @jsx jsx */
/**
 * Results Menu Component
 * 
 * Custom hamburger menu for the Results tab that provides a curated set of actions:
 * - Pan to: Centers the map on ALL results without changing zoom (uses cached resultsExtent)
 * - View in table: Opens the Table widget with results (supports multiple sources as tabs)
 * - Export: Submenu with CSV, GeoJSON, JSON formats
 * - Select on map: Selects features on the map (blue outline)
 * 
 * This replaces the DataActionList dropdown with a focused set of custom options.
 * 
 * IMPORTANT: This component is designed to be stable and not recreate on every render.
 * It uses refs for handlers and memoizes expensive computations to avoid memory leaks.
 * 
 * r024.107: Export functionality refactored to use shared utilities in export-utils.ts
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
  type FeatureDataRecord
} from 'jimu-core'
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
import { handleViewInTable, isTableWidgetAvailable } from '../data-actions/view-in-table-action'
import { handleSelectOnMap as executeSelectOnMap } from '../data-actions/add-to-map-action'
import { handleExportFormat } from '../utils/export-utils'

// Custom icon for "Select on map"
const showOnMapIcon = require('./assets/icons/show-on-map.svg')

const debugLogger = createQuerySimpleDebugLogger()

export interface ResultsMenuProps {
  widgetId: string
  dataSets: DataRecordSet[]
  outputDS: DataSource
  mapView?: __esri.MapView | __esri.SceneView
  resultsExtent?: __esri.Extent | null
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
  const [exportMenuOpen, setExportMenuOpen] = React.useState(false)
  
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
  
  // Close both menus
  const closeMenus = React.useCallback(() => {
    setIsOpen(false)
    setExportMenuOpen(false)
  }, [])
  
  // Pan to handler
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
  
  // View in table handler
  const handleViewInTableClick = React.useCallback(async () => {
    const { widgetId, dataSets } = propsRef.current
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-viewInTable-clicked' })
    setIsOpen(false)
    await handleViewInTable(widgetId, dataSets)
  }, [])
  
  // Select on map handler
  const handleSelectOnMapClick = React.useCallback(async () => {
    const { widgetId, outputDS, graphicsLayer, queries } = propsRef.current
    const allRecords = getAllFeatureRecords()
    debugLogger.log('DATA-ACTION', { action: 'resultsMenu-selectOnMap-clicked' })
    setIsOpen(false)
    
    if (allRecords.length > 0 && outputDS) {
      await executeSelectOnMap(widgetId, outputDS, allRecords, graphicsLayer, queries)
    }
  }, [getAllFeatureRecords])
  
  // Export handlers - use shared handleExportFormat
  const handleExportCSVClick = React.useCallback(async () => {
    await handleExportFormat(propsRef.current.dataSets, 'csv', closeMenus)
  }, [closeMenus])
  
  const handleExportGeoJSONClick = React.useCallback(async () => {
    await handleExportFormat(propsRef.current.dataSets, 'geojson', closeMenus)
  }, [closeMenus])
  
  const handleExportJSONClick = React.useCallback(async () => {
    await handleExportFormat(propsRef.current.dataSets, 'json', closeMenus)
  }, [closeMenus])
  
  // i18n messages - memoized
  const labels = React.useMemo(() => ({
    panTo: intl.formatMessage({ id: 'panTo', defaultMessage: 'Pan to' }),
    viewInTable: intl.formatMessage({ id: 'viewInTable', defaultMessage: 'View in table' }),
    export: intl.formatMessage({ id: 'export', defaultMessage: 'Export' }),
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
          {/* Pan to */}
          <DropdownItem onClick={handlePanToClick} disabled={!resultsExtent || !hasMapView}>
            <HandOutlined className="mr-2" />
            {labels.panTo}
          </DropdownItem>
          
          {/* View in table */}
          {TABLE_AVAILABLE && (
            <DropdownItem onClick={handleViewInTableClick} disabled={!hasRecords}>
              <TableOutlined className="mr-2" />
              {labels.viewInTable}
            </DropdownItem>
          )}
          
          {/* Export submenu */}
          <Dropdown 
            direction="right" 
            isSubMenuItem={true}
            isOpen={exportMenuOpen}
            toggle={() => setExportMenuOpen(!exportMenuOpen)}
          >
            <DropdownButton 
              size="sm" 
              type="default" 
              disabled={!hasRecords}
              arrowRight={true}
            >
              <DownloadOutlined className="mr-2" />
              {labels.export}
            </DropdownButton>
            <DropdownMenu>
              <DropdownItem onClick={handleExportCSVClick}>CSV</DropdownItem>
              <DropdownItem onClick={handleExportGeoJSONClick}>GeoJSON</DropdownItem>
              <DropdownItem onClick={handleExportJSONClick}>JSON</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          
          {/* Select on map */}
          <DropdownItem onClick={handleSelectOnMapClick} disabled={!hasRecords}>
            <Icon icon={showOnMapIcon} className="mr-2" />
            {labels.selectOnMap}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  )
}
