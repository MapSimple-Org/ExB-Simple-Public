import type { IMAppConfig, ImmutableArray, LayoutInfo, BrowserSizeMode, DuplicateContext } from 'jimu-core';
import type { Template } from '../templates/type';
import type { TocNode } from './base-layout-service';
export declare abstract class BaseContentService {
    abstract createFromTemplate(appConfig: IMAppConfig, templateJson: Template, sectionId: string, sizeModeList: BrowserSizeMode[], contentMapping: DuplicateContext, options?: any): Promise<[appConfig: IMAppConfig, newId: string]>;
    abstract duplicate(appConfig: IMAppConfig, contentId: string, targetBrowserSize: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    abstract duplicateEmbedLayout(appConfig: IMAppConfig, contentId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newContentId: string];
    /**
     * Try to remove a content. It is used in removing a layout during which every layout item is being removed.
     * But a content may be used in multiple places. Only remove the content when:
     * - There is no parent in other size modes other than the specified sizeMode
     * If there are two multiple parents in the specified sizeMode, remove them both.
     * @param appConfig
     * @param contentId
     * @param layoutInfo
     * @param sizeMode
     */
    abstract tryRemove(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Force to remove a content and all its parent layout items.
     * 1. Find all parent items, remove them
     * 2. remove the content
     * @param appConfig
     * @param contentId
     */
    abstract remove(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    abstract toTocNode(appConfig: IMAppConfig, contentId: string, parent: LayoutInfo, browserSizeMode: BrowserSizeMode): TocNode;
    /**
     * Hooks to be called after a content is moved to another layout.
     * Occurs in same size mode.
     * @param appConfig
     * @param contentId
     * @param fromLayout
     * @param toLayout
     */
    abstract afterMoved(appConfig: IMAppConfig, contentId: string, fromLayout: string, toLayout: string): IMAppConfig;
    /**
     * Hooks to be called after a content is added to a layout.
     * Occurs in the following cases:
     * 1. Drag to add a new content to a layout.
     * 2. Drag a pending item to a layout.
     * @param appConfig
     * @param contentId
     * @param toLayout
     * @param fromSizeMode
     * @param toSizeMdoe
     */
    abstract afterAdded(appConfig: IMAppConfig, contentId: string, toLayout: string, fromSizeMode: BrowserSizeMode, toSizeMdoe: BrowserSizeMode): IMAppConfig;
    abstract findParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): LayoutInfo;
    abstract hasParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
    abstract hasMultipleParents(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
    abstract addParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, browserSizeMode: BrowserSizeMode): IMAppConfig;
    abstract removeParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, browserSizeMode?: BrowserSizeMode): IMAppConfig;
    abstract removeSizeModeParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): IMAppConfig;
    abstract clearParent(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    protected addParentToList(appConfig: IMAppConfig, existingParents: ImmutableArray<LayoutInfo>, parent: LayoutInfo): LayoutInfo[] | ImmutableArray<LayoutInfo>;
    protected removeParentFromList(existingParents: ImmutableArray<LayoutInfo>, parent: LayoutInfo): LayoutInfo[] | ImmutableArray<LayoutInfo>;
}
