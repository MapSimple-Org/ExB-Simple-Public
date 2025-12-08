export declare const validHex: (hex: string) => boolean;
export declare const validRgba: (rgba: string) => boolean;
/**
 * Identify if a given string is a standard color.
 */
export declare const isStandardColor: (value: string) => boolean;
export declare const CssVariableTester: RegExp;
/**
 * Identify if a given string is a CSS variable.
 * @internal
 */
export declare const isCSSVariable: (input: string) => boolean;
/**
 * Identify if a given string is a standard color or CSS variable.
 */
export declare const isStandardOrCSSVariableColor: (input?: string) => boolean;
export declare const normalizeColorString: (input: string) => string;
/**
 * Rounds a numeric value to a specified number of decimal places.
 */
export declare function roundToDecimalPlace(value: number, decimalPlaces?: number): number;
/**
 * Converts a color from CSS hex format to CSS rgb format.
 * @param {string} color - Hex color, i.e. #nnn or #nnnnnn
 * @returns {string} A CSS rgb color string
 */
export declare function hexToRgb(color: any): string;
/**
 * Returns an object with the type and values of a color.
 *
 * Note: Does not support rgb % values.
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns {object} - A color object: {type: string, values: number[]}
 */
export declare function decomposeColor(input: any): any;
/**
 * Returns a channel created from the input color.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns {string} - The channel for the color, that can be used in rgba or hsla colors
 */
export declare const colorChannel: (color: any) => any;
/**
 * Converts a color object with type and values to a string.
 * @param {object} inputColor - Decomposed color
 * @param {string} inputColor.type - One of: 'rgb', 'rgba', 'hsl', 'hsla', 'color'
 * @param {array} inputColor.values - [n,n,n] or [n,n,n,n]
 * @returns {string} A CSS color string
 */
export declare function recomposeColor(color: any): string;
/**
 * Converts a color from CSS rgb format to CSS hex format.
 * @param {string} color - RGB color, i.e. rgb(n, n, n)
 * @returns {string} A CSS rgb color string, i.e. #nnnnnn
 */
export declare function rgbToHex(color: any): any;
/**
 * Converts a color from hsl format to rgb format.
 * @param {string} color - HSL color values
 * @returns {string} rgb color values
 */
export declare function hslToRgb(color: any): string;
/**
 * The relative brightness of any point in a color space,
 * normalized to 0 for darkest black and 1 for lightest white.
 *
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @returns {number} The relative brightness of the color in the range 0 - 1
 */
export declare function getLuminance(color: any): number;
/**
 * Calculates the contrast ratio between two colors.
 *
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
 * @param {string} foreground - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {string} background - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @returns {number} A contrast ratio value in the range 0 - 21.
 */
export declare function getContrastRatio(foreground: any, background: any): number;
/**
 * Sets the absolute transparency of a color.
 * Any existing alpha values are overwritten.
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} value - value to set the alpha channel to in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export declare function alpha(color: any, value: any): string;
/**
 * Returns a color that is readable on the input color.
 */
export declare const readableColor: (color: string, returnIfLightColor?: string, returnIfDarkColor?: string, strict?: boolean) => string;
/**
 * Darkens a color.
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export declare function darken(color: any, coefficient: any): string;
/**
 * Lightens a color.
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export declare function lighten(color: any, coefficient: any): string;
/**
 * Darken or lighten a color, depending on its luminance.
 * Light colors are darkened, dark colors are lightened.
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()
 * @param {number} coefficient=0.15 - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export declare function emphasize(color: any, coefficient?: number): string;
/**
 * Mix two colors evenly
 */
export declare const averaging: (color1: string, color2: string) => string;
