/**
 * Custom "View in Table" data action for QuerySimple widget.
 * 
 * Opens the Table widget with query results. Supports multiple data sources
 * by creating separate tabs for each source in the actionDataSets.
 * 
 * Adapted from Esri's common/table view-in-table data action.
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

// Counter for unique IDs
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
    // Create a JSAPI FeatureLayer from the records
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
    const initTableFields = allFieldsDetails.filter(
      (item: any) => !defaultInvisible.includes(item.jimuName)
    ).map((ele: any) => {
      return { ...ele, visible: true }
    })
    
    const newItemId = `DaTable-${utils.getUUID()}`
    const name = dataSet.label || dataSet.name || dataSource.getLabel() || dataSource.getDataSourceJson()?.sourceLabel || 'Query Results'
    
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
    
    // Clone records for the table
    const copyRecords: any[] = []
    
    // Get full records with all attributes
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
 * Handler function for View in Table action - can be called directly from menu.
 * Handles multiple data sources by creating separate tabs in the Table widget.
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
  
  // Find the Table widget
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
  
  // Filter out empty data sets
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
    
    let firstTabId: string | null = null
    
    // Process each data set and create a tab for it
    for (const dataSet of validDataSets) {
      const result = await createLayerConfigFromDataSet(dataSet, widgetId)
      
      if (result) {
        const { layerConfig, records } = result
        viewInTableObj[layerConfig.id] = { daLayerItem: layerConfig, records }
        
        // Remember the first tab ID to activate it
        if (!firstTabId) {
          firstTabId = layerConfig.id
        }
        
        debugLogger.log('DATA-ACTION', {
          action: 'viewInTable-tabCreated',
          tabId: layerConfig.id,
          tabName: layerConfig.name,
          recordsCount: records.length
        })
      }
    }
    
    if (!firstTabId) {
      debugLogger.log('DATA-ACTION', {
        action: 'viewInTable-handleViewInTable',
        result: false,
        reason: 'Failed to create any table tabs'
      })
      return false
    }
    
    // Update the Table widget's mutable state with all the new tabs
    MutableStoreManager.getInstance().updateStateValue(tableWidgetId, 'viewInTableObj', viewInTableObj)
    
    // Activate the Table widget and open the first tab
    getAppStore().dispatch(
      appActions.widgetStatePropChange(tableWidgetId, 'dataActionActiveObj', {
        activeTabId: firstTabId,
        dataActionTable: true
      })
    )
    
    debugLogger.log('DATA-ACTION', {
      action: 'viewInTable-handleViewInTable',
      result: true,
      tableWidgetId,
      tabsCreated: Object.keys(viewInTableObj).length - Object.keys(originalTableObj).length,
      activeTabId: firstTabId
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
