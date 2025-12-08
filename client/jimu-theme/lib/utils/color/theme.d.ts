import { type ImmutableObject, type ThemeVariables, type IMThemeVariables } from 'jimu-core';
import type { SchemeColor } from '../../system';
/**
 * Identify if a given string is a theme color path(e.g. sys.color.primary.main)
 */
export declare const isColorPath: (path: string) => boolean;
/**
 * Get value from a theme color variable for classic themes.
 * @param path - Path to the theme variable. There are two types of paths:
 * One is the path separated by dots,(e.g primary.200), the other is CSS variable(var(--primary-100))
 * @param variables - Target theme variables object used to get value from.
 * @deprecated Use `parseThemeVariable` instead.
 */
export declare const getThemeColorVariableValue: (input: string, theme: ImmutableObject<Partial<ThemeVariables>>) => string;
/**
 * Get value from a path to a theme color variable for classic themes.
 * @param input - Path to the theme variable. There are two types of paths:
 * One is the path separated by dots,(e.g primary.200), the other is CSS variable(var(--primary-100))
 * @param theme - Target theme variables object used to get value from.
 * @internal
 */
export declare const getThemeColorValue: (input: string, theme: ImmutableObject<Partial<ThemeVariables>>) => string;
/**
 * Receive a CSS variable and return its path in the theme as an array.
 * @param cssVar
 */
export declare const parseCssVarToThemePaths: (cssVar: string) => string[];
export declare const parseCssVariables: (variable: string, theme: IMThemeVariables) => string;
export declare const parseColorPath: (path: string, theme: IMThemeVariables) => string;
export declare const parseThemeCssVariableOrPath: (input: string, theme: IMThemeVariables) => string;
export declare const isNewThemeVariableOrPath: (input: string) => boolean;
/**
 * Get value from a path to a theme color variable.
 * @param input - Path to the theme variable. There are two types of paths:
 * One is the path separated by dots,(e.g primary.200. sys.color.primary.main), the other is CSS variable(var(--primary-100), var(--ref-palette-primary-100))
 * @param theme - Target theme variables object used to get value from.
 * Note: Only support color related variables now.
 */
export declare const parseThemeVariable: (input: string, theme: IMThemeVariables) => string;
/**
 * Used to apply an opacity to the input color.
 * If the color is a theme color variable, a `theme` object must be provided to resolve it.
 * Note: since old theme color variables (often present after an app upgrades its theme) cannot be resolved by the new theme,
 * if you don’t need to return a fixed `rgba` value it’s recommended to use `colorUtils.colorMixOpacity` instead.
 */
export declare const rgba: (input: string, opacity: number, theme?: IMThemeVariables) => any;
/**
 * Used to apply an opacity to the input color using the CSS `color-mix` method.
 */
export declare const colorMixOpacity: (input: string, alpha: number) => string;
/**
 * Get the theme color value for brand and function color names.
 * @param input
 */
export declare function getThemeColorNameColor(input: string, theme: IMThemeVariables): any;
/**
 * Convert a string format color to esri symbol color
 * @param value [symbol color](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-Symbol.html#color)
 * @param theme
 * @returns string color
 */
export declare const convertJsAPISymbolColorToStringColor: (value: [number, number, number, number]) => string;
/**
 * Convert a string format color to esri symbol color
 * @param value string color
 * @param theme
 * @returns [symbol color](https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-Symbol.html#color)
 */
export declare const convertStringColorToJsAPISymbolColor: (value: string | number[], theme: IMThemeVariables) => [number, number, number, number];
/**
 * Get the secondary color based on the primary color.
 * @param primaryColor - The primary color in Hex or RGB format.
 * @returns The secondary color in Hex format.
 */
export declare const getSecondaryColor: (primaryColor: string) => string;
/**
 * Return htc argb color from a given color string
 */
export declare const argbFromColor: (color: string) => number;
/**
 * Augments a given color by generating a tonal palette and calculating lighter and darker variations of the color based on a tone offset.
 *
 * @param {string} inputColor - The base color in a CSS-compatible format (e.g., #nnnnnn, rgb(), rgba()).
 * @param {number} [toneOffset=10] - The tone offset used to calculate the lighter and darker variations.
 * @returns {object} An object containing the following properties:
 *                   - `main`: The original color.
 *                   - `light`: The lighter variation of the color.
 *                   - `dark`: The darker variation of the color.
 *                   - `text`: The contrast text color based on the mode.
 */
export declare function augment(inputColor: string, toneOffset?: number): SchemeColor;
/**
 * Returns a readable color based on the provided static color or theme color.
 */
export declare const getReadableThemeColor: (inputColor: string, theme: IMThemeVariables) => string;
/**
 * Returns a lighter color based on the provided static color or theme color.
 * If the input color is a neutral color CSS variable, it will be offset by -100.
 */
export declare const lightenTextColor: (inputColor: string, theme: IMThemeVariables) => string;
/**
 * Returns a lighter color based on the provided static color or theme color.
 */
export declare const lightenThemeColor: (inputColor: string, theme: IMThemeVariables) => string;
/**
 * Augments a given static color or theme color variable by generating a tonal palette and calculating lighter and darker variations of the color based on a tone offset.
 */
export declare const augmentThemeColor: (inputColor: string, theme: IMThemeVariables, toneOffset?: number) => SchemeColor;
/**
 * Calculates the contrast ratio between two colors.
 * @returns {number} A contrast ratio value in the range 0 - 21.
 */
export declare const getThemeColorContrastRatio: (foreground: string, background: string, theme: IMThemeVariables) => number;
