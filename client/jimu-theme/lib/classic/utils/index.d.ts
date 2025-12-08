import { type ThemeVariables, type ThemeBoxStyles, type ThemeAllColors, Immutable, type SerializedStyles } from 'jimu-core';
/**
 * get common styles for an HTML element as a CSS basic box model
 * @internal
 */
export declare function getBoxStyles(variables: Partial<ThemeBoxStyles>): SerializedStyles;
/**
 * get common interpolation styles for an HTML element as a CSS basic box model
 * @internal
 */
export declare function getBoxInterpolationStyles(variables: Partial<ThemeBoxStyles>): string;
export declare function caret(direction: 'up' | 'down' | 'left' | 'right'): string;
export declare function hover(content: string): string;
export declare function hoverFocus(content: string): string;
export declare function navDivider(color: string, margin: 0 | string): string;
export declare function formValidation(isValid: boolean, theme?: ThemeVariables): SerializedStyles;
export declare const createFocusedStyles: (colors: ThemeAllColors) => Immutable.ImmutableObject<{
    color: string;
    width: string;
    offset: string;
}>;
export * from './pointer';
export * from './coloration';
