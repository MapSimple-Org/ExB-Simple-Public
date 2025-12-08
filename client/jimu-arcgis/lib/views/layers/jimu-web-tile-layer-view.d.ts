import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuWebTileLayerView` constructor options.
 */
export interface JimuWebTileLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WebTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WebTileLayer.html).
     */
    layer: __esri.WebTileLayer;
}
/**
 * `JimuWebTileLayerView` is the wrapper of [`WebTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WebTileLayer.html).
 */
export declare class JimuWebTileLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `WebTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-WebTileLayer.html).
     */
    layer: __esri.WebTileLayer;
    constructor(options: JimuWebTileLayerViewOptions);
}
