import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { MenuMode, MenuOpenMode } from './type';
/**
 * The NavItem component props.
 */
export interface NavItemProps extends StandardComponentProps {
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * Defines the role added to the element.
     * @default menuitem
     */
    role?: React.AriaRole;
    /**
     * If it is `true`, its submenu will be opened if any.
     */
    isOpen?: boolean;
    /**
     * Callback fired when the submenu is toggled.
     */
    onToggle?: (isOpen: boolean) => unknown;
    /**
     * Defines the opening direction of the submenu.
     * @default down
     */
    direction?: 'up' | 'down' | 'left' | 'right';
    /**
     * If it is `true`, the component is disabled.
     */
    disabled?: boolean;
    /**
     * Custom html element to use as this component.
     */
    tag?: React.ElementType;
    /**
     * Whether the component is active.
     */
    active?: boolean;
    /**
   * Defines how the submenu is opened:
   * - `static`: Directly show the content of the submenu after its parent nav item.
   * - `dropdown`: Open the submenu in a dropdown.
   * - `foldable`: Open the submenu in a expandable panel.
   *
   * @default dropdown
   */
    menuMode?: MenuMode;
    /**
     * Defines the action for opening the menu.
     *
     * @default click
     */
    menuOpenMode?: MenuOpenMode;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLLIElement>;
    /**
     * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hot spot is within the element at which the event was fired.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLLIElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLLIElement>;
}
/**
 * The `NavItem` component is the child element of a `Nav` component.
 *
 * Please use this component combining with `Nav`, `NavLink` and `NavMenu` (if a sub menu is needed).
 *
 * ```ts
 * import { NavItem } from 'jimu-ui'
 * ```
 */
export declare const NavItem: (props: NavItemProps) => import("@emotion/react/jsx-runtime").JSX.Element;
