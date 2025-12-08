import { loadArcGISJSAPIModules, uuidv1 } from 'jimu-core'
import type { BasemapInfo } from '../config'
import { getBasemap } from '../utils'

export const getLoadedBasemap = async (basemapInfo: BasemapInfo) => {
  const modules = await loadArcGISJSAPIModules(['esri/Basemap', 'esri/layers/VectorTileLayer', 'esri/layers/Layer'])
  const [Basemap, Layer, VectorTileLayer] = modules as [typeof __esri.Basemap, typeof __esri.Layer, typeof __esri.VectorTileLayer]
  return getBasemap(basemapInfo, Basemap, Layer, VectorTileLayer)
}

export const BASEMAP_FROM_URL_ID_SUFFIX = '-basemap-url'

export const getIdForBasemapFromUrl = () => {
  return `${uuidv1()}${BASEMAP_FROM_URL_ID_SUFFIX}`
}
