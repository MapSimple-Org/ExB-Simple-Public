import * as utils from '../../../../utils/utils'
// https://github.com/mourner/simplify-js/blob/3d/simplify.js

// to suit your point format, run search/replace for '[0]', '[1]' and '[2]';
// (configurability would draw significant performance overhead)
// both algorithms combined for awesome performance
export function douglasPeucker3D (points: number[], tolerance: number, highestQuality: boolean): number[] {
  const sqTolerance = (typeof tolerance !== 'undefined') ? tolerance * tolerance : 1

  points = (highestQuality) ? points : simplifyRadialDistance(points, sqTolerance)
  points = simplifyDouglasPeucker(points, sqTolerance)

  return points
}

// square distance between 2 points
function getSquareDistance (p1: number[], p2: number[]): number {
  const dx = p1[0] - p2[0]
  const dy = p1[1] - p2[1]
  const dz = p1[2] - p2[2]
  return dx * dx + dy * dy + dz * dz
}
// square distance from a point to a segment
function getSquareSegmentDistance (p: number[], p1: number[], p2: number[]): number {
  let x = p1[0]
  let y = p1[1]
  let z = p1[2]

  let dx = p2[0] - x
  let dy = p2[1] - y
  let dz = p2[2] - z

  if (dx !== 0 || dy !== 0 || dz !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy + (p[2] - z) * dz) /
      (dx * dx + dy * dy + dz * dz)

    if (t > 1) {
      x = p2[0]
      y = p2[1]
      z = p2[2]
    } else if (t > 0) {
      x += dx * t
      y += dy * t
      z += dz * t
    }
  }

  dx = p[0] - x
  dy = p[1] - y
  dz = p[2] - z

  return dx * dx + dy * dy + dz * dz
}
// the rest of the code doesn't care for the point format

// basic distance-based simplification
function simplifyRadialDistance (points, sqTolerance: number): number[] {
  let prevPoint = points[0]
  const newPoints = [prevPoint]
  let point

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i]

    if (getSquareDistance(point, prevPoint) > sqTolerance) {
      newPoints.push(point)
      prevPoint = point
    }
  }

  if (prevPoint !== point) {
    newPoints.push(point)
  }

  return newPoints
}

// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker (points, sqTolerance: number): number[] {
  const len = points.length
  const MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array
  const markers = new MarkerArray(len)

  let first = 0
  let last = len - 1

  const stack = []
  const newPoints = []

  let i; let maxSqDist; let sqDist; let index

  markers[first] = markers[last] = 1

  while (utils.isDefined(last) && last !== 0) { // for lint, raw code is: while (last)
    maxSqDist = 0

    for (i = first + 1; i < last; i++) {
      sqDist = getSquareSegmentDistance(points[i], points[first], points[last])

      if (sqDist > maxSqDist) {
        index = i
        maxSqDist = sqDist
      }
    }

    if (maxSqDist > sqTolerance) {
      markers[index] = 1
      stack.push(first, index, index, last)
    }

    last = stack.pop()
    first = stack.pop()
  }

  for (i = 0; i < len; i++) {
    if (utils.isDefined(markers[i])) {
      newPoints.push(points[i])
    }
  }

  return newPoints
}

// lng/lat calculation
// function calculationDistance(point1, point2){
//   let lat1 = point1.C_COORDINATEY;
//   let lat2 = point2.C_COORDINATEY;
//   let lng1 = point1.C_COORDINATEX;
//   let lng2 = point2.C_COORDINATEX;
//   let radLat1 = lat1 * Math.PI / 180.0;
//   let radLat2 = lat2 * Math.PI / 180.0;
//   let a = radLat1 - radLat2;
//   let b = (lng1 * Math.PI / 180.0) - (lng2 * Math.PI / 180.0);
//   let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2)
//     + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
//   return s * 6370996.81;
// };
// function distToSegment(start, end, center){
//   let a = Math.abs(calculationDistance(start, end));
//   let b = Math.abs(calculationDistance(start, center));
//   let c = Math.abs(calculationDistance(end, center));
//   let p = (a + b + c) / 2.0;
//   let s = Math.sqrt(Math.abs(p * (p - a) * (p - b) * (p - c)));
//   return s * 2.0 / a;
// };
