import { JimuDrawCreationMode } from '../..';
export declare const getDefaultVisibleElements: (visibleElements: __esri.SketchVisibleElementsProperties) => __esri.SketchVisibleElementsProperties;
export declare const getDefaultSnappingOptions: (snappingOptions: __esri.SnappingOptions, tmpCanvasLayer: __esri.GraphicsLayer) => __esri.SnappingOptions;
export declare const getDefaultCreationMode: (creationMode: JimuDrawCreationMode) => JimuDrawCreationMode;
export declare const getDefaultOptions: (params: {
    creationMode: JimuDrawCreationMode;
    visibleElements: __esri.SketchVisibleElementsProperties;
    updateOnGraphicClick: any;
    defaultCreateOptions: __esri.SketchViewModelDefaultCreateOptions;
    defaultUpdateOptions: __esri.SketchViewModelDefaultUpdateOptions;
    snappingOptions: __esri.SnappingOptions;
    tooltipOptions: __esri.SketchTooltipOptionsProperties;
    labelOptions: __esri.SketchLabelOptionsProperties;
}, canvasLayer: __esri.GraphicsLayer) => {
    creationMode: JimuDrawCreationMode;
    visibleElements: __esri.SketchVisibleElementsProperties;
    updateOnGraphicClick: any;
    defaultCreateOptions: __esri.SketchViewModelDefaultCreateOptions;
    defaultUpdateOptions: __esri.SketchViewModelDefaultUpdateOptions;
    snappingOptions: __esri.SnappingOptions;
    tooltipOptions: __esri.SketchTooltipOptionsProperties;
    labelOptions: __esri.SketchLabelOptionsProperties;
};
