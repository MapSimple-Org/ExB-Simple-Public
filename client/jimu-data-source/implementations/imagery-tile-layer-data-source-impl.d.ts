import { DataSourceTypes } from 'jimu-core';
import type { DataSourceConstructorOptions, ImageryTileLayerDataSource, GetCurrentTimeParamsOptions, ImageryTileLayerTimeParams } from 'jimu-core';
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service';
import { AbstractDataSource } from '../base-classes/abstract-data-source';
export interface ImageTileServiceDataSourceConstructorOptions extends DataSourceConstructorOptions {
    layer?: __esri.ImageryTileLayer;
}
declare const ImageryTileLayerDataSourceImpl_base: {
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
export declare class ImageryTileLayerDataSourceImpl extends ImageryTileLayerDataSourceImpl_base implements ImageryTileLayerDataSource {
    layer?: __esri.ImageryTileLayer;
    type: DataSourceTypes.ImageryTileLayer;
    private layerDefinition;
    constructor(options: ImageTileServiceDataSourceConstructorOptions);
    getLayerDefinition(): ILayerDefinition;
    setLayerDefinition(layerDef: ILayerDefinition): void;
    supportTime(): boolean;
    getTimeInfo(): any;
    updateQueryParams(timeParam: ImageryTileLayerTimeParams, widgetId: string): void;
    getCurrentQueryParams(options?: GetCurrentTimeParamsOptions): ImageryTileLayerTimeParams;
    private getMergedWidgetTimes;
    private mergeTimeParams;
    ready(): Promise<void>;
}
export {};
