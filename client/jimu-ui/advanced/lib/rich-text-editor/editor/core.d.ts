import { React } from 'jimu-core';
import type { EditorValue, Editor, DeltaValue, Sources, UnprivilegedEditor, RichSelection, Modules } from '../type';
export type CheckEditorOption = (options?: EditorOptions) => boolean;
/**
 * Changes to these properties cause the editor instance to be recreated
 * [Quill options documentation](https://quilljs.com/docs/configuration/).
 *
 * Note: We will use object.is to compare these values. When any value changes, the editor instance is recreated
 * So, unless you want the editor instance to be recreated, keep the same reference for these props
 *
 * Note2: If you want to control whether the editor is recreated or not by yourself, you can use the function `checkEditorOption`
 */
export interface EditorOptions {
    /**
     * Default: document.body
     * DOM Element or a CSS selector for a DOM Element, within which the editor’s ui elements (i.e. tooltips, etc.) should be confined. Currently, it only considers left and right boundaries.
     */
    bounds?: HTMLElement | string;
    /**
     *
     * Whitelist of formats to allow in the editor. See [Formats](https://quilljs.com/docs/formats/) for a complete list.
     * Custom formats should not be included in the array, instead they should be registered with the module's Quill export.
     */
    formats?: string[];
    /**
     * Collection of modules to include and respective options.
     * See [Modules](https://quilljs.com/docs/modules/) for more information.
     */
    modules?: Modules;
    /**
     * Two optional themes provided by quill.
     *
     * Note: We don't recommend using these themes by default, because it doesn't match the style of ExB.
     * If you want to use theme, please import the corresponding CSS manually: node_modules/quill/dist/quill.snow(or bubble).css
     * See the [docs on themes](https://quilljs.com/docs/themes/) for more information on including the required stylesheets.
     */
    editorTheme?: 'snow' | 'bubble';
    /**
     * If true, a pre tag is used for the editor area instead of the default div tag.
     * This prevents editor from collapsing continuous whitespaces on paste.
     */
    preserveWhitespace?: boolean;
    /**
     * Placeholder text to show when editor is empty.
     */
    placeholder?: string;
    /**
     * Whether to instantiate the editor to read-only mode.
     */
    readOnly?: boolean;
}
/**
 * The changes of these properties will not recreate editor instance, will call editor's API to modify it
 */
export interface EditorProps {
    /**
     * Set ability for user to edit, via input devices like the mouse or keyboard.
     * Does not affect capabilities of API calls, when the source is "api" or “silent”.
     *
     * Note: When readOnly is true, this property is not valid
     */
    enabled?: boolean;
    /**
     * Tab index to be applied to the DOM element.
     */
    tabIndex?: number;
}
/**
 * The RichEditorCore component props
 */
export interface RichEditorCoreProps extends EditorOptions, EditorProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    /**
     * Value for the editor as a controlled component.
     * Can be a string containing HTML or a [Delta](https://quilljs.com/docs/delta/).
     * Note:
     *  - due to limitations in quill.js, this is actually a semi-controlled mode, meaning that the edit is not prevented, but changing value will still replace the contents.
     *  - passing a Delta here, and then an HTML string, or vice-versa, will always trigger a change, regardless of whether they represent the same document.
     *  - ⚠️ Do not pass the delta object from the onChange event as value, as it will cause a loop.
     */
    value?: EditorValue;
    /**
     * The default value of this component. Use when the component is not controlled.
     * Initial value for the editor as an uncontrolled component.
     * Can be a string containing HTML or a [Delta](https://quilljs.com/docs/delta/).
     */
    defaultValue?: any;
    /**
     * A single React element that will be used as the editing area in place of the default, which is a <div>.
     * Note:
     *  - you cannot use a <textarea>, as it is not a supported target.
     *  - updating children is costly, as it will cause the editor to be recreated.
     */
    children?: never;
    /**
     * Called back with the new contents of the editor after change.
     * It will be passed the HTML contents of the editor, a delta object expressing the change, the source of the change, and finally a read-only proxy to editor accessors.
     */
    onChange?: (value: EditorValue, delta: DeltaValue, source: Sources, editor: UnprivilegedEditor) => any;
    /**
     * Called back with the new selected range, or null when unfocused.
     * It will be passed the selection range, the source of the change, and finally a read-only proxy to editor accessors.
     */
    onSelectionChange?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    /**
     * Called when the editor becomes focused. It will receive the new selection range.
     */
    onEditorFocus?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    /**
     * Called when the editor loses focus. It will receive the selection range it had right before losing focus.
     * Note: Clicking on other elements that don't accept input now won't trigger this method, if you want this, please use onBlur instead
     */
    onEditorBlur?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    /**
     * This is a function to determine whether an editor instance is recreated.
     * If defined, RichEditorCore will call this function with the editor options you passed in as parameters.
     * If true is returned, the instance will be recreated, otherwise not.
     *
     * Default: null
     *
     * Note: If not defined, use the default check by RichEditorCore
     * @param options: EditorOptions
     */
    checkEditorOption?: CheckEditorOption;
    /**
     * A ref that points to the used editor instance.
     */
    editorRef?: React.MutableRefObject<Editor> | ((Editor: any) => void);
    /**
     * Whether to focus automatically when creating.
     */
    autoFocus?: boolean;
}
/**
 * Changing these parameters will change the `version`,
 * Changing the `version` will recreate the editor instance
 * [Quill options documentation](https://quilljs.com/docs/configuration/).
 * @param options
 */
export declare const useVersion: ({ readOnly, modules, formats, bounds, editorTheme, preserveWhitespace, checkEditorOption }: EditorOptions & {
    checkEditorOption: CheckEditorOption;
}, initVersion?: number) => number;
export declare const RichEditorCore: React.ForwardRefExoticComponent<RichEditorCoreProps & React.RefAttributes<HTMLElement>>;
