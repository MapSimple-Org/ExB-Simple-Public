import { React } from 'jimu-core';
import { type TransitionDurationOption } from 'jimu-theme';
import type { StandardComponentProps } from '../types';
import type { TransitionProps } from '../transition';
import type { SlideTransitionDirection } from '../slide';
import type { NotificationCloseReason, NotificationPlacement, TransitionHandlerProps } from './type';
/**
 * The `Notification` component props.
 */
export interface NotificationProps extends StandardComponentProps, TransitionHandlerProps {
    /**
     * The role of the notification panel.
     * Default value: if `severity` is `error` or `warning`, it will be `alert`, otherwise it will be `status`.
     */
    role?: React.AriaRole;
    /**
     * The aria-live attribute for the notification panel.
     * Default value: if `severity` is `error` or `warning`, it will be `assertive`, otherwise it will be `polite`.
     */
    'aria-live'?: 'off' | 'polite' | 'assertive';
    /**
     * The aria-label attribute for the notification panel.
     */
    'aria-label'?: string;
    /**
     * The aria-labelledby attribute for the notification panel.
     */
    'aria-labelledby'?: string;
    /**
     * The unique id of the notification.
     * This is used to identify the notification in the notification provider.
     */
    id?: string;
    /**
      * The action to display. It renders after the message, at the end of the notification panel.
      * If a function is provided, it will be called with the notification id as an argument and should return a React node.
      */
    action?: React.ReactNode | ((id: string) => React.ReactNode);
    /**
     * The severity of the notification.
     * if severity is `default`, the notification will not display any severity icon.
     * @default default
     */
    severity?: 'default' | 'error' | 'warning' | 'info' | 'success';
    /**
     * Position of Notification.
     * On smaller screens, the component grows to occupy all the available width, the horizontal alignment is ignored.
     * @default bottom-right
     */
    placement?: NotificationPlacement;
    /**
     * Whether a close (x) button is visible on top right or not.
     * @default false
     */
    closable?: boolean;
    /**
     * The number of milliseconds to wait before automatically hiding the message.
     * This behavior is disabled by default with the null value.
     * @default 4500
     */
    autoHideDuration?: number;
    /**
     * When displaying multiple consecutive notifications using a single parent-rendered
     * `<Notification />`, add the `key` prop to ensure independent treatment of each message.
     * For instance, use `<Notification key={message} />`. Otherwise, messages might update
     * in place, and features like `autoHideDuration` could be affected.
     */
    key?: string;
    /**
     * The title of notification box.
     */
    message?: string;
    /**
     * The description of the notification box.
     */
    description?: React.ReactNode | ((id: string) => React.ReactNode);
    /**
    * Callback fired when the component requests to be closed.
    */
    onClose?: (event: React.SyntheticEvent<any> | Event | null, reason: NotificationCloseReason, id?: string) => void;
    /**
     * Whether the panel is visible.
     * @default false
     */
    open?: boolean;
    /**
     * Whether the notification is pausable when the user hovers over it.
     * @default true
     */
    pausable?: boolean;
    /**
     * If `true`, the auto-hide behavior will be paused.
     * Used to prevent the notification from auto-closing when it's collapsed.
     * Note: Only used when the notification is rendered inside a `NotificationProvider`.
     */
    forcePause?: boolean;
    /**
     * Whether to show the progress bar at the bottom of the notification for the auto-hide duration.
     * @default false
     */
    showProgress?: boolean;
    /**
     * The duration for the transition, in milliseconds.
     */
    transitionDuration?: TransitionDurationOption;
    /**
    * The component used for the transition.
    * @default Grow
    */
    TransitionComponent?: React.JSXElementConstructor<TransitionProps & {
        direction?: SlideTransitionDirection;
        children: React.ReactElement<any, any>;
    }>;
    /**
     * The direction of the transition component used if needed.
     * The default value is determined by the placement property.
     *
     */
    transitionDirection?: SlideTransitionDirection;
    /**
     * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hot spot is within the element at which the event was fired.
     */
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Disable the portal behavior. The children stay within it's parent DOM hierarchy, otherwise it will be rendered in the body or fullscreenElement.
     * @default false
     */
    disablePortal?: boolean;
    /**
     * Whether to unmount the notification when it is not visible.
     */
    unmountOnExit?: boolean;
    /**
     * The children of the notification component.
     * If provided, the notification will not render its own content and will only display the children.
     */
    children?: React.ReactElement<any, any>;
}
/**
 * The `Notification` component is used to prompt notification message globally.
 *
 * ```ts
 * import { Notification } from 'jimu-ui'
 * ```
 *
 * Note: If you want to send notifications throughout the application, consider using [useNotification](/docs/components-jimu-ui-index-notificationprovider--docs) directly.
 */
export declare const Notification: React.NamedExoticComponent<NotificationProps & React.RefAttributes<HTMLDivElement>>;
