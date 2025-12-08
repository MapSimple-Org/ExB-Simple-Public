import type { GeometryType } from '@esri/arcgis-rest-feature-service';
import type { DataSourceTypes } from './common-data-source-interface';
import type { ArcGISQueriableDataSource } from './arcgis-queriable-data-source-interface';
/**
 * `ImageryLayerDataSource` is created from Image service.
 */
export interface ImageryLayerDataSource extends ArcGISQueriableDataSource {
    type: DataSourceTypes.ImageryLayer;
    layer: __esri.ImageryLayer;
    getGeometryType: () => GeometryType;
}
