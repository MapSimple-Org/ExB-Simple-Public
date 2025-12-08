/** @jsx jsx */
import { React, type IMLayoutItemJson, type BoundingBox } from 'jimu-core';
import { type LayoutItemProps } from '../../types';
interface OwnProps {
    layoutItem: IMLayoutItemJson;
    index: number;
    space: number;
    children?: any;
}
export declare class ColumnItem extends React.PureComponent<LayoutItemProps & OwnProps> {
    autoHeight: boolean;
    isStretchInCrossAxis(): boolean;
    calHeight(itemSetting: any, bbox: BoundingBox): {
        height: string;
        flex: string;
        flexShrink?: undefined;
    } | {
        height: string;
        flex?: undefined;
        flexShrink?: undefined;
    } | {
        flex: string;
        height?: undefined;
        flexShrink?: undefined;
    } | {
        height: string;
        flexShrink: number;
        flex?: undefined;
    };
    getStyle(layoutSetting: any, isStretch: boolean): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
