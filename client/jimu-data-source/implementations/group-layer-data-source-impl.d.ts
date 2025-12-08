import { DataSourceTypes, type GroupLayerDataSource } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
import type { IItem } from '@esri/arcgis-rest-portal';
interface GroupLayerDataSourceConstructorOptions extends LayerFolderChildDataSourceConstructorOptions {
    itemData?: any;
}
/**
 * Data source from group layer in a map service, or group in map viewer/scene viewer, or feature collection item which contains multiple layers.
 * Group layer data source may contain multiple child data sources.
 */
export declare class GroupLayerDataSourceImpl extends AbstractLayerFolderDataSource implements GroupLayerDataSource {
    type: DataSourceTypes.GroupLayer;
    /**
     * If is from map service, will be __esri.Sublayer,
     * if is group in map viewer/scene viewer or feature collection which contains multiple layers, will be __esri.GroupLayer.
     */
    layer?: __esri.GroupLayer | __esri.Sublayer;
    constructor(options: any);
    getChildIds(): string[];
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): GroupLayerDataSourceConstructorOptions;
    /**
     * If use Layer.fromArcGISServerUrl/Layer.fromPortalItem to create JS API layer for feature service, will return a feature layer if the group layer item only contains one layer/table.
     * It causes the group layer data source returns a feature layer as its JS API layer, which is not expected.
     * So we override the method to make sure group layer data source always returns a group layer.
    */
    createJSAPILayerByDataSource(dataSource?: GroupLayerDataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.GroupLayer>;
    private getChildIdsByLayer;
    private getChildIdsByItem;
    private createChildDataSourceOptionsByIdFromLayer;
    private createChildDataSourceOptionsByIdFromItem;
    private createChildDataSourceOptionsByLayerItem;
    private createChildDataSourceJsonByLayerItem;
    private createChildDataSourceOptionsByLayer;
    private createChildDataSourceJsonByLayer;
    private findLayerInfoOfJSAPIGroupLayer;
    private findLayerInfoOfJSAPISubLayer;
    private findLayerInfoOfGroupLayerItem;
    private findLayerInfoOfFeatureCollectionItem;
    private getJSAPISubLayers;
    private getJSAPILayersAndTables;
    private getLayersOfFeatureCollectionItem;
    private getLayersOfGroupLayerItem;
    private getChildIdsByJSAPISubLayer;
    private getChildIdsByJSAPIGroupLayer;
    private getChildIdsByFeatureCollectionItem;
    private getChildIdsByGroupLayerItem;
    protected getChildIdByLayerItem(item: IItem): string;
    private isJSAPIGroupLayer;
    private isFeatureCollectionItem;
}
export {};
