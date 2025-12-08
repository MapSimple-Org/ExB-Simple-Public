import { type UserSettingInfo } from 'jimu-core';
import type { IParams } from '@esri/arcgis-rest-request';
export declare function addUserResource(params?: IParams, resourceName?: string): Promise<{
    success: boolean;
}>;
export declare function getUserResource(resourceName?: string): Promise<UserSettingInfo>;
export declare function getUserResources(): Promise<{
    total: number;
    start: number;
    num: number;
    nextStart: number;
    userResources: any[];
}>;
export declare function removeUserResource(resourceName?: string): Promise<{
    success: boolean;
}>;
export declare function updateUserResource(options: Partial<UserSettingInfo>): Promise<{
    success: boolean;
}>;
export declare function initUserResource(): Promise<{
    success: boolean;
}>;
