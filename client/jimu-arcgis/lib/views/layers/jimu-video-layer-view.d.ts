import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuVideoLayerView` constructor options.
 */
export interface JimuVideoLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VideoLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VideoLayer.html).
     */
    layer: __esri.VideoLayer;
}
/**
 * `JimuVideoLayerView` is the wrapper of [`VideoLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VideoLayer.html).
 */
export declare class JimuVideoLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VideoLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VideoLayer.html).
     */
    layer: __esri.VideoLayer;
    constructor(options: JimuVideoLayerViewOptions);
}
