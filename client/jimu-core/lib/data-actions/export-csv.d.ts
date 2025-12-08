import * as React from 'react';
import { ExportBase } from './export-base';
import type { DataSource, DataRecordSet, DataRecord } from '../data-sources';
import { DataLevel } from '../base-data-action';
export default class ExportCSV extends ExportBase {
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean | React.ReactElement>;
    exportRecords(dataSource: DataSource, records: DataRecord[], fields?: string[]): void;
    batchExport(dataSets: DataRecordSet[]): Promise<boolean>;
    doExport(dataSet: DataRecordSet, dataLevel: DataLevel): Promise<boolean>;
}
