import { DataSourceManager, type FeatureLayerQueryParams, type QueriableDataSource, type DataRecord, type FeatureDataRecord } from 'jimu-core'
import * as utils from '../../utils/utils'
import type { JimuMapView } from 'jimu-arcgis'
// import * as SceneView from 'esri/views/SceneView';

export interface QueryInfo {
  dsId: string
  // idField: string,
  featureId: number
}

interface Options {
  jimuMapView: JimuMapView
  // sceneView: __esri.SceneView;
}

export default class QueryHelper {
  sceneView: __esri.SceneView
  jimuMapView: JimuMapView

  // dsManager: DataSourceManager;

  constructor (options: Options) {
    this.jimuMapView = options.jimuMapView
    // this.sceneView = options.sceneView;
    // this.clearCacheMapState();
    // this.clearCacheHighlightGeo();
    // this.dsManager = DataSourceManager.getInstance();
  }

  destructor (): void {
    // this.clear();
    // this.restoreMapPopupHighlightState();
  }

  // getDataSource = (dsId):DataSource => {
  //   return this.dsManager.getDataSource(dsId);
  // }

  queryByGraphic = (): void => {
    // const jimuMapView = this.jimuMapView
    // jimuMapView.selectFeaturesByGraphic(event.graphic, this.state.spatialRelationship).then(() => {
    //   this.setState({
    //     isQuerying: false
    //   })
    // })
  }

  getInfoByRecord = (records: FeatureDataRecord[]): void => {
    let recordIds = {
      dsId: '',
      featureId: -1
    }
    const record = records[0]// 0
    const idField = record.dataSource.belongToDataSource.getIdField()
    const featureId = record.feature.attributes[idField]

    recordIds = {
      dsId: record.dataSource.id, // as string;
      featureId: featureId
    }
    console.log('recordIds ', recordIds)
  }

  queryRecordsByInfo = async (opts?: QueryInfo): Promise<DataRecord[]> => {
    const ds = DataSourceManager.getInstance().getDataSource(opts.dsId) as QueriableDataSource

    const query: FeatureLayerQueryParams = {
      objectIds: [String(opts.featureId)],
      // set [*] for ds.query change: ExperienceBuilder/issues/19020
      outFields: ['*'],
      notAddFieldsToClient: true
    }

    let records = []
    const result = await ds.query(query)
    if (utils.isDefined(result)) {
      records = result.records
    }
    return records
  }

  _testQuery = async (): Promise<DataRecord[]> => {
    const testOpts = {
      dsId: 'dataSource_3-15baa741740-layer-0',
      featureId: 14
    }
    const res = await this.queryRecordsByInfo(testOpts)
    return res
  }
}
