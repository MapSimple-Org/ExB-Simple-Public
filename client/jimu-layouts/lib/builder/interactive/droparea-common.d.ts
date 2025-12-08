import { type IMSizeModeLayoutJson, type LayoutItemConstructorProps } from 'jimu-core';
import { type LayoutContextProps, type PageContextProps } from 'jimu-layouts/layout-runtime';
export interface DropAreaContext {
    props: DropAreaProps;
    layoutId: string;
    pageContext: PageContextProps;
    layoutContext: LayoutContextProps;
}
export interface DropAreaProps {
    layouts: IMSizeModeLayoutJson;
    isPlaceholder?: boolean;
    highlightDragover?: boolean;
    className?: string;
    style?: any;
    isRepeat?: boolean;
    children?: React.ReactNode;
    onToggleDragoverEffect?: (isDragover: boolean, draggingItem?: LayoutItemConstructorProps) => void;
    onDragEnter?: (draggingItem: LayoutItemConstructorProps) => void;
    onDragOver?: (draggingItem: LayoutItemConstructorProps, draggingElement: HTMLElement, containerRect: DOMRect, itemRect: DOMRect & {
        handlerRect?: DOMRect;
    }, clientX: number, clientY: number, speed?: number) => void;
    onDragLeave?: (draggingItem: LayoutItemConstructorProps) => void;
    onDrop?: (draggingItem: LayoutItemConstructorProps, containerRect: DOMRect, itemRect: DOMRect & {
        handlerRect?: DOMRect;
    }, clientX: number, clientY: number) => void;
}
export declare function createItemFromInteractEvent(dragElement: HTMLElement): LayoutItemConstructorProps;
export declare function createItemFromLayoutInfo(layoutId: any, layoutItemId: any): LayoutItemConstructorProps;
export declare function createItemFromH5DragEvent(): LayoutItemConstructorProps;
export declare function restrictItemInContainer(itemRect: Partial<DOMRect>, containerRect: Partial<DOMRect>): Partial<DOMRect>;
export declare function isDraggingItemAccepted(draggingItem: LayoutItemConstructorProps, layoutContext: LayoutContextProps, props: DropAreaProps, layoutId: string): boolean;
