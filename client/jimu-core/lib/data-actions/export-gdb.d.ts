import * as React from 'react';
import { ExportToItemBase } from './export-item-base';
import type { DataRecordSet } from '../data-sources';
import { DataLevel } from '../base-data-action';
export default class ExportFileGDB extends ExportToItemBase {
    constructor(props: any);
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean | React.ReactElement>;
    handleConfirm(dataSets: DataRecordSet[], dataLevel: DataLevel, name: string, folderId: string, widgetId: string): Promise<string>;
}
