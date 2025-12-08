import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuCatalogFootprintLayerView` constructor options.
 */
export interface JimuCatalogFootprintLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogFootprintLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogFootprintLayer.html).
     */
    layer: __esri.CatalogFootprintLayer;
}
/**
 * `JimuCatalogFootprintLayerView` is the wrapper of [`CatalogFootprintLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogFootprintLayer.html).
 */
export declare class JimuCatalogFootprintLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogFootprintLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogFootprintLayer.html).
     */
    layer: __esri.CatalogFootprintLayer;
    constructor(options: JimuCatalogFootprintLayerViewOptions);
}
