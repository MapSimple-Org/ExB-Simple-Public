import { type IMPlaceholderInfo, type IMAppConfig, type LayoutInfo } from 'jimu-core';
export declare class PlaceholderService {
    isSupported(): boolean;
    getNextPlaceholderId(appConfig: IMAppConfig): number;
    addAsSyncablePlaceholder(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    getPlaceholderInfo(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMPlaceholderInfo;
    afterLayoutItemMoved(appConfig: IMAppConfig, fromLayoutInfo: LayoutInfo, toLayoutInfo: LayoutInfo): IMAppConfig;
    afterLayoutItemCopied(appConfig: IMAppConfig, fromLayoutInfo: LayoutInfo, toLayoutInfo: LayoutInfo): IMAppConfig;
    afterLayoutItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
}
declare const _default: PlaceholderService;
export default _default;
