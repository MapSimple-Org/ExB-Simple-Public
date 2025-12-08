import type { BuildingComponentSubLayerDataSource } from 'jimu-core';
import { JimuQueriableLayerView, type JimuQueriableLayerViewOptions } from './jimu-queriable-layer-view';
/**
 * `JimuBuildingComponentSublayerView` constructor options.
 */
export interface JimuBuildingComponentSublayerViewOptions extends JimuQueriableLayerViewOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BuildingComponentSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-buildingSublayers-BuildingComponentSublayer.html).
     */
    layer: __esri.BuildingComponentSublayer;
}
/**
 * `JimuBuildingComponentSublayerView` is the wrapper of [`BuildingComponentSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-buildingSublayers-BuildingComponentSublayer.html)
 *  and [`BuildingComponentSublayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingComponentSublayerView.html).
 *  It is used to synchronize state with `BuildingComponentSubLayerDataSource`.
 */
export declare class JimuBuildingComponentSublayerView extends JimuQueriableLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BuildingComponentSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-buildingSublayers-BuildingComponentSublayer.html).
     */
    layer: __esri.BuildingComponentSublayer;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `BuildingComponentSublayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingComponentSublayerView.html).
     */
    view: __esri.BuildingComponentSublayerView;
    getLayerDataSource(): BuildingComponentSubLayerDataSource;
    createLayerDataSource(): Promise<BuildingComponentSubLayerDataSource>;
}
