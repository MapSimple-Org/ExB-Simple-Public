import { utils } from 'jimu-core'
import type { TrackLinePoint, TrackLine, TracksWithLine } from '../../../config'
import { STORES } from '../../../constants'
import { formatNumberWithDecimals } from './util'

// Define the interface for location information
export interface Coordinates {
  latitude: number
  longitude: number
  altitude: number | null
  accuracy: number
  altitudeAccuracy: number | null
  heading: number | null
  speed: number | null
}

// Define the interface for location options
export interface GeolocationOptions {
  enableHighAccuracy: boolean
  timeout: number
  maximumAge: number
}

// Define interfaces for Geolocation API callbacks
type GeolocationPositionCallback = (position: Position) => void

type GeolcationPositionErrorCallback = (error: PositionError) => void

// Define the interface for location and timestamp information
interface Position {
  coords: Coordinates
  timestamp: number
}

// Define the interface for location errors
interface PositionError {
  code: number
  message: string
}

// Define the default location options
export const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

// Get the current position
export const getCurrentPosition = (options: GeolocationOptions) => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: Position) => {
          resolve(position)
        },
        (error: PositionError) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject(error)
        },
        options || defaultOptions
      )
    } else {
      reject(new Error('Geolocation is not supported by this browser.'))
    }
  })
}

// Watch the position
export const watchPosition = (successCallback: GeolocationPositionCallback, errorCallback?: GeolcationPositionErrorCallback, options?: GeolocationOptions) => {
  if (navigator.geolocation) {
    return navigator.geolocation.watchPosition(
      (position: Position) => {
        successCallback(position)
      },
      (error: PositionError) => {
        if (errorCallback) {
          errorCallback(error)
        } else {
          console.error(`Error watching position: ${error.message}`)
        }
      },
      options || defaultOptions
    )
  } else {
    console.error('Geolocation is not supported by this browser.')
    return 0
  }
}

// Clear the watch position
export const clearWatch = (watchId: number) => {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
}

/**
   *  make lines where track a path or stop tracking
   * @param {number} endTime
   */
export const makeLine = (points: TrackLinePoint[], startTime) => {
  const time = new Date().getTime()
  const lineID = getOId(STORES[2].storeName)
  const lineTracks: TrackLinePoint[] = []
  const averageFields = ['altitude', 'speed', 'Accuracy']
  const sums = {
    altitude: null,
    speed: null,
    Accuracy: null
  }
  points.reverse().forEach(p => {
    p.OBJECTID = getOId(STORES[1].storeName)
    const point: TrackLinePoint = { ...p }
    point.LineID = lineID
    lineTracks.push(point)
    averageFields.forEach(element => {
      if (p[element] !== null && typeof p[element] !== 'undefined') {
        sums[element] = sums[element] !== null ? sums[element] + p[element] : p[element]
      }
    })
  })
  const trackLine: TrackLine = {
    StartTime: startTime,
    EndTime: time,
    OBJECTID: lineID,
    AverageAltitude: sums.altitude !== null ? formatNumberWithDecimals((sums.altitude / lineTracks.length), 2) : null,
    AverageSpeed: sums.speed !== null ? formatNumberWithDecimals((sums.speed / lineTracks.length), 2) : null,
    AverageAccuracy: sums.Accuracy !== null ? formatNumberWithDecimals((sums.Accuracy / lineTracks.length), 2) : null
  }
  return { tracks: lineTracks, line: trackLine }
}

/**
 *  update line when get new position
 * @param {TrackLinePoint} track
 * @param {TracksWithLine} tracksWithLine
 * @returns new tracksWithLine
 */
export const updateLine = (track: TrackLinePoint, tracksWithLine: TracksWithLine) => {
  const time = track.location_timestamp
  const lineTracks: TrackLinePoint[] = tracksWithLine.tracks.concat(track)

  const averageFields = ['altitude', 'speed', 'Accuracy']
  const sums = {
    altitude: null,
    speed: null,
    Accuracy: null
  }

  lineTracks.forEach(p => {
    averageFields.forEach(element => {
      if (p[element] !== null && typeof p[element] !== 'undefined') {
        sums[element] = sums[element] !== null ? sums[element] + p[element] : p[element]
      }
    })
  })
  tracksWithLine.line.EndTime = time
  tracksWithLine.line.AverageAltitude = sums.altitude !== null ? formatNumberWithDecimals((sums.altitude / lineTracks.length), 2) : null
  tracksWithLine.line.AverageSpeed = sums.speed !== null ? formatNumberWithDecimals((sums.speed / lineTracks.length), 2) : null
  tracksWithLine.line.AverageAccuracy = sums.Accuracy !== null ? formatNumberWithDecimals((sums.Accuracy / lineTracks.length), 2) : null
  return { tracks: lineTracks, line: tracksWithLine.line }
}

/**
 * create line when get first position
 * @param {TrackLinePoint} track
 * @param {number} startTime
 * @returns tracksWithLine
 */
export const createLine = (track: TrackLinePoint) => {
  const time = track.location_timestamp
  const lineId = track.LineID
  const trackLine: TrackLine = {
    StartTime: time,
    EndTime: time,
    OBJECTID: lineId,
    AverageAltitude: track.altitude !== null ? formatNumberWithDecimals((track.altitude), 2) : null,
    AverageSpeed: track.speed !== null ? formatNumberWithDecimals((track.speed), 2) : null,
    AverageAccuracy: track.Accuracy !== null ? formatNumberWithDecimals((track.Accuracy), 2) : null
  }
  return { tracks: [track], line: trackLine }
}

/**
 * get oid
 * @param storeName store key
 * @returns oid
 */
export const getOId = (storeName): number => {
  const oid = utils.readLocalStorage(storeName) ?? '0'
  const nextOid = Number(oid) + 1
  utils.setLocalStorage(storeName, nextOid.toString())
  return nextOid
}

/**
 * check if there is permission to access location.
 * @returns boolean
 */
export const checkGeolocationPermission = async (): Promise<boolean> => {
  const getPermisson = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Ensure navigator and geolocation are available
      if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        const nav = navigator
        if ('permissions' in navigator) {
          navigator.permissions.query({ name: 'geolocation' }).then((result) => {
            if (result.state === 'granted') {
              resolve(true)
            } else if (result.state === 'prompt') {
              navigator.geolocation.getCurrentPosition(
                () => { resolve(true) },
                (error) => {
                  if (error.code === error.PERMISSION_DENIED) {
                    resolve(false)
                  } else {
                    reject(new Error('Geolocation error: ' + error.message))
                  }
                }
              )
            } else if (result.state === 'denied') {
              resolve(false)
            }
          }).catch((error) => {
            reject(new Error('Permissions API error: ' + error.message))
          })
        } else {
          nav.geolocation.getCurrentPosition(
            () => { resolve(true) },
            (error) => {
              if (error.code === error.PERMISSION_DENIED) {
                resolve(false)
              } else {
                reject(new Error('Geolocation error: ' + error.message))
              }
            }
          )
        }
      } else {
        reject(new Error('Geolocation is not supported by this browser.'))
      }
    })
  }
  const hasPermission = await getPermisson().catch(error => { console.log(error) })
  return hasPermission || false
}
