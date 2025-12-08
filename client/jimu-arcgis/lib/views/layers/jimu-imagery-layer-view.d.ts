import type { ImageryLayerDataSource } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuImageryLayerView` constructor options.
 */
export interface JimuImageryLayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryLayer.html).
     */
    layer: __esri.ImageryLayer;
}
/**
 * `JimuImageryLayerView` is the wrapper of [`ImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryLayer.html)
 * and [`ImageryLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-ImageryLayerView.html).
 * It is used to synchronize state with `ImageryLayerDataSource`.
 */
export declare class JimuImageryLayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ImageryLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryLayer.html).
     */
    layer: __esri.ImageryLayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `ImageryLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-ImageryLayerView.html).
     */
    view: __esri.ImageryLayerView;
    getLayerDataSource(): ImageryLayerDataSource;
    createLayerDataSource(): Promise<ImageryLayerDataSource>;
}
