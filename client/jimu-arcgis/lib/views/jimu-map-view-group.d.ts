import type { JimuMapView } from './jimu-map-view';
export interface JimuMapClass {
    switchMap: (ignoreSwitchAnimation?: boolean) => Promise<any>;
    fullScreenMap: () => void;
}
/** @ignore */
export declare class JimuMapViewGroup {
    mapWidgetId: string;
    jimuMapViews: {
        [id: string]: JimuMapView;
    };
    mapWidgetInstance: JimuMapClass;
    constructor(mapWidgetId: string);
    setMapWidgetInstance(mapWidgetInstance: JimuMapClass): void;
    addJimuMapView(jimuMapView: JimuMapView): void;
    setJimuMapView(jimuMapView: JimuMapView): void;
    removeJimuMapView(jimuMapView: JimuMapView): void;
    getActiveJimuMapView(): JimuMapView;
    switchMap: (ignoreSwitchAnimation?: boolean) => Promise<any>;
    fullScreenMap: () => void;
    /**
     * @ignore
     */
    showMapTools(): void;
    /**
     * @ignore
     */
    hideMapTools(): void;
    getAllJimuMapViews(): JimuMapView[];
}
