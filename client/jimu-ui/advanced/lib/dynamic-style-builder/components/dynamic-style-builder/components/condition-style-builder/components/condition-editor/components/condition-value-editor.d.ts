/** @jsx jsx */
import { JimuFieldType, React, type ImmutableArray, type UseDataSource, type ExpressionReturnType, type IMDynamicStyleConditionInfo, type IMDynamicStyleConditionValueOptions } from 'jimu-core';
import { type ComponentExtraProps, type DynamicStyleReferenceValueSchemaInfo } from '../../../../../../../utils';
export interface ConditionValueEditorProps {
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    expressionReturnType: ExpressionReturnType;
    refValueSchemaInfo: DynamicStyleReferenceValueSchemaInfo;
    conditionInfo: IMDynamicStyleConditionInfo;
    onChange: (newConditionValueOptions: IMDynamicStyleConditionValueOptions) => void;
}
type FinalConditionValueEditorProps = ConditionValueEditorProps & ComponentExtraProps;
export declare const StringJimuFieldTypes: ImmutableArray<JimuFieldType>;
export declare const NumberJimuFieldTypes: ImmutableArray<JimuFieldType>;
export declare const StringNumberJimuFieldTypes: ImmutableArray<JimuFieldType>;
export declare const ConditionValueEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalConditionValueEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "className" | "forwardedRef" | keyof ConditionValueEditorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
