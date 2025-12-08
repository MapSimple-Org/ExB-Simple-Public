import type { TextFontStyle, BorderStyle } from 'jimu-ui';
type NumbericValueWithUnit = string;
export type Color = string;
export type Size = NumbericValueWithUnit | 0;
export type LineHeight = number | NumbericValueWithUnit;
export declare enum ThemeBoxStyleKeys {
    Color = "color",
    Background = "bg",
    Border = "border",
    BorderRadius = "borderRadius",
    Shadow = "shadow"
}
export type ThemeBoxStyles = {
    color?: Color;
    bg?: Color;
    border?: BorderStyle;
    borderRadius?: Size;
    shadow?: string;
    decoration?: string;
    fontWeight?: string;
} & Omit<TextFontStyle, 'size' | 'font' | 'color' | 'background' | 'letterspace' | 'linespace' | 'align'>;
export interface ThemeBoxStylesByState {
    default?: ThemeBoxStyles;
    hover?: ThemeBoxStyles;
    active?: ThemeBoxStyles;
    disabled?: ThemeBoxStyles & {
        opacity?: number;
    };
    focus?: ThemeBoxStyles;
}
export {};
