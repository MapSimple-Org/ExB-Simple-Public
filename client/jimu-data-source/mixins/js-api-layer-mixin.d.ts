import { type IMDataSourceJson, type DataSource, DataSourceTypes, type JSAPILayerMixin, type ArcGISSubLayer } from 'jimu-core';
import type { Constructor } from '../types';
export declare const JSAPILayerMixinImpl: <TBase extends Constructor<DataSource>>(Base: TBase) => {
    new (...args: any[]): {
        id: string;
        type: DataSourceTypes;
        getDataSourceJson: () => IMDataSourceJson;
        layer?: __esri.Layer | ArcGISSubLayer;
        url?: string;
        itemId?: string;
        portalUrl?: string;
        cachedLayer?: __esri.Layer | ArcGISSubLayer;
        _jimuLayerId?: string;
        readonly jimuLayerId: string;
        createJSAPILayerByDataSource(dataSource?: DataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.Layer | ArcGISSubLayer>;
        supportSpatialInfo(): boolean;
        createNewJSAPILayerByDataSource(createdBy: DataSource & JSAPILayerMixin, throwError: boolean): Promise<__esri.Layer | ArcGISSubLayer>;
        setJimuChildIdAsLayerId(layer: __esri.Layer | ArcGISSubLayer, ds: DataSource): void;
        canCacheLayer(createdBy: DataSource & JSAPILayerMixin): boolean;
        getLayerConstructorOptions(createdBy: DataSource & JSAPILayerMixin): {
            url?: string;
            portalItem?: __esri.PortalItemProperties;
            sourceJSON?: any;
            source?: any;
            layerId?: number;
            customParameters?: object;
            outFields?: string[];
        };
        syncQueryParams(layer: __esri.Layer | ArcGISSubLayer, dataSource: DataSource): void;
        afterCreateJSAPILayer(layer: __esri.Layer | ArcGISSubLayer, dataSource: DataSource & JSAPILayerMixin): void;
    };
} & TBase;
