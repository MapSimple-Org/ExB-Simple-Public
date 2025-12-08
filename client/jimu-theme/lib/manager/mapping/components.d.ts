import type { ThemeButton, ThemeVariables } from 'jimu-core';
import type { ThemeCompOptions, ThemeComponentStyleOptions } from '../../system';
import type { MixedThemeStylesOptions, StyleFunctions } from '../theme-module';
export declare const getMappedComponentStyles: (styles: MixedThemeStylesOptions) => ThemeComponentStyleOptions;
export declare const getMappedComponents: (classicTheme: ThemeVariables, inputStyles: StyleFunctions, sharedThemeButtonVars?: ThemeButton) => ThemeCompOptions;
