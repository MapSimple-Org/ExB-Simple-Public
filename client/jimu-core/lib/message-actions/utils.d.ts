import { type SqlExpression } from '../types/sql-expression';
import type { ImmutableObject } from '../../index';
import type { FieldSchema } from '../../lib/types/app-config';
import type { DataSource } from '../data-sources';
/**
 * @ignore
 */
export declare function formatValue(value: any, type: string): string | number;
/**
 * @ignore
 */
export declare function getSqlExpressionWidthMessageFieldValues(messageFieldValues: string[], actionField: ImmutableObject<FieldSchema>, actionDataSource: DataSource, useCaseSensitive?: boolean): SqlExpression;
