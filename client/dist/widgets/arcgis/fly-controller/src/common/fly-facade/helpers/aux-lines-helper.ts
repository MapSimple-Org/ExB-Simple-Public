import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import * as utils from '../../utils/utils'

interface AuxOptions {
  // webMapId: string;
  // parentMapView: __esri.MapView;
  // parentMap:  __esri.Map;
  sceneView: __esri.SceneView
}

export default class AuxLinesHelper {
  GraphicsLayer: typeof __esri.GraphicsLayer = null
  Point: typeof __esri.Point = null
  Graphic: any
  projectionUtils: any
  webMercatorUtils: any
  sceneView: __esri.SceneView

  // layers
  auxGraphicsLayer: __esri.GraphicsLayer
  auxMovingObjLayer: __esri.GraphicsLayer

  constructor (options: AuxOptions) {
    loadArcGISJSAPIModules([
      'esri/layers/GraphicsLayer',
      'esri/geometry/Point',
      'esri/Graphic',
      'esri/views/3d/support/projectionUtils',
      'esri/geometry/support/webMercatorUtils'
    ]).then(modules => {
      [
        this.GraphicsLayer, this.Point, this.Graphic, this.projectionUtils, this.webMercatorUtils
      ] = modules
      this.auxGraphicsLayer = new this.GraphicsLayer({ listMode: 'hide' })
      this.sceneView.map.add(this.auxGraphicsLayer)
      this.auxMovingObjLayer = new this.GraphicsLayer({ listMode: 'hide' })
      this.sceneView.map.add(this.auxMovingObjLayer)
    })

    this.sceneView = options.sceneView
  }

  clearAll = (): void => {
    if (utils.isDefined(this.auxGraphicsLayer)) {
      this.auxGraphicsLayer.removeAll() // clean layer
    }
    if (utils.isDefined(this.auxMovingObjLayer)) {
      this.auxMovingObjLayer.removeAll() // clean layer
    }
  }

  deposeMoving = (): void => {
    this.auxMovingObjLayer.removeAll() // clean layer
  }

  // aux point
  drawPoint = (mapPoint: __esri.Geometry, color?): __esri.Graphic => {
    const c = utils.isDefined(color) ? color : 'darkgreen'
    const point = new this.Graphic({
      geometry: mapPoint,
      symbol: {
        type: 'point-3d',
        symbolLayers: [{
          type: 'icon',
          size: 12,
          resource: { primitive: 'circle' },
          material: { color: c },
          outline: { color: 'limegreen' }
        }]
      }
    })
    this.auxMovingObjLayer.add(point)
    return point
  }

  drawPointGL = (pointGL: number[] | Float32Array, color): __esri.Graphic => {
    const pointGeo = utils.renderCoordToGeoCoord(pointGL, 1, this.sceneView)
    const pt = new this.Point({
      x: pointGeo[0],
      y: pointGeo[1],
      z: pointGeo[2],
      // type: 'point',
      spatialReference: this.sceneView.spatialReference
    })

    if (pt.z < 100) {
      pt.z = 100
    }

    const c = utils.isDefined(color) ? color : 'darkgreen'
    const point = new this.Graphic({
      geometry: pt,
      symbol: {
        type: 'point-3d',
        symbolLayers: [{
          type: 'icon',
          size: 12,
          // resource: { primitive: "circle" },
          // material: { color: c },
          // outline: { color: "limegreen" }
          resource: { primitive: 'circle' },
          material: { color: c },
          outline: { color: 'limegreen' }
        }]
      }
    })
    this.auxMovingObjLayer.add(point)
    return point
  }

  // aux line
  drawLine = (linesPoints, color): __esri.Graphic => {
    const c = utils.isDefined(color) ? color : 'lightblue'
    const line = new this.Graphic({
      geometry: {
        type: 'polyline',
        paths: linesPoints,
        spatialReference: this.sceneView.spatialReference
      },
      symbol: { type: 'line-3d', symbolLayers: [{ type: 'line', material: { color: c }, size: 3 }] }
    })
    this.auxGraphicsLayer.add(line)
    return line
  }

  drawLineXY = (linesPoints, color): __esri.Graphic => {
    const xypoints = []
    for (let i = 0, len = linesPoints.length; i < len; i++) {
      const p = linesPoints[i]
      const x = p[0]; const y = p[1]; const z = p[2]

      if (z === 0) {
        xypoints.push([x, y])
      } else {
        xypoints.push([x, y, z])
      }
    }

    const c = utils.isDefined(color) ? color : 'lightblue'
    const line = new this.Graphic({
      geometry: {
        type: 'polyline',
        paths: xypoints,
        spatialReference: this.sceneView.spatialReference
      },
      symbol: { type: 'line-3d', symbolLayers: [{ type: 'line', material: { color: c }, size: 3 }] }
    })
    this.auxGraphicsLayer.add(line)
    return line
  }

  drawLineGL = (linesPoints, sceneView, color): __esri.Graphic => {
    const c = utils.isDefined(color) ? color : 'lightblue'

    const geoLines = []
    for (let i = 0, len = linesPoints.length; i < len; i++) {
      const pGL = linesPoints[i]
      const p = utils.renderCoordToGeoCoord(pGL, 1, sceneView)
      geoLines.push(p)
    }

    const line = new this.Graphic({
      geometry: {
        type: 'polyline',
        paths: geoLines,
        spatialReference: this.sceneView.spatialReference
      },
      symbol: { type: 'line-3d', symbolLayers: [{ type: 'line', material: { color: c }, size: 3 }] }
    })
    this.auxGraphicsLayer.add(line)
    return line
  }

  /*
    aux_genAFakeLine = (refPoint) => {
      let lines = [];

      let octLon, octLat;
      if (true === this.sceneView.spatialReference.isWebMercator) {
        let extent = this.sceneView.extent;

        let p1 = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymax);
        let p2 = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymin);

        octLon = Math.abs(p1[0] - p2[0]) / 16;
        octLat = Math.abs(p1[1] - p2[1]) / 16;
      }

      let tmpLon = refPoint.longitude,
        tmpLat = refPoint.latitude;

      let p1 = [refPoint.x, refPoint.y, refPoint.z];

      tmpLon += octLon;
      tmpLat += octLat;
      let tp2 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p2 = [tp2[0], refPoint.y, 200];

      tmpLon += octLon;
      tmpLat += octLat;
      let tp3 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p3 = [tp3[0], tp3[1], 400];

      tmpLon -= octLon;
      tmpLat += octLat;
      let tp4 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p4 = [tp4[0], tp4[1], 100];

      tmpLon += 2*octLon;
      tmpLat += 2*octLat;
      let tp5 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p5 = [tp5[0], tp5[1], 100];

      tmpLon += octLon;
      tmpLat += 0//octLat;
      let tp6 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p6 = [tp6[0], tp6[1], 100];

      lines.push(p1, p2, p3, p4, p5, p6);

      // aux line
      this.aux_drawLine(lines);

      return lines;
    };

    mo.aux_genAFakeLine2 = function (refPoint) {
      let lines = [];

      let halfLon, halfLat;
      if (true === this.sceneView.spatialReference.isWebMercator) {
        let extent = this.sceneView.extent;

        let p1 = webMercatorUtils.xyToLngLat(extent.xmax, extent.ymax);
        let p2 = webMercatorUtils.xyToLngLat(extent.xmin, extent.ymin);

        halfLon = Math.abs(p1[0] - p2[0]) / 8;
        halfLat = Math.abs(p1[1] - p2[1]) / 8;
      }

      let tmpLon = refPoint.longitude,
        tmpLat = refPoint.latitude;

      let p1 = [refPoint.x, refPoint.y, refPoint.z];

      tmpLon += halfLon;
      tmpLat += halfLat;
      let tp2 = webMercatorUtils.lngLatToXY(tmpLon, tmpLat);
      let p2 = [tp2[0], tp2[1], 200];

      lines.push(p1, p2);

      // aux line
      this.aux_drawLine(lines);

      return lines;
    }; */
}
