import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import { type TransitionProps } from '../transition';
/**
 * The `Fade` component props.
 */
export interface FadeProps extends StandardComponentProps, Omit<TransitionProps, 'children'> {
    /**
     * A single child content element.
     */
    children: React.ReactElement<any>;
    /**
     * If `true`, the component will transition in.
     */
    in?: boolean;
}
/**
 * The `Fade` component allows users to add fade-in and fade-out transitions to any element.
 *
 * ```ts
 * import { Fade } from 'jimu-ui'
 * ```
 */
export declare const Fade: React.ForwardRefExoticComponent<FadeProps & React.RefAttributes<HTMLElement>>;
