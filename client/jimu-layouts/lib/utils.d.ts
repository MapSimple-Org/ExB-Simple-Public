import { type IMLayoutJson, type IMBoundingBox, type IMState, type IMAppConfig, type IMLayoutItemJson, type BrowserSizeMode, type PagePart, type LayoutItemConstructorProps, type BoundingBox, type Selection } from 'jimu-core';
import { type LinearUnit } from 'jimu-ui';
import { type WidgetProps, type LayoutProps, type LayoutItemProps, type StateToLayoutProps, type StateToLayoutItemProps, type CommonLayoutItemSetting, LayoutItemSizeModes } from './types';
export declare const emptyFunc: () => any;
export declare function autoBindHandlers(el: {
    [key: string]: any;
}, fns: string[]): void;
/**
 * Get the maximum id of the layout item which can be converted to a number.
 * @param layoutMap
 */
export declare function getMaximumId(layoutMap: IMLayoutJson): number;
/**
 * Checks if `value` is classified as a percentage value
 * @param value
 */
export declare function isPercentage(value: any): boolean;
/**
 * Checks if `value` is classified as a finite number
 * @param value
 */
export declare function isNumber(value: any): boolean;
export declare function getValueOfBBox(bbox: BoundingBox, prop: string): string;
/**
 * Convert the value to percentage value in respect to the total
 * @param value
 * @param total
 */
export declare function toRatio(value: number, total: number): string;
/**
 * Convert a percentage value to pixel in respect to the total
 * @param ratio
 * @param total
 */
export declare function fromRatio(ratio: number | string, total: number): number;
export declare const mapStateToLayoutProps: (state: IMState, ownProps: LayoutProps) => StateToLayoutProps;
export declare const mapStateToLayoutItemProps: (state: IMState, ownProps: LayoutItemProps) => StateToLayoutItemProps;
export declare const mapStateToWidgetProps: (state: IMState, ownProps: LayoutItemProps) => WidgetProps;
export declare function isWidgetHasEmbeddedLayout(widgetId: string, appConfig: IMAppConfig): boolean;
export declare function isFunctionalWidget(widgetId: string, appConfig: IMAppConfig): boolean;
export declare function isWidgetPlaceholder(appConfig: IMAppConfig, item: LayoutItemConstructorProps): boolean;
/**
 * Replace the values of bounding box b1 with values of b2, try to keep the unit of each property.
 * @param b1
 * @param b2
 * @param containerRect
 */
export declare function replaceBoundingBox(b1: IMBoundingBox, b2: DOMRect, containerRect: DOMRect): IMBoundingBox;
/**
 * Update a property of the bounding box
 * @param prop
 * @param b
 * @param newValue
 * @param containerRect
 */
export declare function updateBoundingBoxProp(prop: string, b: IMBoundingBox, newValue: number | string, containerRect: DOMRect): IMBoundingBox;
export declare function relativeClientRect(r1: DOMRect, r2: DOMRect): DOMRect & {
    id: string;
};
export declare function isRTL(): boolean;
export declare function parseAspectRatio(ratio: number | string): number;
export declare function expandStyleArray(dataArray: number[]): [number, number, number, number];
export declare function calHeightOfLayoutItem(containerHeight: number, layoutItem: IMLayoutItemJson): {
    height?: number;
    setting: any;
};
export declare function getAppConfig(): IMAppConfig;
export declare function getCurrentSizeMode(): BrowserSizeMode;
export declare function getCurrentPageId(): string;
export declare function getCurrentDialogId(): string;
export declare function getActivePagePart(): PagePart;
export declare function getCurrentDialogRootLayoutId(): string;
export declare function getCurrentPageRootLayoutId(): string;
export declare function getHeaderRootLayoutId(): string;
export declare function getFooterRootLayoutId(): string;
/**
 * Check if rect1 contains rect2
 * @param rect1
 * @param rect2
 */
export declare function contains(rect1: DOMRect, rect2: DOMRect): boolean;
export declare function intersects(r1: DOMRect, r2: DOMRect): boolean;
export declare function normalizeLinearUnit(value: string | LinearUnit, precision?: number): string;
export declare function getLayoutItemSizeMode(side: 'width' | 'height', bbox: IMBoundingBox, autoProps: any): LayoutItemSizeModes;
export declare function shouldUseAspectRatio(itemSetting: CommonLayoutItemSetting): boolean;
export declare function gcd(x: number, y: number): number;
export declare function changeLayout(appConfig: IMAppConfig, selection: Selection): void;
