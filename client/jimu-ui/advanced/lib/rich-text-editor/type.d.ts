import type { TextFontStyle } from 'jimu-ui';
import type { ImmutableObject, LinkParam } from 'jimu-core';
import type { DeltaValue, Editor, EmitterSource } from './quill';
export interface StringMap {
    [key: string]: any;
}
export type { EventType, Editor, DeltaValue, Operation, RichSelection, ClipboardStatic, KeyboardStatic } from './quill';
/**
 * Types of values supported by the rich text editor
 */
export type EditorValue = DeltaValue | string;
export type IMLinkParamMap = ImmutableObject<{
    [id: string]: LinkParam;
}>;
export declare enum FormatType {
    INLINE = 0,
    BLOCK = 1,
    EMBED = 2
}
export type Formats = StringMap;
export type IMFormats = ImmutableObject<Formats>;
export type Modules = StringMap;
export type IMModules = ImmutableObject<Modules>;
export interface UnprivilegedEditor extends Pick<Editor, 'focus' | 'blur' | 'getLength' | 'getText' | 'getContents' | 'getSelection' | 'getBounds' | 'getFormat' | 'getIndex' | 'getLeaf' | 'getSemanticHTML'> {
    getHTML: () => string;
}
export type Sources = EmitterSource;
export declare enum RichTextFormatKeys {
    Bold = "bold",
    Italic = "italic",
    Underline = "underline",
    Strike = "strike",
    Color = "color",
    Background = "background",
    Font = "font",
    Size = "size",
    Letterspace = "letterspace",
    Linespace = "linespace",
    Textshadow = "textshadow",
    Align = "align",
    Blockquote = "blockquote",
    Code = "code",
    Header = "header",
    Indent = "indent",
    Link = "link",
    List = "list",
    Expression = "expression",
    Image = "image"
}
export declare enum ListValue {
    BULLET = "bullet",
    ORDERED = "ordered"
}
export declare enum HeaderValue {
    Paragraph = 0,
    H1 = 1,
    H2 = 2,
    H3 = 3,
    H4 = 4,
    H5 = 5,
    H6 = 6
}
export declare enum IndentValue {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8
}
export type RichTextStyle = TextFontStyle;
export type IMRichTextStyle = ImmutableObject<RichTextStyle>;
