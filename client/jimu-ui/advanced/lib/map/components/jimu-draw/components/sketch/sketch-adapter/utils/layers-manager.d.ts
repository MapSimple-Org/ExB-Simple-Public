/** @jsx jsx */
import { type ImmutableObject } from 'jimu-core';
import { type JimuMapView } from 'jimu-arcgis';
import { DrawingElevationMode3D } from '../../';
import type { MeasurementsRuntimeInfo } from '../../../measurements/constraints';
import type { ApiModulesTypes } from '../sketch-api';
import type { LayerListMode } from '../../constraints';
export interface LayersGroupForJimuMapView {
    canvasLayer: __esri.GraphicsLayer;
    measurementsLayer: __esri.FeatureLayer;
}
export interface LayersManagerProps {
    jimuMapView: JimuMapView;
    apiModules: ApiModulesTypes;
    elevationInfo: DrawingElevationMode3D;
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
}
export declare const useLayersManager: (props: LayersManagerProps) => {
    getLayersGroupByJimuMapId: (jimuMapId?: string) => __esri.GroupLayer;
    getCanvasLayer: (jimuMapId?: string) => __esri.GraphicsLayer;
    getMeasurementsLayer: (jimuMapId?: string) => __esri.FeatureLayer;
    addLayersToMap: (layerListMode: LayerListMode) => __esri.GroupLayer;
    changeLayerElev: () => void;
    updateMeasurementsLayerListMode: (isEnable: boolean) => void;
    removeAllLayersFromMap: (jimuMapWidgetId?: string) => void;
};
