import { type IMDataSourceJson, type ImmutableObject, DataSourceTypes, type SubtypeSublayerDataSource, type ArcGISSubtypeGroupLayer, type SubtypeGroupLayerDataSource, type ArcGISQueryParams, type FeatureDataRecord } from 'jimu-core';
import { AbstractArcGISQueriableDataSource } from '../base-classes/abstract-arcgis-queriable-data-source';
declare const SubtypeGroupLayerDataSourceImpl_base: (abstract new (...args: any[]) => {
    id: string;
    dataSourceManager: import("jimu-core").DataSourceManager;
    childDataSourcesCreated: boolean;
    childDataSourcePromises: {
        [childDsId: string]: Promise<import("jimu-core").DataSource>;
    };
    getChildIds(): string[];
    createChildDataSourceById(childDsId: string, jimuChildId: string, childId: string): Promise<import("jimu-core").DataSource>;
    childDataSourcesReady(): Promise<import("jimu-core").DataSource[]>;
    updateAreChildDataSourcesCreated(): void;
    areChildDataSourcesCreated(): boolean;
    setChildDataSourcesCreated(created: boolean): void;
    createChildDataSourcesRecursively(): Promise<import("jimu-core").DataSource[]>;
    createChildDataSources(): Promise<import("jimu-core").DataSource[]>;
    createDataSourceById(dataSourceId: string): Promise<import("jimu-core").DataSource>;
    findChildDataSourceIdByDescendantDataSourceId(dataSourceId: string): string;
    getChildDataSourceIds(): string[];
    destroy(): void;
    areSomeChildDataSourcesPending(): Promise<boolean>;
    getChildDataSourceId(jimuChildId: string): string;
    getChildDataSources(): import("jimu-core").DataSource[];
    getAllChildDataSources(): import("jimu-core").DataSource[];
    getChildDataSource(jimuChildId: string): import("jimu-core").DataSource;
    getJimuChildId(childId: string): string[];
    clearChildDataSourcePromise(childDsId: string): void;
}) & typeof AbstractArcGISQueriableDataSource;
export declare class SubtypeGroupLayerDataSourceImpl extends SubtypeGroupLayerDataSourceImpl_base implements SubtypeGroupLayerDataSource {
    type: DataSourceTypes.SubtypeGroupLayer;
    ready(): Promise<any>;
    getChildIds(): string[];
    createChildDataSourceById(childDsId: string, jimuChildId: string, childId: string): Promise<SubtypeSublayerDataSource>;
    selectRecordsByIds(ids: string[], records?: FeatureDataRecord[], updateChildren?: boolean): void;
    protected copySelectionToDataView(selection: FeatureDataRecord[], updateChildren?: boolean): void;
    updateWidgetQueries(query: ArcGISQueryParams, widgetId: string): void;
    setDataSourceJson(dsJson: IMDataSourceJson): void;
    getRemoteQueryParams(considerChildren?: boolean): ArcGISQueryParams;
    getRuntimeQueryParams(excludeWidgetIds?: string | string[], considerChildren?: boolean): ArcGISQueryParams;
    protected getRuntimeQueryParamsWithSpecificWidgetQueries(excludeWidgetIds: string | string[], widgetQueries: ImmutableObject<{
        [widgetId: string]: ArcGISQueryParams;
    }>, considerChildren?: boolean): ArcGISQueryParams;
    getSubtypeField(): string;
    protected jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeGroupLayer | __esri.FeatureLayer): Promise<Array<number | string>>;
    protected jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeGroupLayer | __esri.FeatureLayer): Promise<__esri.FeatureSet>;
    protected jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeGroupLayer | __esri.FeatureLayer): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    protected jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeGroupLayer | __esri.FeatureLayer): Promise<number>;
    get layer(): ArcGISSubtypeGroupLayer;
    set layer(l: ArcGISSubtypeGroupLayer);
    getChildDataSources(): SubtypeSublayerDataSource[];
    private findLayerInfo;
    private createChildDataSourceByLayer;
    private getChildIdByLayer;
    createJSAPILayerByDataSource(dataSource?: SubtypeGroupLayerDataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.SubtypeGroupLayer | __esri.FeatureLayer>;
    getSublayerDataSourceByRecordId(id: string): Promise<SubtypeSublayerDataSource>;
}
export {};
