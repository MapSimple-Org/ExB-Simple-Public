import { type Editor, type RichSelection, type UnprivilegedEditor, type EditorValue, type Sources, FormatType, type Formats, type DeltaValue, RichTextFormatKeys, type HeaderValue } from './type';
import { type IMThemeVariables } from 'jimu-core';
interface FormatParams {
    type: FormatType;
    key: RichTextFormatKeys;
    value: any;
    selection?: RichSelection;
    enabled?: boolean;
    source?: Sources;
}
export declare const getFixedPosition: (editor: Editor, index: number, length?: number) => DOMRect;
export declare const setEditorReadOnly: (editor: Editor, value: boolean) => void;
export declare const setEditorContents: (editor: Editor, value: EditorValue, source?: Sources) => void;
export declare const setEditorCursorEnd: (editor: Editor, source?: Sources) => void;
export declare const setEditorContentSelection: (editor: Editor, source?: Sources) => void;
export declare const setEditorSelection: (editor: Editor, range: RichSelection, source?: Sources) => void;
export declare const setEditorTabIndex: (editor: Editor, tabIndex: number) => void;
export declare const makeUnprivilegedEditor: (editor: Editor) => UnprivilegedEditor;
export declare const clearFormats: (editor: Editor, selection: RichSelection, source?: Sources) => void;
export declare const formatText: (editor: Editor, selection: RichSelection, formatParams: FormatParams, source?: Sources) => DeltaValue;
export declare const getFormat: (editor: Editor, range?: RichSelection, focus?: boolean) => Formats;
/**
 * Handle unexpected format value (such as the format brought by paste)
 * @param formats
 */
export declare const handlingExceptionalFormats: (formats: Formats) => Formats;
export declare const convertExceptionalLinkValue: (formats: Formats) => Formats;
export declare const isDelta: (value: any) => boolean;
export declare const isDeltaEqual: (prev: DeltaValue, next: DeltaValue) => boolean;
export declare const isEditorValueEqual: (prev: EditorValue, next: EditorValue) => boolean;
export declare const getThemeHeaderFormats: (theme: IMThemeVariables, headerValue: HeaderValue) => import("./type").StringMap;
export declare const mixinThemeTextFormats: (theme: IMThemeVariables, formats?: Formats) => Formats;
export declare const parseStyleString: (input?: string) => {
    [x: string]: any;
};
export {};
