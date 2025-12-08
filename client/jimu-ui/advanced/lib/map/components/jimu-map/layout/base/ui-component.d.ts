import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
export interface UIComponentProps {
    jimuMapView: JimuMapView;
}
export declare abstract class UIComponent<P extends UIComponentProps, S> extends React.PureComponent<P, S> {
}
