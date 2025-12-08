import * as React from 'react';
import { type History } from 'history';
import { type IMUrlHashParameters, type UrlParameters } from './types/url-parameters';
import type { Location } from './types/common';
import type { SectionNavInfo } from './types/state';
import type { ArcGISSelectOptions as DataSourceSelectOptions } from './data-sources';
export declare const browserHistory: import("history").BrowserHistory;
export declare function putBrowserHistoryLocalState(): void;
export declare function restoreBrowserHistoryLocalState(): void;
export declare const HistoryContext: React.Context<import("history").BrowserHistory>;
export declare const HistoryProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
export declare function withHistory<T extends React.ComponentClass<any, any>>(Component: any): T;
/**
 * Change the query string in URL using the queryObject, only the passed in params you need to change.
 *  * To replace all query params, set `replaceQueryObject=true`
 *  * To remove a query param, set the param as null
 * @param queryObject can be partial of query object
 * @param replaceHistory replace the browser history. False means push a new history. True means replace the current history.
 * @param replaceQueryObject replace the queryObject instead of merge
 */
export declare function changeQueryObject(queryObject: UrlParameters, replaceHistory?: boolean, replaceQueryObject?: boolean): void;
/**
 * Change the hash string in URL.
 */
export declare function changeUrlHashObject(urlHashParametersObject: IMUrlHashParameters, options?: {
    replaceHistory?: boolean;
    isReplaceHashObject?: boolean;
}): void;
/**
 * Change to a page.
 * @param pageId the id of the page to change to
 */
export declare function changePage(pageId: string): void;
/**
 * Change to a view.
 * @param sectionId The id of the section that the view belongs to
 * @param viewId The id of the view to change to
 */
export declare function changeView(sectionId: string, viewId: string): void;
export declare function changeViewBySectionNavInfo(sectionId: string, navInfo: SectionNavInfo): void;
/**
 * Change to a dialog.
 * @param dialogId The id of the dialog to change to
 */
export declare function changeDialog(dialogId: string): void;
export declare function changeHashObjectByDataSourceSelection(dsId: string, selectOptions: DataSourceSelectOptions): void;
export declare function changeQueryObjectByDataSourceGDBVersion(dsId: string, gdbVersion: string): void;
export type { History, Location };
