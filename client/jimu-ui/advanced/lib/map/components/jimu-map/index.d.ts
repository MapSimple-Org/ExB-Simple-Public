import { React, type UseDataSource, type ImmutableArray, AppMode, ReactRedux, type IntlShape } from 'jimu-core';
import MultiSourceMap from './components/multisourcemap';
import type { JimuMapView, JimuMapViewGroup, JimuMapClass } from 'jimu-arcgis';
import type { InitialMapState, ToolConfig, JimuMapConfig, IMJimuMapConfig } from './config';
export type { InitialMapState, ToolConfig, JimuMapConfig, IMJimuMapConfig };
export interface JimuMapProps {
    className?: string;
    useDataSources?: ImmutableArray<UseDataSource>;
    jimuMapConfig?: IMJimuMapConfig;
    id: string;
    appMode?: AppMode;
    intl?: IntlShape;
    onViewPointChanged?: (viewPoint: __esri.Viewpoint) => void;
    onExtentChanged?: (extent: __esri.Extent) => void;
    onActiveViewChange?: (activeView: JimuMapView) => void;
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    onJimuMapViewCreated?: (jimuMapView: JimuMapView) => void;
}
interface States {
    startLoadModules: boolean;
    mapComponentsLoaded: boolean;
}
export declare class __JimuMap extends React.PureComponent<JimuMapProps, States> implements JimuMapClass {
    parentContainer: HTMLElement;
    container: HTMLElement;
    containerClientRect: ClientRect | DOMRect;
    multiSourceMapInstance: MultiSourceMap;
    readonly mapRootClassName: string;
    constructor(props: any);
    startRenderMap: () => void;
    componentDidMount(): void;
    getPlaceHolderImage: () => string;
    fullScreenMap: () => void;
    handleViewGroupCreate: (viewGroup: JimuMapViewGroup) => void;
    handleJimuMapViewCreated: (jimuMapView: JimuMapView) => void;
    switchMap: () => Promise<any>;
    setMultiSourceMapInstance: (instance: MultiSourceMap) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
    renderContent(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const JimuMap: import("@emotion/styled").StyledComponent<{
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    className?: string;
    useDataSources?: ImmutableArray<UseDataSource>;
    jimuMapConfig?: IMJimuMapConfig;
    id: string;
    appMode?: AppMode;
    intl?: IntlShape;
    onViewPointChanged?: (viewPoint: __esri.Viewpoint) => void;
    onExtentChanged?: (extent: __esri.Extent) => void;
    onActiveViewChange?: (activeView: JimuMapView) => void;
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    onJimuMapViewCreated?: (jimuMapView: JimuMapView) => void;
    context?: React.Context<ReactRedux.ReactReduxContextValue<any, import("redux").UnknownAction>>;
    store?: import("redux").Store;
}, {}, {}>;
