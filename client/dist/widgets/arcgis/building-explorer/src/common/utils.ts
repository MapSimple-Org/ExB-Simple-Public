import type { ImmutableArray } from 'jimu-core'
import { MapViewManager, type JimuLayerView, type JimuMapView } from 'jimu-arcgis'
import Collection from 'esri/core/Collection'

// view
export function getTargetJimuMapView (useMapWidgetIds: ImmutableArray<string>, targetDsId: string) {
  const mapViewGroups = MapViewManager.getInstance().getJimuMapViewGroup(useMapWidgetIds[0])
  const jimuMapViews = mapViewGroups?.jimuMapViews
  // find
  const jimuMapViewArr = jimuMapViews && Object.keys(jimuMapViews)
  const jimuMapViewId = jimuMapViewArr?.find((jimuMapViewId) => {
    const _jimuMapView = jimuMapViews[jimuMapViewId]
    return (_jimuMapView.dataSourceId === targetDsId)
  })

  if (jimuMapViewId) {
    return jimuMapViews[jimuMapViewId]
  } else {
    return null
  }
}

// map
export function isMapContainWebScene (useMapWidgetIds: ImmutableArray<string>): boolean {
  const mapViewGroups = MapViewManager.getInstance().getJimuMapViewGroup(useMapWidgetIds[0])
  const jimuMapViews = mapViewGroups?.jimuMapViews

  const jimuMapViewArr = jimuMapViews && Object.keys(jimuMapViews)
  const contain3D = jimuMapViewArr?.some((jimuMapViewId) => {
    const _jimuMapView = jimuMapViews[jimuMapViewId]
    return (_jimuMapView.view.type === '3d')
  })

  return contain3D
}

// layers
// Judge the special empty value of layers config
export function isLayerConfigNone (layersOnLoad: ImmutableArray<string>) {
  // empty config
  if (!layersOnLoad || (layersOnLoad?.length <= 0)) {
    return true
  }
  // value is None ('')
  if (layersOnLoad && ((layersOnLoad.length === 1) && (layersOnLoad[0] === ''))) {
    return true
  }

  return false
}

// layerView
export function getBuildingLayerViews (jimuMapView: JimuMapView): JimuLayerView[] {
  const buildingLayerViews = []
  jimuMapView?.getAllJimuLayerViews()?.forEach((layerView) => {
    if (layerView.type === 'building-scene' /* && layer.visible*/) { // honor layer visibility in web scene ,#18930
      //console.log('use BuildingSceneLayer ==> ' + layer.title)
      buildingLayerViews.push(layerView)
    }
  })

  return buildingLayerViews
}

export function getBuildingLayerViewsByLayerViewIds (layerViewIds: string[], jimuMapView: JimuMapView): JimuLayerView[] {
  const buildingLayerViews = []
  jimuMapView?.getAllJimuLayerViews()?.forEach((layerView) => {
    if (layerViewIds?.includes(layerView.id)) {
      buildingLayerViews.push(layerView)
    }
  })

  return buildingLayerViews
}

export function getBuildingSceneLayersByLayerViewIds (layerViewIds: string[], jimuMapView: JimuMapView): __esri.Collection<__esri.BuildingSceneLayer> {
  const allBuildingLayerViews = getBuildingLayerViews(jimuMapView)

  const buildingLayers = new Collection()
  allBuildingLayerViews?.forEach((layerView) => {
    if (layerViewIds?.includes(layerView.id)) {
      buildingLayers.push(layerView.layer)
    }
  })

  return buildingLayers
}

// filter runtime added layers, #19024
// e.g. https://services1.arcgis.com/oC086ufSSQ6Avnw2/arcgis/rest/services/Building_SampleData/SceneServer
// e.g. https://tilesqa.arcgis.com/tiles/SdQnSRS214Ul5Jv5/arcgis/rest/services/Bldg_E_Color_UC2020_demo/SceneServer
// e.g. https://tilesqa.arcgis.com/tiles/CPntDo7aNEJc9sws/arcgis/rest/services/mike_Building_WGS1984_WSL1/SceneServer
export function filterRuntimeAddedLayerViews (buildingLayerViews: JimuLayerView[]): JimuLayerView[] {
  let layerViews = []
  layerViews = buildingLayerViews?.filter((buildingLayerView) => {
    return !(buildingLayerView.fromRuntime) // not a runtime added layer
  })

  return layerViews
}
