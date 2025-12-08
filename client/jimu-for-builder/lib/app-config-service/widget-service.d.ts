import { type IMAppConfig, type WidgetJson, type IMWidgetJson, type LayoutInfo, type DuplicateContext, BrowserSizeMode } from 'jimu-core';
import { BaseContentService } from './base-content-service';
import type { TocNode } from './base-layout-service';
import type { Template } from '../templates';
/**
 * Widget manages some resources, e.g. layout, data source, data action, etc.
 * Will handle all properties listed in the WidgetJson except the config
 */
export declare class WidgetService extends BaseContentService {
    private readonly dsService;
    private readonly messageActionService;
    private readonly dataActionService;
    private readonly useMapService;
    constructor();
    createFromTemplate(appConfig: IMAppConfig, templateJson: Template, widgetId: string, sizeModeList: BrowserSizeMode[], context: DuplicateContext, options: any): Promise<[appConfig: IMAppConfig, newId: string]>;
    /**
     * Apply widget configs and other resources from template.
     * Used in card, bookmark which have template layout.
     * @param appConfig
     * @param templateJson
     * @param widgetId
     * @param templateWidgetId
     * @param context
     * @param settingDefaultMessages
     * @returns
     */
    updateWidgetByTemplate(appConfig: IMAppConfig, templateJson: Template, widgetId: string, templateWidgetId: string, sizeModeList: BrowserSizeMode[], context: DuplicateContext): Promise<IMAppConfig>;
    /**
     * The widgetJson should have been processed by AppWidgetManager.getInstance().handleNewWidgetJson(widgetJson)
     * and it's ready to be added into appConfig
     * @param appConfig
     * @param widgetJson
     * @param sizeModeList
     * @param createEmbedLayout
     * @returns
     */
    createWidget(appConfig: IMAppConfig, widgetJson: WidgetJson | IMWidgetJson, sizeModeList: BrowserSizeMode[], createEmbedLayout?: boolean): [appConfig: IMAppConfig, widgetId: string];
    duplicateEmbedLayout(appConfig: IMAppConfig, contentId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newContentId: string];
    duplicate(appConfig: IMAppConfig, contentId: string, targetBrowserSize: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, newId: string];
    tryRemove(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    remove(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    toTocNode(appConfig: IMAppConfig, contentId: string, parent: LayoutInfo, browserSizeMode: BrowserSizeMode): TocNode;
    afterMoved(appConfig: IMAppConfig, contentId: string, fromLayout: string, toLayout: string): IMAppConfig;
    /**
     * 1. add new widget
     * 2. add pending item back to the layout, may be from different size mode
     * @param appConfig
     * @param contentId
     * @param toLayout
     * @param fromSizeMode
     * @param toSizeMode
     * @returns
     */
    afterAdded(appConfig: IMAppConfig, contentId: string, toLayout: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMAppConfig;
    /**
     * Clear resource related to this widget
     * @param appConfig
     * @param contentId
     */
    beforeRemoved(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    private beforeDuplicated;
    private replaceUseDataSource;
    /**
     * Invoke the afterWidgetCopied when a size mode layouts is duplicate.
     * @param destAppConfig
     * @param context
     */
    afterBatchCopied(destAppConfig: IMAppConfig, sourceAppConfig: IMAppConfig, context: DuplicateContext): IMAppConfig;
    addParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode): IMAppConfig;
    removeParent(appConfig: IMAppConfig, contentId: string, layoutInfo: LayoutInfo, sizeMode?: BrowserSizeMode): IMAppConfig;
    clearParent(appConfig: IMAppConfig, contentId: string): IMAppConfig;
    removeSizeModeParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): IMAppConfig;
    findParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): LayoutInfo;
    hasParent(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
    hasMultipleParents(appConfig: IMAppConfig, contentId: string, browserSizeMode: BrowserSizeMode): boolean;
}
declare const _default: WidgetService;
export default _default;
