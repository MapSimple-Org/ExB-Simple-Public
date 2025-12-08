import { React, type IMThemeVariables } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import { type ColorItem } from '../../../components';
interface ThemeColorPanelProps extends StandardComponentProps {
    value?: string;
    resettable?: boolean;
    recentColors?: ColorItem[];
    onChange?: (value: string) => void;
    specificTheme?: IMThemeVariables;
    recentColorsVisibility?: boolean;
    orgSharedColorsVisibility?: boolean;
    customizeBtnRef?: React.Ref<HTMLButtonElement>;
    onCustomize?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
}
export declare const ThemeColorPanel: (props: ThemeColorPanelProps) => React.ReactElement;
export {};
