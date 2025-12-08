import { type IMAppConfig, type LayoutInfo, type BrowserSizeMode } from 'jimu-core';
export declare class EmptyContentService {
    /**
     * Set content id of the layout item, the type of the layout item should have been set.
     * @param appConfig
     * @param layoutInfo
     * @param contentId
     * @param sizeMode
     * @returns
     */
    setContentId(appConfig: IMAppConfig, layoutInfo: LayoutInfo, contentId: string, sizeMode: BrowserSizeMode): IMAppConfig;
}
declare const _default: EmptyContentService;
export default _default;
