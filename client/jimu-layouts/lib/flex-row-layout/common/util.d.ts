import { type BoundingBox, type IMLayoutItemJson } from 'jimu-core';
export declare function calWidth(itemSetting: any, bbox: BoundingBox): {
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
export declare function isStretchInCrossAxis(layoutItem: IMLayoutItemJson): boolean;
export declare function getItemStyle(style: any, layoutSetting: any, isStretch: boolean): import("jimu-core").SerializedStyles;
