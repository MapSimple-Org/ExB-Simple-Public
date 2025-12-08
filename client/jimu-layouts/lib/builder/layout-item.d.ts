/** @jsx jsx */
import { React } from 'jimu-core';
import { type LayoutItemProps, type ToolbarConfig } from 'jimu-layouts/layout-runtime';
interface ChildEmement {
    children?: Element | React.ReactNode;
}
export interface OwnProps {
    id?: string;
    isBlock?: boolean;
    toolItems?: ToolbarConfig;
    contextMenuItems?: ToolbarConfig;
}
export interface DragEventHandlers {
    restrict?: boolean;
    useDragHandler?: boolean;
    onDragStart?: (layoutItemId: string) => void;
    onDragging?: (layoutItemId: string, dx: number, dy: number) => void;
    onDragEnd?: (layoutItemId: string, dx: number, dy: number) => void;
}
export interface ResizeEventHandlers {
    top?: boolean;
    left?: boolean;
    right?: boolean;
    bottom?: boolean;
    resizable?: boolean;
    keepAspectRatio?: boolean;
    aspectRatio?: number;
    onResizeStart?: (layoutItemId: string, initWidth: number, initHeight: number) => void;
    onResizing?: (layoutItemId: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean, speed?: number) => void;
    onResizeEnd?: (layoutItemId: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean) => void;
}
type LayoutItemInBuilderProps = LayoutItemProps & DragEventHandlers & ResizeEventHandlers & OwnProps;
export default function LayoutItemInBuilder(props: LayoutItemInBuilderProps & ChildEmement): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
