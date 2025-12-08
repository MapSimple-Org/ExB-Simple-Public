import { type ImmutableObject, type QueriableDataSource, type DataSourceConstructorOptions, type QueryOptions, type QueryResult, type DataRecord, type QueryParams, type IMQueryParams, type GetCurrentQueryParamsOptions, type QueriableSelectOptions, type QueryProgressCallback, type Capabilities, type QueriableUsedFieldsOptions, type IMExportOptions } from 'jimu-core';
import { AbstractDataSource } from './abstract-data-source';
export declare abstract class AbstractQueriableDataSource extends AbstractDataSource implements QueriableDataSource {
    protected _isSqlCaseSensitive: boolean;
    private lastQueryId;
    private lastQueryParams;
    private lastCountQueryParams;
    private lastDataLoadTime;
    /**
     * Data will be cached here, not this.records.
     *
     * When selectRecordById, some selected records may be put in this.records, so they are not in the pages.
     */
    private pages;
    private pagePromises;
    /**
     * Promises to load missing fields for every page.
     * The promises contain a special page (its id is variable SELECTION_DATA_VIEW_ID), it is the promise to load missing fields for source records of selection view.
     */
    private loadMissingFieldsByPagePromises;
    /**
     * Promise to load missing fields for all pages.
     */
    private loadMissingFieldsForAllPagePromise;
    /**
     * If delay and merge multiple calls of load missing fields, will save used fields of these calls here and then send one request.
     */
    private usedFieldsInTimeWindow;
    /**
     * If delay and merge multiple calls of load missing fields, will save timer here.
     */
    private loadMissingFieldsTimer;
    private capabilities;
    private countPromise;
    private byIdPromise;
    private autoRefreshHandle;
    private _count;
    /**
     * Will call this function after the first time widget/components call `setSourceRecords`.
     */
    private onceSetSourceRecords;
    private readonly throttleQueryRecordsByIdWithCurrentQueryParams;
    /**
     * Pending promise which is used to query selected records preset before data source is ready.
     * E.g. selected record id in URL.
     */
    private pendingPromiseToQuerySelectedRecordsPresetBeforeDsReady;
    private abortControllerOfPendingPromiseToQuerySelectedRecordsBySelectOptions;
    constructor(options: DataSourceConstructorOptions);
    ready(): Promise<any>;
    protected loadNoSelectionView(): Promise<void>;
    private getSelectedIdsAndSelectOptionsFromUrl;
    get isSqlCaseSensitive(): boolean;
    set isSqlCaseSensitive(isCaseSensitive: boolean);
    getCurrentQueryParams(options?: GetCurrentQueryParamsOptions): any;
    getRuntimeQueryParams(excludeWidgetIds?: string | string[]): QueryParams;
    protected getCurrentQueryParamsWithSpecificWidgetQueries(options: GetCurrentQueryParamsOptions, widgetQueries: ImmutableObject<{
        [widgetId: string]: QueryParams;
    }>): any;
    protected getRuntimeQueryParamsWithSpecificWidgetQueries(excludeWidgetIds: string | string[], widgetQueries: ImmutableObject<{
        [widgetId: string]: QueryParams;
    }>): QueryParams;
    private getCurrentQueryParamsByQuery;
    private getMergedWidgetQueries;
    private getWidgetIdsFromWidgetDataSourcePairs;
    getCurrentQueryId(): string;
    getRealQueryParams(query: QueryParams, flag: 'query' | 'load', options?: QueryOptions): QueryParams;
    private mergeQueryWithConfigQuery;
    updateQueryParams(query: QueryParams, widgetId: string): void;
    protected updateWidgetQueries(query: QueryParams, widgetId: string): void;
    getQueryPageSize(): number;
    getMaxQueryPageSize(): number;
    getMaxRecordCount(): number;
    private getQueryWithoutPage;
    private checkClearLocalCache;
    selectRecords(options: QueriableSelectOptions, signal?: AbortSignal, progressCallback?: QueryProgressCallback): Promise<QueryResult>;
    selectAllLoadedRecords(): void;
    protected copySelectionToDataView(selection: DataRecord[]): void;
    private clearPendingSelect;
    getRecordsByPage(page: number, pageSize: number): DataRecord[];
    getRecordsByPageWithSelection(page: number, pageSize: number): DataRecord[];
    getPagesData(): {
        [page: number]: DataRecord[];
    };
    setPagesData(pages: {
        [page: number]: DataRecord[];
    }): void;
    clearRecordsNotAddVersion(): void;
    clearCountNotAddVersion(): void;
    clearQueryByIdNotAddVersion(): void;
    /**
     * Get continuous page records.
     */
    getRecords(): DataRecord[];
    /**
     * Get all loaded page records.
     */
    getAllLoadedRecords(): DataRecord[];
    setRecords(records: DataRecord[]): void;
    setSourceRecords(records: DataRecord[]): void;
    get count(): number;
    set count(c: number);
    getRealQueryPages(page: number, pageSize: number): number[];
    protected getStartAndEndForPage(page: number, pageSize: number): {
        start: number;
        end: number;
    };
    haveMorePages(page: number, pageSize: number): boolean | 'unknown';
    /**
     * the page/pageSize in query will not be used in the actual query
     */
    load(query: QueryParams, options?: QueryOptions): Promise<DataRecord[]>;
    loadAll(query: QueryParams, signal?: AbortSignal, progressCallback?: QueryProgressCallback, options?: QueryOptions): Promise<DataRecord[]>;
    private getRecordsByPageAndLoadMoreIfExceededTransferLimit;
    /**
     * If the page is loaded and `exceededTransferLimit` is true, will use the length of the current page, or, will use the query page size.
     * It is caused by when `exceededTransferLimit` is true, the real page size may be less than the query page size.
     * If the `exceededTransferLimit` is absent or false, the last page's real page size may be less than the query page size, but it is expected.
     */
    private getRealPageSize;
    /**
     * Check and load missing fields for loaded records.
     * If delay is true, will merge multiple calls and send one request after time window run out.
     */
    loadMissingFields(realQuery: QueryParams, delay?: boolean): void;
    private doLoadMissingFields;
    private loadMissingFieldsByPage;
    /**
     * Keep selection after data source or data view is loaded.
     */
    private handleSelectionOnQueryParamChanges;
    /**
     * the resolved boolean means whether the query result is used (only the last query update records)
     */
    private loadByPage;
    private sourceRecordsMissingFields;
    loadCount(query: QueryParams, options?: QueryOptions): Promise<number>;
    loadById(id: string, refresh?: boolean): Promise<DataRecord>;
    query(query: QueryParams, options?: QueryOptions): Promise<QueryResult>;
    queryCount(query: QueryParams, options?: QueryOptions): Promise<QueryResult>;
    queryIds(query: QueryParams, options?: QueryOptions): Promise<QueryResult>;
    private loadOrQueryAll;
    queryAll(query: QueryParams, signal?: AbortSignal, progressCallback?: QueryProgressCallback, options?: QueryOptions): Promise<QueryResult>;
    queryById(id: string, fields?: string[]): Promise<DataRecord>;
    getAutoRefreshInterval(): number;
    getLastAutoRefreshCheckTime(): number;
    getLastDataLoadTime(): number;
    private setLastAutoRefreshCheckTime;
    private setLastDataLoadTime;
    startAutoRefresh(): void;
    updateLastEditTime(): Promise<void>;
    protected getLastEditTime(): number;
    stopAutoRefresh(): void;
    setNeedRefresh(needRefresh: boolean): void;
    setCapabilities(cap: Capabilities): void;
    getCapabilities(): Capabilities;
    getMainDataSource(): QueriableDataSource;
    getDataViews(): QueriableDataSource[];
    getDataView(dataViewId: string): QueriableDataSource;
    updateSelectionInfo(options: QueriableSelectOptions, triggerDataSource: QueriableDataSource, forceCheck?: boolean): void;
    private changeSelectedRecordIdsOfDsInfo;
    private queryRecordsByIdWithCurrentQueryParams;
    protected deleteOneLoadedRecordById(ds: QueriableDataSource, id: string): boolean;
    afterAddRecord(record: DataRecord): void;
    afterUpdateRecords(records: DataRecord[]): void;
    afterUpdateRecord(record: DataRecord): void;
    afterDeleteRecordsByIds(ids: string[]): void;
    afterDeleteRecordById(id: string): void;
    private checkAndClearCacheNotAddVersion;
    setOnceSetSourceRecords(func: () => void): void;
    getAllUsedFields(options?: QueriableUsedFieldsOptions): string[] | '*';
    getExportOptions(): IMExportOptions;
    abstract getConfigQueryParams(): QueryParams;
    abstract getRemoteQueryParams(): QueryParams;
    abstract mergeQueryParams(...queries: QueryParams[]): QueryParams;
    abstract allowToExportData(): Promise<boolean>;
    /**
     * Apply used fields to query params to only load the fields which are used by widgets/components.
     */
    abstract applyUsedFields(query: QueryParams, usedFields: string[] | '*'): QueryParams;
    /**
     * Origin query is the query params which is passed to `query` / `load` method.
     * Real query is the result of merging origin query and other configured queries.
     * In the merging process, some query params may be removed due to the service capability.
     *
     * Use real query to send the query request, use origin query to get the removed query params and enhance the query result.
     */
    protected abstract doQuery(realQuery: IMQueryParams, originQuery: IMQueryParams): Promise<QueryResult>;
    protected abstract doQueryCount(realQuery: IMQueryParams): Promise<QueryResult>;
    protected abstract doQueryIds(realQuery: IMQueryParams): Promise<QueryResult>;
    protected abstract doQueryById(id: string, fields?: string[]): Promise<DataRecord>;
}
