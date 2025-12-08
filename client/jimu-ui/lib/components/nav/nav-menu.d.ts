import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { MenuMode } from './type';
/**
 * The `NavMenu` component props.
 */
export interface NavMenuProps extends StandardComponentProps {
    /**
     * Defines the target element that the menu should append to.
     *
     * @default body
     */
    appendToBody?: boolean;
    /**
     * Defines how the menu is opened:
     * - `static`: Directly show the content of the submenu after its parent nav item.
     * - `dropdown`: Open the submenu in a dropdown.
     * - `foldable`: Open the submenu in a expandable panel.
     *
     * @default dropdown
     */
    menuMode?: MenuMode;
    /**
     * Right align menu to its parent container.
     */
    right?: boolean;
    /**
     * `modifier` options from Popper.js.
     *
     * See [the modifiers documentation](https://github.com/FezVrasta/popper.js/blob/master/docs/_includes/popper-documentation.md#modifiers--object).
     */
    modifiers?: any;
    /**
     * if it is `true`, the menu will be flipped to right-to-left (RTL) mode.
     *
     * @default true
     */
    flip?: boolean;
    /**
     * Custom html element used as the container of the menu.
     *
     * @default ul
     */
    tag?: React.ElementType;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLElement>;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `NavMenu` component is added to the `NavItem` component to show a sub menu.
 *
 * Please use this component combining with `NavItem`, `NavLink` and `NavMenu`.
 *
 * ```ts
 * import { NavMenu } from 'jimu-ui'
 * ```
 */
export declare const NavMenu: (props: NavMenuProps) => import("@emotion/react/jsx-runtime").JSX.Element;
