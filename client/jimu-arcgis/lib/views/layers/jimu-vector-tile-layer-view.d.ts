import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuVectorTileLayerView` constructor options.
 */
export interface JimuVectorTileLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VectorTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VectorTileLayer.html).
     */
    layer: __esri.VectorTileLayer;
}
/**
 * `JimuVectorTileLayerView` is the wrapper of [`VectorTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VectorTileLayer.html).
 */
export declare class JimuVectorTileLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VectorTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VectorTileLayer.html).
     */
    layer: __esri.VectorTileLayer;
    constructor(options: JimuVectorTileLayerViewOptions);
}
