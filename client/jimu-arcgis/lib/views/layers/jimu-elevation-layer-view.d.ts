import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuElevationLayerView` constructor options.
 */
export interface JimuElevationLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ElevationLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ElevationLayer.html).
     */
    layer: __esri.ElevationLayer;
}
/**
 * `JimuElevationLayerView` is the wrapper of [`ElevationLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ElevationLayer.html).
 */
export declare class JimuElevationLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ElevationLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ElevationLayer.html).
     */
    layer: __esri.ElevationLayer;
    constructor(options: JimuElevationLayerViewOptions);
}
