import { type IMDataSourceSchema, DataSourceTypes, type FeatureLayerDataSource, type FeatureDataRecord, type ArcGISQueryParams, type IFeatureLayer, type SceneLayerDataSource, type ArcGISSelectOptions, type IMQueryParams, type QueryResult, type ArcGISSubLayer, type DataSource } from 'jimu-core';
import { type ArcGISQueriableDataSourceConstructorOptions, AbstractArcGISQueriableDataSource } from '../base-classes/abstract-arcgis-queriable-data-source';
import type { WebChart } from 'arcgis-charts-components';
export interface FeatureLayerDataSourceConstructorOptions extends ArcGISQueriableDataSourceConstructorOptions {
    /**
     * If the feature layer data source is used by a scene layer data source to do query,
     * will save the scene layer data source to make it easy to find it.
     */
    associatedDataSource?: SceneLayerDataSource;
}
export declare class FeatureLayerDataSourceImpl extends AbstractArcGISQueriableDataSource implements FeatureLayerDataSource {
    type: DataSourceTypes.FeatureLayer;
    private relatedDataSources?;
    private _restLayer?;
    private associatedDataSource?;
    /** The execution result of the Arcade script, will be set in the ready() method. */
    private arcadeResult;
    /**
     * The layer that holds the loaded features of the arcade script,
     * will be set in the first time query and be reused by the following queries,
     * and will be reset in the auto refresh.
     */
    private arcadeClientLayer;
    get isAssociatedFeatureLayer(): boolean;
    get isSqlCaseSensitive(): boolean;
    set isSqlCaseSensitive(isCaseSensitive: boolean);
    ready(): Promise<this>;
    protected jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: __esri.FeatureLayer): Promise<Array<number | string>>;
    protected jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: __esri.FeatureLayer): Promise<__esri.FeatureSet>;
    protected jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: __esri.FeatureLayer): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    protected jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: __esri.FeatureLayer): Promise<number>;
    get layer(): __esri.FeatureLayer;
    set layer(l: __esri.FeatureLayer);
    get restLayer(): IFeatureLayer;
    set restLayer(l: IFeatureLayer);
    setAssociatedDataSource(associatedDataSource: SceneLayerDataSource): void;
    getAssociatedDataSource(): SceneLayerDataSource;
    isInAppConfig(): boolean;
    createRestAPILayerByDataSource(): IFeatureLayer;
    getCharts(): WebChart[];
    fetchSchema(): Promise<IMDataSourceSchema>;
    protected fetchSchemaWithLayer(): Promise<IMDataSourceSchema>;
    createRelatedDataSources(): Promise<FeatureLayerDataSource[]>;
    getRelatedDataSources(): FeatureLayerDataSource[];
    queryRelatedRecords(relatedDs: FeatureLayerDataSource, ids: string[], params?: ArcGISQueryParams, ignoreFilter?: boolean): Promise<{
        objectId: number;
        relatedRecords: FeatureDataRecord[];
        count: number;
    }[]>;
    queryRelatedFieldValues(records: FeatureDataRecord[], relatedDs: FeatureLayerDataSource, relatedFieldName: string): Promise<any[]>;
    protected changeSelectionInUrl(options: ArcGISSelectOptions): void;
    protected doAddRecordToServerSideSource(record: FeatureDataRecord): Promise<FeatureDataRecord>;
    protected doDeleteOneRecordFromServerSideSource(record: FeatureDataRecord): Promise<boolean>;
    protected doUpdateRecordsInServerSideSource(records: FeatureDataRecord[]): Promise<boolean>;
    private addRecordByLayer;
    private addRecordByUrl;
    private updateRecordsByLayer;
    private updateRecordsByUrl;
    private deleteOneRecordByLayer;
    private deleteOneRecordByUrl;
    private replaceSubLayerWithFeatureLayer;
    setNeedRefresh(needRefresh: boolean): void;
    doQuery(realQuery: IMQueryParams, originQuery: IMQueryParams): Promise<QueryResult>;
    doQueryCount(realQuery: IMQueryParams): Promise<QueryResult>;
    doQueryIds(realQuery: IMQueryParams): Promise<QueryResult>;
    doQueryById(id: string, fields?: string[]): Promise<FeatureDataRecord>;
    createJSAPILayerByDataSource(dataSource?: DataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.Layer | ArcGISSubLayer>;
    loadArcadeFeatures(): Promise<__esri.FeatureLayer>;
    private _loadArcadeFeatures;
}
