/**
 * r028.130: Pure transformation behind "Copy query to another widget"
 * (see query-item-list.tsx handleCopyToWidget). Extracted so the copy logic
 * is unit-testable without React or the builder app-config API.
 *
 * Given a source query, a target widget, and an injected new configId, it returns:
 *  - the regenerated query item (new configId + outputDataSourceId on the target prefix),
 *  - the target's queryItems with that item inserted at the same index,
 *  - the target's useDataSources with the source layer added if missing,
 *  - the cloned output data source (source's, with the new id) or null.
 *
 * All plain JS in/out; the React handler does the Immutable boundary conversions.
 */

export interface QueryCopyParams {
  sourceQuery: any
  sourceIndex: number
  targetWidgetId: string
  targetQueryItems: any[]
  targetUseDataSources: any[]
  sourceOutputDs: any | null
  newConfigId: string
}

export interface QueryCopyPayload {
  copiedQuery: any
  newQueryItems: any[]
  newUseDataSources: any[]
  clonedOutputDs: any | null
}

export function buildQueryCopyPayload (params: QueryCopyParams): QueryCopyPayload {
  const {
    sourceQuery, sourceIndex, targetWidgetId,
    targetQueryItems, targetUseDataSources, sourceOutputDs, newConfigId
  } = params

  const newOutputDsId = `${targetWidgetId}_output_${newConfigId}`

  // Regenerate the collision-prone IDs; carry everything else verbatim.
  const copiedQuery = {
    ...sourceQuery,
    configId: newConfigId,
    outputDataSourceId: newOutputDsId,
    searchAlias: sourceQuery.searchAlias ? `${sourceQuery.searchAlias}_copy` : undefined,
    shortId: sourceQuery.shortId ? `${sourceQuery.shortId}_copy` : undefined
  }

  // Insert at the same index the query had in the source, clamped to the target length.
  const newQueryItems = [...(targetQueryItems || [])]
  const insertAt = Math.min(sourceIndex, newQueryItems.length)
  newQueryItems.splice(insertAt, 0, copiedQuery)

  // Ensure the target uses the source layer (add only if it isn't already there).
  let newUseDataSources = [...(targetUseDataSources || [])]
  const srcUseDs = sourceQuery.useDataSource
  if (srcUseDs && !newUseDataSources.some(u => u && u.dataSourceId === srcUseDs.dataSourceId)) {
    newUseDataSources.push(srcUseDs)
  }

  // Clone the source query's registered output DS for the new id (no widget back-reference).
  const clonedOutputDs = sourceOutputDs ? { ...sourceOutputDs, id: newOutputDsId } : null

  return { copiedQuery, newQueryItems, newUseDataSources, clonedOutputDs }
}
