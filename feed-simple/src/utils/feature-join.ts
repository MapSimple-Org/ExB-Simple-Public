/**
 * Feature service join utility for FeedSimple Map Integration.
 *
 * Queries a feature service REST endpoint to retrieve geometries for feed items
 * by matching a join field. Results are returned as a Map<joinValue, geometry>.
 *
 * Uses esriRequest (JSAPI) which auto-attaches portal/AGOL auth tokens.
 * Batches large ID sets into groups of 500 to stay within URL/query limits.
 */

import esriRequest from 'esri/request'
import { createFeedSimpleDebugLogger } from './debug-logger'

const debugLogger = createFeedSimpleDebugLogger()

/** Max IDs per WHERE IN (...) clause to avoid URL length limits */
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

/** Single feature from ArcGIS REST API query response */
interface RestFeature {
  attributes: Record<string, any>
  geometry?: RestGeometry
}

/** ArcGIS REST API query response */
interface RestQueryResponse {
  features?: RestFeature[]
  spatialReference?: { wkid: number; latestWkid?: number }
  error?: { code: number; message: string }
}

/**
 * Query a feature service by join field values, returning a geometry map.
 *
 * @param featureServiceUrl - REST endpoint URL (e.g., .../FeatureServer/0)
 * @param joinField - Field name on the feature service to match against
 * @param ids - Array of join values from the feed items
 * @returns Map of joinValue → geometry. Missing/failed items are omitted.
 */
export async function queryFeatureServiceByIds (
  featureServiceUrl: string,
  joinField: string,
  ids: string[]
): Promise<Map<string, RestGeometry>> {
  const geometryMap = new Map<string, RestGeometry>()

  if (!featureServiceUrl || !joinField || ids.length === 0) {
    return geometryMap
  }

  // Deduplicate IDs
  const uniqueIds = [...new Set(ids)]

  debugLogger.log('JOIN', {
    action: 'query-start',
    url: featureServiceUrl,
    joinField,
    idCount: uniqueIds.length,
    batches: Math.ceil(uniqueIds.length / BATCH_SIZE)
  })

  // Batch into groups of BATCH_SIZE
  for (let i = 0; i < uniqueIds.length; i += BATCH_SIZE) {
    const batch = uniqueIds.slice(i, i + BATCH_SIZE)
    try {
      const batchResult = await queryBatch(featureServiceUrl, joinField, batch)
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
 * Query a single batch of IDs against the feature service.
 * Uses esriRequest which auto-attaches the user's portal/AGOL token.
 */
async function queryBatch (
  featureServiceUrl: string,
  joinField: string,
  ids: string[]
): Promise<Map<string, RestGeometry>> {
  const result = new Map<string, RestGeometry>()

  // Build WHERE clause: joinField IN (val1,val2,...)
  // If all values look numeric, don't quote (numeric fields fail with quoted values).
  // Otherwise quote as strings with escaped single quotes.
  const allNumeric = ids.every(id => /^-?\d+(\.\d+)?$/.test(id))
  let whereClause: string
  if (allNumeric) {
    whereClause = `${joinField} IN (${ids.join(',')})`
  } else {
    const escaped = ids.map(id => id.replace(/'/g, "''"))
    whereClause = `${joinField} IN (${escaped.map(id => `'${id}'`).join(',')})`
  }

  const queryUrl = `${featureServiceUrl}/query`

  const response = await esriRequest(queryUrl, {
    query: {
      where: whereClause,
      outFields: joinField,
      returnGeometry: true,
      f: 'json'
    },
    responseType: 'json'
  })

  const data: RestQueryResponse = response.data

  if (data.error) {
    throw new Error(`Feature service error: ${data.error.message} (code ${data.error.code})`)
  }

  if (data.features) {
    // Attach response-level spatialReference to each geometry (REST returns it separately)
    const sr = data.spatialReference
    for (const feature of data.features) {
      const joinValue = String(feature.attributes[joinField] ?? '')
      if (joinValue && feature.geometry) {
        if (sr && !feature.geometry.spatialReference) {
          feature.geometry.spatialReference = sr
        }
        result.set(joinValue, feature.geometry)
      }
    }
  }

  return result
}
