import { React, ReactRedux, type JimuMapViewInfo, type ImmutableObject, type ImmutableArray, type UseDataSource } from 'jimu-core';
import type { JimuMapView } from '../views/jimu-map-view';
import { MapViewManager } from '../mapview-manager';
import type { JimuMapViewGroup } from '../views/jimu-map-view-group';
type ViewRenderFunction = (views: {
    [viewId: string]: JimuMapView;
}) => React.ReactNode;
/** @ignore */
interface ExtraProps {
    viewInfos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>;
    useDataSources: ImmutableArray<UseDataSource>;
}
/**
 * The `JimuMapViewComponent` component props.
 */
export interface JimuMapViewComponentProps {
    /**
     * The map widget id selected within the `MapWidgetSelector` component.
     */
    useMapWidgetId: string;
    /** @ignore */
    children?: ViewRenderFunction | React.ReactNode;
    /**
     * The `JimuMapViewGroup` is created once the first view is added. Views in the groups may be still not loaded after a group is created.
     */
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    /**
     * This function is called once all of the `JimuMapView` instances have a `JimuMapViewStatus` of `"LOADED"`.
     */
    onViewsCreate?: (views: {
        [viewId: string]: JimuMapView;
    }) => void;
    /**
     * This function is called when a view is destroyed or created. Note that the views in the callback function are not the changed views, but the latest views currently owned by the map widget.
     */
    onViewsChange?: (views: {
        [viewId: string]: JimuMapView;
    }) => void;
    /**
     * This function is called when the current active view of the map widget is changed.
     * For example, it is called when clicking on the switch-map tool for multi-source maps or changing the `DataSource` for the map widget.
     */
    onActiveViewChange?: (activeView: JimuMapView, previousActiveViewId: string) => void;
}
declare class _JimuMapViewComponent extends React.PureComponent<JimuMapViewComponentProps & ExtraProps, unknown> {
    viewManager: MapViewManager;
    componentDidMount(): void;
    componentDidUpdate(prevProps: JimuMapViewComponentProps & ExtraProps): void;
    /**
     * This method is called when the component is mounted or props.useMapWidgetId updates
     */
    checkPropCallbacksForCurrentMapWidgetId(preCreatedViewIds: string[], preActiveViewId: string): void;
    onViewsCreate: (views: {
        [viewId: string]: JimuMapView;
    }) => void;
    onViewGroupCreate: () => void;
    onViewsChange: (viewIds: string[]) => void;
    onActiveViewChange: (previousActiveViewId: string) => void;
    getActiveViewId: (mapWidgetId: string, infos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>) => string;
    getWhetherAllViewsCreated: (viewIds: string[], infos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>, widgetUseDataSources: ImmutableArray<UseDataSource>) => boolean;
    getWhetherViewCreated: (viewId: any, infos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>) => boolean;
    getViewIdsFromMapWidgetId: (mapWidgetId: string, infos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>) => string[];
    /**
     * Get the viewIds that view is loaded.
     */
    getCreatedViewIdsFromMapWidgetId: (mapWidgetId: string, infos: ImmutableObject<{
        [jimuMapViewId: string]: JimuMapViewInfo;
    }>) => string[];
    getViews: (viewIds: string[]) => {
        [viewId: string]: JimuMapView;
    };
    render(): React.ReactNode;
}
/**
 * A React component that makes it easy to use the `JimuMapView` instance from the map widget.
 * In most cases, you can pass in `useMapWidgetId`, and use `onViewsCreate`, `onActiveViewChange` to get callback from the `JimuMapViewComponent`.
 *
 * ```tsx
 * import { JimuMapViewComponent } from 'jimu-arcgis'
 *
 * const onActiveViewChange = (activeView: JimuMapView) => {
 *  // current active JimuMapView is changed
 *
 *  if (activeView) {
 *    activeView.whenJimuMapViewLoaded().then(() => {
 *      // do something with activeView
 *    })
 *  }
 * }
 *
 * <JimuMapViewComponent useMapWidgetId={mapWidgetId} onActiveViewChange={onActiveViewChange} />
 * ```
 */
export declare const JimuMapViewComponent: ReactRedux.ConnectedComponent<typeof _JimuMapViewComponent, {
    children?: ViewRenderFunction | React.ReactNode;
    ref?: React.Ref<_JimuMapViewComponent>;
    key?: React.Key | null | undefined;
    onActiveViewChange?: (activeView: JimuMapView, previousActiveViewId: string) => void;
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    useMapWidgetId: string;
    onViewsCreate?: (views: {
        [viewId: string]: JimuMapView;
    }) => void;
    onViewsChange?: (views: {
        [viewId: string]: JimuMapView;
    }) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}>;
export {};
