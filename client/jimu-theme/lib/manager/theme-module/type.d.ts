import type { IMThemeVariables, CustomThemeJson, Manifest } from 'jimu-core';
import type { ThemeComponentStyleOptions, OverridesStyleRules, RawThemeOptions } from '../../system';
export type CompSlotKeys = 'root' | (string & {
    [key: string]: any;
});
export type CompPartStyle = OverridesStyleRules<{
    [key: string]: any;
}, IMThemeVariables>;
export type CompRootStyle = CompPartStyle;
export type MixedRawThemeOptions = RawThemeOptions | CustomThemeJson;
/**
   * A set of functions to return the serialized style of emotion.
   */
export interface StyleFunctions {
    [name: string]: CompRootStyle;
}
export type MixedThemeStylesOptions = ThemeComponentStyleOptions | StyleFunctions;
/**
 * The theme manifest.
 */
export interface ThemeManifest extends Omit<Manifest, 'notAllowAdd' | 'label' | 'i18nMessages'> {
    /**
     * This is the fallback label for the theme. The theme label will prioritize using `_themeLabel` from the translation.
     */
    label: string;
    /**
     * Used to identify the override method of the theme.
     */
    styleFiles?: {
        /**
         * Whether the theme has css style file to override the default styles.
         *
         */
        css: boolean;
        /**
         * Whether the theme has CSS-in-JS style file to override the default styles.
         */
        js: boolean;
    };
    /**
     * Used to identify whether it is a new theme and to distinguish it from classic themes.
     */
    isNewTheme?: boolean;
    /**
     * Whether the theme is customizable.
     * If `styleFiles.js` or `styleFiles.css` is true(it means `style.ts` or `style.scss` exists), the default value is false.
     */
    themeCustomizable?: boolean;
}
/**
 * All the theme information in jimu-theme is defined as a theme module.
 */
export interface ThemeModule {
    /**
     * The theme uri is the unique identifier used to identify the theme.
     */
    uri: string;
    /**
     * The theme manifest defined in the `theme/manifest.json` file.
     */
    manifest: ThemeManifest;
    /**
     * The components styles defined in the `theme/style.ts` file to override the components styles.
     */
    styles?: ThemeComponentStyleOptions;
    /**
     * The theme options defined in the `theme/variables.json` file to override the theme variables.
     */
    variables?: RawThemeOptions;
    /**
     * The final theme variable, which is generated dynamically at run time based on the theme options.
     */
    theme?: IMThemeVariables;
}
