import { React } from 'jimu-core';
import { type TransitionDurationOption, type TransitionEasingOption } from 'jimu-theme';
import type { TransitionChildren } from 'react-transition-group/Transition';
import type { StandardComponentProps } from '../types';
export { type TransitionStatus } from 'react-transition-group/Transition';
/**
 * The `Transition` component props.
 */
export interface TransitionProps extends StandardComponentProps {
    /**
     * Show the component; triggers the enter or exit states.
     * @default false
     */
    in?: boolean;
    /**
     * By default, the child component is immediately mounted along with the parent Transition component.
     * If you want to lazily mount the component on the first `in={true}`, you can set `mountOnEnter`.
     * After the first enter transition, the component will stay mounted, even on "exited", unless you also specify `unmountOnExit`.
     * @default false
     */
    mountOnEnter?: boolean;
    /**
     * By default, the child component remains mounted after it reaches the exited state.
     * Set `unmountOnExit` if you'd prefer to unmount the component after it has finished exiting.
     * @default false
     */
    unmountOnExit?: boolean;
    /**
     * Callback fired before the "entering" status is applied.
     * An extra parameter `isAppearing` is supplied to indicate if the enter stage is
     * occurring on the initial mount.
     */
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    /**
     * Callback fired after the "entering" status is applied. An extra parameter
     * `isAppearing` is supplied to indicate if the enter stage is occurring on
     * the initial mount.
     */
    onEntering?: (node: HTMLElement, isAppearing: boolean) => void;
    /**
     * Callback fired after the "entered" status is applied. An extra parameter
     * `isAppearing` is supplied to indicate if the enter stage is occurring on
     * the initial mount.
     */
    onEntered?: (node: HTMLElement, isAppearing: boolean) => void;
    /**
     * Callback fired before the "exiting" status is applied.
     */
    onExit?: (node: HTMLElement) => void;
    /**
     * Callback fired after the "exiting" status is applied.
     */
    onExiting?: (node: HTMLElement) => void;
    /**
     * Callback fired after the "exited" status is applied.
     */
    onExited?: (node: HTMLElement) => void;
    /**
     * A function child can be used instead of a React element. This function is
     * called with the current transition status ('entering', 'entered',
     * 'exiting',  'exited', 'unmounted'), which can be used to apply context
     * specific props to a component.
     * ```jsx
     *    <Transition in={this.state.in} timeout={150}>
     *        {state => (
     *            <MyComponent className={`fade fade-${state}`} />
     *        )}
     *    </Transition>
     * ```
     */
    children?: TransitionChildren;
    /**
     * A React reference to DOM element that need to transition: https://stackoverflow.com/a/51127130/4671932
     * When `nodeRef` prop is used, node is not passed to callback functions (e.g. onEnter) because user already has direct access to the node.
     * When changing `key` prop of `Transition` in a `TransitionGroup` a new `nodeRef` need to be provided to `Transition` with changed `key`
     * prop (@see https://github.com/reactjs/react-transition-group/blob/master/test/Transition-test.js).
     */
    nodeRef?: React.Ref<HTMLDivElement>;
    /**
     * Normally, a component will not transition if it appears when the component mounts.
     * If you want to transition on the first mount, set appear to true, and the component will transition in as soon as the mounts.
     * Note: There are no specific "appear" states. appear just adds an additional enter transition.
     * @default false
     */
    appear?: boolean;
    /**
     * Enable or disable enter transitions.
     * @default true
     */
    enter?: boolean;
    /**
     * Enable or disable exit transitions.
     * @default true
     */
    exit?: boolean;
    /**
     * The transition timing function.
     * You may specify a single easing or an object containing enter and exit values.
     */
    easing?: TransitionEasingOption;
    /**
     * The duration of the transition, in milliseconds.
     * You can set a single timeout for all transitions with a number, or set each one individually with an object.
     */
    timeout?: TransitionDurationOption;
    /**
     * Add a custom transition end trigger. Called with the transitioning DOM node and a done callback.
     * Allows for more fine-grained transition end logic.
     * Note: Timeouts will still be used as a fallback if provided.
     */
    addEndListener?: (node: HTMLElement, done: () => void) => void;
}
/**
 * The Transition component lets you describe a transition from one component state to another over time with a simple declarative API. Most commonly it's used to animate the mounting and unmounting of a component, but can also be used to describe in-place transition states as well.
 *
 * ```ts
 * import { Transition } from 'jimu-ui'
 * ```
*/
export declare const Transition: (props: TransitionProps) => import("@emotion/react/jsx-runtime").JSX.Element;
