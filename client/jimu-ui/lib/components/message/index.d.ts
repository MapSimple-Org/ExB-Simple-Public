import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import { type TransitionDurationOption } from 'jimu-theme';
/**
 * The `Message` component props.
 */
export interface MessageProps extends StandardComponentProps {
    /**
     * Defines the role added to the element.
     * @default alert
     */
    role?: React.AriaRole;
    /**
     * The severity of the component, which will represent different meanings, such as 'info', 'warning', 'error', and 'success'.
     * @default info
     */
    severity?: 'warning' | 'error' | 'info' | 'success';
    /**
     * The message to display.
     */
    message: string;
    /**
     * Whether the panel is visible.
     * @default false
     */
    open: boolean;
    /**
     * Callback fired when the component requests to be closed.
     */
    onClose?: (event?: React.SyntheticEvent<any> | Event | null, reason?: 'timeout' | 'escape') => void;
    /**
     * Whether to display the icon for the `severity`.
     * @default false
     */
    withIcon?: boolean;
    /**
     * The rounded corners of components
     * @default shape1
     */
    shape?: 'none' | 'shape1' | 'shape2';
    /**
     * The number of milliseconds to wait before automatically hiding the message. This behavior is disabled by default with the null value.
     * @default 3000
     */
    autoHideDuration?: number;
    /**
     * The duration for the transition, in milliseconds.
     */
    transitionDuration?: TransitionDurationOption;
    /**
     * Shadow depth, corresponds to dp in the spec.
     * @default shadow2
     */
    elevation?: 'none' | 'shadow1' | 'shadow2' | 'shadow3';
}
/**
 * The `Message` component is used to display a notification message globally.
 *
 * ```ts
 * import { Message } from 'jimu-ui'
 * ```
 */
export declare const Message: React.ForwardRefExoticComponent<MessageProps & React.RefAttributes<HTMLDivElement>>;
