/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
export interface LayoutProps {
    jimuMapView: JimuMapView;
    operatorWidgetId: string;
    disableSymbolSelector: boolean;
    isAutoWidth: boolean;
    isAutoHeight: boolean;
    popperPositionRef: Element;
    isCustomEditingFlag: boolean;
}
export declare const PanelLayout: React.MemoExoticComponent<(props: LayoutProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
