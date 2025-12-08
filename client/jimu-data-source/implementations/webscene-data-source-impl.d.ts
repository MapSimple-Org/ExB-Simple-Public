import type { IItem } from '@esri/arcgis-rest-portal';
import { DataSourceTypes, type WebSceneDataSource } from 'jimu-core';
import { type MapDataSourceConstructorOptions, MapDataSourceImpl } from './map-data-source-impl';
export interface WebSceneDataSourceConstructorOptions extends MapDataSourceConstructorOptions {
    map?: __esri.WebScene;
}
declare const WebSceneDataSourceImpl_base: {
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
export declare class WebSceneDataSourceImpl extends WebSceneDataSourceImpl_base implements WebSceneDataSource {
    type: DataSourceTypes.WebScene;
    map: __esri.WebScene;
    constructor(options: WebSceneDataSourceConstructorOptions);
    protected createMap(): Promise<void>;
    private initItem;
}
export {};
