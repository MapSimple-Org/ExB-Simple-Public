import { React, type IMThemeVariables } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import { type ColorItem } from '../components';
export interface ThemeColorSketchProps extends StandardComponentProps {
    value?: string;
    resettable?: boolean;
    disableAlpha?: boolean;
    standardColors?: ColorItem[] | string[];
    specificTheme?: IMThemeVariables;
    orgSharedColorsVisibility?: boolean;
    onCustomize?: () => void;
    onChange: (value: string) => void;
}
export declare const ThemeColorSketch: React.ForwardRefExoticComponent<ThemeColorSketchProps & React.RefAttributes<HTMLDivElement>>;
