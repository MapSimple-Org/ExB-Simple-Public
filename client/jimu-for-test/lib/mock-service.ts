import { type ArcGISServerInfo, type ServiceDefinition, ServiceManager } from 'jimu-core'
import type { IQueryFeaturesResponse } from '@esri/arcgis-rest-feature-service'

/**
 * Mocked query of a single layer, including query url, query results, query delay.
 */
export interface MockQuery {
  /** The Query URL. */
  url: string
  /** The Query result. */
  result: IQueryFeaturesResponse
  /** The Query delay. */
  delay?: number
}

/**
 * Mocked single feature layer data, including server info, layer definition, queries.
 */
export interface MockFeatureLayerData {
  /** Feature layer URL. */
  url: string
  /** Feature server info. */
  serverInfo: ArcGISServerInfo
  /** The feature layer definition. */
  layerDefinition: ServiceDefinition
  /** The queries you want to mock. */
  queries?: MockQuery[]
}

/**
 * Mock a single feature layer.
 */
export function mockFeatureLayer (mockData: MockFeatureLayerData) {
  const serverInfoUrl = ServiceManager.getInstance().getArcGISServerUrlFromServiceUrl(mockData.url)

  fetchMock.mockResponse(async (req) => {
    let reqUrl = decodeURIComponent(req.url)
    if (req.body) {
      const bodyText = decodeURIComponent(await req.text())
      if (reqUrl.includes('?')) {
        reqUrl = reqUrl + '&' + bodyText
      } else {
        reqUrl = reqUrl + '?' + bodyText
      }
    }

    if (reqUrl.split('?')[0] === serverInfoUrl) {
      return Promise.resolve(JSON.stringify(mockData.serverInfo))
    } else if (reqUrl.split('?')[0] === mockData.url) {
      return Promise.resolve(JSON.stringify(mockData.layerDefinition)) // schema
    } else {
      const query = mockData.queries && mockData.queries.find(q => decodeURIComponent(q.url) === reqUrl)
      if (query) {
        if (query.delay) {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve(JSON.stringify(query.result))
            }, query.delay)
          })
        } else {
          return Promise.resolve(JSON.stringify(query.result))
        }
      } else {
        console.log(`${reqUrl} is not mocked.`)
        return Promise.resolve({ status: 404 })
      }
    }
  })
}

/**
 * Mocked single layer in a service, including url, layer definition.
 */
export interface MockLayerInService {
  /** Layer URL, e.g. `https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer/0`. */
  url: string
  /** Layer definition. */
  layerDefinition: ServiceDefinition
}

/**
 * Mocked whole service, including server info, service definition, layers in the service.
 */
export interface MockServiceData {
  /** The service URL, e.g. `https://sampleserver6.arcgisonline.com/arcgis/rest/services/ServiceRequest/FeatureServer` */
  url: string
  /** The root server info. */
  serverInfo: ArcGISServerInfo
  /** The service definition. */
  serviceDefinition: ServiceDefinition
  /** The layers of the service. */
  layers?: MockLayerInService[]
}

/**
 * Mock a whole service, e.g. feature service, map service or scene service.
 */
export function mockService (mockData: MockServiceData) {
  const serverInfoUrl = ServiceManager.getInstance().getArcGISServerUrlFromServiceUrl(mockData.url)

  fetchMock.mockResponse(req => {
    const reqUrl = decodeURIComponent(req.url)
    if (reqUrl.split('?')[0] === serverInfoUrl) {
      return Promise.resolve(JSON.stringify(mockData.serverInfo))
    } else if (reqUrl.split('?')[0] === mockData.url) {
      return Promise.resolve(JSON.stringify(mockData.serviceDefinition))
    } else if (reqUrl.split('?')[0] === `${mockData.url}/layers`) {
      return Promise.resolve(JSON.stringify({ layers: mockData.layers.map(l => l.layerDefinition) }))
    } else {
      const layer = mockData.layers && mockData.layers.find(l => reqUrl.split('?')[0] === l.url)
      if (layer) {
        return Promise.resolve(JSON.stringify(layer.layerDefinition))
      } else {
        console.log(`${reqUrl} is not mocked.`)
        return Promise.resolve({ status: 404 })
      }
    }
  })
}
