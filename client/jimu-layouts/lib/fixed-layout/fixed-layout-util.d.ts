import { type BoundingBox, type IMLayoutJson, type BrowserSizeMode, type IMBoundingBox, type ImmutableObject } from 'jimu-core';
import { type FixedLayoutItemSetting } from '../types';
interface Pos {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare function sortLayoutItems(layout: IMLayoutJson): string[];
export declare function fixedLayoutTransform(layout: IMLayoutJson, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): IMLayoutJson;
/**
 * Convert a layout to a small size(width) layout.
 *
 * Return the new layout.
 *
 *
 * @param layout
 * @param convertToColumn
 * @param appConfig
 */
export declare function autoResponseToDevice(layout: IMLayoutJson, deviceWidth: number): IMLayoutJson;
export declare function intersects(p1: Pos, p2: Pos): boolean;
export declare function contains(p1: Pos, p2: Pos): boolean;
export declare function mergePos(p1: Pos, p2: Pos): Pos;
export declare function getAbsolutePos(b: BoundingBox, containerWidth: number, containerHeight: number): Pos;
export declare function generateResizingBBoxStyle(initRect: DOMRect, containerRect: DOMRect, delta: {
    dx: number;
    dy: number;
    dw: number;
    dh: number;
}, autoFlip?: boolean): DOMRect;
export declare function generateBBoxStyle(bbox: IMBoundingBox, setting: FixedLayoutItemSetting): BoundingBox;
export declare function flipAutoProps(autoProps: {
    left?: boolean;
    right?: boolean;
}): ImmutableObject<{
    left?: boolean;
    right?: boolean;
}>;
export declare function flipBBox(bbox: BoundingBox): IMBoundingBox;
export declare function applyPositionSetting(bbox: IMBoundingBox, itemSetting: FixedLayoutItemSetting, isResizing?: boolean): React.CSSProperties;
/**
 * Do not change the autoProps value except that value is empty.
 */
export declare function applySnapResult(bbox: IMBoundingBox, setting: any, containerRect: DOMRect, snapRect: DOMRect): {
    bbox: IMBoundingBox;
    setting: any;
};
export {};
