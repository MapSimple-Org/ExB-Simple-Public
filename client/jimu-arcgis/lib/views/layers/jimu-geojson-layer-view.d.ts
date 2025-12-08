import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuGeoJSONLayerView` constructor options.
 */
export interface JimuGeoJSONLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GeoJSONLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoJSONLayer.html).
     */
    layer: __esri.GeoJSONLayer;
}
/**
 * `JimuGeoJSONLayerView` is the wrapper of [`GeoJSONLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoJSONLayer.html).
 */
export declare class JimuGeoJSONLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GeoJSONLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoJSONLayer.html).
     */
    layer: __esri.GeoJSONLayer;
    constructor(options: JimuGeoJSONLayerViewOptions);
}
