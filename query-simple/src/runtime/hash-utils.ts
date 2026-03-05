/**
 * Hash URL manipulation utilities.
 *
 * Centralizes all hash parameter read/write operations that were previously
 * scattered across query-result.tsx, widget.tsx, url-consumption-manager.ts,
 * and selection-utils.ts.
 *
 * All write functions preserve pathname and query string — only the hash is modified.
 *
 * @since 1.19.0-r024.118
 */
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Parse the current URL hash into URLSearchParams. */
function getHashParams(): { hash: string, urlParams: URLSearchParams } {
  const hash = window.location.hash.substring(1)
  return { hash, urlParams: new URLSearchParams(hash) }
}

/** Write updated URLSearchParams back to the URL hash via replaceState. */
function commitHash(urlParams: URLSearchParams): void {
  const newHash = urlParams.toString()
  window.history.replaceState(null, '',
    window.location.pathname + window.location.search + (newHash ? `#${newHash}` : '')
  )
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Remove a single key from the URL hash.
 *
 * @returns true if the hash was modified, false if the key was not present.
 */
export function removeHashParam(key: string): boolean {
  if (!key) return false

  const { urlParams } = getHashParams()

  if (!urlParams.has(key)) return false

  urlParams.delete(key)
  commitHash(urlParams)

  debugLogger.log('HASH', {
    event: 'removeHashParam',
    key,
    newHash: urlParams.toString() || '(empty)',
    timestamp: Date.now()
  })

  return true
}

/**
 * Remove a record ID from ID-style hash parameters.
 *
 * Checks the common ID parameter names (id, pin, major, parcel, shortId).
 * Each parameter may contain comma-separated IDs — only the matching ID is
 * removed. If no IDs remain after removal the parameter is deleted entirely.
 *
 * @returns true if any hash parameter was modified.
 */
export function removeRecordIdFromHashParams(dataId: string): boolean {
  const { urlParams } = getHashParams()
  const idParamKeys = ['id', 'pin', 'major', 'parcel', 'shortId']
  let modified = false

  idParamKeys.forEach(paramKey => {
    if (!urlParams.has(paramKey)) return

    const currentValue = urlParams.get(paramKey) || ''
    const ids = currentValue.split(',').map(id => id.trim()).filter(id => id)
    const filteredIds = ids.filter(id => id !== dataId)

    if (filteredIds.length !== ids.length) {
      if (filteredIds.length > 0) {
        urlParams.set(paramKey, filteredIds.join(','))
      } else {
        urlParams.delete(paramKey)
      }
      modified = true
    }
  })

  if (modified) {
    commitHash(urlParams)
    debugLogger.log('HASH', {
      event: 'removeRecordIdFromHashParams',
      dataId,
      newHash: urlParams.toString() || '(empty)',
      timestamp: Date.now()
    })
  }

  return modified
}

/**
 * Surgically remove a record ID from the `data_s` hash parameter.
 *
 * Experience Builder encodes selection state in `data_s` using the format:
 *   `id:<dsId>:<recordId1>,<recordId2>,...`
 *
 * Compound datasource IDs use `~` separators (e.g., `dataSource_1~widget_12_output_0`).
 * This function finds the entry matching the widget's output pattern and removes
 * just the specified record ID. If no records remain the entry is deleted.
 *
 * @returns true if the hash was modified.
 */
export function removeRecordIdFromDataS(dataId: string, widgetId: string): boolean {
  const { urlParams } = getHashParams()

  if (!urlParams.has('data_s')) return false

  const dataS = urlParams.get('data_s') || ''
  const decodedDataS = decodeURIComponent(dataS)
  const selections = decodedDataS.split(',')

  const widgetMatch = widgetId.match(/widget_(\d+)/)
  if (!widgetMatch) return false

  const widgetNumber = widgetMatch[1]
  const widgetPattern = new RegExp(`widget_${widgetNumber}_output_\\d+`)

  let dataSModified = false
  const updatedSelections = selections.map(selection => {
    if (!selection.startsWith('id:')) return selection

    const idPart = selection.substring(3) // Remove "id:"
    const colonIndex = idPart.lastIndexOf(':')
    if (colonIndex === -1) return selection

    const dsIdPart = idPart.substring(0, colonIndex)
    const recordIdsPart = idPart.substring(colonIndex + 1)

    // Check if this matches our widget's output DS pattern
    let matchesWidget = false
    if (dsIdPart.includes('~')) {
      const parts = dsIdPart.split('~')
      matchesWidget = parts.some(part => part.match(widgetPattern))
    } else {
      matchesWidget = dsIdPart.match(widgetPattern) !== null
    }

    if (!matchesWidget) return selection

    const recordIds = recordIdsPart.split(',').map(id => id.trim()).filter(id => id)
    const filteredRecordIds = recordIds.filter(id => id !== dataId)

    if (filteredRecordIds.length === recordIds.length) return selection

    dataSModified = true
    debugLogger.log('HASH', {
      event: 'data_s-record-removed',
      widgetId,
      removedRecordId: dataId,
      originalRecordCount: recordIds.length,
      newRecordCount: filteredRecordIds.length,
      dsIdPart,
      timestamp: Date.now()
    })

    if (filteredRecordIds.length === 0) return ''
    return `id:${dsIdPart}:${filteredRecordIds.join(',')}`
  }).filter(s => s)

  if (!dataSModified) return false

  if (updatedSelections.length > 0) {
    urlParams.set('data_s', encodeURIComponent(updatedSelections.join(',')))
  } else {
    urlParams.delete('data_s')
  }

  commitHash(urlParams)

  debugLogger.log('HASH', {
    event: 'data_s-surgically-modified',
    widgetId,
    removedRecordId: dataId,
    originalSelectionCount: selections.length,
    newSelectionCount: updatedSelections.length,
    timestamp: Date.now()
  })

  return true
}

/**
 * Remove the entire `data_s` parameter from the URL hash.
 *
 * Experience Builder adds `data_s` when selections are made but does not
 * remove it when the widget closes, causing "dirty hash" issues.
 *
 * @returns true if the hash was modified.
 */
export function clearDataSFromHash(): boolean {
  const { urlParams } = getHashParams()

  if (!urlParams.has('data_s')) return false

  urlParams.delete('data_s')
  commitHash(urlParams)

  debugLogger.log('HASH', {
    event: 'clearDataSFromHash',
    newHash: urlParams.toString() || '(empty)',
    timestamp: Date.now()
  })

  return true
}
