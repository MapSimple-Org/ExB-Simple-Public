import { React } from 'jimu-core';
import { type SVGProps } from './svg';
import { type IconSize } from './utils';
/**
 * The `Icon` component props.
 */
export interface IconComponentProps extends Omit<SVGProps, 'src' | 'srcRTL' | 'size'> {
    /**
     * The icon resource. For example: `require('path.to.icon.svg')`
     */
    icon: any;
    /**
     * Defines the size, both width and height, of the icon.
     * If `size` is defined, `width` and `height` property will be ignored.
     * @default default
     */
    size?: IconSize | number | string;
    /**
     * Customizes the width of the icon.
     * @deprecated
     */
    width?: number | string;
    /**
     * Customizes the height of the icon.
     * @deprecated
     */
    height?: number | string;
    /**
     * Defines the `fill` color of the icon.
     * Only effective when the icon is an svg element and the `fill` property on its children are unset or set to `currentColor`.
     */
    color?: string;
    /**
     * Rotates the icon by a given degree.
     */
    rotate?: number | string;
    /**
     * Flips the icon, horizontal or vertical.
     */
    flip?: 'horizontal' | 'vertical';
    /**
     * Extra options:
     * `currentColor`: if set to `true`, the `stroke` and `fill` properties on the child elements will be replaced with `currentColor`,
     * in order to make `color` property effective.
     * @deprecated
     * @ignore
     */
    options?: {
        currentColor?: boolean;
    };
    /**
     * Flips the icon automatically, if the locale is following right-to-left (RTL).
     */
    autoFlip?: boolean;
    /**
     * The title of the icon and aria-label.
     * If displayed as a image, the `title` is used as `alt`.
     */
    title?: string;
}
/**
 * The `Icon` component is designed for svg icons display, but also supports PNG, JPG, ICO.
 *
 * SVG icons are shown as inline SVG elements in the component, while icons in other formats can be loaded using data url.
 *
 * ```ts
 * import { Icon } from 'jimu-ui'
 * ```
 */
export declare const Icon: React.NamedExoticComponent<IconComponentProps & React.RefAttributes<SVGElement>>;
