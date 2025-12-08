import { type IMAppConfig, type IMLayoutJson, LayoutItemType, type IMLayoutItemJson, type LayoutInfo, BrowserSizeMode, ContainerType, type IMSizeModeLayoutJson, type LayoutItemJson, type ContainerInfo, type IMState } from 'jimu-core';
export declare function findLayoutItem(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMLayoutItemJson;
/**
 * Find parent layout item in current page.
 * @param layoutInfo
 */
export declare function findParentLayoutInfo(layoutInfo: LayoutInfo, appConfig: IMAppConfig, browserSizeMode: BrowserSizeMode): LayoutInfo;
export declare function getContentIdInLayoutItem(item: IMLayoutItemJson): string;
/**
 * return the content ids in the layout. Do not consider the embedded layouts
 * @param layoutJson
 */
export declare function getContentsInLayout(layoutJson: IMLayoutJson, type: LayoutItemType, withPending?: boolean): string[];
/**
 * Return the content ids in a layout, search the whole layout tree, including the layout widget, the normal widget that has embed layout, and views, screens, etc.
 * @param appConfig
 * @param layoutId the layout to search
 * @param type content type
 * @param sizeMode the sizeMode to search
 * @param withPending will include the pending content if true
 */
export declare function getContentsInLayoutRecursive(appConfig: IMAppConfig, layoutId: string, type: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): string[];
/**
 * Return the visible widget ids in a layout, search the whole layout tree.
 * A widget is considered as hidden when:
 * - it is in a non-current view
 * - it is in a widget's layout that it's hidden
 * - it is in a layout item that is hidden
 * @param appConfig
 * @param layoutId the layout to search
 * @param sizeMode the sizeMode to search
 * @param widgetId if passed in, means the layout is in a widget
 */
export declare function getVisibleWidgetsInLayoutRecursive(state: IMState, layoutId: string, sizeMode: BrowserSizeMode, widgetId?: string): string[];
/**
 * Return the layout ids in a layout item, search the widgets with layout but don't search nested containers.
 * @param state
 * @param layoutInfo
 * @param visibleOnly
 */
export declare function getLayoutIdsInLayoutItem(state: IMState, layoutInfo: LayoutInfo, visibleOnly: boolean): string[];
/**
 * Return the content ids in a layout, search the widgets with layout but don't search nested containers.
 * @param appConfig
 * @param layoutId
 * @param type
 */
export declare function getContentsInLayoutWithRecursiveLayouts(appConfig: IMAppConfig, layoutId: string, type: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): string[];
/**
 * Return the layout item that holds the content.
 * In one layout, a content is not allowed to be put in multiple items.
 * @param layoutJson
 * @param widgetId
 */
export declare function getContentLayoutItem(layoutJson: IMLayoutJson, id: string, type: LayoutItemType): IMLayoutItemJson;
/**
 * Return the layout item ids in a layout
 * @param appConfig
 * @param layoutId
 * @param withPending
 */
export declare function getLayoutItemIds(appConfig: IMAppConfig, layoutId: string, withPending?: boolean): string[];
export declare function getLayoutInfosByType(layoutJson: IMLayoutJson, type: LayoutItemType, withPending?: boolean): LayoutInfo[];
/**
 * Find a widget id that use the layoutId
 * @param appConfig
 * @param layoutId
 */
export declare function getWidgetIdThatUseTheLayoutId(appConfig: IMAppConfig, layoutId: string): string;
/**
 * Return the container that holds the widget, search the widgets with layout but don't search the nested container.
 * @param appConfig
 * @param widgetId
 */
export declare function getContentContainerInfo(appConfig: IMAppConfig, id: string, type: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): ContainerInfo;
/**
 * Return the root container of the content, search the whole layout tree. There are 4 types of root container: page, window, header, footer.
 */
export declare function getContentRootContainerInfo(appConfig: IMAppConfig, id: string, type: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): ContainerInfo;
export declare function getRootContainerInfoOfLayout(appConfig: IMAppConfig, layoutId: string, sizeMode: BrowserSizeMode): ContainerInfo;
/**
 * Get the contents in a container. Do not search the nested container.
 */
export declare function getContentsInContainer(appConfig: IMAppConfig, containerInfo: ContainerInfo, type: LayoutItemType, browserSizeMode: BrowserSizeMode, withPending?: boolean): string[];
/**
 * Get the contents in a container. Search the whole layout tree.
 */
export declare function getContentsInContainerRecursive(appConfig: IMAppConfig, containerInfo: ContainerInfo, type: LayoutItemType, browserSizeMode: BrowserSizeMode, withPending?: boolean): string[];
/**
 * Get the contents in a container with more options, search the whole layout tree.
 *
 * header, footer and the current page body are considered as one container.
 *
 * @param options
 *    the currentPageId will be used if the container is header/footer.
 */
export declare function getContentsInContainerRecursiveAdv(appConfig: IMAppConfig, containerInfo: ContainerInfo, type: LayoutItemType, browserSizeMode: BrowserSizeMode, options: {
    includePending: boolean;
    includeOtherSizeMode: boolean;
    currentPageId?: string;
}): string[];
/**
 * Return the layoutId for specific sizeMode. If the sizeMode does not exist, return the main sizeMode layoutId.
 * @param layouts
 * @param browserSizeMode
 * @param mainSizeMode
 */
export declare function findLayoutId(layouts: IMSizeModeLayoutJson, browserSizeMode: BrowserSizeMode, mainSizeMode: BrowserSizeMode): string;
/**
 * If the content has only one parent, return it directly.
 * If the content has multiple parents, these parents must be contained in a widget's layout, return the widget's parent.
 * @param appConfig
 * @param id
 * @param type
 * @param sizeMode
 * @param withPending
 * @returns
 */
export declare function getLayoutInfoHoldContent(appConfig: IMAppConfig, id: string, type: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): LayoutInfo;
/**
 * In one layout, one widget/section is NOT allowed be put in more than one layout item.
 * However, in widget that has layouts, one widget/section may be put in multiple layouts.
 *
 * if `sizeMode` is passed in, return the items in the size mode only, else return all items
 * @param appConfig
 * @param type
 * @param id
 * @param sizeMode
 */
export declare function getLayoutInfosHoldContent(appConfig: IMAppConfig, type: LayoutItemType, id: string, sizeMode?: BrowserSizeMode): LayoutInfo[];
/**
 * Find a widget id (parent widget id) that the widget layout contains the widgetId/sectionId.
 * Return the direct parent only.
 * @param appConfig
 * @param id the widget/section id
 * @param type
 * @param sizeMode
 */
export declare function getParentWidgetIdOfContent(appConfig: IMAppConfig, id: string, type: LayoutItemType, sizeMode: BrowserSizeMode): string;
/**
 * Get children widgets/sections in a widget, find one level only. Includes all size mode
 * @param appConfig
 * @param parentWidgetId
 * @param type
 */
export declare function getChildrenContents(appConfig: IMAppConfig, parentWidgetId: string, type: LayoutItemType, withPending: boolean): string[];
/**
 * Return the layoutInfo for the widget/section, there may be multiple layoutInfos for the widget/section.
 *
 * One widget/section is allowed to be put in one layout only one time, but it's allowed be put in multiple layouts.
 * There are 2 cases for multiple layouts:
 *    * One widget/section is allowed to be put in multiple size mode (this function is for one size mode only, so we don't consider this case)
 *    * In one size mode, one widget (i.e. List widget) may have multiple state layouts to hold the same widget.
 * @param appConfig
 * @param contentId
 * @param type
 */
export declare function getContentLayoutInfosInOneSizeMode(appConfig: IMAppConfig, contentId: string, type: LayoutItemType, sizeMode: BrowserSizeMode): LayoutInfo[];
/**
 * Return the size mode of the layout. Because under one size mode, only widget may have multiple layouts,
 * and this function is used only for widgets that have layouts, so pass widget id to make the search easy.
 * @param appConfig
 * @param layoutId
 * @param widgetId
 */
export declare function getBrowserSizeModeByLayoutIdAndWidgetId(appConfig: IMAppConfig, layoutId: string, widgetId: string): BrowserSizeMode;
/**
 * Get the size mode that the layout belongs to
 */
export declare function getBrowserSizeModeByLayoutId(appConfig: IMAppConfig, layoutId: string): BrowserSizeMode;
/**
 * Find all layoutInfos that the content id, section or widget, is equal to each other in the widget on the browserSizeMode
 *
 * @param appConfig
 * @param layoutInfo
 * @param parentWidgetId
 * @param sizeMode
 */
export declare function getRelatedLayoutInfosInWidgetByLayoutInfo(appConfig: IMAppConfig, layoutInfo: LayoutInfo, parentWidgetId: string, sizeMode: BrowserSizeMode): LayoutInfo[];
/**
 * Same as `getRelatedLayoutInfosInWidgetByLayoutInfo`, but return the layout items
 * @param appConfig
 * @param layoutInfo
 * @param parentWId
 * @param browserSizeMode
 */
export declare function getRelatedLayoutItemsInWidgetByLayoutInfo(appConfig: IMAppConfig, layoutInfo: LayoutInfo, parentWId: string, browserSizeMode: BrowserSizeMode): LayoutItemJson[];
export declare function checkIsLayoutInfoInWidget(appConfig: IMAppConfig, parentWId: string, layoutInfo: LayoutInfo): boolean;
/**
 * Return the widget/section ids that in the same container with the widget
 * @param appConfig
 * @param widgetId
 */
export declare function getContentsInTheSameContainer(appConfig: IMAppConfig, id: string, type: LayoutItemType, retType: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): string[];
/**
 * Return the widget/section ids that in the same root container with the widget
 * @param appConfig
 * @param widgetId
 */
export declare function getContentsInTheSameRootContainer(appConfig: IMAppConfig, id: string, type: LayoutItemType, retType: LayoutItemType, sizeMode: BrowserSizeMode, withPending?: boolean): string[];
interface AnchorPoint {
    id: string;
    label: string;
}
export interface ScreenAnchorPoint extends AnchorPoint {
    screens: AnchorPoint[];
}
export declare function getBlockAnchorPointsInPage(appConfig: IMAppConfig, pageId: string, sizeMode: BrowserSizeMode): AnchorPoint[];
export declare function getScreenAnchorPointsInPage(appConfig: IMAppConfig, pageId: string, sizeMode: BrowserSizeMode): ScreenAnchorPoint[];
export interface FlatContainerMaps {
    id: string;
    type: ContainerType;
    maps?: string[];
}
/**
 *
 * @param appConfig
 * @param currentContainerType Dialog or Page
 * @param currentId dialog or page id
 */
export declare function getMapWidgets(appConfig: IMAppConfig, sizeMode: BrowserSizeMode, currentContainerType: ContainerType, currentId: string): FlatContainerMaps[];
export {};
