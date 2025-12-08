import { type DataSourceConstructorOptions, DataSourceTypes, type MapDataSource, type ArcGISSubLayer, type IMDataSourceSchema, type DataSource } from 'jimu-core';
import { AbstractDataSource } from '../base-classes/abstract-data-source';
export interface MapDataSourceConstructorOptions extends DataSourceConstructorOptions {
    map?: __esri.Map;
}
declare const MapDataSourceImpl_base: (abstract new (...args: any[]) => {
    id: string;
    dataSourceManager: import("jimu-core").DataSourceManager;
    childDataSourcesCreated: boolean;
    childDataSourcePromises: {
        [childDsId: string]: Promise<DataSource>;
    };
    getChildIds(): string[];
    createChildDataSourceById(childDsId: string, jimuChildId: string, childId: string): Promise<DataSource>;
    childDataSourcesReady(): Promise<DataSource[]>;
    updateAreChildDataSourcesCreated(): void;
    areChildDataSourcesCreated(): boolean;
    setChildDataSourcesCreated(created: boolean): void;
    createChildDataSourcesRecursively(): Promise<DataSource[]>;
    createChildDataSources(): Promise<DataSource[]>;
    createDataSourceById(dataSourceId: string): Promise<DataSource>;
    findChildDataSourceIdByDescendantDataSourceId(dataSourceId: string): string;
    getChildDataSourceIds(): string[];
    destroy(): void;
    areSomeChildDataSourcesPending(): Promise<boolean>;
    getChildDataSourceId(jimuChildId: string): string;
    getChildDataSources(): DataSource[];
    getAllChildDataSources(): DataSource[];
    getChildDataSource(jimuChildId: string): DataSource;
    getJimuChildId(childId: string): string[];
    clearChildDataSourcePromise(childDsId: string): void;
}) & typeof AbstractDataSource;
export declare class MapDataSourceImpl extends MapDataSourceImpl_base implements MapDataSource {
    type: DataSourceTypes.Map | DataSourceTypes.WebMap | DataSourceTypes.WebScene;
    map: __esri.Map;
    constructor(options: MapDataSourceConstructorOptions);
    ready(): Promise<any>;
    getChildIds(): string[];
    createChildDataSourceById(childDsId: string, jimuChildId: string, childId: string): Promise<DataSource>;
    createDataSourceByLayer(layer: __esri.Layer | ArcGISSubLayer): Promise<DataSource>;
    fetchSchema(): Promise<IMDataSourceSchema>;
    getDataSourceByLayer(layer: __esri.Layer | ArcGISSubLayer): DataSource;
    /**
     * Return all descendant data sources with specific data source type.
     */
    getDataSourcesByType(type: DataSourceTypes): DataSource[];
    private deepGetDataSourcesByType;
    protected createMap(): Promise<void>;
    private createChildDataSourceByLayer;
    private findLayerInfo;
    private getLayersAndTables;
    private getChildIdByLayer;
    /**
     * This is a temp fix. Let's move this code into JimuLayerView when this issue is fixed: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/48066
     */
    protected createFilterUrlChildDataSource(): Promise<any>;
}
export {};
