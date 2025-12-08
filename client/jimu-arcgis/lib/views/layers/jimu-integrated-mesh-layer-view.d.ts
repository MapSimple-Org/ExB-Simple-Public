import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuIntegratedMeshLayerView` constructor options.
 */
export interface JimuIntegratedMeshLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `IntegratedMeshLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMeshLayer.html).
     */
    layer: __esri.IntegratedMeshLayer;
}
/**
 * `JimuIntegratedMeshLayerView` is the wrapper of [`IntegratedMeshLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMeshLayer.html).
 */
export declare class JimuIntegratedMeshLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `IntegratedMeshLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMeshLayer.html).
     */
    layer: __esri.IntegratedMeshLayer;
    constructor(options: JimuIntegratedMeshLayerViewOptions);
}
