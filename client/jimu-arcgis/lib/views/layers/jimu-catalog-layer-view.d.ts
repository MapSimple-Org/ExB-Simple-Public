import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuCatalogLayerView` constructor options.
 */
export interface JimuCatalogLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CatalogLayer.html).
     */
    layer: __esri.CatalogLayer;
}
/**
 * `JimuCatalogLayerView` is the wrapper of [`CatalogLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CatalogLayer.html).
 */
export declare class JimuCatalogLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `CatalogLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-CatalogLayer.html).
     */
    layer: __esri.CatalogLayer;
    constructor(options: JimuCatalogLayerViewOptions);
    ready(): Promise<this>;
}
