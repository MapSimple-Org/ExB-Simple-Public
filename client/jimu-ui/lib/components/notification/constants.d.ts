import type { TransitionDurationOption } from 'jimu-theme';
import type { NotificationPlacement } from './type';
export declare const ProviderDefaultProps: {
    maxNotification: number;
    autoHideDuration: number;
    placement: NotificationPlacement;
    TransitionComponent: import("react").ForwardRefExoticComponent<import("../slide").SlideProps & import("react").RefAttributes<HTMLElement>>;
    transitionDuration: TransitionDurationOption;
};
export declare const Indents: {
    notification: {
        default: number;
        dense: number;
    };
    space: {
        default: number;
        dense: number;
    };
};
/**
 * The width of the notification.
 */
export declare const NotificationWidth = 360;
