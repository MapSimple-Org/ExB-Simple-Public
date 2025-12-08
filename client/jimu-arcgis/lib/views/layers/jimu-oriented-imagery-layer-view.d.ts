import type { OrientedImageryLayerDataSource } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuOrientedImageryLayerView` constructor options.
 */
export interface JimuOrientedImageryLayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OrientedImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OrientedImageryLayer.html).
     */
    layer: __esri.OrientedImageryLayer;
}
/**
 * `JimuOrientedImageryLayerView` is the wrapper of [`OrientedImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OrientedImageryLayer.html).
 * It is used to synchronize state with `OrientedImageryLayerDataSource`.
 */
export declare class JimuOrientedImageryLayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `OrientedImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-OrientedImageryLayer.html).
     */
    layer: __esri.OrientedImageryLayer;
    getLayerDataSource(): OrientedImageryLayerDataSource;
    createLayerDataSource(): Promise<OrientedImageryLayerDataSource>;
}
