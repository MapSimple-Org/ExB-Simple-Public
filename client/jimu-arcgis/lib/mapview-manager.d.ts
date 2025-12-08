import { type DataSource } from 'jimu-core';
import { JimuMapView, type JimuMapViewConstructorOptions } from './views/jimu-map-view';
import { JimuMapViewGroup } from './views/jimu-map-view-group';
import type { JimuFeatureLayerView } from './views/layers/jimu-feature-layer-view';
import type { JimuSceneLayerView } from './views/layers/jimu-scene-layer-view';
/**
 * The `MapViewManager` is used to manage `JimuMapView`, including creating, getting, setting and destroying the `JimuMapView` instance.
 * Please always use `MapViewManager.getInstance()` to use this class. For example, to get a `JimuMapView`, you can use `MapViewManager.getInstance().getJimuMapViewById(dsId)`.
 * For widget development, `MapViewManager.getInstance()` in both the widget and the widget's setting return the same instance.
 *
 * When needing to make use of the `JimuMapView`, for ease of use, it is recommended to use the `JimuMapViewComponent` React component.
 */
export declare class MapViewManager {
    static _instance: MapViewManager;
    static getInstance(): MapViewManager;
    /** @ignore */
    private jimuMapViewGroups;
    /**
     * Returns the `JimuMapView` instance by id.
     */
    getJimuMapViewById(id: string): JimuMapView;
    /** @ignore
     * Get the `JimuMapViewGroup` given widget id.
    */
    getJimuMapViewGroup(mapWidgetId: string): JimuMapViewGroup;
    /**
     * When starting the creation of the `JimuMapView` instance, this method will set the `JimuMapView` instance status as `LOADING`.
     * Upon creation, the status will change to `LOADED`. If an error occurs, the status will be set to `FAILED`.
     */
    createJimuMapView(jimuMapViewConstructorOptions: JimuMapViewConstructorOptions): Promise<JimuMapView>;
    /** @ignore
     * Add a `JimuMapView` instance to the `JimuMapViewGroup`.
     */
    addJimuMapView(jimuMapView: JimuMapView): void;
    /**
     * Updates the `JimuMapView` instance.
     */
    setJimuMapView(jimuMapView: JimuMapView): void;
    /**
     * Destroys the `JimuMapView` instance by `JimuMapView` id.
     */
    destroyJimuMapView(jimuMapViewId: string): void;
    /**
     * Obtain all `JimuMapView` ids.
     */
    getAllJimuMapViewIds(): string[];
    /**
     * @ignore
     * Get all `JimuMapView` instances.
     */
    getAllJimuMapViews(): JimuMapView[];
    /**
     * Destroy all `JimuMapView` instances by ids.
     */
    destroyAllJimuMapViews(): void;
    getJimuLayerViewForClientQuery(layerDs: DataSource): JimuFeatureLayerView | JimuSceneLayerView;
}
