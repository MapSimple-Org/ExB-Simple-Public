import { type ExpressionPart, ExpressionFunctions, type ExpressionPartGroup, type Expression, type IMExpression, type AdvancedExpression, type IMAdvancedExpression } from '../types/expression';
import { JimuFieldType } from '../types/common';
import { type ArcGISQueryParams, type DataRecord } from '../data-sources';
import type { RepeatedDataSource } from '../repeat-data-source-context';
import type { ImmutableArray } from 'seamless-immutable';
import type { FormatNumberOptions } from 'react-intl';
export declare function calculatePostfixExpressionWithoutFunction(parts: ExpressionPart[], records: {
    [dataSourceId: string]: DataRecord[];
}, repeatedDataSource: RepeatedDataSource | RepeatedDataSource[], numberFormat: FormatNumberOptions, useFormat: boolean): string | number;
export declare function resolveField(part: ExpressionPart, records: {
    [dataSourceId: string]: DataRecord[];
}, repeatedDataSource: RepeatedDataSource | RepeatedDataSource[], useFormat: boolean, numberFormat: FormatNumberOptions): string | number;
export declare function resolveFunction(part: ExpressionPartGroup, records: {
    [dataSourceId: string]: DataRecord[];
}, repeatedDataSource: RepeatedDataSource | RepeatedDataSource[], formatDate: boolean): Promise<number | string>;
export declare function getQueryParams(parts: ExpressionPart[], func: ExpressionFunctions): ArcGISQueryParams;
/**
 * Put parameter field parts into function parts.
 * For example, if the input is.
 * [{
 *  "type": "FUNCTION",
 *  "exp": "AVERAGE"
 * },
 * {
 *  "type": "OPERATOR",
 *  "exp": "("
 * },
 * {
 *  "type": "FIELD",
 *  "exp": "{OBJECTID}",
 *  "dataSourceId": "dataSource_1",
 *  "jimuFieldName": "OBJECTID"
 * },
 * {
 *  "type": "OPERATOR",
 *  "exp": ")"
 * }]
 *
 * The output will be.
 * [{
 *   "type": "FUNCTION",
 *   "exp": "AVERAGE",
 *   "parts": [{
 *     "type": "FIELD",
 *     "exp": "{OBJECTID}",
 *     "dataSourceId": "dataSource_1",
 *     "jimuFieldName": "OBJECTID"
 *   }]
 * }]
 */
export declare function groupPartsByFunction(parts: ExpressionPart[] | ImmutableArray<ExpressionPart>): ExpressionPartGroup[];
export declare function getPostfixParts(parts: ExpressionPartGroup[]): ExpressionPartGroup[];
export declare function getStringOrNumberPartFromExp(e: string | number): ExpressionPart;
/**
 * If the original value of the part is date.
 * When checking the original value, we won't format number or date.
 * For string part, original value is string.
 * For number part, original value is number.
 * For field part, 1. for string field, original value is string, 2. for date field, original value is date, 3. for number field, original value is number (won't resolve the coded value to label), 4. for date only field, the original value is string, 5. for time only field, the original value is string.
 * For function part, 1. for date fields and function is not count, original value is date, 2. for other field, original value is number.
 * For operator part and unknown part, don't have any original values.
 */
export declare function isPartOriginValueDate(part: ExpressionPartGroup): boolean;
/**
 * If the original value of the part is number.
 * See comments of `isPartOriginValueDate` for more detail.
 */
export declare function isPartOriginValueNumber(part: ExpressionPartGroup): boolean;
export declare function isPartOriginValueDateOnly(part: ExpressionPartGroup): boolean;
export declare function isPartOriginValueTimeOnly(part: ExpressionPartGroup): boolean;
export declare function getExpressionOriginResolveValueFormat(expression: Expression | IMExpression | AdvancedExpression | IMAdvancedExpression): JimuFieldType;
