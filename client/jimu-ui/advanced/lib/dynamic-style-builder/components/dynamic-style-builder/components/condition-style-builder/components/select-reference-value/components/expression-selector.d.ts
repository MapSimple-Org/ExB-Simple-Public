/** @jsx jsx */
import { React, type ImmutableArray, type Expression, type AdvancedExpression, type DynamicStyleExpressionType } from 'jimu-core';
import { type ComponentExtraProps } from '../../../../../../../utils';
export interface ExpressionSelectorProps {
    widgetDynamicContentCapability: 'none' | 'single' | 'multiple';
    expressions: Array<Expression | AdvancedExpression> | ImmutableArray<Expression | AdvancedExpression>;
    selectedExpression: DynamicStyleExpressionType;
    onChange: (newExpression: Expression | AdvancedExpression) => void;
}
type FinalExpressionSelectorProps = ExpressionSelectorProps & ComponentExtraProps;
export declare const ExpressionSelector: React.ForwardRefExoticComponent<Pick<Omit<FinalExpressionSelectorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof ExpressionSelectorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
