import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuIntegratedMesh3DTilesLayerView` constructor options.
 */
export interface JimuIntegratedMesh3DTilesLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `IntegratedMesh3DTilesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMesh3DTilesLayer.html).
     */
    layer: __esri.IntegratedMesh3DTilesLayer;
}
/**
 * `JimuIntegratedMesh3DTilesLayerView` is the wrapper of [`IntegratedMesh3DTilesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMesh3DTilesLayer.html).
 */
export declare class JimuIntegratedMesh3DTilesLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `IntegratedMesh3DTilesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-IntegratedMesh3DTilesLayer.html).
     */
    layer: __esri.IntegratedMesh3DTilesLayer;
    constructor(options: JimuIntegratedMesh3DTilesLayerViewOptions);
}
