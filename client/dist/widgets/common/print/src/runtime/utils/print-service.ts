import { type UseUtility, Immutable, type ImmutableArray, getAppStore, AllDataSourceTypes } from 'jimu-core'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import type { MapView, PrintTemplateProperties, ElementOverrides } from '../../config'
import { getUrlOfUseUtility, reportUtilityState } from '../../utils/utils'
import { getSessionByUtility } from '../../utils/service-util'
import { removeTemporarilyAddedLayers } from './utils'
interface PrintOption {
  useUtility?: UseUtility
  mapView: MapView
  printTemplateProperties: PrintTemplateProperties
  isSupportReport?: boolean
  widgetId?: string
  useMapWidgetIds?: ImmutableArray<string>
  jimuMapView?: JimuMapView
  reportOptions?: any
  elementOverrides?: ElementOverrides
  previewOverlayItem: any
  toggleUtilityErrorRemind: (isShow?: boolean) => void
}

export const print = async (option: PrintOption) => {
  const { printTemplateProperties, useUtility, isSupportReport, widgetId, useMapWidgetIds, jimuMapView, reportOptions, elementOverrides, previewOverlayItem, toggleUtilityErrorRemind } = option
  const preTimeExtentOfMapView = { timeExtent: option.mapView?.timeExtent }.timeExtent
  const mapView = initMapViewWithTimeExtent(option.mapView, jimuMapView)
  const session = await getSessionByUtility(Immutable(useUtility))
  const previewExtent = previewOverlayItem ? await getExtentForPrint(previewOverlayItem, mapView, printTemplateProperties) : null
  return getUrlOfUseUtility(useUtility).then(printServiceUrl => {
    return loadArcGISJSAPIModules(['esri/rest/support/PrintParameters', 'esri/rest/support/PrintTemplate', 'esri/rest/print', 'esri/geometry/SpatialReference']).then(modules => {
      const [PrintParameters, PrintTemplate, print, SpatialReference] = modules
      printTemplateProperties.includeTables = true
      const template = new PrintTemplate(printTemplateProperties)
      const newMapView = initHasZOfGraphicInMap(mapView)
      const printParameter = {
        view: newMapView,
        template: template
      } as any
      if (printTemplateProperties.wkid !== mapView?.spatialReference?.wkid) {
        printParameter.outSpatialReference = new SpatialReference({ wkid: printTemplateProperties.wkid })
      }

      if (previewExtent) {
        printParameter.extent = previewExtent
      }

      const params = new PrintParameters(printParameter)
      const queryOption = { timeout: 120000, token: session?.token }
      session?.token && (queryOption.token = session.token)

      return print.execute(printServiceUrl, params, queryOption).then((printResult) => {
        reportUtilityState(useUtility?.utilityId, toggleUtilityErrorRemind)
        removeTemporarilyAddedLayers(elementOverrides, reportOptions, jimuMapView, widgetId, useMapWidgetIds, isSupportReport)
        resetTimeExtentOfMapView(option.mapView, preTimeExtentOfMapView)

        //Reset hasZ of draw layers
        initHasZOfGraphicInMap(mapView, true)
        return Promise.resolve(printResult)
      }, err => {
        removeTemporarilyAddedLayers(elementOverrides, reportOptions, jimuMapView, widgetId, useMapWidgetIds, isSupportReport)
        reportUtilityState(useUtility?.utilityId, toggleUtilityErrorRemind, err)
        resetTimeExtentOfMapView(option.mapView, preTimeExtentOfMapView)

        //Reset hasZ of draw layers
        initHasZOfGraphicInMap(mapView, true)
        return Promise.reject(new Error(err))
      }).catch((printError) => {
        removeTemporarilyAddedLayers(elementOverrides, reportOptions, jimuMapView, widgetId, useMapWidgetIds, isSupportReport)
        reportUtilityState(useUtility?.utilityId, toggleUtilityErrorRemind, printError)
        resetTimeExtentOfMapView(option.mapView, preTimeExtentOfMapView)

        //Reset hasZ of draw layers
        initHasZOfGraphicInMap(mapView, true)
        return Promise.reject(new Error(printError))
      })
    })
  })
}

async function getExtentForPrint (previewOverlayItem, mapView: MapView, printTemplateProperties: PrintTemplateProperties) {
  return loadArcGISJSAPIModules(['esri/geometry/Extent', 'esri/views/2d/viewpointUtils']).then(modules => {
    const [Extent, viewpointUtils] = modules
    const { getExtent } = viewpointUtils
    const extent = getExtent(
        new Extent(),
        mapView.viewpoint,
        printTemplateProperties.layout?.toLocaleLowerCase() === "map-only"
          ? [printTemplateProperties.exportOptions.width, printTemplateProperties.exportOptions.height]
          : [previewOverlayItem.boxWidth, previewOverlayItem.boxHeight],
      )
    return Promise.resolve(extent)
  })

}

function resetTimeExtentOfMapView (mapView: MapView, preTimeExtentOFMapView) {
  //Map does not have a default time filter.
  mapView.timeExtent = preTimeExtentOFMapView
}

/**
 * Timeline widgets can connect to both maps and layers, but the Print Service and Print API only supports mapView's timeExtent and does not support layer's timeExtent.
 * Per discussion, we can currently add support for timeline connections to maps. And for timelines connecting to layers,
 * we can leave it as a known limitation until the server supports it (maybe in 2-3 releases).
 *
 * So here is a temporary solution for the time filter does not take effect problem.
 * We need to remove this part of the special processing after the Print Service and Print API support layer timeExtent.
 * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/16545#issuecomment-4787104
*/
function initMapViewWithTimeExtent (mapView: MapView, jimuMapView: JimuMapView): MapView {
  const mapDsId = jimuMapView?.dataSourceId
  if (!mapView || !mapDsId) return mapView

  let allTimeLineWidgetUseWebMap = true

  const widgets = getAppStore().getState().appConfig.widgets
  Object.keys(widgets).forEach(widgetId => {
    const widgetJson = widgets[widgetId]
    if (widgetJson.uri === 'widgets/common/timeline/') {
      const useDataSources = widgetJson?.useDataSources || []
      const useDsInCurrentMap = useDataSources.filter(useDs => { return useDs.rootDataSourceId === mapDsId || useDs.mainDataSourceId === mapDsId })

      if (useDsInCurrentMap?.length > 0) {
        if (widgetJson.config?.dataSourceType !== AllDataSourceTypes.Map && widgetJson.config?.dataSourceType !== AllDataSourceTypes.WebMap) {
          allTimeLineWidgetUseWebMap = false
        }
      }
    }
  })

  if (!allTimeLineWidgetUseWebMap) {
    //If the ds used by timeLine is not webMap, the timeExtent of each layer will be different. Print does not support this situation.
    return mapView
  } else {
    const jimuLayerViews = jimuMapView.getAllJimuLayerViews()
    const layers = jimuLayerViews.map(item => item.layer) || []
    let timeExtentOfLayers
    layers.forEach(layer => {
      layer?.timeExtent && (timeExtentOfLayers = layer?.timeExtent)
    })
    if (timeExtentOfLayers) {
      mapView.timeExtent = timeExtentOfLayers
    }
    return mapView
  }
}

/**
 * Set the 'hasZ' of the layer and graphic generated by the Draw widget to 'false'
 * This is a temporary solution
 * https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/23289
*/
function initHasZOfGraphicInMap (mapView: MapView, hasZ = false) {
  const map = mapView.map
  const layers = map.layers.toArray()
  layers.forEach(layer => {
    if (layer?.id?.includes('jimu-draw-groupLayer')) {
      const subLayers = (layer as any)?.layers?.toArray() as __esri.GraphicsLayer[]
      subLayers.forEach(subLayer => {
        subLayer.graphics?.forEach(graphic => {
          if (graphic?.attributes?.jimuDrawId) {
            graphic.geometry.hasZ = hasZ
          }
        })
      })
    }

    if (layer?.id?.includes('bookmark-layer-')) {
      (layer as any)?.graphics?.forEach(graphic => {
        if (graphic?.attributes?.jimuDrawId) {
          graphic.geometry.hasZ = hasZ
        }
      })
    }
  })
  return mapView
}

export async function getPrintTemplateInfo (useUtility?: UseUtility) {
  return getUrlOfUseUtility(useUtility).then(printServiceUrl => printServiceUrl)
}
