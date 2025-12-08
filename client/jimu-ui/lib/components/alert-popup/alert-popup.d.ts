import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `AlertPopup` component props.
 */
export interface AlertPopupProps extends StandardComponentProps {
    /**
     * The severity of the alert popup. This defines the button type and icon used.
     * @default warning
     */
    severity?: 'warning' | 'info' | 'error';
    /**
     * Whether to display the icon for the `severity`.
     * @default false
     */
    withIcon?: boolean;
    /**
     * Default initial `isOpen`.
     * @default false
     */
    defaultIsOpen?: boolean;
    /**
     * Whether the popup is open.
     * @default false
     */
    isOpen?: boolean;
    /**
     * Whether to automatically focus on the close button when open.
     * @ignore
     * @default false
     */
    autoFocus?: boolean;
    /**
     * Whether a close (x) button is visible on top right or not.
     * @default false
     */
    closable?: boolean;
    /**
     * The title of the popup.
     */
    title?: string;
    /**
     * The description of the confirmation box title.
     */
    description?: React.ReactNode;
    /**
     * Whether to show or hide `OK` button.
     */
    hideOK?: boolean;
    /**
     * Whether to disable `OK` button.
     * @default false
     */
    disableOK?: boolean;
    /**
     * Whether to show or hide `Cancel` button.
     */
    hideCancel?: boolean;
    /**
     * Whether to show or hide `Header`.
     */
    hideHeader?: boolean;
    /**
     * Toggle to open/close the popup.
     */
    toggle?: (isOk?: boolean) => void;
    /**
     * Whether to show `NotShowAgainOption` option.
     * @default false
     */
    hasNotShowAgainOption?: boolean;
    /**
     * The label of `OK` button.
     */
    okLabel?: string;
    /**
   * The label of `Cancel` button.
   */
    cancelLabel?: string;
    /**
     * Callback when `Close` button is clicked.
     */
    onClickClose?: (evt?: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Callback when `OK` button is clicked.
     * @param dontShowAgain Determines whether the modal should not be shown again.
     * @param evt
     */
    onClickOk?: (dontShowAgain?: boolean, evt?: React.MouseEvent<HTMLButtonElement>) => void;
    /**
     * Defines the children of the element.
     */
    children?: React.ReactNode;
}
/**
 * The `AlertPopup` component provides the user the ability to display prompt message in modal.
 *
 * ```ts
 * import { AlertPopup } from 'jimu-ui'
 * ```
 */
export declare const AlertPopup: (props: AlertPopupProps) => import("@emotion/react/jsx-runtime").JSX.Element;
