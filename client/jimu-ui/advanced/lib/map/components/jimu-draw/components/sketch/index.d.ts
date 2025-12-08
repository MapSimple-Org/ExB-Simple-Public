/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
import { type JimuDrawingOptions } from './context/sketch-context';
import type { JimuSymbolsGroup } from '../symbols/context/symbol-context';
import { type JimuDrawCreatedDescriptor } from './sketch-adapter';
import { JimuDrawCreationMode, DrawingElevationMode3D, type DrawingUpdatedModes, type DrawingUpdatedDescriptor, type JimuDrawVisibleElements, type DrawOptionsInfo, SnappingMode } from './constraints';
export type { JimuDrawCreatedDescriptor, JimuDrawingOptions, DrawingUpdatedModes, DrawingUpdatedDescriptor, JimuSymbolsGroup };
export { JimuDrawCreationMode, DrawingElevationMode3D, type JimuDrawVisibleElements, type DrawOptionsInfo, SnappingMode };
export interface JimuSketchProps {
    className?: string;
    jimuMapView: JimuMapView;
    operatorWidgetId: string;
    onJimuDrawCreated?: (drawTool: JimuDrawCreatedDescriptor) => void;
    onToolsActivated?: (drawingMode: string) => void;
    onDrawingCleared?: () => void;
    onDrawingStarted?: () => void;
    onDrawingCanceled?: () => void;
    onDrawingFinished?: (graphic: __esri.Graphic) => void;
    onDrawingUpdated?: (res: DrawingUpdatedDescriptor) => void;
}
export declare const Sketch: React.MemoExoticComponent<(props: JimuSketchProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
