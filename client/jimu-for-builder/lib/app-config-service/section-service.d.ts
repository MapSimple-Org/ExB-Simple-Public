import { type IMAppConfig, type LayoutInfo, BrowserSizeMode, type ViewJson, type DuplicateContext } from 'jimu-core';
import { BaseContentService } from './base-content-service';
import type { Template } from '../templates';
import type { TocNode } from './base-layout-service';
export declare class SectionService extends BaseContentService {
    private readonly messageActionService;
    constructor();
    createFromTemplate(appConfig: IMAppConfig, templateJson: Template, sectionId: string, sizeModeList: BrowserSizeMode[], context: DuplicateContext): Promise<[appConfig: IMAppConfig, newId: string]>;
    private createViewFromTemplate;
    duplicateEmbedLayout(appConfig: IMAppConfig, contentId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newContentId: string];
    /**
     * Duplicate a section, only duplicate the content in target browser size mode.
     * @param appConfig
     * @param contentId id of the section
     * @param context duplicating context, keeps the relation between original id and duplicated id
     * @returns updatd app config and the id of the duplicated section
     */
    duplicate(appConfig: IMAppConfig, contentId: string, targetBrowserSize: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    private removeDirectly;
    tryRemove(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Remove a section
     * @param appConfig
     * @param contentId id of the section
     * @returns updatd app config
     */
    remove(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    toTocNode(appConfig: IMAppConfig, contentId: string, parent: LayoutInfo, browserSizeMode: BrowserSizeMode): TocNode;
    afterMoved(appConfig: IMAppConfig, contentId: string, fromLayout: string, toLayout: string): IMAppConfig;
    afterAdded(appConfig: IMAppConfig, contentId: string, toLayout: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Add a parent layoutInfo to this section. Occurs when this section is added to a layout item.
     * @param appConfig
     * @param contentId
     * @param layoutInfo
     * @param sizeMode
     * @returns
     */
    addParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Remove a parent layoutInfo from this section. Occurs when this section is removed from a layout item.
     * @param appConfig
     * @param contentId id of the section
     * @param layoutInfo refer to a layout item
     * @param sizeMode the environment of this operation
     * @returns
     */
    removeParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode?: BrowserSizeMode): IMAppConfig;
    clearParent(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    removeSizeModeParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Find the parent of a section in the size mode
     * @param appConfig
     * @param contentId
     * @param sizeMode
     * @returns
     */
    findParent(appConfig: IMAppConfig, contentId: string, sizeMode: BrowserSizeMode): LayoutInfo;
    hasParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
    hasMultipleParents(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
    /**
     * Create a new section. The size mode list is used to generate the layout of the view.
     * @param appConfig
     * @param sizeModeList
     * @returns
     */
    createSection(appConfig: IMAppConfig, sizeModeList: BrowserSizeMode[]): [appConfig: IMAppConfig, sectionId: string];
    /**
     * Create a blank view. Only unique id and parent set.
     * @param appConfig
     * @param sectionId
     * @returns
     */
    createBlankView(appConfig: IMAppConfig, sectionId: string): ViewJson;
    /**
     * Generate and add a new view to the section.
     * @param appConfig
     * @param sectionId
     * @param sizeModeList
     * @returns
     */
    addView(appConfig: IMAppConfig, sectionId: string, sizeModeList: BrowserSizeMode[]): [appConfig: IMAppConfig, viewId: string];
    /**
     * Duplicate an existing view. Only duplicate the content in specified browser size modes.
     * @param appConfig
     * @param sectionId
     * @param viewId
     * @param sizeModeList
     * @param targetBrowserSize
     * @param addToSection
     * @param context
     * @returns
     */
    duplicateView(appConfig: IMAppConfig, sectionId: string, viewId: string, sizeModeList: BrowserSizeMode[], addToSection: boolean, context: DuplicateContext): [appConfig: IMAppConfig, viewId: string];
    /**
     * Remove a view.
     * @param appConfig
     * @param sectionId
     * @param viewId
     * @returns
     */
    removeView(appConfig: IMAppConfig, sectionId: string, viewId: string): IMAppConfig;
}
declare const _default: SectionService;
export default _default;
