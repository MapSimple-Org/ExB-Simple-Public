import { React } from 'jimu-core';
import { type RichEditorCoreProps } from './core';
import { type RichPluginRequiredProps } from './plugins/plugin';
export type RenderPlugin = ((props: RichPluginRequiredProps) => React.ReactNode);
export interface PluginProps {
    /**
     * A plugin for formatting that is rendered on top of the rich text editor.
     */
    plugin?: RenderPlugin;
}
/**
 * The `RichTextEditor` component props
 */
export type RichTextEditorProps = RichEditorCoreProps & PluginProps & {
    /**
     * Whether to keep the text in the editor on a single line.
     */
    nowrap?: boolean;
};
/**
 * The `RichTextEditor` component is used to provide the user the ability to edit rich text.
 * `RichTextEditor` relies on the 3rd party library [Quill](https://github.com/quilljs/quill).
 */
export declare const RichTextEditor: (props: RichTextEditorProps) => React.ReactElement;
