import { AbstractDataAction, DataLevel, type DataActionConstructorOptions } from '../base-data-action';
import { type DataRecordSet } from '../data-sources';
export default class DataStatistics extends AbstractDataAction {
    private _version;
    private _modules;
    private dataStatisticsPopperRef;
    isWatchingDataSetsChange: boolean;
    constructor(props: DataActionConstructorOptions);
    loadModules(): Promise<void>;
    isSupported(dataSets: DataRecordSet[], dataLevel: DataLevel): Promise<boolean>;
    onExecute(dataSets: DataRecordSet[], dataLevel: DataLevel, widgetId: string, actionConfig?: any): Promise<import("@emotion/react/jsx-runtime").JSX.Element>;
    onDataSetsChange(dataSets: DataRecordSet[], widgetId: string): void;
}
export declare const isSupportStatistics: (dataSet: DataRecordSet, dataLevel: DataLevel) => boolean;
