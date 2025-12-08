import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
import type { InternalNotification, NotificationCloseReason, TransitionHandlerProps } from './type';
/**
 * The `NotificationItem` component props.
 *
 */
interface NotificationItemProps extends TransitionHandlerProps, StandardComponentProps {
    /**
     * The notification to display.
     * This should be an object that contains the notification's properties.
     */
    notification: InternalNotification;
    /**
     * If `true`, the auto-hide behavior will be paused.
     * Used to prevent the notification from auto-closing when it's collapsed.
     */
    forcePause?: boolean;
    /**
    * Callback fired when the component requests to be closed.
    */
    onClose?: (event: React.SyntheticEvent<any> | Event | null, reason: NotificationCloseReason, id?: string) => void;
    /**
   * Fired at an Element when a pointing device (usually a mouse) is initially moved so that its hot spot is within the element at which the event was fired.
   */
    onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
    /**
     * Fired at an Element when the cursor of a pointing device (usually a mouse) is moved out of it.
     */
    onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
}
export declare const NotificationItem: React.NamedExoticComponent<NotificationItemProps & React.RefAttributes<HTMLDivElement>>;
export {};
