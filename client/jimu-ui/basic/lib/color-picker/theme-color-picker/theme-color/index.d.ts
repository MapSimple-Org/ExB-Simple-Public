import { React, type IMThemeVariables } from 'jimu-core';
import { type ColorItem } from '../../components';
import type { StandardComponentProps } from 'jimu-ui/lib/components/types';
interface ThemeColorSketchProps extends StandardComponentProps {
    value?: string;
    showSharedColors?: boolean;
    onChange: (value: string) => void;
    presetColors?: ColorItem[] | string[];
    specificTheme?: IMThemeVariables;
    disableAlpha?: boolean;
    disableReset?: boolean;
    onCustomizeClick?: () => void;
}
export declare const ThemeColorSketch: React.ForwardRefExoticComponent<ThemeColorSketchProps & React.RefAttributes<HTMLDivElement>>;
export {};
