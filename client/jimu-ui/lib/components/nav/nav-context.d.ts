import { React, type ThemeNavType } from 'jimu-core';
import type { TextAlignValue } from '../../types';
import type { MenuMode, MenuOpenMode } from './type';
export interface NavContextProps {
    /**
     * The style of Nav(NavLink) component.
     */
    type?: ThemeNavType;
    /**
     * Defines how the submenu is opened:
     * - `static`: Directly show the content of the submenu after its parent nav item.
     * - `dropdown`: Open the submenu in a dropdown.
     * - `foldable`: Open the submenu in a expandable panel.
     */
    menuMode?: MenuMode;
    /**
     * If it is `true`, the content (NavItems) will be positioned vertically.
     */
    vertical?: boolean;
    /**
     * When the type is `underline` and `vertical` is true, should the active underline be placed on the right side.
     */
    right?: boolean;
    /**
     * If it is `true`, the component is disabled.
     */
    disabled?: boolean;
    /**
     * Defines text alignment for the content of NavItems.
     */
    textAlign?: TextAlignValue;
    /**
     * Whether to display icon only.
     */
    iconOnly?: boolean;
    /**
     * Defines the action for opening the menu.
     */
    menuOpenMode?: MenuOpenMode;
    /**
     * If it is `true`, its submenu will be opened if any.
     */
    isOpen?: boolean;
    /**
     * Defines the opening direction of the submenu.
     */
    direction?: 'up' | 'down' | 'left' | 'right';
    /**
     * Callback fired when the submenu is toggled.
     */
    toggle?: (e: any) => void;
    /**
     * Used to accept the `caret` node provided by `NavLink` as a reference node for opening dropdown.
     */
    ref?: HTMLElement;
    /**
     * Called in `NavLink` to pass the `caret` node
     */
    setRef?: (ref: HTMLElement) => void;
}
export declare const NavContext: React.Context<NavContextProps>;
