import type { IParams, IRequestOptions } from '@esri/arcgis-rest-request';
export declare function getUserContent(requestOptions: IParams): Promise<any>;
export declare function getGroupContent(groupId: string, requestOptions?: IRequestOptions, isGetAGOLContent?: boolean): Promise<any>;
