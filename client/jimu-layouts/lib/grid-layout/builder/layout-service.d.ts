import { type IMAppConfig, type BrowserSizeMode, type LayoutInfo, type DuplicateContext } from 'jimu-core';
import { BaseLayoutService, type TocNode } from 'jimu-for-builder';
import { type ToolItemConfig } from 'jimu-layouts/layout-runtime';
export declare class GridLayoutService extends BaseLayoutService {
    beforeItemRemoved(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    pendItem(appConfig: IMAppConfig, layoutInfo: LayoutInfo): IMAppConfig;
    duplicateItemInSameLayout(appConfig: IMAppConfig, layoutInfo: LayoutInfo, sizeMode: BrowserSizeMode, context: DuplicateContext): [appConfig: IMAppConfig, layoutItemId: string];
    getTocStructure(appConfig: IMAppConfig, layoutId: string): TocNode[];
    getToolItems(appConfig: IMAppConfig, layoutInfo: LayoutInfo, type: string): Array<ToolItemConfig | ToolItemConfig[]>;
    processAfterItemAdded(appConfig: IMAppConfig): IMAppConfig;
    private translate;
    private fetchGridNode;
}
