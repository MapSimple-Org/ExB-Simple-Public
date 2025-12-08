import { React, type ImmutableArray, type ExtentChangeMessage, type UseDataSource } from 'jimu-core';
import MapBase, { MapLoadStatus, type ShareViewPoint } from './mapbase';
import type { JimuMapProps } from '../index';
import { type JimuMapView, type JimuMapViewGroup, type DefaultMapInfo } from 'jimu-arcgis';
interface Props {
    baseWidgetProps: JimuMapProps;
    startLoadModules: boolean;
    mapComponentsLoaded: boolean;
    fullScreenMap: () => void;
    isDefaultMap?: boolean;
    defaultMapInfo?: DefaultMapInfo;
    onViewPointChanged?: (viewPoint: __esri.Viewpoint) => void;
    onExtentChanged?: (extent: __esri.Extent) => void;
    onActiveViewChange?: (activeView: JimuMapView) => void;
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    onJimuMapViewCreated?: (jimuMapView: JimuMapView) => void;
}
interface MapContainerStyle {
    opacity: number;
    zIndex: number;
}
interface State {
    currentMapIndex?: 0 | 1;
    multiMapStyle?: MapContainerStyle[];
    firstMapDsId?: string;
    secondMapDsId?: string;
    useAnimation: boolean;
    useDataSources?: ImmutableArray<UseDataSource>;
    currentJimuMapView?: JimuMapView;
}
export default class MultiSourceMap extends React.PureComponent<Props, State> {
    isReIniting: boolean;
    mutableStatePropsMap: {
        [propKey: string]: string[];
    };
    useMapWidgetIds: ImmutableArray<string>;
    firstMapInstance: React.RefObject<MapBase>;
    secondMapInstance: React.RefObject<MapBase>;
    constructor(props: any);
    reInitWidgetInstance: (restoreData: any) => void;
    componentDidMount(): void;
    static getChangedState: (firstMapDsId: any, secondMapDsId: any, useDataSources: any) => State;
    static getDerivedStateFromProps(newProps: Props, prevState: State): State;
    componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
    changeInitialMapDataSourceID: (dataSourceId: string, callBack?: any) => void;
    startChangeInitialMapAnimation: (callBack?: any) => void;
    switchMap: () => Promise<any>;
    handleMutableStatePropsChanged: (dataSourceId: string, propKey: string, value?: any) => void;
    handleViewChanged: (shareViewPoint: ShareViewPoint) => void;
    handleExtentChanged: (dataSourceId: string, extentMessage: ExtentChangeMessage) => void;
    handleMapLoaded: (dataSourceId: string, mapLoadStatus: MapLoadStatus) => void;
    handleJimuMapViewCreated: (jimuMapView: JimuMapView) => void;
    confirmJimuMapViewIsActive: () => void;
    setActiveJimuMapView(jimuMapView: JimuMapView, isActive: boolean): void;
    isShowMapSwitchBtn: () => boolean;
    getCurrentVisibleDsId: () => string;
    handleViewGroupCreate: (viewGroup: JimuMapViewGroup) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
