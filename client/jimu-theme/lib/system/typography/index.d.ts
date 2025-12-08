import type { CSSProperties } from '../../__emotion__';
import type { FontStyle, ReferenceTypeface } from '../reference';
/**
 * The variant of the typography in the jimu-theme.
 */
export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'title1' | 'title2' | 'title3' | 'inputField' | 'body' | 'label1' | 'label2' | 'label3';
export declare const TypographyVariants: TypographyVariant[];
/**
 * The style of the a typography variant.
 */
export interface TypographyStyle extends Omit<CSSProperties, '@font-face'> {
    /**
     * The font family for the typography variant.
     */
    fontFamily?: string;
    /**
     * The font size for the typography variant.
     */
    fontSize?: string | number;
    /**
     * The font weight for the typography variant.
     */
    fontWeight?: string | number;
    /**
     * The line height for the typography variant.
     */
    lineHeight?: string | number;
    /**
     * The font style for the typography variant.
     */
    fontStyle?: string;
}
/**
 * The options for the typography of the jimu-theme.
 */
export interface TypographyOptions extends Partial<{
    [key in TypographyVariant]: TypographyStyle;
}> {
    allVariants?: React.CSSProperties;
}
/**
 * The utility functions for the typography of the jimu-theme.
 */
export interface TypographyUtils {
    /**
     * Convert pixels to rems.
     */
    pxToRem: (px: number | string) => string;
    /**
     * Convert rems to pixels.
     */
    remToPx: (rem: number | string) => string;
}
/**
 * The typography variables for the jimu-theme.
 */
export interface Typography extends Record<TypographyVariant, TypographyStyle>, Readonly<FontStyle>, TypographyUtils {
}
declare const createTypography: (typeface: ReferenceTypeface, options?: TypographyOptions) => Typography;
export default createTypography;
