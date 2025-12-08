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

import type { WroContext } from './wro-context'

import GraphicsLayer from 'esri/layers/GraphicsLayer'
import type ImageryLayer from 'esri/layers/ImageryLayer'
import type MapView from 'esri/views/MapView'
import Polygon from 'esri/geometry/Polygon'
import type SceneView from 'esri/views/SceneView'
import esriRequest from 'esri/request'

export async function computeHistograms (task): Promise<any> {
  let polygon, histogramData
  if (task.imageLayer?.rasterFunction) {
    if (task.featureSelectionGeometry) {
      polygon = await queryFeatureLayerPolygon(task)
    } else {
      polygon = await queryGraphicsLayerPolygon(task)
    }
    if (polygon) {
      const histogramsResult = await execComputeHistograms(task.imageLayer, polygon)
      histogramData = processHistogramsResult(task, histogramsResult)
    }
  }
  return histogramData
}

export function ensureGraphicsLayer (view, layerId): GraphicsLayer {
  let layer
  if (layerId) layer = view.map.findLayerById(layerId)
  if (!layer) {
    layer = new GraphicsLayer({
      id: layerId,
      title: layerId,
      listMode: 'hide'
    })
    // layer.elevationInfo = {
    //   mode: "relative-to-ground",
    //   offset: Context.instance.config.graphicElevationOffset,
    //   unit: "meters"
    // };
    view.map.add(layer)
  }
  return layer
}

async function execComputeHistograms (imageLayer, polygon): Promise<any> {
  let result
  if (imageLayer?.rasterFunction && polygon) {
    const layerUrl = imageLayer.url as string
    const url = `${layerUrl}/computeHistograms`
    // url = "/none"; // for fault test
    const pixelSize = getModelPixelSize(imageLayer, polygon)
    const query: any = { f: 'json' }
    query.geometry = JSON.stringify(polygon.toJSON())
    query.geometryType = 'esriGeometryPolygon'
    query.renderingRule = JSON.stringify(imageLayer.rasterFunction.toJSON())
    query.pixelSize = JSON.stringify(pixelSize)
    const options = { query: query, responseType: 'json' }
    // @ts-expect-error
    result = await esriRequest(url, options)
    result = result?.data
  }
  return result
}

function getModelPixelSize (imageLayer, polygon): any {
  const forceSquare = true; let width = 0; let height = 0; let max; let pixelSize
  const maxImageWidth = imageLayer.imageMaxWidth
  const maxImageHeight = imageLayer.imageMaxHeight
  const extent = polygon.extent
  width = extent.width
  height = extent.height
  if (width < 1) {
    width = 1
  }
  if (height < 1) {
    height = 1
  }
  const pixelSizeX = Math.ceil(width / maxImageWidth)
  const pixelSizeY = Math.ceil(height / maxImageHeight)
  if (forceSquare) {
    max = Math.max(pixelSizeX, pixelSizeY)
    pixelSize = { x: max, y: max }
  } else {
    pixelSize = { x: pixelSizeX, y: pixelSizeY }
  }
  return pixelSize
}

async function highlightFeatures (task, view, layer, features): Promise<void> {
  if (task.highlightHandle) {
    task.highlightHandle.remove()
    task.highlightHandle = null
  }
  if (features && features.length > 0) {
    const layerView = await view.whenLayerView(layer)
    if (layerView) {
      task.highlightHandle = layerView.highlight(features)
    }
  }
}

export function makeSelectionSymbol (): any {
  const symbol = {
    type: 'simple-fill',
    color: [0, 255, 255, 0.4],
    style: 'solid',
    outline: {
      color: [0, 0, 0, 0.6],
      width: 1
    }
  }
  return symbol
}

function mergePolygons (geometries): any {
  let polygon = null
  if (geometries && geometries.length === 1) {
    polygon = geometries[0]
  } else if (geometries && geometries.length > 1) {
    // polygon = geometryEngine.union(geometries);
    polygon = new Polygon({
      spatialReference: geometries[0].spatialReference
    })
    geometries.forEach(geometry => {
      if (geometry.rings) {
        geometry.rings.forEach(ring => {
          polygon.addRing(ring)
        })
      }
    })
  }
  return polygon
}

export function newTask (
  wroContext: WroContext,
  view: MapView | SceneView,
  imageLayer: ImageryLayer,
  featureMapLayerId: string,
  featureSelectionGeometry: any,
  graphicsMapLayerId: string): any {
  const task = {
    wroContext: wroContext,
    view: view,
    imageLayer: imageLayer,
    featureMapLayerId: featureMapLayerId,
    featureSelectionGeometry: featureSelectionGeometry,
    graphicsMapLayerId: graphicsMapLayerId
  }
  return task
}

function processHistogramsResult (task, histogramsResult): any {
  const nls = task.wroContext.nls
  const result = {
    noDataCount: 0,
    colorCounts: []
  }
  const imageLayer = task.imageLayer
  const renderingRule = imageLayer?.rasterFunction
  if (!renderingRule || !histogramsResult || !histogramsResult.histograms ||
      histogramsResult.histograms.length === 0) {
    return result
  }
  const histogram = histogramsResult.histograms[0]
  const histogramMin = Math.round(histogram.min)
  const histogramMax = Math.round(histogram.max) - 1
  if ((histogramMin === 0) && (histogram.counts > 0)) {
    result.noDataCount = histogram.counts[0]
  }
  let totalCount = 0
  const cm = renderingRule?.functionArguments?.Colormap
  // let cm = renderingRule?.rasterFunctionArguments?.Colormap;
  if (cm) {
    cm.forEach(color => {
      let count = 0
      const value: number = color[0]
      let label = null
      const rgb = [color[1], color[2], color[3]]
      if ((value < histogramMin) || (value > histogramMax)) {
        count = 0
      } else {
        count = histogram.counts[value - histogramMin]
      }
      totalCount += count
      const lbl = nls('wro_colorRamp_' + value.toString())
      if (lbl) {
        label = nls('wro_chart_labelPattern', {
          category: value.toString(),
          label: lbl
        })
      }
      if (count > 0) {
        result.colorCounts.push({
          count: count,
          value: value,
          pct: 0,
          label: label,
          rgb: rgb
        })
      }
    })
  }
  if (result.noDataCount > 0) {
    totalCount += result.noDataCount
  }
  if (totalCount > 0) {
    result.colorCounts.forEach(colorCount => {
      const pct = (colorCount.count / totalCount) * 100
      colorCount.pct = pct
    })
  }
  return result
}

async function queryFeatureLayerPolygon (task): Promise<any> {
  let polygon
  const view = task.view
  const mlid = task.featureMapLayerId
  const geometry = task.featureSelectionGeometry
  const layer = mlid && view?.map?.findLayerById(mlid)
  if (layer && geometry &&
      typeof layer.createQuery === 'function' &&
      typeof layer.queryFeatures === 'function') {
    highlightFeatures(task, view, layer, null)
    const query = layer.createQuery()
    query.returnGeometry = true
    query.geometry = geometry
    const result = await layer.queryFeatures(query)
    if (result?.features) {
      highlightFeatures(task, view, layer, result.features)
      const geometries = []
      result.features.forEach(f => {
        if (f.geometry) {
          geometries.push(f.geometry.clone())
        }
      })
      if (geometries.length > 0) {
        polygon = mergePolygons(geometries)
      }
    }
  }
  return polygon
}

function queryGraphicsLayerPolygon (task): Promise<any> {
  let polygon
  const view = task.view
  const mlid = task.graphicsMapLayerId
  const layer = mlid && view?.map?.findLayerById(mlid)
  if (layer?.graphics) {
    const geometries = []
    layer.graphics.forEach(f => {
      if (f.geometry && f.geometry.type === 'polygon') {
        geometries.push(f.geometry.clone())
      }
    })
    if (geometries.length > 0) {
      polygon = mergePolygons(geometries)
    }
  }
  return Promise.resolve(polygon)
}
