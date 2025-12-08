import * as React from 'react';
import type { IMDataSourceInfo } from './types/state';
import { type DataSource } from './data-sources';
import type { UseDataSource } from './types/app-config';
import type { ImmutableArray } from 'seamless-immutable';
type DataRenderFunction = (dss: {
    [dataSourceId: string]: DataSource;
}, infos: {
    [dataSourceId: string]: IMDataSourceInfo;
}) => React.ReactNode;
export interface MultipleDataSourceComponentProps {
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * Need to pass widgetId/localId if use data source component to do query.
     *
     * For global ds/view, please use widgetId.
     * For local ds/view, please use localId. The recommended localId is: widgetId + ???
     */
    widgetId?: string;
    localId?: string;
    queries?: {
        [dataSourceId: string]: any;
    };
    children?: DataRenderFunction | React.ReactNode;
    onDataSourceInfoChange?: (infos: {
        [dataSourceId: string]: IMDataSourceInfo;
    }) => void;
    onDataSourceCreated?: (dss: {
        [dataSourceId: string]: DataSource;
    }) => void;
}
interface ExtraProps {
    [dsId: string]: IMDataSourceInfo;
}
type AllProps = MultipleDataSourceComponentProps & ExtraProps;
export declare class MultipleDataSourceComponentInner extends React.PureComponent<AllProps, unknown> {
    handleDataSourceCreated: () => void;
    handleDataSourceInfoChange: () => void;
    getDataSources: () => {};
    getDataSourcesInfo: () => {};
    MemoDataSourceComponents: React.MemoExoticComponent<({ useDataSources, queries, widgetId, localId }: {
        useDataSources: ImmutableArray<UseDataSource>;
        queries: {
            [dataSourceId: string]: any;
        };
        widgetId: string;
        localId: string;
    }) => import("@emotion/react/jsx-runtime").JSX.Element>;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
declare const _default: import("react-redux").ConnectedComponent<any, {
    useDataSources?: ImmutableArray<UseDataSource>;
    widgetId?: string;
    localId?: string;
    queries?: {
        [dataSourceId: string]: any;
    };
    children?: DataRenderFunction | React.ReactNode;
    onDataSourceInfoChange?: (infos: {
        [dataSourceId: string]: IMDataSourceInfo;
    }) => void;
    onDataSourceCreated?: (dss: {
        [dataSourceId: string]: DataSource;
    }) => void;
    context?: React.Context<import("react-redux").ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export default _default;
