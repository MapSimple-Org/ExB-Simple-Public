import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuPointCloudLayerView` constructor options.
 */
export interface JimuPointCloudLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `PointCloudLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-PointCloudLayer.html).
     */
    layer: __esri.PointCloudLayer;
}
/**
 * `JimuPointCloudLayerView` is the wrapper of [`PointCloudLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-PointCloudLayer.html).
 */
export declare class JimuPointCloudLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `PointCloudLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-PointCloudLayer.html).
     */
    layer: __esri.PointCloudLayer;
    constructor(options: JimuPointCloudLayerViewOptions);
}
