import { type ImmutableObject, type IMDataSourceJson, DataSourceTypes, type SubtypeGroupLayerDataSource, type SubtypeSublayerDataSource, type ArcGISSubtypeSublayer, type ArcGISQueryParams, type FeatureDataRecord, type ArcGISSelectOptions, type IMExportOptions } from 'jimu-core';
import { AbstractArcGISQueriableDataSource } from '../base-classes/abstract-arcgis-queriable-data-source';
import type { ILayerDefinition } from '@esri/arcgis-rest-feature-service';
export declare class SubtypeSublayerDataSourceImpl extends AbstractArcGISQueriableDataSource implements SubtypeSublayerDataSource {
    type: DataSourceTypes.SubtypeSublayer;
    parentDataSource: SubtypeGroupLayerDataSource;
    ready(): Promise<any>;
    getSubtypeCode(): number;
    getSubtypeField(): string;
    protected jsAPILayerQueryObjectIds(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeSublayer | __esri.FeatureLayer): Promise<Array<number | string>>;
    protected jsAPILayerQueryFeatures(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeSublayer | __esri.FeatureLayer): Promise<__esri.FeatureSet>;
    protected jsAPILayerQueryExtent(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeSublayer | __esri.FeatureLayer): Promise<{
        count: number;
        extent: __esri.Extent;
    }>;
    protected jsAPILayerQueryFeatureCount(query: __esri.Query | __esri.QueryProperties, layer?: ArcGISSubtypeSublayer | __esri.FeatureLayer): Promise<number>;
    selectRecordsByIds(ids: string[], records?: FeatureDataRecord[], updateParent?: boolean): void;
    protected copySelectionToDataView(selection: FeatureDataRecord[], updateParent?: boolean): void;
    updateQueryParams(query: ArcGISQueryParams, widgetId: string): void;
    setDataSourceJson(dsJson: IMDataSourceJson): void;
    setLayerDefinition(layerDef: ILayerDefinition): void;
    getRemoteQueryParams(considerParent?: boolean): ArcGISQueryParams;
    getRuntimeQueryParams(excludeWidgetIds?: string | string[], considerParent?: boolean): ArcGISQueryParams;
    protected getRuntimeQueryParamsWithSpecificWidgetQueries(excludeWidgetIds: string | string[], widgetQueries: ImmutableObject<{
        [widgetId: string]: ArcGISQueryParams;
    }>, considerParent?: boolean): ArcGISQueryParams;
    protected changeSelectionInUrl(options: ArcGISSelectOptions): void;
    get layer(): ArcGISSubtypeSublayer;
    set layer(l: ArcGISSubtypeSublayer);
    ensureWhereClauseMatchesSubtype(whereClause: string | null): string;
    allowToExportData(): Promise<boolean>;
    getExportOptions(): IMExportOptions;
    /**
     * Will create a JS API subtype group layer which only contains one sublayer and return the sublayer.
     * It is to make sure the sublayer has full query functions. The sublayer depends on its group layer to do query in the JS API source codes.
     * The reason why we can't use the group layer in the parent data source is we need to make sure the created layers are not shared.
     */
    createJSAPILayerByDataSource(dataSource?: SubtypeSublayerDataSource, useDataSourceQueryParams?: boolean, throwError?: boolean): Promise<__esri.SubtypeSublayer | __esri.FeatureLayer>;
}
