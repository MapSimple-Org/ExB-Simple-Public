import type { DataSourceTypes } from './common-data-source-interface';
import type { ArcGISQueriableDataSource } from './arcgis-queriable-data-source-interface';
/**
 * `OrientedImageryLayerDataSource` is created from FeatureServer.
 */
export interface OrientedImageryLayerDataSource extends ArcGISQueriableDataSource {
    type: DataSourceTypes.OrientedImageryLayer;
    layer?: __esri.OrientedImageryLayer;
}
