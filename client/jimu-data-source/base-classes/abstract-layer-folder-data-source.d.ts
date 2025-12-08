import type { IItem } from '@esri/arcgis-rest-portal';
import { type IMDataSourceJson, type IMDataSourceSchema, type ServiceDefinition, type AbstractArcGISLayerFolderDataSource, type ArcGISFolderLayer, type DataSource, type DataSourceConstructorOptions, DataSourceTypes } from 'jimu-core';
import { AbstractDataSource } from './abstract-data-source';
export interface LayerFolderDataSourceConstructorOptions extends DataSourceConstructorOptions {
    layer?: ArcGISFolderLayer;
}
export interface LayerFolderChildDataSourceConstructorOptions extends DataSourceConstructorOptions {
    layer?: __esri.Layer | __esri.Sublayer;
}
declare const AbstractLayerFolderDataSource_base: {
    new (...args: any[]): {
        id: string;
        type: DataSourceTypes;
        getDataSourceJson: () => IMDataSourceJson;
        layer?: __esri.Layer | import("jimu-core").ArcGISSubLayer;
        url?: string;
        itemId?: string;
        portalUrl?: string;
        cachedLayer?: __esri.Layer | import("jimu-core").ArcGISSubLayer;
        _jimuLayerId?: string;
        readonly jimuLayerId: string;
        createJSAPILayerByDataSource(dataSource?: DataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.Layer | import("jimu-core").ArcGISSubLayer>;
        supportSpatialInfo(): boolean;
        createNewJSAPILayerByDataSource(createdBy: DataSource & import("jimu-core").JSAPILayerMixin, throwError: boolean): Promise<__esri.Layer | import("jimu-core").ArcGISSubLayer>;
        setJimuChildIdAsLayerId(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, ds: DataSource): void;
        canCacheLayer(createdBy: DataSource & import("jimu-core").JSAPILayerMixin): boolean;
        getLayerConstructorOptions(createdBy: DataSource & import("jimu-core").JSAPILayerMixin): {
            url?: string;
            portalItem?: __esri.PortalItemProperties;
            sourceJSON?: any;
            source?: any;
            layerId?: number;
            customParameters?: object;
            outFields?: string[];
        };
        syncQueryParams(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, dataSource: DataSource): void;
        afterCreateJSAPILayer(layer: __esri.Layer | import("jimu-core").ArcGISSubLayer, dataSource: DataSource & import("jimu-core").JSAPILayerMixin): void;
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
} & (abstract new (...args: any[]) => {
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
/**
 * * Common operations for folder-like services, such as feature service, scene service, map service, group layer, etc, are grouped in this class.
 * please see {@link SupportedLayerServiceTypes} to find supported layer service types.
 */
export declare abstract class AbstractLayerFolderDataSource extends AbstractLayerFolderDataSource_base implements AbstractArcGISLayerFolderDataSource {
    protected serviceDefinition: ServiceDefinition;
    layer?: ArcGISFolderLayer;
    layerId?: string;
    constructor(options: LayerFolderDataSourceConstructorOptions);
    ready(): Promise<void>;
    abstract createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    private upgradeChildDssId;
    /**
     * The data can be defined in service, item data.
     */
    fetchDataDefinitions(): Promise<void>;
    fetchServiceDefinition(): Promise<ServiceDefinition>;
    fetchSchema(): Promise<IMDataSourceSchema>;
    getServiceDefinition(): ServiceDefinition;
    getItemInfo(): IItem;
    createChildDataSourceById(childDsId: string, jimuChildId: string, childId: string): Promise<DataSource>;
    protected createChildDataSourceOptionsByIdFromUrl(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    protected createChildDataSourceOptionsByLayerDefinition(layerDefinition: ServiceDefinition, url: string, jimuChildId: string, childDsId: string, order: number): Omit<LayerFolderChildDataSourceConstructorOptions, 'layer'>;
    private createChildDataSourceJsonByLayerDefinition;
    protected findLayerDefinitionInfo(childId: string): {
        proxyUrl: string;
        url: string;
        order: number;
        partialLayerDefinition: Partial<ServiceDefinition>;
    };
    protected updateServiceDefinitionByLayer(): void;
    private fetchServiceDefinitionByUrl;
    private getPartialSubLayerDefinitions;
    private getPartialLayerAndTableDefinitions;
    protected getChildIdByLayerDefinition(layerDefinition: ServiceDefinition, url: string): string;
    protected getChildIdByLayer(layer: __esri.Layer): string;
    protected getChildIdBySubLayer(subLayer: __esri.Sublayer): string;
    protected getChildIdsByUrl(): string[];
    protected updateChildDataSourcesGDBVersion(childDss: DataSource[]): void;
    getGDBVersion(): string;
    changeGDBVersion(gdbVersion: string): void;
}
export {};
