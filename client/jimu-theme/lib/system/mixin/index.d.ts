import type { SharedThemeElementsVariables } from 'jimu-core';
export interface HeaderVars {
    color?: string;
    bg?: string;
}
export type FooterVars = HeaderVars;
export interface ThemeMixin {
    sharedTheme?: SharedThemeElementsVariables;
}
export interface ThemeMixinOptions extends Omit<ThemeMixin, 'sharedTheme'> {
}
export declare const createMixin: (options: ThemeMixinOptions, inputMixin: ThemeMixin) => ThemeMixin;
