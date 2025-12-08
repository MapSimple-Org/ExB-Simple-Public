import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWCSLayerView` constructor options.
 */
export interface JimuWCSLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WCSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WCSLayer.html).
     */
    layer: __esri.WCSLayer;
}
/**
 * `JimuWCSLayerView` is the wrapper of [`WCSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WCSLayer.html).
 */
export declare class JimuWCSLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WCSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WCSLayer.html).
     */
    layer: __esri.WCSLayer;
    constructor(options: JimuWCSLayerViewOptions);
}
