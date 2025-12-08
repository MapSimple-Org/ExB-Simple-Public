import { type IMExpression, type ExpressionPart, type Expression, ExpressionFunctions, type PercentileParams, type AdvancedExpression, type IMAdvancedExpression, type AdvancedExpressionPart } from '../types/expression';
import type { UseDataSource, IMWidgetJson, IMAppConfig } from '../types/app-config';
import { type DuplicateContext } from '../types/common';
import type { ImmutableArray } from 'seamless-immutable';
import type { IMArcadeContentConfig } from '../types/arcade-content';
export declare function generateFieldsForUseDataSourcesByExpressionParts(parts: Array<AdvancedExpressionPart | ExpressionPart> | ImmutableArray<AdvancedExpressionPart | ExpressionPart>, useDataSources: ImmutableArray<UseDataSource>): ImmutableArray<UseDataSource>;
export declare function getUseDataSourcesByExpressionParts(parts: ExpressionPart[] | ImmutableArray<ExpressionPart>): ImmutableArray<UseDataSource>;
export declare function mergeUseDataSources(u1?: ImmutableArray<UseDataSource>, u2?: ImmutableArray<UseDataSource>): ImmutableArray<UseDataSource>;
export declare function getWhetherExpressionValid(e: Expression | IMExpression): boolean;
export declare function getWhetherFieldInDs(dsId: string, jimuFieldName: string, alias: string): boolean;
export declare function isSingleArcadeExpression(expression: Expression | IMExpression | AdvancedExpression | IMAdvancedExpression): boolean;
export declare const isSingleStringExpression: (expression: Expression | IMExpression) => boolean;
export declare const getSingleStringExpressionText: (expression: Expression) => string;
export declare const getUseDataSourcesWithoutFields: (useDataSources: ImmutableArray<UseDataSource>) => ImmutableArray<UseDataSource>;
/**
 * Check whether has fields in every useDataSource
 * @param useDataSources
 */
export declare const whetherHasFieldsInUseDataSources: (useDataSources: ImmutableArray<UseDataSource>) => boolean;
export declare function getDataSourceIdsFromExpression(expression: IMExpression): string[];
export declare function getPercentileParams(paramParts: ExpressionPart[], func: ExpressionFunctions): PercentileParams;
export declare function replaceDataSourceId(expression: IMExpression | Expression | IMAdvancedExpression | AdvancedExpression, oldDsId: string, newDsId: string, widgetId: string, appConfig: IMAppConfig): Expression;
export declare function mapExpression(contentMap: DuplicateContext, expression: IMExpression | IMAdvancedExpression, sourceWidgetJson: IMWidgetJson): {
    isChanged: boolean;
    expression: Expression | AdvancedExpression;
};
export declare function expressionToArcadeConfig(expression: AdvancedExpression | IMAdvancedExpression): IMArcadeContentConfig;
export declare function arcadeConfigToExpression(config: IMArcadeContentConfig): AdvancedExpression;
