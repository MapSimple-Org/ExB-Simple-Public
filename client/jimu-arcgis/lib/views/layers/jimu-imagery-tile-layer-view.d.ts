import { type IMDataSourceInfo, type ImageryTileLayerDataSource } from 'jimu-core';
import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuImageryTileLayerView` constructor options.
 */
export interface JimuImageryTileLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ImageryTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryTileLayer.html).
     */
    layer: __esri.ImageryTileLayer;
}
/**
 * `JimuImageryTileLayerView` is the wrapper of [`ImageryTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryTileLayer.html).
 * It is used to synchronize state with `ImageryTileLayerDataSource`.
 */
export declare class JimuImageryTileLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `ImageryTileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ImageryTileLayer.html).
     */
    layer: __esri.ImageryTileLayer;
    constructor(options: JimuImageryTileLayerViewOptions);
    protected onLayerDataSourceInfoChange(preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo): void;
    getLayerDataSource(): ImageryTileLayerDataSource;
    createLayerDataSource(): Promise<ImageryTileLayerDataSource>;
}
