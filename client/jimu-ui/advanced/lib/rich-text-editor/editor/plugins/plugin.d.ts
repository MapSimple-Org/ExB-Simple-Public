import { React } from 'jimu-core';
import type { Editor, RichSelection, Formats, RichTextFormatKeys, FormatType } from '../../type';
export interface RichPluginRequiredProps {
    /**
     * The editor instance from `RihTextEditor` component.
     * Note: This property will be automatically inserted when you pass as the editor's `plugin` props, otherwise, use `editorRef` to get it.
     */
    editor: Editor;
    /**
     * The format of the current selection, used to activate the relevant ui of the current formats setting.
     * Note: This property will be automatically inserted when you pass as the editor's `plugin` props, otherwise, call `useEditorSelectionFormats` to get it.
     */
    formats: Formats;
    /**
     * The current selection in the rich text editor.
     * Note: This property will be automatically inserted when you pass as the editor's `plugin` props, otherwise, call `useEditorSelectionFormats` to get it.
     */
    selection: RichSelection;
    /**
     * Callback when text change.
     */
    onChange?: (text: string) => void;
}
export interface RichEditorPluginProps {
    /**
     * The editor instance from `RihTextEditor` component.
     */
    editor: Editor;
    /**
     * Render function or node.
     */
    children?: React.ReactNode | ((props: RichPluginRequiredProps) => React.ReactNode);
}
/**
 * Gets the processed formats
 * @param editor
 * @param selection
 */
export declare const getUnexceptionalFormats: (editor: Editor, selection: RichSelection) => Formats;
/**
 * Listening for change events，return the preprocessed selection and formats.
 * For formats, handle unexpected format value:
 *  - Unrecognized formats value (e.g. formats brought by paste)
 *  - Multiple values for the same format
 * For selection, only respond to the change event when the editor has focus
 * @param editor
 * @param useAllSection if `true`, use all contents as section when editor is not enabled.
 */
export declare const useEditorSelectionFormats: (editor: Editor, useAllSection?: boolean) => [Formats, RichSelection];
export interface FormatParams {
    type: FormatType;
    key: RichTextFormatKeys;
    value: any;
}
export declare const RichEditorPlugin: (props: RichEditorPluginProps) => React.ReactElement<any>;
