import { type DataSource, type DataSourceConstructorOptions } from './data-sources';
import type { UseDataSource, IMDataSourceJson, IMDataSourceSchema, IMUseDataSource } from './types/app-config';
import type { ImmutableObject } from 'seamless-immutable';
/**
 * The `DataSourceManager` is used to manage data source, including create/get/destroy data source instance.
 * Please always use `DataSourceManager.getInstance()` to use this class. For example, to get a data source, you can use `DataSourceManager.getInstance().getDataSource(dsId)`.
 * For widget developer, `DataSourceManager.getInstance()` return the same instance for both widget and widget's settings.
 *
 * To use data source, the recommended way is to use `DataSourceComponent`, which is more handy.
 */
export declare class DataSourceManager {
    private static instance;
    /**
     * Return the instance of DataSourceManager. If the instance is not created, it will create a new one. If the instance is created, it will return the existing one.
     * The instance is shared by the app and the builder.
     */
    static getInstance(): DataSourceManager;
    constructor();
    private dataSources;
    private dataSourcesCreatePromise;
    private dataSourceFactories;
    private readonly childDataSourcesPendedByTime;
    private readonly throttleDispatchPendedNotCreatedStatus;
    private readonly throttleDispatchPendedCreatedStatus;
    private readonly traversedDataSourceIdsByTime;
    private readonly notCreatedDataSourceIds;
    private readonly createdDataSourceIds;
    private readonly doNotBatchStatusDataSourceIds;
    /**
     * Return the data source instance by ID. If the data source is not created, it will return undefined.
     */
    getDataSource(dsId: string): DataSource;
    getDataViewDataSource(mainDsId: string, dataViewId: string): DataSource;
    getDataSources(): {
        [dsId: string]: DataSource;
    };
    getDataSourcesAsArray(): DataSource[];
    setDataSource(dsId: string, ds: DataSource): void;
    destroyAllDataSources(): void;
    destroyDataSource(dsId: string): void;
    /**
     * @ignore
     * Return the data sources that are configured in ds setting.
     */
    getConfiguredDataSources(): DataSource[];
    /** @ignore */
    getWidgetGeneratedDataSources(): {
        [widgetId: string]: DataSource[];
    };
    /**
     * Return the successfully created data sources only.
     * For the failed created data sources, return null.
     */
    createAllDataSources(): Promise<DataSource[]>;
    /**
     * Create all data sources by time.
     * By default, the method will start to create 30 data sources (do not wait for them to be created), then wait for 1000 ms, and then start to create the next 30 data sources.
     * When creating one data source, the method won't create any of its child data sources.
     *
     * When creating data sources by time, the method will batch to dispatch the data source instance status changes (`NotCreated` and `Created`) by passing `batchInstanceStatusChange` to true.
     * It is to reduce the number of dispatches and improve the performance.
     * If widgets create data sources by the data source component (via `createDataSourceByUseDataSource` method), the `batchInstanceStatusChange` will be set as false by default.
     * That is to say, won't batch to dispatch the data source instance status changes if the data sources are used by widgets.
     */
    createAllDataSourcesByTime(num?: number, ms?: number): Promise<void>;
    private delay;
    private areAllDataSourcesCreated;
    private getChildUseDataSourcesFromParentDss;
    private getRootUseDataSourcesFromConfig;
    /** The use data sources should be main data sources. Will create the main data sources and their data views saved in data source jsons. */
    private createDataSourcesAndTheirDataViewsByUseDataSources;
    /** Create all data views in the data source. */
    private createDataViews;
    /**
     * This method is used to create data source instance. Main data source, data view or local data source are created as data source instance.
     *
     * The parameter can be a data source id, data source config JSON or `DataSourceConstructorOptions`.
     *
     * If pass in `dataViewId`, this method will create a data view.
     * If pass in `dataViewId` and `localId`, this method will create a local data view.
     * If pass in `localId`, this method will create a local data source.
     * If pass in `createError`, this method will dispatch the data source instanceStatus as `CreateError`.
  
     * To create a main data source instance, this method do the followings:
     *   * Create the data source object.
     *   * Call the object's `ready()` method.
     *   * Call the object's `fetchSchema()` method.
     *
     * When start to create the data source instance, this method will set the data source instanceStatus as `NotCreated` at first.
     * The instanceStatus will be set as `Created` when the creation process is done. The instanceStatus will be set as `CreateError` if an error occurs.
     */
    createDataSource(mainDataSourceId: string, dataViewId?: string, localId?: string, createError?: boolean): Promise<DataSource>;
    createDataSource(dsJson: IMDataSourceJson, dataViewId?: string, localId?: string, createError?: boolean): Promise<DataSource>;
    createDataSource(options: DataSourceConstructorOptions): Promise<DataSource>;
    createDataSourceAndWaitForChildrenReady(options: DataSourceConstructorOptions): Promise<DataSource>;
    createDataView(mainDataSource: DataSource, dataViewId: string): DataSource;
    createLocalDataSource(belongToDataSource: DataSource, localId: string): DataSource;
    /**
     *
     * @param ds can be data source or data view.
     */
    private afterCreate;
    private dispatchNotCreatedStatus;
    private dispatchCreatedStatus;
    private dispatchPendedNotCreatedStatus;
    private dispatchPendedCreatedStatus;
    private getDefaultDataSourceStatus;
    getDataViewDataSourceId(mainDataSourceId: string, dataViewId: string): string;
    getLocalDataSourceId(belongToDataSourceId: string, localId: string): string;
    /**
     * Create data source according to the used data source info, and will create a local data source if localId is passed in.
     */
    createDataSourceByUseDataSource(useDs: IMUseDataSource | UseDataSource, localId?: string, batchInstanceStatusChange?: boolean): Promise<DataSource>;
    createDataSourceAndItsDataViewsByUseDataSource(useDs: IMUseDataSource | UseDataSource, batchInstanceStatusChange?: boolean): Promise<DataSource>;
    /** @ignore */
    createOriginDataSources(dataSourceJson: IMDataSourceJson): Promise<void>;
    /** @ignore */
    initSchema(dataSource: DataSource, fetchedSchema: IMDataSourceSchema): void;
    /** @ignore */
    mergeSchema(dataSource: DataSource, configSchema: IMDataSourceSchema, fetchedSchema: IMDataSourceSchema): IMDataSourceSchema;
    private mergeOneSchema;
    private getDataSourceFactory;
    private getDataSourceFactoryUri;
    private getDataSourceFactorySync;
    private createDataSourceObj;
    private createDataViewObj;
    private createLocalDataSourceObj;
    protected getAppConfig(): ImmutableObject<import("./types/app-config").AppConfig>;
    private onStoreDataSourcesChange;
    private onStoreResourceSessionsChange;
    private getErrorDataSourceId;
    restoreErrorDataSourceId(errorDsId: string): string;
    /**
     * @ignore
     * This method updates data source instance by data source json.
     * It is used in two ways,
     * 1. DataSourceManager listens store changes and uses this method to update data source instance by data source json of app config.
     * 2. Some components (e.g. DataViewSettingPopup) may use this method to update local data source instance by custom data source json.
     *
     * Now, the method is only used in builder, we do not recommend change data source json in app (runtime).
     */
    updateDataSourceByDataSourceJson(dsObj: DataSource, dsJson: IMDataSourceJson): void;
}
/**
 * @ignore
 */
export default DataSourceManager;
