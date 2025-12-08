import type { AbstractArcGISLayerFolderDataSource, DataSourceTypes } from './common-data-source-interface'

/**
 * `SceneServiceDataSource` is created from scene service or webscene.
 */
export interface SceneServiceDataSource extends AbstractArcGISLayerFolderDataSource {
  type: DataSourceTypes.SceneService

  /**
   * When add a SceneService into a webscene, the SceneViewer does not create SceneService layer, instead it'll create it as a a group layer.
   * So, the `SceneServiceDataSource` does not have `layer` property.
   */
}
