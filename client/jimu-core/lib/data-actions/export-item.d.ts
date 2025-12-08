import * as React from 'react';
import { ExportToItemBase } from './export-item-base';
import type { DataRecordSet } from '../data-sources';
import type { DataLevel } from '../base-data-action';
export default class ExportToItem extends ExportToItemBase {
    constructor(props: any);
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean | React.ReactElement>;
    getItemUrl(itemId: string): string;
    handleConfirm(dataSets: DataRecordSet[], dataLevel: DataLevel, name: string, folderId: string, widgetId: string): Promise<void>;
}
