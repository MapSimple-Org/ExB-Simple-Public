import { type ThemeAllColors, type ThemeTypography } from 'jimu-core';
export declare const fontFamilyBase = "\"Avenir Next\", sans-serif, \"PingFang SC\", \"Microsoft YaHei\"";
export declare const fontSizeRoot = "100%";
export declare const fontSizeBase = "0.8125rem";
export declare const fontWeights: {
    extraLight: string;
    light: string;
    medium: string;
    bold: string;
    extraBold: string;
};
export declare const lineHeights: {
    medium: number;
    sm: number;
    lg: number;
};
export declare const createTypography: (typographyOptions: ThemeTypography, colors: ThemeAllColors) => ThemeTypography;
