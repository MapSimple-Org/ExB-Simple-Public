import { type DataSourceConstructorOptions, DataSourceTypes, type SqlQueryParams, type BuildingSceneLayerDataSource } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
type SubLayer = __esri.BuildingComponentSublayer | __esri.BuildingGroupSublayer;
export interface BuildingSubLayerDataSourceOptions extends DataSourceConstructorOptions {
    serviceUrl?: string;
    layerDefinition?: any;
    layer?: any;
}
export declare class BuildingSceneLayerDataSourceImpl extends AbstractLayerFolderDataSource implements BuildingSceneLayerDataSource {
    type: DataSourceTypes.BuildingSceneLayer;
    layer?: __esri.BuildingSceneLayer;
    constructor(options: any);
    ready(): Promise<any>;
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    getChildIds(): string[];
    getSubLayerByChildId(childId: string): SubLayer;
    getSubLayerDefinitionByChildId(childId: string): any;
    getSubLayerUrlByChildId(childId: string): string;
    getDsTypeByLayerType(layerType: string): DataSourceTypes.BuildingSceneLayer | DataSourceTypes.BuildingGroupSubLayer | DataSourceTypes.BuildingComponentSubLayer;
    updateQueryParams(sqlQueryParams: SqlQueryParams, widgetId: string): void;
}
export {};
