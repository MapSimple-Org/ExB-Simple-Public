import { React, type IMFieldSchema, type DataSource, type ImmutableArray, type ImmutableObject, type JimuFieldType, type UseDataSource } from 'jimu-core';
import type { AdvancedSelectProps } from 'jimu-ui';
/**
 * The FieldSelector component props.
 */
export interface FieldSelectorProps {
    /**
     * Data sources only supports feature layer.
     * If your data source is initialized, please use `dataSources`, or use `useDataSources`.
     */
    useDataSources?: ImmutableArray<UseDataSource>;
    /**
     * @ignore
     */
    dataSources?: DataSource[];
    /**
     * Field type.
     * If `types` is not defined, will list all types of fields.
     */
    types?: ImmutableArray<JimuFieldType>;
    /**
     * Selected fields, use object when selected fields are from multiple data sources.
     */
    selectedFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    /**
     * Fields which should be hidden, use object when selected fields are from multiple data sources.
     */
    hiddenFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    /**
     * Fields which should be disabled, use object when selected fields are from multiple data sources.
     */
    disabledFields?: ImmutableArray<string> | ImmutableObject<{
        [dataSourceId: string]: string[];
    }>;
    /**
     * Whether or not to hide the data source dropdown, the dropdown is used to change the data source when multiple data sources are passed.
     *
     * @default false
     */
    isDataSourceDropDownHidden?: boolean;
    /**
     * Whether or not to hide the search input, the input is used to filter fields.
     *
     * @default false
     */
    isSearchInputHidden?: boolean;
    /**
     * Whether to use tools in the bottom of multi-select dropdown.
     * Please note the props works only when both of `useDropdown` and `isMultiple` are true.
     *
     * @default false
     */
    useMultiDropdownBottomTools?: boolean;
    /**
     * Whether selected fields are from repeated data source context.
     *
     * @default false
     */
    isSelectedFromRepeatedDataSourceContext?: boolean;
    /**
     * Whether or not to use dropdown to show the field list. If true, it will show dropdown, otherwise it will not use dropdown.
     *
     * @default false
     */
    useDropdown?: boolean;
    /**
     * Whether or not to use a default field as selected. If true, will call `onChange` if data source changes and no `selectedFields`.
     *
     * @default false
     */
    useDefault?: boolean;
    /**
     * Whether or not to support multiple selection.
     *
     * @default false
     */
    isMultiple?: boolean;
    /**
     * Placeholder for dropdown, if `useDropdown` is true.
     */
    placeholder?: string;
    /**
     * Dropdown props, if `useDropdown` is true.
     */
    dropdownProps?: AdvancedSelectProps;
    /**
     * Use widget id to get widget context, e.g., whether widget is in repeated data source context.
     */
    widgetId?: string;
    /**
     * Whether to use selection data view.
     *
     * @default false
     */
    useSelectionDataView?: boolean;
    /**
     * Whether to use populated data view.
     *
     * @default false
     */
    usePopulatedDataView?: boolean;
    /**
     * If there is no selected fields, will highlight or select this item.
     * If click this item, will clear all selected fields.
     */
    noSelectionItem?: {
        name: string;
    };
    /**
     * @ignore
     */
    className?: string;
    /**
     * @ignore
     */
    style?: React.CSSProperties;
    /**
     * Callback when selected fields change.
     */
    onChange?: (allSelectedFields: IMFieldSchema[], ds: DataSource, isSelectedFromRepeatedDataSourceContext: boolean) => void;
    /**
     * Whether pass `useKeyUpEvent` to the AdvanceSelect
     */
    useKeyUpEvent?: boolean;
    /**
     * aria-label used for the screen reader
     */
    'aria-label'?: string;
    /**
     * Callback fired when toggling the select menu.
     */
    toggle?: (isOpen?: boolean) => void;
}
/**
 * A component to select field from a data source.
 */
export declare class FieldSelector extends React.PureComponent<FieldSelectorProps, unknown> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
