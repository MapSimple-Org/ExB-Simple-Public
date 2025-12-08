import { type ImmutableObject, type ThemeVariables, type CustomThemeJson, type ThemeComponents } from 'jimu-core';
import type { ThemeOptions, RawThemeOptions } from '../../system';
export declare const remToPx: (input: string) => string;
export declare const getClassicCustomTheme: (_inputCustomTheme?: CustomThemeJson | ImmutableObject<CustomThemeJson>) => CustomThemeJson;
export declare const createClassicCustomTheme: (overwrite?: CustomThemeJson, customTheme?: ImmutableObject<CustomThemeJson>) => Partial<ThemeVariables>;
export declare const createCustomComponents: (base: Partial<ThemeComponents>, mixin: Partial<ThemeComponents>) => Partial<ThemeComponents>;
export declare const convertToRawThemeOptions: (themeOptions: ImmutableObject<ThemeOptions>) => ImmutableObject<RawThemeOptions>;
