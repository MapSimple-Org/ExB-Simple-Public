import { type LoadableDataSource, type DataRecord } from 'jimu-core';
import { AbstractDataSource } from './abstract-data-source';
/** @ignore */
export declare abstract class AbstractLoadableDataSource extends AbstractDataSource implements LoadableDataSource {
    load(): Promise<DataRecord[]>;
    abstract doLoad(): Promise<DataRecord[]>;
}
