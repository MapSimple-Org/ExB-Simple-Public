import type { AbstractArcGISLayerFolderDataSource, DataSourceTypes } from './common-data-source-interface';
/**
 * `GroupLayerDataSource` is created from a group layer of map service or webmap/webscene.
 */
export interface GroupLayerDataSource extends AbstractArcGISLayerFolderDataSource {
    type: DataSourceTypes.GroupLayer;
    /**
     * When add a map service directly, there is no layer instance created.
     * When add a webmap that contains map service, the folder in the map service will be created as `__esri.Sublayer` layer.
     * When add a webmap that contains group layer created in MapViewer, the group will be created as `__esri.GroupLayer` layer.
     */
    layer?: __esri.GroupLayer | __esri.Sublayer;
}
