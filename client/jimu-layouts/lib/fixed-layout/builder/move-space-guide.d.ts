import { type IMThemeVariables } from 'jimu-core';
import type { CanvasPane } from '../../builder/interactive/canvas-pane';
import { type RndDelta, type BBoxGridline, type BBoxGridlineNode } from './move-guide-common';
/**
 * Check if the target should be involved when calculating distance snapping in horizontal direction
 * 1. Should intersect in vertical direction
 * 2. Should not intersect in horizontal direction
 * 3. Unit should compatible:
 *    3.1 both in pixel and use the same origin
 *    3.2 both in percentage
 * @param source
 * @param target
 */
export declare function isRelatedHorizontal(source: BBoxGridline, target: BBoxGridline): boolean;
export declare function isRelatedVertical(source: BBoxGridline, target: BBoxGridline): boolean;
export declare function findPreviousHorizontallyRelated(activeItem: BBoxGridline, gridlines: BBoxGridline[]): BBoxGridlineNode;
export declare function addLeftEdge(gridlineNode: BBoxGridlineNode, usePercentage: boolean): BBoxGridlineNode;
export declare function findNextHorizontallyRelated(activeItem: BBoxGridline, gridlines: BBoxGridline[]): BBoxGridlineNode;
export declare function addRightEdge(gridlineNode: BBoxGridlineNode, usePercentage: boolean, containerWidth: number): BBoxGridlineNode;
export declare function findPreviousVerticallyRelated(activeItem: BBoxGridline, gridlines: BBoxGridline[]): BBoxGridlineNode;
export declare function addTopEdge(gridlineNode: BBoxGridlineNode, usePercentage: boolean): BBoxGridlineNode;
export declare function findNextVerticallyRelated(activeItem: BBoxGridline, gridlines: BBoxGridline[]): BBoxGridlineNode;
export declare function addBottomEdge(gridlineNode: BBoxGridlineNode, usePercentage: boolean, containerHeight: number): BBoxGridlineNode;
export declare function snapToNearbyHorizontal(activeItem: BBoxGridline, previousItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, nextItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, canvasPane?: CanvasPane, containerWidth?: number, theme?: IMThemeVariables): number;
export declare function snapToNearbyVertical(activeItem: BBoxGridline, previousItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, nextItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, canvasPane?: CanvasPane, containerHeight?: number, theme?: IMThemeVariables): number;
export declare function snapToPreviousHorizontal(activeItem: BBoxGridline, previousNode: BBoxGridlineNode, canvasPane?: CanvasPane, containerWidth?: number, theme?: IMThemeVariables): number;
export declare function snapToNextHorizontal(activeItem: BBoxGridline, node: BBoxGridlineNode, canvasPane?: CanvasPane, containerWidth?: number, theme?: IMThemeVariables): number;
export declare function snapToPreviousVertical(activeItem: BBoxGridline, previousNode: BBoxGridlineNode, canvasPane?: CanvasPane, containerHeight?: number, theme?: IMThemeVariables): number;
export declare function snapToNextVertical(activeItem: BBoxGridline, node: BBoxGridlineNode, canvasPane?: CanvasPane, containerHeight?: number, theme?: IMThemeVariables): number;
/**
 *
 * @param previousItem
 * @param nextItem
 * @param distance
 * @param reverse If true, start drawing from nextItem to previousItem
 * @param canvasPane
 * @param theme
 */
export declare function drawHorizontalGap(previousItem: BBoxGridline, nextItem: BBoxGridline, canvasPane: CanvasPane, containerWidth: number, theme: IMThemeVariables, options: {
    distance: number;
    drawLabel: boolean;
    reverse: boolean;
}): void;
export declare function drawHorizontalDistance(activeItem: BBoxGridline, previousItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, nextItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, canvasPane: CanvasPane, theme: IMThemeVariables, options: {
    isResizing: boolean;
    dx: number;
    containerWidth: number;
}): void;
export declare function drawVerticalGap(previousItem: BBoxGridline, nextItem: BBoxGridline, canvasPane: CanvasPane, containerHeight: number, theme: IMThemeVariables, options: {
    distance: number;
    drawLabel: boolean;
    reverse: boolean;
}): void;
export declare function drawVerticalDistance(activeItem: BBoxGridline, previousItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, nextItem: {
    gridline: BBoxGridline;
    fixed: boolean;
}, canvasPane: CanvasPane, theme: IMThemeVariables, options: {
    isResizing: boolean;
    dy: number;
    containerHeight: number;
}): void;
export declare function snapByDistance(activeItem: BBoxGridline, bboxGridlines: BBoxGridline[], options: {
    delta: RndDelta;
    containerWidth: number;
    containerHeight: number;
    canvasPane?: CanvasPane;
    theme?: IMThemeVariables;
}): {
    dx: number;
    dy: number;
};
