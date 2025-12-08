/** @jsx jsx */
import { React, type ImmutableArray, type UseDataSource, type Expression, type AdvancedExpression, type IMDynamicStyleTypes, type IMConditionStyleConfig } from 'jimu-core';
import { type ComponentExtraProps } from '../../../../utils';
export interface ConditionStyleBuilderProps {
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    widgetDynamicContentCapability: 'none' | 'single' | 'multiple';
    hideConditionIndicatorCustomAttributeDsViewSelector?: boolean;
    hideConditionIndicatorCustomStatistics?: boolean;
    configuredExpressionsLabel?: string;
    expressions: Array<Expression | AdvancedExpression> | ImmutableArray<Expression | AdvancedExpression>;
    dynamicStyleTypes: IMDynamicStyleTypes;
    config?: IMConditionStyleConfig;
    onChange: (config: IMConditionStyleConfig) => void;
}
type FinalConditionStyleBuilderProps = ConditionStyleBuilderProps & ComponentExtraProps;
export declare const ConditionStyleBuilder: React.ForwardRefExoticComponent<Pick<Omit<FinalConditionStyleBuilderProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof ConditionStyleBuilderProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
