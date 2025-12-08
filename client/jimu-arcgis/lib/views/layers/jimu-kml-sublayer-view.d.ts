import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuKMLSublayerView` constructor options.
 */
export interface JimuKMLSublayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KMLSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-KMLSublayer.html).
     */
    layer: __esri.KMLSublayer;
}
/**
 * `JimuKMLSublayerView` is the wrapper of [`KMLSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-KMLSublayer.html).
 */
export declare class JimuKMLSublayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KMLSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-KMLSublayer.html).
     */
    layer: __esri.KMLSublayer;
    constructor(options: JimuKMLSublayerViewOptions);
    ready(): Promise<this>;
}
