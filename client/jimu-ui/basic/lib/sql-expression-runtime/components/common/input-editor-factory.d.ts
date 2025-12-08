import { type DataSource, type CodedValue, ClauseOperator, SqlExpressionMode, type SqlClause, ClauseSourceType, type ClauseValueOptions, type ClauseValuePair, type SqlClauseSet, type IMFieldSchema, type IMGroupSqlExpression } from 'jimu-core';
import { ClauseInputEditor } from './default';
import type { InputEditorProps } from './input-editor-render';
export declare function getInputEditor(props: InputEditorProps): import("@emotion/react/jsx-runtime").JSX.Element;
export declare function getDefaultClauseValObj(sourceType?: ClauseSourceType, inputEditor?: string, value?: ClauseValuePair[], isValid?: boolean, inputEditorAtRuntime?: string): ClauseValueOptions;
export declare function getDefaultSingleClause(): SqlClause;
export declare function getDefaultClauseSet(): SqlClauseSet;
export declare function isCaseSensitiveSupportedByOperatorAndSourceType(operator: ClauseOperator, sourceType: ClauseSourceType): boolean;
export declare function isAskForValueSupportedByOperatorAndSourceType(operator: ClauseOperator, sourceType: ClauseSourceType): boolean;
export declare function getCodedValueInputEditorsByOperatorAndSourceType(operator: ClauseOperator, sourceType: ClauseSourceType): ClauseInputEditor[];
export declare function getClauseValObjByOperator(operator: ClauseOperator, dataSource?: DataSource, jimuFieldName?: string): ClauseValueOptions;
export type ClauseDisplayFormat = {
    [sourceType in ClauseSourceType]?: ClauseInputEditor[];
};
export interface ClauseDisplayTypesAndCodedValues {
    ['displayTypes']: ClauseDisplayFormat;
    ['displayTypesAtRuntime']: ClauseDisplayFormat;
    ['codedValues']: CodedValue[];
    ['defaultSourceType']: ClauseSourceType;
    ['defaultInputEditorType']: ClauseInputEditor;
}
export declare function getDisplayTypes(mode: SqlExpressionMode, field: IMFieldSchema, operator: ClauseOperator, dataSource: DataSource, jimuFieldName: string): ClauseDisplayTypesAndCodedValues;
export interface InputEditorTypesAndCodedValues {
    inputEditorTypes: ClauseInputEditor[];
    inputEditorTypesAtRuntime: ClauseInputEditor[];
    codedValues: CodedValue[];
}
export declare function getInputEditorListByOperatorAndSourceType(operator: ClauseOperator, sourceType?: ClauseSourceType, dataSource?: DataSource, jimuFieldName?: string): InputEditorTypesAndCodedValues;
/**
 * Get default group expression by dataSource list.
 */
export declare function getDefaultGroupExpression(dataSources: DataSource[], field?: IMFieldSchema): IMGroupSqlExpression;
/**
 * Get updated group expression when adding/remove one ds.
 */
export declare function getUpdatedGroupExpression(expression: IMGroupSqlExpression, useDss: any, isAdded?: boolean, usedFields?: string[]): IMGroupSqlExpression;
