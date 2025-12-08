import { DataSourceTypes, type OrientedImageryLayerDataSource } from 'jimu-core';
import { AbstractArcGISQueriableDataSource } from '../base-classes/abstract-arcgis-queriable-data-source';
export declare class OrientImageryLayerDataSourceImpl extends AbstractArcGISQueriableDataSource implements OrientedImageryLayerDataSource {
    type: DataSourceTypes.OrientedImageryLayer;
    protected jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: __esri.OrientedImageryLayer | __esri.FeatureLayer): Promise<Array<number | string>>;
    protected jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: __esri.OrientedImageryLayer | __esri.FeatureLayer): Promise<__esri.FeatureSet>;
    protected jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: __esri.OrientedImageryLayer | __esri.FeatureLayer): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    protected jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: __esri.OrientedImageryLayer | __esri.FeatureLayer): Promise<number>;
    get layer(): __esri.OrientedImageryLayer;
    set layer(l: __esri.OrientedImageryLayer);
    ready(): Promise<this>;
}
