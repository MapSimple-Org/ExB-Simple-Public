import { React } from 'jimu-core';
import { FontFamilyValue } from 'jimu-ui';
interface Props {
    className?: string;
    style?: React.CSSProperties;
    font?: FontFamilyValue;
    disabled?: boolean;
    'aria-label'?: string;
    showInherit?: boolean;
    onChange?: (value: string) => void;
}
export declare const FontFamily: (props: Props) => React.ReactElement;
export {};
