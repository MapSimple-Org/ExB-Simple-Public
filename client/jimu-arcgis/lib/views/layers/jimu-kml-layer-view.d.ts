import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuKMLLayerView` constructor options.
 */
export interface JimuKMLLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KMLLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KMLLayer.html).
     */
    layer: __esri.KMLLayer;
}
/**
 * `JimuKMLLayerView` is the wrapper of [`KMLLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KMLLayer.html).
 */
export declare class JimuKMLLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KMLLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KMLLayer.html).
     */
    layer: __esri.KMLLayer;
    constructor(options: JimuKMLLayerViewOptions);
    ready(): Promise<this>;
}
