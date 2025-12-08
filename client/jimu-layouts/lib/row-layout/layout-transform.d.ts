import { type IMAppConfig, type extensionSpec, type IMLayoutJson, BrowserSizeMode, type IMLayoutItemJson, LayoutType } from 'jimu-core';
export declare function getWidgetHeight(appConfig: IMAppConfig, widgetsState: {
    [key: string]: any;
}, widgetId: string): number;
export declare function getHeightOfLayoutItems(appConfig: IMAppConfig, widgetsState: {
    [key: string]: any;
}, layoutId: string): {
    [key: string]: {
        height?: number;
        setting: any;
    };
};
export declare class RowLayoutTransformer implements extensionSpec.LayoutTransformerExtension {
    id: string;
    layoutType: LayoutType;
    transformLayout(layout: IMLayoutJson, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode, appConfig: IMAppConfig): IMLayoutJson;
    transformLayoutItem(item: IMLayoutItemJson, index: number, fromLayoutId: string, toLayoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): {
        item: IMLayoutItemJson;
        index: number;
    };
}
