import { type IMAppConfig, type BrowserSizeMode, type LayoutInfo, type LayoutItemConstructorProps, type DuplicateContext } from 'jimu-core';
import { BaseLayoutService, type TocNode } from 'jimu-for-builder';
import { type ToolItemConfig } from 'jimu-layouts/layout-runtime';
export declare class FixedLayoutService extends BaseLayoutService {
    private removeItemFromOrder;
    afterItemMoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    afterItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    private updateBBoxAfterAdd;
    processAfterItemAdded(appConfig: IMAppConfig, draggingItem: LayoutItemConstructorProps, layoutInfo: LayoutInfo, options: {
        currentSizeMode: BrowserSizeMode;
        containerRect: DOMRectReadOnly;
        itemRect: DOMRectReadOnly;
        insertIndex: number;
        others: {
            snapResult: DOMRectReadOnly;
        };
    }): IMAppConfig;
    duplicateItemInSameLayout(appConfig: IMAppConfig, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, layoutItemId: string];
    getTocStructure(appConfig: IMAppConfig, layoutId: string): TocNode[];
    getToolItems(appConfig: IMAppConfig, layoutInfo: LayoutInfo, type: string): Array<ToolItemConfig | ToolItemConfig[]>;
    private offsetDuplicateItem;
}
