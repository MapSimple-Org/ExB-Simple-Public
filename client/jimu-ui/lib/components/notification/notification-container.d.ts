import { React } from 'jimu-core';
import type { NotificationPlacement, InternalNotification, TransitionHandlerProps, NotificationCloseReason } from './type';
import type { StandardComponentProps } from '../types';
/**
 * The `NotificationContainer` component props.
 */
export interface NotificationContainerProps extends TransitionHandlerProps, StandardComponentProps {
    /**
     *  The notifications to be rendered inside the notification container.
     */
    notifications: InternalNotification[];
    /**
     * If `true`, the notification container will use a more compact layout,
     * reducing padding and spacing to fit more content in a smaller area.
     * Useful for displaying multiple notifications in limited space.
     *
     * The default is `true` on mobile devices.
     */
    dense?: boolean;
    /**
     * If `true`, the notification container can be expanded or collapsed.
     */
    expandable?: boolean;
    /**
     * Position of Notification.
     * On smaller screens, the component grows to occupy all the available width, the horizontal alignment is ignored.
     */
    placement: NotificationPlacement;
    /**
    * Callback fired when the component requests to be closed.
    */
    onClose?: (event: React.SyntheticEvent<any> | Event | null, reason: NotificationCloseReason, id?: string) => void;
}
export declare const NotificationContainer: React.FC<NotificationContainerProps>;
