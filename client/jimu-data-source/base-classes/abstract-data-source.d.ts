import { type DataSourceManager, type IMDataSourceJson, type IMDataSourceSchema, type IMReversedDataSourceSchema, type IMDataSourceInfo, type ImmutableArray, type IMDataViewJson, type ImmutableObject, type DataSource, type DataSourceConstructorOptions, type DataRecord, DataSourceStatus, type SelectOptions, type QueryResult, type UsedFieldsOptions, type SetDataSourceMixin } from 'jimu-core';
import type { GeometryType } from '@esri/arcgis-rest-feature-service';
/**
 * Include the common implementations for data source.
 */
export declare abstract class AbstractDataSource implements DataSource {
    id: string;
    type: string;
    dataSourceManager: DataSourceManager;
    parentDataSource: DataSource & SetDataSourceMixin;
    jimuChildId: string;
    order: number;
    dataViewId: string;
    localId: string;
    isDataView: boolean;
    belongToDataSource: DataSource;
    isLocal: boolean;
    private fetchedSchema;
    private schema;
    private reverseSchema;
    protected dataSourceJson: IMDataSourceJson;
    private readonly originDataSourceJson;
    private _url;
    /**
     * jimuName of selected fields, the fields are configured in the widgets which generate output data sources.
     */
    private selectedFields;
    /**
     * Whether listen selected records changes from other data sources which are derived from the same main data source.
     */
    private listenSelection;
    /**
     * Fields load on demand. For example, out fields in query params.
     * It may be caused by some widgets use fields but not save them to the use data source of widget config.
     */
    protected loadOnDemandFields: string[] | '*';
    protected records: DataRecord[];
    protected sourceRecords?: DataRecord[];
    constructor(options: DataSourceConstructorOptions);
    ready(): Promise<void | any>;
    isDataSourceSet(): this is DataSource & SetDataSourceMixin;
    get url(): string;
    set url(u: string);
    isInAppConfig(): boolean;
    getLabel(): string;
    getDataSourceJson(): IMDataSourceJson;
    setDataSourceJson(dsJson: IMDataSourceJson): void;
    private deepMergeDataSourceJson;
    getSchema(): IMDataSourceSchema;
    getSelectedFields(): string[];
    getAllUsedFields(options?: UsedFieldsOptions): string[] | '*';
    _printUsedFieldsDetail(options?: UsedFieldsOptions): void;
    getLoadOnDemandUsedFields(options?: UsedFieldsOptions): string[] | '*';
    getConfigUsedFields(options?: UsedFieldsOptions): string[] | '*';
    protected updateLoadOnDemandFields(usedFields: string[] | '*'): string[] | '*';
    protected mergeUsedFields(baseUsedFields: string[] | '*', newUsedFields: string[] | '*'): string[] | '*';
    protected missingSomeFields(usedFields: string[] | '*', currentFields: string[] | '*'): boolean;
    /**
     * Compare usedFields with currentFields, find out the fields which are in usedFields but are not in currentFields.
     */
    protected findMissingFields(usedFields: string[] | '*', currentFields: string[] | '*'): string[];
    findJimuFieldName(originFieldName: string): string;
    setSelectedFields(jimuNames: string[]): void;
    setSchema(schema: IMDataSourceSchema): void;
    fetchSchema(): Promise<IMDataSourceSchema>;
    getFetchedSchema(): IMDataSourceSchema;
    setFetchedSchema(fetchedSchema: IMDataSourceSchema): void;
    getGeometryType(): GeometryType;
    getReversedConfigSchema(): IMReversedDataSourceSchema;
    setRecords(records: DataRecord[]): void;
    /**
     * @param schema
     */
    private getOneReversedConfigSchema;
    getStatus(): DataSourceStatus;
    setStatus(status: DataSourceStatus): void;
    getCountStatus(): DataSourceStatus;
    setCountStatus(status: DataSourceStatus): void;
    getVersion(): number;
    addVersion(): void;
    getSourceVersion(): number;
    addSourceVersion(): void;
    getSelectedRecordIdsFromInfo(): ImmutableArray<string>;
    getSelectOptionsFromInfo(): ImmutableObject<SelectOptions>;
    updateSelectionInfo(options: SelectOptions, triggerDataSource: DataSource): void;
    buildRecord(data: any): DataRecord;
    getRecords(): DataRecord[];
    getRecordsWithSelection(): DataRecord[];
    /**
     * If the selected records have not been loaded, they will be filled to the start of the records array.
     * These selected records should match query params of current data source.
     */
    protected concatRecordsAndSelection(selectRecords: DataRecord[], records: DataRecord[]): DataRecord[];
    clearSourceRecordsNotAddVersion(): void;
    clearSourceRecords(): void;
    setSourceRecords(records: DataRecord[]): void;
    getSourceRecords(): DataRecord[];
    /**
     * Get whether a data source should use records of no_selection view as its own source records.
     *  - the data source must be selection view, no_selection view is designed as the default value of selection view.
     *  - the data source must have no source records, if it has source records, should use these source records.
     */
    useNoSelectionView(dataSource?: DataSource): boolean;
    canSaveSourceRecords(): boolean;
    getSelectionDataView(): DataSource;
    getSelectedRecords(): DataRecord[];
    getSelectedRecordIndexes(): number[];
    getSelectedRecordIds(): string[];
    nextRecord(): DataRecord;
    prevRecord(): DataRecord;
    getRecord(index: number): DataRecord;
    getSourceRecord(index: number): DataRecord;
    getRecordById(id: string): DataRecord;
    getSourceRecordById(id: string): DataRecord;
    clearSelection(): void;
    updateSelectionInfoOfDerivedDssAndChangeUrl(options: SelectOptions, triggerDataSource?: DataSource, forceCheck?: boolean): void;
    private updateSelectionInfoOfDerivedDss;
    /**
     * Change the selection in the URL. Subclasses may override this method to avoid changing the URL.
     */
    protected changeSelectionInUrl(options: SelectOptions): void;
    selectRecord(index: number): void;
    selectRecords(options: SelectOptions): Promise<Pick<QueryResult, 'records'>>;
    selectRecordById(id: string, record?: DataRecord): void;
    selectRecordsByIds(ids: string[], records?: DataRecord[]): void;
    protected copySelectionToDataView(selection: DataRecord[]): void;
    getInfo(): IMDataSourceInfo;
    clearRecords(): void;
    clearRecordsNotAddVersion(): void;
    getIdField(): string;
    getRootDataSource(): DataSource;
    getOriginDataSources(): DataSource[];
    getMainDataSource(): DataSource;
    getDataViews(): DataSource[];
    getDataView(dataViewId: string): DataSource;
    /**
     * The data source's query is a data view config as well.
     */
    getDataViewConfig(): IMDataViewJson;
    getLocalDataSources(): DataSource[];
    getLocalDataSource(localId: string): DataSource;
    getAllDerivedDataSources(): DataSource[];
    getSaveStatus(): DataSourceStatus;
    setSaveStatus(status: DataSourceStatus): void;
    setListenSelection(listen: boolean): void;
    getListenSelection(): boolean;
    isSelectionView(): boolean;
    protected isLocalViewOfSelectionView(): boolean;
    addRecord(record: DataRecord): Promise<DataRecord>;
    private doAddRecord;
    updateRecord(record: DataRecord): Promise<boolean>;
    updateRecords(records: DataRecord[]): Promise<boolean>;
    private doUpdateRecords;
    deleteRecord(index: number): Promise<boolean>;
    deleteRecordById(id: string): Promise<boolean>;
    private deleteOneRecord;
    private doDeleteOneRecord;
    private doDeleteOneRecordFromSourceRecords;
    private doAddRecordToSourceRecords;
    private doUpdateRecordsInSourceRecords;
    afterUpdateRecords(records: DataRecord[]): void;
    afterUpdateRecord(record: DataRecord): void;
    private updateOneLoadedRecord;
    afterAddRecord(record: DataRecord): void;
    afterDeleteRecordsByIds(ids: string[]): void;
    afterDeleteRecordById(id: string): void;
    protected deleteOneSelectedRecordById(id: string): boolean;
    protected deleteOneLoadedRecordById(ds: DataSource, id: string): boolean;
    destroy(): void;
}
