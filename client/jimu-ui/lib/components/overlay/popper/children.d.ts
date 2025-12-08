import { React } from 'jimu-core';
import type { MiddlewareData, Placement, Strategy } from '@floating-ui/react';
import type { StandardComponentProps } from '../../types';
import type { ArrowStyleOptions } from './core';
import { type OverlayManagerProps } from '../manager';
export declare const DefaultArrowSize = 8;
/**
 * The `PopperChildren` component props.
 */
export interface PopperChildrenProps extends StandardComponentProps, OverlayManagerProps {
    /**
     * The rounded corners of components
     * @default shape2
     */
    shape?: 'none' | 'shape1' | 'shape2';
    /**
     * Whether set overflow hidden for the popper.
     * @default false
     */
    overflowHidden?: boolean;
    /**
     * Whether the popper is visible.
     */
    open?: boolean;
    /**
     * Defines the role added to the element.
     * @default dialog
     */
    role?: React.AriaRole;
    /**
     * Indicates whether the element, or another grouping element it controls, is modal.
     */
    'aria-modal'?: boolean;
    /**
     * Describes the positioning strategy to use.
     * @default absolute
     */
    strategy?: Strategy;
    /**
     * Describes the preferred placement of the popper.
     * @default bottom
     */
    placement?: Placement;
    /**
     * The arrow element to be rendered.
     */
    arrowRef?: React.MutableRefObject<HTMLDivElement>;
    /**
     * The arrow style options.
     * @default false
     */
    arrowOptions?: ArrowStyleOptions | boolean;
    /**
     * Object containing data returned from all middleware, keyed by their name.
     */
    middlewareData?: MiddlewareData;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
    /**
     * Whether to use this component without style.
     */
    unstyled?: boolean;
    /**
    * The `tabIndex` added to the element.
    */
    tabIndex?: number;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Callback fired when the mouse is pressed on the element.
     */
    onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hotshots is within the element at which the event was fired.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Fired at an Element when a key is pressed down and that key normally produces a character value.
     */
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    /**
     * Whether to render the arrow after the content.
     * @default false
     * @internal
     * @ignore
     */
    arrowAfterContent?: boolean;
}
export declare const PopperChildren: React.ForwardRefExoticComponent<PopperChildrenProps & React.RefAttributes<HTMLDivElement>>;
