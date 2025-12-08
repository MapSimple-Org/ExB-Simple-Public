import type { ImmutableObject } from 'jimu-core';
import type { ThemeSysOptions, ThemeOptions, ColorSchemeMode, ThemeRefOptions, ThemeCompOptions, ColorSchemeOptions, ThemeSourceOptions, RawThemeOptions, ThemeVariableCompOptions, ThemeMixinOptions, ThemeComponentStyleOptions } from '../../system';
export declare const createColorSchemeOptions: (base: Partial<ColorSchemeOptions>, admixture: Partial<ColorSchemeOptions>, mode?: ColorSchemeMode) => Partial<ColorSchemeOptions>;
export declare const createThemeSrcOptions: (base?: ThemeSourceOptions, admixture?: ImmutableObject<ThemeSourceOptions> | ThemeSourceOptions) => ThemeSourceOptions;
export declare const createThemeRefOptions: (base?: ThemeRefOptions, admixture?: ImmutableObject<ThemeRefOptions> | ThemeRefOptions) => ThemeRefOptions;
export declare const createThemeSysOptions: (base?: ThemeSysOptions, admixture?: ImmutableObject<ThemeSysOptions> | ThemeSysOptions) => ThemeSysOptions;
export declare const createThemeCompOptions: (base: ThemeVariableCompOptions, admixture: ImmutableObject<ThemeVariableCompOptions> | ThemeVariableCompOptions, styles?: ThemeComponentStyleOptions) => ThemeCompOptions;
export declare const createThemeMixinOptions: (base: ThemeMixinOptions, admixture: ImmutableObject<ThemeMixinOptions> | ThemeMixinOptions) => ThemeMixinOptions;
/**
 * Merge two theme options.
 * @internal
 */
export declare const createThemeOptions: (base: RawThemeOptions, admixture: ImmutableObject<RawThemeOptions>, styles?: ThemeComponentStyleOptions) => ThemeOptions;
