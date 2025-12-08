import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuVoxelLayerView` constructor options.
 */
export interface JimuVoxelLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VoxelLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VoxelLayer.html).
     */
    layer: __esri.VoxelLayer;
}
/**
 * `JimuVoxelLayerView` is the wrapper of [`VoxelLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VoxelLayer.html).
 */
export declare class JimuVoxelLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `VoxelLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-VoxelLayer.html).
     */
    layer: __esri.VoxelLayer;
    constructor(options: JimuVoxelLayerViewOptions);
}
