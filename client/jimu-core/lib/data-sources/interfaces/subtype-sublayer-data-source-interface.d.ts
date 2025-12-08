import type { DataSourceTypes } from './common-data-source-interface';
import type { ArcGISQueryParams, ArcGISQueriableDataSource, FeatureDataRecord } from './arcgis-queriable-data-source-interface';
export interface ArcGISSubtypeSublayer extends __esri.SubtypeSublayer {
    definitionExpression?: string;
    portalItem?: __esri.PortalItem;
    fullExtent?: __esri.Extent;
}
/**
 * `SubtypeSublayerDataSource` is the child data source of the `SubtypeGroupLayerDataSource`, it supports to query.
 */
export interface SubtypeSublayerDataSource extends ArcGISQueriableDataSource {
    type: DataSourceTypes.SubtypeSublayer;
    layer?: ArcGISSubtypeSublayer;
    /**
     * Get the subtype code.
     */
    getSubtypeCode: () => number;
    /**
     * Get the subtype field.
     */
    getSubtypeField: () => string;
    /**
     * @ignore
     */
    ensureWhereClauseMatchesSubtype: (whereClause: string | null) => string;
    /**
     * @ignore
     */
    getRemoteQueryParams: (considerParent?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    getConfigQueryParams: (considerParent?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    getRuntimeQueryParams: (excludeWidgetIds?: string | string[], considerParent?: boolean) => ArcGISQueryParams;
    /**
     * @ignore
     */
    selectRecordsByIds: (ids: string[], records?: FeatureDataRecord[], updateParent?: boolean) => void;
}
