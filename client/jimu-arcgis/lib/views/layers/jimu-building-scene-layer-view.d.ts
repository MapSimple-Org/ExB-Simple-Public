import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuBuildingSceneLayerView` constructor options.
 */
export interface JimuBuildingSceneLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BuildingSceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html).
     */
    layer: __esri.BuildingSceneLayer;
}
/**
 * `JimuBuildingSceneLayerView` is the wrapper of [`BuildingSceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html)
 *  and [`BuildingSceneLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingSceneLayerView.html).
 */
export declare class JimuBuildingSceneLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BuildingSceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BuildingSceneLayer.html).
     */
    layer: __esri.BuildingSceneLayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `BuildingSceneLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingSceneLayerView.html).
     */
    view: __esri.BuildingSceneLayerView;
    constructor(options: JimuBuildingSceneLayerViewOptions);
    ready(): Promise<this>;
}
