import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuViewshedLayerView` constructor options.
 */
export interface JimuViewshedLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ViewshedLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ViewshedLayer.html).
     */
    layer: __esri.ViewshedLayer;
}
/**
 * `JimuViewshedLayerView` is the wrapper of [`ViewshedLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ViewshedLayer.html).
 */
export declare class JimuViewshedLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ViewshedLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ViewshedLayer.html).
     */
    layer: __esri.ViewshedLayer;
    constructor(options: JimuViewshedLayerViewOptions);
}
