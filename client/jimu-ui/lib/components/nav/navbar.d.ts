import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `Navbar` component props.
 */
export interface NavbarProps extends StandardComponentProps {
    /**
     * Defines the role added to the element.
     */
    role?: string;
    /**
     * Custom html element to use as this component.
     * @default nav
     */
    tag?: React.ElementType;
    /**
     * This prop is passed if the background is dark, to make the text lighter
     */
    dark?: boolean;
    /**
     * Add `.navbar-light` class
     */
    light?: boolean;
    /**
     * If `true`, the component has borders on four sides.
     */
    border?: boolean;
    /**
     * If `true`, the component has top border.
     */
    borderTop?: boolean;
    /**
     * If `true`, the component has bottom border.
     */
    borderBottom?: boolean;
    /**
     * If `true`, the component has left border.
     */
    borderLeft?: boolean;
    /**
     * If `true`, the component has right border.
     */
    borderRight?: boolean;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `Navbar` component is a navigation header container.
 *
 * Please use this component combining with `Nav`, `NavItem` and `NavLink`.
 *
 * ```ts
 * import { Navbar } from 'jimu-ui'
 * ```
 */
export declare const Navbar: (props: NavbarProps) => import("@emotion/react/jsx-runtime").JSX.Element;
