import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuCatalogDynamicGroupLayerView` constructor options.
 */
export interface JimuCatalogDynamicGroupLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogDynamicGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogDynamicGroupLayer.html).
     */
    layer: __esri.CatalogDynamicGroupLayer;
}
/**
 * `JimuCatalogDynamicGroupLayerView` is the wrapper of [`CatalogDynamicGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogDynamicGroupLayer.html).
 */
export declare class JimuCatalogDynamicGroupLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogDynamicGroupLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-catalog-CatalogDynamicGroupLayer.html).
     */
    layer: __esri.CatalogDynamicGroupLayer;
    constructor(options: JimuCatalogDynamicGroupLayerViewOptions);
    ready(): Promise<this>;
}
