/** @jsx jsx */
import { React, type UseDataSource, Immutable, type WidgetJson } from 'jimu-core';
import type { Editor, Formats, RichSelection } from 'jimu-ui/advanced/rich-text-editor';
import type { ExpressionBuilderType as ExpBuilderType } from 'jimu-ui/advanced/expression-builder';
export interface DynamicUrlEditorProps {
    className?: string;
    editorRef?: React.MutableRefObject<Editor> | ((Editor: any) => void);
    useDataSourcesEnabled: boolean;
    useDataSources: Immutable.ImmutableArray<UseDataSource>;
    widgetId: string;
    value: string;
    selectWidgets?: WidgetJson[];
    onChange: (e: string) => void;
}
export type DynamicUrlEditorWrapperProps = DynamicUrlEditorProps & {
    RichExpressionBuilder: (props: any) => React.ReactElement;
    useEditorSelectionFormats: (editor: any, useAllSection?: boolean) => [Formats, RichSelection];
    richTextEditorUtils: any;
    RichEditorCore: any;
    ExpressionBuilderType: typeof ExpBuilderType;
    Delta: any;
    useMixinKeyboardEnterModules: any;
};
export declare const DynamicUrlEditorComponent: (props: DynamicUrlEditorWrapperProps) => React.ReactElement;
export declare const DynamicUrlEditor: import("@emotion/styled").StyledComponent<DynamicUrlEditorProps, {}, {}>;
