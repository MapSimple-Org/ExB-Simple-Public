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

import type { WroModel } from './wro-model'
import PortalItem from 'esri/portal/PortalItem'

export function canComputeHistograms (props): boolean {
  const imageLayer = getImageLayer(props)
  return !!(imageLayer?.rasterFunction)
}

export async function exportModel (task): Promise<any> {
  const { title, summary, description, tags, folder } = task
  const { itemData, portal, serviceUrl } = task

  let tagsA = []
  if (typeof tags === 'string') {
    const a = tags.split(',')
    tagsA = a.filter(v => (v.length > 0))
  }
  if (tagsA.length === 0) tagsA = ['weightedOverlayModel', 'geodesign']

  const item = new PortalItem({
    type: 'Image Service',
    typeKeywords: ['geodesignModelerLayer'],
    title: title,
    snippet: summary,
    description: description,
    tags: tagsA,
    url: serviceUrl
  })

  const params: any = {
    item: item
  }
  if (itemData) params.data = JSON.stringify(itemData)
  if (folder) params.folder = folder
  await portal.user.addItem(params)
}

export function getImageLayer (props): any {
  const wroModel: WroModel = props.wroModel
  const view = props.wroContext.getView()
  if (view?.map && wroModel?.mapLayerId) {
    return (view.map.findLayerById(wroModel.mapLayerId))
  }
}

export function getPolygonLayers (props): any {
  const layers = []
  const view = props.wroContext.getView()
  if (view?.map) {
    view.map.allLayers.forEach(lyr => {
      if (lyr.type === 'feature' && lyr.geometryType === 'polygon') {
        layers.push(lyr)
      }
    })
    layers.reverse()
  }
  return layers
}
