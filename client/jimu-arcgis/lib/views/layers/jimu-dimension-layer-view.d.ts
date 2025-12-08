import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuDimensionLayerView` constructor options.
 */
export interface JimuDimensionLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `DimensionLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-DimensionLayer.html).
     */
    layer: __esri.DimensionLayer;
}
/**
 * `JimuDimensionLayerView` is the wrapper of [`DimensionLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-DimensionLayer.html).
 */
export declare class JimuDimensionLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `DimensionLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-DimensionLayer.html).
     */
    layer: __esri.DimensionLayer;
    constructor(options: JimuDimensionLayerViewOptions);
}
