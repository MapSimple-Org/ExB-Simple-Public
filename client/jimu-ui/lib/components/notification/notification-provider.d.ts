import { React } from 'jimu-core';
import type { NotificationProps } from './notification';
import type { InternalNotification, NotificationPlacement, TransitionHandlerProps } from './type';
import type { TransitionProps } from '../transition';
import type { SlideTransitionDirection } from '../slide';
import type { JSX } from 'react';
export interface NotificationProviderProps extends Pick<NotificationProps, 'placement' | 'autoHideDuration' | 'transitionDuration' | 'transitionDirection' | 'pausable' | 'showProgress' | 'onClose' | 'disablePortal'>, TransitionHandlerProps {
    /**
      * The component used for the transition.
      * @default Slide
      */
    TransitionComponent?: React.JSXElementConstructor<TransitionProps & {
        direction?: SlideTransitionDirection;
        children: React.ReactElement<any, any>;
    }>;
    /**
     * Most of the time this is your App.
     * Every component from this point onward will be able to show notifications.
     */
    children?: React.ReactNode | React.ReactNode[];
    /**
     * Denser margins for notifications.
     * The default is `true` on mobile devices.
     */
    dense?: boolean;
    /**
     * If `true`, the notification container can be expanded or collapsed.
     * By default, if will be `true` when placement is not 'top' or 'bottom' and the screen size is not small.
     */
    expandable?: boolean;
    /**
     * Maximum notifications that can be stacked on top of one another for each placement.
     * @default 5
     */
    maxNotification?: number;
}
/**
 * The `NotificationContext` value props.
 */
export interface NotificationContextProps {
    /**
     * Adds a notification to the queue to be displayed to the user and returns a id that is used to reference that notification later on.
     * @param options {NotificationProps} - Notification properties to be used for the new notification.
     * @returns {string} - Returns a unique identifier(user defined or generated) for the notification.
     */
    enqueueNotification: (options: NotificationProps) => string;
    /**
     * Dismiss notification with the given id. You can close all notifications at once by not passing a id to this function.
     * @param id
     */
    closeNotification: (id?: string) => void;
}
export declare const enqueueNotification: NotificationContextProps['enqueueNotification'];
export declare const closeNotification: NotificationContextProps['closeNotification'];
export declare const NotificationContext: React.Context<NotificationContextProps>;
interface State {
    notifications: InternalNotification[];
    queue: InternalNotification[];
    contextValue: NotificationContextProps;
}
/**
 * The `NotificationProvider` component provides a context for managing notifications in your application.
 *
 * By placing `NotificationProvider` in the app context, you can use the `enqueueNotification` method returned by the `useNotification` hook to send a notification.
 * All props of `NotificationProvider` with the same names serve as global defaults and can be overridden by the corresponding parameters in `enqueueNotification`.
 *
 * ```tsx
 * import { NotificationProvider, useNotification } from 'jimu-ui'
 *
 * // wrap your app
 * <NotificationProvider>
 *  <App />
 * </NotificationProvider>
 *
 * const App = () => {
 *   const { enqueueNotification } = useNotification()
 *   return <Button onClick={() => enqueueNotification({ message: 'Your notification here' })}>Show notification</Button>
 * }
 * ```
 */
export declare class NotificationProvider extends React.PureComponent<NotificationProviderProps, State> {
    constructor(props: NotificationProviderProps);
    get maxNotification(): number;
    get isMobile(): boolean;
    /**
     * Adds a new notification to the queue to be presented.
     * Returns generated or user defined id referencing the new notification.
     */
    enqueueNotification: (options: Partial<NotificationProps>) => string;
    /**
     * Check if the max number of notifications is already displayed on the screen
     * for the placement of the next notification in the queue.
     */
    checkLimitNotificationsReached: (state: State) => boolean;
    /**
     * Display notification if there's space for it. Otherwise, immediately
     * begin dismissing the oldest message to start showing the new one.
     */
    handleDisplayNotification: (state: State) => any;
    /**
     * Display items (notifications) in the queue if there's space for them.
     */
    processQueue: (state: any) => any;
    getPlacementNotifications: (state: State, placement: NotificationPlacement) => InternalNotification[];
    /**
     * Hide oldest notification on the screen because there exists a new one which we have to display.
     * (ignoring the one with 'autoHideDuration === 0'. i.e. explicitly told by user not to get dismissed).
     *
     * Note 1: If there is already a message leaving the screen, no new messages are dismissed.
     * Note 2: If the oldest message has not yet entered the screen, only a request to close the
     *         notification is made. Once it entered the screen, it will be immediately dismissed.
     */
    handleDismissOldest: (state: State) => State;
    /**
     * Set the entered state of the notification with the given id.
     */
    handleEnteredNotification: (node: any, isAppearing: any, id: any) => void;
    /**
     * Hide a notification after its timeout.
     */
    handleCloseNotification: (event: any, reason: any, id: any) => void;
    /**
     * Close notification with the given id
     */
    closeNotification: NotificationContextProps['closeNotification'];
    /**
     * When we set open attribute of a notification to false (i.e. after we hide a notification),
     * it leaves the screen and immediately after leaving animation is done, this method
     * gets called. We remove the hidden notification from state and then display notifications
     * waiting in the queue (if any). If after this process the queue is not empty, the
     * oldest message is dismissed.
     */
    handleExitedNotification: (node: any, id: any) => void;
    render(): JSX.Element;
}
export {};
