import { React } from 'jimu-core';
import { type HsvaColor, type ColorResult } from '@uiw/color-convert';
import type { StandardComponentProps } from 'jimu-ui';
export interface RgbaProps extends StandardComponentProps {
    size?: 'lg' | 'sm' | 'default';
    hsva: HsvaColor;
    disableAlpha?: boolean;
    onChange?: (color: ColorResult) => void;
}
export declare const Rgba: React.ForwardRefExoticComponent<RgbaProps & React.RefAttributes<HTMLDivElement>>;
