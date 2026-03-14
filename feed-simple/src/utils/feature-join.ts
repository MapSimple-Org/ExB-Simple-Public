/**
 * Feature service join utility for FeedSimple Map Integration.
 *
 * Queries a FeatureLayer via the JSAPI queryFeatures() API to retrieve
 * geometries for feed items by matching a join field. This approach
 * respects the layer's definitionExpression and any web map filters,
 * unlike direct REST queries which bypass them.
 *
 * Results are returned as a Map<joinValue, geometry>.
 * Batches large ID sets into groups of 500 to stay within WHERE clause limits.
 */

import { createFeedSimpleDebugLogger } from './debug-logger'

const debugLogger = createFeedSimpleDebugLogger()

/** Max IDs per WHERE IN (...) clause to avoid query limits */
const BATCH_SIZE = 500

/** Geometry object from ArcGIS REST API (simplified — we pass it through, not parse it) */
export interface RestGeometry {
  x?: number
  y?: number
  rings?: number[][][]
  paths?: number[][][]
  spatialReference?: { wkid: number; latestWkid?: number }
  [key: string]: any
}

/**
 * Build a WHERE IN clause for a batch of IDs.
 * Detects numeric vs string values to avoid quoting issues.
 */
export function buildWhereClause (joinField: string, ids: string[]): string {
  const allNumeric = ids.every(id => /^-?\d+(\.\d+)?$/.test(id))
  if (allNumeric) {
    return `${joinField} IN (${ids.join(',')})`
  }
  const escaped = ids.map(id => id.replace(/'/g, "''"))
  return `${joinField} IN (${escaped.map(id => `'${id}'`).join(',')})`
}

/**
 * Query a FeatureLayer by join field values, returning a geometry map.
 * Uses the JSAPI FeatureLayer.queryFeatures() which automatically respects
 * the layer's definitionExpression and web map filters.
 *
 * @param featureLayer - JSAPI FeatureLayer instance (from DataSource or map)
 * @param joinField - Field name on the feature layer to match against
 * @param ids - Array of join values from the feed items
 * @returns Map of joinValue → geometry. Missing/failed items are omitted.
 */
export async function queryFeatureLayerByIds (
  featureLayer: __esri.FeatureLayer,
  joinField: string,
  ids: string[]
): Promise<Map<string, RestGeometry>> {
  const geometryMap = new Map<string, RestGeometry>()

  if (!featureLayer || !joinField || ids.length === 0) {
    return geometryMap
  }

  // Deduplicate IDs
  const uniqueIds = [...new Set(ids)]

  debugLogger.log('JOIN', {
    action: 'query-start',
    layer: featureLayer.title || featureLayer.url,
    joinField,
    idCount: uniqueIds.length,
    batches: Math.ceil(uniqueIds.length / BATCH_SIZE),
    hasDefinitionExpression: !!featureLayer.definitionExpression
  })

  // Batch into groups of BATCH_SIZE
  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const batch = uniqueIds.slice(i, i + BATCH_SIZE)
    try {
      const batchResult = await queryBatch(featureLayer, joinField, batch)
      for (const [key, geom] of batchResult) {
        geometryMap.set(key, geom)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      debugLogger.log('JOIN', {
        action: 'batch-error',
        batchStart: i,
        batchSize: batch.length,
        error: message
      })
      // Continue with remaining batches — partial results are acceptable
    }
  }

  debugLogger.log('JOIN', {
    action: 'query-complete',
    requested: uniqueIds.length,
    matched: geometryMap.size
  })

  return geometryMap
}

/**
 * Query a single batch of IDs against the FeatureLayer.
 * JSAPI queryFeatures() automatically includes the layer's definitionExpression
 * in the request, so features filtered out in the web map are excluded.
 */
async function queryBatch (
  featureLayer: __esri.FeatureLayer,
  joinField: string,
  ids: string[]
): Promise<Map<string, RestGeometry>> {
  const result = new Map<string, RestGeometry>()

  const inClause = buildWhereClause(joinField, ids)

  // createQuery() pre-populates query.where with the layer's definitionExpression.
  // We must AND our IN clause with it, not overwrite it.
  const query = featureLayer.createQuery()
  if (query.where && query.where !== '1=1') {
    query.where = `(${query.where}) AND (${inClause})`
  } else {
    query.where = inClause
  }
  query.outFields = [joinField]
  query.returnGeometry = true

  const featureSet = await featureLayer.queryFeatures(query)

  if (featureSet.features) {
    for (const feature of featureSet.features) {
      const joinValue = String(feature.attributes[joinField] ?? '')
      if (joinValue && feature.geometry) {
        // Convert JSAPI geometry to REST-style geometry for our RestGeometry interface
        const geom = feature.geometry.toJSON() as RestGeometry
        result.set(joinValue, geom)
      }
    }
  }

  return result
}
