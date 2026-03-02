/**
 * Custom "View in Table" data action for QuerySimple widget.
 * 
 * Opens the Table widget with query results. Supports multiple data sources
 * by creating separate tabs for each source in the actionDataSets.
 * 
 * Adapted from Esri's common/table view-in-table data action.
 * 
 * ## Architecture Overview
 * 
 * This module handles opening query results in the ExB Table widget. The Table
 * widget has a bug where field visibility settings are not applied on first
 * load when the table is empty. To work around this, we use a "two-phase 
 * render hack" that primes the Table widget before adding the real data.
 * 
 * ## Two-Phase Render Hack (r024.93+)
 * 
 * When opening multiple tables, only the LAST tab needs the two-phase hack.
 * Earlier tabs initialize properly because the Table widget is already active.
 * 
 * **Phase A**: Add non-last tabs directly with full data (no hack needed)
 * **Phase B1**: Add priming version of last tab (full schema, EMPTY records)
 * **Phase B2**: Delete priming tab, recreate with fresh ID and full records
 * 
 * The priming tab uses empty records to minimize memory footprint. The Table
 * widget needs the full field schema to initialize column definitions, but
 * the actual record data is not needed until Phase B2.
 * 
 * ## Memory Management (r024.100+)
 * 
 * After analyzing Esri's Table widget source code, we found that Esri does NOT
 * call destroyDataSource() when closing tabs. They simply delete the tab entry
 * from viewInTableObj and let the ExB framework handle cleanup.
 * 
 * We align with this pattern. Explicit destroyDataSource() calls were tested
 * (r024.98-99) but had no effect on memory growth. Memory behavior is identical
 * whether we destroy data sources or not. This appears to be ExB framework
 * behavior, not something fixable at the widget level.
 * 
 * ## Version History
 * - r024.83: Tab naming (Query-{searchAlias})
 * - r024.87: Field visibility from popup template
 * - r024.93: Two-phase render hack for empty table bug
 * - r024.96: Sequential tab addition for 3+ tables
 * - r024.100: Aligned with Esri patterns (no destroyDataSource)
 * - r024.104: Empty records for priming tab (memory optimization)
 * 
 * @see docs/bugs/VIEW_IN_TABLE_NAMING_VISIBILITY.md for full documentation
 */

import {
  type DataRecordSet,
  utils,
  getAppStore,
  appActions,
  MutableStoreManager,
  DataSourceTypes,
  type UseDataSource,
  CONSTANTS,
  type FeatureLayerDataSource,
  type QueryParams,
  type QueriableDataSource,
  DataSourceManager,
  Immutable,
  dataSourceUtils,
  type FeatureDataRecord
} from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

const { SELECTION_DATA_VIEW_ID } = CONSTANTS

// Counter for unique IDs (matches Esri's pattern)
let viewTableId = 0

// LayersConfig type from Table widget (simplified)
interface LayersConfig {
  id: string
  name: string
  allFields: any[]
  tableFields: any[]
  enableAttachments: boolean
  enableEdit: boolean
  allowCsv: boolean
  showCount: boolean
  enableSearch: boolean
  searchFields: string[]
  enableRefresh: boolean
  enableShowHideColumn: boolean
  enableSelect: boolean
  enableDelete: boolean
  selectMode: string
  layerHonorMode: string
  dataActionObject: boolean
  dataActionType: string
  useDataSource?: UseDataSource
  dataActionDataSource?: any
  dataActionWidgetId: string
}

/**
 * Finds the first Table widget in the app configuration.
 */
function findTableWidgetId(): string | null {
  const appState = getAppStore().getState()
  const appConfig = appState.appConfig
  const widgets = appConfig?.widgets || {}
  
  for (const widgetId of Object.keys(widgets)) {
    const widget = widgets[widgetId]
    if (widget.uri === 'widgets/common/table/') {
      debugLogger.log('DATA-ACTION', {
        action: 'viewInTable-findTableWidget',
        found: true,
        tableWidgetId: widgetId
      })
      return widgetId
    }
  }
  
  debugLogger.log('DATA-ACTION', {
    action: 'viewInTable-findTableWidget',
    found: false,
    message: 'No Table widget found in app config'
  })
  return null
}

/**
 * Creates a layer config for the Table widget from a DataRecordSet.
 * Follows Esri's pattern from view-in-table.ts
 */
async function createLayerConfigFromDataSet(
  dataSet: DataRecordSet,
  initiatorWidgetId: string
): Promise<{ layerConfig: LayersConfig; records: any[] } | null> {
  const { dataSource: dataSourceUsed, records } = dataSet
  
  if (!dataSourceUsed || !records || records.length === 0) {
    return null
  }
  
  viewTableId++
  const newDsId = `${dataSourceUsed.id}-${initiatorWidgetId}-view_in_table-${viewTableId}`
  const newSourceLabel = `${(dataSourceUsed as any).belongToDataSource?.getDataSourceJson?.()?.sourceLabel || dataSourceUsed.id}-${viewTableId}`
  
  try {
    // Create a JSAPI FeatureLayer from the records (Esri's pattern)
    const dataActionLayer = await dataSourceUtils.createJSAPIFeatureLayerByRecords(
      dataSourceUsed as any,
      records as FeatureDataRecord[]
    )
    const resLayer = dataActionLayer?.layer
    
    if (!resLayer) {
      debugLogger.log('DATA-ACTION', {
        action: 'viewInTable-createLayerConfig',
        error: 'Failed to create JSAPI layer',
        dataSourceId: dataSourceUsed.id
      })
      return null
    }
    
    const layerDsJson = Immutable({
      id: newDsId,
      type: DataSourceTypes.FeatureLayer,
      sourceLabel: newSourceLabel,
      disableExport: false
    })
    
    const layerDsOption = {
      id: newDsId,
      dataSourceJson: layerDsJson,
      layer: resLayer
    }
    
    const dsManager = DataSourceManager.getInstance()
    const dataSource = await dsManager.createDataSource(layerDsOption)
    const allFields = dataSource && dataSource.getSchema()
    const isRuntimeData = !dataSource.isInAppConfig()
    
    const defaultInvisible = [
      'CreationDate',
      'Creator',
      'EditDate',
      'Editor',
      'GlobalID'
    ]
    
    const allFieldsDetails = Object.values(allFields?.fields || {})
    
    // Use dataSet.fields for visibility if configured
    const displayFields = dataSet.fields as string[] | undefined
    
    debugLogger.log('VIEW-TABLE', {
      action: 'createLayerConfig-fieldVisibility',
      dataSourceId: dataSourceUsed.id,
      displayFieldsFromDataSet: displayFields || 'none',
      displayFieldsCount: displayFields?.length || 0,
      allFieldsCount: allFieldsDetails.length
    })
    
    const initTableFields = allFieldsDetails.filter(
      (item: any) => !defaultInvisible.includes(item.jimuName)
    ).map((ele: any) => {
      const isVisible = displayFields?.length > 0
        ? displayFields.includes(ele.jimuName) || displayFields.includes(ele.name)
        : true
      return { ...ele, visible: isVisible }
    })
    
    const newItemId = `DaTable-${utils.getUUID()}`
    
    // Build table name as Query-{searchAlias} or Query-{queryName}
    const searchAlias = (dataSet as any).searchAlias
    const queryName = (dataSet as any).queryName
    const layerLabel = dataSource.getLabel() || dataSource.getDataSourceJson()?.sourceLabel || 'Results'
    const nameLabel = searchAlias || queryName || layerLabel
    const name = `Query-${nameLabel}`
    
    const useDataSource = {
      dataSourceId: dataSource.getMainDataSource()?.getDataView(SELECTION_DATA_VIEW_ID)?.id,
      mainDataSourceId: dataSource.getMainDataSource()?.id,
      dataViewId: (dataSource as any).dataViewId,
      rootDataSourceId: dataSource.getRootDataSource()?.id
    } as UseDataSource
    
    const layerConfig: LayersConfig = {
      id: newItemId,
      name: name,
      allFields: allFieldsDetails as any[],
      tableFields: initTableFields as any[],
      enableAttachments: false,
      enableEdit: false,
      allowCsv: true,
      showCount: true,
      enableSearch: false,
      searchFields: [],
      enableRefresh: false,
      enableShowHideColumn: true,
      enableSelect: true,
      enableDelete: false,
      selectMode: 'Multiple',
      layerHonorMode: 'Webmap',
      dataActionObject: true,
      dataActionType: 'View',
      ...(isRuntimeData ? { dataActionDataSource: dataSource } : { useDataSource }),
      dataActionWidgetId: initiatorWidgetId
    }
    
    // Clone records for the table (Esri's pattern)
    const copyRecords: any[] = []
    
    const queriableDs = dataSource as QueriableDataSource
    const isOutput = queriableDs?.getDataSourceJson?.()?.isOutputFromWidget
    let fullRecords: any[]
    
    if (isOutput) {
      fullRecords = records
    } else {
      const objectIdField =
        (dataSource as FeatureLayerDataSource)?.getLayerDefinition?.()?.objectIdField ||
        (dataSource as any)?.layer?.objectIdField ||
        'OBJECTID'
      const recordsQuery = records && records.length > 0
        ? `${objectIdField} IN (${records.map(item => item.getId()).join()})`
        : ''
      
      try {
        const result = await (dataSourceUsed as QueriableDataSource).query({
          where: recordsQuery,
          returnGeometry: true,
          notAddFieldsToClient: true,
          outFields: ['*']
        } as QueryParams)
        fullRecords = result?.records || records
      } catch {
        fullRecords = records
      }
    }
    
    fullRecords.forEach(record => {
      if (record.clone) {
        copyRecords.push(record.clone(true))
      } else {
        copyRecords.push(record)
      }
    })
    
    return { layerConfig, records: copyRecords }
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-createLayerConfig',
      error: error instanceof Error ? error.message : String(error),
      dataSourceId: dataSourceUsed.id
    })
    return null
  }
}

/**
 * Handler function for View in Table action.
 * Handles multiple data sources by creating separate tabs in the Table widget.
 * 
 * r024.100: Simplified to match Esri's patterns:
 * - Tab removal via simple delete (like Esri's onCloseTab)
 * - No explicit destroyDataSource calls
 * - Let ExB framework handle cleanup
 */
export async function handleViewInTable(
  widgetId: string,
  dataSets: DataRecordSet[]
): Promise<boolean> {
  debugLogger.log('DATA-ACTION', {
    action: 'viewInTable-handleViewInTable',
    widgetId,
    dataSetsCount: dataSets?.length || 0
  })
  
  const tableWidgetId = findTableWidgetId()
  if (!tableWidgetId) {
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: false,
      reason: 'No Table widget found in app'
    })
    return false
  }
  
  if (!dataSets || dataSets.length === 0) {
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: false,
      reason: 'No data sets provided'
    })
    return false
  }
  
  const validDataSets = dataSets.filter(ds => ds.records && ds.records.length > 0)
  
  if (validDataSets.length === 0) {
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: false,
      reason: 'No valid data sets with records'
    })
    return false
  }
  
  try {
    // Get existing viewInTableObj from the Table widget
    const originalTableObj = MutableStoreManager.getInstance().getStateValue([tableWidgetId])?.viewInTableObj || {}
    const viewInTableObj = { ...originalTableObj }
    
    // Build expected tab names for duplicate detection
    const expectedTabNames = validDataSets.map(dataSet => {
      const searchAlias = (dataSet as any).searchAlias
      const queryName = (dataSet as any).queryName
      const layerLabel = dataSet.dataSource?.getLabel?.() || 'Results'
      const nameLabel = searchAlias || queryName || layerLabel
      return `Query-${nameLabel}`
    })
    
    debugLogger.log('VIEW-TABLE', {
      action: 'viewInTable-checkingDuplicates',
      expectedTabNames,
      existingTabCount: Object.keys(viewInTableObj).length
    })
    
    // Remove existing tabs with matching names (Esri's pattern: simple delete)
    // This matches how Esri's Table widget handles viewInSameSheet
    for (const tabId of Object.keys(viewInTableObj)) {
      const tabData = viewInTableObj[tabId]
      const tabName = tabData?.daLayerItem?.name
      if (tabName && expectedTabNames.includes(tabName)) {
        delete viewInTableObj[tabId]
        debugLogger.log('VIEW-TABLE', {
          action: 'viewInTable-removingDuplicateByName',
          tabId,
          tabName,
          message: 'Removing existing tab with same name (Esri pattern)'
        })
      }
    }
    
    // Process each data set and create layer configs
    const createdTabs: Array<{ layerConfig: LayersConfig; records: any[] }> = []
    
    for (const dataSet of validDataSets) {
      const result = await createLayerConfigFromDataSet(dataSet, widgetId)
      
      if (result) {
        createdTabs.push(result)
        debugLogger.log('DATA-ACTION', {
          action: 'viewInTable-tabCreated',
          tabId: result.layerConfig.id,
          tabName: result.layerConfig.name,
          recordsCount: result.records.length
        })
      }
    }
    
    if (createdTabs.length === 0) {
      debugLogger.log('DATA-ACTION', {
        action: 'viewInTable-handleViewInTable',
        result: false,
        reason: 'Failed to create any table tabs'
      })
      return false
    }
    
    // =========================================================================
    // TWO-PHASE RENDER HACK
    // =========================================================================
    // 
    // PROBLEM: The Table widget has a bug where it doesn't properly apply field
    // visibility settings on first load when the table starts empty.
    // 
    // SOLUTION: Prime the Table widget with a temporary tab, wait for it to
    // initialize, then delete and recreate with a fresh ID. This forces the
    // Table widget's destroyTable() method to run, which properly resets state.
    // 
    // OPTIMIZATION: Only the LAST tab needs this hack. Earlier tabs initialize
    // properly because the Table widget is already rendering by the time they
    // are added. This means for N tables, we only create 1 extra temporary tab,
    // not N extra tabs.
    // 
    // MEMORY: The priming tab uses empty records (full schema only) to minimize
    // memory footprint. The schema is needed so the Table widget can initialize
    // its column definitions, but we don't need to duplicate the actual data.
    // =========================================================================
    
    const lastTabIndex = createdTabs.length - 1
    const lastTab = createdTabs[lastTabIndex]
    const nonLastTabs = createdTabs.slice(0, lastTabIndex)
    
    let baseTableObj = { ...viewInTableObj }
    
    debugLogger.log('VIEW-TABLE', {
      action: 'viewInTable-baseTableObj',
      existingTabNames: Object.values(baseTableObj).map((t: any) => t?.daLayerItem?.name),
      tabCount: Object.keys(baseTableObj).length
    })
    
    // -------------------------------------------------------------------------
    // PHASE A: Add non-last tabs directly (no hack needed)
    // -------------------------------------------------------------------------
    // These tabs initialize properly because the Table widget is already active.
    // Add them one at a time with 50ms pauses to let each fully initialize
    // before adding the next. This prevents initialization conflicts.
    // -------------------------------------------------------------------------
    if (nonLastTabs.length > 0) {
      for (const { layerConfig, records } of nonLastTabs) {
        baseTableObj[layerConfig.id] = { daLayerItem: layerConfig, records }
        
        MutableStoreManager.getInstance().updateStateValue(tableWidgetId, 'viewInTableObj', { ...baseTableObj })
        
        debugLogger.log('VIEW-TABLE', {
          action: 'viewInTable-addingTab',
          tabName: layerConfig.name,
          totalTabsSoFar: Object.keys(baseTableObj).length
        })
        
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Re-read state after all tabs added (Table widget may have modified it)
      baseTableObj = MutableStoreManager.getInstance().getStateValue([tableWidgetId])?.viewInTableObj || baseTableObj
    }
    
    // -------------------------------------------------------------------------
    // PHASE B1: Add priming version of last tab
    // -------------------------------------------------------------------------
    // Create a temporary tab with:
    //   - Full schema (field definitions) - needed for column initialization
    //   - Empty records array - minimizes memory footprint
    // 
    // This priming tab is never visible to the user. It exists only to force
    // the Table widget to initialize its internal state.
    // -------------------------------------------------------------------------
    const primingTableObj = { ...baseTableObj }
    primingTableObj[lastTab.layerConfig.id] = { 
      daLayerItem: lastTab.layerConfig, 
      records: []  // Empty - schema only, no data duplication
    }
    
    MutableStoreManager.getInstance().updateStateValue(tableWidgetId, 'viewInTableObj', primingTableObj)
    
    getAppStore().dispatch(
      appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
        activeTabId: lastTab.layerConfig.id,
        dataActionTable: true
      })
    )
    
    const existingTabCount = Object.keys(baseTableObj).length
    const primingWaitMs = 100 + (existingTabCount * 50)
    
    debugLogger.log('VIEW-TABLE', {
      action: 'viewInTable-phaseB1-priming',
      activeTabName: lastTab.layerConfig.name,
      tabCount: createdTabs.length,
      existingTabCount,
      primingWaitMs
    })
    
    await new Promise(resolve => setTimeout(resolve, primingWaitMs))
    
    // -------------------------------------------------------------------------
    // PHASE B2: Delete priming tab and recreate with fresh ID
    // -------------------------------------------------------------------------
    // 1. Delete the priming tab (triggers Table widget's destroyTable cleanup)
    // 2. Create a new tab with a fresh UUID (forces full re-initialization)
    // 3. This new tab gets the FULL records - this is the tab the user sees
    // 
    // The fresh ID is critical. Reusing the same ID would cause the Table
    // widget to treat it as an update rather than a new tab, bypassing the
    // initialization we need.
    // 
    // Delete pattern matches Esri's onCloseTab - simple object delete.
    // -------------------------------------------------------------------------
    const stateAfterPriming = MutableStoreManager.getInstance().getStateValue([tableWidgetId])?.viewInTableObj || {}
    const finalTableObj = { ...stateAfterPriming }
    
    delete finalTableObj[lastTab.layerConfig.id]
    
    const freshId = `DaTable-${utils.getUUID()}`
    const freshConfig = { ...lastTab.layerConfig, id: freshId }
    finalTableObj[freshId] = { daLayerItem: freshConfig, records: lastTab.records }
    
    MutableStoreManager.getInstance().updateStateValue(tableWidgetId, 'viewInTableObj', finalTableObj)
    
    getAppStore().dispatch(
      appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
        activeTabId: freshId,
        dataActionTable: true
      })
    )
    
    debugLogger.log('VIEW-TABLE', {
      action: 'viewInTable-phaseB2-final',
      activeTabName: lastTab.layerConfig.name,
      tabCount: createdTabs.length
    })
    
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: true,
      tableWidgetId,
      tabsCreated: createdTabs.length,
      activeTabId: freshId
    })
    
    return true
  } catch (error) {
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: false,
      error: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

/**
 * Checks if a Table widget exists in the app.
 */
export function isTableWidgetAvailable(): boolean {
  return findTableWidgetId() !== null
}
