import { type ServiceDefinition, DataSourceTypes, type FeatureServiceDataSource } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
/**
 * Data source from a feature service, which may contain multiple child data sources.
 */
export declare class FeatureServiceDataSourceImpl extends AbstractLayerFolderDataSource implements FeatureServiceDataSource {
    type: DataSourceTypes.FeatureService;
    fetchServiceDefinition(): Promise<ServiceDefinition>;
    getChildIds(): string[];
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    /**
     * If use Layer.fromArcGISServerUrl/Layer.fromPortalItem to create JS API layer for feature service, will return a feature layer if the feature service only contains one layer/table.
     * It causes the feature service data source returns a feature layer as its JS API layer, which is not expected.
     * So we override the method to make sure feature service data source always returns a group layer.
    */
    createJSAPILayerByDataSource(dataSource?: FeatureServiceDataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.GroupLayer>;
}
