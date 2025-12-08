import type { SetDataSourceMixin, DataSourceTypes } from './common-data-source-interface';
import type { ArcGISQueryParams, ArcGISQueriableDataSource, FeatureDataRecord } from './arcgis-queriable-data-source-interface';
import type { SubtypeSublayerDataSource } from './subtype-sublayer-data-source-interface';
export interface ArcGISSubtypeGroupLayer extends __esri.SubtypeGroupLayer {
    popupTemplate?: __esri.PopupTemplate;
    renderer?: __esri.Renderer;
}
/**
 * The `SubtypeGroupLayerDataSource` is created from a feature layer which contains subtype. It supports to query.
 * The source of the feature layer is same as `FeatureLayerDataSource`.
 */
export interface SubtypeGroupLayerDataSource extends ArcGISQueriableDataSource, SetDataSourceMixin {
    type: DataSourceTypes.SubtypeGroupLayer;
    layer?: ArcGISSubtypeGroupLayer;
    getSubtypeField: () => string;
    /**
     * @ignore
     */
    getRemoteQueryParams: (considerChildren?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    getConfigQueryParams: (considerChildren?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    getRuntimeQueryParams: (excludeWidgetIds?: string | string[], considerChildren?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    selectRecordsByIds: (ids: string[], records?: FeatureDataRecord[], updateChildren?: boolean) => void;
    /**
     * Return the subtype sublayer data source by a record ID. If the sublayer data source is not created, it will create it.
     */
    getSublayerDataSourceByRecordId: (id: string) => Promise<SubtypeSublayerDataSource>;
}
