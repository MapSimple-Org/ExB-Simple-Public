import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuMosaicLayerView` constructor options.
 */
export interface JimuMosaicLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Mosaic Layer'.
     */
    layer: __esri.Sublayer;
}
/**
 * `JimuMosaicLayerView` is the wrapper of [`Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html) whose `sourceJSON.type` is 'Mosaic Layer'.
 */
export declare class JimuMosaicLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `Sublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * Its `sourceJSON.type` is 'Mosaic Layer'.
     */
    layer: __esri.Sublayer;
    constructor(options: JimuMosaicLayerViewOptions);
    ready(): Promise<this>;
}
