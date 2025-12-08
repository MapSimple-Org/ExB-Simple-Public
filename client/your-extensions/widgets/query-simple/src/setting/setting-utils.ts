import { type SceneLayerDataSource, type FeatureLayerDataSource, DataSourceTypes, type BuildingComponentSubLayerDataSource } from 'jimu-core'

export const getOutputJsonOriginDs = (ds: SceneLayerDataSource | FeatureLayerDataSource | BuildingComponentSubLayerDataSource): FeatureLayerDataSource => {
  if (!ds) {
    return null
  }

  if (ds.type === DataSourceTypes.SceneLayer || ds.type === DataSourceTypes.BuildingComponentSubLayer) {
    /**
     * If is scene layer data source, will use associated feature layer data source to generate output data source.
     */
    return ds.getAssociatedDataSource()
  } else {
    return ds
  }
}
