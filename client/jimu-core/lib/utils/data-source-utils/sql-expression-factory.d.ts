import { ClauseLogic, ClauseOperator, type SqlClause, type SqlClauseSet, type SqlExpression, type IMGroupSqlExpression, type IMSqlExpression, type ClauseValuePair } from '../../types/sql-expression';
import type { DataSource } from '../../data-sources';
/**
 * Create a SQLClause.
 */
export declare function createSQLClause(fieldName: string, operator: ClauseOperator, value: ClauseValuePair[], caseSensitive?: boolean): SqlClause;
/**
 * Create a SQLClauseSet.
 */
export declare function createSQLClauseSet(logicalOperator: ClauseLogic, parts: SqlClause[]): SqlClauseSet;
/**
 * Create a SQLExpression.
 */
export declare function createSQLExpression(logicalOperator: ClauseLogic, clauses: Array<SqlClause | SqlClauseSet>, dataSource: DataSource): SqlExpression;
/**
 * Get merged multiple SQLExpressions.
 */
export declare function getMergedSQLExpressions(sqlExpressions: SqlExpression[], dataSource: DataSource, logicalOperator?: ClauseLogic): SqlExpression;
/**
 * Get Displayed SQLExpression from GroupSQLExpression
 * Note:
 * It should only has one clause from main ds and main field
 * It's only used for displaying at runtime
 * The label could be custom label or consisted of fields
 * @ignore
 */
export declare function getDisplayedSQLExpressionFromGroupSQLExpression(sqlExprObjForGroup: IMGroupSqlExpression, dataSource: DataSource, intlFormatMsg: any): IMSqlExpression;
/**
 * Get SQLExpression from GroupSQLExpression
 * @ignore
 */
export declare function getSQLExpressionFromGroupSQLExpression(sqlExprObjForGroup: IMGroupSqlExpression, dataSource: DataSource): IMSqlExpression;
