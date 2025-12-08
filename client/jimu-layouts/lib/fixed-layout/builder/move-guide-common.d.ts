export declare const SNAP_TOLERANCE = 5;
export interface Rect {
    left: number;
    right: number;
    width: number;
    top: number;
    bottom: number;
    height: number;
}
export interface RndDelta {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface SnapResult {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
}
export interface Gridline {
    value: string;
    pixelValue: number;
    usePercentage: boolean;
    origin?: number;
    from?: number;
    to?: number;
}
export interface DOMRectNotReadOnly extends DOMRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
}
export interface BBoxGridline {
    id: string;
    left?: Gridline;
    xm?: Gridline;
    right?: Gridline;
    top?: Gridline;
    ym?: Gridline;
    bottom?: Gridline;
    rect: Partial<DOMRectNotReadOnly>;
}
export interface BBoxGridlineNode {
    value: BBoxGridline;
    next?: BBoxGridlineNode;
}
