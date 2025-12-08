import { type DataSource, type IMDataSourceInfo, type MapServiceDataSource } from 'jimu-core';
import { JimuMapServiceLayerView, type JimuMapServiceLayerViewOptions } from './jimu-mapservice-layer-view';
/**
 * `JimuMapImageLayerView` is the wrapper of [`MapImageLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapImageLayer.html).
 */
export declare class JimuMapImageLayerView extends JimuMapServiceLayerView {
    /**
     * The `layer` is the ArcGIS Maps SDK for JavaScript [`MapImageLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-MapImageLayer.html).
     * It is used to synchronize state with [`MapServiceDataSource`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/MapServiceDataSource/).
     */
    layer: __esri.MapImageLayer;
    /**
     * @ignore
     */
    url: string;
    private readonly originalGdbVersion;
    constructor(options: JimuMapServiceLayerViewOptions);
    protected onLayerDataSourceInfoChange(preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo): void;
    protected validateDataSource(layerDs: DataSource): boolean;
    getLayerDataSource(): MapServiceDataSource;
    createLayerDataSource(): Promise<MapServiceDataSource>;
}
