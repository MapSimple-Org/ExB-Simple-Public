import { Immutable, type ImmutableObject, type ImmutableArray, type WidgetsJson, type AppConfig, UrlGeneralConfig, type UrlParamsWidgetsConfig, type BrowserSizeMode, DialogMode } from 'jimu-core';
export interface WidgetsInfoInPages {
    pageInfo: {
        id: string;
        label: string;
    };
    widgetsInfo: Array<{
        id: string;
        label: string;
    }>;
}
export interface WidgetsInfoInHeaderFooter {
    mode: 'Header' | 'Footer';
    widgetsInfo: Array<{
        id: string;
        label: string;
    }>;
}
export interface WidgetsInfoInDialogs {
    dialogInfo: {
        mode: DialogMode;
        id: string;
        label: string;
    };
    widgetsInfo: Array<{
        id: string;
        label: string;
    }>;
}
declare class UrlConfigManager {
    static instance: UrlConfigManager;
    static getInstance(): UrlConfigManager;
    getWidgetsUseUrlParamsInManifest(): ImmutableObject<WidgetsJson>;
    isGeneralUrlConfigEnable: (generalConfig: UrlGeneralConfig) => boolean;
    updateGeneralUrlConfigEnable(generalUrlConfig: UrlGeneralConfig, isEnable: boolean): void;
    isZoomToSelectionEnable: () => boolean;
    updateZoomToSelectionEnable(isEnable: boolean): void;
    isWidgetParamEnable(widgetId: string, paramName: string, isOnlyOneWidgetParamMode?: boolean): boolean;
    updateWidgetEnable(widgetId: string, isEnable: boolean): void;
    updateWidgetParamEnable(widgetId: string, paramName: string, isEnable: boolean): void;
    getFlatPageInfos(pageStructure: ImmutableArray<{
        [pageId: string]: string[];
    }>): any[];
    getWidgetsInPages(currentBrowserSizeMode: BrowserSizeMode, filterString: string): WidgetsInfoInPages[];
    getWidgetsInHeaderFooter(currentBrowserSizeMode: BrowserSizeMode, filterString: string): WidgetsInfoInHeaderFooter[];
    getWidgetsInDialogs(currentBrowserSizeMode: BrowserSizeMode, filterString: string): WidgetsInfoInDialogs[];
    private _findCommonWidgetsInManifest;
    private _getWidgetLabel;
    private _getPageLabel;
    getWidgetsUrlParamsConfig(widgetId: string): {
        appConfig: Immutable.ImmutableObject<AppConfig>;
        widgetUrlConfig: ImmutableObject<UrlParamsWidgetsConfig>;
    };
    private _setWidgetUrlConfig;
    private updateUrlParamsConfig;
}
/**
 * The `UrlConfigManager` is used to manage url params config, in app-setting.
 */
export default UrlConfigManager;
