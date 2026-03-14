/**
 * Map interaction utilities for FeedSimple.
 *
 * Pure functions for map integration logic: config checks, geometry type
 * inference, zoom target computation, popup identification, and geometry queries.
 * The widget owns all mutable state (mapView, geometryMap, previousJoinIds)
 * and passes values in as parameters.
 */

import { DataSourceManager } from 'jimu-core'
import Popup from 'esri/widgets/Popup'
import type { FeedItem } from './parsers/interface'
import { queryFeatureLayerByIds, type RestGeometry } from './feature-join'
import { createFeedSimpleDebugLogger } from './debug-logger'

const debugLogger = createFeedSimpleDebugLogger()

// ── Config Check ──────────────────────────────────────────────────

/**
 * Whether all map integration settings are configured (layer DS + both join fields).
 */
export function isMapIntegrationConfigured (
  useDataSources: any[] | undefined,
  config: { joinFieldService: string; joinFieldFeed: string }
): boolean {
  return !!(
    useDataSources?.length > 0 &&
    config.joinFieldService &&
    config.joinFieldFeed
  )
}

// ── Geometry Type Inference ───────────────────────────────────────

/**
 * Add a `type` property to a REST geometry for JSAPI autocasting.
 * REST JSON responses omit `type`, but JSAPI requires it.
 */
export function inferGeometryType (restGeom: RestGeometry): RestGeometry & { type: string } {
  const geometry = { ...restGeom } as RestGeometry & { type: string }
  if (geometry.x !== undefined && geometry.y !== undefined) {
    geometry.type = 'point'
  } else if (geometry.rings) {
    geometry.type = 'polygon'
  } else if (geometry.paths) {
    geometry.type = 'polyline'
  } else if ((geometry as any).points) {
    geometry.type = 'multipoint'
  }
  return geometry
}

// ── Zoom Target ───────────────────────────────────────────────────

/**
 * Build the goTo target for MapView.goTo().
 * Points zoom to a specific level; lines/polygons expand the extent by a buffer factor.
 */
export function buildGoToTarget (
  graphic: __esri.Graphic,
  geometryType: string,
  zoomFactorPoint: number,
  zoomFactorPoly: number
): any {
  if (geometryType === 'point') {
    return { target: graphic, zoom: zoomFactorPoint }
  }
  return (graphic.geometry as __esri.Polygon | __esri.Polyline).extent.expand(zoomFactorPoly)
}

// ── Pan Target ────────────────────────────────────────────────────

/**
 * Build a goTo target that pans (centers) without changing zoom.
 * Points use the point directly; lines/polygons use the extent center.
 */
export function buildPanTarget (
  graphic: __esri.Graphic,
  geometryType: string
): { center: __esri.Point } {
  if (geometryType === 'point') {
    return { center: graphic.geometry as __esri.Point }
  }
  const extent = (graphic.geometry as __esri.Polygon | __esri.Polyline).extent
  return { center: extent.center }
}

// ── Feature Identification (Popup) ────────────────────────────────

export interface IdentifyParams {
  mapView: __esri.MapView | __esri.SceneView
  dataSourceId: string
  joinField: string
  joinValue: string
}

/**
 * Find the matching feature on the map's FeatureLayer and open its popup.
 * Uses the layer's configured popup template for a native identify experience.
 * Handles ExB's lazy popup initialization.
 */
export async function identifyFeatureOnMap (params: IdentifyParams): Promise<void> {
  const { mapView, dataSourceId, joinField, joinValue } = params
  if (!mapView) return

  // Find the FeatureLayer on the map by matching the origin DS URL
  const originDs = DataSourceManager.getInstance().getDataSource(dataSourceId)
  const dsUrl = originDs?.getDataSourceJson()?.url as string
  if (!dsUrl) return

  // Search all layers (including sublayers of group layers)
  const featureLayer = mapView.map.allLayers.find((layer: any) => {
    return layer.type === 'feature' && layer.url && dsUrl.toLowerCase().includes(layer.url.toLowerCase())
  }) as __esri.FeatureLayer | undefined

  if (!featureLayer) {
    debugLogger.log('JOIN', { action: 'identify-no-layer', dsUrl })
    return
  }

  try {
    // Query the actual layer for the feature with all attributes
    const allNumeric = /^-?\d+(\.\d+)?$/.test(joinValue)
    const where = allNumeric
      ? `${joinField} = ${joinValue}`
      : `${joinField} = '${joinValue.replace(/'/g, "''")}'`

    const result = await featureLayer.queryFeatures({
      where,
      outFields: ['*'],
      returnGeometry: true
    })

    if (result.features.length > 0) {
      const feature = result.features[0]

      // ExB lazy-initializes the popup — if open() isn't available, create a real Popup instance
      if (!mapView.popup || typeof mapView.popup.open !== 'function') {
        mapView.popup = new Popup({ view: mapView })
      }

      mapView.popup.open({
        features: [feature],
        location: feature.geometry.type === 'point'
          ? feature.geometry as __esri.Point
          : (feature.geometry as __esri.Polygon | __esri.Polyline).extent?.center
      })
      debugLogger.log('JOIN', { action: 'identify-opened', joinValue, oid: feature.attributes[featureLayer.objectIdField] })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    debugLogger.log('JOIN', { action: 'identify-error', joinValue, error: message })
  }
}

// ── Geometry Query ────────────────────────────────────────────────

export interface QueryGeometriesParams {
  items: FeedItem[]
  joinFieldFeed: string
  joinFieldService: string
  dataSourceId: string
  /** JSAPI MapView — used to find the actual map layer (which has definitionExpression) */
  mapView: __esri.MapView | __esri.SceneView | null
  /** Current set of join IDs from previous query — used for skip optimization */
  previousJoinIds: Set<string>
}

export interface QueryGeometriesResult {
  geometryMap: Map<string, RestGeometry>
  /** Updated join IDs — caller should store this for next cycle's comparison */
  newJoinIds: Set<string>
  /** True if query was skipped because join IDs haven't changed */
  skipped: boolean
}

/**
 * Query the feature layer for geometries matching feed items.
 * Finds the actual FeatureLayer on the map (which carries the web map's
 * definitionExpression and filters), then queries via JSAPI queryFeatures().
 * Skips re-query if join IDs haven't changed since last call.
 * Returns results for the caller to apply to state.
 */
export async function queryGeometries (params: QueryGeometriesParams): Promise<QueryGeometriesResult> {
  const { items, joinFieldFeed, joinFieldService, dataSourceId, mapView, previousJoinIds } = params

  // Get the DataSource URL to find the matching layer on the map
  const ds = DataSourceManager.getInstance().getDataSource(dataSourceId)
  if (!ds) {
    debugLogger.log('JOIN', { action: 'query-bail', reason: 'DataSourceManager returned null', dsId: dataSourceId })
    return { geometryMap: new Map(), newJoinIds: previousJoinIds, skipped: true }
  }
  const dsUrl = ds.getDataSourceJson()?.url as string
  if (!dsUrl) {
    debugLogger.log('JOIN', { action: 'query-bail', reason: 'DS has no url', dsId: dataSourceId })
    return { geometryMap: new Map(), newJoinIds: previousJoinIds, skipped: true }
  }

  if (!mapView) {
    debugLogger.log('JOIN', { action: 'query-bail', reason: 'no mapView available' })
    return { geometryMap: new Map(), newJoinIds: previousJoinIds, skipped: true }
  }

  // Find the ACTUAL FeatureLayer on the map — this is the one that carries
  // the web map's definitionExpression and configured filters.
  // The DataSource's ds.layer is a separate instance that may NOT have these.
  const featureLayer = mapView.map.allLayers.find((layer: any) => {
    return layer.type === 'feature' && layer.url && dsUrl.toLowerCase().includes(layer.url.toLowerCase())
  }) as __esri.FeatureLayer | undefined

  if (!featureLayer) {
    debugLogger.log('JOIN', { action: 'query-bail', reason: 'layer not found on map', dsUrl })
    return { geometryMap: new Map(), newJoinIds: previousJoinIds, skipped: true }
  }

  // Collect join values from feed items
  const ids = items
    .map(item => item[joinFieldFeed])
    .filter(Boolean)
  if (ids.length === 0) {
    debugLogger.log('JOIN', { action: 'query-bail', reason: 'no join values in items', joinFieldFeed, itemCount: items.length })
    return { geometryMap: new Map(), newJoinIds: previousJoinIds, skipped: true }
  }

  // Optimization: skip re-query if join IDs haven't changed
  const newJoinIds = new Set(ids)
  if (
    newJoinIds.size === previousJoinIds.size &&
    [...newJoinIds].every(id => previousJoinIds.has(id))
  ) {
    debugLogger.log('JOIN', { action: 'query-skipped', reason: 'join IDs unchanged' })
    return { geometryMap: new Map(), newJoinIds, skipped: true }
  }

  debugLogger.log('JOIN', {
    action: 'query-start',
    layer: featureLayer.title || featureLayer.url,
    joinFieldService,
    idCount: ids.length,
    sampleIds: ids.slice(0, 3),
    definitionExpression: featureLayer.definitionExpression || '(none)'
  })
  const geometryMap = await queryFeatureLayerByIds(featureLayer, joinFieldService, ids)

  debugLogger.log('JOIN', {
    action: 'geometries-cached',
    requested: ids.length,
    matched: geometryMap.size
  })

  return { geometryMap, newJoinIds, skipped: false }
}
