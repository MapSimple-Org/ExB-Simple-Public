import * as React from 'react';
import { AbstractDataAction, DataLevel } from '../base-data-action';
import { type DataRecordSet } from '../data-sources';
export default class SetFilter extends AbstractDataAction {
    _version: number;
    dsId: string;
    constructor(props: any);
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string): Promise<boolean | React.ReactElement>;
    private onDsInfoChange;
}
