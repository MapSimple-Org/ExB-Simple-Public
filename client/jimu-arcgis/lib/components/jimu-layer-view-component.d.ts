/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuLayerView } from '../views';
type ViewRenderFunction = (jimuLayerView: JimuLayerView) => React.ReactNode;
/**
 * The JimuLayerViewComponent component props.
 */
export interface JimuLayerViewComponentProps {
    /**
     * The JimuMapView id
     */
    jimuMapViewId: string;
    /**
     * The JimuLayerView id
     */
    jimuLayerViewId: string;
    /**
     * The function will be called when the LayerView is loaded.
     */
    onJimuLayerViewLoaded?: (jimuLayerView: JimuLayerView) => void;
    /**
     * The function will be called when the JimuLayerView instance creation fails.
     */
    onJimuLayerViewFailed?: (err: any) => void;
    children?: ViewRenderFunction | React.ReactNode;
}
/**
 * A react component that makes it easy to use JimuLayerView from the map widget.
 * In most cases, you can pass in `useMapWidgetIds` & `jimuLayerViewInfo`, and use `onLayerViewCreated` & `onLayerViewFailed` to get a callback from the JimuLayerViewComponent.
 */
export declare function JimuLayerViewComponent(props: JimuLayerViewComponentProps): React.ReactNode;
export {};
