/**
 * rebind-utils.ts — Pure functions for data source rebinding.
 *
 * r026.018: When a user replaces a layer in their web map, these utilities
 * remap all query-item field references (filters, templates, display fields,
 * sort options) from the old data source to the new one.
 *
 * Two modes:
 *   1. Auto-heal — field names match; just swap the DS reference.
 *   2. Field mapping — field names differ; caller supplies a mapping.
 */

import type { UseDataSource, SqlExpression } from 'jimu-core'
import type { QueryItemType } from '../config'

// ── Token extraction regex ──────────────────────────────────────

/** Matches {{fieldName}} or {{fieldName | filter}} — captures the field name */
const RE_NEW_TOKEN = /\{\{(\s*[\w.@[\]]+\s*)(?:\|[^}]*)?\}\}/g
/** Matches legacy {fieldName} — captures the field name */
const RE_LEGACY_TOKEN = /(?<!\{)\{([A-Za-z_]\w*)\}(?!\})/g

// ── Types ───────────────────────────────────────────────────────

export interface AnalysisResult {
  /** Indices of query items that reference the old data source */
  affectedIndices: number[]
  /** Union of all field names referenced by affected query items */
  oldFieldNames: string[]
  /** Fields from oldFieldNames that exist in the new data source */
  matchedFields: string[]
  /** Fields from oldFieldNames that do NOT exist in the new data source */
  unmatchedFields: string[]
  /** True when all referenced fields exist in the new data source */
  autoHealEligible: boolean
}

// ── Field extraction ────────────────────────────────────────────

/**
 * Extract all unique field names referenced by a query item.
 * Scans: useDataSource.fields, sqlExprObj, resultTitleExpression,
 * resultContentExpression, resultDisplayFields, sortOptions, resultTitleFields.
 */
export function extractFieldReferences (queryItem: QueryItemType): string[] {
  const fields = new Set<string>()

  // useDataSource.fields
  if (queryItem.useDataSource?.fields) {
    for (const f of queryItem.useDataSource.fields) {
      if (f) fields.add(f)
    }
  }

  // sqlExprObj — recursive walk
  if (queryItem.sqlExprObj) {
    walkSqlParts(queryItem.sqlExprObj.parts, fields)
  }

  // resultTitleExpression — {{field}} and {field} tokens
  extractTokensFromTemplate(queryItem.resultTitleExpression, fields)

  // resultContentExpression — {{field | filter}} tokens
  extractTokensFromTemplate(queryItem.resultContentExpression, fields)

  // resultDisplayFields
  if (queryItem.resultDisplayFields) {
    for (const f of queryItem.resultDisplayFields) {
      if (f) fields.add(f)
    }
  }

  // sortOptions
  if (queryItem.sortOptions) {
    for (const opt of queryItem.sortOptions) {
      if (opt?.jimuFieldName) fields.add(opt.jimuFieldName)
    }
  }

  // resultTitleFields (legacy)
  if (queryItem.resultTitleFields) {
    for (const f of queryItem.resultTitleFields) {
      if (f) fields.add(f)
    }
  }

  return Array.from(fields)
}

/**
 * Recursively walk SqlExpression parts to extract jimuFieldName values.
 */
function walkSqlParts (parts: any[] | undefined, fields: Set<string>): void {
  if (!parts) return
  for (const part of parts) {
    if (!part) continue
    if (part.jimuFieldName) {
      fields.add(part.jimuFieldName)
    }
    // SqlClauseSet has nested parts
    if (part.parts) {
      walkSqlParts(part.parts, fields)
    }
  }
}

/**
 * Extract field names from template strings containing {{field}} or {field} tokens.
 */
function extractTokensFromTemplate (template: string | undefined, fields: Set<string>): void {
  if (!template) return

  // New syntax: {{field}} or {{field | filter}}
  let match: RegExpExecArray | null
  const newRegex = new RegExp(RE_NEW_TOKEN.source, RE_NEW_TOKEN.flags)
  while ((match = newRegex.exec(template)) !== null) {
    fields.add(match[1].trim())
  }

  // Legacy syntax: {field}
  const legacyRegex = new RegExp(RE_LEGACY_TOKEN.source, RE_LEGACY_TOKEN.flags)
  while ((match = legacyRegex.exec(template)) !== null) {
    fields.add(match[1].trim())
  }
}

// ── Analysis ────────────────────────────────────────────────────

/**
 * Analyze a proposed rebinding: which query items are affected,
 * which fields match, and whether auto-heal is possible.
 *
 * @param oldDsId       The data source ID being replaced
 * @param newFieldNames Set of field names available in the new data source
 * @param queryItems    All query items in the widget config
 */
export function analyzeRebinding (
  oldDsId: string,
  newFieldNames: Set<string>,
  queryItems: QueryItemType[]
): AnalysisResult {
  const affectedIndices: number[] = []
  const allOldFields = new Set<string>()

  // Find affected query items and gather their field references
  queryItems.forEach((item, idx) => {
    const itemDsId = item.useDataSource?.dataSourceId ?? item.useDataSource?.mainDataSourceId
    if (itemDsId === oldDsId) {
      affectedIndices.push(idx)
      for (const f of extractFieldReferences(item)) {
        allOldFields.add(f)
      }
    }
  })

  const oldFieldNames = Array.from(allOldFields)
  const matchedFields = oldFieldNames.filter(f => newFieldNames.has(f))
  const unmatchedFields = oldFieldNames.filter(f => !newFieldNames.has(f))

  return {
    affectedIndices,
    oldFieldNames,
    matchedFields,
    unmatchedFields,
    autoHealEligible: unmatchedFields.length === 0
  }
}

// ── Template field replacement ──────────────────────────────────

/**
 * Replace field names in a template string according to a field map.
 * Handles both {{field | filter}} and legacy {field} syntax.
 * Preserves filter chains and whitespace around field names.
 *
 * @param template  The template string to process
 * @param fieldMap  Mapping from old field name → new field name
 * @returns         Updated template string
 */
export function replaceFieldTokensInTemplate (
  template: string | undefined,
  fieldMap: Record<string, string>
): string | undefined {
  if (!template) return template

  let result = template

  // Replace {{oldField}} and {{oldField | filter}} tokens
  result = result.replace(
    /\{\{(\s*)([\w.@[\]]+)(\s*(?:\|[^}]*)?)\}\}/g,
    (_match, leadingSpace: string, fieldName: string, rest: string) => {
      const mapped = fieldMap[fieldName]
      if (mapped !== undefined) {
        return `{{${leadingSpace}${mapped}${rest}}}`
      }
      return _match
    }
  )

  // Replace legacy {oldField} tokens (not {{...}})
  result = result.replace(
    /(?<!\{)\{([A-Za-z_]\w*)\}(?!\})/g,
    (_match, fieldName: string) => {
      const mapped = fieldMap[fieldName]
      if (mapped !== undefined) {
        return `{${mapped}}`
      }
      return _match
    }
  )

  return result
}

// ── SQL expression field replacement ────────────────────────────

/**
 * Deep-clone and remap field names in a SqlExpression.
 * Walks parts recursively, replacing jimuFieldName in each SqlClause.
 * Clears `sql` and `displaySQL` strings so the framework regenerates them.
 */
export function remapSqlExpression (
  sqlExprObj: SqlExpression | undefined,
  fieldMap: Record<string, string>
): SqlExpression | undefined {
  if (!sqlExprObj) return sqlExprObj

  const cloned: SqlExpression = JSON.parse(JSON.stringify(sqlExprObj))
  remapSqlParts(cloned.parts, fieldMap)

  // Clear cached SQL strings — the framework recalculates them from parts
  cloned.sql = ''
  cloned.displaySQL = ''

  return cloned
}

/**
 * Recursively remap jimuFieldName in SqlClause/SqlClauseSet parts.
 */
function remapSqlParts (parts: any[] | undefined, fieldMap: Record<string, string>): void {
  if (!parts) return
  for (const part of parts) {
    if (!part) continue
    if (part.jimuFieldName && fieldMap[part.jimuFieldName] !== undefined) {
      part.jimuFieldName = fieldMap[part.jimuFieldName]
    }
    if (part.parts) {
      remapSqlParts(part.parts, fieldMap)
    }
  }
}

// ── Core rebinding ──────────────────────────────────────────────

/**
 * Apply a data source rebinding to all affected query items.
 * Returns a new array of query items with updated references.
 * Unaffected query items are returned unchanged.
 *
 * @param oldDsId           The data source ID being replaced
 * @param newUseDataSource  The new UseDataSource object (contains dataSourceId, mainDataSourceId, rootDataSourceId)
 * @param queryItems        All query items in the widget config
 * @param fieldMap          Mapping from old field name → new field name (identity map for auto-heal)
 * @returns                 Updated query items array
 */
export function applyRebinding (
  oldDsId: string,
  newUseDataSource: UseDataSource,
  queryItems: QueryItemType[],
  fieldMap: Record<string, string>
): QueryItemType[] {
  return queryItems.map(item => {
    const itemDsId = item.useDataSource?.dataSourceId ?? item.useDataSource?.mainDataSourceId
    if (itemDsId !== oldDsId) {
      return item // Not affected — return unchanged
    }

    // Deep clone the affected item
    const updated: QueryItemType = JSON.parse(JSON.stringify(item))

    // 1. Swap useDataSource
    updated.useDataSource = {
      ...newUseDataSource,
      fields: (item.useDataSource?.fields || [])
        .map(f => fieldMap[f] ?? f)
        .filter(Boolean)
    }

    // 2. Remap sqlExprObj
    updated.sqlExprObj = remapSqlExpression(item.sqlExprObj, fieldMap) as any

    // 3. Remap resultTitleExpression
    updated.resultTitleExpression = replaceFieldTokensInTemplate(
      item.resultTitleExpression, fieldMap
    )

    // 4. Remap resultContentExpression
    updated.resultContentExpression = replaceFieldTokensInTemplate(
      item.resultContentExpression, fieldMap
    )

    // 5. Remap resultDisplayFields
    if (item.resultDisplayFields) {
      updated.resultDisplayFields = item.resultDisplayFields
        .map(f => fieldMap[f] ?? f)
    }

    // 6. Remap sortOptions
    if (item.sortOptions) {
      updated.sortOptions = item.sortOptions.map(opt => ({
        ...opt,
        jimuFieldName: fieldMap[opt.jimuFieldName] ?? opt.jimuFieldName
      }))
    }

    // 7. Remap resultTitleFields (legacy)
    if (item.resultTitleFields) {
      updated.resultTitleFields = item.resultTitleFields
        .map(f => fieldMap[f] ?? f)
    }

    // 8. Preserve outputDataSourceId — getAllDataSources() rebuilds the output DS JSON
    // with new URL/type/geometry from the new data source

    return updated
  })
}

/**
 * Build an identity field map (each field maps to itself).
 * Used for auto-heal mode when all fields match.
 */
export function buildIdentityFieldMap (fieldNames: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  for (const f of fieldNames) {
    map[f] = f
  }
  return map
}
