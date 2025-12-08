import type { ImmutableObject } from 'jimu-core';
export declare const MIN_SPAN = 2;
export declare const TOTAL_COLS = 12;
export interface ChildRect {
    layoutId?: string;
    id: string;
    left?: number;
    width: number;
    height?: number;
}
export type IMChildRect = ImmutableObject<ChildRect>;
