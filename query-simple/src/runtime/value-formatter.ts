/**
 * value-formatter.ts — Display formatting for QuerySimple result field tables.
 *
 * The result card and the map popup both show a field/value table for
 * SelectAttributes (and legacy PopupSetting) queries. To make those tables
 * match the layer's native formatting WITHOUT depending on the deprecated
 * `esri/widgets/Feature` widget, we format values here by reusing Esri's
 * public `@arcgis/core/intl` API (the same primitives the Feature widget uses
 * internally) and by decoding coded-value domains from the field schema.
 *
 * This module is intentionally a leaf: it takes a raw attribute value plus the
 * field's metadata and returns a display string. It does NOT build markup —
 * row assembly is the caller's job (see renderTableFromConfig in shared-code).
 *
 * Lives in query-simple/runtime (not shared-code) on purpose: it imports
 * @arcgis/core, and shared-code deliberately carries zero @arcgis dependencies.
 *
 * See docs/specs/FIELD_TABLE_RENDERER_SPEC.md (Option 3). Introduced r028.109.
 */
import { formatDate, formatNumber, convertDateFormatToIntlOptions } from '@arcgis/core/intl'

/**
 * Per-field metadata needed to format a value the way the layer would.
 * Sourced from the loaded FeatureLayer's field schema (see buildFieldMetaMap).
 */
export interface FieldMeta {
  /** Field name (the attribute key). */
  name: string
  /** Friendly label; falls back to the field name when absent. */
  alias?: string
  /** Esri field type literal, e.g. 'date', 'double', 'integer', 'oid'. */
  type?: string
  /** Coded-value domain entries, when the field has one. */
  codedValues?: Array<{ code: string | number, name: string }>
  /**
   * Esri DateFormat name (e.g. 'short-date', 'short-date-le'). Reserved for the
   * Phase 2 wizard; defaults to DEFAULT_DATE_FORMAT when not set.
   */
  dateFormat?: string
}

/**
 * Default date format. 'short-date-short-time' renders like '8/8/2013, 5:00 PM'
 * (4-digit year + short time), matching what the result card shows today via
 * the Esri Feature widget. The Phase 2 wizard can override per field.
 */
const DEFAULT_DATE_FORMAT = 'short-date-short-time'

/**
 * Esri field types that carry epoch-ms date values. 'time-only' is excluded —
 * it is a clock value, not a date, and formatDate would misrender it.
 */
const DATE_TYPES = new Set(['date', 'date-only', 'timestamp-offset'])

/**
 * Esri numeric field types that benefit from locale grouping/decimals.
 * 'oid' is intentionally excluded so OBJECTIDs are not comma-grouped (e.g. an
 * OBJECTID of 1234 should read '1234', not '1,234').
 */
const NUMBER_TYPES = new Set(['small-integer', 'integer', 'long', 'big-integer', 'single', 'double'])

/**
 * Format a single raw attribute value for display.
 *
 * Resolution order: coded-domain decode → date → number → string. Each
 * formatting branch falls back to the raw stringified value on any error so a
 * single odd value never breaks the whole table.
 */
export function formatFieldValue (raw: any, meta?: FieldMeta): string {
  if (raw == null) return ''

  // 1. Coded-value domain decode (independent of field type). Match on the raw
  //    code, with a string-coerced fallback for number/string code mismatches.
  if (meta?.codedValues?.length) {
    const hit = meta.codedValues.find(
      cv => cv.code === raw || String(cv.code) === String(raw)
    )
    if (hit) return hit.name
  }

  const type = meta?.type

  // 2. Dates — JSAPI returns date fields as epoch-ms; formatDate takes a number
  //    directly. Accept a numeric string too (defensive).
  if (type && DATE_TYPES.has(type)) {
    const ms = typeof raw === 'number' ? raw : Date.parse(raw)
    if (!isNaN(ms)) {
      try {
        const fmt = (meta?.dateFormat ?? DEFAULT_DATE_FORMAT) as any
        return formatDate(ms, convertDateFormatToIntlOptions(fmt))
      } catch {
        return String(raw)
      }
    }
    return String(raw)
  }

  // 3. Numbers — locale grouping/decimals via Esri's formatNumber.
  if (type && NUMBER_TYPES.has(type)) {
    const n = typeof raw === 'number' ? raw : Number(raw)
    if (!isNaN(n)) {
      try {
        return formatNumber(n)
      } catch {
        return String(raw)
      }
    }
    return String(raw)
  }

  // 4. Everything else (strings, guids, etc.) — raw.
  return String(raw)
}

/**
 * Build a name → FieldMeta lookup from a loaded FeatureLayer's fields.
 * Pulls alias, type, and any coded-value domain off the schema. The caller
 * passes layer.fields (each: { name, alias?, type?, domain? }).
 */
export function buildFieldMetaMap (
  fields: Array<{ name: string, alias?: string, type?: string, domain?: any }> | null | undefined
): Record<string, FieldMeta> {
  const map: Record<string, FieldMeta> = {}
  for (const f of fields ?? []) {
    if (!f?.name) continue
    map[f.name] = {
      name: f.name,
      alias: f.alias,
      type: f.type,
      codedValues: f.domain?.codedValues
    }
  }
  return map
}
