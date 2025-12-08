import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuMapServiceLayerView` constructor options.
 */
export interface JimuMapServiceLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the ArcGIS Maps SDK for JavaScript [`MapImageLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapImageLayer.html)
     * or [`TileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-TileLayer.html).
     */
    layer: __esri.MapImageLayer | __esri.TileLayer;
    /**
     * @ignore
     */
    url?: string;
}
/**
 * `JimuMapServiceLayerView` is the base class of `JimuMapImageLayerView` and `JimuTileLayerView`.
 */
export declare class JimuMapServiceLayerView extends JimuLayerView {
    /**
     * The `layer` is the ArcGIS Maps SDK for JavaScript [`MapImageLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapImageLayer.html)
     * or [`TileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-TileLayer.html).
     */
    layer: __esri.MapImageLayer | __esri.TileLayer;
    /**
     * @ignore
     */
    url: string;
    constructor(options: JimuMapServiceLayerViewOptions);
    ready(): Promise<this>;
}
