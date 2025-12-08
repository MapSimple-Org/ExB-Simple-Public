import { React, type LinkTarget } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
export type ButtonSize = 'default' | 'sm' | 'lg';
export type ButtonVariant = 'contained' | 'outlined' | 'text';
/**
 * @deprecated use `Link` component instead
 */
export type ButtonTypeLink = 'link';
export type ButtonType = 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger' | ButtonTypeLink;
interface VariantVars {
    default: string;
    hover: string;
    text: string;
}
export interface ButtonVars {
    root: {
        shape?: string;
        contained?: {
            default?: Partial<VariantVars>;
            primary?: Partial<VariantVars>;
        };
    };
}
export declare const getButtonIconSizeNumber: (size: ButtonSize) => number;
/**
 * The `Button` component props.
 */
export interface ButtonProps extends React.HtmlHTMLAttributes<HTMLButtonElement> {
    /**
     * The unique id added to the element.
     */
    id?: string | undefined;
    /**
     * The name of the button, submitted as a pair with the button's value as part of the form data, when that button is used to submit the form.
     */
    name?: string;
    /**
     * Defines the value associated with the button's name when it's submitted with the form data. This value is passed to the server in params when the form is submitted using this button.
     */
    value?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * If lacking, provide an aria-label.
     */
    'aria-label'?: string;
    /**
     * If `true`, it indicates that it is activated within the button group.
     * Note: Only valid when used with `ButtonGroup` or `AdvancedButtonGroup` component.
     */
    active?: boolean;
    /**
     * If `true`, the button will appear selected.
     * Note: This only works when the color is not set or `default`.
     * @ignore
     * @default false
     */
    selected?: boolean;
    /**
     * The `tabIndex` added to the element.
     */
    tabIndex?: number | undefined;
    /**
     * Defines the role added to the element.
     */
    role?: React.AriaRole | undefined;
    /**
     * Defines the title added to the element.
     */
    title?: string | undefined;
    /**
     * The size of the component.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
     * If `true`, the buttons will take up the full width of its container.
     * @default false
     */
    block?: boolean;
    /**
     * Custom html element to be used as a button.
     *
     * @default button
     */
    tag?: React.ElementType;
    /**
     * The variant to use.
     */
    variant?: ButtonVariant;
    /**
     * Whether `outlined` is set as dotted line.
     * @default false
     */
    dashed?: boolean;
    /**
     * The color of the component. It supports both default(if not set) and theme colors.
     */
    color?: BrandFunctionColors | 'default' | 'inherit';
    /**
     * Sets button type to one of the pre-defined button types that are used for different purposes, such as `default` and `primary`.
     * Recommend using variant and color instead of type.
     * @default default
     */
    type?: ButtonType;
    /**
     * Determines if the component should be rendered as a link.
     * When `asLink` is true, the settings for `variant` and `color` will be ignored.
     * @deprecated Use `Link` component instead.
     */
    asLink?: boolean;
    /**
     * Sets value for the native `type` property of the `<button>` element when `tag` property is `button`.
     * @default button
     */
    htmlType?: 'submit' | 'reset' | 'button';
    /**
     * Sets value for the native `target` property of the `<a>` element when `tag` property is `a`.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target).
     */
    target?: LinkTarget;
    /**
     * If `true`, the button will be displayed as an icon button with custom styles applied to make the
     * width and height equal.
     * @default false
     */
    icon?: boolean;
    /**
     * Sets value for the native `href` property of the `<a>` element when `tag` property is `a`.
     */
    href?: string;
    /**
     * Fire callback when the button is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * If `true`, the hover effect is disabled.
     * @default false
     */
    disableHoverEffect?: boolean;
    /**
     * If `true`, the component will be disabled.
     * @default false
     */
    disabled?: boolean | undefined;
    /**
     * If `true`, the ripple effect is disabled.
     * @default false
     */
    disableRipple?: boolean;
    /**
     * If `true`, the touch ripple effect is disabled.
     * @default false
     */
    disableTouchRipple?: boolean;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode | undefined;
    /**
     * Whether to display the icon and text in the content vertically.
     * @default false
     */
    vertical?: boolean;
    /**
     * Whether to use this component without style.
     */
    unstyled?: boolean;
}
/**
 * The `Button` component allows users to take actions, and make choices, with a single tap.
 *
 * ```ts
 * import { Button } from 'jimu-ui'
 * ```
 */
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export {};
