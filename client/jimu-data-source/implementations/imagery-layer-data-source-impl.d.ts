import type { GeometryType } from '@esri/arcgis-rest-feature-service';
import { type IMDataSourceSchema, DataSourceTypes, type ImageryLayerDataSource } from 'jimu-core';
import { AbstractArcGISQueriableDataSource } from '../base-classes/abstract-arcgis-queriable-data-source';
export declare class ImageryLayerDataSourceImpl extends AbstractArcGISQueriableDataSource implements ImageryLayerDataSource {
    type: DataSourceTypes.ImageryLayer;
    protected jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: __esri.ImageryLayer | __esri.FeatureLayer): Promise<Array<number | string>>;
    protected jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: __esri.ImageryLayer | __esri.FeatureLayer): Promise<__esri.FeatureSet>;
    protected jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: __esri.ImageryLayer | __esri.FeatureLayer): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    protected jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: __esri.ImageryLayer | __esri.FeatureLayer): Promise<number>;
    getGeometryType(): GeometryType;
    get layer(): __esri.ImageryLayer;
    set layer(l: __esri.ImageryLayer);
    fetchSchema(): Promise<IMDataSourceSchema>;
    ready(): Promise<this>;
}
