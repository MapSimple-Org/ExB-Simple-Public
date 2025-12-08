import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuMediaLayerView` constructor options.
 */
export interface JimuMediaLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `MediaLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MediaLayer.html).
     */
    layer: __esri.MediaLayer;
}
/**
 * `JimuMediaLayerView` is the wrapper of [`MediaLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MediaLayer.html).
 */
export declare class JimuMediaLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `MediaLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MediaLayer.html).
     */
    layer: __esri.MediaLayer;
    constructor(options: JimuMediaLayerViewOptions);
}
