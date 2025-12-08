import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWFSLayerView` constructor options.
 */
export interface JimuWFSLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WFSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WFSLayer.html).
     */
    layer: __esri.WFSLayer;
}
/**
 * `JimuWFSLayerView` is the wrapper of [`WFSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WFSLayer.html).
 */
export declare class JimuWFSLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WFSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WFSLayer.html).
     */
    layer: __esri.WFSLayer;
    constructor(options: JimuWFSLayerViewOptions);
}
