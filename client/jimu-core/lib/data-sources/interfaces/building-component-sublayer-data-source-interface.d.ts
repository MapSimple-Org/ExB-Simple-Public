import type { DataSourceTypes } from './common-data-source-interface';
import type { SceneLayerDataSource } from './scene-layer-data-source-interface';
/**
 * Child data source of `BuildingSceneLayerDataSource` or `BuildingGroupSubLayerDataSource`.
 */
export interface BuildingComponentSubLayerDataSource extends Omit<SceneLayerDataSource, 'type'> {
    type: DataSourceTypes.BuildingComponentSubLayer;
}
