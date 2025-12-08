import { AppMode } from 'jimu-core';
import type { HighLightHandle } from './components/mapbase';
import type MapBase from './components/mapbase';
import type { IFeature } from '@esri/arcgis-rest-feature-service';
export declare function createNewFeaturelayer(mapBaseView: __esri.MapView | __esri.SceneView, newFeatureSetValue?: {
    [layerID: string]: __esri.FeatureSet;
}): Promise<any>;
export declare function updateFeaturelayer(mapBaseView: __esri.MapView | __esri.SceneView, changedFeatureSetValue?: {
    [layerID: string]: __esri.FeatureSet;
}): Promise<any>;
export declare function selectFeature(mapBaseView: __esri.MapView | __esri.SceneView, target: __esri.Graphic | __esri.Graphic[] | IFeature | IFeature[], layerId?: string): HighLightHandle;
export declare function mapPanto(mapBaseView: __esri.MapView | __esri.SceneView, target: __esri.Geometry | __esri.Geometry[] | __esri.Graphic | __esri.Graphic[] | __esri.Extent): Promise<any>;
export declare function filterFeaturesByQuery(mapBaseView: __esri.MapView | __esri.SceneView, layerId: string, querySQL: string): void;
export declare function flashFeaturesByQuery(mapBaseView: __esri.MapView | __esri.SceneView, layerId: string, querySQL: string): void;
export declare function handleFeature(feature: IFeature | __esri.Graphic, Graphic: typeof __esri.Graphic): __esri.Graphic;
export declare function projectGeometries(geometries: __esri.Geometry[], spatialReference: __esri.SpatialReference): Promise<__esri.Geometry[]>;
export declare function checkIsLive(appMode: AppMode): boolean;
export declare function getMapBaseRestoreData(mapInstance: MapBase): any;
export declare function restoreMapBase(mapInstance: MapBase, restoreData: any): void;
