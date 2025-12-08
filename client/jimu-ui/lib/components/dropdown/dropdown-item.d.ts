import { React, type LinkTarget } from 'jimu-core';
/**
 * The DropdownItem component props
 */
export interface DropdownItemProps extends React.HTMLAttributes<HTMLButtonElement> {
    /**
     * If `true`, the component will be disabled.
     */
    disabled?: boolean;
    /**
     * If `true`, the component will be displayed as a horizontal divider,
     * `div` element will be used by default and `onClick` event will be ignored in this case.
     */
    divider?: boolean;
    /**
     * Custom html element to be used as a button.
     * @default button
     */
    tag?: React.ElementType;
    /**
     * If `true`, the component will be displayed as a static header,
     * `h6` element will be used by default and `onClick` event will be ignored in this case.
     */
    header?: boolean;
    /**
     * Fire callback when the root element is clicked.
     */
    onClick?: (evt: React.MouseEvent<HTMLButtonElement>, fakedClickMode?: boolean) => void;
    /**
     * If `true`, the component expects `children` to contain only one icon, ensuring it is centered for display.
     * @default false
     * @ignore
     */
    icon?: boolean;
    /**
     * Sets value for the native `href` property of the \<a\> element.
     * If this property is set, the `tag` property will be forced to use `a`.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href).
     */
    href?: string;
    /**
     * Sets value for the native `target` property of the `<a>` element when `tag` property is `a`.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target).
     */
    target?: LinkTarget;
    /**
     * If `true`, the dropdown item will toggle the parent dropdown automatically when clicked.
     * @default true
     */
    toggle?: boolean;
    /**
     * If `true`, the dropdown item will be highlighted as active.
     */
    active?: boolean;
    /**
     * If `true` or defined, the active dropdown item in the dropdown menu will show a check icon in front of the text.
     * The icon can be customized by providing with a element.
     * Prioritize the activeIcon in the context.
     */
    activeIcon?: boolean | React.ReactElement;
    /**
     * The ref of the dropdown item.
     * @deprecated Use `ref` instead.
     */
    rootRef?: React.Ref<HTMLButtonElement>;
    /**
     * Whether to focus back to dropdown button when clicking on dropdown item.
     * @default true
     */
    a11yFocusBack?: boolean;
}
/**
 * The `DropdownItem` component is a child element in a `DropdownMenu` component.
 *
 * Please use this component together with `Dropdown`, `DropdownButton`, and `DropdownMenu`.
 *
 * ```ts
 * import { DropdownItem } from 'jimu-ui'
 * ```
 */
export declare const DropdownItem: React.ForwardRefExoticComponent<DropdownItemProps & React.RefAttributes<HTMLElement>>;
