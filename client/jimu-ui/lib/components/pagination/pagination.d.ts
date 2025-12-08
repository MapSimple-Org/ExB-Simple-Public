import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { PaginationButtonType, PaginationShape, PaginationVariant, PaginationType } from './type';
/**
 * The `Pagination` component props.
 */
export interface PaginationProps extends StandardComponentProps {
    /**
     * Add custom class for list.
     */
    listClassName?: string;
    /**
     * Set a custom element for this component
     * @default nav
     */
    tag?: React.ElementType;
    /**
     * Type of the Pagination.
     * @default pagination
     */
    type?: PaginationType;
    /**
     * If `true`, the Next Button will be disabled, only takes effect when type is 'navigator'
     * @default false
     */
    isLastPage?: boolean;
    /**
     * Set a custom element for list component
     * @default ul
     */
    listTag?: React.ElementType;
    /**
     * Defines the size of the Pagination.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Total page number
     */
    totalPage: number;
    /**
     * Number of always visible pages at the beginning and end.
     * @default 1
     */
    boundaryCount?: number;
    /**
     * Number of always visible pages before and after the current page.
     * @default 1
     */
    siblingCount?: number;
    /**
     * Current page number
     */
    current?: number;
    /**
     * Default initial page number
     * @default 1
     */
    defaultCurrent?: number;
    /**
     * Items of per page
     */
    pageSize?: number;
    /**
     * Default initial page size
     */
    defaultPageSize?: number;
    /**
     * Max items number of per page
     */
    maxPageSize?: number;
    /**
     * If `true`, the Pagination will be disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Specify the sizeChanger selections
     * @default []
     */
    pageSizeOptions?: number[];
    /**
     * If `true`, will show pagination input
     * @default false
     */
    showQuickJumper?: boolean;
    /**
     * If `true`, will show page size select
     * @default false
     */
    showSizeChanger?: boolean;
    /**
     * If `true`, will show simple pager
     * @default false
     */
    simple?: boolean;
    /**
     * Type for the the previous/next Button component.
     * Note: If the `buttonType` is not specified, `variant` will be used.
     * @default default
     * @deprecated Use `variant` instead.
     */
    buttonType?: PaginationButtonType;
    /**
     * The variant to use.
     * @default outlined
     */
    variant?: PaginationVariant;
    /**
     * The shape of the pagination items.
     * @default rounded
     */
    shape?: PaginationShape;
    /**
     * If `true`, hide the previous-page button.
     * @default false
     */
    hidePrevButton?: boolean;
    /**
     * If `true`, hide the next-page button.
     * @default false
     */
    hideNextButton?: boolean;
    /**
     * If `true`, show the end-ellipsis button at the end.
     * @default false
     */
    showEndEllipsis?: boolean;
    /**
     * Callback fires when the page is changed.
     */
    onChangePage?: (current: number, event?: React.ChangeEvent<unknown>) => void;
    /**
     * Callback fires when the page size is changed.
     */
    onPageSizeChange?: (current: number, event: React.ChangeEvent<unknown>) => void;
}
/**
 * The `Pagination` component is a set of presentational components for building pagination UI.
 *
 * ```ts
 * import { Pagination } from 'jimu-ui'
 * ```
 */
export declare const Pagination: React.ForwardRefExoticComponent<PaginationProps & React.RefAttributes<HTMLElement>>;
