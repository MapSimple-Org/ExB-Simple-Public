/** @jsx jsx */
import { type LayoutItemJson, type IMLayoutItemJson } from 'jimu-core';
import type { LayoutItemProps } from '../../types';
interface OwnProps {
    layoutId?: string;
    layoutItem: LayoutItemJson | IMLayoutItemJson;
    selected: boolean;
    expanded: boolean;
    isResizing: boolean;
    isInlineEditing: boolean;
    height: string;
    gap: number;
    onExpandedChange: (layoutItemId: string, expanded: boolean) => void;
    onClick: () => void;
    onDoubleClick: () => void;
    onResizeStart: (id: string, initWidth: number, initHeight: number) => void;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean, speed: number) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean) => void;
}
export declare function Panel(props: LayoutItemProps & OwnProps): import("@emotion/react/jsx-runtime").JSX.Element;
export {};
