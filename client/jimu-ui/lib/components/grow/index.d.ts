import { React } from 'jimu-core';
import { type TransitionDurationOption } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
import { type TransitionProps } from '../transition';
/**
 * The `Grow` component props.
 */
export interface GrowProps extends StandardComponentProps, Omit<TransitionProps, 'children' | 'timeout'> {
    /**
     * The children to render inside the `Grow` component.
     * It should be a single React element.
     */
    children: React.ReactElement<any>;
    /**
     * If `true`, the component will transition in.
     */
    in?: boolean;
    /**
     * The duration of the transition, in milliseconds.
     * You can set a single timeout for all transitions with a number, or set each one individually with an object.
     *
     * Set to 'auto' to automatically calculate the transition time based on height.
     * @default auto
     */
    timeout?: TransitionDurationOption | 'auto';
}
/**
 * The `Grow` component allows users to create a grow animation effect for its children.
 *
 * ```ts
 * import { Grow } from 'jimu-ui'
 * ```
 */
export declare const Grow: React.ForwardRefExoticComponent<GrowProps & React.RefAttributes<HTMLElement>>;
