import { type BoundingBox, type IMBoundingBox } from 'jimu-core';
import { type RowLayoutItemSetting } from '../types';
export declare const ROW_STYLE: import("jimu-core").SerializedStyles;
export declare function flipRowItemPos(bbox: BoundingBox): IMBoundingBox;
export declare function calItemHeight(itemSetting: RowLayoutItemSetting, bbox: BoundingBox, isMultiRow: boolean): {
    height?: string;
    alignSelf: string;
};
