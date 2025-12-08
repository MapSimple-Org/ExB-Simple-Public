/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
import type { /*JimuSymbolType, JimuSymbol,*/ JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol } from '../../';
import { type JimuDrawUIOptions } from './components/layouts';
import type { JimuDrawingOptions, JimuDrawCreatedDescriptor, DrawingUpdatedDescriptor, JimuSymbolsGroup } from './components/sketch';
import type { MeasurementsPropsInfo, MeasurementsUnitsInfo } from './components/measurements/constraints';
export interface JimuDrawProps {
    jimuMapView: JimuMapView;
    operatorWidgetId: string;
    isDisplayCanvasLayer?: boolean;
    drawingOptions?: JimuDrawingOptions;
    measurementsInfo?: MeasurementsPropsInfo;
    measurementsUnitsInfos?: MeasurementsUnitsInfo[];
    uiOptions?: JimuDrawUIOptions;
    disableSymbolSelector?: boolean;
    defaultSymbols?: JimuSymbolsGroup;
    onPointSymbolChanged?: (symbol: JimuPointSymbol) => void;
    onPolylineSymbolChanged?: (symbol: JimuPolylineSymbol) => void;
    onPolygonSymbolChanged?: (symbol: JimuPolygonSymbol) => void;
    onJimuDrawCreated?: (jimuDrawCreatedDescriptor: JimuDrawCreatedDescriptor) => void;
    onToolsActivated?: (drawingMode: string) => void;
    onDrawingStarted?: () => void;
    onDrawingCanceled?: () => void;
    onDrawingFinished?: (graphic: __esri.Graphic) => void;
    onDrawingUpdated?: (res: DrawingUpdatedDescriptor) => void;
    onDrawingCleared?: () => void;
}
export declare const ContextsBridge: React.MemoExoticComponent<(props: JimuDrawProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
