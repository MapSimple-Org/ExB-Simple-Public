import { type IMThemeVariables } from 'jimu-core';
export declare const useColorValue: (value: string, specificTheme?: IMThemeVariables) => string;
/**
 * Get the title of theme color variable
 * @ignore
 */
export declare const useColorVariableTitle: (variable: string) => string;
export declare const useTranslateVariableColor: () => (name: string) => string;
export declare const useTranslateSharedOrgVariableColor: () => (name: string) => string;
/**
 * Convert the new theme color variable to classic theme color variable
 */
export declare const convertToClassicColorVariable: (input: string, theme: IMThemeVariables) => string;
