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
 * load when the table starts empty. We use a tab-switch approach to force
 * re-initialization, falling back to a priming hack only when there's nothing
 * to switch to.
 *
 * ## Tab-Switch Approach (r024.113+)
 *
 * Three scenarios for opening tables, depending on existing Table widget state:
 *
 * **Scenario 1**: Tables already exist in the Table widget
 * - Add all new tabs in bulk with full data
 * - Tab-switch trick: activate last → pivot to existing tab → switch back
 * - The focus change forces destroyTable + re-initialization via use-table.ts
 * - Result: No temporary tabs, no memory leak
 *
 * **Scenario 2**: No existing tables, single new tab
 * - Use priming hack (empty records + fresh ID) — nothing to switch to
 * - One temporary tab created (unavoidable, minimal leak)
 *
 * **Scenario 3**: No existing tables, multiple new tabs
 * - Add all new tabs in bulk with full data
 * - Tab-switch trick: activate last → pivot to first new tab → switch back
 * - Result: No temporary tabs, no memory leak
 *
 * Scenarios 1 and 3 share the same code path. The only difference is the
 * pivot tab selection (existing tab for 1, first new tab for 3).
 *
 * Tab switching uses `settingChangeTab` + `activeTabId` via
 * widgetStatePropChange, which triggers the Table widget's onTabClick
 * (widget.tsx:550-558). This calls destroyTable() in use-table.ts:87-92
 * when the active data source changes, forcing a fresh FeatureTable
 * initialization that properly applies field visibility settings.
 *
 * ## Duplicate Tab Reuse (r024.114+)
 *
 * When the user clicks "View in Table" again on the same results, we compare
 * incoming record ObjectIDs and display fields against existing tabs. If both
 * match, the existing tab is reused (just activated) — no new data source or
 * FeatureLayer is created, eliminating the memory leak from unnecessary
 * recreation. If data has changed, the old tab is deleted and a new one created
 * (current behavior, unavoidable with Table widget architecture).
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
 * - r024.113: Tab-switch approach replacing two-phase render hack
 * - r024.114: Duplicate tab reuse (skip recreation when data unchanged)
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

// ---------------------------------------------------------------------------
// Timing constants for Table widget state updates
// ---------------------------------------------------------------------------
const BULK_ADD_WAIT_MS = 150    // Wait for React to render bulk viewInTableObj update
const TAB_SWITCH_WAIT_MS = 100  // Wait for destroyTable + re-init per tab switch
const PRIMING_WAIT_MS = 100     // Wait for priming tab initialization (scenario 2 only)

/**
 * Programmatically switch the active tab in the Table widget.
 *
 * Uses the settingChangeTab mechanism (Table widget.tsx:550-558) which
 * calls onTabClick internally, triggering destroyTable + re-initialization
 * in use-table.ts:87-92 when the data source changes between tabs.
 */
async function switchActiveTab(tableWidgetId: string, tabId: string): Promise<void> {
  getAppStore().dispatch(
    appActions.widgetStatePropChange(tableWidgetId, 'settingChangeTab', true)
  )
  getAppStore().dispatch(
    appActions.widgetStatePropChange(tableWidgetId, 'activeTabId', tabId)
  )
  await new Promise(resolve => setTimeout(resolve, TAB_SWITCH_WAIT_MS))
}

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
 * Check if an existing tab can be reused for an incoming dataSet.
 * Compares record ObjectIDs (order-independent) and display fields.
 * Returns true if both match — meaning the tab already shows the same data
 * and recreation would just leak memory for no benefit.
 */
function canReuseTab(
  existingTabData: { daLayerItem: LayersConfig; records: any[] },
  incomingDataSet: DataRecordSet
): boolean {
  const existingRecords = existingTabData.records || []
  const incomingRecords = incomingDataSet.records || []

  // Quick check: record count must match
  if (existingRecords.length !== incomingRecords.length) return false

  // Compare ObjectIDs as sets (order-independent)
  const existingIds = new Set(existingRecords.map(r => r.getId?.() ?? r.id))
  const incomingIds = new Set(incomingRecords.map(r => r.getId?.() ?? r.id))
  if (existingIds.size !== incomingIds.size) return false
  for (const id of existingIds) {
    if (!incomingIds.has(id)) return false
  }

  // Compare display fields
  const existingVisibleFields = (existingTabData.daLayerItem.tableFields || [])
    .filter((f: any) => f.visible)
    .map((f: any) => f.jimuName || f.name)
    .sort()
  const incomingFields = ((incomingDataSet.fields as string[]) || []).slice().sort()

  // If incoming has no field restrictions, any visibility is fine (won't change)
  if (incomingFields.length === 0) return true

  // Otherwise fields must match
  if (existingVisibleFields.length !== incomingFields.length) return false
  return existingVisibleFields.every((f, i) => f === incomingFields[i])
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
    
    // =========================================================================
    // DUPLICATE TAB REUSE (r024.114)
    // =========================================================================
    //
    // Before creating new layer configs (which allocate data sources and
    // FeatureLayers), check if existing tabs already show the same data.
    // If so, skip recreation entirely — no new data source, no leak.
    //
    // Phase 1: Categorize each dataSet as "reusable" or "needs creation"
    // Phase 2: Only create layer configs for non-reusable dataSets
    // Phase 3: If ALL reusable, just activate and return early
    // =========================================================================

    const reusableTabIds: string[] = []
    const dataSetsToCreate: DataRecordSet[] = []

    for (const dataSet of validDataSets) {
      const searchAlias = (dataSet as any).searchAlias
      const queryName = (dataSet as any).queryName
      const layerLabel = dataSet.dataSource?.getLabel?.() || 'Results'
      const nameLabel = searchAlias || queryName || layerLabel
      const expectedName = `Query-${nameLabel}`

      // Search for existing tab with this name
      let matchingTabId: string | null = null
      for (const tabId of Object.keys(viewInTableObj)) {
        const tabData = viewInTableObj[tabId]
        if (tabData?.daLayerItem?.name === expectedName) {
          matchingTabId = tabId
          break
        }
      }

      if (matchingTabId && canReuseTab(viewInTableObj[matchingTabId], dataSet)) {
        // Tab already shows the same data — keep it, skip recreation
        reusableTabIds.push(matchingTabId)
        debugLogger.log('VIEW-TABLE', {
          action: 'viewInTable-reusingTab',
          tabId: matchingTabId,
          tabName: expectedName,
          recordCount: dataSet.records?.length || 0
        })
      } else {
        if (matchingTabId) {
          // Tab exists but data changed — delete old tab (current behavior)
          delete viewInTableObj[matchingTabId]
          debugLogger.log('VIEW-TABLE', {
            action: 'viewInTable-removingDuplicateByName',
            tabId: matchingTabId,
            tabName: expectedName,
            message: 'Data changed, removing existing tab for recreation'
          })
        }
        dataSetsToCreate.push(dataSet)
      }
    }

    // If ALL dataSets were reusable, just activate the last one and return.
    // No new data sources, no tab-switch trick, no leak.
    if (dataSetsToCreate.length === 0 && reusableTabIds.length > 0) {
      const lastReusableTabId = reusableTabIds[reusableTabIds.length - 1]

      getAppStore().dispatch(
        appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
          activeTabId: lastReusableTabId,
          dataActionTable: true
        })
      )

      debugLogger.log('DATA-ACTION', {
        action: 'viewInTable-handleViewInTable',
        result: true,
        tableWidgetId,
        tabsReused: reusableTabIds.length,
        tabsCreated: 0,
        activeTabId: lastReusableTabId
      })

      return true
    }

    // Process only non-reusable data sets and create layer configs
    const createdTabs: Array<{ layerConfig: LayersConfig; records: any[] }> = []

    for (const dataSet of dataSetsToCreate) {
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
    // TAB-SWITCH APPROACH (r024.113)
    // =========================================================================
    //
    // PROBLEM: The Table widget has a bug where it doesn't properly apply field
    // visibility settings on first load when the table starts empty.
    //
    // SOLUTION: Use tab switching to force the Table widget to destroy and
    // re-create its internal FeatureTable, which properly applies field
    // visibility on re-initialization. This avoids creating temporary priming
    // tabs (and their associated memory leaks) in most scenarios.
    //
    // Three scenarios:
    //   1. Existing tabs present → pivot to existing tab, switch back (no leak)
    //   2. No existing tabs, single new tab → priming hack (unavoidable leak)
    //   3. No existing tabs, multiple new tabs → pivot to first tab, switch back
    //
    // Scenarios 1 and 3 share the same code path, differing only in pivot
    // tab selection.
    // =========================================================================

    const existingTabIds = Object.keys(viewInTableObj)
    const hasExistingTabs = existingTabIds.length > 0
    const lastTab = createdTabs[createdTabs.length - 1]
    let activeTabId: string

    if (hasExistingTabs || createdTabs.length > 1) {
      // -------------------------------------------------------------------
      // SCENARIOS 1 + 3: Tab-switch approach
      // -------------------------------------------------------------------
      // Add ALL new tabs with full data in one bulk state update, then use
      // tab switching to force field visibility re-initialization on the
      // last tab. No temporary priming tabs needed.
      // -------------------------------------------------------------------

      const bulkTableObj = { ...viewInTableObj }
      for (const { layerConfig, records } of createdTabs) {
        bulkTableObj[layerConfig.id] = { daLayerItem: layerConfig, records }
      }

      MutableStoreManager.getInstance().updateStateValue(
        tableWidgetId, 'viewInTableObj', bulkTableObj
      )

      // Pivot tab: first existing tab (scenario 1) or first new tab (scenario 3)
      const pivotTabId = hasExistingTabs
        ? existingTabIds[0]
        : createdTabs[0].layerConfig.id

      const scenario = hasExistingTabs ? 1 : 3

      // Wait for Table widget to process bulk state update and auto-select
      // the first new tab (via its viewInTableKeyStrings effect, widget.tsx:457-470)
      await new Promise(resolve => setTimeout(resolve, BULK_ADD_WAIT_MS))

      // WHY THREE SWITCHES:
      // The Table widget's FeatureTable bug only affects the ACTIVE tab at the
      // moment of first render. Switching away and back forces use-table.ts:87-92
      // to call destroyTable() (because dataSource.id changes), then re-create
      // a fresh FeatureTable that properly reads the tableFields[].visible flags.
      //
      // 1. Activate last tab    → it renders (possibly with wrong field visibility)
      // 2. Switch to pivot tab  → last tab's FeatureTable is destroyed
      // 3. Switch back to last  → fresh FeatureTable, correct field visibility
      //
      // This replaces the old "priming hack" that created a temporary empty tab,
      // deleted it, and recreated with a fresh UUID — which leaked the temporary
      // tab's data source on every invocation.
      await switchActiveTab(tableWidgetId, lastTab.layerConfig.id)
      await switchActiveTab(tableWidgetId, pivotTabId)
      await switchActiveTab(tableWidgetId, lastTab.layerConfig.id)

      activeTabId = lastTab.layerConfig.id

      debugLogger.log('VIEW-TABLE', {
        action: 'viewInTable-tabSwitch-complete',
        scenario,
        activeTabName: lastTab.layerConfig.name,
        tabsCreated: createdTabs.length,
        totalTabs: Object.keys(bulkTableObj).length,
        pivotTabId
      })

    } else {
      // -------------------------------------------------------------------
      // SCENARIO 2: Single new tab, no existing tabs — priming hack
      // -------------------------------------------------------------------
      // Only case where tab-switch cannot help (nothing to switch to).
      // Create a temporary priming tab with empty records, wait for init,
      // then replace with fresh ID and full records. One unavoidable leak.
      // -------------------------------------------------------------------

      const singleTab = createdTabs[0]

      // Priming: add tab with full schema but empty records
      const primingTableObj = { ...viewInTableObj }
      primingTableObj[singleTab.layerConfig.id] = {
        daLayerItem: singleTab.layerConfig,
        records: []  // Empty — schema only, no data duplication
      }

      MutableStoreManager.getInstance().updateStateValue(
        tableWidgetId, 'viewInTableObj', primingTableObj
      )

      getAppStore().dispatch(
        appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
          activeTabId: singleTab.layerConfig.id,
          dataActionTable: true
        })
      )

      await new Promise(resolve => setTimeout(resolve, PRIMING_WAIT_MS))

      // Replace: delete priming tab, recreate with fresh UUID and full records
      const stateAfterPriming = MutableStoreManager.getInstance()
        .getStateValue([tableWidgetId])?.viewInTableObj || {}
      const finalTableObj = { ...stateAfterPriming }

      delete finalTableObj[singleTab.layerConfig.id]

      const freshId = `DaTable-${utils.getUUID()}`
      const freshConfig = { ...singleTab.layerConfig, id: freshId }
      finalTableObj[freshId] = { daLayerItem: freshConfig, records: singleTab.records }

      MutableStoreManager.getInstance().updateStateValue(
        tableWidgetId, 'viewInTableObj', finalTableObj
      )

      activeTabId = freshId

      debugLogger.log('VIEW-TABLE', {
        action: 'viewInTable-scenario2-complete',
        tabName: singleTab.layerConfig.name,
        freshId,
        primedTabId: singleTab.layerConfig.id
      })
    }

    // Final state dispatch for ExB consistency
    getAppStore().dispatch(
      appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
        activeTabId,
        dataActionTable: true
      })
    )

    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: true,
      tableWidgetId,
      tabsCreated: createdTabs.length,
      tabsReused: reusableTabIds.length,
      scenario: (!hasExistingTabs && createdTabs.length === 1) ? 2 : (hasExistingTabs ? 1 : 3),
      activeTabId
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
