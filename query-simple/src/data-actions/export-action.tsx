/**
 * Export data action for QuerySimple widget.
 * 
 * Leverages Esri's built-in export data actions (CSV, GeoJSON, JSON, Shapefile, GDB, KML)
 * to provide export functionality through the hamburger menu.
 */

import { 
  type DataRecordSet, 
  DataLevel, 
  DataActionManager,
  type DataAction
} from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Export format types supported by Esri's built-in actions.
 * Local formats download directly, server formats require portal authentication.
 */
export type ExportFormat = 'csv' | 'geojson' | 'json' | 'shapefile' | 'gdb' | 'kml'

/**
 * Export format metadata for UI display.
 */
export interface ExportFormatInfo {
  id: ExportFormat
  label: string
  actionName: string
  isServerSide: boolean
}

/**
 * All available export formats with their metadata.
 */
export const EXPORT_FORMATS: ExportFormatInfo[] = [
  { id: 'csv', label: 'CSV', actionName: 'ExportCSV', isServerSide: false },
  { id: 'geojson', label: 'GeoJSON', actionName: 'ExportGeoJson', isServerSide: false },
  { id: 'json', label: 'JSON', actionName: 'ExportJson', isServerSide: false },
  { id: 'shapefile', label: 'Shapefile', actionName: 'ExportShp', isServerSide: true },
  { id: 'gdb', label: 'File Geodatabase', actionName: 'ExportGDB', isServerSide: true },
  { id: 'kml', label: 'KML', actionName: 'ExportKML', isServerSide: true }
]

/**
 * Gets the list of supported export actions for the given data sets.
 * Filters to only return export-related actions.
 */
export async function getSupportedExportActions(
  widgetId: string,
  dataSets: DataRecordSet[],
  dataLevel: DataLevel = DataLevel.Records
): Promise<DataAction[]> {
  const actionManager = DataActionManager.getInstance()
  
  try {
    const supportedActions = await actionManager.getSupportedActions(
      widgetId,
      dataSets,
      dataLevel
    )
    
    const exportActions: DataAction[] = []
    
    // Flatten the grouped actions and filter for export actions
    Object.values(supportedActions).forEach(actionGroup => {
      actionGroup.forEach(action => {
        // Check if this is an export action by name
        const isExportAction = EXPORT_FORMATS.some(
          format => action.name === format.actionName || action.id?.includes(format.actionName)
        )
        if (isExportAction) {
          exportActions.push(action)
        }
      })
    })
    
    debugLogger.log('DATA-ACTION', {
      action: 'export-getSupportedActions',
      supportedCount: exportActions.length,
      actions: exportActions.map(a => a.name)
    })
    
    return exportActions
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: 'export-getSupportedActions',
      error: error instanceof Error ? error.message : String(error)
    })
    return []
  }
}

/**
 * Executes an export action by name.
 * Searches for the action by checking multiple possible name/id patterns.
 */
export async function executeExportAction(
  widgetId: string,
  dataSets: DataRecordSet[],
  actionName: string,
  dataLevel: DataLevel = DataLevel.Records
): Promise<boolean | React.ReactElement> {
  const actionManager = DataActionManager.getInstance()
  
  try {
    // Get all supported actions
    const supportedActions = await actionManager.getSupportedActions(
      widgetId,
      dataSets,
      dataLevel
    )
    
    // Log all available actions for debugging
    const allActions: { name: string; id: string; label: string }[] = []
    Object.values(supportedActions).forEach(actionGroup => {
      actionGroup.forEach(action => {
        allActions.push({ name: action.name, id: action.id, label: action.label })
      })
    })
    
    debugLogger.log('DATA-ACTION', {
      action: 'export-executeAction-searching',
      actionName,
      availableActions: allActions,
      dataSetsCount: dataSets.length
    })
    
    // Find the specific export action - check multiple patterns
    let targetAction: DataAction | undefined
    
    Object.values(supportedActions).forEach(actionGroup => {
      actionGroup.forEach(action => {
        // Check various patterns: exact name, id contains name, label matches
        const nameMatches = action.name === actionName || 
                          action.name?.toLowerCase() === actionName.toLowerCase()
        const idMatches = action.id?.includes(actionName) || 
                         action.id?.toLowerCase().includes(actionName.toLowerCase())
        const labelMatches = action.label?.toLowerCase().includes(actionName.toLowerCase().replace('export', ''))
        
        if (nameMatches || idMatches) {
          targetAction = action
        }
      })
    })
    
    if (!targetAction) {
      debugLogger.log('DATA-ACTION', {
        action: 'export-executeAction',
        actionName,
        result: false,
        reason: 'Action not found or not supported',
        searchedFor: actionName,
        availableCount: allActions.length
      })
      return false
    }
    
    debugLogger.log('DATA-ACTION', {
      action: 'export-executeAction',
      actionName,
      foundAction: { name: targetAction.name, id: targetAction.id, label: targetAction.label },
      dataSetsCount: dataSets.length,
      recordsCount: dataSets.reduce((sum, ds) => sum + (ds.records?.length || 0), 0)
    })
    
    // Execute the action
    const result = await actionManager.executeDataAction(
      targetAction,
      dataSets,
      dataLevel,
      widgetId
    )
    
    debugLogger.log('DATA-ACTION', {
      action: 'export-executeAction',
      actionName,
      result: typeof result === 'boolean' ? result : 'ReactElement'
    })
    
    return result
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: 'export-executeAction',
      actionName,
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

/**
 * Handler function for export - executes a specific export format.
 */
export async function handleExport(
  widgetId: string,
  dataSets: DataRecordSet[],
  format: ExportFormat
): Promise<boolean | React.ReactElement> {
  const formatInfo = EXPORT_FORMATS.find(f => f.id === format)
  
  if (!formatInfo) {
    debugLogger.log('DATA-ACTION', {
      action: 'export-handleExport',
      format,
      result: false,
      reason: 'Unknown format'
    })
    return false
  }
  
  // Validate we have records to export
  const totalRecords = dataSets.reduce((sum, ds) => sum + (ds.records?.length || 0), 0)
  if (totalRecords === 0) {
    debugLogger.log('DATA-ACTION', {
      action: 'export-handleExport',
      format,
      result: false,
      reason: 'No records to export'
    })
    return false
  }
  
  debugLogger.log('DATA-ACTION', {
    action: 'export-handleExport',
    format,
    formatLabel: formatInfo.label,
    isServerSide: formatInfo.isServerSide,
    recordsCount: totalRecords
  })
  
  return executeExportAction(widgetId, dataSets, formatInfo.actionName)
}

/**
 * Checks if any export actions are available for the given data sets.
 */
export async function isExportAvailable(
  widgetId: string,
  dataSets: DataRecordSet[]
): Promise<boolean> {
  const exportActions = await getSupportedExportActions(widgetId, dataSets)
  return exportActions.length > 0
}

/**
 * Gets the list of available export formats for the given data sets.
 * Returns format info for formats that have supported actions.
 */
export async function getAvailableExportFormats(
  widgetId: string,
  dataSets: DataRecordSet[]
): Promise<ExportFormatInfo[]> {
  const exportActions = await getSupportedExportActions(widgetId, dataSets)
  const actionNames = new Set(exportActions.map(a => a.name))
  
  return EXPORT_FORMATS.filter(format => 
    actionNames.has(format.actionName) || 
    exportActions.some(a => a.id?.includes(format.actionName))
  )
}
