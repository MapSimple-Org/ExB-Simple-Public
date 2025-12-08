/** @jsx jsx */
import { React } from 'jimu-core';
import { type ButtonProps } from 'jimu-ui';
export interface CopyButtonProps extends Omit<ButtonProps, 'onCopy'> {
    text: string;
    onCopy?: (text: any, result: any) => void;
    disabled?: boolean;
    className?: string;
}
export declare const _CopyButton: React.MemoExoticComponent<(props: CopyButtonProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
/**
 *  A react component for copy text to browser's clipboard.
 */
export declare const CopyButton: React.ForwardRefExoticComponent<Pick<CopyButtonProps, keyof CopyButtonProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export default CopyButton;
