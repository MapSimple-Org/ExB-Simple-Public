import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWMSLayerView` constructor options.
 */
export interface JimuWMSLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMSLayer.html).
     */
    layer: __esri.WMSLayer;
}
/**
 * `JimuWMSLayerView` is the wrapper of [`WMSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMSLayer.html).
 */
export declare class JimuWMSLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WMSLayer.html).
     */
    layer: __esri.WMSLayer;
    constructor(options: JimuWMSLayerViewOptions);
    ready(): Promise<this>;
}
