import { type extensionSpec, LayoutType, type IMLayoutItemJson, BrowserSizeMode, type IMLayoutJson, type ImmutableArray } from 'jimu-core';
export declare class GridLayoutTransformer implements extensionSpec.LayoutTransformerExtension {
    id: string;
    layoutType: LayoutType;
    transformLayout: (layout: IMLayoutJson, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode) => IMLayoutJson;
    collectItem: (layout: IMLayoutJson, rootId: string, mainItem: string, childIds: ImmutableArray<string>, itemList: string[]) => IMLayoutJson;
    transformLayoutItem(item: IMLayoutItemJson, index: number, fromLayoutId: string, toLayoutId: string, fromSizeMode: BrowserSizeMode, toSizeMode: BrowserSizeMode): {
        item: IMLayoutItemJson;
        index: number;
    };
}
