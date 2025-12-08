import { TonalPalette } from '@material/material-color-utilities';
export type SourceKeyColors = 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'info' | 'success';
export type SourceCustomColors = 'custom1' | 'custom2' | 'custom3' | 'custom4' | 'custom5';
export type SourceColors = SourceKeyColors | SourceCustomColors;
export declare const SourceKeyColorNames: SourceKeyColors[];
export declare const SourceCustomColorNames: SourceCustomColors[];
export declare const SourceColorNames: SourceColors[];
export declare const DefaultThemeSourceOptions: ThemeSourceOptions;
/**
 * The source option for brand or functional colors.
 */
export interface ThemeSourceOption {
    /**
     * The color value (Hex or RGB).
     */
    color: string;
    /**
     * Whether to harmonize derived colors to avoid low contrast.
     *
     * Specifically for `neutral` color:
     * The default tones are grayscale tones.
     * You can mix hues of the color in this option via the `harmonize` property.
     */
    harmonize?: boolean;
}
/**
 * The source options for the jimu-theme.
 */
export interface ThemeSourceOptions {
    /**
     * The source option for the primary color.
     */
    primary: ThemeSourceOption;
    /**
     * The source option for the secondary color.
     */
    secondary?: ThemeSourceOption;
    /**
     * The source option for the neutral color.
     */
    neutral?: ThemeSourceOption;
    /**
     * The source option for the error color.
     */
    error?: ThemeSourceOption;
    /**
     * The source option for the warning color.
     */
    warning?: ThemeSourceOption;
    /**
     * The source option for the info color.
     */
    info?: ThemeSourceOption;
    /**
     * The source option for the success color.
     */
    success?: ThemeSourceOption;
    custom1?: ThemeSourceOption;
    custom2?: ThemeSourceOption;
    custom3?: ThemeSourceOption;
    custom4?: ThemeSourceOption;
    custom5?: ThemeSourceOption;
}
/**
 * The source variables for the jimu-theme.
 */
export type ThemeSource = ThemeSourceOptions;
interface CoreTonalPalette {
    primary: TonalPalette;
    secondary: TonalPalette;
    neutral: TonalPalette;
    error: TonalPalette;
    warning: TonalPalette;
    info: TonalPalette;
    success: TonalPalette;
}
export interface SourceTonalPalette extends CoreTonalPalette {
    custom1?: TonalPalette;
    custom2?: TonalPalette;
    custom3?: TonalPalette;
    custom4?: TonalPalette;
    custom5?: TonalPalette;
}
export declare const createFromSource: (source: ThemeSourceOption) => CoreTonalPalette;
export declare const createSourcePalette: (sourceColors: ThemeSourceOptions) => SourceTonalPalette;
export declare const createSource: (options: ThemeSourceOptions) => ThemeSourceOptions;
export {};
