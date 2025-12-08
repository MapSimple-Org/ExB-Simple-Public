import type { IMDialogJson } from '../types/app-config';
export interface DialogProps {
    dialogJson: IMDialogJson;
    /**
     * Whether it's the current dialog.
     * @default false
     */
    isCurrentDialog?: boolean;
    /**
     * the followings are for fixed dialog
     */
    isOpenByPage?: boolean;
    runtime?: boolean;
    /**
     * the followings are for follow opener dialog:
     */
    opener?: any;
    isOpen?: boolean;
    toggle?: (e: any, type?: string) => void;
}
