import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuBuildingGroupSublayer` constructor options.
 */
export interface JimuBuildingGroupSublayerOptions extends JimuLayerViewConstructorOptions {
    layer: __esri.BuildingGroupSublayer;
}
/**
 * `JimuBuildingGroupSublayer` is the wrapper of [`BuildingGroupSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-buildingSublayers-BuildingGroupSublayer.html).
 */
export declare class JimuBuildingGroupSublayer extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `BuildingGroupSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-buildingSublayers-BuildingGroupSublayer.html).
     */
    layer: __esri.BuildingGroupSublayer;
    constructor(options: JimuBuildingGroupSublayerOptions);
    ready(): Promise<this>;
}
