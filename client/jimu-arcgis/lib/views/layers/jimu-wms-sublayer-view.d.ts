import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWMSSublayerView` constructor options.
 */
export interface JimuWMSSublayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMSSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-WMSSublayer.html).
     */
    layer: __esri.WMSSublayer;
}
/**
 * `JimuWMSSublayerView` is the wrapper of [`WMSSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-WMSSublayer.html).
 */
export declare class JimuWMSSublayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WMSSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-WMSSublayer.html).
     */
    layer: __esri.WMSSublayer;
    constructor(options: JimuWMSSublayerViewOptions);
}
