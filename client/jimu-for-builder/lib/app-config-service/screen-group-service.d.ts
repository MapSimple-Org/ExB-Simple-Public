import { type IMAppConfig, type LayoutInfo, type DuplicateContext, BrowserSizeMode } from 'jimu-core';
import { BaseContentService } from './base-content-service';
import type { Template } from '../templates';
import type { TocNode } from './base-layout-service';
export declare class ScreenGroupService extends BaseContentService {
    createFromTemplate(appConfig: IMAppConfig, templateJson: Template, screenGroupId: string, sizeModeList: BrowserSizeMode[], contentMapping: DuplicateContext): Promise<[appConfig: IMAppConfig, newId: string]>;
    createScreenFromTemplate(appConfig: IMAppConfig, templateJson: Template, screenId: string, sizeModeList: BrowserSizeMode[], contentMapping: DuplicateContext): Promise<[appConfig: IMAppConfig, newScreenId: string]>;
    duplicateEmbedLayout(appConfig: IMAppConfig, contentId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newContentId: string];
    duplicate(appConfig: IMAppConfig, contentId: string, targetBrowserSize: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    tryRemove(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    remove(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    toTocNode(appConfig: IMAppConfig, contentId: string, parent: LayoutInfo, browserSizeMode: BrowserSizeMode): TocNode;
    afterMoved(appConfig: IMAppConfig, contentId: string, fromLayout: string, toLayout: string): IMAppConfig;
    afterAdded(appConfig: IMAppConfig, contentId: string, toLayout: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMAppConfig;
    addParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    removeParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode?: BrowserSizeMode): IMAppConfig;
    clearParent(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    removeSizeModeParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): IMAppConfig;
    findParent(appConfig: IMAppConfig, contentId: string, sizeMode: BrowserSizeMode): LayoutInfo;
    hasParent(appConfig: IMAppConfig, contentId: string, sizeMode: BrowserSizeMode): boolean;
    hasMultipleParents(): boolean;
    duplicateScreen(appConfig: IMAppConfig, sgId: string, screenId: string, sizeModeList: BrowserSizeMode[], addToScreenGroup: boolean, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    removeScreen(appConfig: IMAppConfig, contentId: string, screenId: string): IMAppConfig;
}
declare const _default: ScreenGroupService;
export default _default;
