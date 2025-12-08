import type { IMThemeVariables } from 'jimu-core';
import type { CanvasPane } from '../../builder/interactive/canvas-pane';
import { type Gridline, type RndDelta, type BBoxGridline } from './move-guide-common';
/**
 * Check if the gridline should be involved when calculating snapping in horizontal direction
 * 1. Distance is less than 4 times of snap tolerance
 * 2. Unit should compatible:
 *   2.1 both in pixel and use the same origin
 *   2.2 both in percentage
 * @param source
 * @param target
 */
export declare function isRelated(source: Gridline, target: Gridline): boolean;
export declare function isSamePosition(source: Gridline, delta: number, target: Gridline): boolean;
export declare function findRelated(activeItem: Gridline, gridlines: Gridline[]): Gridline[];
export declare function drawHorizontalSnapLine(activeItems: Gridline[], // top, ym and bottom
otherItems: Gridline[], deltaY: number, canvasPane: CanvasPane, theme: IMThemeVariables): void;
export declare function drawHorizontalCandidate(snapItem: Gridline, canvasPane: CanvasPane, theme: IMThemeVariables): void;
export declare function drawVerticalCandidate(snapItem: Gridline, canvasPane: CanvasPane, theme: IMThemeVariables): void;
export declare function drawVerticalSnapLine(activeItems: Gridline[], // left, xm and right
otherItems: Gridline[], deltaX: number, canvasPane: CanvasPane, theme: IMThemeVariables): void;
export declare function snapToEdge(activeItem: BBoxGridline, bboxGridlines: BBoxGridline[], delta: RndDelta, options: {
    canSnapToX: boolean;
    canSnapToY: boolean;
    canvasPane?: CanvasPane;
    theme?: IMThemeVariables;
}): {
    dx: number;
    dy: number;
};
