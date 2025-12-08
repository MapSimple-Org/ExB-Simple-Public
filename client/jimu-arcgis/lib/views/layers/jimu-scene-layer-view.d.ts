import type { SceneLayerDataSource } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuSceneLayerView` constructor options.
 */
export interface JimuSceneLayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SceneLayer.html).
     */
    layer: __esri.SceneLayer;
}
/**
 * `JimuSceneLayerView` is the wrapper of [`SceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SceneLayer.html) and
 *  [`SceneLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-SceneLayerView.html).
 *  It is used to synchronize state with [`SceneLayerDataSource`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/SceneLayerDataSource/).
 */
export declare class JimuSceneLayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SceneLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SceneLayer.html).
     */
    layer: __esri.SceneLayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `SceneLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-SceneLayerView.html).
     */
    view: __esri.SceneLayerView;
    getLayerDataSource(): SceneLayerDataSource;
    createLayerDataSource(): Promise<SceneLayerDataSource>;
}
