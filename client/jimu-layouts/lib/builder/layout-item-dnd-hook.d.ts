/** @jsx jsx */
import { type LayoutItemType, LayoutType } from 'jimu-core';
interface Props {
    restrict: boolean;
    layoutId: string;
    layoutItemId: string;
    layoutType: LayoutType;
    layoutItemType: LayoutItemType;
    useDragHandler: boolean;
    resizeObserver?: ResizeObserver;
    getCurrentRootLayoutId: () => string;
    onDragStart?: (layoutItemId: string) => void;
    onDragging?: (layoutItemId: string, dx: number, dy: number) => void;
    onDragEnd?: (layoutItemId: string, dx: number, dy: number) => void;
    onResizeStart?: (layoutItemId: string, initWidth: number, initHeight: number) => void;
    onResizing?: (layoutItemId: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean, speed?: number) => void;
    onResizeEnd?: (layoutItemId: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean) => void;
}
/**
 * Bind drag and resize capability
 * @param props
 * @returns
 */
export declare function useDndBinding(props: Props): {
    registerWidgetInitDragHandler: (onDragStart: any, onDragging: any, onDragEnd: any) => void;
    registerWidgetInitResizeHandler: (onResizeStart: any, onResizing: any, onResizeEnd: any) => void;
    setRefElement: (element: HTMLDivElement) => void;
};
export {};
