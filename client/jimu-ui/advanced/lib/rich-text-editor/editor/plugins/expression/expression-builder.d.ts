import { React, type ImmutableArray } from 'jimu-core';
import type { Sources } from '../../../type';
import type { RichPluginRequiredProps } from '../plugin';
import type * as JimuExpressionBuilderModule from 'jimu-ui/advanced/expression-builder';
/**
 * The `RichExpressionBuilder` component props.
 */
export interface RichExpressionBuilderProps extends RichPluginRequiredProps, Omit<JimuExpressionBuilderModule.ExpressionBuilderProps, 'expression' | 'types' | 'onChange'> {
    /**
     * Defines the class names added to the component.
     */
    className?: string;
    /**
     * The builder contains three tabs, pass in `types` to show some of the tabs.
     * `ExpressionBuilderType` is enum type.
     *
     * ```ts
     * import { ExpressionBuilderType } from 'jimu-ui/advanced/expression-builder'
     * ```
     */
    types?: ImmutableArray<JimuExpressionBuilderModule.ExpressionBuilderType>;
    /**
     * Specify the trigger source when editing through the current component.
     */
    source?: Sources;
    /**
     * Whether to allow editing of expression tags
     */
    editable?: boolean;
    /**
     * Whether to automatically insert a space after the expression tag
     */
    autoInsertSpace?: boolean;
}
/**
 * The `RichExpressionBuilder` component is used to provide the user the ability to insert expressions to rich text editor in the form of popups,
 * which must be used with component `RichTextEditor`.
 */
export declare const RichExpressionBuilder: (props: RichExpressionBuilderProps) => React.ReactElement;
