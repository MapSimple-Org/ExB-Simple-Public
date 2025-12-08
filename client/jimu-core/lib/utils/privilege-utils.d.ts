import { type ArcGISIdentityManager, type IUser } from '@esri/arcgis-rest-request';
import type { AppConfig } from '../types/app-config';
import { SystemErrorCode } from '../types/state';
export interface ExbAccess {
    valid: boolean;
    capabilities: Capabilities;
    invalidInfo: SystemErrorCode;
    invalidMessage: string;
}
export interface ExbLicense {
    valid: boolean;
    viewOnly: boolean;
    messageCode?: string;
}
export interface ResourcePermission {
    valid: boolean;
    isExperience: boolean;
    isValidItem: boolean;
    hasPermissionToAccess: boolean;
    viewOnly: boolean;
}
export interface Capabilities {
    canViewExperience: boolean;
    canCreateExperience: boolean;
    canUpdateExperience: boolean;
    canDeleteExperience: boolean;
    canShareExperience: boolean;
    canEditFeature?: boolean;
}
export declare enum CheckTarget {
    AppList = "AppList",
    Builder = "Builder",
    Experience = "Experience"
}
export declare function checkAccess(checkTarget: CheckTarget): Promise<boolean>;
export declare function getAccessCapabilities(checkTarget: CheckTarget): Promise<Capabilities>;
export declare function checkExbAccess(checkTarget: CheckTarget, isExBChromeExtensionInstalled?: boolean, disableCache?: boolean): Promise<ExbAccess>;
export declare const checkEditAppPermission: (appItem: any) => Promise<boolean>;
export declare function getInvalidMessage(checkTarget: CheckTarget, invalidInfo: SystemErrorCode): string;
export declare function getPortalVersion(): Promise<string>;
export declare function isPortal1061OrBefore(): Promise<boolean>;
export declare function isPortal1080OrBefore(): Promise<boolean>;
export declare const getUser: () => Promise<IUser>;
export declare function canCreateItem(): Promise<boolean>;
export declare function canPublishFeatures(): Promise<boolean>;
export declare const getItemInfo: (itemId: string, disableCache?: boolean) => Promise<any>;
export declare function shouldCheckAppAccess(checkTarget: CheckTarget): Promise<boolean>;
export declare function isItemInTheUpdatedGroup(itemId: string, sessionForItem?: ArcGISIdentityManager): Promise<boolean>;
export declare const getRestrictedPageIds: (appConfig: AppConfig) => Promise<string[]>;
