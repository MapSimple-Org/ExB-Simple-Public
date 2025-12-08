import { React, type IMThemeVariables } from 'jimu-core';
import type { StandardComponentProps } from 'jimu-ui/lib/components/types';
import type { ColorItem } from '../../components';
interface ThemeColorSketchProps extends StandardComponentProps {
    value?: string;
    resettable?: boolean;
    disableAlpha?: boolean;
    standardColors?: ColorItem[] | string[];
    specificTheme?: IMThemeVariables;
    orgSharedColorsVisibility?: boolean;
    onCustomize?: () => void;
    onChange: (value: string) => void;
}
export declare const serializeRecentColorString: (color: string) => string;
export declare const ThemeColorSketch: React.ForwardRefExoticComponent<ThemeColorSketchProps & React.RefAttributes<HTMLDivElement>>;
export {};
