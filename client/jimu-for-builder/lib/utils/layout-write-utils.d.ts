import { type LayoutInfo, type IMAppLayouts, type AppLayouts, type AppConfig, type SizeModeLayoutJson } from 'jimu-core';
/**
 * Remove the item id from its parent's content
 * @param layoutInfo
 * @param deleteFromLayout
 * @param layouts
 */
export declare function removeItemFromParent(layoutInfo: LayoutInfo, deleteFromLayout: boolean, layouts: IMAppLayouts): IMAppLayouts;
export declare function createEmptyLayoutItem(layoutId: string, layouts: IMAppLayouts): {
    layoutInfo: LayoutInfo;
    layouts: IMAppLayouts;
};
export declare function cleanupRuntimeLayouts(layouts: AppLayouts): AppLayouts;
export declare function cleanupLayoutStructure(appConfig: AppConfig, layoutId: string): AppConfig;
export declare function cleanupSizemodeLayoutStructure(appConfig: AppConfig, sizeModeLayout: SizeModeLayoutJson): AppConfig;
