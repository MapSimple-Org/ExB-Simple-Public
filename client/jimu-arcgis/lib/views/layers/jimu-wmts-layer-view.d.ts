import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWMTSLayerView` constructor options.
 */
export interface JimuWMTSLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMTSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMTSLayer.html).
     */
    layer: __esri.WMTSLayer;
}
/**
 * `JimuWMTSLayerView` is the wrapper of [`WMTSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMTSLayer.html).
 */
export declare class JimuWMTSLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMTSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMTSLayer.html).
     */
    layer: __esri.WMTSLayer;
    constructor(options: JimuWMTSLayerViewOptions);
}
