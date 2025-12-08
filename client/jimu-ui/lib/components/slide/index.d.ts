import { React } from 'jimu-core';
import { type TransitionProps } from '../transition';
export type SlideTransitionDirection = 'down' | 'left' | 'right' | 'up';
/**
 * The `Slide` component props.
 */
export interface SlideProps extends Omit<TransitionProps, 'children'> {
    /**
     * Perform the enter transition when it first mounts if `in` is also `true`.
     * Set this to `false` to disable this behavior.
     * @default true
     */
    appear?: boolean;
    /**
     * A single child content element.
     */
    children: React.ReactElement<any, any>;
    /**
     * An HTML element, or a function that returns one.
     * It's used to set the container the Slide is transitioning from.
     */
    container?: null | Element | ((element: Element) => Element);
    /**
     * Direction the child node will enter from.
     * @default down
     */
    direction?: SlideTransitionDirection;
    /**
     * If `true`, the component will transition in.
     */
    in?: TransitionProps['in'];
}
export declare const setTranslateValue: (direction: any, node: any, containerProp: any) => void;
/**
 * The `Slide` component transitions its child element by sliding in from various directions.
 *
 * ```ts
 * import { Slide } from 'jimu-ui'
 * ```
 */
export declare const Slide: React.ForwardRefExoticComponent<SlideProps & React.RefAttributes<HTMLElement>>;
