import { type SubtypeGroupLayerDataSource, type ArcGISQueryParams } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuSubtypeGroupLayerView` constructor options.
 */
export interface JimuSubtypeGroupLayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SubtypeGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SubtypeGroupLayer.html).
     */
    layer: __esri.SubtypeGroupLayer;
}
/**
 * `JimuSubtypeGroupLayerView` is the wrapper of [`SubtypeGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SubtypeGroupLayer.html).
 * It is used to synchronize state with `SubtypeGroupLayerDataSource`.
 */
export declare class JimuSubtypeGroupLayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `SubtypeGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-SubtypeGroupLayer.html).
     */
    layer: __esri.SubtypeGroupLayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `FeatureLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-FeatureLayerView.html).
     */
    view: __esri.FeatureLayerView;
    ready(): Promise<this>;
    getLayerDataSource(): SubtypeGroupLayerDataSource;
    createLayerDataSource(): Promise<SubtypeGroupLayerDataSource>;
    protected shouldClosePopupWhenClearHighlight(): boolean;
    protected shouldUsePopupSelectedFeatureToUpdateSelection(): boolean;
    private isPopupSelectChildSubtypeSublayerFeature;
    protected getLocalDefinitionExpressionToMerge(): string;
    protected beforeSelectFeaturesByQuery(query: ArcGISQueryParams): ArcGISQueryParams;
}
