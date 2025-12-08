import * as React from 'react';
import { ExportBase } from './export-base';
import type { DataRecordSet, DataRecord, DataSource } from '../data-sources';
import { DataLevel } from '../base-data-action';
export default class ExportJson extends ExportBase {
    constructor(props: any);
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean | React.ReactElement>;
    processDataRecord(record: DataRecord, fields?: string[]): any;
    exportRecords(dataSource: DataSource, records: DataRecord[], fields?: string[]): void;
    batchExport(dataSets: DataRecordSet[]): Promise<boolean>;
    doExport(dataSet: DataRecordSet, dataLevel: DataLevel): Promise<boolean>;
}
