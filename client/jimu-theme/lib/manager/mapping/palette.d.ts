import type { ThemeColorPalette, ThemeVariables } from 'jimu-core';
import type { ReferencePaletteOptions } from '../../system';
export declare const getMappedNeutral: (classic: ThemeColorPalette, isDark?: boolean) => {
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    1000: string;
    1100: string;
    1200: string;
    1300: string;
};
export declare const getMappedPaletteOptions: (inputTheme: ThemeVariables) => ReferencePaletteOptions;
