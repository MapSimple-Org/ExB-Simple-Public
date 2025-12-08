import type { IItem } from '@esri/arcgis-rest-portal';
import { type DataSource } from 'jimu-core';
import type { Constructor } from '../types';
export declare const ItemMixinImpl: <TBase extends Constructor<DataSource>>(Base: TBase) => {
    new (...args: any[]): {
        _itemId: string;
        _portalUrl: string;
        itemData: any;
        itemInfo: IItem;
        itemId: string;
        portalUrl: string;
        getItemData(): any;
        setItemData(itemData: any): void;
        /**
         * Classes that extend this class may get item info from other sources, e.g. JSAPI layer object.
         */
        setItemInfo(itemInfo: any): void;
        getItemInfo(): IItem;
        fetchItemData(): Promise<any>;
        fetchItemInfo(): Promise<IItem>;
        clearData(): void;
    };
} & TBase;
