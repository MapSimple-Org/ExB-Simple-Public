import { AbstractDataAction, type DataRecordSet, MutableStoreManager, type DataSource, type JSAPILayerMixin, DataSourceStatus, DataLevel, getAppStore, AllDataSourceTypes } from 'jimu-core'

export default class ViewProfileDataAction extends AbstractDataAction {
  isSupported (dataSets: DataRecordSet[], dataLevel): Promise<boolean> {
    if (dataSets.length > 1) {
      return Promise.resolve(false)
    }

    const dataSet = dataSets[0]
    const dataSource = dataSet.dataSource as DataSource & JSAPILayerMixin

    const appConfig = getAppConfig()
    const widgetJson = appConfig?.widgets?.[this.widgetId]
    const configSettings = widgetJson.config?.configInfo?.[widgetJson?.config?.activeDataSource]

    // eslint-disable-next-line no-prototype-builtins
    const checkProfileSettingsEnabled = configSettings?.hasOwnProperty('advanceOptions')
      ? configSettings?.advanceOptions
      : configSettings?.profileSettings?.isProfileSettingsEnabled

    //don't support if only draw option is enabled in the config (not select)
    if (!checkProfileSettingsEnabled) {
      return Promise.resolve(false)
    }

    const noLayersConfiguredIfCustomizeEnabled = checkProfileSettingsEnabled && configSettings?.profileSettings?.isCustomizeOptionEnabled &&
      configSettings?.profileSettings?.layers.length === 0

    //don't support if no line layers are configured when customize option is enabled
    if (noLayersConfiguredIfCustomizeEnabled) {
      return Promise.resolve(false)
    }

    //Don't support if dataSource is not valid or notReady
    if (!dataSource || dataSource.getStatus() === DataSourceStatus.NotReady) {
      return Promise.resolve(false)
    }
    // records maybe come from a table, so we need to check if the dataSource has geometry or not
    const supportSpatialInfo = dataSource?.supportSpatialInfo && dataSource?.supportSpatialInfo()
    if (!supportSpatialInfo) {
      return Promise.resolve(false)
    }
    if (dataLevel !== DataLevel.Records) {
      return Promise.resolve(false)
    }

    //check ds for map widget (webmap or webscene) or for other widgets like table, list for the configured layer (line layer)
    if (!(dataSource.type === 'WEB_MAP' || dataSource.type === 'WEB_SCENE' ||
      ((dataSource.type === AllDataSourceTypes.FeatureLayer || dataSource.type === AllDataSourceTypes.SubtypeSublayer) && (dataSource.getGeometryType() === 'esriGeometryPolyline')))) {
      return Promise.resolve(false)
    }

    //accept selected records/current features from popup only
    if (dataSet.records.length > 0 && dataLevel === DataLevel.Records && (dataSet.type === 'current' || dataSet.type === 'selected')) {
      return Promise.resolve(true)
    }

    return Promise.resolve(false)
  }

  //on selection of the features in map widget get the data record set by execute method
  onExecute (dataSets: DataRecordSet[]): Promise<boolean> {
    const { records } = dataSets[0]
    //get the map selected features records
    MutableStoreManager.getInstance().updateStateValue(this.widgetId, 'selectedFeatureRecords', records)
    return Promise.resolve(true)
  }
}

function getAppConfig () {
  return window.jimuConfig.isBuilder ? getAppStore().getState()?.appStateInBuilder?.appConfig : getAppStore().getState()?.appConfig
}
