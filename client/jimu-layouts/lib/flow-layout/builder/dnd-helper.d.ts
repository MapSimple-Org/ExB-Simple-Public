export declare const DropIndicatorSize = 10;
export declare function calInsertPositionForColumn(boundingRect: DOMRect, centerY: number, childRects: Array<DOMRect & {
    id: string;
}>, indicatorSize: number): {
    insertY: number;
    refId: string;
};
