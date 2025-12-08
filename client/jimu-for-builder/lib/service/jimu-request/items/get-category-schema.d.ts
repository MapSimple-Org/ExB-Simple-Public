import type { IRequestOptions } from '@esri/arcgis-rest-request';
import type { IGroupCategorySchema } from '@esri/arcgis-rest-portal';
export declare function getGroupCategorySchema(groupId: string, requestOptions?: IRequestOptions, isArcGisOnlineRequest?: boolean): Promise<IGroupCategorySchema>;
export declare function getOrgCategorySchema(requestOptions?: IRequestOptions, isArcGisOnlineRequest?: boolean): Promise<any>;
