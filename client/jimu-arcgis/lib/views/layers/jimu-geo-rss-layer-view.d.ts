import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuGeoRSSLayerView` constructor options.
 */
export interface JimuGeoRSSLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GeoRSSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoRSSLayer.html).
     */
    layer: __esri.GeoRSSLayer;
}
/**
 * `JimuGeoRSSLayerView` is the wrapper of [`GeoRSSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoRSSLayer.html).
 */
export declare class JimuGeoRSSLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GeoRSSLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GeoRSSLayer.html).
     */
    layer: __esri.GeoRSSLayer;
    constructor(options: JimuGeoRSSLayerViewOptions);
}
