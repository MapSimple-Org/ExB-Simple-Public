import type { GeometryType, IFeature } from '@esri/arcgis-rest-feature-service';
import { type FeatureDataRecord, type IMArcGISQueryParams, type DataSource, type ItemMixin, type TimeExtent, type ArcGISQueriableDataSource, type IFeatureLayer } from '../../data-sources';
export declare function createJSAPIFeatureLayerByRecords(dataSource: ArcGISQueriableDataSource, records: FeatureDataRecord[], sourceVersion?: number, others?: Omit<__esri.FeatureLayerProperties, 'source' | 'fields' | 'objectIdField'>, layerOptionsHandler?: (properties: __esri.FeatureLayerProperties) => Promise<__esri.FeatureLayerProperties>): Promise<{
    layer: __esri.FeatureLayer;
    sourceVersion?: number;
}>;
export declare function createRestFeatureLayerByRecords(dataSource: ArcGISQueriableDataSource, records: FeatureDataRecord[], sourceVersion?: number): {
    layer: IFeatureLayer;
    sourceVersion?: number;
};
type JSAPIGeometryType = 'point' | 'multipoint' | 'polyline' | 'polygon' | 'extent';
export declare function changeRestAPIGeometryTypeToJSAPIGeometryType(geometryType: GeometryType): JSAPIGeometryType;
export declare function changeJSAPIGeometryTypeToRestAPIGeometryType(geometryType: JSAPIGeometryType): GeometryType;
export declare function changeJimuRecordsToJSAPIGraphics(records: FeatureDataRecord[]): Promise<__esri.Graphic[]>;
type TimeExtentTypeInImmutableQueryParams = IMArcGISQueryParams['time'];
export declare function changeJimuTimeToJSAPITimeExtent(time: TimeExtent | TimeExtentTypeInImmutableQueryParams): __esri.TimeExtent;
export declare function changeToRestAPIFeature(feature: IFeature | __esri.Graphic): IFeature;
export declare function changeToJSAPIGraphic(feature: IFeature | __esri.Graphic): Promise<__esri.Graphic>;
/**
 * Convert IMArcGISQueryParams to __esri.Query | __esri.QueryProperties, to query features by layer (instance of ArcGIS Maps SDK for JavaScript FeatureLayer class).
 */
export declare function changeJimuArcGISQueryToJSAPIQuery(dataSource: ArcGISQueriableDataSource, queryParams: IMArcGISQueryParams): Promise<__esri.Query | __esri.QueryProperties>;
export declare function isFeatureLayerDsOrSceneLayerDsOrImageryLayer(ds: DataSource): ds is ArcGISQueriableDataSource;
export declare function isItemMixin(ds: DataSource): ds is DataSource & ItemMixin;
export {};
