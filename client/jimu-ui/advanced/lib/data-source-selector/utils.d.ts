import { type ImmutableObject, type WidgetJson, type IMWidgetJson, type IMDataSourceJson, type DataSource, type IMAppConfig, type DataSourceInfo, type ImmutableArray, type DataSourceJson } from 'jimu-core';
import { getIconFromFieldType } from './components/field-selector/utils';
/**
 * Get widgets which are using a specific data source or data views of the data source (if the data source is main data source).
 */
export declare function getWidgetsUsingDsOrItsViews(dsId: string, allWidgets: ImmutableObject<{
    [widgetId: string]: WidgetJson;
}>, considerOutputDs?: boolean): IMWidgetJson[];
/**
 * Get widgets which are using:
 * 1. a specific data source, or,
 * 2. descendant data sources of the data source, or,
 * 3. data views of the data source (if the data source is main data source) or data views of the descendant data sources, or,
 * 4. output data sources from the data source or output data sources from the descendant data sources or output data sources from the data views
 */
export declare function getWidgetsUsingDsOrItsDescendantDss(dsId: string, allWidgets: ImmutableObject<{
    [widgetId: string]: WidgetJson;
}>, considerOutputDs?: boolean): IMWidgetJson[];
export declare function getWidgetsUsingDescendantDss(dsId: string, allWidgets: ImmutableObject<{
    [widgetId: string]: WidgetJson;
}>, considerOutputDs?: boolean): IMWidgetJson[];
/**
 * Get widgets which are using one specific main data source or one specific data view.
 * If `considerOutputDs` is true, should consider widgets using output data sources from the specific data source and data views of these output data sources.
 */
export declare function getWidgetsUsingOneDs(dsId: string, allWidgets: ImmutableObject<{
    [widgetId: string]: WidgetJson;
}>, considerOutputDs?: boolean): IMWidgetJson[];
/**
 * Get following data source id:
 * 1. the passed data source id, and,
 * 2. data views of the data source (if the data source is main data source), and,
 * 3. descendant data sources of the data source, and,
 * 4. data views of descendant data sources
 */
export declare function getDescendantDssAndViews(dsId: string): string[];
export declare function isFuzzySearch(label: string, searchValue: string): boolean;
export declare function isFuzzyFromDsIds(dsJson: IMDataSourceJson, fromDsIds: ImmutableArray<string>, hideDs: (dsJson: IMDataSourceJson) => boolean): boolean;
export declare function getOutputDssFromOriginDs(ds: DataSource): DataSource[];
export declare function getAppConfig(): IMAppConfig;
export declare function getWhetherDataSourceIsInited(dataSources: ImmutableObject<{
    [dsId: string]: DataSourceJson;
}>, dataSourcesInfo: ImmutableObject<{
    [dsId: string]: DataSourceInfo;
}>): boolean;
export declare function editDataSourceJson(dsJson: IMDataSourceJson): IMDataSourceJson;
/**
 * Return original data's url.
 * 1. If data source is from an item, will return item detail url,
 * else will return service url.
 * 2. When need to return service url, if the service is a hosted service, will return service url with corresponding token,
 * else will return service url without token.
 * (When need to return item detail url, will never add token to url. Because user can login in item detail page.)
 */
export declare function getOriginalDataUrl(dsJson: IMDataSourceJson): string;
/**
 * Return all ids of the widgets which are using one specific widget's output data source.
 * E.g. ds 1 -> widget A -> output ds 1 -> widget B -> output ds 2 -> widget C -> output ds 3,
 * pass in id of widget A, will return ids of widget A, widget B and widget C.
 */
export declare function getWidgetsUsingOutputDsFromOneWidget(widgetId: string): string[];
export declare function isMapWidget(widgetId: string): boolean;
export { getIconFromFieldType };
