import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuOGCFeatureLayerView` constructor options.
 */
export interface JimuOGCFeatureLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OGCFeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OGCFeatureLayer.html).
     */
    layer: __esri.OGCFeatureLayer;
}
/**
 * `JimuOGCFeatureLayerView` is the wrapper of [`OGCFeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OGCFeatureLayer.html).
 */
export declare class JimuOGCFeatureLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OGCFeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OGCFeatureLayer.html).
     */
    layer: __esri.OGCFeatureLayer;
    constructor(options: JimuOGCFeatureLayerViewOptions);
}
