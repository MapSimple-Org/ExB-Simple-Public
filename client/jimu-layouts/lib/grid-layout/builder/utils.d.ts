import { type LayoutItemConstructorProps, type LayoutInfo, type IMAppConfig, type IMLayoutJson } from 'jimu-core';
import { SideType } from './types';
export declare function addItemToGrid(appConfig: IMAppConfig, item: LayoutItemConstructorProps, parentLayoutInfo: LayoutInfo, referenceItemId: string, side: SideType): Promise<{
    appConfig: IMAppConfig;
    layoutInfo: LayoutInfo;
}>;
export declare function splitGrid(appConfig: IMAppConfig, item: LayoutItemConstructorProps, gridLayoutId: string, side: SideType): Promise<{
    appConfig: IMAppConfig;
    itemId: string;
}>;
export declare function detachGridItem(layout: IMLayoutJson, layoutItemId: string): IMLayoutJson;
