/** @jsx jsx */
import { React, type LayoutItemJson, type IMLayoutItemJson, ReactRedux, type SerializedStyles } from 'jimu-core';
import { type LayoutItemProps, type FixedLayoutItemSetting } from 'jimu-layouts/layout-runtime';
interface OwnProps {
    layoutItem: LayoutItemJson | IMLayoutItemJson;
    offsetX?: number;
    offsetY?: number;
    dw?: number;
    dh?: number;
    index: number;
    initRect?: DOMRect;
    containerRect?: DOMRect;
    isLayoutLockChildren?: boolean;
    onResizeStart: (id: string) => void;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean, speed: number) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean, layoutItem: LayoutItemJson | IMLayoutItemJson, itemSetting: FixedLayoutItemSetting) => void;
    onMoveByKey: (id: string, dx: number, dy: number) => void;
}
interface StateToLayoutItemProps {
    selected: boolean;
    isDesignMode: boolean;
}
interface State {
    dx?: number;
    dy?: number;
}
declare class FixedItem extends React.PureComponent<LayoutItemProps & OwnProps & StateToLayoutItemProps, State> {
    state: State;
    itemSetting: FixedLayoutItemSetting;
    handleResizeEnd: (id: string, dx: number, dy: number, dw: number, dh: number, shiftKey: boolean) => void;
    handleResizing: (id: string, dx: number, dy: number, dw: number, dh: number, shiftKey: boolean, speed: number) => void;
    moveUp: () => void;
    moveDown: () => void;
    moveLeft: () => void;
    moveRight: () => void;
    getKeyboardComponent(): React.JSX.Element;
    getPositionStyle(): [SerializedStyles, string];
    render(): React.JSX.Element;
}
declare const _default: ReactRedux.ConnectedComponent<typeof FixedItem, {
    style?: React.CSSProperties;
    index: number;
    className?: string;
    children?: any;
    ref?: React.Ref<FixedItem>;
    aspectRatio?: number;
    key?: React.Key | null | undefined;
    onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    draggable?: boolean;
    onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    layoutId: string;
    layoutItemId: string;
    offsetX?: number;
    offsetY?: number;
    resizable?: boolean;
    onResizeStart: (id: string) => void;
    autoWidth?: boolean;
    parentRef?: React.RefObject<HTMLElement>;
    selectable?: boolean;
    forbidContextMenu?: boolean;
    forbidToolbar?: boolean;
    showDefaultTools?: boolean;
    isInSection?: boolean;
    trailOrder?: number;
    forceAspectRatio?: boolean;
    resizeObserver?: ResizeObserver;
    autoHeight?: boolean;
    layoutItem: LayoutItemJson | IMLayoutItemJson;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean, layoutItem: LayoutItemJson | IMLayoutItemJson, itemSetting: FixedLayoutItemSetting) => void;
    dh?: number;
    dw?: number;
    containerRect?: DOMRect;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number, shiftKey: boolean, speed: number) => void;
    initRect?: DOMRect;
    isLayoutLockChildren?: boolean;
    onMoveByKey: (id: string, dx: number, dy: number) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
