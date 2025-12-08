import type { GeometryType, IFeature, IPopupInfo, ILayerDefinition } from '@esri/arcgis-rest-feature-service'
import type { IMDataSourceSchema } from '../../types/app-config'
import type { DataSourceTypes, QueryOptions, QueryResult, GetCurrentQueryParamsOptions, CodedValue, QueryProgressCallback, TimezoneRuntime } from './common-data-source-interface'
import type { FeatureDataRecord, ArcGISQueryParams, ArcGISSelectOptions, ArcGISCapabilities, ArcGISQueriableUsedFieldsOptions, ArcGISQueriableDataSource } from './arcgis-queriable-data-source-interface'
import type { FeatureLayerDataSource } from './feature-layer-data-source-interface'

/**
 * `SceneLayerDataSource` is created from a single scene layer of scene service or webscene.
 */
export interface SceneLayerDataSource extends ArcGISQueriableDataSource {
  type: DataSourceTypes.SceneLayer
  layer?: __esri.SceneLayer
  url: string
  portalUrl?: string
  itemId?: string
  layerId?: string
  getAssociatedDataSource: () => FeatureLayerDataSource
  setLayerDefinition: (layerDefinition: ILayerDefinition) => void
  getLayerDefinition: () => ILayerDefinition
  setPopupInfo: (popupInfo: IPopupInfo) => void
  getPopupInfo: () => IPopupInfo
  /** @ignore */
  getCapabilities: () => ArcGISCapabilities
  /** Return the current GDB version. */
  getGDBVersion: () => string
  /** Change the layer GDB version. */
  changeGDBVersion: (gdbVersion: string) => void
  supportSymbol: () => boolean
  supportAttachment: () => boolean
  // #region Overrides for parent interface
  loadCount: (query: ArcGISQueryParams, options?: QueryOptions) => Promise<number>
  query: (queryProperties: ArcGISQueryParams) => Promise<QueryResult>
  queryCount: (queryProperties: ArcGISQueryParams) => Promise<QueryResult>
  selectRecords: (options: ArcGISSelectOptions, signal?: AbortSignal, progressCallback?: QueryProgressCallback) => Promise<QueryResult>
  selectRecordById: (id: string, record?: FeatureDataRecord) => void
  selectRecordsByIds: (ids: string[], records?: FeatureDataRecord[]) => void
  getIdField: () => string
  getGeometryType: () => GeometryType
  getConfigQueryParams: () => ArcGISQueryParams
  mergeQueryParams: (...queries: ArcGISQueryParams[]) => ArcGISQueryParams
  getRealQueryParams: (query, flag: 'query' | 'load', options?: QueryOptions) => ArcGISQueryParams
  getCurrentQueryParams: (options?: GetCurrentQueryParamsOptions) => ArcGISQueryParams
  getAllUsedFields: (options?: ArcGISQueriableUsedFieldsOptions) => string[] | '*'
  fetchSchema: () => Promise<IMDataSourceSchema>
  getFieldCodedValueList: (jimuFieldName: string, record?: FeatureDataRecord) => CodedValue[]
  buildRecord: (feature: IFeature | __esri.Graphic) => FeatureDataRecord
  getDataViews: () => SceneLayerDataSource[]
  getDataView: (dataViewId: string) => SceneLayerDataSource
  getMainDataSource: () => SceneLayerDataSource
  getTimezone: () => TimezoneRuntime
  // #endregion
}
