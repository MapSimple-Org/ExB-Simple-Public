import type { JimuMapView } from 'jimu-arcgis'

export function getOverview (layer: __esri.BuildingSceneLayer): __esri.BuildingComponentSublayer {
  const overview = layer?.sublayers?.find((subLayer) => subLayer.modelName === 'Overview')
  if (overview?.type === 'building-component') {
    return overview
  }
  return null
}

export function hasOverview (layer: __esri.BuildingSceneLayer) {
  return !!getOverview(layer)
}

export function getFullModel (layer: __esri.BuildingSceneLayer): __esri.BuildingSceneLayer | __esri.BuildingGroupSublayer {
  const fullModel = layer?.sublayers?.find((subLayer) => subLayer.modelName === 'FullModel')
  if (fullModel?.type === 'building-group') {
    return fullModel
  }
  return layer
}

export function hasFullModelGroup (layer: __esri.BuildingSceneLayer) {
  return getFullModel(layer) !== layer
}

export function isActive (layer: __esri.BuildingSceneLayer) {
  const overview = getOverview(layer)
  const fullModel = getFullModel(layer)
  return overview != null && !overview.visible && fullModel != null && fullModel.visible
}

export function setLayersMode (layers: __esri.Collection<__esri.BuildingSceneLayer>, mode: 'fullModel' | 'overview', jimuMapView: JimuMapView) {
  if (!(jimuMapView && !jimuMapView.isDestroyed())) {
    return
  }

  layers?.forEach((layer) => {
    // visibility
    let fullModelVisibility = false
    if (mode === 'fullModel') {
      fullModelVisibility = true
    }

    // layers
    const fullModelLayer = getFullModel(layer)
    const overviewLayer = getOverview(layer)

    if (fullModelLayer) {
      fullModelLayer.visible = fullModelVisibility
    }
    if (overviewLayer) {
      overviewLayer.visible = !fullModelVisibility
    }
  })
}
