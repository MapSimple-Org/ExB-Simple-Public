import type { Store } from 'redux';
import type { UrlWidgetSpecificParams, UrlParameters, UrlHashParameters, IMUrlHashParameters } from './types/url-parameters';
import type { IMState } from './types/state';
import type { ArcGISSelectOptions as DataSourceSelectOptions } from './data-sources';
/**
 * The `UrlManager` is used to manage URL parameters.
 */
declare class UrlManager {
    static instance: UrlManager;
    static getInstance(): UrlManager;
    /**
     * Initialize QueryObject and HashObject in the URL
     * @param store exb app store
     */
    init(store: Store<IMState>): {
        queryObject: UrlParameters;
        urlHashObject: UrlHashParameters;
    };
    /**
     * Change to a page.
     * @param pageId the id of the page to change to
     */
    changePage(pageId: string): void;
    /**
     * Change to a view.
     * @param sectionId The id of the section that the view belongs to
     * @param viewId The id of the view to change to
     */
    changeView(sectionId: string, viewId: string): void;
    /**
     * Change to a dialog.
     * @param dialogId The id of the dialog to change to
     */
    changeDialog(dialogId: string): void;
    /**
     * Get the QueryObject of the current URL.
     */
    getQueryObject(): UrlParameters;
    /**
     * Change the query string in URL using the queryObject, only the passed in params you need to change.
     *  * To replace all query params, set `replaceQueryObject=true`
     *  * To remove a query param, set the param as null
     * @param queryObject can be partial of query object
     * @param options
     * * replaceHistory: replace the browser history. False means push a new history. True means replace the current history.
     * * isReplaceQueryObject: replace the queryObject instead of merge
     */
    changeQueryObject(queryObject: UrlParameters, options?: {
        replaceHistory?: boolean;
        isReplaceQueryObject?: boolean;
    }): void;
    /**
     * Get the HashObject of the current URL.
     */
    getHashObject(): IMUrlHashParameters;
    /**
     * To change the hash string in the URL, pass in an object with the key/values that you want to change in the hash string. Hash string values that are not included in the object will stay the same.
     * @param urlHashParametersObject can be partial of hash object
     * @param options
     * * replaceHistory: replace the browser history. False means push a new history. True means replace the current history.
     * * isReplaceHashObject: replace the urlHashObject instead of merge
     */
    changeUrlHashObject(urlHashParametersObject: IMUrlHashParameters, options?: {
        replaceHistory?: boolean;
        isReplaceHashObject?: boolean;
    }): void;
    /**
     * Set the corresponding hash parameters for a specific widget.
     * @param widgetId The id of a specific widget
     * @param hashParameters The corresponding UrlHash parameter object
     * @param options
     * * isReplaceHashObject: When false by default, hashParameters will be merged into the current parameters.
       If set to true, only the newly passed in parameters will be used.
  
      Example 1: set widget-url-params
      ```
        UrlManager.getInstance().setWidgetUrlParams(
          // 1. widgetID
          this.props.baseWidgetProps.id,
          // 2. UrlWidgetSpecificParams
          {
            p1: 'unencodedValue1',
            p2: 22,
            p3: '{"rotation":11,"scale":22,"target":{"sr":{"latestWkid":3857}}}'
          }
        )
      ```
  
      Example 2: remove widget-url-params
      ```
        UrlManager.getInstance().setWidgetUrlParams(
          // 1. widgetID
          this.props.baseWidgetProps.id,
          // 2. UrlWidgetSpecificParams
          {
            p1: 'unencodedValue1',
            p2: null,
            p3: null
          }
        )
      ```
  
      Example 3: clear widget-url-params
      ```
        UrlManager.getInstance().setWidgetUrlParams(
          this.props.baseWidgetProps.id,
          null
        )
      ```
     */
    setWidgetUrlParams(widgetId: string, hashParameters: UrlWidgetSpecificParams, options?: {
        isReplaceHashObject?: boolean;
    }): void;
    /**
     * @ignore
     */
    private setHashObject;
    /**
     * @ignore
     * set data_s in UrlHash for DS
     */
    changeHashObjectByDataSourceSelection(dsId: string, selectOptions: DataSourceSelectOptions): boolean;
}
export default UrlManager;
