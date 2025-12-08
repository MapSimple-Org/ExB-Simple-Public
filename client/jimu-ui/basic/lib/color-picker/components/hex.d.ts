import { React } from 'jimu-core';
import { type EditableInputProps } from './editable-input';
import { type ColorResult, type HsvaColor } from '@uiw/color-convert';
interface HexProps extends Omit<EditableInputProps, 'value' | 'onChange'> {
    hsva: HsvaColor;
    'aria-label'?: string;
    onChange?: (color: ColorResult) => void;
}
export declare const Hex: React.FC<HexProps>;
export {};
