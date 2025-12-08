import { React, type IconResult } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { PaginationVariant, PaginationShape, PaginationButtonType } from './type';
/**
 * The `NavButtonGroup` component props.
 */
export interface NavButtonGroupProps extends StandardComponentProps {
    /**
   * The size of the component.
   * @default default
   */
    size?: 'default' | 'sm' | 'lg';
    /**
     * Display components vertically or not.
     * @default false
     */
    vertical?: boolean;
    /**
     * Be invoked when click on `previous` or `next` button.
     * @event
     */
    onChange?: (previous: boolean, evt?: React.MouseEvent<HTMLElement>) => void;
    /**
     * If `true`, disable `next` button.
     */
    disableNext?: boolean;
    /**
     * If `true`, disable `previous` button.
     */
    disablePrevious?: boolean;
    /**
     * The type of `previous` and `next` button.
     * @default default
     * @deprecated Use `variant` instead.
     */
    type?: PaginationButtonType;
    /**
     * The variant to use.
     * @default outlined
     */
    variant?: PaginationVariant;
    /**
     * If `true`, display the button as a circle.
     * @deprecated Use `shape` instead.
     */
    circle?: boolean;
    /**
     * The shape of the pagination items.
     * @default rounded
     */
    shape?: PaginationShape;
    /**
     * The icon of `previous` button.
     */
    previousIcon?: IconResult | string;
    /**
     * Defines the font-size of the previous icon element.
     * @default 12
     */
    previousIconSize?: number;
    /**
     * The icon of `next` button.
     */
    nextIcon?: IconResult | string;
    /**
     * Defines the font-size of the previous icon element.
     * @default 12
     */
    nextIconSize?: number;
    /**
     * The text of `previous` button.
     */
    previousText?: string;
    /**
     * The title of `previous` button.
     */
    previousTitle?: string;
    /**
     * The aria-label of `previous` button.
     * To provide a label for interactive components for accessibility purposes.
     */
    previousAriaLabel?: string;
    /**
     * The text of `next` button.
     */
    nextText?: string;
    /**
     * The title of `next` button.
     */
    nextTitle?: string;
    /**
     * The aria-label of `next` button.
     * To provide a label for interactive components for accessibility purposes.
     */
    nextAriaLabel?: string;
    /**
     * The style of `previous` button.
     */
    previousStyle?: any;
    /**
     * The style of `next` button.
     */
    nextStyle?: any;
    /**
     * Set a custom element for this component
     * @default ul
     */
    tag?: React.ElementType;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `NavButtonGroup` component is used to feature two arrow buttons on the left and right sides with content displayed in the center, facilitating easy navigation.
 *
 * ```ts
 * import { NavButtonGroup } from 'jimu-ui'
 * ```
 */
export declare const NavButtonGroup: (props: NavButtonGroupProps) => import("@emotion/react/jsx-runtime").JSX.Element;
