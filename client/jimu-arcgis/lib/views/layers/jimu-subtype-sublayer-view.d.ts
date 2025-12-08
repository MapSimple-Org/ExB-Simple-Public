import { type SubtypeSublayerDataSource, type IMDataSourceInfo } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuSubtypeSublayerView` constructor options.
 */
export interface JimuSubtypeSublayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SubtypeSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-SubtypeSublayer.html).
     */
    layer: __esri.SubtypeSublayer;
}
/**
 * `JimuSubtypeSublayerView` is the wrapper of [`SubtypeSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-SubtypeSublayer.html).
 * It is used to synchronize state with `SubtypeSublayerDataSource`.
 */
export declare class JimuSubtypeSublayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SubtypeSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-SubtypeSublayer.html).
     */
    layer: __esri.SubtypeSublayer;
    constructor(options: JimuSubtypeSublayerViewOptions);
    getLayerDataSource(): SubtypeSublayerDataSource;
    createLayerDataSource(): Promise<SubtypeSublayerDataSource>;
    protected onLayerDataSourceInfoChange(preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo): void;
    protected shouldWatchPopupSelectFeature(): boolean;
    protected shouldWatchMapViewRestore(): boolean;
    /**
     * @ignore
     */
    getLocalDefinitionExpressionToMerge(): string;
    setDefinitionExpression(localDefinitionExpression: string): void;
    /**
     * @ignore
     */
    setDefinitionExpressionToLayer(): Promise<void>;
}
