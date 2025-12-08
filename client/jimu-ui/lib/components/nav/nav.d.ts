import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import { TextAlignValue } from '../../types';
import type { MenuMode, MenuOpenMode } from './type';
/**
 * The Nav component props.
 */
export interface NavProps extends StandardComponentProps {
    /**
     * Indicates whether this is a part of a Navbar component.
     */
    navbar?: boolean;
    /**
     * If it is `true`, the component will show in a "tabs" style.
     */
    tabs?: boolean;
    /**
     * If it is `true`, the component will show in a "pills" style.
     */
    pills?: boolean;
    /**
     * If it is `true`, the component will show in an "underline" style.
     */
    underline?: boolean;
    /**
     * If it is `true`, the content (NavItems) will be positioned vertically.
     */
    vertical?: boolean;
    /**
     * All horizontal space will be occupied by nav links, but unlike the `fill` above, every nav item will be the same width.
     */
    justified?: boolean;
    /**
     * If `true`, the component will fill the width of its parent container.
     */
    fill?: boolean;
    /**
     * HTML element used for the component.
     *
     * @default ul
     */
    tag?: React.ElementType;
    /**
     * When the type is `underline` and `vertical` is true, should the active underline be placed on the right side.
     * @default false
     */
    right?: boolean;
    /**
     * Defines the gap between NavItems.
     */
    gap?: string;
    /**
     * Defines text alignment for the content of NavItems.
     */
    textAlign?: TextAlignValue;
    /**
     * Whether to display the icon only.
     */
    iconOnly?: boolean;
    /**
     * Defines how the submenu is opened:
     * - `static`: Directly show the content of the submenu after its parent nav item.
     * - `dropdown`: Open the submenu in a dropdown.
     * - `foldable`: Open the submenu in a expandable panel.
     *
     * @default dropdown
     */
    submenuMode?: MenuMode;
    /**
     * Defines the action for opening the menu.
     *
     * @default click
     */
    menuOpenMode?: MenuOpenMode;
    /**
     * The role attribute describes the role of an element in programs that can make use of it
     */
    role?: string;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `Nav` component is used to link to internal or external pages.
 *
 * Please use this component combining with NavItem, NavLink and NavMenu (if a sub menu is needed).
 *
 * ```ts
 * import { Nav } from 'jimu-ui'
 * ```
 */
export declare const Nav: React.ForwardRefExoticComponent<NavProps & React.RefAttributes<unknown>>;
