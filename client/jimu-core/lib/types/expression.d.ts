import type { FormatNumberOptions } from 'react-intl';
import type { ImmutableObject } from 'seamless-immutable';
import type { JimuFieldType } from './common';
import type { UseDataSource } from './app-config';
export interface BaseExpression {
    /**
     * Name of the expression.
     */
    name: string;
    /**
     * Expression parts.
     */
    parts: BaseExpressionPart[];
}
/**
 * Single expression.
 * A single expression may contain multiple parts.
 * For example,
 * ```
 * // avg({field1})
 * {
 *  name: 'exp1',
 *  parts: [
 *    { type: FUNCTION, exp: 'AVERAGE' },
 *    { type: OPERATOR, exp: '(' },
 *    { type: FIELD, exp: '{field1}', dataSourceId: ds1, jimuFieldName: field1 },
 *    { type: OPERATOR, exp: ')' }
 *   ]
 * }
 * ```
 */
export interface Expression {
    /**
     * Name of the expression.
     */
    name: string;
    /**
     * Expression parts.
     */
    parts: ExpressionPart[];
    /**
     * Format of the number results.
     * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat for more details.
     */
    numberFormat?: FormatNumberOptions;
}
/**
 * Single immutable expression.
 */
export type IMExpression = ImmutableObject<Expression>;
/**
 * Multiple expressions.
 */
export interface ExpressionMap {
    /**
     * One expression.
     */
    [expressionId: string]: Expression;
}
/**
 * Multiple immutable expressions.
 */
export type IMExpressionMap = ImmutableObject<ExpressionMap>;
/**
 * @ignore
 */
export type ExpressionPartGroup = ExpressionPart & {
    parts?: ExpressionPart[];
};
export interface BaseExpressionPart {
    /**
     * Expression part type.
     */
    type: string;
    /**
     * The expression part shows in user interface.
     */
    exp: string;
}
/**
 * A part of one single expression.
 */
export interface ExpressionPart extends BaseExpressionPart {
    /**
     * Expression part type.
     */
    type: ExpressionPartType;
    /**
     * Data source used by the expression part.
     */
    dataSourceId?: string;
    /**
     * Field used by the expression part.
     */
    jimuFieldName?: string;
    /**
     * We can get a feature set from one data source, even with only one feature in the set.
     * When a single feature is needed, we will use the first line of the feature set as default.
     * However, if `isFromRepeatedDataSourceContext` is `true`, we will use the feature provided by the repeated data source context.
     */
    isFromRepeatedDataSourceContext?: boolean;
}
/**
 * Types of the expression part.
 */
export declare enum ExpressionPartType {
    /**
     * The part is a string.
     */
    String = "STRING",
    /**
     * The part is a number.
     */
    Number = "NUMBER",
    /**
     * The part is a layer's field and it can be resolved to the field's value when associated with a specific record (e.g. selected record).
     */
    Field = "FIELD",
    /**
     * The part is a statistical function, e.g. average, sum.
     */
    Function = "FUNCTION",
    /**
     * The part is an operator, e.g. +, -.
     */
    Operator = "OPERATOR",
    /**
     * Order for the percentile functions, ASC or DESC.
     * See https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer-.htm#ESRI_SECTION2_72BD0F1DF82E4343A69417450568095F .
     */
    Order = "ORDER",
    /**
     * @ignore
     */
    Unknown = "UNKNOWN"
}
/**
 * Supported expression functions.
 */
export declare enum ExpressionFunctions {
    Average = "AVERAGE",
    Count = "COUNT",
    Sum = "SUM",
    Max = "MAX",
    Min = "MIN",
    StandardDeviation = "STANDARD_DEVIATION",
    PercentileDiscrete = "PERCENTILE_DISCRETE",
    PercentileContinuous = "PERCENTILE_CONTINUOUS"
}
export interface PercentileParams {
    value: number;
    orderBy?: 'ASC' | 'DESC';
}
export declare const AdvancedExpressionPartType: {
    readonly Arcade: "ARCADE";
    /**
     * The part is a string.
     */
    readonly String: ExpressionPartType.String;
    /**
     * The part is a number.
     */
    readonly Number: ExpressionPartType.Number;
    /**
     * The part is a layer's field and it can be resolved to the field's value when associated with a specific record (e.g. selected record).
     */
    readonly Field: ExpressionPartType.Field;
    /**
     * The part is a statistical function, e.g. average, sum.
     */
    readonly Function: ExpressionPartType.Function;
    /**
     * The part is an operator, e.g. +, -.
     */
    readonly Operator: ExpressionPartType.Operator;
    /**
     * Order for the percentile functions, ASC or DESC.
     * See https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer-.htm#ESRI_SECTION2_72BD0F1DF82E4343A69417450568095F .
     */
    readonly Order: ExpressionPartType.Order;
    /**
     * @ignore
     */
    readonly Unknown: ExpressionPartType.Unknown;
};
export interface AdvancedExpression extends BaseExpression {
    id: string;
    parts: AdvancedExpressionPart[];
    numberFormat?: FormatNumberOptions;
}
export type IMAdvancedExpression = ImmutableObject<AdvancedExpression>;
export interface AdvancedExpressionPart extends BaseExpressionPart {
    type: (typeof AdvancedExpressionPartType)[keyof typeof AdvancedExpressionPartType];
    valueType?: JimuFieldType;
    useDataSources?: UseDataSource[];
}
