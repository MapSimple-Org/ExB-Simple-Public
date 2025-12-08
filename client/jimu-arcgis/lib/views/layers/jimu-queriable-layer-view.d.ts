import { type DataSource, type ArcGISQueriableDataSource, type IMDataSourceInfo, type ArcGISQueryParams, type FeatureDataRecord, DataSourceSelectionMode, type IMArcGISQueryParams } from 'jimu-core';
import { JimuLayerView, type JimuLayerViewConstructorOptions } from './jimu-layer-view';
import type { IFeature } from '@esri/arcgis-rest-feature-service';
type ClientQueryType = 'feature' | 'id' | 'count' | 'extent';
type SupportedLayerType = __esri.FeatureLayer | __esri.SceneLayer | __esri.BuildingComponentSublayer | __esri.ImageryLayer | __esri.OrientedImageryLayer | __esri.SubtypeGroupLayer | __esri.SubtypeSublayer;
type SupportedLayerViewType = __esri.FeatureLayerView | __esri.SceneLayerView | __esri.BuildingComponentSublayerView | __esri.ImageryLayerView;
/**
 * `JimuQueriableLayerView` constructor options.
 */
export interface JimuQueriableLayerViewOptions extends JimuLayerViewConstructorOptions {
    /**
     * layer may be one of the following types: `FeatureLayer`, `SceneLayer`, `BuildingComponentSublayer`, `ImageryLayer`, `OrientedImageryLayer`, `SubtypeGroupLayer` or `SubtypeSublayer`.
     */
    layer: SupportedLayerType;
}
interface ClientQueryFeaturesResult {
    success: boolean;
    data: __esri.FeatureSet;
    hasFullGeometry: boolean;
}
interface ClientQueryObjectIdsResult {
    success: boolean;
    data: number[];
}
interface ClientQueryFeatureCountResult {
    success: boolean;
    data: number;
}
interface ClientQueryExtentResult {
    success: boolean;
    data: {
        count: number;
        extent: __esri.Extent;
    };
}
/**
 * `JimuQueriableLayerView` is an abstract class, which is the base class of the following classes:
 * `JimuFeatureLayerView`, `JimuSceneLayerView`, `JimuBuildingComponentSublayerView`, `JimuImageryLayerView`, `JimuOrientedImageryLayerView`, `JimuSubtypeGroupLayerView` and `JimuSubtypeSublayerView`.
 * `JimuQueriableLayerView` is the wrapper of queryable layers. A queryable layer is a layer that can query features, having a specific `JimuQueriableLayerView` and `ArcGISQueriableDataSource` corresponding to it.
 * `JimuQueriableLayerView` is used to synchronize state with `ArcGISQueriableDataSource`. For example, `FeatureLayer` is corresponding to `JimuFeatureLayerView` and `FeatureLayerDataSource`.
 * When a widget updates the feature selection of `FeatureLayerDataSource`, `JimuFeatureLayerView` will highlight these selected features on the map.
 */
export declare class JimuQueriableLayerView extends JimuLayerView {
    view: SupportedLayerViewType;
    private highLightHandle;
    private highLightLayerCreationPromise;
    /**
     * highlightFeatureLayer is used highlight layer in MapService, it is a client-side FeatureLayer.
     */
    private highlightFeatureLayer;
    private highlightFeatureLayerView;
    private isHighlightFeatureLayerDirty;
    private popupSelectFeatureWatchHandle;
    private popupVisibleWatchHandle;
    private layerVisibleWatchHandle;
    private highlightOptionsWatchHandle;
    /** @ignore */
    protected localDefinitionExpression: string;
    /** @ignore */
    private readonly originalGdbVersion;
    private selectQueryPromise;
    private selectByQueryAbortController;
    private selectByQueryProgress;
    private latestHighlightIds;
    constructor(options: JimuQueriableLayerViewOptions);
    ready(): Promise<this>;
    destroy(): void;
    private isFeatureLayer;
    private isSceneLayer;
    private isBuildingComponentSublayer;
    private isImageryLayer;
    private isOrientedImageryLayer;
    private isSubtypeGroupLayer;
    /**
     * @ignore
     */
    getSelectedFeatureCount(): number;
    /**
     * Get selected features of current JimuLayerView.
     */
    getSelectedFeatures(): Promise<__esri.Graphic[]>;
    private getApiGraphicsByRecordFeatures;
    /**
     * This method should only be called when DataSource not exists.
     * @ignore
     */
    private querySelectedFeaturesFromClient;
    /**
     * Query features from client view.
     * The layer view does not provide queryFromServer. When you need to query from server, use the data source.
     * @param query
     */
    private queryFeaturesFromClient;
    private queryFeaturesFromClientHighlightLayer;
    /********************
     * The layer view provides some selection methods:
     * * selectFeatureById
     * * selectFeaturesByIds
     * * selectFeaturesByQuery
     *
     * What the selection does is: it will highlight the feature. If the layer view has related data source, the related data records will be selected as well.
     ******************/
    /**
     * When selecting a feature by ID, we can pass in the data source record so when the selected records are not loaded in data source, we can add them in.
     * However, if the record is not loaded and is not passed in, there will be no selection.
     * If we can get the layer data source, the record can be a FeatureDataRecord or a Graphic. Otherwise, the record can only be a Graphic.
     */
    selectFeatureById(id: number, record?: FeatureDataRecord | __esri.Graphic): Promise<void>;
    /**
     * See `selectFeatureById` for more details.
     */
    selectFeaturesByIds(ids: number[], records?: FeatureDataRecord[]): Promise<void>;
    protected beforeSelectFeaturesByQuery(query: ArcGISQueryParams): ArcGISQueryParams;
    /**
     * Select features from the layer. If the last select operation has not been completed, calling this method will automatically terminate the previous selection progress.
     * @param query The query parameters.
     * @param selectionMode This parameter is to indicate how the new select operation affects the original selection. It can only be the following enumeration values: `New`, `AddToCurrent`, `RemoveFromCurrent`, or `SelectFromCurrent`.
     * @returns
     */
    selectFeaturesByQuery(query: ArcGISQueryParams, selectionMode: DataSourceSelectionMode): Promise<Array<(__esri.Graphic | IFeature)>>;
    /**
     * @ignore
     * @param updateSelection If true, JimuLayerView will update selection by the partial queried features, otherwise JimuLayerView don't update selection.
     */
    cancelSelectByQuery(updateSelection: boolean): Promise<void>;
    private isFreshAbortController;
    protected getOrCreateLocalDataSource(localDsId: string): Promise<ArcGISQueriableDataSource>;
    /**
     * @ignore
     */
    getSelectQueryProgress(): number;
    private setSelectQueryProgress;
    /**
     * @ignore
     *
     * The promise resolves an __esri.Query instance if client query is ready to use, otherwise resolves null.
     * Need to make sure this method resolves true before call clientQueryFeatures(), clientQueryObjectIds() and clientQueryFeatureCount().
     * @param queryParams
     */
    whenClientQueryReady(queryParams: IMArcGISQueryParams, queryType: ClientQueryType): Promise<__esri.Query>;
    private checkGeometryForClientQuery;
    private updateLayerOutFieldsForClientQuery;
    /**
     * @ignore
     * This method will resolve when this.view.updating is false.
     */
    whenCurrentLayerViewNotUpdating(): Promise<void>;
    /**
     * This method will resolve when this.highlightFeatureLayerView.updating is false.
     */
    private whenHighlightLayerViewNotUpdating;
    /**
     * This method will resolve when layerView.updating is false.
     */
    private whenLayerViewNotUpdating;
    /**
     * @ignore
     *
     * Executes a Query against features available for drawing in the layerView and returns a FeatureSet.
     * Note, this method never rejects, so need to check result.success to determine whether the client query is successful.
     * @param queryParams
     */
    clientQueryFeatures(queryParams: IMArcGISQueryParams): Promise<ClientQueryFeaturesResult>;
    /**
     * @ignore
     *
     * Executes a Query against features available for drawing in the layerView and returns array of the ObjectIDs of features that satisfy the input query.
     * Note, this method never rejects, so need to check result.success to determine whether the client query is successful.
     * @param queryParams
     */
    clientQueryObjectIds(queryParams: IMArcGISQueryParams): Promise<ClientQueryObjectIdsResult>;
    /**
     * @ignore
     *
     * Executes a Query against features available for drawing in the layerView and returns the number of features that satisfy the query.
     * Note, this method never rejects, so need to check result.success to determine whether the client query is successful.
     * @param queryParams
     */
    clientQueryFeatureCount(queryParams: IMArcGISQueryParams): Promise<ClientQueryFeatureCountResult>;
    /**
     * @ignore
     *
     * Executes a Query against features available for drawing in the layerView and returns the Extent of features that satisfy the query.
     * Note, this method never rejects, so need to check result.success to determine whether the client query is successful.
     * @param queryParams
     */
    clientQueryExtent(queryParams: IMArcGISQueryParams): Promise<ClientQueryExtentResult>;
    private getApiQueryForClientQuery;
    /**
     * Determine whether it is empty sql.
     * '' => true
     * '1=1' => true
     * '(1=1)' => true
     * '((1=1))' => true
     * 'OBJECTID = 1' => false
     * @param sql
     */
    private isSqlEmpty;
    /**
     * Sets the definitionExpression on the layer and the view, but does not apply the definitionExpression to the data source.
     */
    setDefinitionExpression(localDefinitionExpression: string): void;
    protected validateDataSource(layerDs: DataSource): boolean;
    getLayerDataSource(): ArcGISQueriableDataSource;
    createLayerDataSource(): Promise<ArcGISQueriableDataSource>;
    /**
     * @ignore
     */
    getOrCreateLayerDataSource(): Promise<ArcGISQueriableDataSource>;
    /**
     * @ignore
     */
    getHighlightLayerLayer(): __esri.FeatureLayer;
    private getExcludePairsForBuildingExplorer;
    private getCurrentQueryParamsWithoutBuildingExplorer;
    protected shouldWatchMapViewRestore(): boolean;
    private watchMapViewRestore;
    private readonly onMapViewRestore;
    /**
     * Even the data source instance is not created, this method will still be invoked if the info changed.
     */
    protected onLayerDataSourceInfoChange(preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo): void;
    protected shouldWatchPopupSelectFeature(): boolean;
    /**
     * popup.features maybe come from clicking map, or maybe come from exb feature selection.
     * JimuQueriableLayerView focuses on clicking map case.
     * JimuMapView focuses on exb feature selection case.
     */
    private watchPopupSelectFeature;
    private releasePopupVisibleWatchHandle;
    private watchPopupVisible;
    /**
     * @ignore
     */
    isPopupSelectCurrentLayerFeature(): boolean;
    protected shouldUsePopupSelectedFeatureToUpdateSelection(): boolean;
    /**
     * @ignore
     */
    onParentLayerVisibleChange(parentNewVisible: boolean): void;
    private watchLayerVisible;
    private onLayerFinalVisibleChange;
    private watchHighlightOptions;
    protected getLayerFromFeature(feature: __esri.Graphic): any;
    private setRefreshIntervalForLayer;
    protected getLocalDefinitionExpressionToMerge(): string;
    /**
     * @ignore
     */
    setDefinitionExpressionToLayer(): Promise<void>;
    private refreshLayer;
    /**
     * Highlight features by dataSourcesInfo[this.layerDataSourceId].selectedIds
     * @param selectedIds
     */
    private updateHighlightBySelectedIds;
    private highLightSelectedRecords;
    /**
     * For MapService sub layer, we need to create a layer for highlight.
     */
    private tryCreateHighLightFeatureLayer;
    private addFeaturesToHighlightFeatureLayer;
    private removeFeaturesFromHighlightFeatureLayer;
    /**
     * @ignore
     */
    highlightFeatureById(id: number): void;
    /**
     * The ids.length must > 0
     */
    private highLightFeatures;
    private queryRasterFeatures;
    private clearHighLight;
    protected shouldClosePopupWhenClearHighlight(): boolean;
    private releaseHighLightHandle;
    private onSelectedFeaturesChange;
    private getSelectedRecordIds;
    /** @ignore */
    private getObjectIdField;
    private getHighlightOptions;
    private getRendererForHighlightLayer;
}
export {};
