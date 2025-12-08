/** @jsx jsx */
import { React, ReactRedux, type IMThemeVariables } from 'jimu-core';
export declare const WidgetRenderer: ReactRedux.ConnectedComponent<React.ForwardRefExoticComponent<Pick<any, string | number | symbol> & {
    theme?: IMThemeVariables;
}>, {
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    layoutId: string;
    layoutItemId: string;
    parentRef?: React.RefObject<HTMLElement>;
    draggable?: boolean;
    resizable?: boolean;
    selectable?: boolean;
    forbidContextMenu?: boolean;
    forbidToolbar?: boolean;
    showDefaultTools?: boolean;
    isInSection?: boolean;
    className?: string;
    style?: React.CSSProperties;
    trailOrder?: number;
    onClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    onDoubleClick?: (e: any, layoutInfo: import("jimu-core").LayoutInfo) => void;
    forceAspectRatio?: boolean;
    aspectRatio?: number;
    resizeObserver?: ResizeObserver;
    children?: any;
    autoWidth?: boolean;
    autoHeight?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
