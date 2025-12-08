import type { ProxyJson } from 'jimu-core';
/**
 * Config of one proxy item. Will use the config to create app proxy after clicking save button.
 */
export interface ProxySettingConfig extends Pick<ProxyJson, 'sourceUrl' | 'hitsPerInterval' | 'intervalSeconds'> {
}
export interface NeedProxyItemsGroupedByUrl {
    items: Array<{
        label: string;
        id: string;
    }>;
    isPremium: boolean;
    isSubscriber: boolean;
}
export interface NeedProxyItems {
    [sourceUrl: string]: NeedProxyItemsGroupedByUrl;
}
export interface ProxySettingConfigs {
    [sourceUrl: string]: ProxySettingConfig;
}
