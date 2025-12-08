import { type IMLayoutJson, type LayoutInfo, GridItemType, type GridLayoutItemJson } from 'jimu-core';
import { SideType } from './types';
export declare function createEmptyGridItem(layout: IMLayoutJson, type: GridItemType): {
    outLayout: IMLayoutJson;
    outItem: GridLayoutItemJson;
};
export declare function attachToGridItem(layout: IMLayoutJson, source: string, target: string, side: SideType): IMLayoutJson;
export declare function updateSize(layout: IMLayoutJson, itemId: string, size: number): IMLayoutJson;
export declare function updateGridItem(layout: IMLayoutJson, itemId: string, propName: string, value: any): IMLayoutJson;
export declare function duplicateItem(layoutInfo: LayoutInfo): void;
export declare function pendGridLayoutItem(layoutInfo: LayoutInfo): void;
export declare function attach(layout: IMLayoutJson, source: string, target: string, type: GridItemType, beforeTarget: boolean, shareSpace: boolean): IMLayoutJson;
export declare function splitGridCell(layoutInfo: LayoutInfo, direction: 'h' | 'v', insertBefore: boolean): void;
