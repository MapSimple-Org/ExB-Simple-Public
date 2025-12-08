import type { IParams } from '@esri/arcgis-rest-request';
import { type AppCreationInfo, type AppConfig, type IMAppConfig } from 'jimu-core';
import type { ISearchOptions, ISharingResponse, IMoveItemOptions, IMoveItemResponse, IGetUserTagsResponse, IGroup, SearchQueryBuilder, ISearchResult, IItemUpdate, IGroupCategorySchema } from '@esri/arcgis-rest-portal';
import { type AppInfo, SearchType, type ImportAppOption, type SaveAsResponse, type TransferAppParams, type TransferAppResponse, type AppInfoItemForNewApp } from '../type';
export { replaceExbVersionInAppConfig } from './util';
export { createAppByItemTemplateInfo, createAppByItemTemplateId, createAppByDefaultTemplate, createTemplateByApp } from './create-app-or-template';
/**
 * folderId: If the folderId has a value, the app will be created in the folder corresponding to the folderId
*/
export declare function duplicateApp(appInfo: AppInfo, folderId?: string, isNotUpdateNewAppTitle?: boolean): Promise<string>;
export declare function transferAppToFullMode(params: TransferAppParams): Promise<TransferAppResponse>;
export declare function importAppFromZip(importAppOption: ImportAppOption): Promise<import("@esri/arcgis-rest-portal").IUpdateItemResponse>;
export declare function checkImportAppVersion(importAppOption: ImportAppOption): Promise<import("@esri/arcgis-rest-portal").IUpdateItemResponse>;
export declare function importAppFromPortal(portalAppInfo: AppInfo): Promise<any>;
export declare function saveApp(appInfo: AppInfo, appConfig: IMAppConfig, updatePublishStatus?: boolean, newAppId?: string): Promise<void>;
/**
 * folderId: If the folderId has a value, the app will be created in the folder corresponding to the folderId
*/
export declare function saveAsApp(originAppInfo: AppInfo, appInfoItemForNewApp: AppInfoItemForNewApp, folderId?: string, thumbnailFiles?: any, unlockLayout?: boolean): Promise<SaveAsResponse>;
export declare function getPublishedAppConfig(appInfo: AppInfo): Promise<any>;
export declare function getDraftAppConfig(appInfo: AppInfo): Promise<any>;
export declare function getDefaultTemplateConfig(appInfo: AppCreationInfo): Promise<AppConfig>;
export declare function searchApp(searchOption: ISearchOptions, searchType: SearchType): Promise<ISearchResult<AppInfo>>;
export declare function searchAppByPortalUrl(searchOption: ISearchOptions, portalUrl: string): Promise<ISearchResult<AppInfo>>;
export declare function getGroupCategorySchema(groupId: string, isGetAGOLCategorySchema?: boolean): Promise<IGroupCategorySchema>;
export declare function getOrgCategorySchema(isGetAGOLCategorySchema?: boolean): Promise<AppInfo>;
export declare function getGroupContent(groupId: string, params?: IParams, isGetAGOLGroupContent?: boolean): Promise<AppInfo>;
export declare function getFolders(requestOption: IParams): Promise<any>;
export declare function getUserTags(username: string): Promise<IGetUserTagsResponse>;
export declare function searchGroups(requestOptions: ISearchOptions | SearchQueryBuilder): Promise<ISearchResult<IGroup>>;
export declare function getAppInfo(appInfo: AppInfo): Promise<AppInfo>;
export declare function getAppGroups(params: IParams): Promise<ISharingResponse>;
export declare function updateAppInfo(itemParam: IItemUpdate, owner: string): Promise<void>;
export declare function updateAppInfoWhenSaveApp(appInfo: AppInfo): Promise<any>;
export declare function updateAppThumbnail(itemParam: IItemUpdate, owner?: string): Promise<void>;
export declare function addToFavorites(params: IParams): Promise<ISharingResponse>;
export declare function removeFromFavorites(params: IParams): Promise<ISharingResponse>;
export declare function changeAppFolder(params: IMoveItemOptions): Promise<IMoveItemResponse>;
export declare function deleteApp(appId: string): Promise<{
    itemId: string;
    success: boolean;
}>;
export declare function publishApp(appInfo: AppInfo): Promise<AppInfo>;
