import { DataSourceTypes, type DataSource, type DataSourceConstructorOptions, type DataSourceError } from 'jimu-core';
import { AbstractDataSource } from '../base-classes/abstract-data-source';
export interface ErrorDataSourceConstructorOptions extends DataSourceConstructorOptions {
    error: DataSourceError;
}
export declare class ErrorDataSourceImpl extends AbstractDataSource implements DataSource {
    type: DataSourceTypes.Error;
    error: DataSourceError;
}
