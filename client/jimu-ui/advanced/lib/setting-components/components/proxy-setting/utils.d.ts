import { type ImmutableObject, type IMProxyJson, type ProxyJson, type DataSource, type Utility } from 'jimu-core';
import type { AppConfigAction } from 'jimu-for-builder';
import type { NeedProxyItems } from './types';
export declare function getNeedProxyItems(): Promise<NeedProxyItems>;
export declare function getNeedProxyDataSources(): Promise<{
    [sourceUrl: string]: {
        dataSources: DataSource[];
        isPremium: boolean;
        isSubscriber: boolean;
    };
}>;
export declare function getNeedProxyUtilities(): Promise<{
    [sourceUrl: string]: {
        utilities: Utility[];
        isPremium: boolean;
        isSubscriber: boolean;
    };
}>;
/**
 * If forceToCreateProxy is true, will force to create proxy for all subscriber descendant data sources.
 */
export declare function traverseToGetNeedProxyDataSources(dataSource: DataSource, forceToCreateProxy?: boolean): Promise<{
    [sourceUrl: string]: {
        dataSources: DataSource[];
        isPremium: boolean;
        isSubscriber: boolean;
    };
}>;
export declare function getProxyJsonFromSourceUrl(sourceUrl: string, appProxies: ImmutableObject<{
    [proxyId: string]: ProxyJson;
}>): IMProxyJson;
export declare function isSameProxy(existingProxyJson: IMProxyJson, sourceUrl: string, hitsPerInterval: number, intervalSeconds: number): boolean;
export declare function isRegisteredApp(): boolean;
export declare function needToConfigProxy(): Promise<boolean>;
export declare function deleteProxies(proxyIds: string[], action: AppConfigAction): Promise<void>;
export declare function getProxyRootUrl(): string;
export declare function getCreateProxyUrl(): string;
export declare function getDeleteProxyUrl(): string;
