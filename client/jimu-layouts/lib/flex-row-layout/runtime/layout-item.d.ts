/** @jsx jsx */
import { React, type IMLayoutItemJson, type BoundingBox } from 'jimu-core';
import { type LayoutItemProps, type StateToLayoutItemProps } from '../../types';
interface OwnProps {
    layoutItem: IMLayoutItemJson;
    index: number;
    children?: any;
}
export declare class FlexRowItem extends React.PureComponent<LayoutItemProps & StateToLayoutItemProps & OwnProps> {
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
