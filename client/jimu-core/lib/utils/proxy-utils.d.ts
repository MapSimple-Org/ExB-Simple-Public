import type { IItem } from '@esri/arcgis-rest-portal';
import type { IMDataSourceJson, IMUtilityJson } from '../types/app-config';
export declare function getWhetherUseProxy(): boolean;
export declare function getProxyUrl(sourceUrl: string): string;
export declare function registerProxyReferrer(url: string): void;
export declare function unregisterProxyReferrer(url: string): void;
export declare function getProxyReferrers(): string[];
export declare function isSubscriber(item: IItem, serviceUrl: string): boolean;
export declare function isPremium(item: IItem, serviceUrl: string): boolean;
export declare function isDataSourceSubscriber(dsJson: IMDataSourceJson): Promise<boolean>;
export declare function isDataSourcePremium(dsJson: IMDataSourceJson): Promise<boolean>;
/**
 * Some data is subscriber but isn't premium, some is premium but isn't subscriber.
 */
export declare function isDataSourceSubscriberOrPremium(dsJson: IMDataSourceJson): Promise<boolean>;
export declare function isUtilitySubscriber(utilityJson: IMUtilityJson): Promise<boolean>;
export declare function isUtilityPremium(utilityJson: IMUtilityJson): Promise<boolean>;
