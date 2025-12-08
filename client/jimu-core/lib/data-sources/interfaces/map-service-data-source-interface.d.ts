import type { AbstractArcGISLayerFolderDataSource, DataSourceTypes, TimeInfo, TimeExtent } from './common-data-source-interface';
/**
 * `MapServiceDataSource` is created from map service or webmap/webscene.
 */
export interface MapServiceDataSource extends AbstractArcGISLayerFolderDataSource {
    type: DataSourceTypes.MapService;
    /**
     * When add a map service directly, there is no layer instance created.
     * When add a webmap that contains map service, the map service will be created as `__esri.MapImageLayer` or `__esri.TileLayer` layer.
     */
    layer?: __esri.MapImageLayer | __esri.TileLayer;
    supportTime: () => boolean;
    getTimeInfo: () => TimeInfo;
    /** Get the time extent. */
    getTimeExtent: () => TimeExtent;
    /** Change the time extent for all layers in the service. */
    changeTimeExtent: (time: TimeExtent, widgetId: string) => void;
}
