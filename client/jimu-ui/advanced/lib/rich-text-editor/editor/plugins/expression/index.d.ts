/** @jsx jsx */
import { React } from 'jimu-core';
import { type RichExpressionBuilderProps } from './expression-builder';
import { type FloatingPanelProps, type PanelHeaderProps } from 'jimu-ui';
/**
 * The `RichExpressionBuilderPopper` component props.
 */
export interface RichExpressionBuilderPopperProps extends RichExpressionBuilderProps, Omit<FloatingPanelProps, 'reference' | 'children' | 'onChange'> {
    header?: PanelHeaderProps;
}
/**
 * The `RichExpressionBuilderPopper` component is used to provide the user the ability to insert expressions to rich text editor,
 * which must be used with component `RichTextEditor`.
 */
export declare const RichExpressionBuilderPopper: React.ForwardRefExoticComponent<RichExpressionBuilderPopperProps & React.RefAttributes<HTMLDivElement>>;
export { RichExpressionBuilder, type RichExpressionBuilderProps } from './expression-builder';
