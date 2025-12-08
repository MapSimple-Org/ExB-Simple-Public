import { type IMLayoutJson, type IMAppConfig, type IMState, GridItemType, type IMGridLayoutItemJson, type LayoutInfo } from 'jimu-core';
export declare function indexOfPlainContent(layout: IMLayoutJson, layoutItemId: string): number;
export declare function isLastChildOfRootItem(layout: IMLayoutJson, layoutItemId: string): boolean;
export declare function isExpandable(state: IMState, layoutId: string, layoutItemId: string): boolean;
export interface GridNode {
    layoutItemId: string;
    type: GridItemType;
    children?: GridNode[];
}
export declare function getGridItem(layout: IMLayoutJson, layoutItemId: string): IMGridLayoutItemJson;
export declare function getGridLayoutStructure(layout: IMLayoutJson): GridNode;
export declare function getLabelOfGridTab(appConfig: IMAppConfig, layoutInfo: LayoutInfo, translate: (id: string) => string): string;
export declare function calPaddingStyle(layoutSetting: any): import("jimu-core").SerializedStyles;
