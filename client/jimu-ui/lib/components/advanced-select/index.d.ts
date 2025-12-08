/** @jsx jsx */
import { React, type DataSource, type IMFieldSchema, type IntlShape, type CodedValue, DataSourceManager, type SqlExpression, type SqlQuerySortOrder } from 'jimu-core';
import { type DropdownButtonProps, type DropdownMenuProps, type DropdownProps, type DropdownItemProps } from '../dropdown';
import type { SelectProps } from '../select';
export interface AdvancedSelectItem extends Pick<DropdownItemProps, 'header'> {
    /**
     * Identity value of the item
     */
    value: string | number;
    /**
     * Label assigned for the item
     */
    label: string;
    /**
     * Whether the item is disabled
     * @default false
     */
    disabled?: boolean;
    /**
     * Customize the content using the callback function
     */
    render?: (item: CodedValue) => any;
}
/**
 * The AdvancedSelect component props.
 */
export interface AdvancedSelectProps extends Pick<DropdownButtonProps, 'className' | 'style' | 'title' | 'icon' | 'arrow' | 'color' | 'size' | 'variant' | 'disabled'>, Pick<DropdownMenuProps, 'hideOptions' | 'zIndex' | 'strategy' | 'appendToBody' | 'autoUpdate' | 'alignment'>, Pick<SelectProps, 'aria-label' | 'a11y-description' | 'aria-describedby'>, Pick<DropdownProps, 'autoWidth' | 'useKeyUpEvent'> {
    /**
     * Selected values.
     */
    selectedValues?: AdvancedSelectItem[];
    /**
     * sqlExpression from outside which limits current query from all available values.
     * Two cases:
     * 1.cascade effect by other askForValue clauses at runtime.
     * 2.excluded values by the previous predefined values in builder.
     */
    sqlExpression?: SqlExpression;
    /**
     * Whether to hide search input.
     * @default false
     */
    hideSearchInput?: boolean;
    /**
     * Whether to hide check-all checkbox.
     * Valid only for staticValues or codedValues data in multiple mode, without searchInput and bottomTools.
     * @default true
     * @ignore
     */
    hideCheckAll?: boolean;
    /**
     * There are two types of values for select options:
     *  1. Static values from `staticValues`,
     *  2. Dynamic values from `dataSource` and `field`, and `useCodedValues` is used to distinguish whether to show codedValues.
     *
     * For Static values:
     * Do need to query from service if it's supported.
     * The contents of each option can be customized by rendering method.
     */
    staticValues?: AdvancedSelectItem[];
    /**
     * Whether to show the list.
     * @default true
     */
    sortList?: boolean;
    /**
     * The sort type for the list, by label or value, including static values and dynamic values.
     * @default `LABEL`
     */
    sortType?: 'VALUE' | 'LABEL';
    /**
     * Whether to sort staticValues by label.
     * Please use sortList=false if no need to sort it.
     * @default true
     * @deprecated
    */
    sortValuesByLabel?: boolean;
    /**
     * The sort order for results.
     * @default 'ASC'
     */
    sortOrder?: SqlQuerySortOrder;
    /**
     * For dynamic values
     * Need to query from service.
     */
    field?: IMFieldSchema;
    /**
     * Selected data source which supports filter.
     */
    dataSource?: DataSource;
    /**
     * Whether to show codedValues by layer setting.
     * @default true
     */
    useCodedValues?: boolean;
    /**
     * whether to support multiple select.
     * @default false
     */
    isMultiple?: boolean;
    /**
     * Whether to hide tools in the bottom.
     * Only valid for multiple select.
     * @default false
     */
    hideBottomTools?: boolean;
    /**
     * Whether to hide empty option.
     * @default false
     */
    isEmptyOptionHidden?: boolean;
    /**
     * Custom tag for empty option.
     * @default `allTag` from nls.
     * @ignore
     */
    allTag?: string;
    /**
     * Callback fired when the item is checked or unchecked.
     */
    onChange?: (valueObj: AdvancedSelectItem[]) => void;
    /**
     * Rerender and close menu when version is changed.
     * @ignore
     */
    version?: number;
    /**
     * Whether the select menu is open.
     */
    isOpen?: boolean;
    /**
     * Callback fired when toggling the select menu.
     */
    toggle?: (isOpen?: boolean) => void;
    /**
     * Indicates the placeholder text.
     */
    placeholder?: string;
    /**
     * Customize the dropdown button using the callback function
     */
    customDropdownButtonContent?: (selectedItems?: AdvancedSelectItem[]) => any;
    /**
     * Tells that the component is wrapped within a `DropdownMenu` component as a sub-menu item.
     * @defalut false
     * @ignore
     */
    isSubMenuItem?: boolean;
    /**
     * Whether to show the list without dropdown menu.
     * @default false.
     */
    isExpandedList?: boolean;
}
interface IntlProps {
    intl: IntlShape;
}
interface DataSourceProps {
    dataSourceInfo: any;
    dataSourceBelongInfo: any;
}
interface AdvancedSelectState {
    loaded: boolean;
    isSelectedListShown: boolean;
    isOpen: boolean;
    autoFocus: boolean;
    pageSize: number;
    currentList: any[];
    /**
     * count is from ds.loadCount()
     * recordCount is from ds.load()
     * All features are loaded when count = recordCount.
     * Only works for distinct=true case because the dropdown is empty when distinct is false.
     */
    count: number;
    recordCount: number;
    page: number;
    list: any[];
    searchCount: number;
    searchRecordCount: number;
    searchPage: number;
    /**
     * static values, or codedValues.
     */
    staticValues: CodedValue[];
    showCheckAll: boolean;
    checkAllChecked: boolean;
    checkAllIndeterminate: boolean;
}
export declare class _AdvancedSelectInner extends React.PureComponent<AdvancedSelectProps & IntlProps & DataSourceProps, AdvancedSelectState> {
    _isMounted: boolean;
    dsManager: DataSourceManager;
    dataSource: DataSource;
    dataSourceForSearch: DataSource;
    selectRef: React.RefObject<HTMLDivElement>;
    dropdownBtnRef: React.RefObject<HTMLButtonElement>;
    searchRef: any;
    showAllRef: any;
    checkAllRef: any;
    noDataRef: any;
    firstMenuItem: any;
    modifiers: any;
    /**
     * Only for numeric field.
     */
    numericFieldLength: number;
    /**
     * Only for string field.
     */
    isHosted: boolean;
    listRef: HTMLDivElement;
    localDsRandomId: string;
    previousRecordLength: number;
    needToQuery: boolean;
    previousRecordLengthForSearch: number;
    needToQueryForSearch: boolean;
    isRTL: boolean;
    sanitizer: any;
    sanitizer2: any;
    context: any;
    static contextType: React.Context<import("../query-scope-context").QueryScopeContextProps>;
    static count: number;
    static a11yCount: number;
    constructor(props: any);
    componentDidMount(): void;
    isDsInfoChanged: (prevProps: any) => boolean;
    componentDidUpdate(prevProps: AdvancedSelectProps & DataSourceProps, prevStates: AdvancedSelectState): void;
    componentWillUnmount(): void;
    i18nMessage: (id: string, values?: any) => string;
    showCheckAll: (staticValues: any) => boolean;
    getCheckAllStates: (currentList: any, selectedValues: any) => {
        checkAllChecked: boolean;
        checkAllIndeterminate: boolean;
    };
    getPageSize: (includedRealStaticValues: any) => any;
    createDataSources: () => void;
    destroyDataSources: () => void;
    isStaticValuesChanged: (staticValues: any[], prevStaticValues: any[]) => boolean;
    /**
     * get real static values from staticValues, or codedValues from layer.
     */
    getRealStaticValues: () => CodedValue[];
    showOutputWarningInBuilder: () => boolean;
    showOutputWarning: () => boolean;
    updateList: (page: number, queryCount?: boolean, autoTriggeredByFirstPage?: boolean) => Promise<void>;
    onTogglePopper: (evt: any) => void;
    isItemChecked: (value: any) => boolean;
    onItemClick: (item: AdvancedSelectItem, willActive: boolean) => void;
    onScroll: (e: any) => void;
    loadNextPageData: (autoTriggeredByFirstPage?: boolean) => void;
    updateListWithSearchKey: (queryCount?: boolean) => Promise<void>;
    updateSearchList: (sqlExpression: SqlExpression, page?: number) => Promise<void>;
    getMergedSqlExpressionWithSearchKey: () => SqlExpression;
    /**
     * Fired when search text is changed.
     * @param evt
     */
    onTextChange: (evt: any) => void;
    checkAllChange: (evt: any) => void;
    isDataEmpty: () => boolean;
    getAllTag: () => string;
    getSelectLabel: () => string;
    getSelectedValuesWithHeaders: () => AdvancedSelectItem[];
    showSelectedList: (isShown: boolean) => void;
    unCheckAll: () => void;
    getDropdownMenuStyle: () => import("jimu-core").SerializedStyles;
    handelTabEventForDropdown: (e: any) => boolean;
    handleTabEventForExpandedList: (e: any) => void;
    showAllKeyDown: (e: any) => void;
    getFirstFocusableNode: () => any;
    toggleFromFirstNode: (e: any) => void;
    toggleByCustomTabEvent: (e: any) => void;
    noInteractiveNodesInside: () => boolean;
    getFormattedLabel: (label: string) => string;
    getLabelWithoutHTML: (label: any) => any;
    getListContent: (isFromDropdownMenu: boolean, list: any, isNoData: boolean, selectedLabel?: string) => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
/**
 * The `AdvancedSelect` component is used to provide the ability to choose an option from a list.
 *
 * Please use this component in case of the following needs:
 *
 * - Search function.
 * - Selection tools for multiple option.
 * - Display dynamic attribute from a field of dataSource with pagination.
 *
 * ```ts
 * import { AdvancedSelect } from 'jimu-ui'
 * ```
 */
export declare const AdvancedSelect: React.FC<import("react-intl").WithIntlProps<AdvancedSelectProps & IntlProps>> & {
    WrappedComponent: React.ComponentType<AdvancedSelectProps & IntlProps>;
};
export {};
