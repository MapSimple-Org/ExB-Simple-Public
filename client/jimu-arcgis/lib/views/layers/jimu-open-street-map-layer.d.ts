import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuOpenStreetMapLayerView` constructor options.
 */
export interface JimuOpenStreetMapLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OpenStreetMapLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OpenStreetMapLayer.html).
     */
    layer: __esri.OpenStreetMapLayer;
}
/**
 * `JimuOpenStreetMapLayerView` is the wrapper of [`OpenStreetMapLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OpenStreetMapLayer.html).
 */
export declare class JimuOpenStreetMapLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OpenStreetMapLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OpenStreetMapLayer.html).
     */
    layer: __esri.OpenStreetMapLayer;
    constructor(options: JimuOpenStreetMapLayerViewOptions);
}
