import { type BoundingBox, type IMLayoutItemJson, type IMLayoutJson, type IMThemeVariables, type IMBoundingBox } from 'jimu-core';
import { type FixedLayoutItemSetting } from 'jimu-layouts/layout-runtime';
import type { CanvasPane } from '../../builder/interactive/canvas-pane';
import type { Gridline, BBoxGridline, RndDelta, Rect } from './move-guide-common';
export interface BBoxUnits {
    left?: 'px' | '%';
    right?: 'px' | '%';
    top?: 'px' | '%';
    bottom?: 'px' | '%';
    width?: 'px' | '%';
    height?: 'px' | '%';
}
export type ItemClientRect = Rect & {
    units: BBoxUnits;
};
export declare const enum FixedSides {
    Start = 0,
    End = 1,
    None = 2
}
export declare function getBBoxUnits(bbox: BoundingBox, rtl?: boolean): BBoxUnits;
export declare function drawPosition(itemRect: ItemClientRect, containerRect: Rect, canvasPane: CanvasPane): void;
export declare function isValidGridline(gridline: Gridline, origin: number, snapToPercentage: boolean): boolean;
/**
 * Check if the itemRect should snap to pixel value or percentage value
 * @param bbox The bbox property of the itemRect. Only exists when dragging or resizing a item already in the layout
 * @param itemRect Rect in pixel of the dragging/resizing layout item
 * @param containerWidth
 * @param containerHeight
 */
export declare function isSnapToPercentage(bbox: IMBoundingBox, itemRect: Rect, containerWidth: number, containerHeight: number): {
    leftRight: boolean;
    topBottom: boolean;
};
export declare function getRectOrigin(itemRect: Rect, containerRect: {
    width: number;
    height: number;
}): [number, number];
export declare function getBBoxOrigin(setting: FixedLayoutItemSetting): [number, number];
export declare function isSameOrigin(itemRect: Rect, setting: FixedLayoutItemSetting, containerWidth: number, containerHeight: number): [boolean, boolean];
export declare function getRectOfLayoutItem(layoutItem: IMLayoutItemJson, containerWidth: number, containerHeight: number): Partial<Rect>;
export declare function getGridlineOfActiveItem(layoutItem: IMLayoutItemJson, itemRect: Rect, containerWidth: number, containerHeight: number, delta?: RndDelta): BBoxGridline;
export declare function getGridlineOfLayoutItem(layoutItem: IMLayoutItemJson, containerWidth: number, containerHeight: number): BBoxGridline;
export declare function getGridlinesOfLayout(layout: IMLayoutJson, containerWidth: number, containerHeight: number, excludeId?: string): BBoxGridline[];
/**
 * Calculate grid lines that can be used as snap target when dragging.
 * @param layout
 * @param excludeItemId
 */
export declare function getGridlines(bboxGridlines: BBoxGridline[], containerWidth: number, containerHeight: number, itemRect: Rect, activeLayoutItem?: IMLayoutItemJson): {
    leftToRight: Gridline[];
    topToBottom: Gridline[];
};
/**
 * When resizing in RTL, the resize edge should be flipped. That means if you resize by dragging the right edge,
 * the interactjs will move the left edge.
 * @param dx
 * @param dw
 */
export declare function flipDelta(dx: number, dw: number): {
    x: number;
    w: number;
};
export declare function moveGuide(activeLayoutItem: IMLayoutItemJson, containerRect: Rect, draggingBound: Rect, bboxGridlines: BBoxGridline[], options: {
    delta: RndDelta;
    shiftKey: boolean;
    canvasPane?: CanvasPane;
    theme?: IMThemeVariables;
}): RndDelta;
export declare function updateDelta(delta: RndDelta, dx: number, dy: number): RndDelta;
