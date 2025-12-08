import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuRouteLayerView` constructor options.
 */
export interface JimuRouteLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `RouteLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-RouteLayer.html).
     */
    layer: __esri.RouteLayer;
}
/**
 * `JimuRouteLayerView` is the wrapper of [`RouteLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-RouteLayer.html).
 */
export declare class JimuRouteLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `RouteLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-RouteLayer.html).
     */
    layer: __esri.RouteLayer;
    constructor(options: JimuRouteLayerViewOptions);
}
