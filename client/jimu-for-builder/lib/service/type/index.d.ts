import type { IItem, IItemAdd } from '@esri/arcgis-rest-portal';
import type { AppConfig, IMAppConfig } from 'jimu-core';
export interface requestMethodProvider {
    requestMethodProvider: (restPortalRequestName: string, localRequestName?: string, appInfo?: AppInfo) => any;
}
export interface AppInfoItemForNewApp {
    title?: string;
    tags?: any;
    snippet?: string;
    name?: string;
    typeKeywords?: string[];
    classification?: __esri.PortalItem['classification'];
}
export declare enum SearchType {
    AGOL = "AGOL",// Search AGOL app
    Portal = "Portal",// Search portal app
    Other = "Other"
}
export declare enum AppType {
    TemplateType = "Web Experience Template",
    ExperienceType = "Web Experience"
}
export declare enum PublishStatus {
    Published = "Published",
    Draft = "Draft",// Item is not published
    Changed = "Changed"
}
export interface AppInfo extends IItem {
    id: string;
    type: AppType;
    name?: string;
    text?: any;
    username?: string;
    thumbnail?: string;
    isLocalApp?: boolean;
    portalUrl?: string;
    classification?: __esri.PortalItem['classification'];
}
export interface ImportAppOption extends IItemAdd {
    appZip: any;
}
export interface SaveAsResponse {
    id: string;
    appConfig?: AppConfig;
    appInfo: AppInfo;
}
export interface TransferAppResponse {
    id?: string;
    appConfig?: AppConfig;
    appInfo: AppInfo;
}
export interface TransferAppParams {
    folderId?: string;
    appInfo: AppInfo;
    appConfig?: IMAppConfig;
    transferDirectly?: boolean;
}
