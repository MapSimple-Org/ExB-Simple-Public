import { React } from 'jimu-core';
import { type PopperProps } from '../overlay/popper';
/**
 * The DropdownMenu component props
 *
 * Inherits properties from the `HTMLElement`.
 *
 * See [additional props available from HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement).
 */
export interface DropdownMenuProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onResize' | 'aria-modal'>, Pick<PopperProps, 'modifiers' | 'strategy' | 'offset' | 'offsetOptions' | 'shiftOptions' | 'trapFocus' | 'forceLatestFocusElements' | 'delayToggle' | 'hideOptions' | 'referenceHiddenVisibility' | 'version' | 'autoUpdate'> {
    /**
     * Whether to show arrow of popper.
     * @default false
     */
    showArrow?: boolean;
    /**
     * Whether to put dropdown menu to body by ReactDOM.createPortal
     *
     * @default true
     */
    appendToBody?: boolean;
    /**
     * Left align, right align, or center align the menu to its container.
     */
    alignment?: 'start' | 'end' | 'center';
    /**
     * Custom html element to be used as a menu's container.
     *
     * @default div
     */
    tag?: React.ElementType;
    /**
     * Custom z-index CSS property.
     * Effective only when `appendToBody` is `false`.
     */
    zIndex?: number;
    /**
     * Custom max-height CSS property.
     * The unit is pixel.
     */
    maxHeight?: number;
}
/**
 * The `DropdownMenu` component is a menu container of a `Dropdown` control. It displays a list of options on a temporary popper component.
 *
 * Please use this component together with `Dropdown`, `DropdownButton` and `DropdownItem`.
 *
 * ```ts
 * import { DropdownMenu } from 'jimu-ui'
 * ```
 */
export declare const DropdownMenu: React.ForwardRefExoticComponent<DropdownMenuProps & React.RefAttributes<HTMLDivElement>>;
