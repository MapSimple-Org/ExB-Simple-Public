import type { FeatureLayerDataSource } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuFeatureLayerView` constructor options.
 */
export interface JimuFeatureLayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html).
     */
    layer: __esri.FeatureLayer;
}
/**
 * `JimuFeatureLayerView` is the wrapper of [`FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html) and
 *  [`FeatureLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-FeatureLayerView.html).
 *  It is used to synchronize state with [`FeatureLayerDataSource`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/FeatureLayerDataSource/).
 */
export declare class JimuFeatureLayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `FeatureLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html).
     */
    layer: __esri.FeatureLayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `FeatureLayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-FeatureLayerView.html).
     * If the layer is a sublayer of MapImageLayer, then view is null.
     */
    view: __esri.FeatureLayerView;
    getLayerDataSource(): FeatureLayerDataSource;
    createLayerDataSource(): Promise<FeatureLayerDataSource>;
}
