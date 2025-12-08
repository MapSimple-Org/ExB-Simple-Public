import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
/**
 * `JimuKnowledgeGraphSublayerView` constructor options.
 */
export interface JimuKnowledgeGraphSublayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KnowledgeGraphSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-knowledgeGraph-KnowledgeGraphSublayer.html).
     */
    layer: __esri.KnowledgeGraphSublayer;
}
/**
 * `JimuKnowledgeGraphSublayerView` is the wrapper of [`KnowledgeGraphSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-knowledgeGraph-KnowledgeGraphSublayer.html).
 */
export declare class JimuKnowledgeGraphSublayerView extends JimuLayerView {
    /**
     * The `layer` is the [ArcGIS Maps SDK for JavaScript `KnowledgeGraphSublayer`](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-knowledgeGraph-KnowledgeGraphSublayer.html).
     */
    layer: __esri.KnowledgeGraphSublayer;
    constructor(options: JimuKnowledgeGraphSublayerViewOptions);
}
