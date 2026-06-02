/**
 * Spatial Query Execution Utility
 *
 * Standalone function that executes spatial queries against target FeatureLayers
 * using JSAPI's FeatureLayer.queryFeatures(). Independent of the existing attribute
 * query pipeline (outputDS, queryItem, etc.).
 *
 * JSAPI handles buffer distance server-side via query.distance + query.units,
 * so no client-side buffer pre-computation is needed.
 *
 * r025.048: Spatial result default — use designated query's field/rendering settings
 * r028.101: Multi-geometry input — accepts an array of input geometries (one per type),
 *   runs the query once per geometry, and dedupes matches by objectId per layer so a
 *   mixed-type spatial query (e.g. drawn line + drawn polygon) no longer drops parts.
 * @version r028.101
 */
import { DataSourceManager, Immutable, type FeatureLayerDataSource, type FeatureDataRecord, type UseDataSource } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { combineFields, resolvePopupOutFields } from './query-utils'
import { FieldsType, type QueryItemType } from '../config'
import type Geometry from '@arcgis/core/geometry/Geometry'
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import type FeatureSet from '@arcgis/core/rest/support/FeatureSet'
import type Graphic from '@arcgis/core/Graphic'

const debugLogger = createQuerySimpleDebugLogger()

// ─── Types ──────────────────────────────────────────────────────────

export interface SpatialQueryParams {
  /** Source geometries to query against, one per geometry type (already unioned
   *  within each type by the caller). The query runs once per geometry and matches
   *  are deduped by objectId per layer, so mixed-type input is not dropped. */
  inputGeometries: Geometry[]
  /** JSAPI spatial relationship string (e.g., 'intersects', 'contains', 'within') */
  spatialRelationship: string
  /** Target layer dataSourceId strings */
  targetLayerIds: string[]
  /** Full UseDataSource configs for lazy DS creation (group layer children need rootDataSourceId) */
  targetUseDataSources?: Record<string, UseDataSource>
  /** Optional buffer distance (0 or undefined = no buffer) */
  bufferDistance?: number
  /** Buffer unit ('feet' | 'miles' | 'meters' | 'kilometers') */
  bufferUnit?: string
  /** Widget ID for debug logging */
  widgetId: string
  /** Per-layer spatial default query configs — used for outField resolution */
  layerDefaultConfigs?: Record<string, QueryItemType>
}

export interface SpatialQueryLayerResult {
  layerId: string
  layerTitle: string
  featureCount: number
  featureSet: FeatureSet
  queryTimeMs: number
  exceededTransferLimit: boolean
  /**
   * r028.122: When genuinely truncated, the true matching count for this layer (from
   * queryFeatureCount). For a single input geometry this is exact; for multiple input
   * geometries it is the largest per-sub-query true count — a LOWER BOUND, since the
   * unique union across geometries can't be cheaply deduped. Undefined when not truncated
   * or when the count couldn't be fetched.
   */
  trueMatchCount?: number
}

export interface SpatialQueryResult {
  layerResults: SpatialQueryLayerResult[]
  totalFeatureCount: number
  totalTimeMs: number
  errors: Array<{ layerId: string; error: string }>
}

// ─── Execution ──────────────────────────────────────────────────────

export async function executeSpatialQuery (
  params: SpatialQueryParams
): Promise<SpatialQueryResult> {
  const {
    inputGeometries, spatialRelationship, targetLayerIds,
    targetUseDataSources, bufferDistance, bufferUnit, widgetId
  } = params

  const overallStart = performance.now()
  const layerResults: SpatialQueryLayerResult[] = []
  const errors: Array<{ layerId: string; error: string }> = []

  debugLogger.log('SPATIAL', {
    event: 'spatial-query-start',
    widgetId,
    spatialRelationship,
    targetLayerCount: targetLayerIds.length,
    hasBuffer: (bufferDistance || 0) > 0,
    bufferDistance,
    bufferUnit,
    inputGeometryCount: inputGeometries.length,
    inputGeometryTypes: inputGeometries.map(g => g.type)
  })

  // Execute against each target layer sequentially (avoid overwhelming shared ArcGIS Server)
  for (const layerId of targetLayerIds) {
    const layerStart = performance.now()
    try {
      // Resolve FeatureLayer from dataSourceId — create if not yet instantiated
      let ds = DataSourceManager.getInstance().getDataSource(layerId) as FeatureLayerDataSource
      if (!ds && targetUseDataSources?.[layerId]) {
        // DataSource may not be instantiated yet (group layer children are lazy-loaded).
        // Use the full UseDataSource config (including rootDataSourceId) so ExB can
        // resolve the parent chain for nested group layer children.
        try {
          ds = await DataSourceManager.getInstance().createDataSourceByUseDataSource(
            Immutable(targetUseDataSources[layerId])
          ) as FeatureLayerDataSource
        } catch {
          errors.push({ layerId, error: `Layer not available: ${layerId}` })
          continue
        }
      }
      if (!ds) {
        errors.push({ layerId, error: `Layer not available: ${layerId}` })
        continue
      }

      const featureLayer = (ds.layer || await (ds as any).createJSAPILayerByDataSource()) as FeatureLayer
      await featureLayer.load()

      // Resolve outFields once per layer — use spatial default query config's field
      // settings if available, otherwise fall back to popup info. Same 3-branch pattern
      // as direct-query.ts resolveOutFields().
      let outFields: string[]
      const defaultConfig = params.layerDefaultConfigs?.[layerId]
      if (defaultConfig) {
        const { resultFieldsType, resultDisplayFields, resultTitleExpression } = defaultConfig
        if (resultFieldsType === FieldsType.CustomTemplate) {
          const contentExpr = (defaultConfig as any).resultContentExpression || ''
          outFields = combineFields(null, resultTitleExpression || '', featureLayer.objectIdField, contentExpr)
        } else if (resultFieldsType === FieldsType.SelectAttributes && resultDisplayFields) {
          outFields = combineFields(resultDisplayFields as any, resultTitleExpression || '', featureLayer.objectIdField)
        } else {
          outFields = resolvePopupOutFields(ds, featureLayer)
        }
      } else {
        outFields = resolvePopupOutFields(ds, featureLayer)
      }

      // r028.101: Run the query once per input geometry (one per geometry type) and
      // dedupe matches by objectId, so a feature hit by more than one type (e.g. a
      // parcel intersecting both a drawn line and a drawn polygon) is counted once.
      // The buffered case passes a single unioned polygon, so this loop runs once.
      const oidField = featureLayer.objectIdField
      const dedupedById = new Map<number | string | Graphic, Graphic>()
      let exceededTransferLimit = false
      let lastFeatureSet: FeatureSet | null = null
      // r028.122: largest per-sub-query true count among genuinely-truncated sub-queries —
      // the layer's true total (exact for one input geometry, lower bound for several).
      let maxTrueCount = 0

      let geometryIndex = 0
      for (const geom of inputGeometries) {
        const query = featureLayer.createQuery()
        query.geometry = geom
        query.spatialRelationship = spatialRelationship as any
        query.returnGeometry = true
        query.outFields = outFields

        // Buffer distance/unit handled server-side by JSAPI
        if (bufferDistance && bufferDistance > 0) {
          query.distance = bufferDistance
          query.units = bufferUnit as any
        }

        const featureSet = await featureLayer.queryFeatures(query)
        lastFeatureSet = featureSet
        const subExceeded = featureSet.exceededTransferLimit ?? false

        // r028.121: A sub-query is only TRULY truncated if the service's true matching count
        // exceeds what it returned. Some services (notably older ArcGIS Server MapServices on
        // a multipart geometry like a multipoint) set exceededTransferLimit even when they
        // returned every match. So when the flag is set, verify with a count-only query
        // (returnCountOnly — a few bytes, not subject to maxRecordCount): if trueCount equals
        // what we got, nothing was missed and the flag is spurious. Only runs on flagged
        // sub-queries, so zero overhead on the normal path. If the count query can't be
        // fetched, fall back to trusting the flag so a genuine truncation is never hidden.
        let trueCount: number | null = null
        if (subExceeded) {
          try {
            const countQuery = featureLayer.createQuery()
            countQuery.geometry = geom
            countQuery.spatialRelationship = spatialRelationship as any
            countQuery.returnGeometry = false
            if (bufferDistance && bufferDistance > 0) {
              countQuery.distance = bufferDistance
              countQuery.units = bufferUnit as any
            }
            trueCount = await featureLayer.queryFeatureCount(countQuery)
          } catch (countErr) {
            debugLogger.log('SPATIAL', {
              event: 'spatial-subquery-count-error',
              widgetId,
              layerId,
              geometryIndex,
              error: countErr instanceof Error ? countErr.message : String(countErr)
            })
          }
        }

        // Genuinely truncated only if the true count exceeds what we returned (or we flagged
        // but couldn't verify the count). This — not the raw service flag — drives the alert.
        const subTruncated = subExceeded && (trueCount != null ? trueCount > featureSet.features.length : true)
        exceededTransferLimit = exceededTransferLimit || subTruncated
        if (subTruncated && trueCount != null && trueCount > maxTrueCount) maxTrueCount = trueCount

        debugLogger.log('SPATIAL', {
          event: 'spatial-subquery-complete',
          widgetId,
          layerId,
          geometryIndex,
          geometryType: geom.type,
          returnedCount: featureSet.features.length,
          exceededTransferLimit: subExceeded, // raw service flag for this sub-query
          trueCount, // null unless this sub-query was flagged
          actuallyTruncated: trueCount != null ? trueCount > featureSet.features.length : null,
          countedAsTruncated: subTruncated // r028.121: what actually drives the alert
        })

        for (const feature of featureSet.features) {
          const oid = feature.attributes?.[oidField]
          // Fall back to object identity when a feature lacks an objectId: without one
          // we can't prove it's a duplicate, so keep it rather than risk dropping it.
          const key: number | string | Graphic = oid != null ? oid : feature
          if (!dedupedById.has(key)) dedupedById.set(key, feature)
        }
        geometryIndex++
      }

      const layerTime = Math.round(performance.now() - layerStart)

      // Defensive: no geometries queried (caller guards against empty input)
      if (!lastFeatureSet) continue

      // Reuse the last FeatureSet as the carrier for the combined, deduped features.
      // geometryType / spatialReference are preserved; only the feature list changes.
      const combinedFeatures = [...dedupedById.values()]
      lastFeatureSet.features = combinedFeatures

      layerResults.push({
        layerId,
        layerTitle: featureLayer.title || layerId,
        featureCount: combinedFeatures.length,
        featureSet: lastFeatureSet,
        queryTimeMs: layerTime,
        exceededTransferLimit,
        trueMatchCount: exceededTransferLimit && maxTrueCount > 0 ? maxTrueCount : undefined
      })

      debugLogger.log('SPATIAL', {
        event: 'spatial-query-layer-complete',
        widgetId,
        layerId,
        layerTitle: featureLayer.title,
        featureCount: combinedFeatures.length,
        inputGeometryCount: inputGeometries.length,
        outFieldCount: outFields.length,
        queryTimeMs: layerTime,
        exceededTransferLimit,
        geometryType: lastFeatureSet.geometryType
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      errors.push({ layerId, error: errorMsg })
      debugLogger.log('SPATIAL', {
        event: 'spatial-query-layer-error',
        widgetId,
        layerId,
        error: errorMsg
      })
    }
  }

  const totalTimeMs = Math.round(performance.now() - overallStart)
  const totalFeatureCount = layerResults.reduce((sum, r) => sum + r.featureCount, 0)

  return { layerResults, totalFeatureCount, totalTimeMs, errors }
}

// ─── Record Conversion ──────────────────────────────────────────────

/**
 * Converts spatial query FeatureSet results into FeatureDataRecord objects.
 * Uses each target layer's DataSource.buildRecord() for proper field formatting.
 * Matches the pattern in direct-query.ts (graphic.sourceLayer + buildRecord).
 */
export function convertSpatialResultsToRecords (
  result: SpatialQueryResult,
  widgetId: string,
  layerDefaultConfigIds?: Record<string, string>
): FeatureDataRecord[] {
  const allRecords: FeatureDataRecord[] = []

  for (const layerResult of result.layerResults) {
    if (layerResult.featureCount === 0) continue

    const ds = DataSourceManager.getInstance().getDataSource(layerResult.layerId) as FeatureLayerDataSource
    if (!ds) {
      debugLogger.log('SPATIAL', {
        event: 'convert-records-ds-not-found',
        layerId: layerResult.layerId,
        widgetId
      })
      continue
    }

    const featureLayer = ds.layer as FeatureLayer

    // Stamp the source layer on each graphic. JSAPI 5.0 removed both
    // Graphic.sourceLayer and FeatureLayer.associatedLayer; Graphic.layer
    // is still present and is what popup-render-pool / feature-info read.
    layerResult.featureSet.features.forEach(graphic => {
      graphic.layer = featureLayer
    })

    // Build FeatureDataRecords using the target layer's DataSource
    const records = layerResult.featureSet.features.map(graphic => {
      const record = ds.buildRecord(graphic) as FeatureDataRecord

      // Stamp identification attributes for downstream pipeline
      if (record.feature?.attributes) {
        record.feature.attributes.__queryConfigId = layerDefaultConfigIds?.[layerResult.layerId] || 'spatial'
        record.feature.attributes.__originDSId = ds.id
        record.feature.attributes.__spatialLayerTitle = layerResult.layerTitle
      }

      return record
    })

    allRecords.push(...records)

    debugLogger.log('SPATIAL', {
      event: 'convert-records-layer-complete',
      widgetId,
      layerId: layerResult.layerId,
      layerTitle: layerResult.layerTitle,
      recordsBuilt: records.length
    })
  }

  return allRecords
}
