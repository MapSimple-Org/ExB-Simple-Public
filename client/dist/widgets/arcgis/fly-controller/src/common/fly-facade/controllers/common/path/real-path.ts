import * as utils from '../../../../utils/utils'
import { douglasPeucker3D } from './douglas-peucker'
// import { Constraints } from '../../../../constraints';
import type BasePath from './base-path'

export default class RealPath implements BasePath {
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

  constructor (points: number[], sceneView: __esri.SceneView, vec3, vec3d, esriMathUtils) {
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

    this.points = douglasPeucker3D(this.points, 5, true)
  }

  destructor (): void {
    this.points = null
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
    if (this.points.length < 2) {
      // eslint-disable-next-line no-alert
      alert('line.length < 2')
    }

    let len = 0
    for (let i = 0, l = this.points.length; i < l - 1; i++) {
      // len
      len += this.getLineLen(this.points[i + 0], this.points[i + 1])
      // angle
      len += Math.abs(utils.getRotatedAngle({prePos:this.points[i + 0], basePos:this.points[i + 1], nextPos:this.points[i + 2]}, this.vec3, this.vec3d, this.sceneView, this.esriMathUtils))
    }

    this.length = len
    return len
  }

  private getLineLen (p1: number[], p2: number[]): number {
    const point1GL = p1// utils.geoCoordToRenderCoord([p1[0], p1[1], p1[2]], null, this.sceneView);
    const point2GL = p2// utils.geoCoordToRenderCoord([p2[0], p2[1], p2[2]], null, this.sceneView);
    const d = utils.distance(point1GL, point2GL)
    // console.log('distance==>' + d);
    return d
  }

  getPoint (nil, tarLen: number): { [key: string]: unknown } {
    let sumLen = 0
    for (let i = 0, l = this.points.length; i < l - 1; i++) {
      const current = this.points[i + 0]
      const next = this.points[i + 1]
      const next2 = this.points[i + 2]

      // test 1: line
      const lineLen = this.getLineLen(current, next)
      if (tarLen < (sumLen + lineLen)) {
        // console.log("line:==>p0:" + current + "__p1:" + next);
        const subLen = tarLen - sumLen// Math.abs(tarLen - sumLen);
        const ratio = (subLen / lineLen)
        const p = utils.lerp(current, next, ratio)
        // console.log("distance:" + subLen);
        return {
          type: 'line',
          len: subLen,
          point: p
        }
      }
      sumLen += lineLen

      // test 2: rotate
      const rotatedAngle = utils.getRotatedAngle({prePos:current, basePos:next, nextPos:next2}, this.vec3, this.vec3d, this.sceneView, this.esriMathUtils)
      const rotatedLen = Math.abs(rotatedAngle)
      // rotatedLen = rotatedLen / Constraints.SPEED.MULTIPLIER;
      if (tarLen < (sumLen + rotatedLen)) {
        // console.log("Rotate:==>p0:" + current + "__p1:" + next + "__p2:" + next2);
        const sign = utils.sign(rotatedAngle)
        const angle = (tarLen - sumLen) * sign
        // console.log("angle:==>" + angle);
        return {
          type: 'rotate',
          angle: angle,
          point: next,
          points: {
            pre: current,
            base: next,
            next: next2
          },
          lastLineLen: sumLen
        }
      }
      sumLen += rotatedLen
    }
  }

  // arcgis
  // _geoArrayToCoords = (geoArray) => {
  //   let vecs = [];
  //   for (let i = 0, len = geoArray.length; i < len; i++) {
  //     vecs.push(new Vector3(geoArray[i][0], geoArray[i][1], geoArray[i][2]));
  //   }
  //   return vecs;
  // }
}
