/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { type Issue, ModelFactory, type RasterLayer, type WroModel } from './wro-model'
import type { WroContext } from './wro-context'
import * as layerUtil from './wro-layer-util'
import * as rasterUtil from './wro-raster-util'

import PortalItem from 'esri/portal/PortalItem'
import esriRequest from 'esri/request'

export class WroService {
  itemId: string
  rasterLayers: RasterLayer[]
  serviceJson: any
  serviceTitle: string
  serviceUrl: string

  checkMixedContent (uri: string): string {
    if (typeof window.location.href === 'string' &&
        window.location.href.indexOf('https://') === 0) {
      if (typeof uri === 'string' && uri.indexOf('http://') === 0) {
        uri = 'https:' + uri.substring(5)
      }
    }
    return uri
  }

  async loadModel (wroContext: WroContext, serviceUrl: string, itemId: string): Promise<any> {
    const nls = wroContext.nls
    const errors: Issue[] = []
    let wroModel: WroModel = ModelFactory.newWroModel()
    let item: PortalItem = null
    let renderingRule: any
    itemId = (typeof itemId === 'string') ? itemId.trim() : null
    serviceUrl = (typeof serviceUrl === 'string') ? serviceUrl.trim() : null

    const trackError = (uiMessage: string, error?: Error): void => {
      const issue = ModelFactory.newIssue()
      issue.message = uiMessage
      if (error?.message) issue.detail = error.message
      errors.push(issue)
    }

    if (!serviceUrl && !itemId && errors.length === 0) {
      trackError(nls('wro_validation_wroServiceNotDefined'))
    }

    if (!serviceUrl && itemId && errors.length === 0) {
      this.itemId = itemId
      item = new PortalItem({
        id: itemId
      })
      try {
        await item.load()
      } catch (ex) {
        console.error('Error loading item', itemId, ex)
        trackError(nls('wro_validation_errorLoadingItem'), ex)
      }

      if (errors.length === 0) {
        if (!this.serviceTitle && item.title) {
          this.serviceTitle = item.title
        }
        serviceUrl = (typeof item.url === 'string') ? item.url.trim() : null
        if (!serviceUrl) {
          trackError(nls('wro_validation_undefinedItemUrl'))
        }
      }

      if (errors.length === 0) {
        try {
          const data = await item.fetchData('json')
          // console.log("Service item data:",data);
          renderingRule = data?.renderingRule
        } catch (ex) {
          console.error('Error fetching item data', itemId, ex)
          trackError(nls('wro_validation_errorLoadingItem'), ex)
        }
      }
    }

    if (serviceUrl && errors.length === 0) {
      this.serviceUrl = this.checkMixedContent(serviceUrl)

      if (this.serviceUrl.indexOf('http://') !== 0 &&
          this.serviceUrl.indexOf('https://') !== 0) {
        trackError(nls('wro_validation_invalidServiceUrl'))
      } else {
        try {
          const url = new URL(this.serviceUrl)
          if (!url) trackError(nls('wro_validation_invalidServiceUrl'))
        } catch (ex) {
          trackError(nls('wro_validation_invalidServiceUrl'))
        }
      }

      if (errors.length === 0) {
        try {
          this.serviceJson = await this.readServiceJson(this.serviceUrl)
          if (!this.serviceTitle && this.serviceJson && this.serviceJson.name) {
            this.serviceTitle = this.serviceJson.name
          }
        } catch (ex) {
          console.error('Error loading service', this.serviceUrl, ex)
          trackError(nls('wro_validation_errorloadingService'), ex)
        }
      }

      if (errors.length === 0) {
        layerUtil.validateWROLayer(wroContext.nls, this.serviceJson, errors)
      }

      if (errors.length === 0) {
        try {
          await this.queryRasters(this.serviceUrl)
        } catch (ex) {
          console.error('Error querying mosaic', this.serviceUrl, ex)
          trackError(nls('wro_validation_errorQueryingLayers'), ex)
        }
      }
    }

    const hasRasters = (this.rasterLayers && this.rasterLayers.length > 0)
    if (errors.length === 0 && !hasRasters) {
      trackError(nls('wro_validation_noLayers'))
    }

    wroModel = ModelFactory.initModel(this, errors)
    if (renderingRule && errors.length === 0) {
      rasterUtil.renderingRuleToModel(wroModel, renderingRule)
    }

    return wroModel
  }

  async queryRasters (url: string): Promise<any> {
    url = url + '/query'
    const query = {
      f: 'json',
      where: '1=1',
      outFields: ['*'],
      returnGeometry: false
    }
    const options = { query: query, responseType: 'json' }
    // @ts-expect-error
    return esriRequest(url, options).then(result => {
      // console.log("queryRasters",result);
      const features = result?.data?.features
      if (features && features.length > 0 && features[0].attributes) {
        const fld = 'Title'
        features.sort((a: any, b: any) => {
          if (a.attributes[fld] < b.attributes[fld]) {
            return -1
          } else if (a.attributes[fld] > b.attributes[fld]) {
            return 1
          } else {
            return 0
          }
        })
        const rasterLayers: RasterLayer[] = []
        features.forEach(feature => {
          const rasterLayer = rasterUtil.featureToRasterLayer(feature)
          if (rasterLayer) {
            rasterLayer.url = this.checkMixedContent(rasterLayer.url)
            rasterLayers.push(rasterLayer)
          }
        })
        this.rasterLayers = rasterLayers
      }
    })
  }

  async readServiceJson (url: string): Promise<any> {
    const options = { query: { f: 'json' }, responseType: 'json' }
    // @ts-expect-error
    return esriRequest(url, options).then(result => {
      return result?.data
    })
  }
}
