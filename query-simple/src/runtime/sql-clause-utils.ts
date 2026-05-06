/**
 * sql-clause-utils.ts — Type guards for the jimu-core SqlClause / SqlClauseSet union.
 *
 * Both `SqlClause` and `SqlClauseSet` declare `type: ClauseType` (not a literal),
 * so the union isn't a true discriminated union from TypeScript's perspective.
 * A runtime check on `type === ClauseType.Single` narrows correctly only when
 * wrapped in a type predicate.
 *
 * Use these helpers anywhere code reads `valueOptions`, `jimuFieldName`,
 * `operator`, etc. (only on `SqlClause`) or `parts` (only on `SqlClauseSet`)
 * after iterating an `SqlExpression.parts` array.
 *
 * @since 1.20.0-r027.059
 */

import { ClauseType, type SqlClause, type SqlClauseSet, type IMSqlClause, type IMSqlClauseSet } from 'jimu-core'

/**
 * Type guard: true when the part is a single SQL clause (not a clause set).
 * Narrows the type so callers can safely access `valueOptions`, `jimuFieldName`,
 * `operator`, etc.
 */
export function isSqlClause (
  part: SqlClause | SqlClauseSet | IMSqlClause | IMSqlClauseSet | undefined | null
): part is SqlClause {
  return !!part && part.type === ClauseType.Single
}

/**
 * Type guard: true when the part is a clause set. Narrows so callers can
 * safely access `parts` and `logicalOperator`.
 */
export function isSqlClauseSet (
  part: SqlClause | SqlClauseSet | IMSqlClause | IMSqlClauseSet | undefined | null
): part is SqlClauseSet {
  return !!part && part.type === ClauseType.Set
}

/**
 * Safe accessor for the clause's current value. Returns `undefined` for clause
 * sets (which don't carry a value of their own) and for nullish parts.
 *
 * Use this at debug-log / read-only call sites where the surrounding code
 * doesn't need to narrow the part for further work — saves a wrapping
 * `if (isSqlClause(part))` block at each access.
 */
export function getClauseValue (
  part: SqlClause | SqlClauseSet | IMSqlClause | IMSqlClauseSet | undefined | null
): unknown {
  return isSqlClause(part) ? part.valueOptions?.value : undefined
}

/**
 * Safe accessor for the clause's `jimuFieldName`. Returns `undefined` for
 * clause sets and nullish parts.
 */
export function getClauseFieldName (
  part: SqlClause | SqlClauseSet | IMSqlClause | IMSqlClauseSet | undefined | null
): string | undefined {
  return isSqlClause(part) ? part.jimuFieldName : undefined
}
