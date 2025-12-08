import { JimuMapServiceLayerView } from './jimu-mapservice-layer-view';
/**
 * `JimuTileLayerView` is the wrapper of [`TileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-TileLayer.html).
 */
export declare class JimuTileLayerView extends JimuMapServiceLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `TileLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-TileLayer.html).
     */
    layer: __esri.TileLayer;
}
