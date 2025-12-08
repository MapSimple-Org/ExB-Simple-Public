import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuAnnotationLayerView` constructor options.
 */
export interface JimuAnnotationLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Annotation Layer'.
     */
    layer: __esri.Sublayer;
}
/**
 * `JimuAnnotationLayerView` is the wrapper of [`Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html) whose `sourceJSON.type` is 'Annotation Layer'.
 */
export declare class JimuAnnotationLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Annotation Layer'.
     */
    layer: __esri.Sublayer;
    constructor(options: JimuAnnotationLayerViewOptions);
    ready(): Promise<this>;
}
