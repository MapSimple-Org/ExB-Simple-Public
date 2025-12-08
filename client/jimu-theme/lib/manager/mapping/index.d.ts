import { type IMThemeVariables, type ImmutableObject, type ThemeVariables, type IMSharedThemeVariables, type ThemeButton } from 'jimu-core';
import type { StyleFunctions, ThemeModule } from '../theme-module';
import { type ThemeOptions, type ColorSchemeMode } from '../../system';
import { type ShadeOptions } from './color';
import * as utils from './utils';
import * as palette from './palette';
import * as typeface from './typeface';
import * as color from './color';
import * as typography from './typography';
import * as shadow from './shadow';
import * as shape from './shape';
import * as spacing from './spacing';
import * as components from './components';
export declare const createShadeOptions: (uri: string, isDark?: boolean) => ImmutableObject<ShadeOptions>;
/**
 * Create a mapped new theme options based on the classic theme.
 */
export declare const createMappedThemeOption: (classicTheme: ThemeVariables, compStyles: StyleFunctions, shadeOptions: ShadeOptions, sharedThemeButtonVars?: ThemeButton) => ThemeOptions;
/**
 * Check whether the input uri is a new theme.
 * Note: It can be used in builder and only valid for the app themes.
 */
export declare const whetherIsNewTheme: (module: ThemeModule) => boolean;
/**
 * Options for createMixedTheme
 * @internal
 */
export interface CreateMixedThemeOptions {
    /**
     * The theme module.
     */
    module?: ThemeModule;
    /**
     * The custom theme for classic theme.
     */
    customTheme?: ImmutableObject<Partial<ThemeVariables>>;
    /**
     * The custom theme options for new theme.
     */
    customThemeOption?: ImmutableObject<ThemeOptions>;
    /**
     * The shared theme variables.
     */
    sharedThemeVariables?: IMSharedThemeVariables;
    /**
     * The runtime theme mode, if defined, the theme will be generated in the specified mode.
     */
    runtimeThemeMode?: ColorSchemeMode;
    /**
     * Whether to forcefully mix with classic theme, default is false for new themes.
     */
    withClassicTheme?: boolean;
}
/**
 * Create mixed theme variables compatible with classic theme and new theme.
 * @internal
 */
export declare const createMixedTheme: (options?: CreateMixedThemeOptions) => IMThemeVariables;
export { palette, typeface, color, typography, shadow, shape, spacing, components, utils };
export type { ShadeOptions } from './color';
export { TypographyVariantsMap } from './typography';
export { isSharedTheme, isClassicSharedTheme } from './shared-theme';
