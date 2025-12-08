/** @jsx jsx */
import { React, type ImmutableObject, type ImmutableArray, type UseDataSource, type Expression, DynamicStyleCustomExpressionSourceType } from 'jimu-core';
import type { ComponentExtraProps } from '../../../../../../../utils';
export interface CustomExpressionProps {
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    sourceType: DynamicStyleCustomExpressionSourceType;
    hideConditionIndicatorCustomAttributeDsViewSelector?: boolean;
    hideConditionIndicatorCustomStatistics?: boolean;
    expression: Expression | ImmutableObject<Expression>;
    onChange: (sourceType: DynamicStyleCustomExpressionSourceType, expression: Expression) => void;
}
export type FinalCustomExpressionProps = CustomExpressionProps & ComponentExtraProps;
export declare const CustomExpression: React.ForwardRefExoticComponent<Pick<Omit<FinalCustomExpressionProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof CustomExpressionProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
