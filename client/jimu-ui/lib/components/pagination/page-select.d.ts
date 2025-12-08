import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `PageSelect` component props.
 */
export interface PageSelectProps extends StandardComponentProps {
    /**
     * Defines the size of the component.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Items of per page
     */
    pageSize?: number;
    /**
     * Max items number of per page
     */
    maxPageSize?: number;
    /**
     * Specify the page size options.
     * @default []
     */
    options?: number[];
    /**
     * If `true`, the Pagination will be disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Callback fires when the value is changed.
     */
    onChange?: (current: number, evt?: React.KeyboardEvent<HTMLInputElement>) => void;
}
/**
 * The `PageSelect` component is used to quickly jump to a page in a given list
 *
 * Please use this component combining with `Pagination`.
 *
 * ```ts
 * import { PageSelect } from 'jimu-ui'
 * ```
 */
export declare const PageSelect: (props: PageSelectProps) => import("@emotion/react/jsx-runtime").JSX.Element;
