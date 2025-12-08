import type { IItem } from '@esri/arcgis-rest-portal';
import { DataSourceTypes, type WebMapDataSource } from 'jimu-core';
import { type MapDataSourceConstructorOptions, MapDataSourceImpl } from './map-data-source-impl';
export interface WebMapDataSourceConstructorOptions extends MapDataSourceConstructorOptions {
    map?: __esri.WebMap;
}
declare const WebMapDataSourceImpl_base: {
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
} & typeof MapDataSourceImpl;
export declare class WebMapDataSourceImpl extends WebMapDataSourceImpl_base implements WebMapDataSource {
    type: DataSourceTypes.WebMap;
    map: __esri.WebMap;
    constructor(options: WebMapDataSourceConstructorOptions);
    protected createMap(): Promise<void>;
    private initItem;
}
export {};
