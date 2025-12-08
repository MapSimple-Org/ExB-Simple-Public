export declare function getPortalSelfInfoUrl(_portalUrl: string): string;
export declare function getBaseGroupUrl(_portalUrl: string): string;
export declare function getPortalUrlFromLocation(): string;
export declare function getPortalRestUrl(portalUrl: string): string;
/**
 * the portal url does not have ending slash
 * @param portalRestUrl
 */
export declare function getPortalUrlFromRestUrl(portalRestUrl: string): string;
export declare function isSamePortalUrl(_portalUrl1: any, _portalUrl2: any): boolean;
/**
 * all of the devext, qaext, prod return true
 * @param url
 */
export declare function isAGOLDomain(url: any): boolean;
export declare function getStandardPortalUrl(portalUrl: string): string;
export declare function getBaseItemUrl(_portalUrl: any): string;
export declare function getItemUrl(_portalUrl: any, _itemId: any): string;
export declare function getBaseUserUrl(_portalUrl: any): string;
export declare function getUserUrl(_portalUrl: any, _userId: any): string;
export declare function getContentUrl(_portalUrl: any): string;
export declare function getUserContentUrl(_portalUrl: any, _user: any, _folderId?: any): string;
export declare function getUserItemsUrl(_portalUrl: any, _user: any, _folderId?: any): string;
export declare function shareItemUrl(_portalUrl: any, _user: any, _itemId: any, _folderId: any): string;
export declare function getHomeIndexUrl(_portalUrl: any): string;
export declare function getHomeMapViewerUrl(_portalUrl: any, /* optional */ itemId: any): string;
export declare function fixPortalUrlProtocol(portalUrl: string): string;
export declare function getPortalProxyUrl(portalUrl: string): string;
/**
 * Get platform url by your org url.
 * If the version is portal, it will return orgUrl directly.
 * If the version is online, it will transfer to platform url.
 * @example
 * orgUrl is http://esridevbeijing.maps.arcgis.com
 * platform is http://www.arcgis.com
 *
 * @param orgUrl
 */
export declare function getPlatformUrlByOrgUrl(orgUrl: string): string;
export declare function isPlatformUrl(url: string): boolean;
