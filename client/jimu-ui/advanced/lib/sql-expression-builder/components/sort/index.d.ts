/** @jsx jsx */
import { React, type IntlShape, type OrderByOption, type IMThemeVariables, type IMUseDataSource, type ImmutableArray } from 'jimu-core';
export interface SortProps {
    /**
     * Fire callback when sort option change.
     */
    onChange: (sortData: OrderByOption[], index?: number) => void;
    /**
     * Sort list data.
     */
    value: ImmutableArray<OrderByOption>;
    /**
     * Fire callback when delete sort option.
     */
    onDelete?: (sortData: OrderByOption[], index?: number) => void;
    /**
     * Fire callback when select sort option.
     */
    onSelect?: (sortData: OrderByOption[], index?: number) => void;
    /**
     * Fire callback when the sort button is clicked.
     */
    onSortButtonClick?: (sortData: OrderByOption[], index?: number) => void;
    /**
     * Fire callback when add sort option.
     */
    onAddOption?: (sortData: OrderByOption[]) => void;
    useDataSource: IMUseDataSource;
    theme?: IMThemeVariables;
    className?: string;
}
interface ExtraProps {
    intl: IntlShape;
}
export interface SortState {
    option: OrderByOption;
}
export declare const Sort: import("@emotion/styled").StyledComponent<Omit<SortProps & ExtraProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export {};
