import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuKnowledgeGraphLayerView` constructor options.
 */
export interface JimuKnowledgeGraphLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KnowledgeGraphLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KnowledgeGraphLayer.html).
     */
    layer: __esri.KnowledgeGraphLayer;
}
/**
 * `JimuKnowledgeGraphLayerView` is the wrapper of [`KnowledgeGraphLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KnowledgeGraphLayer.html).
 */
export declare class JimuKnowledgeGraphLayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KnowledgeGraphLayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-KnowledgeGraphLayer.html).
     */
    layer: __esri.KnowledgeGraphLayer;
    constructor(options: JimuKnowledgeGraphLayerViewOptions);
    ready(): Promise<this>;
}
