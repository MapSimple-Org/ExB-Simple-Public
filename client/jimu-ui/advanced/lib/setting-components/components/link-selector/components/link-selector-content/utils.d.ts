import { type IMAppConfig, type IntlShape, type URIScheme, type IMLinkParam, type LinkParam } from 'jimu-core';
export declare function getSectionIdsFromPage(pageId: string, appConfig: IMAppConfig): string[];
export declare function getSectionIdsFromDialog(dialogId: string, appConfig: IMAppConfig): string[];
/**
 * return all child views of parent view,
 * e.g., page_1 -> section_1 -> view_1 -> section_2 -> view_2 -> section_3 -> view_3
 * input view_1, return [view_2, view_3],
 * input view_2, return [view_3],
 * input view_undefiled, return []
 */
export declare function getAllChildViewIds(parentViewId: string, appConfig: IMAppConfig): string[];
export declare function getSectionIdsFromView(viewId: string, appConfig: IMAppConfig): string[];
export declare function getViewInfoFromSection(sectionId: string, appConfig: IMAppConfig): ViewInfo[];
export interface ViewInfo {
    id: string;
    label: string;
}
export declare function getPageData(appConfig: IMAppConfig, intl: IntlShape): Array<{
    id: string;
    name: string;
}>;
export declare function getDialogData(appConfig: IMAppConfig): Array<{
    id: string;
    name: string;
}>;
export declare function linkToViewOnDialog(linkParams: IMLinkParam | LinkParam): boolean;
export declare function isDialogId(id: string): boolean;
export declare const supportedURISchemes: URIScheme[];
