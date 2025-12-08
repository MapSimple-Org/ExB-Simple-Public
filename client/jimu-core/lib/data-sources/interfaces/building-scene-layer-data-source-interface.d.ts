import type { DataSourceTypes } from './common-data-source-interface';
/**
 * `BuildingSceneLayerDataSource` is created from the scene service, it allows you to visualize 3D buildings in a scene.
 */
export interface BuildingSceneLayerDataSource {
    type: DataSourceTypes.BuildingSceneLayer;
}
