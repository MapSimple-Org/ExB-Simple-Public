import * as utils from '../../../../utils/utils'
import Bspline from './bspline'
import { douglasPeucker3D } from './douglas-peucker'
import CatmullRomCurve from './catmull-rom-curve'
import type BasePath from './base-path'

export default class CurvePath implements BasePath {
  // arcLengthDivisions: number;// = 200000;
  // cacheArcLengths: any;
  // needsUpdate: false;
  points: any
  length: number
  // closed: any;
  // curveType: any;
  // tension: any;
  sceneView: any
  vec3: any
  vec3d: any
  esriMathUtils: any

  curve: any

  // path optimization
  longLineProcessing = { // long straight line
    threshold: 400,
    distance: 150
  }

  acuteAngleProcessing = {
    angle: 90,
    threshold: 300,
    distance: 100
  }

  constructor (points, sceneView, vec3, vec3d, esriMathUtils) {
    // this.points = this._geoArrayToCoords(points);
    // this.closed = closed || false;
    this.sceneView = sceneView
    this.points = this.geoArrayToCoords(points)
    this.vec3 = vec3
    this.vec3d = vec3d
    this.esriMathUtils = esriMathUtils
    // this.curveType = curveType || 'centripetal';
    // this.tension = tension || 0.5;
    // this.arcLengthDivisions = 20000;

    // paths = this.geoCoordToRenderCoord(paths);
    // const paths5_lowQuality = douglasPeucker3D(paths, 5, false);//1010 ==> 49
    // const paths5_highQuality = douglasPeucker3D(this.points, 5, true)// 1010 ==> 49
    // const paths10_lowQuality = douglasPeucker3D(paths, 10, false); //1010 ==> 32
    // const paths10_highQuality = douglasPeucker3D(paths, 10, true); //1010 ==> 32
    // const paths20_lowQuality = douglasPeucker3D(paths, 20, false); //1010 ==> 20
    // const paths20_highQuality = douglasPeucker3D(paths, 20, true); //1010 ==> 19
    // const paths100_lowQuality = douglasPeucker3D(paths, 100, false);//1010 ==> 7
    // const paths100_highQuality = douglasPeucker3D(paths, 100, true);//1010 ==> 7
    const paths = douglasPeucker3D(this.points, 5, true)
    this.points = this.preProcessing(paths)

    const bspline = new Bspline(this.points)// TODO nurbs
    this.curve = new CatmullRomCurve(bspline.getSpline())
    bspline.clear()
  }

  destructor (): void {
    this.points = null
    this.curve = null
  }

  private readonly geoArrayToCoords = (geoArray): number[] => {
    const vecs = []
    for (let i = 0, len = geoArray.length; i < len; i++) {
      let p = geoArray[i]
      p = utils.geoCoordToRenderCoord([p[0], p[1], p[2]], null, this.sceneView)
      vecs.push(p)
    }
    return vecs
  }

  getLength = (): number => {
    return this.curve.getLength()
  }

  getUtoTmapping (nil, move): number {
    return this.curve.getUtoTmapping(0, move)
  }

  getPoint (p): number[] {
    return this.curve.getPoint(p)
  }

  // arcgis
  // _geoArrayToCoords = (geoArray) => {
  //   let vecs = [];
  //   for (let i = 0, len = geoArray.length; i < len; i++) {
  //     vecs.push(new Vector3(geoArray[i][0], geoArray[i][1], geoArray[i][2]));
  //   }
  //   return vecs;
  // }
  preProcessing (glGeos): number[] {
    const processedPoints = []

    let _lastSecondHalInsertedPoint = null

    for (let ii = 0; ii < (glGeos.length - 1); ii++) {
      const p0 = glGeos[ii]
      const p1 = glGeos[ii + 1]
      const p2 = glGeos[ii + 2]// maybe undefined

      // 1 longLineProcessing
      const firstHalfDistance = utils.distance(p0, p1)
      const secondHalfDistance = utils.isDefined(p2) ? utils.distance(p1, p2) : null
      // 2 acuteAngleProcessing
      let isAcuteAngle = false
      if (utils.isDefined(firstHalfDistance) && utils.isDefined(secondHalfDistance)) {
        const angle = utils.getRotatedAngle({prePos:p0, basePos:p1, nextPos:p2}, this.vec3, this.vec3d, this.sceneView, this.esriMathUtils)
        isAcuteAngle = (Math.abs(angle) > this.acuteAngleProcessing.angle)
      }

      const isFirst: boolean = !!(ii === 0)
      const isLast: boolean = !!(glGeos.length - 1 === ii + 1)
      let insertedRes

      // 1 basePoint
      processedPoints.push(p0)

      // 2 prepared in the last round
      if (utils.isDefined(_lastSecondHalInsertedPoint) && (!isFirst)) {
        processedPoints.push(_lastSecondHalInsertedPoint)
        // console.log('add 1 point: _lastSecondHalInsertedPoint');
        _lastSecondHalInsertedPoint = null
      }

      // 3: firstHalf
      insertedRes = this._getInsertControlPointRes(firstHalfDistance, isAcuteAngle)
      if (insertedRes.isInsert === true && (!isFirst && !isLast)) {
        const insertedPoint = this._getInsertedPoint(p0, p1, 'forward', insertedRes.distance)

        processedPoints.push(insertedPoint)
        // console.log('add 1 point: firstHalf');
      }

      // 4: secondHalf
      insertedRes = this._getInsertControlPointRes(secondHalfDistance, isAcuteAngle)
      if (insertedRes.isInsert === true && (!isLast)) {
        _lastSecondHalInsertedPoint = this._getInsertedPoint(p1, p2, 'backward', insertedRes.distance)
      }

      // 5 the last point
      if (isLast) {
        processedPoints.push(p1)
      }
    }

    for (let i = 0, ll = processedPoints.length; i < ll; i++) {
      let p = processedPoints[i]
      p = utils.renderCoordToGeoCoord(p, null, this.sceneView)
      processedPoints.splice(i, 1, p)
    }
    return processedPoints
    // for (let i = 0, ll = glGeos.length; i < ll; i++) {
    //   let p = glGeos[i];
    //   p = utils.renderCoordToGeoCoord(p, null, this.sceneView)
    //   glGeos.splice(i, 1, p);
    // }
    // //glGeos = utils.renderCoordToGeoCoord(new Float32Array(glGeos), glGeos.length, this.sceneView)
    // return glGeos;
  }

  _getInsertControlPointRes (distance: number, isAcuteAngle: boolean): { isInsert: boolean, distance: number } {
    const acuteAngleThreshold = (distance > this.acuteAngleProcessing.threshold)
    const longStraightLineThreshold = (distance !== null) && (distance > this.longLineProcessing.threshold)

    if (isAcuteAngle && acuteAngleThreshold) {
      return {
        isInsert: true,
        distance: this.acuteAngleProcessing.distance
      }
    } else if (longStraightLineThreshold) {
      return {
        isInsert: true,
        distance: this.longLineProcessing.distance
      }
    }

    return { isInsert: false, distance: 0 }
  }

  _getInsertedPoint (p0, p1, dir: string, distance: number): number[] {
    const vecDir = this.vec3d.create()
    const vecNor = this.vec3d.create()
    const vecTmp = this.vec3d.create()
    const insertedPoint = this.vec3d.create()

    if (dir === 'forward') {
      this.vec3.subtract(vecDir, p0, p1) // dir: 1->0
      this.vec3.normalize(vecNor, vecDir)
      this.vec3.scale(vecTmp, vecNor, distance)
      this.vec3.add(insertedPoint, p1, vecTmp)
    } else { // "backward"
      this.vec3.subtract(vecDir, p1, p0) // dir: 0->1
      this.vec3.normalize(vecNor, vecDir)
      this.vec3.scale(vecTmp, vecNor, distance)
      this.vec3.add(insertedPoint, p0, vecTmp)
    }

    return insertedPoint
  }

  _getMidpoint (p0, p1, distance?: number): number[] {
    const vecDir = this.vec3d.create()
    const vecNor = this.vec3d.create()
    const vecTmp = this.vec3d.create()
    const midPoint = this.vec3d.create()

    const distance1stHalf = utils.isDefined(distance) ? distance : utils.distance(p0, p1)

    this.vec3.subtract(vecDir, p0, p1) // dir: 1->0
    this.vec3.normalize(vecNor, vecDir)
    this.vec3.scale(vecTmp, vecNor, distance1stHalf / 2)
    this.vec3.add(midPoint, p1, vecTmp)

    return midPoint
  }
}
