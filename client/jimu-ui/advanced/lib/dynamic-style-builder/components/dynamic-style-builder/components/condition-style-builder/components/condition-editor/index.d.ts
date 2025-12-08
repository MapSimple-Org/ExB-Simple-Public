/** @jsx jsx */
import { React, type ImmutableArray, type UseDataSource, type IMDynamicStyleReferenceValueInfo, type ExpressionReturnType, type DynamicStyleConditionInfo, type IMDynamicStyleConditionInfo } from 'jimu-core';
import { type ComponentExtraProps, type DynamicStyleReferenceValueSchemaInfo } from '../../../../../../utils';
export interface ConditionEditorProps {
    className?: string;
    widgetId: string;
    useDataSources: ImmutableArray<UseDataSource>;
    refValueInfo: IMDynamicStyleReferenceValueInfo;
    refValueSchemaInfo: DynamicStyleReferenceValueSchemaInfo;
    expressionReturnType: ExpressionReturnType;
    conditionInfo: DynamicStyleConditionInfo | IMDynamicStyleConditionInfo;
    onChange: (newConditionInfo: IMDynamicStyleConditionInfo) => void;
}
type FinalConditionEditorProps = ConditionEditorProps & ComponentExtraProps;
export declare const ConditionEditor: React.ForwardRefExoticComponent<Pick<Omit<FinalConditionEditorProps, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, "widgetId" | "useDataSources" | "className" | "onChange" | "forwardedRef" | "refValueInfo" | "expressionReturnType" | "conditionInfo" | "refValueSchemaInfo"> & {
    theme?: import("jimu-core").IMThemeVariables;
}>;
export {};
