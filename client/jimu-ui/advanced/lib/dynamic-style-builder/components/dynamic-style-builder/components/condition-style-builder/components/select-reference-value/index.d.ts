/** @jsx jsx */
import { React, type ImmutableArray, type UseDataSource, type Expression, type AdvancedExpression, type IMDynamicStyleReferenceValueInfo } from 'jimu-core';
import type { ComponentExtraProps } from '../../../../../../utils';
export interface SelectReferenceValueProps {
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    widgetDynamicContentCapability: 'none' | 'single' | 'multiple';
    hideConditionIndicatorCustomAttributeDsViewSelector?: boolean;
    hideConditionIndicatorCustomStatistics?: boolean;
    configuredExpressionsLabel?: string;
    expressions: Array<Expression | AdvancedExpression> | ImmutableArray<Expression | AdvancedExpression>;
    refValueInfo?: IMDynamicStyleReferenceValueInfo;
    onChange: (newRefValueInfo: IMDynamicStyleReferenceValueInfo) => void;
}
type FinalSelectReferenceValueProps = SelectReferenceValueProps & ComponentExtraProps;
export declare const SelectReferenceValue: React.ForwardRefExoticComponent<Pick<Omit<FinalSelectReferenceValueProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof SelectReferenceValueProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
