import type { ThemeVariables } from 'jimu-core';
export declare const html: (theme: any) => {
    fontSize: any;
    webkitTextSizeAdjust: string;
    msTextSizeAdjust: string;
    mozTextSizeAdjust: string;
    webkitFontSmoothing: string;
};
export declare const body: (theme: ThemeVariables) => {
    fontFamily: string;
    fontSize: import("jimu-core").ThemeSize;
    fontWeight: string;
    lineHeight: import("jimu-core/lib/types/theme/common").LineHeight;
    color: string;
    backgroundColor: string;
};
export declare const getClassicThemeBaseLineStyles: (theme: any) => any;
