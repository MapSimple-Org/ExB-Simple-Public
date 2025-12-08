import { React } from 'jimu-core';
import type { JimuMapProps } from '../index';
import MultiSourceMap from './multisourcemap';
import { type JimuMapViewGroup, type DefaultMapInfo, type JimuMapView } from 'jimu-arcgis';
interface Props {
    baseWidgetProps: JimuMapProps;
    startLoadModules: boolean;
    mapComponentsLoaded: boolean;
    fullScreenMap: () => void;
    isDefaultMap?: boolean;
    setMultiSourceMapInstance: (instance: MultiSourceMap) => void;
    onViewPointChanged?: (viewPoint: __esri.Viewpoint) => void;
    onExtentChanged?: (extent: __esri.Extent) => void;
    onActiveViewChange?: (activeView: JimuMapView) => void;
    onViewGroupCreate?: (viewGroup: JimuMapViewGroup) => void;
    onJimuMapViewCreated?: (jimuMapView: JimuMapView) => void;
}
interface State {
    defaultMapInfo: DefaultMapInfo;
}
export default class DefaultMap extends React.PureComponent<Props, State> {
    constructor(props: any);
    componentDidMount(): void;
    handleJimuMapViewCreated: (jimuMapView: JimuMapView) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
