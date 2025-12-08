import { React } from 'jimu-core';
import type { Props as InlineSVGProps } from 'react-inlinesvg';
import type { StandardComponentProps } from '../types';
import { type IconSize } from './utils';
/**
 * The `SVG` component props.
 */
export interface SVGProps extends StandardComponentProps, Omit<InlineSVGProps, 'innerRef' | 'style'> {
    /**
     * To provide a role for this component.
     * It is for accessibility purposes.
     */
    role?: React.AriaRole;
    /**
     * To provide a label for interactive components for accessibility purposes.
     */
    'aria-label'?: string;
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @default false
     */
    'aria-hidden'?: boolean | 'true' | 'false';
    /**
     * The title of the component.
     */
    title?: string;
    /**
     * The SVG file you want to load. It can be a require, URL or a string (base64 or url encoded).
     */
    src: string;
    /**
     * Whether it is in the RTL.
     * Note: The default value is read from `getAppStore().getState().appContext?.isRTL` and is provided for use in testing and storybook environments.
     * @ignore
     */
    isRTL?: boolean;
    /**
     * The src used for RTL. If provided, it will be displayed instead of src for RTL languages.
     * It will be determined as RTL from `getAppStore().getState().appContext?.isRTL`.
     */
    srcRTL?: string;
    /**
     * Defines the size, both width and height, of the icon.
     * @default m
     */
    size?: IconSize | number | string;
    /**
     * Flips the SVG automatically for RTL.
     * @default false
     */
    autoFlip?: boolean;
    /**
     * If set to `true`, the `stroke` and `fill` properties on the child elements will be replaced with `currentColor`, in order to make `color` property effective.
     * @default true
     */
    currentColor?: boolean;
    /**
     * A component to be shown while the SVG is loading.
     */
    loader?: React.ReactNode;
    /**
     * The fallback content in case of a fetch error or unsupported browser.
     */
    children?: React.ReactNode;
}
export type SVGComponentProps = Omit<SVGProps, 'src' | 'srcRTL'>;
/**
 * The `SVG` component is designed for displaying SVG icons. Unlike the `Icon` component, it does not support formats other than SVG.
 *
 * ```ts
 * import { SVG } from 'jimu-ui'
 * ```
 */
export declare const SVG: React.NamedExoticComponent<SVGProps & React.RefAttributes<SVGElement>>;
