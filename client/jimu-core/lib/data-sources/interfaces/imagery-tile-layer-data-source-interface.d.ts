import type { DataSource, ItemMixin, JSAPILayerMixin, DataSourceTypes, TimeInfo, WidgetDataSourcePair, TimeExtent } from './common-data-source-interface';
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service';
export interface ImageryTileLayerTimeParams {
    time?: TimeExtent;
}
export interface GetCurrentTimeParamsOptions {
    exclude?: WidgetDataSourcePair;
}
/**
 * `ImageryTileLayerDataSource`
 * @ignore
 */
export interface ImageryTileLayerDataSource extends DataSource, JSAPILayerMixin, ItemMixin {
    type: DataSourceTypes.ImageryTileLayer;
    layer?: __esri.ImageryTileLayer;
    supportTime: () => boolean;
    getTimeInfo: () => TimeInfo;
    setLayerDefinition: (layerDefinition: ILayerDefinition) => void;
    getLayerDefinition: () => ILayerDefinition;
    updateQueryParams: (query: ImageryTileLayerTimeParams, widgetId: string) => void;
    getCurrentQueryParams: (options?: GetCurrentTimeParamsOptions) => ImageryTileLayerTimeParams;
}
