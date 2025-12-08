import type { ICreateItemOptions, ICreateItemResponse, IItemDataOptions } from '@esri/arcgis-rest-portal';
import type { ImportAppOption } from '../../type';
export declare function createItem(requestOptions: ICreateItemOptions): Promise<ICreateItemResponse>;
export declare function importItem(item: ImportAppOption, requestOptions: IItemDataOptions): Promise<ICreateItemResponse>;
export declare function checkItemVersion(item: ImportAppOption, requestOptions: IItemDataOptions): Promise<ICreateItemResponse>;
