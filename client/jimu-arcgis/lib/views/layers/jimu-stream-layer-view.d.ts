import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuStreamLayerView` constructor options.
 */
export interface JimuStreamLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `StreamLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-StreamLayer.html).
     */
    layer: __esri.StreamLayer;
}
/**
 * `JimuStreamLayerView` is the wrapper of [`StreamLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-StreamLayer.html).
 */
export declare class JimuStreamLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `StreamLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-StreamLayer.html).
     */
    layer: __esri.StreamLayer;
    constructor(options: JimuStreamLayerViewOptions);
}
