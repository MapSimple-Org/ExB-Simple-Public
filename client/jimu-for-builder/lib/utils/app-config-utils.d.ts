import { type IMAppConfig, appConfigUtils, type AppConfig } from 'jimu-core';
declare const getUniqueId: typeof appConfigUtils.getUniqueId, getUniqueLabel: typeof appConfigUtils.getUniqueLabel, parseUniqueLabel: typeof appConfigUtils.parseUniqueLabel, getSizeModeOfALayout: typeof appConfigUtils.getSizeModeOfALayout;
export { getUniqueId, getUniqueLabel, parseUniqueLabel, getSizeModeOfALayout };
export declare function isFirstLevelPage(appConfig: IMAppConfig, pageId: string): boolean;
export declare function isPageHasSubPage(appConfig: IMAppConfig, pageId: string): boolean;
export declare function getRealPageCount(appConfig: IMAppConfig): number;
export declare function getSubRealPageCount(appConfig: IMAppConfig, parentPageId: string): number;
/**
 * Exclude the passed in page and it's sub pages.
 * @param appConfig
 * @param pageId the page that is excluded
 */
export declare function getRealPageCountExcludeOnePage(appConfig: IMAppConfig, pageId: string): number;
export declare function isRealPage(appConfig: IMAppConfig, pageId: string): boolean;
export declare function cleanAppStructure(config: AppConfig): AppConfig;
export declare function getCleanAppConfig(appConfig: IMAppConfig): AppConfig;
export declare function isLabelDuplicated(appConfig: AppConfig | IMAppConfig, type: 'page' | 'view' | 'dialog', id: string, label: string): boolean;
export declare function replaceOldThemeVariables(appConfig: IMAppConfig): Promise<IMAppConfig>;
