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
 * @version r025.048
 */
import { DataSourceManager, Immutable, type FeatureLayerDataSource, type FeatureDataRecord, type UseDataSource } from 'jimu-core'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { combineFields, resolvePopupOutFields } from './query-utils'
import { FieldsType, type QueryItemType } from '../config'

const debugLogger = createQuerySimpleDebugLogger()

// ─── Types ──────────────────────────────────────────────────────────

export interface SpatialQueryParams {
  /** Source geometry to query against (unioned accumulated record geometries) */
  inputGeometry: __esri.Geometry
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
  featureSet: __esri.FeatureSet
  queryTimeMs: number
  exceededTransferLimit: boolean
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
    inputGeometry, spatialRelationship, targetLayerIds,
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
    inputGeometryType: inputGeometry.type
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

      const featureLayer = (ds.layer || await (ds as any).createJSAPILayerByDataSource()) as __esri.FeatureLayer
      await featureLayer.load()

      // Build JSAPI Query with spatial parameters
      const query = featureLayer.createQuery()
      query.geometry = inputGeometry
      query.spatialRelationship = spatialRelationship as any
      query.returnGeometry = true

      // Resolve outFields — use spatial default query config's field settings if available,
      // otherwise fall back to popup info. Same 3-branch pattern as direct-query.ts resolveOutFields().
      const defaultConfig = params.layerDefaultConfigs?.[layerId]
      if (defaultConfig) {
        const { resultFieldsType, resultDisplayFields, resultTitleExpression } = defaultConfig
        if (resultFieldsType === FieldsType.CustomTemplate) {
          const contentExpr = (defaultConfig as any).resultContentExpression || ''
          query.outFields = combineFields(null, resultTitleExpression || '', featureLayer.objectIdField, contentExpr)
        } else if (resultFieldsType === FieldsType.SelectAttributes && resultDisplayFields) {
          query.outFields = combineFields(resultDisplayFields as any, resultTitleExpression || '', featureLayer.objectIdField)
        } else {
          query.outFields = resolvePopupOutFields(ds, featureLayer)
        }
      } else {
        query.outFields = resolvePopupOutFields(ds, featureLayer)
      }

      // Buffer distance/unit handled server-side by JSAPI
      if (bufferDistance && bufferDistance > 0) {
        query.distance = bufferDistance
        query.units = bufferUnit as any
      }

      const featureSet = await featureLayer.queryFeatures(query)
      const layerTime = Math.round(performance.now() - layerStart)

      layerResults.push({
        layerId,
        layerTitle: featureLayer.title || layerId,
        featureCount: featureSet.features.length,
        featureSet,
        queryTimeMs: layerTime,
        exceededTransferLimit: featureSet.exceededTransferLimit ?? false
      })

      debugLogger.log('SPATIAL', {
        event: 'spatial-query-layer-complete',
        widgetId,
        layerId,
        layerTitle: featureLayer.title,
        featureCount: featureSet.features.length,
        outFieldCount: query.outFields.length,
        queryTimeMs: layerTime,
        exceededTransferLimit: featureSet.exceededTransferLimit,
        geometryType: featureSet.geometryType
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

    const featureLayer = ds.layer as __esri.FeatureLayer

    // Set sourceLayer on each graphic (matches direct-query.ts pattern)
    layerResult.featureSet.features.forEach(graphic => {
      graphic.sourceLayer = featureLayer?.associatedLayer || featureLayer
      graphic.layer = graphic.sourceLayer
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
