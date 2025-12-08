export interface ViewPadding {
    left: number;
    right: number;
    top: number;
    bottom: number;
}
export interface ZoomToOptions {
    scale?: number;
    queryParams?: any;
    padding?: ViewPadding;
}
export declare function zoomTo(view: __esri.MapView | __esri.SceneView, target: any, options: ZoomToOptions): Promise<any>;
export interface ViewSize {
    width: number;
    height: number;
}
export declare function getExtentFromScale(viewSize: ViewSize, extent: __esri.Extent, scale: number, needToAdjustHeightToAspectRatio?: boolean): Promise<__esri.Extent>;
export declare function layerExtent(view: __esri.MapView | __esri.SceneView, layer: __esri.Layer, queryParams?: any): Promise<__esri.Extent>;
export declare function projectToSpatialReference(geometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]>;
