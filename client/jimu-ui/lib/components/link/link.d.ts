import { React, type LinkTarget, type IMUrlParameters, type LinkTo } from 'jimu-core';
import { type BrandFunctionColors } from 'jimu-theme';
import { type ButtonType } from '../button';
import type { StandardComponentProps } from '../types';
export interface LinkVars {
    root: {
        decoration?: 'none' | 'underline';
        decorationStyle?: 'solid' | 'dashed' | 'double' | 'dotted';
        hover?: {
            decoration?: 'none' | 'underline';
            decorationStyle?: 'solid' | 'dashed' | 'double' | 'dotted';
        };
    };
}
/**
 * The Link component props.
 */
export interface LinkProps extends StandardComponentProps {
    /**
     * The unique id added to the element.
     */
    id?: string | undefined;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     * If lacking, provide an aria-label.
     */
    'aria-label'?: string;
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
     * Custom html element to use as the link element.
     * `button` tag does not work when `to` property exists.
     * @default "a"
     */
    tag?: React.ElementType;
    /**
     * Sets value for the native `href` property of the `<a>` element when `tag` property is `a`.
     */
    href?: string;
    /**
     * Sets value for the native `target` property of the `<a>` element when `tag` property is `a`.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target).
     */
    target?: LinkTarget;
    /**
     * Sets button type to one of the pre-defined button types that are used for different purposes, such as `default` and `primary`.
     * @default link
     */
    type?: ButtonType | 'link';
    /**
     * The color of the component. It supports both default(if not set) and theme colors.
     */
    color?: BrandFunctionColors | 'default' | 'inherit';
    /**
     * Whether to replace current url directly.
     * @default false
     */
    replace?: boolean;
    /**
     * The link result.
     */
    to?: LinkTo;
    /**
     * URL query parameters.
     */
    queryObject?: IMUrlParameters;
    /**
     * Custom style.
     * @deprecated
     */
    customStyle?: customStyle;
    /**
     * If `true`, the hover effect is disabled.
     * @default false
     */
    disableHoverEffect?: boolean;
    /**
     * Whether to use this component without style.
     */
    unstyled?: boolean;
    /**
     * The size of the component.
     * @default default
     */
    size?: 'default' | 'sm' | 'lg';
    /**
    * If `true`, the button will be displayed as an icon button with custom styles applied to make the
    * width and height equal.
    * @default false
    */
    icon?: boolean;
    /**
     * If `true`, the component will be disabled.
     * @default false
     */
    disabled?: boolean | undefined;
    /**
     * Whether `outlined` is set as dotted line when type is `secondary`.
     * @default false
     */
    dashed?: boolean;
    /**
     * Whether to display the icon and text in the content vertically.
     * @default false
     */
    vertical?: boolean;
    /**
     * Fire callback when the component is clicked.
     */
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hotpot is within the element at which the event was fired.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLButtonElement>;
    /**
     * Fire callback when the component gains focus.
     */
    onFocus?: React.FocusEventHandler<HTMLButtonElement>;
    /**
     * Fire callback when the component loses focus.
     */
    onBlur?: React.FocusEventHandler<HTMLButtonElement>;
    /**
     * Fired at an Element when a key is pressed down and that key normally produces a character value.
     */
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode | undefined;
}
interface customStyle {
    style?: React.CSSProperties;
    hoverStyle?: React.CSSProperties;
    visitedStyle?: React.CSSProperties;
}
/**
 * The `Link` component provides an interactive reference to an external or internal resource.
 *
 * ```ts
 * import { Link } from 'jimu-ui'
 * ```
 */
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement | HTMLButtonElement>>;
export {};
