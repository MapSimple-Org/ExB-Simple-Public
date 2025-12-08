import { type ImmutableObject, type SharedThemeVariables } from 'jimu-core';
import type { ThemeOptions } from '../../system';
/**
 * Create the custom theme option of the shared theme.
 * @param sharedThemeVariables
 */
export declare const createThemeOptionsFromSharedThemeVariables: (sharedThemeVariables: SharedThemeVariables) => ImmutableObject<ThemeOptions>;
