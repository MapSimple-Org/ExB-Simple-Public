export declare function calInsertPosition(boundingRect: DOMRect, itemRect: Partial<DOMRect>, childRects: Array<DOMRect & {
    id: string;
}>): {
    insertX: number;
    refId: string;
};
