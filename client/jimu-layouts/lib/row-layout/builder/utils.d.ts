import { type LayoutItemConstructorProps } from 'jimu-core';
import { type ChildRect, type IMChildRect } from '../types';
export declare function canDrop(rects: IMChildRect[]): boolean;
/**
 * Calculate the insert position using current mouse position
 * @param droppableLayoutId layoutId of the container
 * @param draggingItem
 * @param itemLeft column index of the item
 * @param itemWidth num of columns
 * @param value column index of the mouse
 * @param allRects
 */
export declare function snapLeft(droppableLayoutId: string, draggingItem: LayoutItemConstructorProps, itemLeft: number, itemWidth: number, value: number, // cursor left
allRects: ChildRect[]): number;
/**
 *
 * @param id id of the item being resized
 * @param dx num of columns resized at the left side
 * @param dw num of columns resized at the right side
 * @param rects all row items' position and size
 */
export declare function resizeItem(id: string, dx: number, dw: number, allRects: ChildRect[]): IMChildRect[];
/**
 * @param id id of the item being moved
 * @param x position to move
 * @param rects all row items' position and size
 */
export declare function moveItem(id: string, x: number, allRects: ChildRect[]): IMChildRect[];
export declare function insertItem(rect: ChildRect, pos: number, allRects: ChildRect[]): IMChildRect[];
