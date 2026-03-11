/**
 * direct-query.ts - Direct JS API Query Bypass
 *
 * STATUS: ENABLED (r024.57) - Toggle is USE_DIRECT_QUERY in query-task.tsx.
 * See docs/development/DIRECT_QUERY_BYPASS.md for the full context.
 *
 * WHAT THIS DOES:
 * Uses FeatureLayer.queryFeatures() directly instead of ExB's outputDS.load().
 * This skips the entire ExB DataSource lifecycle: schema resolution, reactive
 * watcher setup, ObservationHandle creation, and internal state management.
 *
 * r024.57: Uses outputDS.buildRecord() to wrap raw Graphics into real
 * FeatureDataRecord objects. ExB's own JSDoc: "Builds a data record only --
 * does not add the record into data source." This gives us full coded domain
 * formatting, getFormattedFieldValue(), clone(), attachments, and complete
 * inter-widget compatibility WITHOUT the reactive machinery that leaks.
 *
 * WHAT IT PROVED (r024.50-54):
 * - ExB's outputDS.load() is the primary source of the ~115 MB/query memory leak
 * - Direct queryFeatures() bypasses the leak entirely
 * - Combined with persistent GroupLayer + persistent Legend FeatureLayers,
 *   the LayerList path stabilized at +1 MB/query after a 2-query warm-up
 * - Non-LL path measured at +1 MB (single record) and +14 MB (160 records)
 * - Queries are noticeably faster without the DataSource overhead
 *
 * REMAINING ITEMS:
 * - exceededTransferLimit is logged but not surfaced to the user
 * - DataSource remains in NotReady state since load() is never called
 * - Pagination not implemented for very large result sets
 *
 * r024.50: Initial scaffold with DirectQueryRecord adapter.
 * r024.55: Disabled for production safety.
 * r024.57: Re-enabled with outputDS.buildRecord() replacing DirectQueryRecord.
 *          All known adapter gaps resolved by using ExB's own record builder.
 */
import { type FeatureLayerDataSource, type FeatureDataRecord } from 'jimu-core'
import { type ImmutableObject } from 'jimu-core'
import { type QueryItemType, FieldsType } from '../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'
import { combineFields, resolvePopupOutFields } from './query-utils'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Determine which fields to request based on query config.
 * Mirrors the field-selection logic in generateQueryParams() but works
 * without needing the outputDS's schema.
 */
function resolveOutFields (
  queryItem: ImmutableObject<QueryItemType>,
  featureLayer: __esri.FeatureLayer,
  outputDS?: FeatureLayerDataSource
): string[] {
  const { resultFieldsType, resultDisplayFields, resultTitleExpression } = queryItem

  if (resultFieldsType === FieldsType.CustomTemplate) {
    const contentExpr = (queryItem as any).resultContentExpression || ''
    return combineFields(null, resultTitleExpression || '', featureLayer.objectIdField, contentExpr)
  }

  if (resultFieldsType === FieldsType.SelectAttributes && resultDisplayFields) {
    return combineFields(resultDisplayFields as any, resultTitleExpression || '', featureLayer.objectIdField)
  }

  // PopupSetting mode / fallback: delegate to shared utility
  if (outputDS) {
    return resolvePopupOutFields(outputDS, featureLayer)
  }

  // No DataSource fallback: all fields from the layer
  return featureLayer.fields.map(f => f.name)
}

/**
 * Execute a query directly against the FeatureLayer via the JS API,
 * bypassing ExB's DataSource.load() entirely.
 *
 * r024.57: Uses outputDS.buildRecord() to wrap raw Graphics into real
 * FeatureDataRecord objects with full coded domain formatting, field
 * aliasing, and complete interface compatibility. No adapter gaps.
 */
export async function executeDirectQuery (
  outputDS: FeatureLayerDataSource,
  queryItem: ImmutableObject<QueryItemType>,
  whereClause: string,
  options: {
    returnGeometry?: boolean
    maxAllowableOffset?: number
    pageSize?: number
    orderByFields?: string[]
    outSpatialReference?: __esri.SpatialReference
  } = {}
): Promise<{
    records: FeatureDataRecord[]
    fields: string[]
    popupTemplate: __esri.PopupTemplate | null
    defaultPopupTemplate: __esri.PopupTemplate | null
    exceededTransferLimit: boolean
  }> {
  const startTime = performance.now()

  // Get the actual FeatureLayer from the DataSource
  const originDS = outputDS.getOriginDataSources()[0] as FeatureLayerDataSource
  const featureLayer = await originDS.createJSAPILayerByDataSource() as __esri.FeatureLayer
  await featureLayer.load()

  const idField = featureLayer.objectIdField || 'OBJECTID'
  const outFields = resolveOutFields(queryItem, featureLayer, outputDS)

  debugLogger.log('DIRECT-QUERY', {
    event: 'executing',
    url: featureLayer.url,
    layerId: featureLayer.layerId,
    where: whereClause,
    outFields: outFields.join(', '),
    fieldsCount: outFields.length,
    idField,
    layerTitle: featureLayer.title
  })

  // Build and execute query
  const query = featureLayer.createQuery()
  query.where = whereClause
  query.outFields = outFields
  query.returnGeometry = options.returnGeometry ?? true
  query.maxAllowableOffset = options.maxAllowableOffset ?? 0.1

  if (options.pageSize) {
    query.num = options.pageSize
  }
  if (options.orderByFields?.length > 0) {
    query.orderByFields = options.orderByFields
  }
  // r024.111: Project results to map's SR to prevent mixed-SR extent unions (BUG-EXTENT-CACHE-001)
  if (options.outSpatialReference) {
    query.outSpatialReference = options.outSpatialReference
  }

  const featureSet = await featureLayer.queryFeatures(query)
  const fetchTime = Math.round(performance.now() - startTime)

  // Set layer references on each graphic (matches what executeQuery does in query-utils.ts)
  featureSet.features.forEach(graphic => {
    graphic.sourceLayer = (featureLayer as any).associatedLayer || featureLayer
    graphic.layer = graphic.sourceLayer
  })

  // r024.57: Use ExB's buildRecord() to create real FeatureDataRecord objects.
  // "Builds a data record only -- does not add the record into data source."
  // This gives us coded domain formatting, getFormattedFieldValue(), clone(),
  // attachments, and full inter-widget compatibility without the reactive leak.
  const records = featureSet.features.map(g => outputDS.buildRecord(g))

  // Get popup template from layer
  const popupTemplate = featureLayer.popupTemplate || null
  const defaultPopupTemplate = (featureLayer as any).defaultPopupTemplate || null

  debugLogger.log('DIRECT-QUERY', {
    event: 'complete',
    fetchTime,
    recordCount: records.length,
    recordType: 'FeatureDataRecord (via buildRecord)',
    hasPopupTemplate: !!popupTemplate,
    hasDefaultPopupTemplate: !!defaultPopupTemplate,
    geometryType: featureSet.geometryType,
    exceededTransferLimit: featureSet.exceededTransferLimit
  })

  return {
    records,
    fields: outFields,
    popupTemplate,
    defaultPopupTemplate,
    exceededTransferLimit: featureSet.exceededTransferLimit ?? false
  }
}
