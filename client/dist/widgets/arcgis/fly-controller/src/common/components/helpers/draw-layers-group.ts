// support line clamp ground mode (two layer switching) ,#6247
// Relative-to-ground mode: the appearance of the line/point depends on the height set
// On-the-ground mode: line clamp to ground

// use draw-helper.tsx to draw graphics-info.ts
// 1. startPoint/endPoint Only use Relative-to-ground mode mode
// 2. mode of the line depends on the height setting (altitude is 0 means On-the-ground mode)

import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'

export interface LayersGroup {
  layerRelativeToGround: __esri.GraphicsLayer
  layerOnTheGround: __esri.GraphicsLayer
}

export enum LayersMode {
  RelativeToGround = 'relative-to-ground',
  OnTheGround = 'on-the-ground'
}

export default class DrawLayersGroup {
  private widgetId: string = ''
  private jimuMapView: JimuMapView = null
  private GraphicsLayer: typeof __esri.GraphicsLayer = null

  layersGroup: LayersGroup

  // constructor
  async setup (jimuMapView: JimuMapView, widgetId: string): Promise<DrawLayersGroup> {
    await loadArcGISJSAPIModules([
      'esri/layers/GraphicsLayer'
    ]).then(modules => {
      [this.GraphicsLayer] = modules

      this.widgetId = widgetId
      this.resetJimuMapView(jimuMapView)

      this.layersGroup = {
        layerRelativeToGround: null,
        layerOnTheGround: null
      }

      this.resetGraphicsLayers()
    })
    return this
  }

  resetJimuMapView (jimuMapView: JimuMapView): this {
    if (this.jimuMapView) {
      this.jimuMapView.view?.map.remove(this.layersGroup?.layerRelativeToGround)
      this.jimuMapView.view?.map.remove(this.layersGroup?.layerOnTheGround)
    }

    this.jimuMapView = jimuMapView

    return this
  }

  resetGraphicsLayers (): this {
    this._getGraphicsLayer(LayersMode.RelativeToGround)
    this._getGraphicsLayer(LayersMode.OnTheGround)

    return this
  }

  private _getGraphicsLayer (mode: LayersMode): void {
    let layer = null

    const layerId = mode + '-draw-layer-' + this.widgetId + '-' + this.jimuMapView.id
    if (this.jimuMapView.view?.map) {
      layer = this.jimuMapView.view.map.findLayerById(layerId)
      if (!layer) {
        layer = new this.GraphicsLayer({
          id: layerId,
          listMode: 'hide',
          title: layerId,
          // on-the-ground mode: line clamp to ground
          // relative-to-ground mode: point.z=0 is on the ground
          elevationInfo: { mode: mode }
        })
        this.jimuMapView.view.map.add(layer)
      }
    }

    if (mode === LayersMode.RelativeToGround) {
      this.layersGroup.layerRelativeToGround = layer
    } else if (mode === LayersMode.OnTheGround) {
      this.layersGroup.layerOnTheGround = layer
    }
  }

  removeAllGraphics = (): void => {
    this.layersGroup.layerOnTheGround?.removeAll()
    this.layersGroup.layerRelativeToGround?.removeAll()
  }
}
