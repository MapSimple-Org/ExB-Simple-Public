import { React } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui';
import { type ColorItem } from './color-swatch';
export interface ColorStripProps extends StandardComponentProps {
    role?: React.AriaRole;
    'aria-label'?: string;
    color?: string;
    colors?: ColorItem[] | string[];
    fill?: boolean;
    size?: 'default' | 'sm';
    shape?: 'circular' | 'square';
    onChange?: (value: string) => void;
}
export declare const ColorStrip: (props: ColorStripProps) => import("@emotion/react/jsx-runtime").JSX.Element;
