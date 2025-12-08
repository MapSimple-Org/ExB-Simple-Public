import type { ReferencePalette, ReferencePaletteFullColor } from '../reference/palette';
/**
 * The mode of the color scheme.
 */
export type ColorSchemeMode = 'light' | 'dark';
/**
 * The mode-based color scheme options for the jimu-theme.
 */
export interface ModeBasedColorSchemeOptions {
    /**
     * The mode of the color scheme.
     */
    mode: ColorSchemeMode;
    /**
     * The light mode color scheme options.
     */
    light?: Partial<ColorSchemeOptions>;
    /**
     * The dark mode color scheme options.
     */
    dark?: Partial<ColorSchemeOptions>;
}
export type BrandFunctionColors = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export declare const BrandFunctionColorNames: BrandFunctionColors[];
export declare const isBrandFunctionColor: (color: BrandFunctionColors | (string & {})) => boolean;
/**
 * The interface for surface colors, including background, paper, overlay, header, and footer.
 */
export interface SurfaceColor {
    /**
     * The color used for the page background.
     */
    background: string;
    /**
     * The color used for the page background text.
     */
    backgroundText: string;
    /**
     * The color used for the secondary/hint text.
     */
    backgroundHint: string;
    /**
     * The color used for the paper (panel container) background.
     */
    paper: string;
    /**
     * The color used for the paper (panel container) text.
     */
    paperText: string;
    /**
     * The color used for the paper (panel container) secondary/hint text.
     */
    paperHint: string;
    /**
     * The color used for the the background of the top container or the background of the UI collection in the paper.
     */
    overlay: string;
    /**
     * The color used for the overlay text.
     */
    overlayText: string;
    /**
     * The color used for the overlay secondary/hint text.
     */
    overlayHint: string;
    /**
     * The color used for the header background.
     */
    header: string;
    /**
     * The color used for the header text.
     */
    headerText: string;
    /**
     * The color used for the header secondary/hint text.
     */
    headerHint: string;
    /**
     * The color used for the footer background.
     */
    footer: string;
    /**
     * The color used for the footer text.
     */
    footerText: string;
    /**
     * The color used for the footer secondary/hint text.
     */
    footerHint: string;
}
/**
 * The interface for the selected colors of the interactive elements.
 */
export interface ActionSelected {
    /**
     * The color used for the selected state.
     */
    default: string;
    /**
     * The color used for the hover state of the selected element.
     */
    hover: string;
    /**
     * The color used for the text on the selected element.
     */
    text: string;
}
/**
 * The interface for the disabled colors of the interactive elements.
 */
export interface ActionDisabled {
    /**
     * The color used for the element with disabled state.
     */
    default: string;
    /**
     * The color used for the text on the disabled element.
     */
    text: string;
}
/**
 * The interface for the colors of link.
 */
export interface ActionLink {
    /**
     * The color used for the link.
     */
    default: string;
    /**
     * The color used for the hover state of the link.
     */
    hover: string;
    /**
     * The color used for the visited state of the link.
     */
    visited: string;
}
/**
 * The interface for the colors of input field element.
 */
export interface ActionInputField {
    /**
     * The color used for the input field.
     */
    default: string;
    /**
     * The color used for the text in the input field.
     */
    text: string;
    /**
     * The color used for the placeholder text in the input field.
     */
    placeholder: string;
}
/**
 * The interface for the colors of interactive elements.
 */
export interface ActionColor {
    /**
     * The color used for the default state of an interactive element.
     */
    default: string;
    /**
     * The color used for the hover state of an interactive element.
     */
    hover: string;
    /**
     * The color used for the pressed state of an interactive element.
     */
    pressed: string;
    /**
     * The color used for the text on an interactive element.
     */
    text: string;
    /**
     * The color used for the focus state when an interactive element is focused by keyboard.
     */
    focus: string;
    /**
     * The color used for the selected state of an interactive element.
     */
    selected: ActionSelected;
    /**
     * The colors used for the disabled state of an interactive element.
     */
    disabled: ActionDisabled;
    /**
     * The colors used for the link element.
     */
    link: ActionLink;
    /**
     * The colors used for the input field element.
     */
    inputField: ActionInputField;
}
/**
 * The options for the selected colors of the interactive elements.
 */
export interface ActionSelectedOptions {
    /**
     * The color used for the selected state.
     */
    default?: string;
    /**
     * The color used for the hover state of the selected element.
     */
    hover?: string;
    /**
     * The color used for the text on the selected element.
     */
    text?: string;
}
/**
 * The options for the disabled colors of the interactive elements.
 */
export interface ActionDisabledOptions {
    /**
     * The color used for the element with disabled state.
     */
    default?: string;
    /**
     * The color used for the text on the disabled element.
     */
    text?: string;
}
/**
 * The options for the colors of link.
 */
export interface ActionLinkOptions {
    /**
     * The color used for the link.
     */
    default?: string;
    /**
     * The color used for the hover state of the link.
     */
    hover?: string;
    /**
     * The color used for the visited state of the link.
     */
    visited?: string;
}
/**
 * The options for the colors of input field element.
 */
export interface ActionInputFieldOptions {
    /**
     * The color used for the input field.
     */
    default?: string;
    /**
     * The color used for the text in the input field.
     */
    text?: string;
    /**
     * The color used for the placeholder text in the input field.
     */
    placeholder?: string;
}
/**
 * The color options for the action color.
 */
export interface ActionColorOption {
    /**
     * The color options for the default state of an interactive element.
     */
    default?: string;
    /**
     * The color options for the hover state of an interactive element.
     */
    hover?: string;
    /**
     * The color options for the pressed state of an interactive element.
     */
    pressed?: string;
    /**
     * The color options for the text on an interactive element.
     */
    text?: string;
    /**
     * The color options for the focus state when an interactive element is focused by keyboard.
     */
    focus?: string;
    /**
     * The color options for the selected state of an interactive element.
     */
    selected?: ActionSelectedOptions;
    /**
     * The color options for the disabled state of an interactive element.
     */
    disabled?: ActionDisabledOptions;
    /**
     * The color options for the link element.
     */
    link?: ActionLinkOptions;
    /**
     * The color options for the input field element.
     */
    inputField?: ActionInputFieldOptions;
}
/**
 * The interface for the divider colors.
 */
export interface DividerColor {
    /**
     * The color used for the primary divider.
     */
    primary: string;
    /**
     * The color used for the secondary divider.
     */
    secondary: string;
    /**
     * The color used for the tertiary divider.
     */
    tertiary: string;
    /**
     * The color used for the border of input field.
     */
    inputField: string;
    /**
     * The color used for the switch divider.
     */
    switch: string;
}
/**
 * The interface for a specific color scheme.
 */
export interface SchemeColor {
    /**
     * The color used for the light variant.
     */
    light: string;
    /**
     * The default color used for the main variant.
     */
    main: string;
    /**
     * The color used for the dark variant.
     */
    dark: string;
    /**
     * The color used for the text variant.
     */
    text: string;
}
/**
 * The color scheme interface.
 */
export interface ColorScheme {
    /**
     * The palette mode, can be light or dark.
     */
    mode: ColorSchemeMode;
    /**
     * The colors used to represent primary interface elements for a user.
     */
    primary: SchemeColor;
    /**
     * The colors used to represent secondary interface elements for a user.
     */
    secondary: SchemeColor;
    /**
     * The colors used to represent interface elements that the user should be made aware of.
     */
    error: SchemeColor;
    /**
     * The colors used to represent potentially dangerous or important messages.
     */
    warning: SchemeColor;
    /**
     * The colors used to present information to the user that is neutral and not necessarily important.
     */
    info: SchemeColor;
    /**
     * The colors used to indicate the successful completion of an action that user triggered.
     */
    success: SchemeColor;
    /**
     * The colors used to present the background and text.
     */
    surface: SurfaceColor;
    /**
     * The colors used to present background and text for various states of the action.
     */
    action: ActionColor;
    /**
     *  The colors used to present dividing lines or border lines.
     */
    divider: DividerColor;
}
/**
 * The options for the color scheme.
 */
export interface ColorSchemeOptions {
    /**
     * The mode of this color scheme.
     */
    mode?: ColorSchemeMode;
    /**
     * The color scheme options for the primary color.
     */
    primary?: Partial<SchemeColor>;
    /**
     * The color scheme options for the secondary color.
     */
    secondary?: Partial<SchemeColor>;
    /**
     * The color scheme options for the error color.
     */
    error?: Partial<SchemeColor>;
    /**
     * The color scheme options for the warning color.
     */
    warning?: Partial<SchemeColor>;
    /**
     * The color scheme options for the info color.
     */
    info?: Partial<SchemeColor>;
    /**
     * The color scheme options for the success color.
     */
    success?: Partial<SchemeColor>;
    /**
     * The color scheme options for the surface color.
     */
    surface?: Partial<SurfaceColor>;
    /**
     * The color scheme options for the action color.
     */
    action?: ActionColorOption;
    /**
     * The color scheme options for the divider color.
     */
    divider?: Partial<DividerColor>;
}
export declare const getSchemeColor: (palette: ReferencePaletteFullColor, mode: "light" | "dark") => SchemeColor;
export declare function augmentColor(color: Partial<SchemeColor>, name?: string): SchemeColor;
export default function createColorScheme(options: ModeBasedColorSchemeOptions, palette: ReferencePalette, runtimeThemeMode?: ColorSchemeMode): ColorScheme;
