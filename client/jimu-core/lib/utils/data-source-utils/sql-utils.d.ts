import { type IMSqlExpression, type SqlResult, type SqlExpression } from '../../types/sql-expression';
import type { IntlShape } from 'react-intl';
import type { FieldSchema } from '../../types/app-config';
import type { DataSource } from '../../data-sources';
import type { ImmutableObject } from 'seamless-immutable';
/**
 * Update some clauses which field's esriType `esriFieldTypeGUID` or `esriFieldTypeGlobalID`
 * Rules: Use 'AND'/'OR' to query '{abc}' and 'abc' values.
 * @ignore
 */
export declare function handleGlobalIdField(sqlExprObj: IMSqlExpression, fields: ImmutableObject<{
    [jimuName: string]: FieldSchema;
}>): IMSqlExpression;
/**
 * Get ArcGIS SQL and a user-friendly displaySQL from a SQL Expression.
 * `sql` could be used to query on a ArcGIS service.
 * `displaySQL` could be used for UI.
 * intl is just used for UT.
 */
export declare function getArcGISSQL(sqlExprObj: IMSqlExpression, dataSource: DataSource, intl?: IntlShape): SqlResult;
/**
 * @ignore
 */
export declare function parserSQL(sql: string): SqlExpression;
export declare function containsNonLatinCharacter(string: any): boolean;
/**
 * @ignore
 * Get Local time offset from UTC.
 */
export declare function getLocalTimeOffset(): number;
export declare function mergeSubtypeSublayerWhereClausesToSubtypeGroupLayer(subtypeFieldName: string, subtypeGroupLayerWhereClause: string, subtypeSublayerWhereClauses: {
    [subtypeCode: number]: string;
}): string;
export declare function ensureWhereClauseMatchesSubtype(whereClause: string | null, subtypeFieldName: string, subtypeCode: number): string;
export declare function isWhereClauseEmpty(whereClause: string): boolean;
