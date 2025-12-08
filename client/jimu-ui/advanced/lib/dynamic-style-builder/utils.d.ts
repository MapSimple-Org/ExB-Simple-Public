import { type WidgetJson, type IMThemeVariables, type IntlShape, type ImmutableObject, type ImmutableArray, type Expression, type ClauseValuePair, type IMDynamicStyleConditionValueOptions, type IMDynamicStyleConditionInfo, type DynamicStyleConditionInfo, type IMDynamicTextStyle, type IMSingleConditionStyleConfig, type IMDynamicIconStyle, type IMDynamicBorderStyle, type IMDynamicStyle, type IMConditionStyleConfig, type IMDynamicStyleConfig, type DataSource, type IMFieldSchema, type CodedValue } from 'jimu-core';
import type { BackgroundStyle, FourSidesUnit } from 'jimu-ui';
export interface ComponentExtraProps {
    /**
     * @ignore
     */
    theme: IMThemeVariables;
    /**
     * @ignore
     */
    intl: IntlShape;
    className?: string;
}
export interface DynamicStyleReferenceValueSchemaInfo {
    dataSource: DataSource;
    dataSourceForSqlInputEditorRender: DataSource;
    jimuFieldName?: string;
    fieldSchema?: IMFieldSchema;
    codedValues?: CodedValue[];
}
export declare function getWidgetJson(widgetId: string): ImmutableObject<WidgetJson>;
export declare function asMutableObject<T>(input: T | ImmutableObject<T>): T;
export declare function asMutableArray<T>(input: T[] | ImmutableArray<T>): T[];
export declare function isValueEmpty(v: any): boolean;
export declare function isObjectEmpty(obj: {
    [key: string]: any;
}): boolean;
export declare function getDefaultIMConditionValueOptions(value: ClauseValuePair[], expression: Expression): IMDynamicStyleConditionValueOptions;
export declare function getDefaultIMConditionInfo(): IMDynamicStyleConditionInfo;
export declare function getDefaultIMBackgroundStyle(): ImmutableObject<BackgroundStyle>;
export declare function getDefaultIMFourSidesUnit(): ImmutableObject<FourSidesUnit>;
export declare function getDefaultIMDynamicTextStyle(): IMDynamicTextStyle;
export declare function getDefaultIMDynamicIconStyle(): IMDynamicIconStyle;
export declare function getDefaultIMDynamicBorderStyle(): IMDynamicBorderStyle;
export declare function getDefaultIMDynamicStyle(): IMDynamicStyle;
export declare function getDefaultIMSingleConditionStyleConfig(id: number, condition: DynamicStyleConditionInfo | IMDynamicStyleConditionInfo): IMSingleConditionStyleConfig;
export declare function getDefaultIMConditionStyleConfig(): IMConditionStyleConfig;
export declare function getDefaultIMDynamicStyleBuilderConfig(): IMDynamicStyleConfig;
