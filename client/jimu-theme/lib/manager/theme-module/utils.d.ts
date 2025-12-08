import { type ImmutableObject, type IMThemeVariables } from 'jimu-core';
import type { ThemeManifest, ThemeModule } from './type';
export declare function getBuilderThemeVariables(): IMThemeVariables;
export declare function getAppThemeVariables(): IMThemeVariables;
/**
 * Get component variables from theme variables.
 * @param categoryName
 * @internal
 */
export declare function getComponentVariants(name: string): ImmutableObject<{
    [key: string]: any;
}>;
/**
 * Get components variables for navigation.
 * @internal
 */
export declare const getNavigationVariables: () => ImmutableObject<{
    [key: string]: {
        [key: string]: any;
    };
}>;
/**
 * Check whether a specific theme module is loaded.
 * @param uri
 * @internal
 */
export declare const isThemeLoaded: (uri?: string) => boolean;
/**
 * Get a specific theme module.
 * @param uri
 * @internal
 */
export declare const getThemeModule: (uri?: string, showWarning?: boolean) => ThemeModule;
/**
 * Get the theme module for theme2.
 * @param uri
 * @internal
 */
export declare const getTheme2Module: (showWarning?: boolean) => ThemeModule;
/**
 * Update the currently used theme module.
 * Note: for components and widgets, this method should only be called during testing.
 * @internal
 */
export declare const setThemeModule: (module: ThemeModule) => void;
/**
 * Get the override style function of the specific component.
 * @param name
 * @param uri
 * @internal
 */
export declare const getThemeStyle: (name: string, uri?: string) => import("./type").CompPartStyle;
/**
 * Get the theme manifest.
 * @param uri
 * @internal
 */
export declare const getThemeManifest: (uri?: string, showWarning?: boolean) => ThemeManifest;
/**
 * Get the theme manifest for theme2.
 * @param uri
 * @internal
 */
export declare const getTheme2Manifest: (showWarning?: boolean) => ThemeManifest;
/**
 * Get the theme manifest for app themes.
 * @param uri
 * @internal
 */
export declare const getAppThemeManifest: (uri?: string, showWarning?: boolean) => ThemeManifest;
/**
 * Get the override style function of the specific component for theme2.
 * @param name
 * @internal
 */
export declare const getTheme2Style: (name: string) => any;
/**
 * Get the theme variables.
 */
export declare const getTheme: () => IMThemeVariables;
/**
 * Get the theme variable for another framework.
 * In the app-in-builder env, this variable points to the builder.
 * In the builder env, this variable points to the app.
 * In a single app env, this variable is null.
 * @internal
 */
export declare const getTheme2: () => IMThemeVariables;
export declare const useThemeLoaded: (uri: string) => boolean;
