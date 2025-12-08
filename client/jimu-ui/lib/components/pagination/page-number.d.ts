import type { StandardComponentProps } from '../types';
/**
 * The `PageNumber` component props.
 */
export interface PageNumberProps extends StandardComponentProps {
    /**
     * Current page number.
     * @default 1
     */
    current: number;
    /**
     * Total page number.
     * @default 10
     */
    totalPage: number;
    /**
     * Connection symbol.
     * @default /
     */
    connector?: string;
}
/**
 * The `PageNumber` component is usually used to show the page number in the Pagination component.
 *
 * Please use this component together with `Pagination`.
 *
 * ```ts
 * import { PageNumber } from 'jimu-ui'
 * ```
 */
export declare const PageNumber: (props: PageNumberProps) => import("@emotion/react/jsx-runtime").JSX.Element;
