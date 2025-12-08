/** @jsx jsx */
import { React, type DataSourceJson, type ImmutableObject, type IntlShape, ReactRedux, type DataSourceInfo, type UseDataSource, type IMDataViewJson } from 'jimu-core';
import type { DataSourceListProps } from '../../types';
/**
 * The DataSourceSelector component props.
 */
export interface DataSourceSelectorProps extends Omit<DataSourceListProps, 'isDataSourceInited' | 'onCloseClick' | 'changeInitStatus' | 'disableSelection' | 'disableRemove'> {
    /**
     * Whether to support multiple selection of data views.
     *
     * Only allow to select single data source item and single data view by default.
     * To allow to select multiple data source items and multiple data views for each selected data source item, please pass in `isMultiple=true`.
     * To allow to select single data source item and multiple data views for the selected source item, please pass in `isMultipleDataView=true`.
     * To allow to select multiple data source items and single data view for each selected data source item, please pass in `isMultiple=true` and `isMultipleDataView=false`.
     *
     * @default false
     */
    isMultipleDataView?: boolean;
    /**
     * Label of the button which can trigger data source selector popup.
     *
     * @default Select data
     */
    buttonLabel?: string;
    /**
     * Whether or not to enable data source use.
     *
     * @default false
     */
    useDataSourcesEnabled?: boolean;
    /**
     * Whether or not to show toggle data button, will hide toggle data button if the value is true.
     *
     * @default false
     */
    mustUseDataSource?: boolean;
    /**
     * Whether or not to show data source list panel after clicking a selected data source.
     *
     * @default false
     */
    disableDataSourceList?: boolean;
    /**
     * Whether or not to allow to select data view,
     * the props will make data view dropdown disabled.
     *
     * @default false
     */
    disableDataView?: boolean;
    /**
     * Whether or not to hide the data view dropdown/some data views.
     * If the props is true, will make the entire data view dropdown hidden.
     * If the props is a function, will call it to decide whether or not to hide some items of the data view dropdown.
     * Please note that -
     * 1. Id of default view is `DEFAULT_DATA_VIEW_ID`, you can import it from `jimu-ui/advanced/data-source-selector`.
     * 2. Id of selection view is `CONSTANTS.SELECTION_DATA_VIEW_ID`, you can import `CONSTANTS` from `jimu-core`.
     *
     * @default false
     */
    hideDataView?: boolean | ((dataViewJson: IMDataViewJson, mainDataSourceId: string) => boolean);
    /**
     * Whether or not to hide the 'create a view' button at the bottom of data view dropdown.
     *
     * @default false
     */
    hideCreateViewButton?: boolean;
    /**
     * Whether or not to close data source list panel after selected data sources are changed.
     *
     * @default false
     */
    closeDataSourceListOnChange?: boolean;
    /**
     * Callback when toggle data button is clicked.
     */
    onToggleUseDataEnabled?: (useDataSourcesEnabled: boolean) => void;
    /**
     * Before selecting, the component will call this method to check if it can continue selecting.
     */
    disableSelection?: (useDataSources: UseDataSource[]) => boolean;
    /**
     * Before remove, the component will call this method to check if it can continue removing.
     */
    disableRemove?: (useDataSources: UseDataSource[]) => boolean;
    /**
     * @ignore
     * Only used by theme.
     */
    className?: string;
    /**
     * The label used for accessibility purpose.
     */
    'aria-label'?: string;
    /**
     * `aria-describedby` is used to indicate the IDs of the elements that describe the component.
     * It is for accessibility purposes.
     */
    'aria-describedby'?: string;
    /**
     * @ignore
     * The callback prop is called when clicking an unselectable data source item.
     * Only used by map setting.
     */
    onClickDisabledDsItem?: () => void;
    /**
     * @ignore
     * The prop is passed as 'trigger' prop of SidePopper.
     * Only used by map setting.
     */
    sidePopperTrigger?: HTMLElement | HTMLElement[];
}
/**
 * @ignore
 */
interface StateExtraProps {
    /**
     * @ignore
     */
    dataSources: ImmutableObject<{
        [dsId: string]: DataSourceJson;
    }>;
    /**
     * @ignore
     */
    dataSourcesInfo: ImmutableObject<{
        [dsId: string]: DataSourceInfo;
    }>;
}
/**
 * @ignore
 */
interface ExtraProps {
    /**
     * @ignore
     */
    intl: IntlShape;
}
/**
 * The `DataSourceSelector` component allows an Experience author to select a data source for widgets. This is usually used in a settings panel.
 *
 * ```ts
 * import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
 * ```
 */
export declare class _DataSourceSelector extends React.PureComponent<DataSourceSelectorProps & StateExtraProps & ExtraProps, unknown> {
    onToggleUseDataEnabled: () => void;
    onChange: (useDataSources: UseDataSource[]) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * A component that allows an Experience author to select a data source for widgets. This is usually used in a settings panel.
 */
export declare const DataSourceSelector: ReactRedux.ConnectedComponent<React.FC<import("react-intl").WithIntlProps<DataSourceSelectorProps & StateExtraProps & ExtraProps>> & {
    WrappedComponent: React.ComponentType<DataSourceSelectorProps & StateExtraProps & ExtraProps>;
}, {
    widgetId?: string;
    useDataSources?: Readonly<import("seamless-immutable").ImmutableArray.Remaining<UseDataSource>> & import("seamless-immutable").ImmutableArray.Additions<UseDataSource> & import("seamless-immutable").ImmutableArray.Overrides<UseDataSource> & import("seamless-immutable").ImmutableArray.ReadOnlyIndexer<UseDataSource>;
    useDataSourcesEnabled?: boolean;
    className?: string;
    'aria-describedby'?: string;
    'aria-label'?: string;
    onChange?: (useDataSources: UseDataSource[]) => void;
    disableSelection?: (useDataSources: UseDataSource[]) => boolean;
    forwardedRef?: React.Ref<any>;
    isMultiple?: boolean;
    hideHeader?: boolean;
    fromRootDsIds?: Readonly<import("seamless-immutable").ImmutableArray.Remaining<string>> & import("seamless-immutable").ImmutableArray.Additions<string> & import("seamless-immutable").ImmutableArray.Overrides<string> & import("seamless-immutable").ImmutableArray.ReadOnlyIndexer<string>;
    buttonLabel?: string;
    types: Readonly<import("seamless-immutable").ImmutableArray.Remaining<import("jimu-core").DataSourceTypes>> & import("seamless-immutable").ImmutableArray.Additions<import("jimu-core").DataSourceTypes> & import("seamless-immutable").ImmutableArray.Overrides<import("jimu-core").DataSourceTypes> & import("seamless-immutable").ImmutableArray.ReadOnlyIndexer<import("jimu-core").DataSourceTypes>;
    disableRemove?: (useDataSources: UseDataSource[]) => boolean;
    isBatched?: boolean;
    onClickDisabledDsItem?: () => void;
    hideTypeDropdown?: boolean;
    hideAllOptionOfTypeDropdown?: boolean;
    fromDsIds?: Readonly<import("seamless-immutable").ImmutableArray.Remaining<string>> & import("seamless-immutable").ImmutableArray.Additions<string> & import("seamless-immutable").ImmutableArray.Overrides<string> & import("seamless-immutable").ImmutableArray.ReadOnlyIndexer<string>;
    enableToSelectOutputDsFromSelf?: boolean;
    showQueriableDataSourceWithoutFields?: boolean;
    hideDs?: (dsJson: import("jimu-core").IMDataSourceJson) => boolean;
    hideAddDataButton?: boolean;
    disableAddData?: boolean;
    hideTabs?: Readonly<import("seamless-immutable").ImmutableArray.Remaining<"ADDED" | "OUTPUT">> & import("seamless-immutable").ImmutableArray.Additions<"ADDED" | "OUTPUT"> & import("seamless-immutable").ImmutableArray.Overrides<"ADDED" | "OUTPUT"> & import("seamless-immutable").ImmutableArray.ReadOnlyIndexer<"ADDED" | "OUTPUT">;
    onNewDataAdded?: (useDataSources: UseDataSource[]) => void;
    isMultipleDataView?: boolean;
    disableDataSourceList?: boolean;
    disableDataView?: boolean;
    hideCreateViewButton?: boolean;
    hideDataView?: boolean | ((dataViewJson: IMDataViewJson, mainDataSourceId: string) => boolean);
    closeDataSourceListOnChange?: boolean;
    sidePopperTrigger?: HTMLElement | HTMLElement[];
    mustUseDataSource?: boolean;
    onToggleUseDataEnabled?: (useDataSourcesEnabled: boolean) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export {};
