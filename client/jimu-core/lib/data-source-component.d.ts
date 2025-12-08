import * as React from 'react';
import * as Immutable from 'seamless-immutable';
import type { IMDataSourceInfo } from './types/state';
import { type DataSource, type QueryParams, type QueryScope, DataSourceStatus, type QueryProgressCallback } from './data-sources';
import DataSourceManager from './data-source-manager';
import type { IMDataSourceJson, IMDataSourceSchema, IMUseDataSource, UseDataSource } from './types/app-config';
import { AppMode } from './types/common';
import type { ImmutableArray } from 'seamless-immutable';
export type DataRenderFunction = (ds: DataSource, info: IMDataSourceInfo, query: QueryParams) => React.ReactNode;
/**
 * For `needRefresh`, require query only when the changed data source is the directly used data source.
 * If `needRefresh` of belong-to data source changes, won't require query.
 *
 * For `status`, if the data source status changes to `DataSourceStatus.Unloaded`, it will require a query.
 */
declare const RequireQueryDataSourceInfoChange: readonly ["widgetQueries", "sourceVersion", "gdbVersion", "needRefresh", "status"];
/**
 * Data source info which requires widgets to do query to refresh themselves.
 */
export interface QueryRequiredInfo {
    [dataSourceId: string]: Pick<IMDataSourceInfo, typeof RequireQueryDataSourceInfoChange[number]>;
}
/**
 * The DataSourceComponent component props.
 */
export interface DataSourceComponentProps {
    /**
     * Data source used by widget. Either `useDataSource` or `dataSource` is required.
     *
     * If the used data source is configured in settings and is saved in widget json, please use `useDataSource`.
     * If the used data source is added in runtime and is not saved in widget json, please use `dataSource`.
     * If pass in both `useDataSource` and `dataSource`, will use `dataSource`.
     */
    useDataSource?: IMUseDataSource;
    /**
     * Data source instance used by widget. Either `useDataSource` or `dataSource` is required.
     */
    dataSource?: DataSource;
    /**
     * Pass widgetId/localId if need to execute the query.
     *
     * For main data source or data view, please use widgetId.
     * For local data source, please use localId. The recommended localId is: widgetId + ??? .
     */
    widgetId?: string;
    /**
     * Pass widgetId/localId if need to execute the query.
     *
     * For main data source or data view, please use widgetId.
     * For local data source, please use localId. The recommended localId is: widgetId + ??? .
     */
    localId?: string;
    /**
     * Whether load record count when loading data records or not.
     */
    queryCount?: boolean;
    /**
     * Whether to load all the records page by page or not.
     * Loading all records may take a long time and may cause performance issues. We recommend using the `queryAllProgress` and the `queryAllSignal` to show the progress and cancel the query if necessary.
     */
    queryAll?: boolean;
    /**
     * Only valid when `queryAll` is true.
     * The signal object is used to communicate with the query requests.
     * See https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal for more information.
     */
    queryAllSignal?: AbortSignal;
    /**
     * Only valid when `queryAll` is true.
     * The function is called when the query is in progress.
     */
    queryAllProgress?: QueryProgressCallback;
    /**
     * Increment `forceRefreshVersion` to force data source to load even if the query parameter does not change.
     * Please note, all widgets using the data source will refresh, too.
     */
    forceRefreshVersion?: number;
    /**
     * Query parameters of queriable data source.
     * The component does not execute a query without query property.
     * To execute a query without adding new filter, please use an empty object: {}.
     */
    query?: QueryParams;
    /**
     * Query scope defines which data is returned when the query is executed in addition to the query parameters.
     */
    queryScope?: QueryScope;
    /**
     * If one of your children component's render depends on data source, please use this render function.
     * Otherwise, even if the data record in the data source is changed, your children will not be re-rendered
     * unless you connect the data source info in the children owner component to re-render the owner component.
     *
     * See here for the difference between parent and owner context: https://gist.github.com/jimfb/0eb6e61f300a8c1b2ce7.
     */
    children?: DataRenderFunction | React.ReactNode;
    /**
     * If the creation of the data source fails, this string will be shown.
     */
    errorString?: string;
    /**
  
     *  Will call the function when the data source info changes and on the component is mounted.
     */
    onDataSourceInfoChange?: (info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => void;
    /**
     * This callback is triggered whenever the data source properties such as filters or gdbVersion change, and on the component is mounted.
     * For example, adding a filter to data source will trigger the callback and selecting a record won't.
     *
     * Please note this callback will be valid only when the `query` prop is not used.
     */
    onQueryRequired?: (queryRequiredInfo: QueryRequiredInfo, preQueryRequiredInfo?: QueryRequiredInfo) => void;
    /**
     * Will call the function when the selected records change and on the component is mounted.
     *
     * The selection is shared between the main data source, data view, and local data source and local data view.
     * So this callback will be invoked when selection is make on any of them.
     *
     * Note that the local data source or local data view does not listen to the selection by default, you need to call `setListenSelection(true)`
     * to enable it when you need to.
     */
    onSelectionChange?: (selection: ImmutableArray<string>, preSelection?: ImmutableArray<string>) => void;
    /**
     * Will call the function when the data source status changes and on the component is mounted.
     */
    onDataSourceStatusChange?: (status: DataSourceStatus, preStatus?: DataSourceStatus) => void;
    /**
     * Will call the function when the data source schema changes.
     */
    onDataSourceSchemaChange?: (schema: IMDataSourceSchema, prevSchema?: IMDataSourceSchema) => void;
    /**
     * Will call the function when the data source is created.
     * Please note that some child data sources may not have been created by the time the current data source is created.
     */
    onDataSourceCreated?: (ds: DataSource) => void;
    /**
     * Will call the function when fail to create the data source.
     */
    onCreateDataSourceFailed?: (err: any) => void;
    /**
     * Will call the function when all the child data sources are created.
     * Please note the function is valid only when the current data source is data source set.
     */
    onAllChildDataSourcesCreated?: (ds: DataSource) => void;
}
interface DataSourceComponentStateProps {
    dataSource: DataSource;
    dataSourceInfo: IMDataSourceInfo;
    dataSourceJson: IMDataSourceJson;
    dataSourceSchema: IMDataSourceSchema;
    rootDataSourceJson?: IMDataSourceJson;
    dataSourceManager: DataSourceManager;
    belongToDataSourceInfo?: IMDataSourceInfo;
    belongToBelongToDataSourceInfo?: IMDataSourceInfo;
    appMode: AppMode;
}
type AllProps = DataSourceComponentProps & DataSourceComponentStateProps;
declare class DataSourceComponentInner extends React.PureComponent<AllProps, unknown, unknown> {
    componentDidMount(): void;
    componentDidUpdate(prevProps: AllProps): void;
    areSelectedIdsSame(prevSelectedIds: ImmutableArray<string>, selectedIds: ImmutableArray<string>): boolean;
    render(): React.ReactNode;
    doQuery(): void;
    handleAutoRefresh(): void;
    createDataSource(): void;
    private getChangedQueryRequiredInfos;
    private areQueryRequiredInfosChanged;
    private areQueryRequiredPropsChanged;
    private getQueryRequiredInfoChangeKeysForBelongToDs;
    private setChangedInfoToResult;
    private getChangedInfo;
    private areInfosOrPropsChanged;
    private getDsAndBelongToDsIds;
}
/**
 * A react component that makes data source easy to use. It helps widgets to create data source instance, load records and listen changes of data source.
 * In most cases, you can pass in `useDataSource` and `query`, and render the query result by using a render function as a child component.
 * The query result records are put into data source `records` property (Internally, it calls `load()` method).
 *
 * ```tsx
 * <DataSourceComponent useDataSource={props.useDataSources[0]} onDataSourceCreated={handleDataSourceCreated} onCreateDataSourceFailed={handleDataSourceFailed} onDataSourceInfoChange={handleDataSourceChange} />
 * ```
 *
 * ```tsx
 * const renderData = (ds: DataSource, info: IMDataSourceInfo) => {
 *  return <div>
 *  {
 *    ds && ds.getRecords().map(r => <div>{r.getId()}</div>)
 *  }
 *  </div>
 * }
 * <DataSourceComponent widgetId={props.id} query={{ where: '1=1' }} useDataSource={props.useDataSources[0]}>{renderData}</DataSourceComponent>
 * ```
 */
export declare const DataSourceComponent: import("react-redux").ConnectedComponent<typeof DataSourceComponentInner, {
    widgetId?: string;
    children?: DataRenderFunction | React.ReactNode;
    ref?: React.Ref<DataSourceComponentInner>;
    key?: React.Key | null | undefined;
    query?: QueryParams;
    onSelectionChange?: (selection: ImmutableArray<string>, preSelection?: ImmutableArray<string>) => void;
    localId?: string;
    useDataSource?: Immutable.ImmutableObjectMixin<UseDataSource> & {
        readonly dataSourceId: string;
        readonly mainDataSourceId: string;
        readonly dataViewId?: string;
        readonly rootDataSourceId?: string;
        readonly fields?: Immutable.ImmutableArray<string>;
        readonly useFieldsInPopupInfo?: boolean;
        readonly useFieldsInSymbol?: boolean;
    };
    queryCount?: boolean;
    queryAll?: boolean;
    queryAllSignal?: AbortSignal;
    queryAllProgress?: QueryProgressCallback;
    forceRefreshVersion?: number;
    queryScope?: QueryScope;
    errorString?: string;
    onDataSourceInfoChange?: (info: IMDataSourceInfo, preInfo?: IMDataSourceInfo) => void;
    onQueryRequired?: (queryRequiredInfo: QueryRequiredInfo, preQueryRequiredInfo?: QueryRequiredInfo) => void;
    onDataSourceStatusChange?: (status: DataSourceStatus, preStatus?: DataSourceStatus) => void;
    onDataSourceSchemaChange?: (schema: IMDataSourceSchema, prevSchema?: IMDataSourceSchema) => void;
    onDataSourceCreated?: (ds: DataSource) => void;
    onCreateDataSourceFailed?: (err: any) => void;
    onAllChildDataSourcesCreated?: (ds: DataSource) => void;
    dataSource?: DataSource;
    context?: React.Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default DataSourceComponent;
