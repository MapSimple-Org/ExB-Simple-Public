/** @jsx jsx */
import { React, type LayoutItemJson, type IMLayoutItemJson, type BoundingBox } from 'jimu-core';
import { type LayoutItemProps, type StateToLayoutItemProps } from '../../types';
interface OwnProps {
    layoutItem: IMLayoutItemJson;
    index: number;
    children?: any;
    onResizeStart: (id: string) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, layoutItem: LayoutItemJson | IMLayoutItemJson) => void;
}
interface State {
    isResizing: boolean;
    dw: number;
    dh: number;
}
export declare class FlexRowItem extends React.PureComponent<LayoutItemProps & StateToLayoutItemProps & OwnProps, State> {
    initWidth: number;
    initHeight: number;
    state: State;
    onResizeStart: (id: string, initW: number, initH: number) => void;
    onResizing: (id: string, x: number, y: number, dw: number, dh: number) => void;
    onResizeEnd: (id: string, x: number, y: number, dw: number, dh: number, shiftKey?: boolean) => void;
    isStretchInCrossAxis(): boolean;
    calWidth(itemSetting: any, bbox: BoundingBox): {
        width: string;
        flex: string;
        flexShrink?: undefined;
    } | {
        width: string;
        flex?: undefined;
        flexShrink?: undefined;
    } | {
        flex: string;
        width?: undefined;
        flexShrink?: undefined;
    } | {
        width: string;
        flexShrink: number;
        flex?: undefined;
    };
    getStyle(layoutSetting: any, isHeightStretch: boolean, keepAspectRatio: boolean, isAutoHeight: boolean): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
