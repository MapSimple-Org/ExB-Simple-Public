import { React } from 'jimu-core';
interface UseNotificationProps {
    /**
     * The unique id of the notification.
     * This is used to identify the notification in the notification provider.
     */
    id?: string;
    /**
     * The number of milliseconds to wait before automatically calling the
     * `onClose` function. This behavior is disabled by default with the `0` value.
     * @default 0
     */
    autoHideDuration?: number;
    /**
     * Callback fired when the component requests to be closed.
     */
    onClose?: (event?: React.SyntheticEvent<any> | Event | null, reason?: 'timeout' | 'escape', key?: string) => void;
    /**
     * If `true`, the component is shown.
     */
    open?: boolean;
    /**
     * Whether the notification is pausable or not.
     */
    pausable?: boolean;
    /**
     * Whether to calculate the percentage used for a progress bar.
     */
    enableProgress?: boolean;
}
export declare const useNotificationState: (props?: UseNotificationProps) => {
    handlePause: () => void;
    handleResume: () => void;
    percent: number;
};
export {};
