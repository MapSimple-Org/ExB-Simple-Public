/**
 * suggest-utils.ts — Utilities for typeahead/suggest feature (r025.053)
 *
 * Three responsibilities:
 * 1. detectFreeFormInput()    — Determine if a sqlExprObj is a free-form text input
 * 2. fetchSuggestions()       — Lightweight FeatureLayer.queryFeatures() for suggestions
 * 3. injectValueIntoInput()   — DOM manipulation to set value in SqlExpressionRuntime
 *
 * The DOM injection pattern is IDENTICAL to the proven hash parameter injection
 * in query-task-form.tsx (lines 1119-1192). If that pattern changes, this must
 * be updated to match.
 */
import type { FeatureLayerDataSource, IMSqlExpression } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// ============================================================================
// Types
// ============================================================================

export interface SuggestItem {
  /** The field value */
  value: string
  /** Display text (defaults to value) */
  label: string
}

export interface FetchSuggestionsOptions {
  /** The origin data source to query */
  originDS: FeatureLayerDataSource
  /** Field name to search in */
  fieldName: string
  /** The SQL operator from the free-form part (e.g., STRING_OPERATOR_CONTAINS) */
  operator?: string | null
  /** The user's typed query string */
  query: string
  /** Maximum results to return */
  limit: number
  /** AbortController signal for cancellation */
  signal: AbortSignal
  /** Additional WHERE clause from fixed parts (e.g., "PROPTYPE = 'K'") */
  additionalWhere?: string | null
}

/** Cache entry for client-side narrowing optimization (r025.058) */
export interface SuggestCache {
  /** The query string that produced this cached result set */
  query: string
  /** Full server result set (up to fetchLimit) */
  results: SuggestItem[]
  /** true if results.length < fetchLimit — we have ALL matches for this prefix */
  isComplete: boolean
  /** The operator used — cache invalid if operator changes */
  operator: string | null
  /** The additionalWhere used — cache invalid if fixed clauses change */
  additionalWhere: string | null
}

// Operators where typing more characters can only narrow results (monotonic)
const NARROWABLE_OPERATORS = new Set([
  'STRING_OPERATOR_IS',
  'STRING_OPERATOR_STARTS_WITH',
  null, // default operator uses starts-with pattern
  undefined
])

/**
 * Attempt to filter cached suggestions client-side instead of hitting the server.
 *
 * Returns SuggestItem[] on cache hit, or null if a server re-query is needed.
 * The null return is the safety guarantee — any doubt = server query = zero regression.
 */
export function filterCachedSuggestions (
  cache: SuggestCache | null,
  query: string,
  operator: string | null,
  additionalWhere: string | null,
  displayLimit: number
): SuggestItem[] | null {
  // No cache → server query
  if (!cache) return null

  // Context changed → server query
  if (cache.operator !== operator || cache.additionalWhere !== additionalWhere) return null

  // Operator doesn't narrow monotonically (CONTAINS, ENDS_WITH) → server query
  if (!NARROWABLE_OPERATORS.has(operator)) return null

  // Server may have had more results than fetched → server query
  if (!cache.isComplete) return null

  // New query doesn't extend cached prefix (backspace, different string) → server query
  const upperQuery = query.toUpperCase()
  const upperCacheQuery = cache.query.toUpperCase()
  if (!upperQuery.startsWith(upperCacheQuery)) return null

  // Cache hit — filter locally using same starts-with logic as the server LIKE pattern
  return cache.results
    .filter(item => item.value.toUpperCase().startsWith(upperQuery))
    .slice(0, displayLimit)
}

// ============================================================================
// 1. Detection: Is this a free-form text input?
// ============================================================================

/**
 * Determines if the SQL expression contains a free-form text input part
 * (as opposed to only dropdowns/unique values selectors).
 *
 * Scans all parts and returns the FIRST free-form USER_INPUT clause found.
 * Free-form parts have:
 * - type === 'SINGLE' (SqlClause, not SqlClauseSet)
 * - valueOptions.source is 'USER_INPUT' or absent (default is user input)
 * - No dataSource.source on the part (dropdowns set this)
 *
 * Multi-clause expressions (e.g., PROP_NAME contains [input] AND PROPTYPE is K)
 * are supported — suggest attaches to the first free-form part.
 *
 * @returns isFreeForm boolean and extracted fieldName for scoping suggest queries
 */
export function detectFreeFormInput (sqlExprObj: IMSqlExpression | null): {
  isFreeForm: boolean
  fieldName: string | null
  operator: string | null
  additionalWhere: string | null
} {
  if (!sqlExprObj?.parts || sqlExprObj.parts.length === 0) {
    return { isFreeForm: false, fieldName: null, operator: null, additionalWhere: null }
  }

  let freeFormFieldName: string | null = null
  let freeFormOperator: string | null = null
  let freeFormIndex = -1
  const fixedClauses: string[] = []

  // Scan all parts
  for (let i = 0; i < sqlExprObj.parts.length; i++) {
    const part = sqlExprObj.parts[i]
    if (!part || part.type !== 'SINGLE') continue

    const source = (part as any).valueOptions?.source
    const sourceType = (part as any).valueOptions?.sourceType
    const hasDataSource = !!(part as any).dataSource?.source
    const effectiveSource = source || sourceType
    const isFreeForm = (!effectiveSource || effectiveSource === 'USER_INPUT') && !hasDataSource
    const displayType = (part as any).displayType

    if (isFreeForm && (!displayType || displayType === 'USE_ASK_FOR_VALUE') && freeFormIndex === -1) {
      // First free-form part — this is the suggest target
      freeFormFieldName = (part as any).jimuFieldName || (part as any).fieldName || null
      freeFormOperator = (part as any).operator || null
      freeFormIndex = i
    } else if (displayType && displayType !== 'USE_ASK_FOR_VALUE') {
      // Fixed/hardcoded part — extract as WHERE clause for suggest filtering
      const clause = partToWhereClause(part as any)
      if (clause) fixedClauses.push(clause)
    }
  }

  if (freeFormIndex === -1) {
    debugLogger.log('SUGGEST', {
      event: 'detect-free-form',
      isFreeForm: false,
      partsCount: sqlExprObj.parts.length
    })
    return { isFreeForm: false, fieldName: null, operator: null, additionalWhere: null }
  }

  const logicalOp = sqlExprObj.logicalOperator || 'AND'
  const additionalWhere = fixedClauses.length > 0
    ? fixedClauses.join(` ${logicalOp} `)
    : null

  debugLogger.log('SUGGEST', {
    event: 'detect-free-form',
    isFreeForm: true,
    partIndex: freeFormIndex,
    fieldName: freeFormFieldName,
    operator: freeFormOperator,
    additionalWhere: additionalWhere || '(none)',
    fixedClauseCount: fixedClauses.length
  })

  return { isFreeForm: true, fieldName: freeFormFieldName, operator: freeFormOperator, additionalWhere }
}

/**
 * Converts a fixed SQL expression part to a WHERE clause fragment.
 * Handles common string and number operators.
 */
function partToWhereClause (part: any): string | null {
  const fieldName = part.jimuFieldName || part.fieldName
  const rawValue = part.valueOptions?.value
  if (!fieldName || rawValue == null) return null

  const operator = part.operator as string
  if (!operator) return null

  // Esri stores values in various formats:
  //   - Plain string/number: "K" or 42
  //   - Array of {value, label}: [{value: "K", label: "K"}]
  // Extract the actual primitive value
  let value: any = rawValue
  if (Array.isArray(rawValue)) {
    value = rawValue[0]?.value ?? rawValue[0]
  }
  if (typeof value === 'object' && value !== null) {
    value = value.value ?? value.label ?? String(value)
  }
  if (value == null) return null

  // String operators
  if (operator.startsWith('STRING_OPERATOR_')) {
    const escapedValue = String(value).replace(/'/g, "''")
    switch (operator) {
      case 'STRING_OPERATOR_IS': return `${fieldName} = '${escapedValue}'`
      case 'STRING_OPERATOR_IS_NOT': return `${fieldName} <> '${escapedValue}'`
      case 'STRING_OPERATOR_CONTAINS': return `${fieldName} LIKE '%${escapedValue}%'`
      case 'STRING_OPERATOR_STARTS_WITH': return `${fieldName} LIKE '${escapedValue}%'`
      case 'STRING_OPERATOR_ENDS_WITH': return `${fieldName} LIKE '%${escapedValue}'`
      case 'STRING_OPERATOR_DOES_NOT_CONTAIN': return `${fieldName} NOT LIKE '%${escapedValue}%'`
      default: return null
    }
  }

  // Number operators
  if (operator.startsWith('NUMBER_OPERATOR_')) {
    const numValue = Number(value)
    if (isNaN(numValue)) return null
    switch (operator) {
      case 'NUMBER_OPERATOR_IS': return `${fieldName} = ${numValue}`
      case 'NUMBER_OPERATOR_IS_NOT': return `${fieldName} <> ${numValue}`
      case 'NUMBER_OPERATOR_IS_AT_LEAST': return `${fieldName} >= ${numValue}`
      case 'NUMBER_OPERATOR_IS_AT_MOST': return `${fieldName} <= ${numValue}`
      case 'NUMBER_OPERATOR_IS_GREATER_THAN': return `${fieldName} > ${numValue}`
      case 'NUMBER_OPERATOR_IS_LESS_THAN': return `${fieldName} < ${numValue}`
      default: return null
    }
  }

  return null
}

// ============================================================================
// 2. Fetch: Lightweight suggest query
// ============================================================================

/**
 * Fetches suggestions from a FeatureLayer using a starts-with LIKE query.
 *
 * Uses the same FeatureLayer.queryFeatures() pattern as direct-query.ts.
 * Key optimizations:
 * - returnGeometry: false (no spatial data needed)
 * - returnDistinctValues: true (no duplicate suggestions)
 * - resultRecordCount: limited (default 10)
 * - UPPER() for case-insensitive matching
 * - LIKE 'VALUE%' (starts-with) is SARGable / index-friendly
 *
 * @returns Array of SuggestItem sorted alphabetically
 */
export async function fetchSuggestions (options: FetchSuggestionsOptions): Promise<SuggestItem[]> {
  const { originDS, fieldName, operator, query, limit, signal, additionalWhere } = options

  // Get the actual FeatureLayer from the DataSource
  const featureLayer = await originDS.createJSAPILayerByDataSource() as __esri.FeatureLayer
  await featureLayer.load()

  // Check for abort after async operations
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  // Build the WHERE clause — escape single quotes to prevent SQL injection
  // Match the LIKE pattern to the SQL operator:
  //   contains      → %VALUE%
  //   starts_with   → VALUE%
  //   ends_with     → %VALUE
  //   is (default)  → VALUE%  (starts-with is most useful for exact-match fields)
  const escapedQuery = query.replace(/'/g, "''").toUpperCase()
  let likePattern: string
  switch (operator) {
    case 'STRING_OPERATOR_CONTAINS':
    case 'STRING_OPERATOR_DOES_NOT_CONTAIN':
      likePattern = `'%${escapedQuery}%'`
      break
    case 'STRING_OPERATOR_ENDS_WITH':
      likePattern = `'%${escapedQuery}'`
      break
    default: // STRING_OPERATOR_IS, STRING_OPERATOR_STARTS_WITH, etc.
      likePattern = `'${escapedQuery}%'`
      break
  }
  let where = `UPPER(${fieldName}) LIKE ${likePattern}`

  // Append fixed clauses from the SQL expression (e.g., PROPTYPE = 'K')
  if (additionalWhere) {
    where = `(${where}) AND (${additionalWhere})`
  }

  debugLogger.log('SUGGEST', {
    event: 'fetch-start',
    fieldName,
    userQuery: query,
    where,
    limit
  })

  const queryObj = featureLayer.createQuery()
  queryObj.where = where
  queryObj.outFields = [fieldName]
  queryObj.returnGeometry = false
  queryObj.returnDistinctValues = true
  queryObj.num = limit
  queryObj.orderByFields = [`${fieldName} ASC`]

  const featureSet = await featureLayer.queryFeatures(queryObj)

  // Check for abort after query
  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError')
  }

  const results: SuggestItem[] = featureSet.features
    .map(feature => {
      const value = feature.attributes[fieldName]
      return value != null ? { value: String(value), label: String(value) } : null
    })
    .filter((item): item is SuggestItem => item !== null)

  debugLogger.log('SUGGEST', {
    event: 'fetch-success',
    resultCount: results.length,
    firstResult: results[0]?.value || '(none)'
  })

  return results
}

// ============================================================================
// 3. DOM Injection: Set value in SqlExpressionRuntime's input
// ============================================================================

/**
 * Injects a value into SqlExpressionRuntime's DOM input element.
 *
 * This is the EXACT SAME pattern used for hash parameter injection in
 * query-task-form.tsx (the populateInputField function at lines 1119-1192).
 *
 * Flow:
 * 1. Focus the input (required for React synthetic events)
 * 2. Set value via nativeInputValueSetter (bypasses React's controlled component value lock)
 * 3. Dispatch 'input' event (triggers SqlExpressionRuntime's internal handler)
 * 4. Dispatch 'change' event (backup for non-React handlers)
 * 5. Blur to trigger SqlExpressionRuntime's validation/conversion
 *    (string → [{value, label}] array format → onChange fires)
 */
export function injectValueIntoInput (inputElement: HTMLInputElement, value: string): void {
  debugLogger.log('SUGGEST', {
    event: 'inject-start',
    currentValue: inputElement.value,
    newValue: value
  })

  // Step 1: Focus
  inputElement.focus()

  // Step 2: Set value using React's native value setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(inputElement, value)
  } else {
    // Fallback: direct assignment (may not trigger React's controlled input)
    inputElement.value = value
  }

  // Step 3: Dispatch input event
  const inputEvent = new Event('input', { bubbles: true, cancelable: true })
  Object.defineProperty(inputEvent, 'target', { value: inputElement, enumerable: true })
  inputElement.dispatchEvent(inputEvent)

  // Step 4: Dispatch change event
  const changeEvent = new Event('change', { bubbles: true, cancelable: true })
  Object.defineProperty(changeEvent, 'target', { value: inputElement, enumerable: true })
  inputElement.dispatchEvent(changeEvent)

  // Step 5: Blur to trigger SqlExpressionRuntime conversion
  inputElement.blur()

  debugLogger.log('SUGGEST', {
    event: 'inject-complete',
    value
  })
}
