import { type ServiceDefinition, DataSourceTypes, type MapServiceDataSource, type TimeInfo, type TimeExtent } from 'jimu-core';
import { AbstractLayerFolderDataSource, type LayerFolderChildDataSourceConstructorOptions } from '../base-classes/abstract-layer-folder-data-source';
/**
 * Data source from a map service, which may contain multiple child data sources.
 */
export declare class MapServiceDataSourceImpl extends AbstractLayerFolderDataSource implements MapServiceDataSource {
    type: DataSourceTypes.MapService;
    layer?: __esri.MapImageLayer | __esri.TileLayer;
    getChildIds(): string[];
    createChildDataSourceOptionsById(childDsId: string, jimuChildId: string, childId: string): LayerFolderChildDataSourceConstructorOptions;
    fetchServiceDefinition(): Promise<ServiceDefinition>;
    supportTime(): boolean;
    getTimeInfo(): TimeInfo;
    getTimeExtent(): TimeExtent;
    changeTimeExtent(time: TimeExtent, widgetId: string): void;
    changeGDBVersion(gdbVersion: string): void;
    private createChildDataSourceOptionsByIdFromLayer;
    private findSubLayerInfo;
    private getSubLayers;
    private getChildIdsByLayer;
}
