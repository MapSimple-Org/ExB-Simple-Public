import { type IMDialogJson } from '../../types/app-config';
interface DialogAnimationPros {
    dialogJson: IMDialogJson;
    isOpen: boolean;
    jimuUI: any;
    jimuLayout: any;
    version: number;
    messages?: any;
    cbxAnimation?: boolean;
    setCbxState?: (checked: boolean) => void;
    isChecked?: boolean;
    closeDialog?: () => void;
}
declare function DialogAnimation({ dialogJson, isOpen, jimuUI, jimuLayout, version, messages, cbxAnimation, isChecked, setCbxState, closeDialog }: DialogAnimationPros): import("@emotion/react/jsx-runtime").JSX.Element;
export default DialogAnimation;
