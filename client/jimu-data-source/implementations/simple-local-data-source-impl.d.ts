import { type DataRecord, type SimpleLocalDataSource, DataSourceTypes } from 'jimu-core';
import { AbstractDataSource } from '../base-classes/abstract-data-source';
/**
 * @ignore
 */
export declare class SimpleLocalDataSourceImpl extends AbstractDataSource implements SimpleLocalDataSource {
    type: DataSourceTypes.SimpleLocal;
    updateRecords(records: DataRecord[]): Promise<boolean>;
    addRecord(record: DataRecord): Promise<DataRecord>;
    updateRecord(record: DataRecord): Promise<boolean>;
    deleteRecord(index: number): Promise<boolean>;
}
