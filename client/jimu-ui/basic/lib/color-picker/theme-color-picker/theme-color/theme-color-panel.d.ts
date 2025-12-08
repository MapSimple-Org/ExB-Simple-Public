import { React, type IMThemeVariables } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import { type ColorItem } from '../../components';
interface ThemeColorProps extends StandardComponentProps {
    value?: string;
    showSharedColors?: boolean;
    onChange?: (value: string) => void;
    recentColors?: ColorItem[];
    specificTheme?: IMThemeVariables;
    onCustomizeClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void;
    presetColors?: ColorItem[] | string[];
    disableReset?: boolean;
    customizeBtnRef?: React.Ref<HTMLButtonElement>;
}
export declare const ThemeColorPanel: (props: ThemeColorProps) => React.ReactElement;
export {};
