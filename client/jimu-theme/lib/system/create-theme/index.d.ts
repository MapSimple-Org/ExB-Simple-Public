import { type ModeBasedColorSchemeOptions, type ColorScheme, type ColorSchemeMode } from '../color-scheme';
import { type ShadowsOptions, type Shadow } from '../shadow';
import { type Shape, type ShapeOptions } from '../shape';
import { type SpacingOptions, type Spacing } from '../spacing';
import { type Typography, type TypographyOptions } from '../typography';
import { type ThemeRefOptions, type ThemeReference } from '../reference';
import { type ThemeSource, type ThemeSourceOptions } from '../source';
import { type ThemeMixin, type ThemeMixinOptions } from '../mixin';
import type { ThemeCompOptions, ThemeComponents, ThemeVariableCompOptions } from '../component';
import { type Transitions, type TransitionsOptions } from '../transition';
import { type Breakpoints, type BreakpointsOptions } from '../breakpoints';
/**
 * The system options for the jimu-theme.
 */
export interface ThemeSysOptions {
    /**
     * The color options for the jimu-theme.
     */
    color?: ModeBasedColorSchemeOptions;
    /**
     * The shape options for the jimu-theme.
     */
    shape?: ShapeOptions;
    /**
     * The shadow options for the jimu-theme.
     */
    shadow?: ShadowsOptions;
    /**
     * The spacing options for the jimu-theme.
     */
    spacing?: SpacingOptions;
    /**
     * The typography options for the jimu-theme.
     */
    typography?: TypographyOptions;
    /**
     * The transitions options for the jimu-theme.
     * @internal
     */
    transitions?: TransitionsOptions;
}
export interface ThemeOptions {
    breakpoints?: BreakpointsOptions;
    src?: ThemeSourceOptions;
    ref?: ThemeRefOptions;
    sys?: ThemeSysOptions;
    comp?: ThemeCompOptions;
    mixin?: ThemeMixinOptions;
}
/**
 * The theme options in json(`variables.json` in theme folder).
 */
export interface RawThemeOptions {
    /**
     * The source options for the jimu-theme.
     */
    src?: ThemeSourceOptions;
    /**
     * The reference options for the jimu-theme.
     */
    ref?: ThemeRefOptions;
    /**
     * The system options for the jimu-theme.
     */
    sys?: ThemeSysOptions;
    /**
     * The component options in json.
     * @internal
     */
    comp?: ThemeVariableCompOptions;
}
/**
 * The system variables for the jimu-theme.
 */
export interface ThemeSystem {
    /**
     * The color scheme variables.
     */
    color: ColorScheme;
    /**
     * The spacing function and variables.
     */
    spacing: Spacing;
    /**
     * The shadow variables.
     */
    shadow: Shadow;
    /**
     * The shape variables.
     */
    shape: Shape;
    /**
     * The typography variables.
     */
    typography: Typography;
    /**
     * The transitions variables.
     */
    transitions: Transitions;
}
/**
 * The theme variables object for the jimu-theme.
 */
export interface Theme {
    /**
     * The breakpoints variables
     */
    breakpoints: Breakpoints;
    /**
     * The source variables
     */
    src?: ThemeSource;
    /**
     * The reference variables
     */
    ref: ThemeReference;
    /**
     * The system variables
     */
    sys: ThemeSystem;
    /**
     * The mixin variables
     * @internal
     */
    mixin?: ThemeMixin;
    /**
     * The component variables
     * @internal
     */
    comp?: ThemeComponents;
}
declare const createTheme: (options?: ThemeOptions, mixin?: ThemeMixin, runtimeThemeMode?: ColorSchemeMode) => Theme;
export default createTheme;
