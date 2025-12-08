import { type IMState, type IMLayoutItemJson, type LayoutItemJson, type SerializedStyles } from 'jimu-core';
export interface StateToFlowItemProps {
    isEmpty: boolean;
    padding: number;
    selected: boolean;
}
export declare const mapStateToFlowItemProps: (state: IMState, ownProps: {
    layoutItem: IMLayoutItemJson;
    layoutId: string;
}) => StateToFlowItemProps;
export declare function getWidthFromSetting(setting: any): string;
export declare function calculateFloatingPosition(layoutItem: LayoutItemJson | IMLayoutItemJson, resizingProps?: {
    dh: number;
    dw: number;
    isResizing: boolean;
    initWidth: number;
    initHeight: number;
}): SerializedStyles;
