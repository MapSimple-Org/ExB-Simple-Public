import { type IMAppConfig, type LayoutInfo, type IMLayoutJson, BrowserSizeMode, type IMSizeModeLayoutJson, type SizeModeLayoutJson, type LayoutItemConstructorProps, type IconResult, type ImmutableObject, type DuplicateContext, LayoutType, LayoutItemType, LayoutParentType } from 'jimu-core';
import { type ToolItemConfig } from 'jimu-layouts/layout-runtime';
import type { Template } from '../templates';
export interface TocNode {
    label: string;
    icon?: IconResult | ImmutableObject<IconResult> | string;
    flipIcon?: boolean;
    layoutId?: string;
    layoutItemId?: string;
    isLabelReadOnly?: boolean;
    type?: 'view' | 'screen' | 'widget' | 'section' | 'screenGroup' | 'layout' | 'layoutItem';
    id?: string;
    children?: TocNode[];
}
export declare abstract class BaseLayoutService {
    /**
     * Create a blank layout.
     * @param appConfig
     * @param type
     * @returns
     */
    createBlankLayout(appConfig: IMAppConfig, type: LayoutType): [appConfig: IMAppConfig, layoutId: string];
    /**
     * Duplicate a layout.
     * If duplicateContent is true, the content of the layout will be duplicated.
     * If duplicateContent is false, a new parent will be added to the content.
     *   - If the content is a layout widget, a new layout widget will be created under the toSizeMode.
     *   - If the content has embedded layout, the embedded layout will be duplicated.
     * @param appConfig
     * @param layoutId
     * @param fromSizeMode
     * @param toSizeMode
     * @param context
     * @param duplicateContent
     * @returns
     */
    duplicateLayout(appConfig: IMAppConfig, layoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext, duplicateContent?: boolean): [appConfig: IMAppConfig, layoutId: string];
    duplicateSizeModeLayouts(appConfig: IMAppConfig, layouts: IMSizeModeLayoutJson, parentType: LayoutParentType, parentId: string, context: DuplicateContext): [IMAppConfig, SizeModeLayoutJson];
    /**
     * Duplicate the content in origin layoutItem and replace the content in des layoutItem.
     * @param appConfig
     * @param originLayoutId
     * @param desLayoutId
     * @param originItemId
     * @param desItemId
     * @param fromSizeMode
     * @param toSizeMode
     * @param context
     * @returns
     */
    duplicateAndReplaceContent(appConfig: IMAppConfig, originLayoutInfo: LayoutInfo, desLayoutInfo: LayoutInfo, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, context: DuplicateContext): IMAppConfig;
    addContent(appConfig: IMAppConfig, layoutId: string, contentId: string, type: LayoutItemType, sizeMode: BrowserSizeMode): [appConfig: IMAppConfig, itemId: string];
    removeLayout(appConfig: IMAppConfig, layoutId: string, sizeMode: BrowserSizeMode): IMAppConfig;
    removeSizeModeLayouts(appConfig: IMAppConfig, layouts: IMSizeModeLayoutJson): IMAppConfig;
    removeLayoutIdFromParent(appConfig: IMAppConfig, layoutId: string, sizeMode: BrowserSizeMode): IMAppConfig;
    replaceLayoutIdInParent(appConfig: IMAppConfig, parentInfo: {
        type: LayoutParentType;
        id: string;
    }, oldLayoutId: string, newLayoutId: string, sizeMode: BrowserSizeMode): IMAppConfig;
    transformLayout(appConfig: IMAppConfig, layoutJson: IMLayoutJson, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMLayoutJson;
    /**
     * Create a new blank layout item in the given layout. Only id is set in the new layout item.
     * @param appConfig
     * @param layoutId
     * @returns
     */
    createBlankItem(appConfig: IMAppConfig, layoutId: string): [appConfig: IMAppConfig, layoutItemId: string];
    duplicateItemInSameLayout(appConfig: IMAppConfig, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, layoutItemId: string];
    pendItem(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    /**
     * Remove a layout item. It has multiple use cases:
     * - do not remove content. Only remove the layout item from the layout and remove if from its content parent.
     *   - when a widget will be removed, its parent layout items should be removed ahead of it.
     * - remove content.
     *   - force is false. Try to remove the content. If the content is used by other layout items, do not remove it.
     *   - force is true. Remove the content directly.
     * @param appConfig
     * @param layoutInfo
     * @param sizeMode
     * @param removeContent
     * @param force
     * @param duringMoveOperation is it during move operation
     */
    removeItem(appConfig: IMAppConfig, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode, removeContent: boolean, force?: boolean, duringMoveOperation?: boolean): IMAppConfig;
    /**
     * Choose a template to replace the layout.
     * 1. if current size mode is main size mode, replace other size mode layout if it is not set.
     * 2. if current size mode is not main size mode, only replace current size mode layout.
     * @param appConfig
     * @param targetSizeModeLayout
     * @param templatePageJson
     * @param sourceSizeModeLayout
     * @param currentSizeMode
     * @returns
     */
    replaceSizeModeLayout(appConfig: IMAppConfig, targetSizeModeLayout: IMSizeModeLayoutJson, templatePageJson: Template, sourceSizeModeLayout: IMSizeModeLayoutJson, currentSizeMode: BrowserSizeMode, parentType: LayoutParentType, parentId: string, context: DuplicateContext): Promise<[appConfig: IMAppConfig, updatedSizeModeLayout: IMSizeModeLayoutJson]>;
    /**
     * Use the layout in sourceLayout to replace the targetLayout
     * @param appConfig
     * @param targetLayoutId
     * @param templatePageJson
     * @param sourceLayoutId
     * @param browserSizeMode
     */
    replaceLayout(appConfig: IMAppConfig, targetLayoutId: string, templatePageJson: Template, sourceLayoutId: string, sizeMode: BrowserSizeMode, parentType: LayoutParentType, parentId: string, context: DuplicateContext): Promise<[appConfig: IMAppConfig, newLayoutId: string]>;
    createLayoutFromTemplate(appConfig: IMAppConfig, templateJson: Template, layoutId: string, sizeMode: BrowserSizeMode, parentType: LayoutParentType, parentId: string, context: DuplicateContext): Promise<[appConfig: IMAppConfig, newLayoutId: string]>;
    getTocStructure(appConfig: IMAppConfig, layoutId: string): TocNode[];
    moveLayoutItem(appConfig: IMAppConfig, fromLayoutInfo: LayoutInfo, toLayoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): [IMAppConfig, LayoutInfo];
    afterItemAdded(appConfig: IMAppConfig, layoutInfo: LayoutInfo, fromSizeMode: BrowserSizeMode, currentSizeMode: BrowserSizeMode, options?: any): IMAppConfig;
    afterItemMoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo, toLayoutId: string): IMAppConfig;
    beforeItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    afterItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    abstract processAfterItemAdded(appConfig: IMAppConfig, draggingItem: LayoutItemConstructorProps, layoutInfo: LayoutInfo, options: {
        currentSizeMode: BrowserSizeMode;
        containerRect: DOMRectReadOnly;
        itemRect: DOMRectReadOnly;
        insertIndex: number;
        others?: any;
    }): IMAppConfig;
    abstract getToolItems(appConfig: IMAppConfig, layoutInfo: LayoutInfo, type: string): Array<ToolItemConfig | ToolItemConfig[]>;
}
