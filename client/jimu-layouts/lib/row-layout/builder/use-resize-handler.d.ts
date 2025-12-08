import { type IMLayoutJson, type LayoutItemJson } from 'jimu-core';
import { type IMChildRect } from '../types';
export declare function useResizeHandler(ref: HTMLElement, layout: IMLayoutJson, flipLeftRight: boolean): {
    isResizing: boolean;
    resizingRects: IMChildRect[];
    onResizeStart: (id: string) => void;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, layoutItem: LayoutItemJson) => void;
};
