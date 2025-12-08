import { type IMDataSourceSchema, type DataSourceConstructorOptions, type QueryResult, type CodedValue, type FeatureDataRecord, type IMArcGISQueryParams, type ArcGISQueryParams, type QueryOptions, type TimeInfo, type GetCurrentQueryParamsOptions, type ArcGISCapabilities, type ArcGISQueriableUsedFieldsOptions, type TimezoneRuntime, type ArcGISQueriableDataSource, type ArcGISQueriableLayerTypes, type QueryProgressCallback } from 'jimu-core';
import type { ILayerDefinition, GeometryType, IFeature, IPopupInfo, IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-service';
import type { IItem } from '@esri/arcgis-rest-portal';
import { AbstractQueriableDataSource } from '../base-classes/abstract-queriable-data-source';
export interface ArcGISQueriableDataSourceConstructorOptions extends DataSourceConstructorOptions {
    /**
     * If the feature layer data source is created from a JS API feature layer,
     * will use data in the layer as source of current data source.
     */
    layer?: ArcGISQueriableLayerTypes;
    /**
     * If the feature layer data source is created from an array directly,
     * will save the array to `sourceRecords` and use it as source of current data source.
     */
    sourceRecords?: FeatureDataRecord[];
}
export interface ArcGISQueriableDataSourceConstructorOptionsWithJSAPILayer extends ArcGISQueriableDataSourceConstructorOptions {
    layer?: ArcGISQueriableLayerTypes;
}
export interface ArcGISQueriableDataSourceConstructorOptionsWithRecords extends ArcGISQueriableDataSourceConstructorOptions {
    sourceRecords?: FeatureDataRecord[];
}
declare const AbstractArcGISQueriableDataSource_base: {
    new (...args: any[]): {
        id: string;
        type: import("jimu-core").DataSourceTypes;
        getDataSourceJson: () => import("jimu-core").IMDataSourceJson;
        layer?: __esri.Layer | import("jimu-core").ArcGISSubLayer;
        url?: string;
        itemId?: string;
        portalUrl?: string;
        cachedLayer?: __esri.Layer | import("jimu-core").ArcGISSubLayer;
        _jimuLayerId?: string;
        readonly jimuLayerId: string;
        createJSAPILayerByDataSource(dataSource?: import("jimu-core").DataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.Layer | import("jimu-core").ArcGISSubLayer>;
        supportSpatialInfo(): boolean;
        createNewJSAPILayerByDataSource(createdBy: import("jimu-core").DataSource & import("jimu-core").JSAPILayerMixin, throwError: boolean): Promise<__esri.Layer | import("jimu-core").ArcGISSubLayer>;
        setJimuChildIdAsLayerId(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, ds: import("jimu-core").DataSource): void;
        canCacheLayer(createdBy: import("jimu-core").DataSource & import("jimu-core").JSAPILayerMixin): boolean;
        getLayerConstructorOptions(createdBy: import("jimu-core").DataSource & import("jimu-core").JSAPILayerMixin): {
            url?: string;
            portalItem?: __esri.PortalItemProperties;
            sourceJSON?: any;
            source?: any;
            layerId?: number;
            customParameters?: object;
            outFields?: string[];
        };
        syncQueryParams(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, dataSource: import("jimu-core").DataSource): void;
        afterCreateJSAPILayer(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, dataSource: import("jimu-core").DataSource & import("jimu-core").JSAPILayerMixin): void;
    };
} & {
    new (...args: any[]): {
        _itemId: string;
        _portalUrl: string;
        itemData: any;
        itemInfo: IItem;
        itemId: string;
        portalUrl: string;
        getItemData(): any;
        setItemData(itemData: any): void;
        setItemInfo(itemInfo: any): void;
        getItemInfo(): IItem;
        fetchItemData(): Promise<any>;
        fetchItemInfo(): Promise<IItem>;
        clearData(): void;
    };
} & typeof AbstractQueriableDataSource;
export declare abstract class AbstractArcGISQueriableDataSource extends AbstractArcGISQueriableDataSource_base implements ArcGISQueriableDataSource {
    layerId?: string;
    protected _layer?: ArcGISQueriableLayerTypes;
    protected layerForRestQueryPromise?: Promise<void>;
    protected sourceRecords?: FeatureDataRecord[];
    protected layerDefinition?: ILayerDefinition;
    protected popupInfo?: IPopupInfo;
    /**
     * Use the JS API feature layer to support pbf format for data sources which do not contain layer when created, e.g. data source from a service url.
     */
    private layerForRestQuery?;
    private allowExportRemoteCheckPromise;
    private supportReplicaPromise;
    private createFeatureLayerPromise;
    private lastEditTimeCheckTime;
    private lastEditTimeCheckPromise;
    constructor(options: ArcGISQueriableDataSourceConstructorOptionsWithJSAPILayer);
    constructor(options: ArcGISQueriableDataSourceConstructorOptionsWithRecords);
    protected abstract jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISQueriableLayerTypes): Promise<Array<number | string>>;
    protected abstract jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISQueriableLayerTypes): Promise<__esri.FeatureSet>;
    protected abstract jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISQueriableLayerTypes): Promise<number>;
    protected abstract jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISQueriableLayerTypes): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    load(query: ArcGISQueryParams, options?: QueryOptions): Promise<FeatureDataRecord[]>;
    loadAll(query: ArcGISQueryParams, signal?: AbortSignal, progressCallback?: QueryProgressCallback, options?: QueryOptions): Promise<FeatureDataRecord[]>;
    loadById(id: string, refresh?: boolean): Promise<FeatureDataRecord>;
    queryById(id: string, fields?: string[]): Promise<FeatureDataRecord>;
    getSourceRecords(): FeatureDataRecord[];
    getRecordById(id: string): FeatureDataRecord;
    getRecords(): FeatureDataRecord[];
    getRecordsWithSelection(): FeatureDataRecord[];
    getRecordsByPage(page: number, pageSize: number): FeatureDataRecord[];
    getRecordsByPageWithSelection(page: number, pageSize: number): FeatureDataRecord[];
    getAllLoadedRecords(): FeatureDataRecord[];
    getSelectedRecords(): FeatureDataRecord[];
    getIdField(): string;
    getGeometryType(): GeometryType;
    queryExtent(query: ArcGISQueryParams, options?: QueryOptions): Promise<QueryResult>;
    doQuery(realQuery: IMArcGISQueryParams, originQuery: IMArcGISQueryParams): Promise<QueryResult>;
    checkQueryParams(query: IMArcGISQueryParams): void;
    applyUsedFields(query: ArcGISQueryParams, usedFields: string[] | '*'): ArcGISQueryParams;
    getAllUsedFields(options?: ArcGISQueriableUsedFieldsOptions): string[] | '*';
    private doQueryWithoutPagination;
    /**
     * `queryByCapabilities` should match capabilities of the source (AGOL/portal item or a remote database) of the current data source.
     */
    private doQueryByCapabilities;
    createLayerForRestQuery(): Promise<void>;
    /**
     * Some statistic query params are not supported according to the feature service capability. See https://developers.arcgis.com/rest/services-reference/query-feature-service-layer-.htm.
     * We will remove these query params before sending query request. See `doQuery` method.
     * However, we can enhance the result after the query request is back.
     *
     * For example, if `supportsOrderByOnlyOnLayerFields` is true, only fields from the layer's fields array can be used with the `orderByFields` parameter,
     * the `outStatisticFieldName` from outStatistics can't be used. In the case, data source can help to sort the records and return an expected result.
     */
    private enhanceStatisticQueryResult;
    private sliceByPage;
    private sortRecordsByFields;
    private compareRecordsByFields;
    /** .
     * Negative number means value of r1 should be before value of r2,
     * 0 means value of r1 is equal as value of r2,
     * positive means value of r1 should be after value of r2.
     */
    private getCompareValueResult;
    doQueryCount(queryParams: IMArcGISQueryParams): Promise<QueryResult>;
    doQueryIds(queryParams: IMArcGISQueryParams): Promise<QueryResult>;
    doQueryExtent(queryParams: IMArcGISQueryParams): Promise<QueryResult>;
    private doQueryExtentByLayer;
    private doQueryExtentByUrl;
    private doQueryCountByLayer;
    private doQueryCountByUrl;
    private doQueryIdsByLayer;
    private doQueryIdsByUrl;
    doQueryById(id: string, fields?: string[]): Promise<FeatureDataRecord>;
    getConfigQueryParams(): ArcGISQueryParams;
    mergeQueryParams(...queries: ArcGISQueryParams[]): ArcGISQueryParams;
    getCurrentQueryParams(options?: GetCurrentQueryParamsOptions): ArcGISQueryParams;
    getRealQueryParams(query: any, flag: 'query' | 'load', options?: QueryOptions): ArcGISQueryParams;
    getRemoteQueryParams(): ArcGISQueryParams;
    private applyGDBVersionAndFix;
    /**
     * Some query params have conflicts according to the feature layer query capability and we can not enhance it.
     * Will fix query object by removing these conflicts params.
     */
    fixQueryParam(q: IMArcGISQueryParams): IMArcGISQueryParams;
    fetchSchema(): Promise<IMDataSourceSchema>;
    protected createJSAPILayerByFeatureCollectionItemId(): Promise<__esri.FeatureLayer>;
    private fetchSchemaWithoutLayer;
    protected fetchSchemaWithLayer(): Promise<IMDataSourceSchema>;
    private updateLayerDefinitionByLayer;
    getLayerDefinition(): ILayerDefinition;
    setLayerDefinition(layerDef: ILayerDefinition): void;
    getPopupInfo(): IPopupInfo;
    getPopupInfoFields(): string[];
    setPopupInfo(popupInfo: IPopupInfo): void;
    getItemInfo(): IItem;
    private setLayerDefinitionAndQueryCapabilities;
    getCapabilities(): ArcGISCapabilities;
    buildRecord(feature: IFeature | __esri.Graphic): FeatureDataRecord;
    getFieldCodedValueList(jimuFieldName: string, record?: FeatureDataRecord): CodedValue[];
    getGDBVersion(): string;
    changeGDBVersion(gdbVersion: string): void;
    private getUpdatedLayerDefinition;
    private getOrderByArray;
    changeJimuQueryToRestAPIQuery(queryParams: IMArcGISQueryParams): IQueryFeaturesOptions;
    changeJimuQueryToJSAPIQuery(queryParams: IMArcGISQueryParams): Promise<__esri.Query | __esri.QueryProperties>;
    private doQueryByUrlCapabilities;
    private doQueryByLayerCapabilities;
    private getLayerViewForClientSideQuery;
    private _q;
    getTimezone(): TimezoneRuntime;
    private getLayerTimezone;
    allowToExportData(): Promise<boolean>;
    private allowToExportDataInRemote;
    private allowToExportDataInOriginServiceItem;
    /**
     * Check export setting in portal/AGOL (item setting page).
     */
    private allowToExportInLayerDefinition;
    supportReplica(): Promise<boolean>;
    supportSymbol(): boolean;
    supportAttachment(): boolean;
    supportTime(): boolean;
    getTimeInfo(): TimeInfo;
    setSourceFeatures(features: Array<__esri.Graphic | __esri.GraphicProperties>, others?: Omit<__esri.FeatureLayerProperties, 'source' | 'fields' | 'objectIdField'>): Promise<void>;
    getDataViews(): ArcGISQueriableDataSource[];
    getDataView(dataViewId: string): ArcGISQueriableDataSource;
    getMainDataSource(): ArcGISQueriableDataSource;
    updateLastEditTime(): Promise<void>;
    protected getLastEditTime(): number;
    get layer(): ArcGISQueriableLayerTypes;
    set layer(l: ArcGISQueriableLayerTypes);
    private _printUseAllFieldsWarning;
}
export {};
