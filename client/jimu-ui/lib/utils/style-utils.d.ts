import { type StyleSettings, type BorderStyle, type FourSidesUnit, type BoxShadowStyle, type WidthStyle, type HeightStyle, type BackgroundStyle, type TextFontStyle } from '../types';
import type { IconButtonStyles, IconButtonStylesByState } from '../components/navigation';
interface BorderType {
    border?: BorderStyle;
    borderLeft?: BorderStyle;
    borderRight?: BorderStyle;
    borderTop?: BorderStyle;
    borderBottom?: BorderStyle;
}
export declare const expandStyleArray: (dataArray: number[]) => [number, number, number, number];
export declare const toCSSBorder: (borderStyle: BorderStyle) => string;
export declare const toCSSMargin: (marginStyle: FourSidesUnit) => string;
export declare const toCSSPadding: (paddingStyle: FourSidesUnit) => string;
export declare const toCSSBoxshadow: (boxShadow: BoxShadowStyle) => string;
export declare const toCSSBorderRadius: (borderRadius: FourSidesUnit) => string;
export declare const toCSSWidth: (widthStyle: WidthStyle) => string;
export declare const toCSSHeight: (heightStyle: HeightStyle) => string;
export declare const toCSSTextAlign: (text: Partial<TextFontStyle>) => any;
export declare const toCSSTextUnderLine: (text: Partial<TextFontStyle>) => "none" | "line-through" | "underline" | "underline line-through";
export declare const toCSSTextFontStyle: (text: Partial<TextFontStyle>) => "normal" | "italic";
type FontWeightProperty = 'bold' | 'normal';
export declare const toCSSTextFontWeight: (text: Partial<TextFontStyle>) => FontWeightProperty;
export declare const toCSSTextFontSize: (text: Partial<TextFontStyle>) => string;
export declare const toCSSTextFontFamily: (text: TextFontStyle) => string;
export declare const toCSSTextColor: (text: TextFontStyle) => string;
export declare const toCSSTextStyle: (text: TextFontStyle, containDefaultFontStyle?: boolean) => React.CSSProperties;
export declare const resolveTextStyle: (text?: TextFontStyle) => import("jimu-core").SerializedStyles;
export declare function toCSSTransform(transform: any): string;
export declare const toCSSStyle: (styleSettings: StyleSettings, containDefaultFontStyle?: boolean) => {};
export declare const toBackgroundStyle: ({ color, image, fillType }: BackgroundStyle) => {
    backgroundImage: string;
    backgroundColor: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    backgroundSize: string;
};
export declare const toBackgroundEmotionStyle: ({ color, image, fillType }: BackgroundStyle) => import("jimu-core").SerializedStyles;
export declare const remToPixel: (pxValue: string, base?: string) => string;
/**
 * The following methods are for navigation only
 */
export declare const getButtonIconStyle: (variant: IconButtonStyles, useForNavLink?: boolean) => import("jimu-core").SerializedStyles;
export declare const getButtonStyleByState: (variants: IconButtonStylesByState, useForNavLink?: boolean) => import("jimu-core").SerializedStyles;
/**
 * MixIn two borderRadius
 * If both borderRadius have the same type (shorthand or non-shorthand), will return mixin values.
 * If the types differ, return @borderRadiusOfDynamicStyle.
 */
export declare function mixinBorderRadiusWithDynamicStyle(borderRadiusOfDynamicStyle: FourSidesUnit, borderRadius: FourSidesUnit): FourSidesUnit;
/**
 * Mixin border
 * If both border have the same type (shorthand or non-shorthand: either both have borders or both do not), will return mixin value.
 * If the types differ, return @borderOfDynamicStyle.
 */
export declare function mixinBorderWithDynamicStyle(borderOfDynamicStyle: BorderType, border: BorderType): BorderType;
export declare const cssPropertiesToString: (cssProperties: React.CSSProperties) => string;
export {};
