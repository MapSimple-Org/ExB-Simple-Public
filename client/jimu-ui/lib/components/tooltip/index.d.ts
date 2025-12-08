import { React } from 'jimu-core';
import { type PopperProps, type ArrowStyle } from '../overlay/popper';
/**
 * The Tooltip component props.
 */
export interface TooltipProps extends Pick<PopperProps, 'placement' | 'modifiers' | 'shiftOptions' | 'offsetOptions' | 'flipOptions' | 'disablePortal'>, Omit<React.HtmlHTMLAttributes<HTMLDivElement>, 'title'> {
    /**
     * If `true`, adds an arrow to the tooltip.
     * @default false
     */
    showArrow?: boolean;
    /**
     * If `true`, the popper is visible.
     * If `open` is set, it means it's a controlled component,
     * you need to listen to `onOpen` and `onClose` to modify the value of `open`.
     */
    open?: boolean;
    /**
     * Tooltip reference element (Must be able to receive ref)
     */
    children: React.ReactElement<any>;
    /**
     * By default, the `props.title` will be set as `aria-label`.
     *
     * If you want the tooltip to act as an accessible description(`aria-describedby`), you can pass `describeChild={true}` and `enterDelay={0}`.
     * And for this case, if the child element has no text content, you should add `aria-label` to it(the child element of tooltip).
     *
     * @default false
     */
    describeChild?: boolean;
    /**
     * Do not respond to focus events.
     * @default false
     */
    disableFocusListener?: boolean;
    /**
     * Do not respond to hover events.
     * @default false
     */
    disableHoverListener?: boolean;
    /**
     * Do not respond to long press touch events.
     * @default false
     */
    disableTouchListener?: boolean;
    /**
     * Whether this component is disabled
     */
    disabled?: boolean;
    /**
     * The number of milliseconds to wait before showing the tooltip.
     * This prop won't impact the enter touch delay (`enterTouchDelay`).
     * @default 100
     */
    enterDelay?: number;
    /**
     * The number of milliseconds to wait before showing the tooltip when one was already recently opened.
     * @default 0
     */
    enterNextDelay?: number;
    /**
     * The number of milliseconds a user must touch the element before showing the tooltip.
     * @default 700
     */
    enterTouchDelay?: number;
    /**
     * If `true`, the tooltip follow the cursor over the wrapped element.
     * @default false
     */
    followCursor?: boolean;
    /**
     * This prop is used to help implement the accessibility logic.
     * If you don't provide this prop. It falls back to a randomly generated id.
     */
    id?: string;
    /**
     * Makes a tooltip interactive, i.e. will not close when the user
     * hovers over the tooltip before the `leaveDelay` is expired.
     * @default false
     */
    interactive?: boolean;
    /**
     * The number of milliseconds to wait before hiding the tooltip.
     * This prop won't impact the leave touch delay (`leaveTouchDelay`).
     * @default 0
     */
    leaveDelay?: number;
    /**
     * The number of milliseconds after the user stops touching an element before hiding the tooltip.
     * @default 1500
     */
    leaveTouchDelay?: number;
    /**
     * Callback fired when the component requests to be closed.
     * @event
     *
     * @param {object} event The event source of the callback.
     */
    onClose?: (event: any) => void;
    /**
     * Callback fired when the component requests to be open.
     * @event
     *
     * @param {object} event The event source of the callback.
     */
    onOpen?: (event: any) => void;
    /**
     * Tooltip title. Zero-length titles string are never displayed.
     */
    title: React.ReactNode;
    /**
     * Define the style of the arrow.
     * @ignore
     */
    arrowStyle?: ArrowStyle;
    /**
     * If `true`, applies CSS `white-space: pre-wrap` to the tooltip content, preserving whitespace and line breaks.
     * @ignore
     */
    preWrap?: boolean;
}
export declare function testReset(): void;
/**
 * The `Tooltip` component displays informative text when a user hover over, focus on or taps an element.
 *
 * ```ts
 * import { Tooltip } from 'jimu-ui'
 * ```
 */
export declare const Tooltip: React.ForwardRefExoticComponent<TooltipProps & React.RefAttributes<unknown>>;
