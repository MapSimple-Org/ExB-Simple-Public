import { type ThemeThemeColors, type ThemeColorPalette, type ThemeColorPaletteItem, type ThemeCommonColors, type ThemeAllColors } from 'jimu-core';
declare const commonColors: ThemeCommonColors;
declare const themeColors: ThemeThemeColors;
declare const themePalette: ThemeColorPalette;
interface AugmentColorOptions {
    level?: number;
    count?: number;
    range?: [number, number];
    reverse?: boolean;
    /**
     * Whether to use the previous method of generating color swatches
     * @default false
     */
    classic?: boolean;
}
export declare const augmentColor: (color: string, options?: AugmentColorOptions) => ThemeColorPaletteItem;
interface AugmentThemeColorOptions {
    count?: number;
    name?: string;
    isDark?: boolean;
}
export declare const augmentThemeColor: (color: string, options?: AugmentThemeColorOptions) => ThemeColorPaletteItem;
export declare const createPalette: (inputColors: Partial<ThemeAllColors>, isDark?: boolean) => ThemeColorPalette;
export declare const revertPalette: (palette: ThemeColorPalette) => ThemeColorPalette;
export declare const createColors: (inputColors: Partial<ThemeAllColors>, isDarkTheme?: boolean) => ThemeAllColors;
export { commonColors, themeColors, themePalette };
