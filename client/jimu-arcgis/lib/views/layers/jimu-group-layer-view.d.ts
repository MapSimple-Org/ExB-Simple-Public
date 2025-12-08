import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuGroupLayerView` constructor options.
 */
export interface JimuGroupLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GroupLayer.html).
     */
    layer: __esri.GroupLayer;
    /**
     * @ignore
     */
    url?: string;
}
/**
 * `JimuGroupLayerView` is the wrapper of [`GroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GroupLayer.html).
 */
export declare class JimuGroupLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `GroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-GroupLayer.html).
     */
    layer: __esri.GroupLayer;
    /**
     * @ignore
     */
    url: string;
    watchAddLayerHandle: __esri.Handle;
    watchRemoveLayerHandle: __esri.Handle;
    constructor(options: JimuGroupLayerViewOptions);
    ready(): Promise<this>;
    destroy(): void;
}
