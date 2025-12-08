import { type ReferencePaletteColors, type ReferencePaletteColor } from 'jimu-theme';
import type { StandardComponentProps } from 'jimu-ui';
interface PaletteColorSwatchProps extends StandardComponentProps {
    value?: string;
    colors: ReferencePaletteColor;
    'aria-label'?: string;
    size?: number;
    name: ReferencePaletteColors;
    onChange?: (value: string) => void;
}
export declare const PaletteColorSwatch: (props: PaletteColorSwatchProps) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
