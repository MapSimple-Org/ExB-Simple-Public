/**
 * The interface for the font style.
 */
export interface FontStyle {
    /**
     * The font family to be used, e.g. 'Avenir Next', 'Arial', etc.
     */
    fontFamily: React.CSSProperties['fontFamily'];
    /**
     * The base font size in pixels.
     */
    fontSize: number;
    /**
     * The light font weight value, typically 300.
     */
    fontWeightLight: React.CSSProperties['fontWeight'];
    /**
     * The regular font weight value, typically 400.
     */
    fontWeightRegular: React.CSSProperties['fontWeight'];
    /**
     * The medium font weight value, typically 500.
     */
    fontWeightMedium: React.CSSProperties['fontWeight'];
    /**
     * The semi-bold font weight value, typically 600.
     */
    fontWeightSemiBold: React.CSSProperties['fontWeight'];
    /**
     * The bold font weight value, typically 700.
     */
    fontWeightBold: React.CSSProperties['fontWeight'];
}
export interface CustomFont {
    name: string;
    url?: string;
}
/**
 * The interface for the reference typeface.
 */
export interface ReferenceTypeface extends FontStyle {
    /**
     * The font size for HTML elements, influencing the display of rem text.
     */
    htmlFontSize: string;
    /**
     * The list of custom fonts to be used in the theme.
     */
    customFonts?: CustomFont[];
}
/**
 * The options for the reference typeface.
 */
export type ReferenceTypefaceOptions = Partial<ReferenceTypeface>;
export declare const createReferenceTypeface: (options: ReferenceTypefaceOptions) => ReferenceTypeface;
