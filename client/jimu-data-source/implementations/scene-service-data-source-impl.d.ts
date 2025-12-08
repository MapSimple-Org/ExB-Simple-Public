import { DataSourceTypes, type SceneServiceDataSource } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
/**
 * Data source from a scene service, which may contain multiple child data sources.
 */
export declare class SceneServiceDataSourceImpl extends AbstractLayerFolderDataSource implements SceneServiceDataSource {
    type: DataSourceTypes.SceneService;
    getChildIds(): string[];
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    /**
     * If use Layer.fromArcGISServerUrl/Layer.fromPortalItem to create JS API layer for feature service, will return a feature layer if the feature service only contains one layer/table.
     * It causes the feature service data source returns a feature layer as its JS API layer, which is not expected.
     * So we override the method to make sure feature service data source always returns a group layer.
    */
    createJSAPILayerByDataSource(dataSource?: SceneServiceDataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.GroupLayer>;
}
