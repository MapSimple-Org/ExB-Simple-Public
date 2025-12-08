import { type DataSourceConstructorOptions, DataSourceTypes, type WFSDataSource } from 'jimu-core';
import { AbstractDataSource } from '../base-classes/abstract-data-source';
export interface WFSDataSourceConstructorOptions extends DataSourceConstructorOptions {
    layer?: __esri.WFSLayer;
}
declare const WFSDataSourceImpl_base: {
    new (...args: any[]): {
        id: string;
        type: DataSourceTypes;
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
        itemInfo: import("@esri/arcgis-rest-portal").IItem;
        itemId: string;
        portalUrl: string;
        getItemData(): any;
        setItemData(itemData: any): void;
        setItemInfo(itemInfo: any): void;
        getItemInfo(): import("@esri/arcgis-rest-portal").IItem;
        fetchItemData(): Promise<any>;
        fetchItemInfo(): Promise<import("@esri/arcgis-rest-portal").IItem>;
        clearData(): void;
    };
} & typeof AbstractDataSource;
export declare class WFSDataSourceImpl extends WFSDataSourceImpl_base implements WFSDataSource {
    layer?: __esri.WFSLayer;
    type: DataSourceTypes.WFS;
    constructor(options: WFSDataSourceConstructorOptions);
    ready(): Promise<void>;
}
export {};
