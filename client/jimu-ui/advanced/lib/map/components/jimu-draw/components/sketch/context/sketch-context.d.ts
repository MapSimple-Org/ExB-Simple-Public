import { React } from 'jimu-core';
import type { JimuDrawCreatedDescriptor, CreateToolActions, SelectToolActions } from '../sketch-adapter';
import type { LayerListMode, JimuDrawVisibleElements, CustomEditTool } from '../constraints';
import { JimuDrawCreationMode, type DrawingUpdatedDescriptor, DrawingElevationMode3D } from '..';
export interface JimuDrawingOptions {
    creationMode?: JimuDrawCreationMode;
    drawingElevationMode3D?: DrawingElevationMode3D;
    visibleElements?: JimuDrawVisibleElements;
    snappingOptions?: __esri.SnappingOptions;
    tooltipOptions?: __esri.SketchTooltipOptionsProperties;
    labelOptions?: __esri.SketchLabelOptionsProperties;
    layerListMode?: LayerListMode;
    updateOnGraphicClick?: boolean;
    defaultCreateOptions?: __esri.SketchViewModelDefaultCreateOptions;
    defaultUpdateOptions?: __esri.SketchViewModelDefaultUpdateOptions;
}
export interface SketchCallBacks {
    onJimuDrawCreated?: (jimuDraw: JimuDrawCreatedDescriptor) => void;
    onToolsActivated?: (drawingMode: string) => void;
    onDrawingCleared?: () => void;
    onDrawingStarted?: () => void;
    onDrawingCanceled?: () => void;
    onDrawingFinished?: (graphic: __esri.Graphic) => void;
    onDrawingUpdated?: (res: DrawingUpdatedDescriptor) => void;
}
export interface SketchContextStates {
    sketchRef: __esri.Sketch;
    getGraphicsLayerFunRef: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeDrawFunRef: () => Promise<void>;
    destroy: () => void;
    isDisplayCanvasLayer: boolean;
    activeTool: CreateToolActions | SelectToolActions | typeof CustomEditTool;
    drawingOptions: JimuDrawingOptions;
    callBacks: SketchCallBacks;
    sketchToolbarDom: HTMLElement;
}
interface SketchContextAction {
    type: string;
    payload: any;
}
export declare const actionType: {
    SketchChanged: string;
    IsDisplayCanvasLayerChanged: string;
    ActiveToolChanged: string;
    DrawingOptionsChanged: string;
    CallBacksChanged: string;
};
export declare const SketchChangedAction: (jimuDrawCreatedDescriptor: JimuDrawCreatedDescriptor) => {
    type: string;
    payload: JimuDrawCreatedDescriptor;
};
export declare const IsDisplayCanvasLayerChangedAction: (isDisplayCanvasLayer: boolean) => {
    type: string;
    payload: boolean;
};
export declare const ActiveToolChangedAction: (mode: CreateToolActions) => {
    type: string;
    payload: CreateToolActions;
};
export declare const DrawingOptionsChangedAction: (drawingOptions: JimuDrawingOptions) => {
    type: string;
    payload: JimuDrawingOptions;
};
export declare const CallBacksChangedAction: (callBacks: SketchCallBacks) => {
    type: string;
    payload: SketchCallBacks;
};
export declare const init: (initStates: any) => SketchContextStates;
export declare const reducer: (state: SketchContextStates, action: SketchContextAction) => {
    isDisplayCanvasLayer: any;
    sketchRef: __esri.Sketch;
    getGraphicsLayerFunRef: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeDrawFunRef: () => Promise<void>;
    destroy: () => void;
    activeTool: CreateToolActions | SelectToolActions | typeof CustomEditTool;
    drawingOptions: JimuDrawingOptions;
    callBacks: SketchCallBacks;
    sketchToolbarDom: HTMLElement;
} | {
    activeTool: any;
    sketchRef: __esri.Sketch;
    getGraphicsLayerFunRef: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeDrawFunRef: () => Promise<void>;
    destroy: () => void;
    isDisplayCanvasLayer: boolean;
    drawingOptions: JimuDrawingOptions;
    callBacks: SketchCallBacks;
    sketchToolbarDom: HTMLElement;
} | {
    drawingOptions: any;
    sketchRef: __esri.Sketch;
    getGraphicsLayerFunRef: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeDrawFunRef: () => Promise<void>;
    destroy: () => void;
    isDisplayCanvasLayer: boolean;
    activeTool: CreateToolActions | SelectToolActions | typeof CustomEditTool;
    callBacks: SketchCallBacks;
    sketchToolbarDom: HTMLElement;
} | {
    callBacks: any;
    sketchRef: __esri.Sketch;
    getGraphicsLayerFunRef: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeDrawFunRef: () => Promise<void>;
    destroy: () => void;
    isDisplayCanvasLayer: boolean;
    activeTool: CreateToolActions | SelectToolActions | typeof CustomEditTool;
    drawingOptions: JimuDrawingOptions;
    sketchToolbarDom: HTMLElement;
};
export declare const SketchContext: React.Context<{
    sketchContextStates: SketchContextStates;
    dispatchSketchActions: React.Dispatch<SketchContextAction>;
}>;
export declare const SketchContextProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
