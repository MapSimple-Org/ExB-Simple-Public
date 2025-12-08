/** @jsx jsx */
import { React, type FieldSchema, type IMFieldSchema, type DataSource, type ImmutableArray, type ImmutableObject, Immutable, type IMUseDataSource, type IntlShape, type JimuFieldType, type IMThemeVariables, type UseDataSource } from 'jimu-core';
import { type AdvancedSelectProps } from 'jimu-ui';
interface State {
    selectedDs: DataSource;
    isFromRepeatedDs: boolean;
    searchValue: string;
}
interface FieldSelectorInnerProps {
    dataSources: DataSource[];
    types?: ImmutableArray<JimuFieldType>;
    selectedFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    hiddenFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    disabledFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    isDataSourceDropDownHidden?: boolean;
    isSearchInputHidden?: boolean;
    useMultiDropdownBottomTools?: boolean;
    isSelectedFromRepeatedDataSourceContext?: boolean;
    useDropdown?: boolean;
    useDefault?: boolean;
    isMultiple?: boolean;
    placeholder?: string;
    dropdownProps?: AdvancedSelectProps;
    widgetId?: string;
    useSelectionDataView?: boolean;
    usePopulatedDataView?: boolean;
    noSelectionItem?: {
        name: string;
    };
    className?: string;
    style?: React.CSSProperties;
    onChange?: (allSelectedFields: IMFieldSchema[], ds: DataSource, isSelectedFromRepeatedDataSourceContext: boolean) => void;
    useKeyUpEvent?: boolean;
    /**
     * Callback fired when toggling the select menu.
     */
    toggle?: (isOpen?: boolean) => void;
}
interface ExtraProps {
    intl: IntlShape;
    theme: IMThemeVariables;
}
/**
 * The `FieldSelector` component allows users to select fields from a data source.
 *
 * ```ts
 * import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
 * ```
 */
export declare class _FieldSelectorInner extends React.PureComponent<FieldSelectorInnerProps & ExtraProps, State> {
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: FieldSelectorInnerProps, prevState: State): void;
    getWhetherArrayIsShallowEqual: (arr1: any[], arr2: any[]) => boolean;
    getDefaultSelectedDs: (dataSources: DataSource[], selectedFields: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>) => DataSource;
    hasSelectedFields: () => boolean;
    /**
     * If have selected fields,
     */
    getDsFromSelectedFieldsAndUseDss: (dataSources: DataSource[], selectedFields: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>) => DataSource;
    getAreFromMultipleDss: (dataSources: DataSource[], selectedFields: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>) => boolean;
    getDsLabel: (ds: ImmutableObject<DataSource> | DataSource) => string;
    getFieldsJimuNameFromMultiDssFields: (selectedDs: DataSource, dataSources: DataSource[], multiDssFields: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>, isMultiple: boolean) => ImmutableArray<string>;
    getSelectedUseDataSource: () => IMUseDataSource;
    getWhetherJimuNameIsInHiddenFields: (jimuName: string) => boolean;
    /**
     * Get fields which are -
     * 1. match types in props
     * 2. not in hidden fields in props
     * 3. match search values
     */
    getValidFields: (ds: DataSource) => ImmutableObject<{
        [jimuName: string]: FieldSchema;
    }>;
    getAllFields(ds: DataSource): ImmutableObject<{
        [jimuName: string]: FieldSchema;
    }>;
    getNoSelectionItem: () => Immutable.ImmutableObject<{
        jimuName: string;
        name: string;
    }>;
    getUseDataSources: (dataSources: DataSource[]) => ImmutableArray<UseDataSource>;
    onSelectedUseDsChange: (useDataSource: IMUseDataSource, isSelectedFromRepeatedDataSourceContext: boolean) => void;
    onSearchChange: (e: any) => void;
    onSelectedFieldsChange: (clickedFields: IMFieldSchema[]) => void;
    toggleDropdown: (isOpen: boolean) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const FieldSelectorInner: import("@emotion/styled").StyledComponent<Pick<Omit<FieldSelectorInnerProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "forwardedRef" | keyof FieldSelectorInnerProps> & {
    theme?: IMThemeVariables;
}, {}, {}>;
export {};
