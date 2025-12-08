import * as arcgisWebgl from 'esri/views/3d/webgl'
import { lodash } from 'jimu-core'
import { FlyItemMode } from '../../config'
import nls from '../../runtime/translations/default'
import type { FlyIds } from '../fly-facade/fly-manager'
import type { LiveViewSettingOptions } from '../fly-facade/controllers/common/liveview-setting'
import { Constraints, type RouteConfig, type RecordConfig } from '../constraints'

// coord
export function geoCoordToRenderCoord (inCood: number[] | Float32Array, num: number, sceneView: __esri.SceneView): number[] {
  const transNum = isDefined(num) ? num : 1

  const renderCoordinates = []
  arcgisWebgl.toRenderCoordinates(sceneView, inCood, 0,
    null, // null: means follow this.scene.sp
    renderCoordinates, 0, transNum)

  return renderCoordinates
}
export function renderCoordToGeoCoord (varCood: number[] | Float32Array, num: number, sceneView: __esri.SceneView): number[] {
  const transNum = isDefined(num) ? num : 1

  const outGeographicCoordinates = []
  arcgisWebgl.fromRenderCoordinates(sceneView, varCood, 0, outGeographicCoordinates, 0,
    null,
    transNum)

  return outGeographicCoordinates
}

// //ll - xy
// this._tmpZ = 200;
// export function lngLatToXY(tmpLon, tmpLat, elevZ) {
//   let tp = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
//   let z = elevZ ? elevZ : this._tmpZ;
//   return [tp[0], tp[1], z];
// }
// export function xyToLngLat(x, y) {
//   let p2 = webMercatorUtils.xyToLngLat(x, y);
//   //halfLon = Math.abs(p1[0] - p2[0]) / 8;
//   return p2;
// }

// math
export function degToRad (degrees: number): number {
  return degrees * Math.PI / 180
}
export function radToDeg (radians: number): number {
  return radians * 180 / Math.PI
}
export function distance (from: number[], to: number[]): number {
  const x = to[0] - from[0]
  const y = to[1] - from[1]
  const z = to[2] - from[2]

  const len = x * x + y * y + z * z
  return Math.sqrt(len)
}
export function sign (num: number): number {
  return (num < 0) ? -1 : (num > 0) ? 1 : 0
}
// x in range<a1,a2> mapping to range<b1,b2>
export function mapLinear (x: number, a1: number, a2: number, b1: number, b2: number): number {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1)
}
// interpolation
export function lerp (from: number[], to: number[], factor: number): number[] {
  // let inter = { x: 0, y: 0, z: 0 };
  const inter = []
  inter[0] = ((to[0] - from[0]) * factor) + from[0]
  inter[1] = ((to[1] - from[1]) * factor) + from[1]
  inter[2] = ((to[2] - from[2]) * factor) + from[2]

  return inter
}

export function getRotatedAngle (position: {prePos, basePos, nextPos}, vec3, vec3d, sceneView: __esri.SceneView, esriMathUtils): number {
  const prePos = position.prePos
  const basePos = position.basePos ?? null
  const nextPos = position.nextPos ?? null

  if (basePos === null || nextPos === null) {
    return 0
  }

  const lastVec = vec3d.create()
  vec3.subtract(lastVec, basePos, prePos)
  const nextVec = vec3d.create()
  vec3.subtract(nextVec, nextPos, basePos)

  const auxUpVec = vec3d.create()
  sceneView.renderCoordsHelper.worldUpAtPosition(basePos, auxUpVec) // up-aux-line
  const angle = radToDeg(esriMathUtils.angle(lastVec, nextVec, auxUpVec))

  return angle// * Constraints.SPEED.MULTIPLIER;//Math.abs(Math.round(angle)) * Constraints.SPEED.MULTIPLIER;
}

// geo
export function isPolylineEquals (polyline1: __esri.Polyline, polyline2: __esri.Polyline): boolean {
  if (!polyline1.extent.equals(polyline2.extent)) {
    return false
  }
  if (polyline1.paths.length !== polyline2.paths.length) {
    return false
  }
  if (polyline1.paths[0].length !== polyline2.paths[0].length) {
    return false
  }

  return lodash.isDeepEqual(polyline1, polyline2)
}
// elev info
export function queryGeometryElevInfo (geometry: __esri.Point | __esri.Polyline, sceneView: __esri.SceneView): __esri.Point | __esri.Multipoint | __esri.Polyline {
  return _fixApiElevNoData(sceneView.groundView.elevationSampler.queryElevation(geometry), sceneView)
}

// fixes for API elevation bug ,#10513 ,#13956
export function _fixApiElevNoData (geometryWithElevation: __esri.Point | __esri.Multipoint | __esri.Polyline, sceneView: __esri.SceneView): __esri.Point | __esri.Multipoint | __esri.Polyline {
  //NODATA_NUM => '3.4028234663852886e+37',  https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/45175
  const API_NO_DATA_NUM = sceneView.groundView?.elevationSampler?.noDataValue ?? 3.4028234663852886e+37

  if (geometryWithElevation?.hasZ) {
    //1.point
    if (geometryWithElevation.type === 'point') {
      const z = geometryWithElevation.z

      if (z === API_NO_DATA_NUM) {
        geometryWithElevation.z = 0
      }
    }
    //2.path
    if (geometryWithElevation.type === 'polyline') {
      const path = geometryWithElevation.paths[0]
      const firstPoint = path[0]
      const z = firstPoint[2]

      if (z === API_NO_DATA_NUM) {
        path.forEach((point) => {
          point[2] = 0
        })
      }
    }
  }

  return geometryWithElevation
}

export function getHitPointOnTheGround (hitTestResult: __esri.SceneViewHitTestResult): __esri.HitTestResultGround {
  let lastHit = null
  if (hitTestResult.results.length > 0) {
    lastHit = hitTestResult.results[hitTestResult.results.length - 1]
  }
  if (isDefined(hitTestResult.ground.mapPoint)) {
    if (isDefined(lastHit)) {
      if (hitTestResult.ground.distance > lastHit.distance) {
        // an object under the ground could be more far away, check first the distance before set the ground as last point
        lastHit = hitTestResult.ground
      }
    } else {
      lastHit = hitTestResult.ground
    }
  }
  // this.aux_drawPoint(lastHit.mapPoint);

  return lastHit
}
export function getDistanceFrom2LngLat (lng1, lat1, lng2, lat2): number {
  const radLng1 = degToRad(lng1)
  const radLat1 = degToRad(lat1)
  const radLng2 = degToRad(lng2)
  const radLat2 = degToRad(lat2)

  const a = radLat1 - radLat2
  const b = radLng1 - radLng2

  const km = 2 * Math.asin(Math.sqrt(Math.sin(a / 2) * Math.sin(a / 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(b / 2) * Math.sin(b / 2))) * 6378.137
  return km
}

// widget
export function getEnabledItemNum (itemsList): number {
  let count = 0
  for (let i = 0, len = itemsList.length; i < len; i++) {
    const item = itemsList[i]
    if (isDefined(item) && item.isInUse !== false) {
      count++
    }
  }
  return count
}
export function getFlyStyleTitle (flyStyle, props): string {
  if (flyStyle === FlyItemMode.Rotate) {
    return props.intl.formatMessage({ id: 'flyStyleRotate', defaultMessage: nls.flyStyleRotate })
  } else if (flyStyle === FlyItemMode.Path) {
    return props.intl.formatMessage({ id: 'flyStylePath', defaultMessage: nls.flyStylePath })
  } else if (flyStyle === FlyItemMode.Route) {
    return props.intl.formatMessage({ id: 'flyStyleRoute', defaultMessage: nls.flyStyleRoute })
  } else {
    return null
  }
}

// speed
// num: [0-1] ==> speed: [1/8 - 8]
export function speedMapping (num: number, decimal?: number): number {
  const min = Constraints.SPEED.MIN
  const max = Constraints.SPEED.MAX
  const fac = Constraints.SPEED.MULTIPLIER
  let speed; const half = (max - min) / 2
  if (num < half) {
    speed = 1 / ((half - num) / (half) * fac)
    // if (0 === speed) {
    //   speed = 1 / fac;//0
    // }
  } else {
    speed = (num - half) / (max - half) * fac

    if (speed === 0) {
      speed = 1//= = half
    }
  }

  return parseFloat(speed.toFixed(isDefined(decimal) ? decimal : Constraints.SPEED.DECIMAL))
}

// live view setting
export function getInitLiveviewSetting (): LiveViewSettingOptions {
  return {
    speed: 0.5, // [0 - 1], show as [1/8 - 8]
    // heading: 0,
    tilt: 0, // [0 - 90]
    altitude: 0 // [0 - 500]
  }
}
export function clampTilt (tilt): number {
  if (tilt <= 0) {
    return 0.1
  } else if (tilt >= 90) {
    return 89.9
  } else {
    return tilt
  }
}
export function showLiveviewSetting (num: number, unit: string): string {
  return angleNumFix(Number(num)).toString() + ' ' + unit // for #6627, in React.state the `num: number` maybe turn to a string
}
// calculated value rounded ,#6406
export function angleNumFix (angle: number): number {
  const _angle = angle?.toFixed ? parseFloat(angle.toFixed(Constraints.CALCULATED_VALUE_ROUNDED.ANGLE)) : NaN
  return resetEmptyInputTo0(_angle)
}
export function altNumFix (alt: number): number {
  const _alt = alt?.toFixed ? parseFloat(alt.toFixed(Constraints.CALCULATED_VALUE_ROUNDED.ELEV)) : NaN
  return resetEmptyInputTo0(_alt)
}
export function timeNumFix (time: number): number {
  const _time = time?.toFixed ? parseFloat(time.toFixed(Constraints.CALCULATED_VALUE_ROUNDED.TIME)) : NaN
  return resetEmptyInputTo0(_time)
}
// empty input value for calculated value ,#6556
export function resetEmptyInputTo0 (inputVal: number): number {
  return ((inputVal === null) || isNaN(inputVal)) ? 0 : inputVal
}

// Route & Record
export function getRouteConfigByIdx (routes: RouteConfig[], ids: FlyIds): RouteConfig {
  const routeConfig = routes?.find(route => (route.idx === ids.routeUuid))
  return routeConfig
}
export function getRecordConfigByIds (routes: RouteConfig[], ids: FlyIds): RecordConfig {
  const routeConfig = getRouteConfigByIdx(routes, ids)
  const recordConfig = routeConfig?.records?.find(record => (record.idx === ids.recordUuid))
  return recordConfig
}
export function findRecordConfigByOrder (routes: RouteConfig[], ids: FlyIds, order: number): RecordConfig {
  const routeConfig = getRouteConfigByIdx(routes, ids)
  const recordConfig = routeConfig?.records[order]
  return recordConfig
}

// RouteConfig & RecordConfig auto naming rules ,#5084
export function getIncreasedNameByConfig (collection: RouteConfig[] | RecordConfig[], namingTmpl: string): string {
  const namingRule = namingTmpl + ' ' // prefix + ' '
  let max = 0
  collection.forEach((r) => {
    let suffixNum
    const resArr = r.displayName.split(namingRule)
    if (isDefined(resArr) && resArr.length === 2 && resArr[0] === '') {
      suffixNum = resArr[1]
      if (/^\d+$/.test(suffixNum)) {
        suffixNum = parseInt(suffixNum)
        max = Math.max(suffixNum, max)
      }
    }
  })

  return `${namingRule}${max + 1}`
}

// group
// 'fly__' + id;
// JimuMapView.dataSourceId;//like: "dataSource_5"
// JimuMapView.id;//like: "widget_67editor-dataSource_5"
export function genJimuMapIdForFly (mapWidgetId: string): string {
  // return this.MAP_ID_PREFIX + mapWidgetId;
  return 'fly__' + mapWidgetId
}
export function removeJimuMapIdForFly (id: string): string {
  if (id?.startsWith('fly__'/* this.MAP_ID_PREFIX */)) {
    return id.replace('fly__'/* this.MAP_ID_PREFIX */, '')
  } else {
    return id
  }
}

// for tslint
export function isDefined (value): boolean {
  if (typeof value !== 'undefined' && !(value === null)) {
    return true
  } else {
    return false
  }
}

// switchMap
export function getMapSwitchingInfo (widgetId: string, autoControlWidgetId: string, mapId: string) {
  return {
    isTriggeredByFly: (autoControlWidgetId === widgetId),
    isTriggeredByMapSelf: (autoControlWidgetId === mapId)
  }
}
