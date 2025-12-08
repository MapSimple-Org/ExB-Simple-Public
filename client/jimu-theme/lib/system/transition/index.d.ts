import type { IMThemeVariables } from 'jimu-core';
export interface Easing {
    /**
     * Standard easing subtly brings attention to the end of an animation by taking more time to decelerate than accelerate.
     * Standard easing is the most common form of easing.
     */
    standard: string;
    /**
     * Incoming elements are animated using decelerated easing, in which transitions begin at peak velocity (the fastest point in an element's movement) and end at rest.
     */
    decelerate: string;
    /**
     * Elements exiting a screen use accelerated easing, a transition in which the element starts at rest and ends at peak velocity.
     */
    accelerate: string;
    /**
     * The sharp curve is used by objects that may return to the screen at any time.
     */
    sharp: string;
}
export interface Duration {
    /**
     * Shortest duration for small utility-focused transitions, such as radio.
     */
    shortest: number;
    /**
     * Shorter duration for small utility-focused transitions, such as checkbox.
     */
    shorter: number;
    /**
     * Short duration for small utility-focused transitions, such as background or color changes.
     */
    short: number;
    /**
     * These are used for most basic recommended timing
     */
    standard: number;
    /**
     * This is to be used in complex animations
     */
    complex: number;
    /**
     * It's recommended when something is entering screen
     */
    enteringScreen: number;
    /**
     * It's recommended when something is leaving screen
     */
    leavingScreen: number;
}
export declare const defaultEasing: Easing;
export declare const defaultDuration: Duration;
declare const getAutoHeightDuration: (height?: number) => number;
type TransitionStatusMode = 'appear' | 'enter' | 'exit';
type TransitionEasingOptionWithMode = {
    [mode in TransitionStatusMode]?: string | keyof Easing;
};
type TransitionEasingWithMode = {
    [mode in TransitionStatusMode]?: string;
};
export type TransitionEasingOption = keyof Easing | TransitionEasingOptionWithMode;
export declare const getTransitionEasing: (input: TransitionEasingOption, theme: IMThemeVariables) => string | TransitionEasingWithMode;
type TransitionDurationOptionWithMode = {
    [mode in TransitionStatusMode]?: keyof Duration | number;
};
type TransitionDurationWithMode = {
    [mode in TransitionStatusMode]?: number;
};
export type TransitionDurationOption = keyof Duration | number | TransitionDurationOptionWithMode;
export declare const getTransitionDuration: <T = number>(input: TransitionDurationOption, theme: IMThemeVariables) => number | TransitionDurationWithMode | T;
interface TransitionCreateOptions {
    duration: number | string;
    easing: string;
    delay: number | string;
}
declare const createTransition: (props?: string | string[], options?: Partial<TransitionCreateOptions>) => string;
export interface TransitionsOptions {
    easing?: Partial<Easing>;
    duration?: Partial<Duration>;
    create?: (props: string | string[], options?: Partial<TransitionCreateOptions>) => string;
    getAutoHeightDuration?: (height: number) => number;
}
/**
 * The transition functions and variables.
 */
export interface Transitions {
    /**
     * The easing variables for the transitions.
     */
    easing: Easing;
    /**
     * The duration variables for the transitions.
     */
    duration: Duration;
    /**
     * The function to create transitions.
     */
    create: typeof createTransition;
    /**
     * The function to get the auto height duration.
     */
    getAutoHeightDuration: typeof getAutoHeightDuration;
}
declare const createTransitions: (options?: TransitionsOptions) => Transitions;
export default createTransitions;
