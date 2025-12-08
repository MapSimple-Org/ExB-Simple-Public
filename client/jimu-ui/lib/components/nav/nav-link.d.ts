import { React, type ThemeNavType } from 'jimu-core';
import { type LinkProps } from '../link/index';
import { TextAlignValue } from '../../types';
/**
 * The NavLink component props.
 */
export interface NavLinkProps extends Omit<LinkProps, 'icon' | 'type' | 'innerRef' | 'vertical' | 'unstyled' | 'customStyle'> {
    /**
     * Reference to the link element.
     * @deprecated Use `ref` instead.
     */
    innerRef?: React.Ref<HTMLButtonElement>;
    /**
     * Sets the value of the native `href` property on the \<a\> element, if this property is set, the `tag` property will be forced to use `a`.
     * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href)
     */
    href?: any;
    /**
     * Icon element to display in the content.
     */
    icon?: React.ComponentClass<React.SVGProps<SVGElement>> | string;
    /**
     * Defines the position of the icon element.
     */
    iconPosition?: 'start' | 'end' | 'above';
    /**
     * Whether to display the icon only.
     */
    iconOnly?: boolean;
    /**
     * Defines the font-size of the icon element.
     */
    iconSize?: number;
    /**
     * If it is `true`, the component will show a pointer icon at the end of its content.
     */
    caret?: boolean;
    /**
     * Indicates whether the element can be dragged
     */
    draggable?: boolean;
    /**
     * Basic style of this component.
     * @default default
     */
    type?: ThemeNavType;
    /**
     * Whether the component is in a vertical `Nav` component.
     * @default false
     */
    vertical?: boolean;
    /**
     * Whether to align the component to the right.
     * @default false
     */
    right?: boolean;
    /**
     * Whether the component is active.
     */
    active?: boolean;
    /**
     * Defines text alignment for the content of NavItems.
     */
    textAlign?: TextAlignValue;
}
/**
 * The `NavLink` component is usually used to provide navigation capability, when combining with `NavItem` component.
 *
 * Please use this component together with `Nav`, `NavLink` and `NavMenu` (if a sub menu is needed).
 *
 * ```ts
 * import { NavLink } from 'jimu-ui'
 * ```
 */
export declare const NavLink: React.ForwardRefExoticComponent<NavLinkProps & React.RefAttributes<HTMLElement>>;
