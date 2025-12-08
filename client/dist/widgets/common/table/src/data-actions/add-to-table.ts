import {
  AbstractDataAction,
  type DataRecordSet,
  utils,
  getAppStore,
  appActions,
  MutableStoreManager,
  DataSourceTypes,
  type UseDataSource,
  DataSourceStatus,
  DataLevel
} from 'jimu-core'
import { LayerHonorModeType, type LayersConfig, SelectionModeType, TableDataActionType } from '../config'

const supLayerTypes = [DataSourceTypes.FeatureLayer, DataSourceTypes.SceneLayer, DataSourceTypes.BuildingComponentSubLayer,
  DataSourceTypes.OrientedImageryLayer, DataSourceTypes.ImageryLayer]
const temporaryUnsupported = [DataSourceTypes.SubtypeGroupLayer, DataSourceTypes.ImageryTileLayer,
  DataSourceTypes.ElevationLayer]

export default class AddToTable extends AbstractDataAction {

  isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return Promise.resolve(false)
    }
    let isActionSupported = true
    const dataSet = dataSets[0]
    const { dataSource } = dataSet
    if (!Object.keys(dataSource.getSchema() || {}).length ) { // ds without fields
      return Promise.resolve(false)
   }
    const typeIsLayer = supLayerTypes.includes(dataSource.type as any)
    const isDataSourceSet = dataSource.isDataSourceSet()
    const notDataSourceLevel = dataLevel !== DataLevel.DataSource
    const notInConfigAndNotLayer = !dataSource.isInAppConfig() && !typeIsLayer
    const unSupportedType = temporaryUnsupported.includes(dataSource.type as any)
    if (isDataSourceSet || notDataSourceLevel || notInConfigAndNotLayer || unSupportedType) {
      isActionSupported = false
    }
    return Promise.resolve(isActionSupported && dataSource.getStatus() !== DataSourceStatus.NotReady)
  }

  deepClone = (obj: any): any => {
    const isArray = Array.isArray(obj)
    const cloneObj = isArray ? [] : {}
    for (const key in obj) {
      const isObject = (typeof obj[key] === 'object' || typeof obj[key] === 'function') && obj[key] !== null
      cloneObj[key] = isObject ? this.deepClone(obj[key]) : obj[key]
    }
    return cloneObj
  }


  onExecute (dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean> {
    // Open in same sheet
    // this.widgetId is table id, widgetId is initiator widget id
    const appState = getAppStore().getState()
    const appConfig = appState.appConfig
    const initiatorWidget = appConfig?.widgets?.[widgetId]
    const addInSameSheet = initiatorWidget?.dataActions?.addToTable?.config?.isAddInSameSheet
    const isDsLevel = dataLevel === DataLevel.DataSource
    const dataSet = dataSets[0]
    const { dataSource } = dataSet
    const allFields = dataSource && dataSource.getSchema()
    const isRuntimeData = !dataSource.isInAppConfig()
    const defaultInvisible = [
      'CreationDate',
      'Creator',
      'EditDate',
      'Editor',
      'GlobalID'
    ]
    const allFieldsDetails = Object.values(allFields?.fields)
    const initTableFields = allFieldsDetails.filter(
      item => !defaultInvisible.includes(item.jimuName)
    ).map(ele => {
      return { ...ele, visible: true }
    })
    const newItemId = `DaTable-${utils.getUUID()}`
    const name = (isDsLevel ? '' : dataSet.name) || dataSource.getLabel() || dataSource.getDataSourceJson()?.sourceLabel
    const useDataSource = {
      dataSourceId: dataSource.id,
      mainDataSourceId: dataSource.getMainDataSource()?.id,
      dataViewId: dataSource.dataViewId,
      rootDataSourceId: dataSource.getRootDataSource()?.id
    } as UseDataSource
    const daLayerItem: LayersConfig = {
      id: newItemId,
      name: name,
      allFields: allFieldsDetails,
      tableFields: initTableFields,
      enableAttachments: false,
      enableEdit: false,
      allowCsv: false,
      showCount: true,
      enableSearch: false,
      searchFields: [],
      enableRefresh: false,
      enableShowHideColumn: true,
      enableSelect: true,
      enableDelete: false,
      selectMode: SelectionModeType.Multiple,
      layerHonorMode: LayerHonorModeType.Webmap,
      dataActionObject: true,
      dataActionType: TableDataActionType.Add,
      ...(isRuntimeData ? { dataActionDataSource: dataSource } : { useDataSource }),
      dataActionWidgetId: widgetId
    }

    const originalTableObj = MutableStoreManager.getInstance().getStateValue([this.widgetId])?.viewInTableObj || {}
    const viewInTableObj = originalTableObj
    if (addInSameSheet) {
      for (const key in originalTableObj) {
        const curTableLayerItem = originalTableObj[key].daLayerItem
        if (curTableLayerItem.dataActionWidgetId === widgetId && curTableLayerItem.dataActionType === TableDataActionType.Add) {
          delete originalTableObj[key]
        }
      }
    }
    viewInTableObj[newItemId] = { daLayerItem }
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'viewInTableObj', viewInTableObj)

    getAppStore().dispatch(
      appActions.widgetStatePropChange(this.widgetId, 'dataActionActiveObj', { activeTabId: newItemId, dataActionTable: true })
    )
    return Promise.resolve(true)
  }
}
