import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuAnnotationSubLayerView` constructor options.
 */
export interface JimuAnnotationSubLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Annotation SubLayer'.
     */
    layer: __esri.Sublayer;
}
/**
 * `JimuAnnotationSubLayerView` is the wrapper of [`Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html) whose `sourceJSON.type` is 'Annotation SubLayer'.
 */
export declare class JimuAnnotationSubLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Annotation SubLayer'.
     */
    layer: __esri.Sublayer;
    constructor(options: JimuAnnotationSubLayerViewOptions);
}
