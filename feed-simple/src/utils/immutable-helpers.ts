/**
 * Helpers for working with ExB's ImmutableObject/ImmutableArray types.
 *
 * ExB wraps widget config in seamless-immutable, which makes arrays and
 * nested objects deeply immutable at the type level. These helpers provide
 * clean type-safe access without scattering `as any` casts everywhere.
 *
 * @module immutable-helpers
 */

import type { UseDataSource, ImmutableArray } from 'jimu-core'

/**
 * Unwrap an ImmutableArray to a plain TypeScript array.
 * Returns an empty array if the value is null/undefined.
 *
 * Usage: `toArray<string>(config.searchFields)` instead of
 *        `(config.searchFields as any as string[]) || []`
 */
export function toArray<T> (immutable: unknown): T[] {
  if (!immutable) return []
  return [...immutable as Iterable<T>]
}

/**
 * Unwrap an ImmutableObject to a plain TypeScript object.
 * Returns an empty object if the value is null/undefined.
 *
 * Usage: `toPlain<StatusColorMap>(config.statusColorMap)` instead of
 *        `(config.statusColorMap as any) || {}`
 */
export function toPlain<T extends object> (immutable: unknown): T {
  if (!immutable) return {} as T
  return { ...immutable as T }
}

/**
 * Extract the dataSourceId from the first UseDataSource in the array.
 * Returns undefined if the array is empty or the first entry has no ID.
 *
 * Usage: `getDataSourceId(this.props.useDataSources)` instead of
 *        `(this.props.useDataSources[0] as any).dataSourceId`
 */
export function getDataSourceId (
  // r027.067: ExB props arrive seamless-immutable-wrapped
  // (ImmutableArray<UseDataSource>), which lacks array mutation methods, so
  // it isn't assignable to a plain mutable array type. Widened the param to
  // also accept the immutable shape. Read-only access only — runtime unchanged.
  useDataSources:
    | ImmutableArray<UseDataSource>
    | Array<UseDataSource | { dataSourceId?: string }>
    | undefined
    | null
): string | undefined {
  if (!useDataSources || useDataSources.length === 0) return undefined
  return (useDataSources[0] as UseDataSource)?.dataSourceId
}
