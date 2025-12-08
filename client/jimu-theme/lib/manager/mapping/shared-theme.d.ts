import { type SharedThemeVariables, type IMCustomThemeJson } from 'jimu-core';
import type { ThemeOptions } from '../../system';
/**
 * Check whether a theme is classic shared theme.
 * @param uri
 */
export declare const isClassicSharedTheme: (uri: string) => uri is "themes/shared-theme/";
/**
 * Check whether a theme is org shared theme.
 * @param uri
 */
export declare const isSharedTheme: (uri: string) => uri is "themes/shared/";
/**
 * Create the custom theme from org shared theme for classic themes.
 * @param sharedThemeVariables
 */
export declare const createCustomSharedThemeVariables: (sharedThemeVariables: SharedThemeVariables) => IMCustomThemeJson;
export declare const createSharedThemeOptions: (sharedThemeVariables: SharedThemeVariables) => ThemeOptions;
