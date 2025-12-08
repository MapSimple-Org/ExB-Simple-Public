/** @jsx jsx */
import { React, type ImmutableArray, Immutable, type UseDataSource, type IMUseDataSource, type IntlShape, type BrowserSizeMode, ReactRedux } from 'jimu-core';
export declare enum DataViewPriority {
    /**
     * populated data view > common data view (aka user added data view) > selection data view > default data view (aka main data source)
     */
    First = "POPULATED_VIEW_SELECTION_DEFAULT",// default priority
    /**
     * common data view > default data view > selection data view > populated data view
     */
    Second = "VIEW_DEFAULT_SELECTION_POPULATED"
}
export interface MainDataAndViewSelectorProps {
    useDataSources: ImmutableArray<UseDataSource>;
    selectedUseDataSource?: IMUseDataSource;
    /**
     * Whether selected use data source is from repeated data source context.
     */
    isSelectedFromRepeatedDataSourceContext?: boolean;
    onChange: (useDataSource: IMUseDataSource, isFromRepeatedDataSourceContext: boolean) => void;
    /**
     * Use widget id to get widget context, e.g. whether widget is in repeated data source context.
     */
    widgetId?: string;
    /**
     * The priority of default selected data view if no `selectedUseDataSource`.
     */
    defaultDataViewPriority?: DataViewPriority;
    /**
     * Whether to use selection data view.
     */
    useSelectionDataView?: boolean;
    /**
     * Whether to use populated data view.
     */
    usePopulatedDataView?: boolean;
    /**
     * Whether to hide the select component which is to select main data source.
     */
    hideMainDataSourceSelect?: boolean;
    className?: string;
}
interface ExtraProps {
    intl: IntlShape;
}
interface StateToProps {
    browserSizeMode: BrowserSizeMode;
}
declare class _MainDataAndViewSelector extends React.PureComponent<MainDataAndViewSelectorProps & ExtraProps & StateToProps, unknown> {
    componentDidMount(): void;
    componentDidUpdate(prevProps: MainDataAndViewSelectorProps & ExtraProps & StateToProps): void;
    getWhetherUseDsIsShallowEqual: (u1: ImmutableArray<UseDataSource>, u2: ImmutableArray<UseDataSource>) => boolean;
    isPopulatedView: (u: IMUseDataSource) => boolean;
    isSelectionView: (u: IMUseDataSource) => boolean;
    isDefaultView: (u: IMUseDataSource) => boolean;
    isCommonView: (u: IMUseDataSource) => boolean;
    getOneDefaultUseDs: (widgetId: string, allUseDataSources: ImmutableArray<UseDataSource>, browserSizeMode: BrowserSizeMode) => IMUseDataSource;
    getSelectedUseDsFromProps: (widgetId: string, selectedUseDataSource: IMUseDataSource, allUseDataSources: ImmutableArray<UseDataSource>, isSelectedFromRepeatedDataSourceContext: boolean, browserSizeMode: BrowserSizeMode) => IMUseDataSource;
    /**
     * Whether is in repeated data source context.
     * Some widgets can provide repeated data source context, such as list widget.
     * If widgets are in such a widget, they will have a repeated data source context.
     */
    getWhetherUseRepeatedDataSourceContext: (widgetId: string, useDataSourcesWithSameMainDs: IMUseDataSource[], allUseDataSources: ImmutableArray<UseDataSource>, browserSizeMode: BrowserSizeMode) => boolean;
    /**
     * Group use data sources by main data id and add auto added data views (such as selection data view and populated data view) for each main data source.
     */
    groupUseDataSourcesByMainDsAndAddAutoViews: (widgetId: string, allUseDataSources: ImmutableArray<UseDataSource>, browserSizeMode: BrowserSizeMode) => {
        [mainDsId: string]: IMUseDataSource[];
    };
    getAutoAddedDataViews: (widgetId: string, useDataSourcesWithSameMainDs: IMUseDataSource[], allUseDataSources: ImmutableArray<UseDataSource>, browserSizeMode: BrowserSizeMode) => IMUseDataSource[];
    getDsLabel: (dataSourceId: string, dataViewId?: string) => string;
    getRealUseDataSources: (tempSelectUseDs: IMUseDataSource, allUseDataSources: ImmutableArray<UseDataSource>) => IMUseDataSource;
    onMainDataChange: (e: any) => void;
    onDataViewChange: (e: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const MainDataAndViewSelector: React.FC<import("react-intl").WithIntlProps<{
    widgetId?: string;
    useDataSources: Readonly<Immutable.ImmutableArray.Remaining<UseDataSource>> & Immutable.ImmutableArray.Additions<UseDataSource> & Immutable.ImmutableArray.Overrides<UseDataSource> & Immutable.ImmutableArray.ReadOnlyIndexer<UseDataSource>;
    className?: string;
    ref?: React.Ref<_MainDataAndViewSelector>;
    key?: React.Key | null | undefined;
    onChange: (useDataSource: IMUseDataSource, isFromRepeatedDataSourceContext: boolean) => void;
    intl: IntlShape;
    isSelectedFromRepeatedDataSourceContext?: boolean;
    useSelectionDataView?: boolean;
    usePopulatedDataView?: boolean;
    selectedUseDataSource?: Immutable.ImmutableObjectMixin<UseDataSource> & {
        readonly dataSourceId: string;
        readonly mainDataSourceId: string;
        readonly dataViewId?: string;
        readonly rootDataSourceId?: string;
        readonly fields?: Immutable.ImmutableArray<string>;
        readonly useFieldsInPopupInfo?: boolean;
        readonly useFieldsInSymbol?: boolean;
    };
    defaultDataViewPriority?: DataViewPriority;
    hideMainDataSourceSelect?: boolean;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>> & {
    WrappedComponent: React.ComponentType<{
        widgetId?: string;
        useDataSources: Readonly<Immutable.ImmutableArray.Remaining<UseDataSource>> & Immutable.ImmutableArray.Additions<UseDataSource> & Immutable.ImmutableArray.Overrides<UseDataSource> & Immutable.ImmutableArray.ReadOnlyIndexer<UseDataSource>;
        className?: string;
        ref?: React.Ref<_MainDataAndViewSelector>;
        key?: React.Key | null | undefined;
        onChange: (useDataSource: IMUseDataSource, isFromRepeatedDataSourceContext: boolean) => void;
        intl: IntlShape;
        isSelectedFromRepeatedDataSourceContext?: boolean;
        useSelectionDataView?: boolean;
        usePopulatedDataView?: boolean;
        selectedUseDataSource?: Immutable.ImmutableObjectMixin<UseDataSource> & {
            readonly dataSourceId: string;
            readonly mainDataSourceId: string;
            readonly dataViewId?: string;
            readonly rootDataSourceId?: string;
            readonly fields?: Immutable.ImmutableArray<string>;
            readonly useFieldsInPopupInfo?: boolean;
            readonly useFieldsInSymbol?: boolean;
        };
        defaultDataViewPriority?: DataViewPriority;
        hideMainDataSourceSelect?: boolean;
        context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
        store?: import("redux").Store;
    }>;
};
export {};
