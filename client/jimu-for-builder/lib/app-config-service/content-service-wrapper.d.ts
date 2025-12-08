import { type IMAppConfig, type IMLayoutItemJson, type LayoutInfo, type BrowserSizeMode, type LayoutItemJson, type DuplicateContext } from 'jimu-core';
import type { BaseContentService } from './base-content-service';
import type { TocNode } from './base-layout-service';
import type { Template } from '../templates';
export declare class ContentServiceWrapper {
    private appConfig;
    private readonly layoutItem;
    service: BaseContentService;
    contentId: string;
    constructor(appConfig: IMAppConfig, layoutItem: LayoutItemJson | IMLayoutItemJson);
    getConfig(): IMAppConfig;
    getContentId(): string;
    createFromTemplate(templateJson: Template, sizeModeList: BrowserSizeMode[], context: DuplicateContext, options?: any): Promise<[appConfig: IMAppConfig, newContentId: string]>;
    duplicateEmbedLayout(fromSizeMode: BrowserSizeMode, toSizeMdoe: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newContentId: string];
    duplicate(targetBrowserSize: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    tryRemove(layoutInfo: LayoutInfo, browserSizeMode: BrowserSizeMode): IMAppConfig;
    remove(): IMAppConfig;
    toTocNode(parent: LayoutInfo, browserSizeMode: BrowserSizeMode): TocNode;
    afterMoved(fromLayoutId: string, toLayoutId: string): IMAppConfig;
    afterAdded(layoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMAppConfig;
    addParent(layoutInfo: LayoutInfo, browserSizeMode: BrowserSizeMode): IMAppConfig;
    removeParent(layoutInfo: LayoutInfo, browserSizeMode: BrowserSizeMode): IMAppConfig;
    clearParent(): IMAppConfig;
    removeSizeModeParent(browserSizeMode: BrowserSizeMode): IMAppConfig;
    findParent(browserSizeMode: BrowserSizeMode): LayoutInfo;
    hasParent(browserSizeMode: BrowserSizeMode): boolean;
    hasMultipleParents(browserSizeMode: BrowserSizeMode): boolean;
}
