import { React } from 'jimu-core';
/** Type for the `direction` prop of the Dropdown component. */
export type Direction = 'up' | 'down' | 'left' | 'right';
export interface DropdownContextProps {
    /**
     * To provide a label for interactive elements for accessibility purposes.
     * It will be used to both dropdown button and dropdown menu.
     * For dropdown button:
     * By default, the accessible name is computed from any text content inside the element.
     * With this prop, a sr-only DOM would be created with this label before value DOM.
     * For dropdown menu:
     * The accessible name is used for its container label.
     */
    'aria-label'?: string;
    /**
     * If `true`, the dropdown will appear as opened.
     * Utilize this property to make the dropdown as a controlled component.
     */
    isOpen?: boolean;
    /**
     * If `true`, the dropdown will be disabled.
     */
    disabled?: boolean;
    /**
     * The open mode which executes the dropdown action. Note that hover can't be used on touchscreens.
     * @default click
     */
    openMode?: 'click' | 'hover';
    /**
     * Requests to open the dropdown.
     */
    handleOpen?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Requests to close the dropdown.
     */
    handleClose?: (e: React.MouseEvent<HTMLButtonElement>, focusReference?: boolean) => void;
    /**
     * Fires when the dropdown button is hovered.
     */
    handleMouseEnter?: (e: any) => void;
    /**
     * Fires when the dropdown button and dropdown menu panel are no longer hovered.
     */
    handleMouseLeave?: (e: any) => void;
    /**
     * Whether to trigger click event in onkeyUp stage for `DropdownButton` and `DropdownItem`. Default stage is onKeyDown.
     * It is not recommended to use it with the onKeyDown event.
     * @default false
     */
    useKeyUpEvent?: boolean;
    /**
     * The role of the dropdown item.
     */
    itemRole?: string;
    /**
     * The role of dropdown menu: `listbox`, or `menu`
     * @default menu
     */
    menuRole?: 'menu' | 'listbox';
    /**
     * If `true` or defined, the active dropdown item in the dropdown menu will show a check icon in front of the text.
     * The icon can be customized by providing with a element.
     */
    activeIcon?: boolean | React.ReactElement;
    /**
     * Tells the dropdown that it is wrapped within a `DropdownMenu` component as a sub-menu item.
     * @default false
     */
    isSubMenuItem?: boolean;
    /**
     * Determines the direction and location of the dropdown menu according to its anchor (dropdown button).
     * @default down
     */
    direction?: Direction;
    /**
     * If `true`,
     * the min-width of the dropdown menu will be automatically calculated to equal the `width of the container`.
     * the max-width of the dropdown menu will be automatically calculated to equal the smaller of `100vw` and `2 * width of the container`.
     */
    autoWidth?: boolean;
    /**
     * Defines the size of the dropdown button.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * The ref of the dropdown menu.
     */
    menuRef?: React.Ref<HTMLElement>;
    /**
     * By default, clicking into a nested `DropdownMenu` will trigger the toggle method of the current `Dropdown`.
     * If you don not want to trigger the toggle method of the current `Dropdown`, you can set `avoidNestedToggle` to `true`.
     * @default false
     * @ignore
     */
    avoidNestedToggle?: boolean;
}
export declare const DropdownContext: React.Context<DropdownContextProps>;
