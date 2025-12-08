/* eslint-disable prefer-const */
import {
  AppMode, dataSourceUtils, DataSourceManager, type JSAPILayerMixin, geometryUtils, type IMState, getAppStore,
  type MessagesJson, type ImmutableObject, MessageType, UrlManager, JSAPILayerTypes
} from 'jimu-core'
import type { MapbaseRestoreData, MapbaseView } from './components/mapbase'
import type MapBase from './components/mapbase'
import type { IFeature } from '@esri/arcgis-rest-feature-service'
import {
  loadArcGISJSAPIModules, type JimuMapView, type JimuLayerView, type JimuFeatureLayerView, type JimuImageryLayerView, type JimuOrientedImageryLayerView,
  type JimuSubtypeGroupLayerView, type JimuSubtypeSublayerView, type JimuSceneLayerView, type JimuBuildingComponentSublayerView, MapViewManager,
  type MarkerGroupUrlParam, type MarkerPointUrlParam, type MarkerGroup, type UnparsedMapUrlParams, type UnparsedViewUrlParams
} from 'jimu-arcgis'
import { getDefaultMarkerSymbol } from '../common/add-marker-common'

export async function goToTargetImmediately (view: __esri.MapView | __esri.SceneView, _target: __esri.Geometry): Promise<void> {
  const viewSR = view.spatialReference
  const geometries = await projectGeometries([_target], viewSR)

  if (geometries && geometries.length > 0) {
    const target = geometries[0]
    view.goTo(target, { animate: false })
  }
}

export async function goToViewpointImmediately (view: __esri.MapView | __esri.SceneView, _viewpoint: __esri.Viewpoint): Promise<void> {
  const viewSR = view.spatialReference
  const viewpoint = await projectViewpoint(_viewpoint, viewSR)
  // view.goTo(viewpoint, { animate: false })
  view.viewpoint = viewpoint
}

export function isNeedProjectViewpoint (viewpoint: __esri.Viewpoint, viewSR: __esri.SpatialReference): boolean {
  const sr1 = viewpoint.targetGeometry?.spatialReference

  if (sr1 && isNeedProjectSpatialReference(sr1, viewSR)) {
    return true
  }

  const sr2 = viewpoint.camera?.position?.spatialReference

  if (sr2 && isNeedProjectSpatialReference(sr2, viewSR)) {
    return true
  }

  return false
}

export function isNeedProjectSpatialReference (sr1: __esri.SpatialReference, sr2: __esri.SpatialReference): boolean {
  const isSame = sr1.wkid === sr2.wkid || sr1.equals(sr2)
  //  In JS API 4.x, the view can handle WebMercator and WGS84 spatialReference auto
  const isLike = (sr1.isWebMercator || sr1.isWGS84) && (sr2.isWebMercator || sr2.isWGS84)
  return !isSame && !isLike
}

export async function projectViewpoint (_viewpoint: __esri.Viewpoint, viewSR: __esri.SpatialReference): Promise<__esri.Viewpoint> {
  const viewpoint = _viewpoint.clone()
  const targetGeometry = viewpoint.targetGeometry
  const cameraPosition = viewpoint.camera?.position

  const toProjectGeometries: __esri.Geometry[] = []
  let isProjectTargetGeometry: boolean = false
  let isProjectCameraPosition: boolean = false

  if (targetGeometry && isNeedProjectSpatialReference(targetGeometry.spatialReference, viewSR)) {
    isProjectTargetGeometry = true
    toProjectGeometries.push(targetGeometry)
  }

  if (cameraPosition && isNeedProjectSpatialReference(cameraPosition.spatialReference, viewSR)) {
    isProjectCameraPosition = true
    toProjectGeometries.push(cameraPosition)
  }

  if (toProjectGeometries.length > 0) {
    const projectedGeometries = await projectGeometries(toProjectGeometries, viewSR)

    if (isProjectTargetGeometry) {
      viewpoint.targetGeometry = projectedGeometries[0]
    }

    if (isProjectCameraPosition) {
      viewpoint.camera.position = projectedGeometries[projectedGeometries.length - 1] as __esri.Point
    }
  }

  return viewpoint
}

export async function mapPanto (mapBaseView: __esri.MapView | __esri.SceneView, target: __esri.Geometry | __esri.Geometry[] |
__esri.Graphic | __esri.Graphic[] | __esri.Extent): Promise<any> {
  const panToTarget = target as any
  const tempBaseMapView = mapBaseView as any
  if (panToTarget instanceof Array) {
    if (panToTarget.length === 0) { await Promise.resolve(); return }

    if (panToTarget[0].geometry) {
      const geometryArr: __esri.Geometry[] = []
      for (let i = 0; i < panToTarget.length; i++) {
        geometryArr.push(panToTarget[i].geometry)
      }

      await getGeometriesExtent(geometryArr).then((extent) => {
        return goTo(tempBaseMapView, extent.center)
      })
    } else {
      return getGeometriesExtent(panToTarget).then((extent) => {
        return goTo(tempBaseMapView, extent.center)
      })
    }
  } else {
    if (panToTarget.geometry) {
      const getmetry = panToTarget.geometry as __esri.Geometry
      return goTo(tempBaseMapView, getCenterPoint(getmetry))
    } else {
      return goTo(tempBaseMapView, getCenterPoint(panToTarget))
    }
  }
}

async function goTo (view: __esri.MapView | __esri.SceneView, target: any): Promise<void> {
  return new Promise((resolve, reject) => {
    // delay before updating of view turns true, 400ms is a temporary solution.
    setTimeout(() => {
      //// there is a conflict for paning when the layer view is updating, such as 'pan to' and 'filter'.
      //// this is a temporary solution, it can reduce the frequency of the problem rather than solve it completely.
      //if (view.updating) {
      //  const handler = view.watch('updating', value => {
      //    if (!value) {
      //      view.goTo(target).then(() => resolve()).catch(() => reject())
      //      handler.remove()
      //    }
      //  })
      //} else {
      //  view.goTo(target).then(() => resolve()).catch(() => reject())
      //}
      view.goTo(target).then(() => { resolve() }).catch(() => { reject(new Error(null)) })
    }, 400)
  })
}

async function getGeometriesExtent (geometries: __esri.Geometry[]): Promise<__esri.Extent> {
  return await loadArcGISJSAPIModules([
    'esri/geometry/Extent'
  ]).then(async modules => {
    let Extent: typeof __esri.Extent;
    [Extent] = modules

    if (!geometries || !geometries.length) {
      return await Promise.resolve(null)
    }

    let fullExtent: __esri.Extent = null
    let index
    const numGeometries = geometries.length

    for (index = 0; index < numGeometries; index++) {
      const geometry = geometries[index]
      if (!geometry) {
        continue
      }

      let extent = geometry.extent

      if (!extent && geometry.type === 'point') {
        const pointGeometry = geometry as any

        if (pointGeometry.x && pointGeometry.y) {
          extent = new Extent({
            xmax: pointGeometry.x,
            xmin: pointGeometry.x,
            ymax: pointGeometry.y,
            ymin: pointGeometry.y,
            zmax: pointGeometry.z,
            zmin: pointGeometry.z,
            spatialReference: pointGeometry.spatialReference
          })
        }
      }

      if (!extent) {
        continue
      }

      if (fullExtent) {
        fullExtent = fullExtent.union(extent)
      } else {
        fullExtent = extent
      }
    }

    if (fullExtent.width < 0 && fullExtent.height < 0) {
      return await Promise.resolve(null)
    }

    return await Promise.resolve(fullExtent)
  })
}

export interface QueryExtentResult {
  count: number
  extent: __esri.Extent
}

/**
 * layerQueryExtent is a wrapper of layer.queryExtent() method and it also supports SubtypeSublayer although SubtypeSublayer doesn't support layer.queryExtent() method.
 * @param layer
 * @param query
 * @returns
 */
export function layerQueryExtent (
  layer: __esri.FeatureLayer | __esri.SceneLayer | __esri.BuildingComponentSublayer | __esri.SubtypeGroupLayer | __esri.SubtypeSublayer,
  query: __esri.Query
): Promise<QueryExtentResult> {
  if (layer.declaredClass === 'esri.layers.support.SubtypeSublayer') {
    // layer is SubtypeGroupLayer. SubtypeSublayer doesn't support layer.queryExtent() method, use SubtypeGrouplayer to workaround it.
    return queryExtentForSubtypeSublayer(layer as __esri.SubtypeSublayer, query)
  } else {
    // ImageryLayer and OrientedImageryLayer don't support layer.queryExtent() method.
    return (layer as __esri.FeatureLayer | __esri.SceneLayer | __esri.BuildingComponentSublayer | __esri.SubtypeGroupLayer).queryExtent(query)
  }
}

// SubtypeSublayer doesn't support queryExtent() method, use SubtypeGrouplayer to workaround it.
function queryExtentForSubtypeSublayer (subtypeSublayer: __esri.SubtypeSublayer, query: __esri.Query): Promise<QueryExtentResult> {
  const subtypeGroupLayer = subtypeSublayer.parent

  if (subtypeGroupLayer) {
    const finalQuery = query.clone()
    const subtypeField = getSubtypeField(subtypeSublayer)
    const extraWhere = `${subtypeField} = ${subtypeSublayer.subtypeCode}`

    if (finalQuery.where) {
      finalQuery.where = `(${finalQuery.where}) AND (${extraWhere})`
    } else {
      finalQuery.where = extraWhere
    }

    return subtypeGroupLayer.queryExtent(finalQuery)
  }

  return null
}

export async function filterFeaturesByQuery (jimuMapView: JimuMapView, actionLayerDataSourceId: string, querySQL: string): Promise<void> {
  if (!actionLayerDataSourceId) {
    return
  }

  const dataSource = DataSourceManager.getInstance().getDataSource(actionLayerDataSourceId)

  if (!dataSource) {
    return
  }

  let jimuLayerView: JimuFeatureLayerView | JimuSceneLayerView | JimuBuildingComponentSublayerView = null

  try {
    jimuLayerView = await jimuMapView.whenJimuLayerViewLoadedByDataSource(dataSource) as JimuFeatureLayerView | JimuSceneLayerView | JimuBuildingComponentSublayerView
  } catch (err) {
    jimuLayerView = null
    console.error('can\'t get jimuLayerView by dataSource', dataSource, err)
  }

  const validJimuLayerViewTypes: string[] = [
    JSAPILayerTypes.FeatureLayer,
    JSAPILayerTypes.SceneLayer,
    JSAPILayerTypes.BuildingComponentSublayer,
    JSAPILayerTypes.ImageryLayer,
    JSAPILayerTypes.OrientedImageryLayer,
    JSAPILayerTypes.SubtypeGroupLayer,
    JSAPILayerTypes.SubtypeSublayer
  ]

  if (jimuLayerView && jimuLayerView.layer && validJimuLayerViewTypes.includes(jimuLayerView.type) && jimuLayerView.setDefinitionExpression) {
    jimuLayerView.setDefinitionExpression(querySQL)
  }
}

type SupportQueryFeaturesLayerTypes = __esri.FeatureLayer | __esri.ImageryLayer | __esri.OrientedImageryLayer | __esri.SubtypeGroupLayer | __esri.SubtypeSublayer

function queryFeatures (jimuMapView: JimuMapView, layerObject: SupportQueryFeaturesLayerTypes, querySQL: string, outFields: string[]) {
  return loadArcGISJSAPIModules([
    'esri/rest/support/Query'
  ]).then(modules => {
    let Query: typeof __esri.Query;
    [Query] = modules
    const query = new Query()
    query.where = querySQL
    query.outFields = outFields || []
    query.returnGeometry = true
    const outSR = jimuMapView?.view?.spatialReference?.clone()

    if (outSR) {
      query.outSpatialReference = outSR
    }

    // @ts-expect-error
    // In fact, ImageryLayer supports layer.queryFeatures() method, but it doesn't expose it in the doc.
    return layerObject.queryFeatures(query).then(featureSet => {
      return featureSet
    })
  })
}

type Queryable2DJimuLayerView = JimuFeatureLayerView | JimuImageryLayerView | JimuOrientedImageryLayerView | JimuSubtypeGroupLayerView | JimuSubtypeSublayerView

async function flashOnFeatureLayer (jimuMapView: JimuMapView, querySQL: string, jimuLayerView: Queryable2DJimuLayerView) {
  const apiMapView = jimuMapView.view
  // let apiLayerView = jimuLayerView.view as __esri.FeatureLayerView | __esri.ImageryLayerView
  // const layer = apiLayerView.layer
  const layer = jimuLayerView.layer

  if (!layer) {
    return
  }

  let targetFlashLayer = null

  if (typeof (layer as any).queryFeatures === 'function') {
    // layer is FeatureLayer, ImageryLayer, OrientedImageryLayer, SubtypeGroupLayer or SubtypeSublayer
    targetFlashLayer = layer
  } else {
    // layer is a sublayer of MapServer
    const [FeatureLayer] = await loadArcGISJSAPIModules(['esri/layers/FeatureLayer']) as [typeof __esri.FeatureLayer]

    let tempFeatureLayer = new FeatureLayer({
      url: dataSourceUtils.getUrlByLayer(layer)
    })

    await tempFeatureLayer.load()
    targetFlashLayer = tempFeatureLayer
  }

  if (targetFlashLayer) {
    const featureSet = await queryFeatures(jimuMapView, targetFlashLayer, querySQL, [])

    if (featureSet && featureSet.features && featureSet.features.length > 0) {
      let geometryType = targetFlashLayer.geometryType

      if (!geometryType) {
        geometryType = featureSet.features[0].geometry?.type
      }

      const symbol = getFlashSymbol(geometryType)
      startFlashFeatureLayer(apiMapView, featureSet.features, symbol)
    }
  }
}

function flashOnSceneLayer (jimuMapView: JimuMapView, querySQL: string, jimuLayerView: JimuSceneLayerView | JimuBuildingComponentSublayerView) {
  let sceneHighlightHandle = null
  const apiLayerView = jimuLayerView.view

  if (apiLayerView) {
    // layer is __esri.SceneLayer or __esri.BuildingComponentSublayer
    const layer = (apiLayerView as __esri.SceneLayerView).layer || (apiLayerView as __esri.BuildingComponentSublayerView).sublayer

    if (!layer) {
      return
    }

    // @ts-expect-error
    // FeatureLayer
    const layerToQuery = layer.associatedLayer

    if (!layerToQuery) {
      return
    }

    // layerToQuery.objectIdField is null if layerToQuery.loaded is false
    const objectIdField = layer.objectIdField

    if (!objectIdField) {
      return
    }

    queryFeatures(jimuMapView, layerToQuery, querySQL, [objectIdField]).then(async (featureSet) => {
      if (featureSet && featureSet.features && featureSet.features.length > 0) {
        const [Color] = await loadArcGISJSAPIModules(['esri/Color'])
        const objectIds = featureSet.features.map(feature => feature.attributes[objectIdField])

        let i = 0
        const maxFlashCount = 6
        let highlightFlag = true
        const defaultHighlightOptions: __esri.HighlightOptions = getDefaultHighlightOptions(jimuMapView?.view)

        if (!defaultHighlightOptions) {
          console.error(`can\'t get the default HighlightOptions for map ${jimuMapView?.id}`)
          return
        }

        const originalHighlightColor = defaultHighlightOptions.color

        const flash = function () {
          if (i < maxFlashCount) {
            i++

            if (highlightFlag) {
              defaultHighlightOptions.color = new Color([0, 0, 0, 0]) // transparent
              sceneHighlightHandle && sceneHighlightHandle.remove()
              sceneHighlightHandle = apiLayerView.highlight(objectIds)
            } else {
              defaultHighlightOptions.color = new Color([255, 255, 0, 0.8]) // yellow
              sceneHighlightHandle && sceneHighlightHandle.remove()
              sceneHighlightHandle = apiLayerView.highlight(objectIds)
            }

            highlightFlag = !highlightFlag
            setTimeout(flash, 500)
          } else {
            // flash done, restore the highlight color
            defaultHighlightOptions.color = originalHighlightColor
            sceneHighlightHandle && sceneHighlightHandle.remove()
          }
        }

        setTimeout(flash, 500)
      }
    })
  }
}

export async function flashFeaturesByQuery (jimuMapView: JimuMapView, layerDataSourceId: string, querySQL: string): Promise<void> {
  if (!layerDataSourceId) {
    return
  }

  const dataSource = DataSourceManager.getInstance().getDataSource(layerDataSourceId)

  if (!dataSource) {
    return
  }

  let jimuLayerView: JimuLayerView = null

  try {
    jimuLayerView = await jimuMapView.whenJimuLayerViewLoadedByDataSource(dataSource)
  } catch (err) {
    jimuLayerView = null
    console.error('can\'t get jimuLayerView by dataSource', dataSource, err)
  }

  if (jimuLayerView && jimuLayerView.layer) {
    const layerViewType = jimuLayerView.type as JSAPILayerTypes

    const supported2DLayers: JSAPILayerTypes[] = [JSAPILayerTypes.FeatureLayer, JSAPILayerTypes.ImageryLayer, JSAPILayerTypes.OrientedImageryLayer, JSAPILayerTypes.SubtypeGroupLayer, JSAPILayerTypes.SubtypeSublayer]
    const supported3DLayers: JSAPILayerTypes[] = [JSAPILayerTypes.SceneLayer, JSAPILayerTypes.BuildingComponentSublayer]

    if (supported2DLayers.includes(layerViewType)) {
      flashOnFeatureLayer(jimuMapView, querySQL, jimuLayerView as Queryable2DJimuLayerView)
    } else if (supported3DLayers.includes(layerViewType)) {
      flashOnSceneLayer(jimuMapView, querySQL, jimuLayerView as (JimuSceneLayerView | JimuBuildingComponentSublayerView))
    }
  }
}

// flash FeatureLayer
function startFlashFeatureLayer (mapBaseView: __esri.MapView | __esri.SceneView, features: __esri.Graphic[], symbol) {
  loadArcGISJSAPIModules([
    'esri/Graphic'
  ]).then(modules => {
    let Graphic: typeof __esri.Graphic;
    [Graphic] = modules

    const flashFeatures = function (features: __esri.Graphic[], maxFlashCount: number) {
      const graphics = []
      let flashCount = 0
      for (let i = 0; i < features.length; i++) {
        const tempGraphic = new Graphic({
          geometry: features[i].geometry,
          symbol: symbol,
          attributes: features[i].attributes
        })
        graphics.push(tempGraphic)
      }

      const singleFlash = function () {
        mapBaseView.graphics.addMany(graphics)
        setTimeout(() => {
          mapBaseView.graphics.removeMany(graphics)
          flashCount = flashCount + 1
          if (flashCount < maxFlashCount) {
            setTimeout(() => {
              singleFlash()
            }, 500)
          }
        }, 500)
      }

      singleFlash()
    }

    flashFeatures(features, 3)
  })
}

function getFlashSymbol (geometryType: string) {
  if (['point', 'multipoint'].includes(geometryType)) {
    return {
      type: 'simple-marker',
      style: 'circle',
      color: [255, 255, 0, 0.8],
      size: '16px',
      outline: {
        color: [255, 255, 0, 0.8],
        width: 3
      }
    }
  } else if (['polyline'].includes(geometryType)) {
    return {
      type: 'simple-line',
      color: [255, 255, 0, 0.8],
      width: 3,
      style: 'solid'
    }
  } else if (['polygon', 'extent'].includes(geometryType)) {
    return {
      type: 'simple-fill', // autocasts as new SimpleFillSymbol()
      color: [255, 255, 0, 0.5],
      style: 'solid',
      outline: { // autocasts as new SimpleLineSymbol()
        color: [255, 255, 0, 0.8],
        width: 3
      }
    }
  } else if (['mesh'].includes(geometryType)) {
    return {
      type: 'mesh-3d', // autocasts as new MeshSymbol3D()
      symbolLayers: [{
        type: 'fill', // autocasts as new FillSymbol3DLayer()
        material: { color: [255, 255, 0, 0.8] }
      }]
    }
  } else {
    return null
  }
}

function getCenterPoint (geometry: __esri.Geometry): __esri.Point {
  // point | multipoint | polyline | polygon | extent | mesh
  switch (geometry.type) {
    case 'point':
      return geometry as __esri.Point
    case 'extent':
      return (geometry as __esri.Extent).center
    case 'polygon':
      return (geometry as __esri.Polygon).centroid
    case 'polyline':
      return (geometry as __esri.Polyline).extent.center
    default:
      return geometry && geometry.extent ? geometry.extent.center : undefined
    // todo
  }
}

export function getDefaultHighlightOptions(view: __esri.View): __esri.HighlightOptions {
  let defaultHighlightOptions: __esri.HighlightOptions = null

  const highlights = view?.highlights

  if (highlights?.length > 0) {
    defaultHighlightOptions = highlights.find(item => item.name === 'default')
  }

  return defaultHighlightOptions
}

export function cloneFeature (feature: IFeature | __esri.Graphic, Graphic: typeof __esri.Graphic): __esri.Graphic {
  let tempFeature = null
  if ((feature as any).clone) {
    tempFeature = (feature as any).clone()
  } else {
    tempFeature = Graphic.fromJSON(Object.assign({}, feature))
    tempFeature.attributes = Object.assign({}, feature.attributes)
  }
  return tempFeature
}

/**
 * @deprecated
 * This method is deprecated. It is better to use projectGeometriesWithDifferentSpatialReference().
 * Note, the input geometries should have the same spatialReference. And, this method doesn't project geometries if geometries[0].spatialReference and spatialReference are 3857 or 4326.
 */
export async function projectGeometries (geometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]> {
  if (!geometries || geometries.length === 0 || !geometries[0] ||
    spatialReference.wkid === geometries[0].spatialReference.wkid || (spatialReference.equals(geometries[0].spatialReference))) {
    return await Promise.resolve(geometries)
  } else if (spatialReference.isWebMercator && geometries[0].spatialReference.isWGS84) {
    // In js api 4.x, the view can handle WebMercator and WGS84 spatialReference auto
    return await Promise.resolve(geometries)
  } else if (spatialReference.isWGS84 && geometries[0].spatialReference.isWebMercator) {
    // In js api 4.x, the view can handle WebMercator and WGS84 spatialReference auto
    return await Promise.resolve(geometries)
  } else {
    return await geometryUtils.projectToSpatialReference(geometries, spatialReference)
  }
}

/**
 * Project multiple geometries to the specific spatialReference. inputGeometries maybe have different spatialReferences.
 * @param inputGeometries
 * @param spatialReference
 * @returns
 */
export async function projectGeometriesWithDifferentSpatialReference (inputGeometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]> {
  if (!inputGeometries || inputGeometries.length === 0) {
    return []
  }

  const promises = inputGeometries.map(async (geometry) => {
    const projectedGeometries = await geometryUtils.projectToSpatialReference([geometry], spatialReference)

    if (projectedGeometries && projectedGeometries.length > 0) {
      return projectedGeometries[0]
    }

    return null
  })

  return await Promise.all(promises)
}

/**
 * Union multiple extents to one extent with specific spatialReference. inputExtents maybe have different spatialReference.
 * @param inputExtents
 * @param spatialReference
 * @returns
 */
export async function unionExtentsWithDifferentSpatialReference (inputExtents: __esri.Extent[], spatialReference: __esri.SpatialReference): Promise<__esri.Extent> {
  const projectedExtents = await projectGeometriesWithDifferentSpatialReference(inputExtents, spatialReference) as __esri.Extent[]
  const validProjectedExtents = projectedExtents.filter(extent => !!extent)

  if (validProjectedExtents.length === 0) {
    return null
  }

  let result: __esri.Extent = null

  validProjectedExtents.forEach(extent => {
    if (result) {
      result = result.union(extent)
    } else {
      result = extent
    }
  })

  return result
}

export async function processZoomToFeatures (mapBaseView: __esri.MapView | __esri.SceneView, layer: any, features: __esri.Graphic[]): Promise<__esri.Graphic[]> {
  if (mapBaseView && mapBaseView.type === '3d' && layer && layer.queryFeatures && features) {
    return await loadArcGISJSAPIModules([
      'esri/rest/support/Query'
    ]).then((modules) => {
      const [Query] = modules
      const query = new Query()
      query.returnGeometry = true
      query.outFields = ['*']
      query.objectIds = features.map(feature => feature.attributes[layer.objectIdField])
      return layer.queryFeatures(query).then(async (result) => {
        if (result && result.features && result.features.length === features.length) {
          return await Promise.resolve(result.features)
        } else {
          return await Promise.resolve(features)
        }
      }, async () => {
        return await Promise.resolve(features)
      })
    })
  } else {
    return await Promise.resolve(features)
  }
}

export function checkIsLive (appMode: AppMode): boolean {
  if (window.jimuConfig.isInBuilder) {
    if (appMode === AppMode.Design) {
      return false
    } else {
      return true
    }
  } else {
    return true
  }
}

export function getLayersFromDataSourceIds (dataSourceIds: string[]): Promise<any> {
  const layerPromises = []
  dataSourceIds.forEach(dataSourceId => {
    const dataSource = DataSourceManager.getInstance().getDataSource(dataSourceId) as unknown as JSAPILayerMixin
    let layerPromise
    if (dataSource?.layer) {
      layerPromise = Promise.resolve(dataSource.layer)
    } else if (dataSource?.createJSAPILayerByDataSource) {
      layerPromise = dataSource.createJSAPILayerByDataSource()
    } else {
      layerPromise = Promise.resolve(null)
    }
    layerPromises.push(layerPromise)
  })
  return Promise.all(layerPromises)
}

export function getJimuMapViewId (widgetId: string, dataSourceId: string): string {
  // If dataSourceId is null, make sure it converts to empty string.
  const dsId = dataSourceId || ''
  return `${widgetId}-${dsId}`
}

export function getMapBaseRestoreData (mapInstance: MapBase): MapbaseRestoreData {
  const {
    mapContainer,
    state,

    Geometry,
    InitialViewProperties,
    TileLayer,
    Basemap,
    MapView,
    SceneView,
    Extent,
    Viewpoint,
    PortalItem,
    Portal,
    WebMap,
    WebScene,
    Color,
    SpatialReference,
    Point,
    reactiveUtils,

    expectedDataSourceInfo,
    mapCreatingInfo,
    view,
    lastUpdateViewConfig,
    mapDs,
    dsManager,
    isFirstReceiveMessage
  } = mapInstance

  return {
    mapContainer,
    state,

    Geometry,
    InitialViewProperties,
    TileLayer,
    Basemap,
    MapView,
    SceneView,
    Extent,
    Viewpoint,
    PortalItem,
    Portal,
    WebMap,
    WebScene,
    Color,
    SpatialReference,
    Point,
    reactiveUtils,

    expectedDataSourceInfo,
    mapCreatingInfo,
    view,
    lastUpdateViewConfig,
    mapDs,

    dsManager,
    isFirstReceiveMessage
  }
}

export function restoreMapBase (mapInstance: MapBase, restoreData: MapbaseRestoreData): void {
  const keys = Object.keys(restoreData)

  for (const key of keys) {
    mapInstance[key] = restoreData[key]
  }
}

export function isTwoWidgetsMutuallyExtentChange (widgetId1: string, widgetId2: string): boolean {
  if (widgetId1 && widgetId2) {
    const messageConfigs = getAppStore().getState().appConfig.messageConfigs

    if (messageConfigs) {
      const actionNames: string[] = ['panTo', 'zoomToFeature']
      const messageType = MessageType.ExtentChange

      if (isWidgetSendActionsToAnother(widgetId1, widgetId2, messageConfigs, messageType, actionNames) &&
         isWidgetSendActionsToAnother(widgetId2, widgetId1, messageConfigs, messageType, actionNames)) {
        return true
      }
    }
  }

  return false
}

export function isWidgetSendZoomToActionToAnother (sendMessageWidgetId: string, actionWidgetId: string, messageType: MessageType): boolean {
  if (sendMessageWidgetId && actionWidgetId) {
    const messageConfigs = getAppStore().getState().appConfig.messageConfigs

    if (messageConfigs) {
      const actionNames: string[] = ['zoomToFeature']

      return isWidgetSendActionsToAnother(sendMessageWidgetId, actionWidgetId, messageConfigs, messageType, actionNames)
    }
  }

  return false
}

function isWidgetSendActionsToAnother (
  sendMessageWidgetId: string,
  actionWidgetId: string,
  messageConfigs: ImmutableObject<MessagesJson>,
  messageType: MessageType,
  actionNames: string[]
): boolean {
  if (messageConfigs) {
    const messageJsonArray = Object.values(messageConfigs)

    for (let i = 0; i < messageJsonArray.length; i++) {
      const messageJson = messageJsonArray[i]

      if (messageJson.widgetId === sendMessageWidgetId && messageJson.messageType === messageType) {
        const actions = messageJson.actions

        for (let j = 0; j < actions.length; j++) {
          const action = actions[j]

          if (action.widgetId === actionWidgetId) {
            if (actionNames.includes(action.actionName)) {
              return true
            }
          }
        }
      }
    }
  }

  return false
}

export function isSameLikeViewpoints (view: MapbaseView, vp1: __esri.Viewpoint, vp2: __esri.Viewpoint): boolean {
  if (!vp1) {
    return false
  }

  if (!vp2) {
    return false
  }

  // We need to check both targetGeometry and camera.
  if (vp1.targetGeometry && vp1.targetGeometry.declaredClass === 'esri.geometry.Point' && vp2.targetGeometry && vp2.targetGeometry.declaredClass === 'esri.geometry.Point') {
    const screenPoint1 = view.toScreen(vp1.targetGeometry as __esri.Point)
    const screenPoint2 = view.toScreen(vp2.targetGeometry as __esri.Point)
    const deltaX = screenPoint1.x - screenPoint2.x
    const deltaY = screenPoint1.y - screenPoint2.y
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (dist >= 5) {
      return false
    }
  }

  const camera1 = vp1.camera
  const camera2 = vp2.camera

  if (camera1 && camera2) {
    // compare viewpoint for SceneView
    const heading1 = parseFloat(camera1.heading.toFixed(2))
    const heading2 = parseFloat(camera2.heading.toFixed(2))

    if (heading1 !== heading2) {
      return false
    }

    const tilt1 = parseFloat(camera1.tilt.toFixed(2))
    const tilt2 = parseFloat(camera2.tilt.toFixed(2))

    if (tilt1 !== tilt2) {
      return false
    }

    const positionDist = camera1.position.distance(camera2.position)

    if (positionDist >= 1) {
      return false
    }
  } else {
    // compare viewpoint for MapView
    const rotation1 = parseFloat(vp1.rotation.toFixed(2))
    const rotation2 = parseFloat(vp2.rotation.toFixed(2))

    if (rotation1 !== rotation2) {
      return false
    }

    const deltaScale = vp1.scale - vp2.scale

    if (Math.abs(deltaScale) >= 1) {
      return false
    }
  }

  return true
}

export function getViewpointInstanceFromHistory (view: MapbaseView, viewpointIndex: number): __esri.Viewpoint {
  if (view.viewpointHistory.length > 0) {
    const lastIndex = view.viewpointHistory.length - 1

    if (viewpointIndex >= 0 && viewpointIndex <= lastIndex) {
      const viewpoint = view.viewpointHistory[viewpointIndex]
      return viewpoint.clone()
    }
  }

  return null
}

export function updatePersistentMapStateForActiveJimuMapView (jimuMapView: JimuMapView) {
  if (jimuMapView && jimuMapView.isActive && jimuMapView.view && !jimuMapView.view.destroyed) {
    jimuMapView.updatePersistentMapState(true, false)
  }
}

export function updateViewUrlParamsForActiveJimuMapView (jimuMapView: JimuMapView) {
  if (jimuMapView && jimuMapView.isActive && jimuMapView.view && !jimuMapView.view.destroyed) {
    const view = jimuMapView.view as MapbaseView
    const urlManager = UrlManager.getInstance()
    const viewpointJson = view.viewpoint ? view.viewpoint.toJSON() : null

    let viewpointStr: string = null
    let centerStr: string = null
    let scaleStr: string = null
    let levelStr: string = null
    let rotationStr: string = null

    if (viewpointJson) {
      viewpointStr = JSON.stringify(viewpointJson)
    }

    // We only support center, scale and rotation for MapView.
    if (view.type === '2d') {
      const wkid = view.spatialReference?.wkid

      if (wkid) {
        const viewCenter = view.center

        if (viewCenter) {
          centerStr = `${viewCenter.x},${viewCenter.y},${wkid}`
        }
      }

      scaleStr = String(view.scale)
      levelStr = String(view.zoom)
      rotationStr = String(view.rotation)
    }

    view.lastViewpointToUpdateUrlParams = view.viewpoint ? view.viewpoint.clone() : null
    view.lastViewpointUrlParamUpdateTimestamp = Date.now()

    const activeDatasourceId = jimuMapView.dataSourceId || null

    const mapUrlHashParams: UnparsedViewUrlParams = {
      active_datasource_id: activeDatasourceId,
      center: centerStr,
      scale: scaleStr,
      level: levelStr,
      rotation: rotationStr,
      // if viewpointStr is null, UrlManager will remove it from url
      viewpoint: viewpointStr
    }

    urlManager.setWidgetUrlParams(jimuMapView.mapWidgetId, mapUrlHashParams)
  }
}

export interface ParsedViewUrlParams {
  viewpoint?: __esri.Viewpoint
  center?: __esri.Point
  scale?: number
  level?: number
  rotation?: number
}

/**
 * Get changed viewpoint by view and url hash params.
 * Return null if viewpoint not changed.
 * @param view
 * @param runtimeUrlHashParams
 * @param parseViewpoint
 * @param parseCenter
 * @param parseScale
 * @param parseRotation
 * @param parseLevel
 * @param Viewpoint
 * @param Point
 * @param SpatialReference
 * @returns
 */
// eslint-disable-next-line max-params
export function getChangedViewpointByViewAndUrlHashParams (
  view: MapbaseView,
  runtimeUrlHashParams: UnparsedMapUrlParams,
  parseViewpoint: boolean,
  parseCenter: boolean,
  parseScale: boolean,
  parseRotation: boolean,
  parseLevel: boolean,
  Viewpoint: typeof __esri.Viewpoint,
  Point: typeof __esri.Point,
  SpatialReference: typeof __esri.SpatialReference
): __esri.Viewpoint {
  let result: __esri.Viewpoint = null
  const currViewpoint = view.viewpoint?.clone()
  const is2D = view.type === '2d'

  if (!is2D) {
    parseCenter = false
    parseScale = false
    parseRotation = false
    parseLevel = false
  }

  const urlParamsMapOptions = getParsedViewUrlParams(runtimeUrlHashParams, is2D, Viewpoint, Point, SpatialReference)

  if (urlParamsMapOptions) {
    if (!parseViewpoint) {
      delete urlParamsMapOptions.viewpoint
    }

    if (!parseCenter) {
      delete urlParamsMapOptions.center
    }

    if (!parseScale) {
      delete urlParamsMapOptions.scale
    }

    if (!parseRotation) {
      delete urlParamsMapOptions.rotation
    }

    if (!parseLevel) {
      delete urlParamsMapOptions.level
    }

    if (Object.keys(urlParamsMapOptions).length > 0) {
      if (is2D) {
        result = urlParamsMapOptions.viewpoint || currViewpoint

        if (result) {
          if (urlParamsMapOptions.center) {
            result.targetGeometry = urlParamsMapOptions.center
          }

          if ('scale' in urlParamsMapOptions) {
            result.scale = urlParamsMapOptions.scale
          } else if ('level' in urlParamsMapOptions) {
            // scale has higher priority than level, ignore level if scale exists
            const scale = getScaleByZoom(view, urlParamsMapOptions.level)

            if (typeof scale === 'number' && scale > 0) {
              result.scale = scale
            }
          }

          if ('rotation' in urlParamsMapOptions) {
            result.rotation = urlParamsMapOptions.rotation
          }
        }
      } else {
        result = urlParamsMapOptions.viewpoint
      }
    }
  }

  return result
}

function getScaleByZoom(view: __esri.MapView, zoomValue: number) {
  let resultScale: number = null

  const lods = view?.constraints?.effectiveLODs

  if (lods?.length > 0) {
    // Find the two LODs whose level is closest to zoomValue
    const lowerLod = lods.filter(l => l.level <= zoomValue).pop()
    const higherLod = lods.find(l => l.level >= zoomValue)

    if (lowerLod && higherLod) {
      if (lowerLod.level === higherLod.level) {
        resultScale = lowerLod.level
      } else {
        // scale = scale_lower * 2^(level_lower - zoomValue)
        const scaleLower = lowerLod.scale
        const levelLower = lowerLod.level
        resultScale = scaleLower / Math.pow(2, zoomValue - levelLower)
      }
    } else {
      if (lowerLod && lowerLod.level === zoomValue) {
        resultScale = lowerLod.scale
      }

      if (higherLod && higherLod.level === zoomValue) {
        resultScale = higherLod.scale
      }
    }

    if (!lowerLod || !higherLod || lowerLod.level === higherLod.level) {
      return lowerLod ? lowerLod.scale : higherLod.scale
    }

    // scale = scale_lower * 2^(level_lower - zoomValue)
    const scaleLower = lowerLod.scale
    const levelLower = lowerLod.level
    resultScale = scaleLower / Math.pow(2, zoomValue - levelLower)
  }

  return resultScale
}


export function getParsedViewUrlParams (
  runtimeUrlHashParams: UnparsedMapUrlParams,
  is2D: boolean,
  Viewpoint: typeof __esri.Viewpoint,
  Point: typeof __esri.Point,
  SpatialReference: typeof __esri.SpatialReference
): ParsedViewUrlParams {
  let result: ParsedViewUrlParams = {}
  let viewpoint: __esri.Viewpoint = null
  let center: __esri.Point = null
  let scale: number = null
  let level: number = null
  let rotation: number = null

  if (runtimeUrlHashParams) {
    // parse viewpoint
    try {
      if (runtimeUrlHashParams.viewpoint) {
        const viewpointJson = JSON.parse(runtimeUrlHashParams.viewpoint)

        if (viewpointJson) {
          viewpoint = Viewpoint.fromJSON(viewpointJson)
        }
      }
    } catch (e) {
      console.error('parse viewpoint from url hash params error', e)
      viewpoint = null
    }

    // only support center, scale, level and rotation for MapView
    if (is2D) {
      // parse center
      // center format: x,y,wkid
      try {
        if (runtimeUrlHashParams.center) {
          const splits = runtimeUrlHashParams.center.split(',')

          if (splits.length >= 3) {
            const x = parseFloat(splits[0])
            const y = parseFloat(splits[1])
            const wkid = parseFloat(splits[2])

            if (isValidNum(x) && isValidNum(y) && isValidNum(wkid)) {
              const spatialReference = new SpatialReference({
                wkid
              })

              center = new Point({
                x,
                y,
                spatialReference
              })
            }
          }
        }
      } catch (e) {
        console.error('parse center from url hash params error', e)
        center = null
      }

      // parse scale
      try {
        if ('scale' in runtimeUrlHashParams) {
          const scaleNum = parseFloat(runtimeUrlHashParams.scale)

          if (isValidNum(scaleNum) && scaleNum >= 0) {
            scale = scaleNum
          }
        }
      } catch (e) {
        scale = null
        console.error('parse scale from url hash params error', e)
      }

      // parse level
      try {
        if ('level' in runtimeUrlHashParams) {
          const levelNum = parseFloat(runtimeUrlHashParams.level)

          if (isValidNum(levelNum) && levelNum >= 0 ) {
            level = levelNum
          }
        }
      } catch (e) {
        level = null
        console.error('parse level from url hash params error', e)
      }

      // parse rotation
      try {
        if ('rotation' in runtimeUrlHashParams) {
          const rotationNum = parseFloat(runtimeUrlHashParams.rotation)

          if (isValidNum(rotationNum) && rotationNum >= 0 && rotationNum <= 360) {
            rotation = rotationNum
          }
        }
      } catch (e) {
        rotation = null
        console.error('parse rotation from url hash params error', e)
      }
    }
  }

  if (viewpoint) {
    result.viewpoint = viewpoint
  }

  // only support center, scale and rotation for MapView
  if (is2D) {
    if (center) {
      result.center = center
    }

    if (isValidNum(scale)) {
      result.scale = scale
    }

    // scale has higher priority than level, ignore level if scale exists
    if (!('scale' in result) && isValidNum(level) && level >= 0) {
      result.level = level
    }

    if (isValidNum(rotation)) {
      result.rotation = rotation
    }
  }

  if (Object.keys(result).length === 0) {
    result = null
  }

  return result
}

export async function parseMarkerGroupUrlParam(unparsedMapUrlParams: UnparsedMapUrlParams): Promise<MarkerGroup[]> {
  let markerGroupUrlParams: MarkerGroupUrlParam[] = []

  const markerStr = unparsedMapUrlParams?.marker || ''

  try {
    if (markerStr) {
      let parsedJson: MarkerGroupUrlParam[] = null

      try {
        parsedJson = JSON.parse(markerStr)
      } catch {
        parsedJson = null
      }

      if (Array.isArray(parsedJson)) {
        // markerStr is JSON string
        markerGroupUrlParams = parsedJson
      } else {
        // markerStr maybe a single marker
        // x,y;wkid;title;label;symbol
        const splits = markerStr.split(';')

        if (splits.length > 0 && splits[0]) {
          const [xyStr, wkidStr, titleStr, labelStr, symbolStr] = splits
          const xyStrArray = xyStr.split(',')

          if (xyStrArray.length >= 2) {
            const xyNumArray = xyStrArray.map(strItem => parseFloat(strItem))

            const numWkid = wkidStr ? parseInt(wkidStr) : null
            let wkid: number | string = null

            if (typeof numWkid === 'number' && !isNaN(numWkid)) {
              wkid = numWkid
            } else if (typeof wkidStr === 'string') {
              // wkt
              wkid = decodeURIComponent(wkidStr)
            }

            const title = titleStr ? decodeURIComponent(titleStr) : ''
            const label = labelStr ? decodeURIComponent(labelStr) : ''

            let symbolJson: any = null

            if (symbolStr) {
              const decodedSymbolStr = decodeURIComponent(symbolStr)

              try{
                symbolJson = JSON.parse(decodedSymbolStr)
              } catch {

              }
            }

            const markerPointUrlParam: MarkerPointUrlParam = {
              coordinates: xyNumArray,
              title,
              label
            }


            const markerGroupUrlParam: MarkerGroupUrlParam = {
              wkid,
              symbol: symbolJson,
              points: [markerPointUrlParam]
            }

            markerGroupUrlParams.push(markerGroupUrlParam)
          }
        }
      }
    }
  } catch (e) {
    console.error('parse marker param error', e)
    markerGroupUrlParams = []
  }

  const markerGroups: MarkerGroup[] = []

  if (markerGroupUrlParams.length > 0) {
    const modules = await loadArcGISJSAPIModules(['esri/symbols/support/jsonUtils', 'esri/geometry/SpatialReference', 'esri/geometry/Point', 'esri/geometry/Multipoint', 'esri/Graphic'])
    const [symbolsSupportJsonUtils, SpatialReference, Point, Multipoint, Graphic] = modules as [
      typeof __esri.symbolsSupportJsonUtils,
      typeof __esri.SpatialReference,
      typeof __esri.Point,
      typeof __esri.Multipoint, typeof __esri.Graphic
    ]
    const defaultSymbol = await getDefaultMarkerSymbol()

    markerGroupUrlParams.forEach(markerGroupUrlParam => {
      if (markerGroupUrlParam && markerGroupUrlParam.points?.length > 0) {
        let wkid = markerGroupUrlParam.wkid
        const isValidWkid = wkid && (typeof wkid === 'number' || typeof wkid === 'string')

        if (!isValidWkid) {
          wkid = 4326
        }

        const sr = typeof wkid === 'string' ? new SpatialReference({ wkt: wkid }) : new SpatialReference({ wkid })

        let symbol: __esri.SymbolUnion = null

        let configSymbolJson = markerGroupUrlParam.symbol

        if (configSymbolJson) {
          try {
            symbol = symbolsSupportJsonUtils.fromJSON(configSymbolJson)
          } catch {
          }
        }

        if (!symbol) {
          configSymbolJson = null
          symbol = defaultSymbol
        }

        const groupGraphics: __esri.Graphic[] = []

        markerGroupUrlParam.points.forEach(markerPointUrlParam => {
          if (markerPointUrlParam && markerPointUrlParam.coordinates?.length >= 2) {
            const coordinates = markerPointUrlParam.coordinates
            const pointCount = Math.floor(coordinates.length / 2)

            let geometry: __esri.Point | __esri.Multipoint = null

            if (pointCount === 1) {
              // Point
              geometry = new Point({
                x: coordinates[0],
                y: coordinates[1],
                spatialReference: sr
              })
            } else if (pointCount > 1) {
              // MultiPoint
              const points: number[][] = []

              for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
                const i = pointIndex * 2
                const x = coordinates[i]
                const y = coordinates[i + 1]
                points.push([x, y])
              }

              geometry = new Multipoint({
                points,
                spatialReference: sr
              })
            }

            if (geometry) {
              const title = markerPointUrlParam.title || ''
              const label = markerPointUrlParam.label || ''
              const graphic = new Graphic({
                geometry,
                attributes: {
                  title,
                  label
                }
              })

              groupGraphics.push(graphic)
            }
          }
        })

        if (groupGraphics.length > 0) {
          const markerGroup: MarkerGroup = {
            configSymbolJson,
            symbol,
            graphics: groupGraphics
          }

          markerGroups.push(markerGroup)
        }
      }
    })
  }

  return markerGroups
}

function isValidNum (value: number) {
  return typeof value === 'number' && !isNaN(value)
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide#prefixing
export function isFullscreenEnabled (): boolean {
  if (!document) {
    return false
  }

  // webkit browsers support both 'Screen' and 'screen'
  // firefox supports 'Screen', not 'screen'
  const enabled = document.fullscreenEnabled || (document as any).webkitFullscreenEnabled || (document as any).webkitFullScreenEnabled || (document as any).mozFullScreenEnabled || (document as any).msFullscreenEnabled

  return enabled
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide#prefixing
export function getFullscreenElement (): HTMLElement {
  if (!document) {
    return null
  }

  // webkit browsers support both 'Screen' and 'screen'
  // firefox supports 'Screen', not 'screen'
  const element = document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).webkitFullScreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement
  return element
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide#prefixing
export function requestFullscreen (element: HTMLElement) {
  try {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if ((element as any).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).webkitRequestFullScreen) { /* Chrome, Safari and Opera */
      (element as any).webkitRequestFullScreen()
    } else if ((element as any).mozRequestFullScreen) { /* Firefox */
      (element as any).mozRequestFullScreen()
    } else if ((element as any).msRequestFullscreen) { /* IE/Edge */
      (element as any).msRequestFullscreen()
    }

    // Do we need to support IE11 ?
    // else if (typeof (window as any).ActiveXObject !== 'undefined') {
    //   const wscript = new ActiveXObject('WScript.Shell')
    //   if (wscript !== null) {
    //     wscript.SendKeys('{F11}')
    //   }
    // }
  } catch (e) {
    console.error('requestFullscreen error', e)
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API/Guide#prefixing
export function exitFullscreen () {
  try {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) { /* Chrome, Safari and Opera */
      (document as any).webkitExitFullscreen()
    } else if ((document as any).webkitExitFullScreen) { /* Chrome, Safari and Opera */
      (document as any).webkitExitFullScreen()
    } else if ((document as any).mozCancelFullScreen) { /* Firefox */
      (document as any).mozCancelFullScreen()
    } else if ((document as any).msExitFullscreen) { /* IE/Edge */
      (document as any).msExitFullscreen()
    }
  } catch (e) {
    console.error('exitFullscreen error', e)
  }
}

function getSubtypeField (layer: __esri.SubtypeGroupLayer | __esri.SubtypeSublayer): string {
  if (!layer) {
    return null
  }

  const subtypeField = layer.subtypeField

  if (subtypeField) {
    const fieldInfo = layer.getField(subtypeField)

    // Some subtype field is upper case but the fields in layer definition is lower case.
    // layer.getField() can get the correct fieldInfo even subtypeField is upper case.
    // e.g. subtypeField is 'ASSETGROUP', but fieldInfo.name is 'assetgroup'
    if (fieldInfo && fieldInfo.name) {
      return fieldInfo.name
    }
  }

  return subtypeField
}

export function getRuntimeAppState (): IMState {
  const state = getAppStore().getState()
  return window.jimuConfig?.isBuilder ? state.appStateInBuilder : state
}

export function getActiveJimuMapViewId(mapWidgetId: string, returnAnyJimuMapViewIdIfNoActive: boolean): string {
  let activeJimuMapViewId = null

  const runtimeAppState = getRuntimeAppState()
  const jimuMapViewsInfo = runtimeAppState?.jimuMapViewsInfo

  if (mapWidgetId && jimuMapViewsInfo) {
    const jimuMapViewIds = Object.keys(jimuMapViewsInfo)

    if (jimuMapViewIds.length > 0) {
      activeJimuMapViewId = jimuMapViewIds.find(jimuMapViewId => jimuMapViewsInfo[jimuMapViewId]?.mapWidgetId === mapWidgetId && jimuMapViewsInfo[jimuMapViewId]?.isActive)

      // using a default map view as active map view if the widget hasn't been loaded.
      if (!activeJimuMapViewId && returnAnyJimuMapViewIdIfNoActive) {
        activeJimuMapViewId = jimuMapViewIds.find(jimuMapViewId => jimuMapViewsInfo[jimuMapViewId]?.mapWidgetId === mapWidgetId)
      }
    }
  }

  return activeJimuMapViewId
}

export function getActiveJimuMapView(mapWidgetId: string, returnAnyViewIfNoActive: boolean): JimuMapView {
  let result: JimuMapView = null
  const mapViewManager = MapViewManager.getInstance()

  if (mapWidgetId) {
    const mapViewGroup = mapViewManager.getJimuMapViewGroup(mapWidgetId)

    if (mapViewGroup && mapViewGroup.jimuMapViews) {
      const jimuMapViews = Object.values(mapViewGroup.jimuMapViews).filter(jimuMapView => !!jimuMapView)

      if (jimuMapViews.length > 0) {
        result = jimuMapViews.find(jimuMapView => jimuMapView.isActive)
      }

      // using a default map view as active map view if the widget hasn't been loaded.
      if (!result && returnAnyViewIfNoActive) {
        result = jimuMapViews[0]
      }
    }
  }

  return result
}

export function getViewSurfaceDom(view: __esri.MapView | __esri.SceneView): HTMLElement {
  let result: HTMLElement = null

  if (view?.container) {
    result = view.container.querySelector('.esri-view-surface')
  }

  return result
}

export function updateAriaLabelForViewSurface(view: __esri.MapView | __esri.SceneView, ariaLabel: string) {
  if (!ariaLabel) {
    ariaLabel = ''
  }

  // const surfaceDom = getViewSurfaceDom(view)
  // if (surfaceDom) {
  //   surfaceDom.setAttribute('aria-label', ariaLabel)
  // }

  (view as any).aria = {
    label: ariaLabel
  }
}