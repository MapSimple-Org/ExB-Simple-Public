import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The Scrollable component props.
 */
export interface ScrollableProps extends StandardComponentProps {
    /**
     * Scrollable horizontally or not.
     * @default false
     */
    horizontal?: boolean;
    /**
     * When `version` changes, update the topping and bottoming state.
     * @ignore
     */
    version?: number;
    /**
     * The duration of the animation when scrolling.
     * @default 300
     */
    duration?: number;
    /**
     * The children of the scrollable, which are react element that need to be scrolled.
     */
    children?: React.ReactNode;
}
export interface ScrollableRefProps {
    /**
     * Whether it can be scroll.
     */
    scrollable: boolean;
    /**
     * The method to scroll the content.
     * @param previous
     * @param duration
     */
    scroll?: (previous: boolean, duration?: number) => void;
    /**
     * Whether is the top/left of content.
     */
    topping?: boolean;
    /**
     * Whether is the bottom/right of content.
     */
    bottoming?: boolean;
    /**
     * The dom reference of this component.
     */
    ref?: React.RefObject<HTMLDivElement>;
}
/**
 * The `Scrollable` provides users with the ability to scroll through children without displaying the scroll bar.
 *
 * ```ts
 * import { Scrollable } from 'jimu-ui'
 * ```
 */
export declare const Scrollable: React.ForwardRefExoticComponent<ScrollableProps & React.RefAttributes<ScrollableRefProps>>;
