import type { ImmutableObject } from 'jimu-core';
export interface ToolConfig {
    [key: string]: boolean;
}
export interface InitialMapState {
    viewPoint: __esri.Viewpoint;
    viewType: '2d' | '3d';
    extent: __esri.Extent;
    rotation: number;
}
export interface JimuMapConfig {
    disableScroll?: boolean;
    disablePopUp?: boolean;
    showPopupUponSelection?: boolean;
    initialMapDataSourceID?: string;
    toolConfig?: ToolConfig;
    initialMapState?: InitialMapState;
    canPlaceHolder?: boolean;
    placeholderImage?: string;
    layoutIndex: number;
    selectionHighlightColor?: string;
    selectionHighlightHaloColor?: string;
}
export type IMJimuMapConfig = ImmutableObject<JimuMapConfig>;
