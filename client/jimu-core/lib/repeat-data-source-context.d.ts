import * as React from 'react';
import type { DataRecord } from './data-sources';
export interface RepeatedDataSource {
    widgetId: string;
    dataSourceId: string;
    recordIndex: number;
    record: DataRecord;
}
export declare function RepeatedDataSourceProvider({ data, children }: {
    data: RepeatedDataSource | RepeatedDataSource[];
    children: React.ReactElement;
}): import("@emotion/react/jsx-runtime").JSX.Element;
export declare const RepeatedDataSourceConsumer: React.Consumer<any>;
interface WithRepeatedDataSourceComponentProps {
    repeatedDataSource: RepeatedDataSource | RepeatedDataSource[];
}
export declare function withRepeatedDataSource<T>(Component: React.ComponentType<T>): React.ComponentType<Omit<T, keyof WithRepeatedDataSourceComponentProps>>;
export {};
