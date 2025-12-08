import { type LayoutItemConstructorProps, type LayoutInfo, type IMAppConfig, type ClipboardItem } from 'jimu-core';
export declare function getRootLayoutId(): string;
export declare function updateLayoutAndSelection(appConfig: IMAppConfig, selection: LayoutInfo): void;
export declare function pendLayoutItem(layoutInfo: LayoutInfo): void;
export declare function duplicateLayoutItem(layoutInfo: LayoutInfo): void;
export declare function pasteLayoutItem(clipboardItem: ClipboardItem, targetLayoutId: string): void;
export declare function pasteToFixedLayout(clipboardItem: ClipboardItem, targetLayoutId: string, containerRect?: DOMRect): void;
export declare function pasteToGridLayout(appConfig: IMAppConfig, clipboardItem: ClipboardItem, targetLayoutId: string): [IMAppConfig, LayoutInfo];
export declare function pasteToFlowLayout(clipboardItem: ClipboardItem, targetLayoutId: string): void;
/**
 * Add widget or section to a layout, either dragging from the widget list or dragging an existing one.
 */
export declare function addItemToLayout(appConfig: IMAppConfig, item: LayoutItemConstructorProps, targetLayoutId: string): Promise<{
    layoutInfo: LayoutInfo;
    updatedAppConfig: IMAppConfig;
}>;
export declare function mergeWidgetsIntoColumn(appConfig: IMAppConfig, draggingItem: LayoutItemConstructorProps, containerRect: DOMRect, itemRect: DOMRect, refLayoutInfo: LayoutInfo, side: 'top' | 'bottom'): Promise<{
    layoutInfo: LayoutInfo;
    updatedAppConfig: IMAppConfig;
}>;
export declare function supportFloating(layoutInfo: LayoutInfo): boolean;
export declare function supportSinking(layoutInfo: LayoutInfo): boolean;
export declare function floatingLayoutItem(layoutInfo: LayoutInfo, clientRect: DOMRect, area: number): Promise<void>;
export declare function sinkingLayoutItem(layoutInfo: LayoutInfo, clientRect: DOMRect): void;
/**
 * Add a block into flow layout which contains the draggingItem
 * @param draggingItem
 * @param targetLayoutId
 * @param containerRect
 * @param itemRect
 * @param width
 * @param insertIndex
 * @param appConfig
 */
export declare function addBlockToFlowLayout(draggingItem: LayoutItemConstructorProps, options: {
    targetLayoutId: string;
    containerRect: DOMRect;
    itemRect: DOMRect;
    width: number;
    insertIndex: number;
    appConfig?: IMAppConfig;
}): Promise<void>;
