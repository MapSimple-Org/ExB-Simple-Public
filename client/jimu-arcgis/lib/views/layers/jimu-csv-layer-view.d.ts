import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuCSVLayerView` constructor options.
 */
export interface JimuCSVLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CSVLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CSVLayer.html).
     */
    layer: __esri.CSVLayer;
}
/**
 * `JimuCSVLayerView` is the wrapper of [`CSVLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CSVLayer.html).
 */
export declare class JimuCSVLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CSVLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CSVLayer.html).
     */
    layer: __esri.CSVLayer;
    constructor(options: JimuCSVLayerViewOptions);
}
