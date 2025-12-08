import { type IMAppConfig, type LayoutInfo, type BrowserSizeMode, type LayoutItemConstructorProps, type DuplicateContext } from 'jimu-core';
import { BaseLayoutService, type TocNode } from 'jimu-for-builder';
import { type ToolItemConfig } from 'jimu-layouts/layout-runtime';
export declare class RowLayoutService extends BaseLayoutService {
    private removeItemFromOrder;
    afterItemMoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo, toLayoutId: string): IMAppConfig;
    afterItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    duplicateItemInSameLayout(appConfig: IMAppConfig, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, layoutItemId: string];
    getTocStructure(appConfig: IMAppConfig, layoutId: string): TocNode[];
    processAfterItemAdded(appConfig: IMAppConfig, draggingItem: LayoutItemConstructorProps, layoutInfo: LayoutInfo, options: {
        insertIndex: number;
        itemRect: DOMRectReadOnly;
    }): IMAppConfig;
    getToolItems(appConfig: IMAppConfig, layoutInfo: LayoutInfo, type: string): Array<ToolItemConfig | ToolItemConfig[]>;
    private offsetDuplicateItem;
    /**
     * If row layout is in the flow page, and the last item of this row is removed. The row needs to be removed too.
     * @param appConfig
     * @param removedLayoutInfo
     * @returns
     */
    private clearEmptyRowInFlowLayout;
}
