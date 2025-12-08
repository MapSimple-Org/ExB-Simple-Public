import { JimuFieldType, type FieldSchema, Immutable, DataSourceManager, JSAPILayerTypes } from 'jimu-core'
import { DefaultAddress } from '../constants'
import type { JimuMapView, JimuLayerView } from 'jimu-arcgis'
import { type IMConfig, SourceType, DEFAULT_GEOCODE_KEY, type AddressFields, type DataSourceConfigWithMapCentric, type AllPropsForDataSourceSelector } from '../config'
import { getNewDataSourceConfig, getDsJsonOfOriginDs } from 'jimu-ui/basic/runtime-components'

interface AddressFieldSchemaResult {
  addressFieldsSchema: FieldSchema[]
  defaultAddressFieldName: string
}

interface DataSourceChangeResult {
  changed: boolean
  added?: string[]
  deleted?: string[]
}

export const getNameOfDefaultAddressField = (fields: FieldSchema[], nameIndex = 0): string => {
  let name = DefaultAddress
  fields?.forEach(field => {
    name = nameIndex ? `${name}${nameIndex}` : name
    if (field.jimuName === name) {
      nameIndex += 1
      name = getNameOfDefaultAddressField(fields, nameIndex)
    }
  })
  return name
}

export const getAddressFieldsSchemaAndDefaultFieldName = (addressFields: AddressFields[] = []): AddressFieldSchemaResult => {
  const addressFieldSchema = addressFields?.map(field => {
    return {
      jimuName: field?.alias,
      alias: field?.alias,
      type: JimuFieldType.String,
      name: field?.alias
    }
  })
  const defaultAddressFieldName = getNameOfDefaultAddressField(addressFieldSchema, 0)
  const DefaultAddressSchema = {
    jimuName: defaultAddressFieldName,
    alias: defaultAddressFieldName,
    type: JimuFieldType.String,
    name: defaultAddressFieldName
  }
  addressFieldSchema.unshift(DefaultAddressSchema)
  return {
    addressFieldsSchema: addressFieldSchema,
    defaultAddressFieldName: defaultAddressFieldName
  }
}

export async function getDataSourceConfigWithMapCentric (views: { [viewId: string]: JimuMapView }): Promise<DataSourceConfigWithMapCentric> {
  /**
   * If the layer does not create ds, should create ds first before get DataSourceConfigWithMapCentric
  */
  await createDsByJimuMapViews(views)

  const dataSourceConfigWithMapCentric = {} as DataSourceConfigWithMapCentric
  const promise = Object.keys(views || {}).map(async viewId => {
    const viewItems = views[viewId]
    const enabledLayers = getEnableLayers(viewItems)

    const jimuLayerViewsAndJimuTables = getJimuLayerViewsAndJimuTablesFromJimuMapView(viewItems)
    const jimuLayerViews = jimuLayerViewsAndJimuTables[0]?.jimuLayerViewsOrTable
    const jimuTables = jimuLayerViewsAndJimuTables[1]?.jimuLayerViewsOrTable
    const noLayerView = Object.keys(jimuLayerViews)?.length === 0 && Object.keys(jimuTables)?.length === 0

    let dataSourceConfig = dataSourceConfigWithMapCentric?.[viewId]?.dataSourceConfig
    if (noLayerView || enabledLayers?.length === 0) {
      dataSourceConfigWithMapCentric[viewId] = {
        dataSourceConfig: dataSourceConfigWithMapCentric?.[viewId]?.dataSourceConfig || []
      }
    } else {
      const dsManager = DataSourceManager.getInstance()

      for (let i = 0; i < jimuLayerViewsAndJimuTables.length; i++) {
        const { jimuLayerViewsOrTable, isTable } = jimuLayerViewsAndJimuTables[i]
        for (const id in jimuLayerViewsOrTable || {}) {
          const layerViewOrTable = jimuLayerViewsOrTable[id]

          const tableDsId = isTable ? viewItems.getDataSourceIdByAPILayer(layerViewOrTable as any) : null
          const layerId = isTable ? layerViewOrTable?.id : (layerViewOrTable as JimuLayerView)?.layer?.id
          const layerDs = isTable ? dsManager.getDataSource(tableDsId) : (layerViewOrTable as JimuLayerView)?.getLayerDataSource()

          const dsExist = checkIsDsExist(viewId, layerDs?.id, dataSourceConfigWithMapCentric)

          if (!dsExist && enabledLayers.includes(layerId)) {
            const useDataSource = {
              dataSourceId: layerDs.id,
              mainDataSourceId: layerDs.id,
              dataViewId: layerDs.dataViewId,
              rootDataSourceId: layerDs.getRootDataSource()?.id,
              viewId
            }

            const dsJsonOriginDs = await getDsJsonOfOriginDs(useDataSource)

            const enableLayersInfo = getEnableLayersInfo(viewItems, layerViewOrTable as JimuLayerView, isTable)
            enableLayersInfo.forEach(layerInfo => {
              const field = layerInfo?.field
              const exactMatch = layerInfo?.field?.exactMatch || false
              let label
              if (field?.name) {
                const dsLabel = dsJsonOriginDs?.getLabel()
                label = `${dsLabel}: ${field.name}`
              }
              const option = {
                datasourceConfig: Immutable(dataSourceConfig),
                dsJsonOriginDs: dsJsonOriginDs,
                useDataSource: useDataSource,
                viewId: viewId,
                fieldsInMapSearchProperties: field ? [field] : null,
                exactMatch: exactMatch,
                label: label
              }

              const res = getNewDataSourceConfig(option)
              if (!dataSourceConfigWithMapCentric[viewId]) {
                dataSourceConfigWithMapCentric[viewId] = {}
              }
              dataSourceConfigWithMapCentric[viewId].dataSourceConfig = res.datasourceConfig
              dataSourceConfig = res.datasourceConfig
            })
          }
        }
      }
    }
    return Promise.resolve(dataSourceConfigWithMapCentric)
  })
  await Promise.all(promise)
  return Promise.resolve(dataSourceConfigWithMapCentric)
}

const getSearchApplicationPropertiesOfMap = (view: JimuMapView) => {
  if (!view) return null
  const applicationProperties = (view.view?.map as any)?.applicationProperties || null
  return applicationProperties ? applicationProperties.toJSON()?.viewing?.search : null
}

export const SUPPORTED_JIMU_LAYER_VIEW_TYPES: string[] = [
  JSAPILayerTypes.FeatureLayer,
  JSAPILayerTypes.SceneLayer,
  JSAPILayerTypes.BuildingComponentSublayer,
  JSAPILayerTypes.ImageryTileLayer,
  JSAPILayerTypes.OrientedImageryLayer,
  JSAPILayerTypes.ImageryLayer,
  JSAPILayerTypes.SubtypeGroupLayer,
  JSAPILayerTypes.SubtypeSublayer
]

function isSupportedJimuLayerView (jimuLayerView: JimuLayerView): boolean {
  if (!jimuLayerView || !jimuLayerView.type) {
    return false
  }

  const viewType = jimuLayerView.type

  // Some BuildingComponentSublayer doesn't have layer view, so need to check jimuLayerView.view here.
  // Note, we only check jimuLayerView for BuildingComponentSublayer and don't need to check jimuLayerView.view if layer is not BuildingComponentSublayer because sub feature layer doesn't have layer view.
  const isViewPass = (viewType !== JSAPILayerTypes.BuildingComponentSublayer) || (viewType === JSAPILayerTypes.BuildingComponentSublayer && jimuLayerView.view)
  const isValid = SUPPORTED_JIMU_LAYER_VIEW_TYPES.includes(viewType) && isViewPass
  return !!isValid
}

async function createDsByJimuMapViews (jimuMapViews: { [viewId: string]: JimuMapView }) {
  if (!jimuMapViews) return
  const createDsPromise = []
  Object.keys(jimuMapViews).forEach(viewId => {
    const viewItem = jimuMapViews[viewId]
    const searchProperties = getSearchApplicationPropertiesOfMap(viewItem)
    const layers = searchProperties?.layers || []
    const tables = searchProperties?.tables || []
    const allSearchableTableId = []
    const allSearchableLayerId = []
    tables.forEach(item => {
      if (!allSearchableTableId.includes(item?.id)) {
        allSearchableTableId.push(item?.id)
      }
    })

    layers.forEach(item => {
      if (!allSearchableLayerId.includes(item?.id)) {
        allSearchableLayerId.push(item?.id)
      }
    })

    if (searchProperties?.enabled) {
      const jimuMapView = jimuMapViews[viewId]
      const jimuLayerViews = jimuMapView.jimuLayerViews
      const jimuTables = jimuMapView.jimuTables

      const dsManager = DataSourceManager.getInstance()

      Object.keys(jimuTables).forEach(tableLayerId => {
        const tableLayer = jimuTables[tableLayerId]
        const layerDataSourceId = jimuMapView.getDataSourceIdByAPILayer(tableLayer)
        const tableDs = dsManager.getDataSource(layerDataSourceId)
        const mspDs = jimuMapView.getMapDataSource()
        if (!tableDs && mspDs && allSearchableTableId.includes(tableLayer?.id)) {
          const createDsPromiseItem = createDataSourceByLayer(mspDs, tableLayer)
          createDsPromise.push(createDsPromiseItem)
        }
      })

      Object.keys(jimuLayerViews).forEach(viewId => {
        const jimuLayerView = jimuLayerViews[viewId]
        const layerDs = jimuLayerView.getLayerDataSource()
        if (!layerDs && allSearchableLayerId.includes(jimuLayerView.layer?.id)) {
          const createDsPromiseItem = createLayerDataSource(jimuLayerView)
          createDsPromise.push(createDsPromiseItem)
        }
      })
    }
  })
  return Promise.all(createDsPromise)
}

//When ds creation fails, it should not affect the addition of other table ds
async function createDataSourceByLayer (mspDs, tableLayer): Promise<any> {
  return await mspDs.createDataSourceByLayer(tableLayer).then(ds => {
    return Promise.resolve(ds)
  }, err => {
    return Promise.resolve(null)
  })
}

//When ds creation fails, it should not affect the addition of other layer ds
async function createLayerDataSource (jimuLayerView): Promise<any> {
  return await jimuLayerView.createLayerDataSource().then(ds => {
    return Promise.resolve(ds)
  }, err => {
    return Promise.resolve(null)
  })
}

const getEnableLayers = (view: JimuMapView): string[] => {
  const searchProperties = getSearchApplicationPropertiesOfMap(view)
  if (!searchProperties?.enabled) {
    return []
  }

  const enabledLayers = []

  const dsManager = DataSourceManager.getInstance()

  const jimuLayerViewsAndJimuTables = getJimuLayerViewsAndJimuTablesFromJimuMapView(view)

  jimuLayerViewsAndJimuTables.forEach(item => {
    const { jimuLayerViewsOrTable, isTable } = item
    for (const id in jimuLayerViewsOrTable || {}) {
      const layerViewOrTable = jimuLayerViewsOrTable[id]
      const supportedJimuLayerView = isSupportedJimuLayerView(layerViewOrTable as any)
      if (!supportedJimuLayerView) continue

      const tableDsId = isTable ? view.getDataSourceIdByAPILayer(layerViewOrTable as any) : null
      const layerId = isTable ? layerViewOrTable?.id : (layerViewOrTable as JimuLayerView)?.layer?.id
      const layerDs = isTable ? dsManager.getDataSource(tableDsId) : (layerViewOrTable as JimuLayerView)?.getLayerDataSource()

      const haveUrl = layerDs?.getDataSourceJson()?.url
      if (haveUrl && checkIsHasLayerInfo(layerViewOrTable as JimuLayerView, searchProperties, isTable)) {
        enabledLayers.push(layerId)
      }
    }
  })
  return enabledLayers
}

function checkIsHasLayerInfo(layerViewOrTable: JimuLayerView, searchProperties, isTable: boolean) {
  const layers = searchProperties?.layers || []
  const tables = searchProperties?.tables || []
  const allLayers = layers.concat(tables)
  const layerId = isTable ? layerViewOrTable?.id : layerViewOrTable?.layer?.id
  if (layerViewOrTable?.layer?.type === 'sublayer' && layerViewOrTable?.layer?.parent?.id) {
    const parentId = layerViewOrTable.layer.parent.id
    let isHasLayerInfo = false
    allLayers.forEach(layerInfo => {
      if (layerInfo.id === parentId && layerInfo?.subLayer === layerId) {
        isHasLayerInfo = true
      }
    })
    return isHasLayerInfo
  } else {
    const layers = searchProperties?.layers || []
    const tables = searchProperties?.tables || []
    const allLayers = layers.concat(tables)
    const haveLayerInfoLayers = allLayers.map(layerInfo => layerInfo?.id)
    return haveLayerInfoLayers.includes(layerId)
  }
}

const getJimuLayerViewsAndJimuTablesFromJimuMapView = (view: JimuMapView) => {
  const jimuLayerViews = view?.jimuLayerViews
  const jimuTables = view?.jimuTables
  return [{
    jimuLayerViewsOrTable: jimuLayerViews,
    isTable: false
  }, {
    jimuLayerViewsOrTable: jimuTables,
    isTable: true
  }]
}

const getEnableLayersInfo = (view: JimuMapView, layerViewOrTable: JimuLayerView, isTable: boolean) => {
  const layerId = isTable ? layerViewOrTable?.id : layerViewOrTable?.layer?.id
  const searchProperties = getSearchApplicationPropertiesOfMap(view)
  const layers = searchProperties?.layers || []
  const tables = searchProperties?.tables || []
  const allLayers = layers.concat(tables)
  let layersInfo
  if (layerViewOrTable?.layer?.type === 'sublayer' && layerViewOrTable?.layer?.parent?.id) {
    layersInfo = allLayers.filter(layerInfo => layerInfo?.id === layerViewOrTable.layer.parent.id && layerInfo?.subLayer === layerId) || []
  } else {
    layersInfo = allLayers.filter(layerInfo => layerInfo?.id === layerId) || []
  }
  return layersInfo
}

export function getAllPropsForDataSourceSelectorByJimuMapViews (views: { [viewId: string]: JimuMapView }): AllPropsForDataSourceSelector {
  const allPropsForDataSourceSelector = {}
  // eslint-disable-next-line @typescript-eslint/require-await
  Object.keys(views || {}).forEach(async viewId => {
    const viewItems = views[viewId]
    const jimuLayerViewsAndJimuTables = getJimuLayerViewsAndJimuTablesFromJimuMapView(viewItems)
    const jimuLayerViews = jimuLayerViewsAndJimuTables[0]?.jimuLayerViewsOrTable
    const jimuTables = jimuLayerViewsAndJimuTables[1]?.jimuLayerViewsOrTable
    if (Object.keys(jimuLayerViews)?.length === 0 && Object.keys(jimuTables)?.length === 0) {
      allPropsForDataSourceSelector[viewId] = {
        disableDataView: true,
        fromDsIds: [],
        fromRootDsIds: []
      }
      return allPropsForDataSourceSelector
    } else {
      const fromDsIds = []
      const fromRootDsIds = []
      const dsManager = DataSourceManager.getInstance()
      const propsForDataSourceSelectorItem = {
        disableDataView: true,
        fromDsIds: null,
        fromRootDsIds: null
      }

      for (let i = 0; i < jimuLayerViewsAndJimuTables.length; i++) {
        const { jimuLayerViewsOrTable, isTable } = jimuLayerViewsAndJimuTables[i]
        for (const id in jimuLayerViewsOrTable || {}) {
          const layerViewOrTable = jimuLayerViewsOrTable[id]
          const tableDsId = isTable ? viewItems.getDataSourceIdByAPILayer(layerViewOrTable as any) : null
          const layerDs = isTable ? dsManager.getDataSource(tableDsId) : (layerViewOrTable as JimuLayerView)?.getLayerDataSource()
          const haveUrl = layerDs?.getDataSourceJson()?.url
          if (haveUrl) {
            fromDsIds.push(layerDs.id)
            fromRootDsIds.push(layerDs.getRootDataSource()?.id)
          }
        }
      }
      propsForDataSourceSelectorItem.fromDsIds = fromDsIds
      propsForDataSourceSelectorItem.fromRootDsIds = fromRootDsIds
      allPropsForDataSourceSelector[viewId] = propsForDataSourceSelectorItem
    }
  })
  return allPropsForDataSourceSelector
}

export function getAllDsByMapViews (views: { [viewId: string]: JimuMapView }) {
  const dsList = {}
  Object.keys(views).forEach(viewId => {
    const jimuLayerViews = views[viewId].jimuLayerViews
    const dsItem = dsList?.[viewId] ? dsList[viewId] : []
    for (const layerViewId in jimuLayerViews) {
      const layerDs = jimuLayerViews[layerViewId]?.getLayerDataSource()
      dsItem.push(layerDs.id)
      dsList[viewId] = dsItem
    }
  })
  return dsList
}

function checkIsDsExist (viewId: string, dsId: string, dataSourceConfigWithMapCentric: DataSourceConfigWithMapCentric) {
  const dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric?.[viewId]
  if (!dataSourceConfigItemWithMapCentric) {
    return false
  }
  const currentDsItem = dataSourceConfigItemWithMapCentric?.dataSourceConfig?.filter(item => dsId === item?.useDataSource?.dataSourceId)
  return currentDsItem?.length > 0
}

export function checkIsDsChangedInMap (jimuMapViews: { [viewId: string]: JimuMapView }, config: IMConfig): DataSourceChangeResult {
  if (!config?.sourceType || config.sourceType === SourceType.CustomSearchSources || !jimuMapViews) {
    return {
      changed: false
    }
  } else {
    const dataSourceChangeResult = {
      changed: false,
      added: [],
      deleted: []
    }
    const dataSourceConfigWithMapCentric = config?.dataSourceConfigWithMapCentric || {}
    const allViewIdsInMap = Object.keys(jimuMapViews || {})
    const allViewIdsInSearchConfig = Object.keys(dataSourceConfigWithMapCentric)?.filter(id => !id.includes(DEFAULT_GEOCODE_KEY))

    const addedLayer = allViewIdsInMap?.filter(viewId => !allViewIdsInSearchConfig.includes(viewId))
    const deletedLayer = allViewIdsInSearchConfig?.filter(viewId => !allViewIdsInMap.includes(viewId))
    dataSourceChangeResult.added = addedLayer
    dataSourceChangeResult.deleted = deletedLayer

    if (allViewIdsInMap.length !== allViewIdsInSearchConfig.length || addedLayer.length > 0 || deletedLayer.length > 0) {
      dataSourceChangeResult.changed = true
    }

    return dataSourceChangeResult
  }
}

export async function getActiveDataSourceConfig (jimuMapView: JimuMapView, config: IMConfig, defaultGeocodeConfigs) {
  const activeViewId = jimuMapView?.id
  if (config?.sourceType === SourceType.MapCentric) {
    const dataSourceConfigWithMapCentric = config?.dataSourceConfigWithMapCentric || {}
    const allViewIds = Object.keys(dataSourceConfigWithMapCentric) || []
    let dataSourceConfigItemWithMapCentric
    if (allViewIds.includes(activeViewId)) {
      dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric?.[activeViewId]
    } else if (allViewIds?.length > 0) {
      dataSourceConfigItemWithMapCentric = dataSourceConfigWithMapCentric?.[allViewIds[0]]
    }
    const synchronizeSettings = dataSourceConfigItemWithMapCentric?.synchronizeSettings
    if (synchronizeSettings === false) {
      return Promise.resolve(Immutable(dataSourceConfigItemWithMapCentric?.dataSourceConfig))
    } else {
      const views = {}
      views[jimuMapView.id] = jimuMapView
      return getDataSourceConfigWithMapCentric(views).then(newDataSourceConfigWithMapCentric => {
        let dataSourceConfig = newDataSourceConfigWithMapCentric?.[activeViewId]?.dataSourceConfig || []
        const defaultGeocodeConfig = defaultGeocodeConfigs || []
        dataSourceConfig = dataSourceConfig.concat(defaultGeocodeConfig)
        return Promise.resolve(Immutable(dataSourceConfig))
      }, err => {
        return Promise.resolve(Immutable(defaultGeocodeConfigs))
      })
    }
  } else {
    return Promise.resolve(config?.datasourceConfig)
  }
}
