import type { MapViewManager } from '../../mapview-manager';
import { type IMDataSourceInfo, type DataSource, type MapDataSource } from 'jimu-core';
import type { UrlHashLayersVisibility } from '../jimu-map-view';
/**
 * `JimuLayerViewConstructorOptions` is used in the constructor of the `JimuLayerView` to initiate a `JimuLayerView` instance.
 */
export interface JimuLayerViewConstructorOptions {
    id: string;
    /**
     * The layer type, see [ArcGIS Maps SDK for JavaScript Layer type](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#type).
     */
    type: string;
    /**
     * The layerDataSourceId is the corresponding data source id.
     */
    layerDataSourceId: string;
    /**
     * The jimuMapViewId is the corresponding JimuMapView instance id.
     */
    jimuMapViewId: string;
    /** The jimuLayerId is a string that connects the layer.id in the layer tree with "-" */
    jimuLayerId: string;
    /**
     * The layer is the corresponding layer object in ArcGIS JavaScript API View.map.
     */
    layer: any;
    /** @ignore */
    parentJimuLayerViewId: string;
    /** Pass MapViewManager in to avoid circular dependency. */
    mapViewManager: MapViewManager;
    index: number;
    /**
     * true means the JimuLayerView is created from runtime. e.g. The JimuLayerView is created by AddData widget at runtime. false means the layer is a builtin layer of WebMap or WebScene.
     */
    fromRuntime: boolean;
    /**
     * @ignore
     * The `urlHashLayersVisibility` property indicates whether the layer uses the url hash layer visibility as the initial layer visibility or not.
     */
    urlHashLayersVisibility?: UrlHashLayersVisibility;
}
/**
 * `JimuLayerView` is the wrapper class for ArcGIS Maps SDK for JavaScript [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) and [`LayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-LayerView.html).
 * It is created by a `JimuMapView` using a layer [`DataSource`](https://developers.arcgis.com/experience-builder/api-reference/jimu-core/DataSource).
 *
 * A layer view may have a related data source. If it has the data source, the feature selection will be synced to data source selection and will use the data source URL params.
 * If it does not have the data source, the feature selection will use the feature_selection URL param.
 */
export declare class JimuLayerView {
    /**
     * The id of the JimuLayerView instance. It connects the JimuMapView.id and the JimuLayerId with "-"
     */
    id: string;
    /**
     * The `view` is the [ArcGIS Maps SDK for JavaScript `LayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-LayerView.html)
     *  or [`BuildingComponentSublayerView`](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-BuildingComponentSublayerView.html).
     */
    view: __esri.LayerView | __esri.BuildingComponentSublayerView;
    /**
     * The layer type, see [ArcGIS Maps SDK for JavaScript Layer type](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html#type).
     */
    type: string;
    /**
     * The layerDataSourceId is the corresponding data source id.
     * This id always has value, but the layer data source may not be created.
     */
    layerDataSourceId: string;
    /**
     * The jimuMapViewId is the corresponding JimuMapView instance id.
     */
    jimuMapViewId: string;
    /** @ignore */
    jimuLayerId: string;
    /**
     * The layer is the corresponding layer object in ArcGIS JavaScript API View.map.
     */
    layer: any;
    /** @ignore */
    parentJimuLayerViewId: string;
    /**
     * The order defined in the webmap
     */
    index: number;
    /**
     * @ignore
     * The layer's hierarchy in the map.
     * If layer has no ancestor layers, then level is layerIndex, for example '1'.
     * If the layer has ancestor layers, then level is the combination of the layerIndex of all ancestor layers, for example '0.4.3.5'.
     */
    hierarchyLevel: string;
    /**
     * true means the JimuLayerView is created from runtime. e.g. The JimuLayerView is created by AddData widget at runtime. false means the layer is a builtin layer of WebMap or WebScene.
     */
    fromRuntime: boolean;
    /**
     * @ignore
     * If the layer is added to map at runtime, runtimeRootDataSource is the data source of the root ancestor layer.
     * For builtin layers, runtimeRootDataSource is always null.
     */
    runtimeRootDataSource: DataSource;
    isLoaded: boolean;
    /** @ignore */
    private dataSourceInfoObserver;
    /** @ignore */
    private dataSourceJsonObserver;
    /** @ignore */
    private runTimeIsHidden;
    protected readonly mapViewManager: MapViewManager;
    /** @ignore */
    originalLayerVisible: boolean;
    private watchLayerVisibleChangeHandle;
    private removeableByMapTool;
    private reactiveUtils;
    constructor(options: JimuLayerViewConstructorOptions);
    ready(): Promise<this>;
    /**
     * @ignore
     */
    updateUrlHashLayersVisibility(urlHashLayersVisibility: UrlHashLayersVisibility): boolean;
    protected getReactiveUtils(): Promise<__esri.reactiveUtils>;
    protected whenViewLoaded(): Promise<void>;
    protected validateDataSource(layerDs: DataSource): boolean;
    /**
     * Return the corresponding data source of the layer.
     */
    getLayerDataSource(): DataSource;
    /**
     * Create corresponding data source for the layer.
     */
    createLayerDataSource(): Promise<DataSource>;
    /**
     * @ignore
     */
    getOrCreateLayerDataSource(): Promise<DataSource>;
    /**
     * Get parent JimuLayerView.
     */
    getParentJimuLayerView(): JimuLayerView;
    /**
     * Get all ancestor JimuLayerViews.
     */
    getAllAncestorJimuLayerViews(): JimuLayerView[];
    private isLayerUsedByFilter;
    private isLayerUsedBySelection;
    private isLayerDataSourceUsedBySelection;
    /**
     * If any layer in the layer tree is invisible, the layer is considered invisible.
     */
    isLayerVisible(): boolean;
    /**
     * @ignore
     */
    isLayerVisibleForRendering(): boolean;
    /**
     * Return the MapView or SceneView of the layer view.
     */
    getMapSceneView(): __esri.MapView | __esri.SceneView;
    /**
     * Get the map data source of the layer.
     */
    getMapDataSource(): MapDataSource;
    /** @ignore */
    protected onLayerDataSourceInfoChange(preDsInfo: IMDataSourceInfo, dsInfo: IMDataSourceInfo): void;
    /**
     * Get the JimuMapView that the current JimuLayerView belongs to.
     */
    getJimuMapView(): import("jimu-arcgis").JimuMapView;
    /**
     * Destroy the JimuLayerView instance.
     */
    destroy(): void;
    private getAppConfig;
    private initListenToDataSourceJsonChange;
    private initListenToDataSourceInfoChange;
    /** @ignore */
    private onLayerDatasourceJsonChange;
    private watchLayerVisibleChange;
    /**
     * @ignore
     */
    onParentLayerVisibleChange(parentNewVisible: boolean): void;
    /**
     * @ignore
     */
    getMapWidgetId(): string;
    /**
     * @ignore
     * Update removeableByMapTool property. true means the layer can be removed by map clear-data tool.
     * @param value
     */
    setRemoveableByMapTool(value: boolean): void;
    supportTime(): boolean;
}
