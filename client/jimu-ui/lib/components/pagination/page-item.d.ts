import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `PageItem` component props.
 */
export interface PageItemProps extends StandardComponentProps {
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole;
    /**
     * Custom html element to use as this component.
     * @default li
     */
    tag?: React.ElementType;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLLIElement>;
    /**
     * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hotspot is within the element at which the event was fired.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLLIElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLLIElement>;
}
/**
 * The `PageItem` component is the child element of a `Pagination` component.
 *
 * Please use this component combining with `Pagination` and `PageLink`.
 *
 * ```ts
 * import { PageItem } from 'jimu-ui'
 * ```
 */
export declare const PageItem: (props: PageItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
