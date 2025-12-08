import { React } from 'jimu-core';
import { type Direction, type DropdownContextProps } from './dropdown-context';
export type { Direction };
/**
 * The Dropdown component props.
 */
export interface DropdownProps extends Omit<DropdownContextProps, 'handleOpen' | 'handleClose' | 'referenceWidth' | 'handleMouseEnter' | 'handleMouseLeave' | 'itemRole' | 'toggle'>, Omit<React.HTMLAttributes<HTMLElement>, 'role' | 'aria-label' | 'onChange'> {
    /**
     * A callback function when the dropdown is toggled.
     */
    toggle?: (e: any) => void;
    /**
     * If `true`, the dropdown will span the full width of its parent container.
     * @default false
     */
    fluid?: boolean;
    /**
     * Tells the dropdown that it is wrapped within a `Nav` component.
     * If `true`, `\<li\>` element will be used as the container of the component.
     */
    nav?: boolean;
    /**
     * Custom html element to be used for the container.
     * @default div
     */
    tag?: React.ElementType;
    /**
     * Check mode for inside items.
     * This property only affects the role of the item when menuRole is 'menu' and has no UI changes.
     * By default, items can't be selected or checked.
     * For 'singleCheck', role=`menuitemcheckbox` will be added for each item.
     * For 'multiCheck', role=`menuitemradio` will be added for each item.
     * @default default
     */
    menuItemCheckMode?: 'default' | 'singleCheck' | 'multiCheck';
    /**
     * Handle tab event for menu item, only for accessibility.
     * Used for case: there are other focusable elements before or after menu item list.
     * @ignore
     */
    handelTabEvent?: (evt: any) => boolean;
    /**
     * Whether the interactive Nodes inside dropdown item can be accessible by keyboard, only for accessibility.
     * @default false
     */
    supportInsideNodesAccessible?: boolean;
}
/**
 * The `Dropdown` component displays a list of choices on temporary surfaces.
 * Please use this component together with DropdownButton, DropdownMenu and DropdownItem.
 *
 * ```ts
 * import { Dropdown } from 'jimu-ui'
 * ```
 */
export declare const Dropdown: React.ForwardRefExoticComponent<DropdownProps & React.RefAttributes<HTMLDivElement>>;
