import { type ButtonType } from 'jimu-ui';
interface Props {
    isOpen: boolean;
    headerText?: string;
    errorMessage?: string;
    okText?: string;
    cancelText?: string;
    confirmButtonType?: ButtonType;
    isShowWarningIcon?: boolean;
    toggle: () => void;
    onConfirm?: () => void;
    onCancel?: () => void;
}
declare const ErrorPopper: (props: Props) => import("@emotion/react/jsx-runtime").JSX.Element;
export default ErrorPopper;
