import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuLinkChartLayerView` constructor options.
 */
export interface JimuLinkChartLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `LinkChartLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LinkChartLayer.html).
     */
    layer: __esri.LinkChartLayer;
}
/**
 * `JimuLinkChartLayerView` is the wrapper of [`LinkChartLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LinkChartLayer.html).
 */
export declare class JimuLinkChartLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `LinkChartLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-LinkChartLayer.html).
     */
    layer: __esri.LinkChartLayer;
    constructor(options: JimuLinkChartLayerViewOptions);
    ready(): Promise<this>;
}
