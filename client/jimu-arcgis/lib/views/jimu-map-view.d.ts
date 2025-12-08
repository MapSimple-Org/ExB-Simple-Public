import { JimuMapViewStatus, type DataSource, type DataRecordSet, type ArcGISSubLayer, WidgetState, type DataSourceSelectionMode, type MapDataSource } from 'jimu-core';
import type { ISpatialReference } from '@esri/arcgis-rest-feature-service';
import { JimuLayerView } from './layers/jimu-layer-view';
import { JimuFeatureLayerView } from './layers/jimu-feature-layer-view';
import { JimuSceneLayerView } from './layers/jimu-scene-layer-view';
import { MapViewManager } from '../mapview-manager';
import type { JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol } from 'jimu-ui/advanced/map';
import type { JimuMapViewGroup } from './jimu-map-view-group';
import type { IFeature } from '@esri/arcgis-rest-request';
export declare enum ActionType {
    DataAction = "DATA_ACTION",
    MessageAction = "MESSAGE_ACTION"
}
export interface SymbolOption {
    pointSymbol?: JimuPointSymbol;
    polylineSymbol?: JimuPolylineSymbol;
    polygonSymbol?: JimuPolygonSymbol;
}
export interface MapMutableState {
    /**
     * Data stored for ShowOnMap message action and data action. It contains records data, not data source.
     */
    showOnMapDatas?: ShowOnMapDatas;
    /**
     * Data stored for AddToMap message action and data action. It contains data source, not records data.
     */
    addToMapDatas?: AddToMapDatas;
    /**
     * Stores layer ids info that can be deleted in Map's clear-data tool.
     */
    removeableLayerIdsInfo?: RemoveableLayerIdsInfo;
}
export interface TitleCountInfo {
    count: number;
    rawTitle: string;
    finalTitle: string;
}
export interface ShowOnMapData {
    mapWidgetId: string;
    messageWidgetId: string;
    jimuMapViewId: string;
    dataSet: DataRecordSet;
    title: string;
    type: ActionType;
    symbolOption?: SymbolOption;
    isOperationalLayer: boolean;
    titleCountInfo: TitleCountInfo;
}
export interface ShowOnMapDatas {
    [layerId: string]: ShowOnMapData;
}
export declare enum DataChangeType {
    Create = "CREATE",
    Creating = "CREATING",
    Created = "CREATED",
    Remove = "REMOVE"
}
export declare enum DataChangeStatus {
    Fulfilled = "FULFILLED",
    Pending = "PENDING",
    Rejected = "REJECTED",
    RejectedAndKnown = "REJECTEDANDKNOWN"
}
export interface AddToMapData {
    mapWidgetId: string;
    messageWidgetId: string;
    jimuMapViewId: string;
    dataSourceId: string;
    title: string;
    type: ActionType;
    dataChangeType: DataChangeType;
    dataChangeStatus: DataChangeStatus;
}
export interface AddToMapDatas {
    [layerId: string]: AddToMapData;
}
export interface RemoveableLayerIdsInfo {
    [jimuMapViewId: string]: string[];
}
export interface MarkerGroup {
    configSymbolJson?: any;
    symbol: __esri.SymbolUnion;
    graphics: __esri.Graphic[];
}
export interface MarkerLayer extends __esri.GraphicsLayer {
    __exbMarkerGroups: MarkerGroup[];
}
export interface MarkerPointUrlParam {
    coordinates: number[];
    title?: string;
    label?: string;
}
export interface MarkerGroupUrlParam {
    wkid: number | string;
    symbol?: any;
    points: MarkerPointUrlParam[];
}
export type MarkerUrlParam = MarkerGroupUrlParam[];
export type SnappingLayer = __esri.BuildingSceneLayer | __esri.CSVLayer | __esri.FeatureLayer | __esri.GeoJSONLayer | __esri.GraphicsLayer | __esri.MapNotesLayer | __esri.SceneLayer | __esri.SubtypeSublayer | __esri.WFSLayer;
/**
 * A MapTool is a ArcGIS JavaScript API widget instance or map component used in map widget.
 */
export interface JimuMapTool {
    /** The tool name, use the ArcGIS JavaScript API class name. */
    name: string;
    /** The instance of ArcGIS JavaScript API class or map component */
    instance: __esri.Widget | HTMLArcgisHomeElement | HTMLArcgisZoomElement | HTMLArcgisLocateElement | HTMLArcgisCompassElement | HTMLArcgisScaleBarElement | HTMLArcgisLayerListElement | HTMLArcgisLegendElement | HTMLArcgisSearchElement | HTMLArcgisBasemapGalleryElement | HTMLArcgisNavigationToggleElement;
}
/**
 * `JimuMapViewConstructorOptions` is used in the constructor of the `JimuMapView`, to initiate a `JimuMapView` instance.
 */
export interface JimuMapViewConstructorOptions {
    /**
     * The widget id to create the `JimuMapView` instance.
     */
    mapWidgetId: string;
    /**
     * The `isActive` property indicates whether the map in the map widget is accessible.
     * For example, for a single-source map, there is a single `JimuMapView` instance, therefore, the `isActive` is always true.
     * With a multi-source map, there are two JimuMapView instances. In the multi-source map, the property `isActive` is true for the top `JimuMapView` instance,
     * and false for the one beneath. Upon clicking the switch map tool, the `isActive` properties will switch.
     */
    isActive?: boolean;
    /**
     * The `dataSourceId` is the id of the selected data source to create the map.
     */
    dataSourceId: string;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript View](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html), including a
     * [`MapView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html) or a
     * [`SceneView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html). In the ArcGIS Maps SDK for JavaScript,
     * the `MapView` and `SceneView` are part of the `__esri` namespace types. Thus, their types are `__esri.MapView` and `__esri.SceneView`.
     */
    view: __esri.MapView | __esri.SceneView;
    /**
     * The `isEnablePopup` property indicates whether to display popups when features in the `view` are clicked.
     */
    isEnablePopup?: boolean;
    /** Pass MapViewManager in to avoid circular dependency. */
    mapViewManager: MapViewManager;
    /**
     * @ignore
     * The `useUrlHashLayersVisibility` property indicates whether the map uses the url hash layer visibility or not.
     */
    useUrlHashLayersVisibility?: boolean;
}
export interface JimuLayerViews {
    [jimuLayerViewId: string]: JimuLayerView;
}
export interface JimuTables {
    [jimuTableId: string]: __esri.Layer;
}
export interface JimuTable {
    jimuTableId: string;
    table: __esri.Layer;
}
export interface UnparsedViewUrlParams {
    active_datasource_id?: string;
    viewpoint?: string;
    center?: string;
    scale?: string;
    level?: string;
    rotation?: string;
}
export interface UnparsedMapUrlParams extends UnparsedViewUrlParams {
    layer_visibility?: string;
    marker?: string;
}
export interface UrlHashLayersVisibility {
    [jimuLayerViewId: string]: boolean;
}
export type PersistentMapState = Omit<UnparsedMapUrlParams, 'marker'>;
type JimuMapViewCacheListener = (jimuMapView: JimuMapView) => void;
type JimuMapViewRestoreListener = (jimuMapView: JimuMapView) => void;
type JimuLayerViewSelectedFeaturesChangeListener = (jimuLayerView: JimuLayerView) => void;
type SelectByQueryProgressChangeListener = (progress: number) => void;
export type JimuLayerViewCreatedListener = (jimuLayerView: JimuLayerView) => void;
export type JimuLayerViewRemovedListener = (jimuLayerView: JimuLayerView) => void;
export type JimuLayerViewsVisibleChangedListener = (jimuLayerViews: JimuLayerView[]) => void;
/**
 * `JimuMapView` is the `view` for developers to develop the map-related functions.
 * For example, developers can use the `view` property of the `JimuMapView` instance to get the original [ArcGIS Maps SDK for JavaScript `View`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html),
 * then use the original `view` to develop the map-related functions. At the same time, `JimuMapView` also provides
 * properties such as `isActive` and `status` to indicate the current status in the map widget.
 *
 * `JimuMapView` is a wrapper class for the ArcGIS Maps SDK for JavaScript [`View`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html).
 * It is created by a map widget using a map [`DataSource`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSource).
 *
 * ```typescript
 * import { JimuMapView } from 'jimu-arcgis';
 *
 * // Add the State interface
 * interface State {
 *  extent: __esri.Extent
 * }
 *
 * // On an active view change, set the extent State property
 * onActiveViewChange = (jimuMapView: JimuMapView) => {
 *  if(!this.extentWatch){
 *   this.extentWatch = jimuMapView.view.watch('extent', extent => {
 *     this.setState({
 *       extent
 *     })
 *   });
 *  }
 * }
 *
 * // Use the `JimuMapView` instance from the map widget through the `JimuMapViewComponent` React component
<JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds[0]} onActiveViewChange={this.onActiveViewChange}></JimuMapViewComponent>
 * ```
 *
 */
export declare class JimuMapView {
    /**
     * The id of the `JimuMapView` instance.
     */
    id: string;
    /**
     * The id of the widget creating the `JimuMapView` instance.
     */
    mapWidgetId: string;
    /**
     * The `isActive` property indicates whether the map in the map widget is accessible.
     * For example, for a single-source map, there is a single `JimuMapView` instance, therefore, the `isActive` is always true.
     * With a multi-source map, there are two `JimuMapView` instances. In the multi-source map, the property `isActive` is true for the top `JimuMapView` instance,
     * and false for the one beneath. Upon clicking the switch map tool, the `isActive` properties will switch.
     */
    isActive?: boolean;
    /**
     * The id of the `DataSource` selected to create the map.
     */
    dataSourceId: string;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `View`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html), including a
     * [`MapView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html) or a
     * [`SceneView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-SceneView.html). In the ArcGIS Maps SDK for JavaScript,
     * the `MapView` and `SceneView` are part of the `__esri` namespace types. Thus, their types are `__esri.MapView` and `__esri.SceneView`.
     */
    view: __esri.MapView | __esri.SceneView;
    /**
     * The status of the `JimuMapView` instance. `JimuMapViewStatus` enumeration members include `"LOADING"`, `"LOADED"` and `"FAILED"`.
     */
    status: JimuMapViewStatus;
    /**
     * The union for all `JimuLayerView` instances and the layer view object wrapper.
     * the JimuLayerView instance in this object may not been loaded. Please call `whenJimuLayerViewLoaded()` to wait for it's loaded.
     */
    jimuLayerViews?: JimuLayerViews;
    jimuTables: JimuTables;
    private readonly jimuTableArray;
    /** The created map tools (ArcGIS JavaScript API widgets or map components) for this view. */
    jimuMapTools: JimuMapTool[];
    private clickHighlightEnabled;
    private jimuMapViewLoadPromise;
    private jimuLayerViewLoadPromises;
    private showOnMapDatas;
    private readonly mapViewManager;
    private cacheListeners;
    private restoreListeners;
    private selectedFeaturesChangeListeners;
    private jimuLayerViewCreatedListeners;
    private jimuLayerViewRemovedListeners;
    private jimuLayerViewsVisibleChangedListeners;
    private selectByQueryProgressChangeListeners;
    private watchHandles;
    private watchBeforeAddLayerHandle;
    private watchAfterAddLayerHandle;
    private watchAfterRemoveLayerHandle;
    private watchPopupHandle;
    private watchPopupActionHandle;
    private watchPopupFeaturesHandle;
    private watchPopupSelectedHandle;
    private popupFeaturesFromSelection;
    private showPopupUponSelection;
    private mapWidgetState;
    private urlHashLayersVisibility;
    private forcePopupEnabledLayers;
    private storeUnsubscribes;
    /**
     * @ignore
     */
    jimuMapViewGroup: JimuMapViewGroup;
    private mapClickCount;
    private readonly finalLayerVisibles;
    private markerLayer;
    private ignoreUpdatePersistentMapState;
    constructor(options: JimuMapViewConstructorOptions);
    private watchLayersChange;
    private releaseWatchLayerChangeHandles;
    private getRootAncestorLayer;
    private watchPopup;
    /**
     * popup.features maybe come from clicking map, or maybe come from exb feature selection.
     * JimuQueriableLayerView focuses on clicking map case.
     * JimuMapView focuses on exb feature selection case.
     */
    private watchPopupFeaturesAndSelectedFeature;
    /**
     * This method is called when any layer selection changes.
     * @param triggedJimuLayerView The JimuLayerView instance which selection changes.
     * @param triggedByClear Whether the selection changes is triggered by clear the selection of JimuLayerView.
     */
    private handlePopupOnSelectionChange;
    private isFeaturePopupEnabledByCurrentMapPopupSetting;
    /**
     * This method is used to update popup.features when layer selection changes.
     * This method is only called when showPopupUponSelection option enabled and map is not in active state.
     * @param triggedJimuLayerView The JimuLayerView instance which selection changes.
     * @param triggedByClear Whether the selection changes is triggered by clear the selection of JimuLayerView.
     */
    private updatePopupFeaturesWhenSelectionChange;
    /**
     * @ignore
     */
    openPopup(features: __esri.Graphic[]): void;
    /**
     * @ignore
     * Close popup and make sure popup.features is empty.
     */
    closePopup(): void;
    private isAutoShowPopupWhenSelectFeatures;
    /**
     * @ignore
     */
    setShowPopupUponSelection(showPopupUponSelection: boolean): void;
    /**
     * @ignore
     */
    isPopupFeaturesFromSelection(): boolean;
    /**
     * Get all selected features in the map.
     */
    getSelectedFeatures(): Promise<__esri.Graphic[]>;
    /**
     * @ignore
     */
    getSelectedFeatureCount(): number;
    addJimuMapTool(tool: JimuMapTool): void;
    deleteJimuMapTool(toolName: string): void;
    enableClickOpenPopup(): void;
    disableClickOpenPopup(): void;
    isClickOpenPopupEnabled(): boolean;
    enableClickHighlight(): void;
    disableClickHighlight(): void;
    isClickHighlightEnabled(): boolean;
    setIsActive(isActive: boolean): void;
    setMapWidgetState(widgetState: WidgetState): void;
    isMapWidgetActive(): boolean;
    private initView;
    private onClick;
    /**
     * This method will return the dataSourceIds that will publish selection-change message with empty records.
     * @returns
     */
    private getLayerDataSourceIdsWithSelection;
    private publishEmptySelectionChangeMessage;
    private selectDataSourceOrFeatureByFeatures;
    private isMapServiceLayerPopupEnabled;
    private tryIdentifyClickedFeature;
    /**
     * Get the map data source bound to JimuMapView.
     */
    getMapDataSource(): MapDataSource;
    /**
     * Get matched JimuLayerView from current map by other map's layer.
     * @param targetLayer targetLayer maybe come from current map, maybe come from other map
     */
    private getJimuLayerViewByThisOrOtherMapAPILayer;
    /**
     * Get JimuLayerView by ArcGIS Maps SDK for JavaScript [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) or [Sublayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * @param layerOrSubLayer ArcGIS Maps SDK for JavaScript Layer or Sublayer
     */
    getJimuLayerViewByAPILayer(layerOrSubLayer: __esri.Layer | ArcGISSubLayer): JimuLayerView;
    private readonly getJimuLayerViewIdByJimuLayerId;
    /**
     * Get jimuLayerViewId by ArcGIS Maps SDK for JavaScript [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) or [Sublayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * @param layerOrSubLayer ArcGIS Maps SDK for JavaScript Layer or Sublayer
     */
    getJimuLayerViewIdByAPILayer: (layerOrSubLayer: __esri.Layer | ArcGISSubLayer) => any;
    /**
     * Get JimuLayerView by dataSourceId.
     * @param dataSourceId data source id
     */
    getJimuLayerViewByDataSourceId(dataSourceId: string): JimuLayerView;
    /**
     * Get dataSourceId by ArcGIS Maps SDK for JavaScript [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) or [Sublayer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-support-Sublayer.html).
     * @param layerOrSubLayer ArcGIS Maps SDK for JavaScript Layer or Sublayer
     */
    getDataSourceIdByAPILayer(layerOrSubLayer: __esri.Layer | ArcGISSubLayer): string;
    private clearAllJimuLayerViewsSelectRecord;
    private addJimuLayerView;
    /**
     * Resolve the JimuMapView when it is loaded.
     */
    whenJimuMapViewLoaded(): Promise<JimuMapView>;
    /**
     * Return the JimuLayerView when it's loaded.
     *
     * For a JimuLayerView id, the instance may not have been created, but we can make sure the first level JimuLayerView are created.
     * So, for a JimuLayerView id, we'll make sure its parent JimuLayerView get created and ready, and the JimuLayerView will create its children JimuLayerViews in the ready().
     */
    whenJimuLayerViewLoaded(jimuLayerViewId: string): Promise<JimuLayerView>;
    /** @see whenJimuLayerViewLoaded, but use data source  */
    whenJimuLayerViewLoadedByDataSource(ds: DataSource): Promise<JimuLayerView>;
    private makeSureParentLayerViewsLoaded;
    /**
     * Return the loaded JimuLayerViews only.
     */
    whenAllJimuLayerViewLoaded(): Promise<JimuLayerViews>;
    /**
     * Give a parent JimuLayerView id, will load all of its children JimuLayerViews.
     * For failed JimuLayerViews, we'll catch the error but they don't stop others.
     */
    private whenChildJimuLayerViewLoaded;
    /**
     * Return all loaded JimuLayerViews. This method will sort JimuLayerViews by layer rendering order.
     * JimuLayerViews are created and loaded asynchronously. If you want to get all JimuLayerViews in the map, you need to call this method after `jimuMapView.whenAllJimuLayerViewLoaded()` resolves.
     */
    getAllJimuLayerViews(): JimuLayerView[];
    /**
     * Return all parent JimuLayerViews.
     */
    getParentJimuLayerViews(jimuLayerViewId: string): JimuLayerView[];
    /**
     * Return all child JimuLayerViews.
     */
    getAllChildJimuLayerViews(jimuLayerViewId: string): JimuLayerView[];
    /**
     * Return the direct child JimuLayerViews.
     * @param jimuLayerViewId
     */
    getChildJimuLayerViews(jimuLayerViewId: string): JimuLayerView[];
    /**
     * Return the direct child JimuLayerView ids.
     */
    getChildJimuLayerViewIds(jimuLayerViewId: any): string[];
    private findChildLayerView;
    /**
     * Sort JimuLayerViews by layer rendering order. This method does not change the `jimuLayerViews` parameter, but returns a new sorted array.
     * @param jimuLayerViews The JimuLayerView array that need to be sorted.
     */
    sortJimuLayerViewsByLayerOrder(jimuLayerViews: JimuLayerView[]): JimuLayerView[];
    /**
     * Start to create JimuLayerViews
     * This method does not promise all layer views are created, but it promises the first level are created.
     */
    private startCreateJimuLayerViews;
    /**
     * @ignore
     * Create the JimuLayerView and add it into the jimuLayerViews object. Resolve the promise when it is ready.
     *
     * @param layerOrSubLayer the layer can be a Layer or a SubLayer
     * @param parentJimuLayerId the layer's parent JimuLayer ID
     * @param index layer index
     * @param runtimeAddedDataSource Optional, the layer data source added at runtime.
     * @param fromRuntime Optional, true means the JimuLayerView is created from runtime. e.g. The JimuLayerView is created by AddData widget at runtime. false means the layer is a builtin layer of WebMap or WebScene.
     */
    createJimuLayerView(layerOrSubLayer: __esri.Layer | ArcGISSubLayer, parentJimuLayerId: string, index: number, runtimeAddedDataSource?: DataSource, fromRuntime?: boolean, isRootRuntimeLayer?: boolean): Promise<JimuLayerView>;
    private whenLayerView;
    private onStoreChange;
    /**
     * Return all JimuTables. This method should be called after `jimuMapView.whenJimuMapViewLoaded()` resolves.
     */
    getJimuTables(): JimuTable[];
    private createJimuTablesAndWatchTableDataSourcesInfoChange;
    private onTableDataSourceInfoChange;
    /**
     * Clear the selected features.
     */
    clearSelectedFeatures(): void;
    /**
     * Select features in all layers in the map by a graphic.
     * @param graphic This is the [ArcGIS Maps SDK for JavaScript `Graphic`](https://developers.arcgis.com/javascript/latest/api-reference/esri-Graphic.html).
     * @param spatialRelationship This parameter defines the spatial relationship to query features in the layer, see details [here](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-support-Query.html#spatialRelationship).
     * @param selectionMode This parameter is to indicate how the new select operation affects the original selection. It can only be the following enumeration values: `New`, `AddToCurrent`, `RemoveFromCurrent`, or `SelectFromCurrent`.
     * @param options If options.returnAllFields is true, the returned features will contain all fields, otherwise the value will contain the necessary fields. If options.returnFullGeometry is true, the returned features will have full precision geometry.
     *        By default, the spatial reference of the returned features is the same as the layer's spatial reference, but you can change this behavior by setting options.outSR.
     *        By default, this method selects all eligible JimuLayerViews in the map. If you only want to select some specific JimuLayerViews, you can set options.filterJimuLayerView, which is a callback function. If the return value is true, it will be selected, otherwise it will not be selected.
     * */
    selectFeaturesByGraphic(graphic: __esri.Graphic, spatialRelationship: string, selectionMode: DataSourceSelectionMode, options?: {
        returnAllFields?: boolean;
        returnFullGeometry?: boolean;
        outSR?: ISpatialReference;
        filterJimuLayerView?: (jimuLayerView: JimuLayerView) => boolean;
    }): Promise<{
        [jimuLayerViewId: string]: Array<(__esri.Graphic | IFeature)>;
    }>;
    /**
     * @ignore
     * @param updateSelection If true, JimuLayerView will update selection by the partial queried features, otherwise JimuLayerView don't update selection.
     */
    cancelSelectByQuery(updateSelection: boolean): Promise<void>;
    private getSelectByQueryProgress;
    /**
     * Destroy the `JimuMapView` instance and the [ArcGIS Maps SDK for JavaScript `View`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-View.html) at the same time.
     */
    destroy(): void;
    private _getDefaultJimuMapViewId;
    /**
     * @ignore
     *
     * Handle show-on-map action.
     */
    handleShowOnMapAction(newShowOnMapDatas: ShowOnMapDatas): void;
    /**
     * Create FeatureLayer for show-on-map action.
     */
    private createFeatureLayerForShowOnMapAction;
    /**
     * Try to update features of FeatureLayer for show-on-map action. Only updates featureLayer when showOnMapData changed to avoid unnecessary updates.
     */
    private tryUpdateFeatureLayerForShowOnMapAction;
    /**
     * @ignore
     */
    addMarkers(markerGroups: MarkerGroup[]): Promise<void>;
    /**
     * @ignore
     */
    removeMarker(markerGraphic: __esri.Graphic): void;
    /**
     * @ignore
     */
    removeMarkerLayer(): void;
    /**
     * @ignore
     */
    updateMarkerUrlParamIfActive(): void;
    /**
     * @ignore
     *
     * Handle add-to-map action.
     */
    handleAddToMapAction(newAddToMapDatas: AddToMapDatas): void;
    addLayerToMap(dataSourceId: string, targetLayerId: string): Promise<JimuLayerView>;
    /**
     * Add layer into map and create JimuLayerView for it. The dataSource is the related data source of the layer.
     * In most cases, layer is created by `dataSource.createJSAPILayerByDataSource()` method.
     * @param layer
     * @param dataSource
     */
    addLayerAndCreateJimuLayerView(layer: __esri.Layer, dataSource: DataSource): Promise<JimuLayerView>;
    /**
     * Get the new min layer index of root layers. Note, it maybe return negative index.
     */
    private getNewMinLayerIndexOfRootLayers;
    /**
     * Remove jimuLayerView from jimuMapView and destroy the jimuLayerView. Note, this method will also remove all the children jimuLayerViews.
     * @param jimuLayerView Note, `jimuLayerView.fromRuntime` must be true.
     */
    removeJimuLayerView(jimuLayerView: JimuLayerView): void;
    /**
     * @deprecated
     * @param targetLayerId
     */
    removeLayerFromMap(targetLayerId: string): void;
    private parseLayersVisibilityFromUrlHash;
    /**
     * Get current layers visibility, it is used to update url hash.
     */
    private getCurrentLayersVisibilityForUrlHash;
    /**
     * @ignore
     */
    updateUrlHashLayerVisibility(): void;
    private getMapWidgetUnParsedUrlHashLayersVisibility;
    private getJimuMapViewsOfMapWidget;
    /**
     * @ignore
     */
    updatePersistentMapState(isViewParamsChanged: boolean, isLayerVisibilityChanged: boolean): Promise<void>;
    private isPersistentViewpointUsed;
    private handlePersistentMapStateAfterViewReady;
    /**
     * Return true if viewpoint is changed by this method.
     * @returns
     */
    private tryGoToSelectionsByUrlHash;
    private publishExtentChangeMessageAfterViewpointChangedBySelf;
    private queryExtentByDataSource;
    private unionExtents;
    private tryAddMarkerByUrParam;
    private queryExtentForMarkerGroup;
    /**
     * Indicates if the JimuMapView is destroyed or not. Returns true if the view is not created or if the view is destroyed, otherwise returns false.
     */
    isDestroyed(): boolean;
    /**
     * Return true if map instance is alive and not destroyed, but map container is detached from the DOM tree.
     * @ignore
     */
    isCached(): boolean;
    /**
     * The listener will be triggered when the map is cached, which means map container is detached from the DOM tree but the map is not destroyed.
     * @ignore
     * @param listener
     */
    addCacheListener(listener: JimuMapViewCacheListener): void;
    /**
     * @ignore
     * @param listener
     */
    removeCacheListener(listener: JimuMapViewCacheListener): void;
    /**
     * This method is called when map container is detached from the DOM tree but the map is not destroyed,
     * a typical scenario is that the map is scrolled out of the current page and map becomes invisible.
     * @ignore
     */
    onCache(): void;
    /**
     * The listener will be triggered when the map is restored from cached status, which means map container is attached to the DOM tree again.
     * @ignore
     * @param listener
     */
    addRestoreListener(listener: JimuMapViewRestoreListener): void;
    /**
     * @ignore
     * @param listener
     */
    removeRestoreListener(listener: JimuMapViewRestoreListener): void;
    /**
     * This method is called when map container is attached to the DOM tree again,
     * a typical scenario is that the cached map is scrolled into the current page and map becomes visible again.
     * @ignore
     */
    onRestore(): void;
    /**
     * @ignore
     * @param listener
     */
    addJimuLayerViewSelectedFeaturesChangeListener(listener: JimuLayerViewSelectedFeaturesChangeListener): void;
    /**
     * @ignore
     * @param listener
     */
    removeJimuLayerViewSelectedFeaturesChangeListener(listener: JimuLayerViewSelectedFeaturesChangeListener): void;
    /**
     * @ignore
     * @param jimuLayerView
     */
    onJimuLayerViewSelectedFeaturesChange(jimuLayerView: JimuFeatureLayerView | JimuSceneLayerView, isClear: boolean): Promise<void>;
    /**
     * @ignore
     * @param listener
     */
    addSelectByQueryProgressChangeListener(listener: SelectByQueryProgressChangeListener): void;
    /**
     * @ignore
     * @param listener
     */
    removeSelectByQueryProgressChangeListener(listener: SelectByQueryProgressChangeListener): void;
    /**
     * @ignore
     * @param progress
     */
    onSelectByQueryProgressChange(): void;
    /**
     * The listener will be triggered when JimuLayerView is created and ready to use.
     *
     * @param listener
     */
    addJimuLayerViewCreatedListener(listener: JimuLayerViewCreatedListener): void;
    /**
     * Remove the JimuLayerViewCreatedListener.
     *
     * @param listener
     */
    removeJimuLayerViewCreatedListener(listener: JimuLayerViewCreatedListener): void;
    private onJimuLayerViewCreated;
    /**
     * The listener will be triggered when JimuLayerView is removed from JimuMapView.
     *
     * @param listener
     */
    addJimuLayerViewRemovedListener(listener: JimuLayerViewRemovedListener): void;
    /**
     * Remove the JimuLayerViewRemovedListener.
     *
     * @param listener
     */
    removeJimuLayerViewRemovedListener(listener: JimuLayerViewRemovedListener): void;
    private onJimuLayerViewRemoved;
    /**
     * The listener will be triggered when JimuLayerView visibility is changed.
     *
     * @param listener
     */
    addJimuLayerViewsVisibleChangeListener(listener: JimuLayerViewsVisibleChangedListener): void;
    /**
     * Remove the JimuLayerViewsVisibleChangedListener.
     *
     * @param listener
     */
    removeJimuLayerViewsVisibleChangeListener(listener: JimuLayerViewsVisibleChangedListener): void;
    /**
     *
     * This method is called when jimuLayerView.layer.visible changed.
     * @ignore
     * @param jimuLayerView
     */
    onJimuLayerViewSelfVisibleChange(jimuLayerView: JimuLayerView): void;
    /**
     * @ignore
     * The API loaded by the builder window and the app window through `loadArcGISJSAPIModule()` method have different contexts.
     * Therefore, in the builder window, you cannot use `reactiveUtils` to monitor changes in the view properties created in the app window.
     * To solve this issue, we need to add this util method in jimuMapView.
     * This method is a wrapper of [reactiveUtils.watch()](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-reactiveUtils.html#watch).
     * It tracks any properties accessed in the `getValue` function and calls the `callback` when any of them change.
     * It should be noted that this method can only monitor changes in the properties of [Accessor](https://developers.arcgis.com/javascript/latest/api-reference/esri-core-Accessor.html).
     */
    watch<T>(getValue: () => T, callback: (newValue: T, oldValue: T) => void, options?: __esri.ReactiveWatchOptions): Promise<__esri.Handle>;
    /**
     * @ignore
     *
     * Enable layer popup.
     * @param layer
     * @param force If true, layer can still display popup when map's popup is disabled.
     */
    enableLayerPopup(layer: __esri.Layer, force: boolean): void;
    /**
     * @ignore
     *
     * Disable layer popup.
     * @param layer
     */
    disableLayerPopup(layer: __esri.Layer): void;
    /**
     * @ignore
     * Get all layers that support snapping.
     */
    getSnappingLayers(): SnappingLayer[];
}
export {};
