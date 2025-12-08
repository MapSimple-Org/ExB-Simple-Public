import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuLineOfSightLayerView` constructor options.
 */
export interface JimuLineOfSightLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `LineOfSightLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LineOfSightLayer.html).
     */
    layer: __esri.LineOfSightLayer;
}
/**
 * `JimuLineOfSightLayerView` is the wrapper of [`LineOfSightLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LineOfSightLayer.html).
 */
export declare class JimuLineOfSightLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `LineOfSightLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LineOfSightLayer.html).
     */
    layer: __esri.LineOfSightLayer;
    constructor(options: JimuLineOfSightLayerViewOptions);
}
