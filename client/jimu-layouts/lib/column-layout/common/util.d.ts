import { type BoundingBox, type IMLayoutItemJson } from 'jimu-core';
export declare function calHeight(itemSetting: any, bbox: BoundingBox): {
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
export declare function isStretchInCrossAxis(layoutItem: IMLayoutItemJson): boolean;
export declare function getItemStyle(style: any, layoutSetting: any, isStretch: boolean): import("jimu-core").SerializedStyles;
