export declare enum CreateToolActions {
    Point = "point",
    Polyline = "polyline",
    Polygon = "polygon",
    Rectangle = "rectangle",
    Circle = "circle",
    Text = "text",
    FreehandPolyline = "freehandPolyline",
    FreehandPolygon = "freehandPolygon"
}
export declare enum SelectToolActions {
    RectangleSelection = "rectangle-selection",
    LassoSelection = "lasso-selection"
}
export declare const CustomEditTool = "customEditTool";
export declare enum DrawingElevationMode3D {
    RelativeToGround = "relative-to-ground",
    RelativeToScene = "relative-to-scene",
    OnTheGround = "on-the-ground"
}
export declare enum JimuDrawCreationMode {
    Single = "single",
    Continuous = "continuous",
    Update = "update"
}
export interface VisibleElementsCreateTools extends __esri.VisibleElementsCreateToolsProperties {
    customText?: boolean;
}
export interface JimuDrawVisibleElements extends __esri.SketchVisibleElementsProperties {
    createTools: VisibleElementsCreateTools;
}
export interface JimuDrawCreatedDescriptor {
    sketch: __esri.Sketch;
    getGraphicsLayer: () => __esri.GraphicsLayer | __esri.MapNotesLayer;
    completeOperation: () => Promise<void>;
    destroy: () => void;
    enableSymbolSelector: (enableFlag: boolean) => void;
    sketchToolbarDom: HTMLElement;
}
export type DrawingUpdatedModes = 'deleted' | 'modified' | 'complete' | 'aborted';
export interface DrawingUpdatedDescriptor {
    type: DrawingUpdatedModes;
    graphics: __esri.Graphic[];
}
export type LayerListMode = 'show' | 'hide' | 'hide-children';
export declare enum SnappingMode {
    Flexible = "Flexible",
    Prescriptive = "Prescriptive"
}
export interface DrawOptionsInfo {
    snappingMode: SnappingMode;
    tooltipEnabled?: boolean;
    defaultTooltipEnabled?: boolean;
    segmentLabelEnabled?: boolean;
    defaultSegmentLabelEnabled?: boolean;
    geometryGuidesEnabled?: boolean;
    defaultGeometryGuidesEnabled?: boolean;
    featureToFeatureEnabled?: boolean;
    defaultFeatureToFeatureEnabled?: boolean;
    gridEnabled?: boolean;
    defaultGridEnabled?: boolean;
    defaultSnappingLayers?: string[];
}
