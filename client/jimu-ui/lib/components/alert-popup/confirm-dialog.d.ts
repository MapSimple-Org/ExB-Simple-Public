/**
 * The `ConfirmDialog` component props.
 */
export interface ConfirmDialogProps {
    /**
     * The title of the dialog.
     */
    title: string;
    /**
     * The content of the dialog.
     */
    content: string;
    /**
     * The display style of the dialog.
     * @default warning
     */
    level: 'info' | 'warning';
    /**
     * Whether to show `NotShowAgainOption` option.
     * @default true
     */
    hasNotShowAgainOption?: boolean;
    /**
     * The label of confirm button.
     * @default Yes
     */
    confirmLabel?: string;
    /**
     * The label of cancel button.
     * @default No
     */
    cancelLabel?: string;
    /**
     * Be invoked when clicking the cancel button.
     */
    onClose: () => void;
    /**
     * Be invoked when clicking the confirm button.
     * @param notShowAgain Whether the `NotShowAgainOption` option is checked.
     */
    onConfirm: (notShowAgain?: boolean) => void;
}
/**
 * The `ConfirmDialog` component inform users about a task and can contain critical information, require decisions, or involve multiple tasks.
 *
 * ```ts
 * import { ConfirmDialog } from 'jimu-ui'
 * ```
 */
export declare const ConfirmDialog: (props: ConfirmDialogProps) => import("@emotion/react/jsx-runtime").JSX.Element;
