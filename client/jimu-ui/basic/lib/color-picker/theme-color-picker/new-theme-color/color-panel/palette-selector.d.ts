import { React } from 'jimu-core';
import { type ReferencePalette } from 'jimu-theme';
import type { StandardComponentProps } from 'jimu-ui';
interface Props extends StandardComponentProps {
    value?: string;
    'aria-label'?: string;
    palette?: ReferencePalette;
    onChange: (value: string) => void;
}
export declare const ThemePaletteSelector: (props: Props) => React.ReactElement;
export {};
