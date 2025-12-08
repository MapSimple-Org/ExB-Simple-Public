import type { ThemeVariables } from 'jimu-core';
import type { Theme } from '../system';
/**
 * Theme variable interface.
 * Combines base theme variables and extended theme properties.
 */
export interface ThemeVariable extends ThemeVariables, Theme {
    /**
     * The theme uri is used to identify the source (theme folder) of the theme object.
     * Note: It should not be empty in the builder or app runtime.
     */
    uri?: string;
}
