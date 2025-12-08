import type { NotificationProps } from './notification';
export type NotificationPlacement = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NotificationAction = React.ReactNode | ((id: string) => React.ReactNode);
export type NotificationCloseReason = 
/**
 * The notification was closed by clicking the close button.
 */
'clickClose'
/**
 * The notification was closed automatically after the timeout.
 */
 | 'timeout'
/**
 * The notification was closed by pressing the Escape key.
 * Note: This is not supported in `NotificationProvider` component.
 */
 | 'escape'
/**
 * The notification was closed by the maximum notification limit.
 * Note: This is only used in `NotificationProvider` component.
 */
 | 'maxNotification'
/**
 * The notification was closed by the user calling the `closeNotification` method.
 * Note: This is only used in `NotificationProvider` component.
 */
 | 'instructed';
export interface TransitionHandlerProps {
    /**
     * Callback fired before the transition is entering.
     */
    onEnter?: (node: HTMLElement, isAppearing: boolean, key: string) => void;
    /**
     * Callback fired when the transition has entered.
     */
    onEntered?: (node: HTMLElement, isAppearing: boolean, key: string) => void;
    /**
     * Callback fired before the transition is exiting.
     */
    onExit?: (node: HTMLElement, key: string) => void;
    /**
     * Callback fired when the transition has exited.
     */
    onExited?: (node: HTMLElement, key: string) => void;
}
export interface InternalNotification extends Omit<NotificationProps, 'forcePause'> {
    /**
     * Whether the notification is entered.
     */
    entered: boolean;
    /**
     * Whether the notification is requested to be closed.
     */
    requestClose: boolean;
}
