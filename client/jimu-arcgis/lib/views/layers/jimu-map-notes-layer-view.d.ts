import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuMapNotesLayerView` constructor options.
 */
export interface JimuMapNotesLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `MapNotesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapNotesLayer.html).
     */
    layer: __esri.MapNotesLayer;
}
/**
 * `JimuMapNotesLayerView` is the wrapper of [`MapNotesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapNotesLayer.html).
 */
export declare class JimuMapNotesLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `MapNotesLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapNotesLayer.html).
     */
    layer: __esri.MapNotesLayer;
    constructor(options: JimuMapNotesLayerViewOptions);
}
