import type { ImmutableObject, IMThemeVariables } from 'jimu-core';
import type { ImageParam } from './components/image-with-param';
export declare enum Alignment {
    Left = "left",
    Center = "center",
    Right = "right"
}
export declare enum IconPosition {
    Start = "start",
    End = "end"
}
export declare enum EsriSimpleLineSymbolStyle {
    esriSLSSolid = "esriSLSSolid",
    esriSLSDash = "esriSLSDash",
    esriSLSDot = "esriSLSDot",
    esriSLSDashDot = "esriSLSDashDot",
    esriSLSDashDotDot = "esriSLSDashDotDot"
}
export declare enum NormalLineType {
    SOLID = "solid",
    DASHED = "dashed",
    DOTTED = "dotted",
    DOUBLE = "double"
}
export type LineType = NormalLineType | EsriSimpleLineSymbolStyle;
export declare enum ThemeColors {
    PRIMARY = "primary",
    SECONDARY = "secondary",
    SUCCESS = "success",
    INFO = "info",
    WARNING = "warning",
    LIGHT = "light",
    DANGER = "danger",
    DARK = "dark",
    WHITE = "white"
}
export declare enum FillType {
    FIT = "fit",
    FILL = "fill",
    CENTER = "center",
    TILE = "tile",
    STRETCH = "stretch"
}
export declare enum DistanceUnits {
    PIXEL = "px",
    REM = "rem",
    EM = "em",
    VW = "vw",
    PERCENTAGE = "%"
}
/**
 * @deprecated use `DistanceUnits` instead.
 */
export declare enum UntiTypes {
    PIXEL = "px",
    REM = "rem",
    EM = "em",
    VW = "vw",
    PERCENTAGE = "%"
}
export declare enum BorderSides {
    TL = "TL",
    TR = "TR",
    BR = "BR",
    BL = "BL"
}
export declare enum Sides {
    T = "T",
    R = "R",
    B = "B",
    L = "L"
}
export interface LinearUnit {
    distance: number;
    unit: DistanceUnits;
}
export type IMLinearUnit = ImmutableObject<LinearUnit>;
export interface FourSidesUnit {
    unit: DistanceUnits;
    number: [number, number, number, number];
}
export interface BorderStyle {
    type?: NormalLineType;
    color?: string;
    width?: string | number;
}
export declare enum BoxShadowValues {
    OffsetX = "OFFSETX",
    OffsetY = "OFFSETY",
    BlurRadius = "BLUERADIUS",
    SpreadRadius = "SPREADRADIUS"
}
export interface BoxShadowStyle {
    offsetX: string;
    offsetY: string;
    blur: string;
    spread: string;
    color: string;
    presetStyle?: string;
}
export interface WidthStyle {
    value?: string;
}
export interface BackgroundStyle {
    color?: string;
    fillType: FillType;
    image?: ImageParam;
}
export type HeightStyle = WidthStyle;
export interface StyleSettings {
    backgroundColor?: string;
    textColor?: string;
    background?: BackgroundStyle;
    margin?: FourSidesUnit;
    padding?: FourSidesUnit;
    border?: BorderStyle;
    borderLeft?: BorderStyle;
    borderRight?: BorderStyle;
    borderTop?: BorderStyle;
    borderBottom?: BorderStyle;
    boxShadow?: BoxShadowStyle;
    borderRadius?: FourSidesUnit;
    width?: WidthStyle;
    height?: HeightStyle;
    text?: TextFontStyle;
    transform?: {
        rotate?: number;
    };
}
export declare enum FontFamilyValue {
    AVENIRNEXT = "Avenir Next",
    ARIAL = "Arial",
    CALIBRI = "Calibri",
    GEORGIA = "Georgia",
    IMPACT = "Impact",
    MICROSOFTYAHEI = "Microsoft YaHei",
    TAHOMA = "Tahoma",
    TIMESNEWROMAN = "Times New Roman",
    VERDANA = "Verdana"
}
export declare enum TextAlignValue {
    LEFT = "left",
    RIGHT = "right",
    CENTER = "center",
    JUSTIFY = "justify"
}
export type FontStyleKeys = 'bold' | 'italic' | 'underline' | 'strike' | 'color' | 'size' | 'background' | 'font' | 'letterspace' | 'linespace' | 'align';
export type FontStyleValues = boolean | string | FontFamilyValue | TextAlignValue;
export type TextFontStyle = {
    [x in FontStyleKeys]?: FontStyleValues;
};
export type IMTextFontStyle = ImmutableObject<TextFontStyle>;
export interface ThemeProps {
    theme: IMThemeVariables;
}
export interface ValidityResult {
    valid: boolean;
    msg?: string;
}
