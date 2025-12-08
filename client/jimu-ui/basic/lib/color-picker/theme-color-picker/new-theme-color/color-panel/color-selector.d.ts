import { React } from 'jimu-core';
import { type ColorScheme, type ReferencePalette } from 'jimu-theme';
import { type StandardComponentProps } from 'jimu-ui';
interface Props extends StandardComponentProps {
    value?: string;
    'aria-label'?: string;
    palette?: ReferencePalette;
    colorScheme?: ColorScheme;
    onChange: (value: string) => void;
}
export declare const ThemeColorSelector: (props: Props) => React.ReactElement;
export {};
