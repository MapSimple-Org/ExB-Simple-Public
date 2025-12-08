import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuBingMapsLayerView` constructor options.
 */
export interface JimuBingMapsLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BingMapsLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BingMapsLayer.html).
     */
    layer: __esri.BingMapsLayer;
}
/**
 * `JimuBingMapsLayerView` is the wrapper of [`BingMapsLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BingMapsLayer.html).
 */
export declare class JimuBingMapsLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BingMapsLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-BingMapsLayer.html).
     */
    layer: __esri.BingMapsLayer;
    constructor(options: JimuBingMapsLayerViewOptions);
}
