import { type DataSourceFactory, type DataSourceConstructorOptions, type DataSource } from 'jimu-core';
import { FeatureDataRecordImpl } from './support/feature-record-impl';
import { CSVDataSourceImpl } from './implementations/csv-data-source-impl';
import type { FeatureLayerDataSourceConstructorOptions } from './implementations/feature-layer-data-source-impl';
import type { SceneLayerDataSourceConstructorOptions } from './implementations/scene-layer-data-source-impl';
import { FeatureLayerDataSourceImpl } from './implementations/feature-layer-data-source-impl';
import { FeatureServiceDataSourceImpl } from './implementations/feature-service-data-source-impl';
import { GroupLayerDataSourceImpl } from './implementations/group-layer-data-source-impl';
import { MapServiceDataSourceImpl } from './implementations/map-service-data-source-impl';
import { SimpleLocalDataSourceImpl } from './implementations/simple-local-data-source-impl';
import { SceneServiceDataSourceImpl } from './implementations/scene-service-data-source-impl';
import { SceneLayerDataSourceImpl } from './implementations/scene-layer-data-source-impl';
import { MapDataSourceImpl } from './implementations/map-data-source-impl';
import { WebMapDataSourceImpl } from './implementations/webmap-data-source-impl';
import { WebSceneDataSourceImpl } from './implementations/webscene-data-source-impl';
export declare class JimuDataSourceFactory implements DataSourceFactory {
    createDataSource(options: DataSourceConstructorOptions): DataSource;
}
export * from './base-classes/abstract-data-source';
export * from './base-classes/abstract-layer-folder-data-source';
export * from './base-classes/abstract-queriable-data-source';
export * from './base-classes/abstract-arcgis-queriable-data-source';
export * from './support/abstract-data-record';
export * from './mixins/item-mixin';
export * from './mixins/js-api-layer-mixin';
export * from './mixins/set-data-source-mixin';
export * from './utils/arcade-util';
export { FeatureDataRecordImpl, CSVDataSourceImpl, FeatureLayerDataSourceImpl, FeatureServiceDataSourceImpl, GroupLayerDataSourceImpl, MapServiceDataSourceImpl, SimpleLocalDataSourceImpl, SceneServiceDataSourceImpl, SceneLayerDataSourceImpl, MapDataSourceImpl, WebMapDataSourceImpl, WebSceneDataSourceImpl, type FeatureLayerDataSourceConstructorOptions, type SceneLayerDataSourceConstructorOptions };
export default JimuDataSourceFactory;
