import { type SubtypeGroupLayerDataSource, type FeatureDataRecord, type ArcGISQueriableDataSource } from 'jimu-core';
import type { JimuLayerView } from '../layers/jimu-layer-view';
import type { JimuQueriableLayerView } from '../layers/jimu-queriable-layer-view';
export declare function convertSubtypeGrouplayerRecordsToSubtypeSublayerRecords(subtypeGroupLayerDataSource: SubtypeGroupLayerDataSource, subtypeGrouplayerRecords: FeatureDataRecord[]): {
    [subtypeSublayerDataSourceId: string]: FeatureDataRecord[];
};
export declare function publishSelectionChangeMessage(jimuLayerView: JimuQueriableLayerView, records: FeatureDataRecord[]): void;
export declare function getSubtypeField(layer: __esri.SubtypeGroupLayer | __esri.SubtypeSublayer): string;
/**
 * Sort JimuLayerViews by layer rendering order. This method does not change the jimuLayerViews parameter, but returns a new sorted array.
 * @param jimuLayerViews
 * @returns
 */
export declare function sortJimuLayerViewsByLayerOrder(jimuLayerViews: JimuLayerView[]): JimuLayerView[];
export declare function createSubJimuLayerViews(jimuLayerView: JimuLayerView): Promise<JimuLayerView>;
/**
 * Layers can be dragged between map root and group layer, onLayerCollectionBeforeAdd & onLayerCollectionAfterRemove can be triggered by map.layers or groupLayer.layers.
 * Returns true if the layer is added to the map for the first time, false otherwise (for example, if the layer is added to the map a second time due to layer reorder).
 * @param evt
 * @param isAddToMapRoot
 */
export declare function onLayerCollectionBeforeAdd(evt: __esri.CollectionItemEvent<__esri.Layer>, isAddToMapRoot: boolean): boolean;
export declare function onLayerCollectionAfterRemove(evt: __esri.CollectionAfterItemEvent<__esri.Layer>): void;
/**
 * If the feature's spatialReference doesn't match the map's spatialReference, the JS API automatically uses the projection engine to project features.
 * However, if the spatialReference projection requires a grid-based transformation, the JS API won't be able to perform the projection.
 * This method determines if a grid-based transformation is required and
 * then uses the server to re-query the features using the map's spatialReference to ensure that the features render correctly on the map.
 * @param view
 * @param dataSource
 * @param features
 * @returns
 */
export declare function getFeaturesForRendering(view: __esri.View, dataSource: ArcGISQueriableDataSource, features: __esri.Graphic[]): Promise<{
    spatialReferenceChanged: boolean;
    features: __esri.Graphic[];
}>;
/**
 * This method is used to determine whether the projection engine can correctly project spatial reference fromSR to toSR.
 * The method will compare the result returned by GeometryServer's findTransformations interface with the result returned by geographicTransformationUtils.getTransformations().
 * If the latter does not contain any of the items in the former, it means that the project engine does not support converting the layer's spatial reference to map's spatial reference.
 * This workaround is provided by API team, see details here - WebGIS/arcgis-js-api#69667 (comment)
 * This method will cache the result to avoid unnecessary requests.
 * @param fromSR In most cases, fromSR is the layer spatial reference.
 * @param toSR In most cases, toSR is the map spatial reference.
 * @param dataSourceId
 * @param dataSourceExtent The full extent of the data source/layer.
 * @returns
 */
export declare function isProjectionSupportedByProjectionEngine(fromSR: __esri.SpatialReference, toSR: __esri.SpatialReference, dataSourceId: string, dataSourceExtent: __esri.Extent): Promise<boolean>;
