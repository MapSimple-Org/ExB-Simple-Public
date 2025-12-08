import { type ReferencePaletteOptions, type ReferencePalette } from './palette';
import { type ReferenceTypeface, type ReferenceTypefaceOptions } from './typeface';
import type { ThemeSourceOptions } from '../source';
/**
 * The reference options for the jimu-theme.
 */
export interface ThemeRefOptions {
    /**
     * The options for the reference palette.
     */
    palette?: ReferencePaletteOptions;
    /**
     * The options for the reference typeface.
     */
    typeface?: ReferenceTypefaceOptions;
}
/**
 * The reference variables for the jimu-theme.
 */
export interface ThemeReference {
    /**
     * The reference palette.
     */
    palette: ReferencePalette;
    /**
     * The reference typeface.
     */
    typeface: ReferenceTypeface;
}
export declare const createReference: (source: ThemeSourceOptions, options: ThemeRefOptions) => ThemeReference;
export * from './palette';
export * from './typeface';
