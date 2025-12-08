import { isDefined } from '../../../../utils/utils'
export default class Bspline {
  points: any
  iter: number

  constructor (points, iterF?: number) {
    this.points = points ?? []
    this.points = this.normalPoints4Bspline(this.points)
    this.iter = iterF ?? 3
  }

  getSpline (): number[] {
    const bPoints = this.bspline(this.points, this.iter)
    const vecsBspline = this.mergePoints(bPoints)
    /// *let _len = */getSplineLen(vecsBspline);
    return vecsBspline
  }

  clear (): void {
    this.points = null
    this.iter = null
  }

  // export function _getVecLength(a): number {
  //   const x = a[0];
  //   const y = a[1];
  //   const z = a[2];
  //   return Math.sqrt(x * x + y * y + z * z);
  // }
  // export function _subtract(out, a, b) {
  //   out[0] = a[0] - b[0];
  //   out[1] = a[1] - b[1];
  //   out[2] = a[2] - b[2];
  //   return out;
  // }

  normalPoints4Bspline (rawPoints: number[]): number[] {
    const outPoints = []
    for (let i = 0, len = rawPoints.length; i < len; i++) {
      const p = rawPoints[i]
      const x = p[0]
      const y = p[1]
      const z = p[2] ?? 0
      outPoints.push(x, y, z)
    }
    return outPoints
  }

  mergePoints (panedPoints: number[]): number[] {
    const outPoints = []
    for (let i = 0, len = panedPoints.length / 3; i < len; i++) {
      const px = panedPoints[3 * i]
      const py = panedPoints[3 * i + 1]
      const pz = panedPoints[3 * i + 2]
      const tar = []
      tar.push(px, py, pz)
      outPoints.push(tar)
    }
    return outPoints
  }

  bspline (pts, iterations): number[] {
    if (!isDefined(iterations) || iterations === 0) {
      return pts
    }
    const items = pts.length / 3.0
    const pts2 = [pts[0], pts[1], pts[2]]

    const controlPoint1 = 0.2; const controlPoint2 = 0.8
    for (let i = 0; i < items - 1; i++) {
      const j = 3 * i
      pts2[3 + 2 * j + 0] = controlPoint2 * pts[j + 0] + controlPoint1 * pts[j + 3]
      pts2[3 + 2 * j + 1] = controlPoint2 * pts[j + 1] + controlPoint1 * pts[j + 4]
      pts2[3 + 2 * j + 2] = controlPoint2 * pts[j + 2] + controlPoint1 * pts[j + 5]

      pts2[3 + 2 * j + 3] = controlPoint1 * pts[j + 0] + controlPoint2 * pts[j + 3]
      pts2[3 + 2 * j + 4] = controlPoint1 * pts[j + 1] + controlPoint2 * pts[j + 4]
      pts2[3 + 2 * j + 5] = controlPoint1 * pts[j + 2] + controlPoint2 * pts[j + 5]
    }
    pts2.push(pts[pts.length - 3], pts[pts.length - 2], pts[pts.length - 1])

    return this.bspline(pts2, iterations - 1)
  }
}
