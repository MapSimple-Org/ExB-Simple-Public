import type { AppInfo } from '../type';
import type { ArcGISIdentityManager } from '@esri/arcgis-rest-request';
export declare function getSession(appInfo: AppInfo): ArcGISIdentityManager;
export declare function isPortalApp(appInfo: AppInfo): boolean;
export declare function isLocalApp(appInfo: AppInfo): boolean;
export declare function getResourceOrigin(originalAppInfo: AppInfo): string;
export declare function isAGOLApp(appInfo: AppInfo): boolean;
