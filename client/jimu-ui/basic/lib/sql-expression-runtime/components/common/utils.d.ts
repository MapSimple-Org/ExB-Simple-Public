import { type SqlClause, type SqlClauseSet, type DataSource, type IMFieldSchema, type IMSqlExpression, type SqlExpression, type extensionSpec } from 'jimu-core';
/**
 * @ignore
 */
export declare function getClauseArrayByChange(partArray: Array<SqlClause | SqlClauseSet>, clause: SqlClause | SqlClauseSet, id: string): Array<SqlClause | SqlClauseSet>;
/**
 * @ignore
 */
export declare function getCamelCase(name: string): string;
/**
 * @ignore
 * Get ArcGIS SQL for current clause if it's configured as askForValue = true.
 * Only use for CascadeSupportedList
 */
export declare function getCascadeSQL(sqlExprObj: IMSqlExpression, clause: SqlClause, clauseId: string, dataSource: DataSource): string;
/**
 * Get affected SqlExpression for current clause if it's configured as askForValue = true.
 * @ignore
 */
export declare function getCascadeSqlExpression(sqlExprObj: IMSqlExpression, clause: SqlClause, clauseId: string, dataSource: DataSource): SqlExpression;
/**
 * Get all jimu field names from a SQL Expression.
 * The jimu field names should be bound to the data source for widget.
 */
export declare function getJimuFieldNamesBySqlExpression(sqlExprObj: IMSqlExpression): string[];
/**
 * It's used to check whether a sql expression object is valid or not.
 */
export declare function isSqlExpressionValid(sqlExprObj: IMSqlExpression): boolean;
/**
 * get number of clauses which support askForValue or displayLabel to endUser.
 */
export declare function getShownClauseNumberByExpression(sqlExprObj: IMSqlExpression): number;
/**
 * get total number of all configured clauses.
 */
export declare function getTotalClauseNumberByExpression(sqlExprObj: IMSqlExpression): number;
/**
 * @ignore
 * Get clause label by i18n or custom label.
 */
export declare function getClauseLabel(clause: any, fieldObj: IMFieldSchema, operator: any, ignoreFieldLabel?: boolean): string;
/**
 * @ignore
 */
export declare function getClauseDefaultLabel(clause: any, fieldObj: IMFieldSchema, operator: any, ignoreFieldLabel?: boolean): string;
/**
 * Get translation keys from SQL expression builder component.
 * @param sqlExprObj
 * @param path
 * @returns
 */
export declare function getKeysInSqlExprBuilder(sqlExprObj: IMSqlExpression, path: string): extensionSpec.TranslationKey[];
/**
 * @ignore
 */
export declare function updateSQLExpressionByVersion(sqlExpression: IMSqlExpression, version: string, dataSource: DataSource): SqlExpression;
