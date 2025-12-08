import type { ImmutableArray } from 'seamless-immutable';
import type { UseDataSource, IMWidgetJson } from '../types/app-config';
import type { JimuFieldType, DuplicateContext } from '../types/common';
import { type DynamicStyleConditionInfo, type IMDynamicStyleConditionInfo, DynamicStyleConditionOperator, DynamicStyleConditionSourceType, type DynamicStyleConditionValueOptions, type IMDynamicStyleConditionValueOptions, type IMDynamicStyleConfig, type DynamicStyleExpressionType } from '../types/dynamic-style';
export declare function isAttributeExpression(expression: DynamicStyleExpressionType): boolean;
export declare function isStatisticsExpression(expression: DynamicStyleExpressionType): boolean;
export declare function isArcadeExpression(expression: DynamicStyleExpressionType): boolean;
export declare function isCommonExpression(expression: DynamicStyleExpressionType): boolean;
export declare function getExpressionReturnType(expression: DynamicStyleExpressionType): JimuFieldType;
/**
 * @ignore
 * Calculate conditionSourceTypes by expression and operator.
 */
export declare function getSupportedConditionSourceTypesByRefValueExpressionAndOperator(refValueExpression: DynamicStyleExpressionType, operator: DynamicStyleConditionOperator): DynamicStyleConditionSourceType[];
export declare function validateConditionInfo(refValueExpression: DynamicStyleExpressionType, conditionInfo: DynamicStyleConditionInfo | IMDynamicStyleConditionInfo): boolean;
/**
 * @ignore
 * Validate conditionValueOptions by conditionSourceType. In this method, we assume that operator and conditionSourceType are correct.
 * @param operator
 * @param conditionSourceType
 * @param conditionValueOptions
 * @returns
 */
export declare function validateConditionValueOptions(operator: DynamicStyleConditionOperator, conditionSourceType: DynamicStyleConditionSourceType, conditionValueOptions: DynamicStyleConditionValueOptions | IMDynamicStyleConditionValueOptions): boolean;
/**
 * Add the fields used in dynamic style to useDataSources.
 * @param dynamicStyleConfig
 * @param useDataSources
 */
export declare function generateFieldsForUseDataSourcesByDynamicStyle(dynamicStyleConfig: IMDynamicStyleConfig, useDataSources: ImmutableArray<UseDataSource>): ImmutableArray<UseDataSource>;
/**
 * Update dynamic style config when widget changes useDataSources from oldUseDataSources to newUseDataSources.
 * If it returns null, it means that dynamic style should be turned off.
 * @param widgetId
 * @param oldUseDataSources
 * @param newUseDataSources
 * @param dynamicStyleConfig
 */
export declare function updateDynamicStyleWhenUseDataSourcesChange(widgetId: string, oldUseDataSources: ImmutableArray<UseDataSource>, newUseDataSources: ImmutableArray<UseDataSource>, dynamicStyleConfig: IMDynamicStyleConfig): IMDynamicStyleConfig;
export declare function getCopiedDynamicStyleConfig(contentMap: DuplicateContext, sourceWidgetJson: IMWidgetJson, dynamicStyleConfig: IMDynamicStyleConfig): IMDynamicStyleConfig;
