/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
import type { CreateToolActions } from '../../sketch/constraints';
export interface ToolbarLayoutProps {
    jimuMapView: JimuMapView;
    operatorWidgetId: string;
    disableSymbolSelector: boolean;
    popperPositionRef: Element;
    popperIsVisible: boolean;
    popperVersion?: number;
    currentActiveToolChanged: (type: CreateToolActions) => void;
    onPopperToggle?: (isPopperOpen: any) => void;
    isCustomEditingFlag: boolean;
}
export declare const ToolbarLayout: React.MemoExoticComponent<(props: ToolbarLayoutProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
