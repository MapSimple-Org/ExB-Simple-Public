import type { IGeometry } from '@esri/arcgis-rest-request';
import { type IntlShape, type EsriDateFormats, type DataSource, type DataRecordSet, type DataRecord } from 'jimu-core';
/**
 * Include the common implementations for data record.
 */
export declare abstract class AbstractDataRecord implements DataRecord {
    protected _dataSource: DataSource;
    abstract getData(): any;
    abstract setData(data: any): void;
    /** @ignore */
    abstract getDataBeforeMapping(): any;
    abstract toJson(): any;
    abstract getId(): string;
    abstract setId(id: string): void;
    abstract getGeometry(): IGeometry;
    abstract getRawGeometry(): any;
    abstract setGeometry(geo: IGeometry): void;
    clone(deep?: boolean): DataRecord;
    getFieldValue(jimuFieldName: string): any;
    /** @ignore */
    getDateFieldValue(jimuFieldName: string): any;
    getFormattedFieldValue(jimuFieldName: string, intl: IntlShape): string;
    /** @ignore */
    convertBeforeMappingDataToData(dataBeforeMapping: any): {};
    /** @ignore */
    convertDataToDataBeforeMapping(data: any): {};
    getFormattedData(intl: IntlShape): {};
    formatDateField(value: any, esriDateFormat: EsriDateFormats, intl: IntlShape): string;
    formatDateOnlyField(value: string, esriDateFormat: EsriDateFormats, intl: IntlShape): string;
    formatTimeOnlyField(value: string, esriDateFormat: EsriDateFormats, intl: IntlShape): string;
    formatNumberField(value: number, places: number, digitSeparator: boolean, intl: IntlShape): string;
    get dataSource(): DataSource;
    set dataSource(d: DataSource);
}
/**
 * @ignore
 */
export declare class SimpleDataRecordImpl extends AbstractDataRecord {
    private data;
    /**
     * beforeMappingData: is the data from the real data source, such as query from remote service/database.
     * data is the data used in Exb.
     *
     * The beforeMappingData uses this schema: {fieldName: value}, we'll reverse it to {jimuFieldName: value}, which is called data and will be used in exb.
     *
     */
    constructor(data: any, dataSource: DataSource, isBeforeMappingData?: boolean);
    getData(): any;
    setData(data: any): void;
    getDataBeforeMapping(): {};
    toJson(): any;
    getId(): any;
    setId(): any;
    getGeometry(): any;
    getRawGeometry(): any;
    setGeometry(geo: IGeometry): any;
}
/**
 * @ignore
 */
export declare class SimpleDataRecordSetImpl implements DataRecordSet {
    records: DataRecord[];
    fields?: string[];
    dataSource: DataSource;
    name: string;
    constructor(options: DataRecordSet);
}
