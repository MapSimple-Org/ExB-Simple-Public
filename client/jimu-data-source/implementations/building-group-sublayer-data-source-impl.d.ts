import { DataSourceTypes, type ServiceDefinition, type BuildingGroupSubLayerDataSource } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
export declare class BuildingGroupSubLayerDataSourceImpl extends AbstractLayerFolderDataSource implements BuildingGroupSubLayerDataSource {
    type: DataSourceTypes.BuildingGroupSubLayer;
    serviceUrl: string;
    layerDefinition: any;
    ready(): Promise<void>;
    fetchServiceDefinition(): Promise<ServiceDefinition>;
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    getChildIds(): string[];
    getSubLayerByChildId(childId: string): __esri.BuildingComponentSublayer | __esri.BuildingGroupSublayer;
    getSubLayerDefinitionByChildId(childId: string): any;
    getDsTypeByLayerType(layerType: string): DataSourceTypes.BuildingSceneLayer | DataSourceTypes.BuildingGroupSubLayer | DataSourceTypes.BuildingComponentSubLayer;
    getSubLayerUrlByChildId(childId: string): string;
}
