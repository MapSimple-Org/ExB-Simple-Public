import type { ImmutableObject, ImmutableArray } from 'seamless-immutable';
import type { JimuFieldType } from './common';
import { type Expression, type IMExpression, type AdvancedExpression, type IMAdvancedExpression } from './expression';
import { type ClauseValuePair } from './sql-expression';
import type { ArcadeContentConfig } from './arcade-content';
import type { IconResult } from './app-config';
import type { BackgroundStyle, BorderStyle, FourSidesUnit } from 'jimu-ui';
export type DynamicStyleExpressionType = Expression | IMExpression | AdvancedExpression | IMAdvancedExpression;
export declare enum DynamicStyleCustomStatisticsMethod {
    Average = "AVERAGE",
    Count = "COUNT",
    Sum = "SUM",
    Max = "MAX",
    Min = "MIN"
}
export declare enum DynamicStyleReferenceValueSourceType {
    ImportFromDynamicContent = "IMPORT_FROM_DYNAMIC_CONTENT",
    CustomAttribute = "CUSTOM_ATTRIBUTE",
    CustomStatistics = "CUSTOM_STATISTICS"
}
export declare enum DynamicStyleCustomExpressionSourceType {
    CustomAttribute = "CUSTOM_ATTRIBUTE",
    CustomStatistics = "CUSTOM_STATISTICS"
}
export type ExpressionReturnType = JimuFieldType.String | JimuFieldType.Number;
export interface DynamicStyleReferenceValueInfo {
    refValueSourceType: DynamicStyleReferenceValueSourceType;
    expression: Expression | AdvancedExpression;
    expressionReturnType: ExpressionReturnType;
}
export type IMDynamicStyleReferenceValueInfo = ImmutableObject<DynamicStyleReferenceValueInfo>;
export declare enum DynamicStyleConditionOperator {
    StringOperatorIs = "STRING_OPERATOR_IS",
    StringOperatorIsNot = "STRING_OPERATOR_IS_NOT",
    StringOperatorContains = "STRING_OPERATOR_CONTAINS",
    StringOperatorIsBlank = "STRING_OPERATOR_IS_BLANK",
    StringOperatorIsNotBlank = "STRING_OPERATOR_IS_NOT_BLANK",
    NumberOperatorIs = "NUMBER_OPERATOR_IS",
    NumberOperatorIsNot = "NUMBER_OPERATOR_IS_NOT",
    NumberOperatorIsGreaterThan = "NUMBER_OPERATOR_IS_GREATER_THAN",
    NumberOperatorIsLessThan = "NUMBER_OPERATOR_IS_LESS_THAN",
    NumberOperatorIsBetween = "NUMBER_OPERATOR_IS_BETWEEN"
}
export declare enum DynamicStyleConditionSourceType {
    UserInput = "USER_INPUT",
    Field = "FIELD",
    Unique = "UNIQUE",
    Statistics = "STATISTICS"
}
export interface DynamicStyleConditionValueOptions {
    value: ClauseValuePair[];
    expression: Expression;
}
export type IMDynamicStyleConditionValueOptions = ImmutableObject<DynamicStyleConditionValueOptions>;
export interface DynamicStyleConditionInfo {
    operator: DynamicStyleConditionOperator;
    sourceType: DynamicStyleConditionSourceType;
    valueOptions: DynamicStyleConditionValueOptions;
}
export type IMDynamicStyleConditionInfo = ImmutableObject<DynamicStyleConditionInfo>;
export interface DynamicTextStyle {
    size?: string;
    color?: string;
    background?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
}
export type IMDynamicTextStyle = ImmutableObject<DynamicTextStyle>;
export declare enum DynamicIconPosition {
    Left = "LEFT",// Make sure the value is 'LEFT'/'RIGHT' so it is compatible with Button
    Right = "RIGHT"
}
export interface DynamicIconStyle {
    data?: IconResult;
    position?: DynamicIconPosition;
    size?: number;
    color?: string;
}
export type IMDynamicIconStyle = ImmutableObject<DynamicIconStyle>;
export interface DynamicBorderStyle {
    border?: BorderStyle;
    borderLeft?: BorderStyle;
    borderRight?: BorderStyle;
    borderTop?: BorderStyle;
    borderBottom?: BorderStyle;
}
export type IMDynamicBorderStyle = ImmutableObject<DynamicBorderStyle>;
export interface DynamicStyle {
    background?: BackgroundStyle;
    text?: DynamicTextStyle;
    border?: DynamicBorderStyle;
    borderRadius?: FourSidesUnit;
    icon?: DynamicIconStyle;
}
export type IMDynamicStyle = ImmutableObject<DynamicStyle>;
export declare enum DynamicStyleType {
    Background = "BACKGROUND",
    Text = "TEXT",
    Border = "BORDER",
    BorderRadius = "BorderRadius",
    Icon = "ICON"
}
export type IMDynamicStyleTypes = ImmutableArray<DynamicStyleType>;
export interface SingleConditionStyleConfig {
    id: number;
    condition?: DynamicStyleConditionInfo;
    style?: DynamicStyle;
}
export type IMSingleConditionStyleConfig = ImmutableObject<SingleConditionStyleConfig>;
export interface ConditionStyleConfig {
    refValueInfo: DynamicStyleReferenceValueInfo;
    items: SingleConditionStyleConfig[];
}
export type IMConditionStyleConfig = ImmutableObject<ConditionStyleConfig>;
export type ArcadeStyleConfig = Omit<ArcadeContentConfig, 'valueType'>;
export type IMArcadeStyleConfig = ImmutableObject<ArcadeStyleConfig>;
export declare enum DynamicStyleSourceType {
    Condition = "CONDITION",
    Arcade = "ARCADE"
}
export interface DynamicStyleConfig {
    sourceType: DynamicStyleSourceType;
    conditionConfig?: ConditionStyleConfig;
    arcadeConfig?: ArcadeStyleConfig;
}
export type IMDynamicStyleConfig = ImmutableObject<DynamicStyleConfig>;
