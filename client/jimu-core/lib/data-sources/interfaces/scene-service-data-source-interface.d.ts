import type { AbstractArcGISLayerFolderDataSource, DataSourceTypes } from './common-data-source-interface';
/**
 * `SceneServiceDataSource` is created from scene service or webscene.
 */
export interface SceneServiceDataSource extends AbstractArcGISLayerFolderDataSource {
    type: DataSourceTypes.SceneService;
}
