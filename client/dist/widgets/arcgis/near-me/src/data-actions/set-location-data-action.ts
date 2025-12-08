import { AbstractDataAction, type DataRecordSet, MutableStoreManager, DataLevel, DataSourceStatus, type DataSource, type JSAPILayerMixin, getAppStore, AllDataSourceTypes } from 'jimu-core'
import { getCompleteGeometries } from '../common/utils'

export default class SetLocationDataAction extends AbstractDataAction {
  supportProviderWidget = true
  async isSupported (dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return Promise.resolve(false)
    }

    const dataSet = dataSets[0]
    const dataSource = dataSet.dataSource as DataSource & JSAPILayerMixin

    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]

    const configInfo = widgetJson.config?.configInfo
    if (!configInfo || Object.keys(configInfo).length === 0) {
      return Promise.resolve(false)
    }

    let activeConfiguredDataSource = appConfig?.widgets?.[widgetJson.useMapWidgetIds?.[0]]?.config?.initialMapDataSourceID
    //when map is added first time and have only one webmap initialMapDataSourceID is not available
    //in this case try to fetch the active data source id form configInfo
    if (!activeConfiguredDataSource) {
      activeConfiguredDataSource = Object.keys(configInfo)[0]
    }
    const configSettings = widgetJson.config?.configInfo?.[activeConfiguredDataSource]

    const checkForConfiguredAnalysis = configSettings?.analysisSettings?.layersInfo?.length > 0
    //disable data action when no analysis layers are configured
    if (!checkForConfiguredAnalysis) {
      return Promise.resolve(false)
    }

    const checkForSearchActiveMapArea = configSettings?.searchSettings?.searchByActiveMapArea
    //Disable data action Set location option when search method is set to Current map area
    if (checkForSearchActiveMapArea) {
      return Promise.resolve(false)
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return Promise.resolve(false)
    }

    // records may come from a table, so we need to check if the dataSource has geometry or not
    const supportSpatialInfo = dataSource?.supportSpatialInfo && dataSource?.supportSpatialInfo()
    if (!supportSpatialInfo) {
      return Promise.resolve(false)
    }

    //accept selected records/current features from pupup only
    if ((dataSet.records.length > 0 && dataLevel === DataLevel.Records && (dataSet.type === 'current' || dataSet.type === 'selected')) ||
     (dataLevel === DataLevel.DataSource && ([AllDataSourceTypes.FeatureLayer].includes(dataSet.dataSource.type as any) ||
     [AllDataSourceTypes.SubtypeSublayer].includes(dataSet.dataSource.type as any)))) {
      return Promise.resolve(true)
    }

    return Promise.resolve(false)
  }

  //on selection of the features in other widgets get the data record set by execute method
  //data record set consists of the features which will be used for getting the incident geometry
  async onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean> {
    const dataSet = dataSets[0]
    const { records, dataSource } = dataSet
    const geometriesByDsId = {}
    const incompleteGeometriesIds = {}
    let spatialRef
    let dsID: string = ''

    if (dataLevel === DataLevel.DataSource) {
      MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedDataSource', dataSource)
    } else {
      if (records?.length > 0) {
        //group geometries by datasource ids
        records.forEach((eachRecord: any) => {
          //get the spatial reference of the feature geometry
          if (!spatialRef) {
            spatialRef = eachRecord.feature.geometry.spatialReference.toJSON()
          }
          dsID = eachRecord?.dataSource?.id
          if (!geometriesByDsId[dsID]) {
            geometriesByDsId[dsID] = []
          }
          //check if the feature having the full geometry
          if (eachRecord.hasFullGeometry) {
            geometriesByDsId[dsID].push(eachRecord.feature.geometry)
          } else { //if incomplete geometry then push the each records id
            if (!incompleteGeometriesIds[dsID]) {
              incompleteGeometriesIds[dsID] = []
            }
            incompleteGeometriesIds[dsID].push(eachRecord.getId())
          }
        })
        if (Object.keys(incompleteGeometriesIds).length) {
          const incompleteGeomResults = await getCompleteGeometries(incompleteGeometriesIds, spatialRef)
          Object.keys(incompleteGeomResults).forEach((dsId) => {
            //merge the incomplete geometries results in the complete geomtries
            if (geometriesByDsId[dsId]) {
              geometriesByDsId[dsId] = [...geometriesByDsId[dsId], ...incompleteGeomResults[dsId]]
            } else {
              geometriesByDsId[dsId] = incompleteGeomResults[dsId]
            }
          })
        }
        MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedIncidentLocation', geometriesByDsId)
      }
    }
    return Promise.resolve(true)
  }
}

//get the whole app config
function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
