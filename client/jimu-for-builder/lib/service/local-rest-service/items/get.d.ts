import type { IRequestOptions } from '@esri/arcgis-rest-request';
import type { IItem } from '@esri/arcgis-rest-portal';
import type { IItemDataOptions } from './helpers';
export declare function getItemData(id: string, requestOptions?: IItemDataOptions, isArcGisOnlineRequest?: boolean): Promise<any>;
export declare function getItem(id: string, requestOptions?: IRequestOptions, isArcGisOnlineRequest?: boolean): Promise<IItem>;
export declare function getUserTags(requestOptions?: IRequestOptions): Promise<IItem>;
export declare function getItemResources(id: string, requestOptions?: IRequestOptions, isArcGisOnlineRequest?: boolean): Promise<any>;
export declare function getItemResource(id: string, requestOptions?: IRequestOptions, isArcGisOnlineRequest?: boolean): Promise<any>;
