import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { moduleLoader, getAppStore } from 'jimu-core'
import type * as jimuCoreWkid from 'jimu-core/wkid'

interface Result {
  shouldConvertSR: boolean
  searchText: string
  locationPoint?: any
}

export const convertSR = async (searchText: string): Promise<Result> => {
  const shouldConvertSR = checkIsShouldConvertSR(searchText)
  const defaultResult = {
    shouldConvertSR: false,
    searchText: searchText
  }
  if (!shouldConvertSR) {
    return Promise.resolve(defaultResult)
  }
  const pointOfSpecifiedWkid = await getPointFromSpecifiedWkid(searchText)
  const shouldVerifyUtmString = await checkIsShouldVerifyUtmString(searchText)
  if (!pointOfSpecifiedWkid) {
    if (!shouldVerifyUtmString) {
      return Promise.resolve(defaultResult)
    }
    return getPointFromSpecifiedUtmByGeometryService(searchText).then(pointOfSpecifiedUtm => {
      const inputText = getFormatedInputFromPoint(pointOfSpecifiedUtm)
      return Promise.resolve({
        shouldConvertSR: !!inputText,
        searchText: inputText || searchText,
        locationPoint: pointOfSpecifiedUtm
      })
    })
  } else {
    return projectToSpatialReference(pointOfSpecifiedWkid).then(resultGeometry => {
      const inputText = getFormatedInputFromPoint(resultGeometry)
      return Promise.resolve({
        shouldConvertSR: !!inputText,
        searchText: inputText || searchText,
        locationPoint: resultGeometry
      })
    }, err => {
      return Promise.resolve(defaultResult)
    })
  }
}

export function checkIsShouldConvertSR (searchText: string) {
  return searchText && isValidUtmFormat(searchText)
}

export async function checkIsShouldVerifyUtmString (searchText: string) {
  return loadArcGISJSAPIModules(['esri/geometry/coordinateFormatter', 'esri/geometry/SpatialReference']).then(modules => {
    const [coordinateFormatter, SpatialReference] = modules
    coordinateFormatter.load()
    if (coordinateFormatter.isSupported()) {
      if (coordinateFormatter.isLoaded()) {
        const point = coordinateFormatter.fromUtm(searchText, new SpatialReference({ wkid: 4326 }), 'latitude-band-indicators')
        if (point && point?.x && point?.y) {
          return Promise.resolve(true)
        } else {
          return Promise.resolve(false)
        }
      } else {
        return Promise.resolve(false)
      }
    } else {
      return Promise.resolve(true)
    }
  })
}

const getPointFromSpecifiedWkid = async (searchText: string) => {
  return loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
    const [Point, SpatialReference] = modules
    return moduleLoader.loadModule<typeof jimuCoreWkid>('jimu-core/wkid').then(m => {
      const { isValidWkid } = m
      let point = null
      if (!searchText) {
        return point
      }
      const coordinateParams = searchText.split(':')
      const coordinateText = coordinateParams[0]
      const wkid = Number(coordinateParams[1])
      if (wkid && isValidWkid(wkid) && coordinateText) {
        const coordinateValues = coordinateText.split(',')
        const x = Number(coordinateValues[0])
        const y = Number(coordinateValues[1])
        if (!isNaN(x) && !isNaN(y)) {
          point = new Point(x, y, new SpatialReference({ wkid: wkid }))
        }
      }
      return Promise.resolve(point)
    })
  })
}

function getFormatedInputFromPoint (point) {
  let inputText = null
  if (point && !isNaN(point.x) && !isNaN(point.y)) {
    inputText = 'Y:' + point.y + ',' + 'X:' + point.x
  }
  return inputText
}

async function getPointFromSpecifiedUtmByGeometryService (searchText: string) {
  const geometryServiceUrl = getDefaultGeometryServiceUrl()
  return loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference', 'esri/request']).then(modules => {
    const [Point, SpatialReference, esriRequest] = modules
    let resultPoint = null
    const params = {
      sr: 4326,
      conversionType: 'UTM',
      conversionMode: 'utmDefault',
      strings: [searchText],
      f: 'json'
    }
    const options = {
      query: params,
      responseType: 'json'
    }
    if (geometryServiceUrl) {
      const requestUrl = `${geometryServiceUrl}/fromGeoCoordinateString`
      esriRequest(requestUrl, options).then((result) => {
        const x = Number(result[0][0])
        const y = Number(result[0][1])
        if (!isNaN(x) && !isNaN(y)) {
          resultPoint = new Point(x, y, new SpatialReference({ wkid: 4326 }))
        }
        return Promise.resolve(resultPoint)
      })
    } else {
      return Promise.resolve(resultPoint)
    }
  })
}

export function getDefaultGeometryServiceUrl () {
  const state = getAppStore().getState()
  const helperServices = state?.portalSelf?.helperServices || {}
  const geometryServiceUrl = helperServices.geometry?.url || null
  return geometryServiceUrl
}

const isValidUtmFormat = (utmString: string) => {
  return utmString?.includes(',')
}

async function projectToSpatialReference (geometry) {
  let resultGeometry = geometry
  return loadArcGISJSAPIModules(['esri/geometry/SpatialReference', 'esri/rest/support/ProjectParameters', 'esri/geometry/support/webMercatorUtils', 'esri/rest/geometryService']).then(modules => {
    const [SpatialReference, ProjectParameters, webMercatorUtils, geometryService] = modules
    const spatialReference = new SpatialReference({ wkid: 4326 })
    if (!spatialReference || !geometry) {
      return Promise.resolve(null)
    } else if (spatialReference.equals(geometry.spatialReference)) {
      return Promise.resolve(resultGeometry)
    } else if (spatialReference.isWebMercator && geometry.spatialReference.equals(spatialReference)) {
      resultGeometry = webMercatorUtils.geographicToWebMercator(geometry)
      resultGeometry.isSinglePoint = geometry.isSinglePoint
      return Promise.resolve(resultGeometry)
    } else if (spatialReference.equals(spatialReference) && geometry.spatialReference.isWebMercator) {
      resultGeometry = webMercatorUtils.webMercatorToGeographic(geometry)
      resultGeometry.isSinglePoint = geometry.isSinglePoint
      return Promise.resolve(resultGeometry)
    } else {
      const geometryServiceUrl = getDefaultGeometryServiceUrl()
      if (geometryServiceUrl) {
        const params = new ProjectParameters()
        params.geometries = [geometry]
        params.outSpatialReference = spatialReference
        params.f = 'json'

        return geometryService.project(geometryServiceUrl, params).then((geometries) => {
          resultGeometry = geometries && geometries.length > 0 && geometries[0]
          if (resultGeometry) {
            resultGeometry.isSinglePoint = geometry.isSinglePoint
            return Promise.resolve(resultGeometry)
          } else {
            return Promise.resolve(resultGeometry)
          }
        }, (err) => {
          return Promise.reject(new Error(err))
        })
      } else {
        return Promise.resolve(resultGeometry)
      }
    }
  })
}
