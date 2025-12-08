import { type ThemeSourceOptions } from '../source';
export type ReferencePaletteColors = 'primary' | 'secondary' | 'neutral' | 'error' | 'warning' | 'info' | 'success';
export declare const ReferencePaletteColorTones: number[];
export declare const ReferencePaletteColorFullTones: number[];
export declare const ReferencePaletteNeutralTones: number[];
export interface ReferencePaletteColor {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
}
export interface ReferencePaletteFullColor extends ReferencePaletteColor {
    0: string;
    1000: string;
}
export interface ReferencePaletteNeutralColor extends ReferencePaletteColor {
    1000: string;
    1100: string;
    1200: string;
    1300: string;
}
/**
 * The interface for the reference color palette.
 */
export interface ReferencePalette {
    /**
     * The white color.
     */
    white: string;
    /**
     * The black color.
     */
    black: string;
    /**
     * The primary color of the palette.
     */
    primary: ReferencePaletteColor;
    /**
     * The secondary color of the palette.
     */
    secondary: ReferencePaletteColor;
    /**
     * The neutral color of the palette.
     */
    neutral: ReferencePaletteNeutralColor;
    /**
     * The error color of the palette.
     */
    error: ReferencePaletteColor;
    /**
     * The warning color of the palette.
     */
    warning: ReferencePaletteColor;
    /**
     * The info color of the palette.
     */
    info: ReferencePaletteColor;
    /**
     * The success color of the palette.
     */
    success: ReferencePaletteColor;
    custom1?: ReferencePaletteColor;
    custom2?: ReferencePaletteColor;
    custom3?: ReferencePaletteColor;
    custom4?: ReferencePaletteColor;
    custom5?: ReferencePaletteColor;
}
/**
 * The options for the reference palette.
 */
export type ReferencePaletteOptions = Partial<ReferencePalette>;
export declare const createReferencePaletteColor: (source: string, tones?: number[]) => ReferencePaletteFullColor;
export declare const createReferencePalette: (options: ThemeSourceOptions) => ReferencePalette;
