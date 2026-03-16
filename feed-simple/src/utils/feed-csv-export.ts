/**
 * CSV export utility for FeedSimple widget.
 *
 * Borrows core patterns from QuerySimple's export-utils.ts (escapeCSVValue,
 * downloadBlob, sanitizeFilename) but simplified for in-memory FeedItem[] data.
 * No DataSource dependency, no zip, no re-query — just pure CSV from items.
 */

import type { FeedItem } from '../utils/parsers/interface'
import { createFeedSimpleDebugLogger } from './debug-logger'

const debugLogger = createFeedSimpleDebugLogger()

// ============================================================================
// Types
// ============================================================================

export interface CsvExportOptions {
  /** Fields to include — empty array means all fields */
  exportFields: string[]
  /** Map of field name → custom column header label */
  columnHeaderLabels: { [field: string]: string }
  /** Filename template — supports {date} token */
  filenameTemplate: string
}

// ============================================================================
// Helpers (borrowed from QS export-utils.ts)
// ============================================================================

/** Escape a value for safe CSV inclusion (handles commas, quotes, newlines) */
function escapeCSVValue (value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value).trim()
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/** Trigger a browser download from a Blob */
function downloadBlob (blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Sanitize a string for use in a filename */
function sanitizeFilename (name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s\-_]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 80) || 'feedsimple-export'
}

// ============================================================================
// CSV Builder
// ============================================================================

/**
 * Build CSV content from FeedItem[] data.
 * Returns a UTF-8 Blob with BOM for proper Excel encoding.
 */
function buildCsvBlob (items: FeedItem[], fields: string[], headerLabels: { [field: string]: string }): Blob {
  if (items.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8' })
  }

  // Header row — use custom labels if provided, otherwise field name
  const header = fields.map(f => escapeCSVValue(headerLabels[f] || f)).join(',')

  // Data rows
  const rows = items.map(item =>
    fields.map(f => escapeCSVValue(item[f])).join(',')
  )

  // BOM + content for proper Excel UTF-8 handling
  const bom = '\uFEFF'
  const csvContent = bom + [header, ...rows].join('\r\n')
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
}

/**
 * Resolve the filename from a template string.
 * Supports {date} token → YYYY-MM-DD format.
 */
function resolveFilename (template: string): string {
  const now = new Date()
  const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
  const resolved = template.replace(/\{date\}/g, dateStr)
  return sanitizeFilename(resolved) + '.csv'
}

/**
 * Determine which fields to export and in what order.
 * If exportFields is specified and non-empty, use those (in order).
 * Otherwise, derive from the items themselves.
 */
function resolveFields (items: FeedItem[], exportFields: string[]): string[] {
  if (exportFields.length > 0) {
    return exportFields
  }

  // Collect all unique field names across all items, preserving insertion order
  const fieldSet = new Set<string>()
  for (const item of items) {
    for (const key of Object.keys(item)) {
      fieldSet.add(key)
    }
  }
  return Array.from(fieldSet)
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Export FeedItem[] to a CSV file download.
 *
 * @param items - The processed items to export (post filter/search/sort, pre-pagination)
 * @param options - Export configuration from widget config
 */
export function exportFeedItemsToCsv (items: FeedItem[], options: CsvExportOptions): void {
  const {
    exportFields = [],
    columnHeaderLabels = {},
    filenameTemplate = 'feedsimple-export-{date}'
  } = options

  if (items.length === 0) {
    debugLogger.log('EXPORT', { action: 'csv-export-skipped', reason: 'no-items' })
    return
  }

  const fields = resolveFields(items, exportFields)
  const filename = resolveFilename(filenameTemplate)
  const blob = buildCsvBlob(items, fields, columnHeaderLabels)

  downloadBlob(blob, filename)

  debugLogger.log('EXPORT', {
    action: 'csv-export-complete',
    filename,
    itemCount: items.length,
    fieldCount: fields.length
  })
}
