/** @jsx jsx */ import { React } from 'jimu-core';
import { type JimuMapView } from 'jimu-arcgis';
import Point from 'esri/geometry/Point';
interface OutputSettings {
    name: string;
    label: string;
    defaultPattern: string;
    currentPattern: string;
    enabled: boolean;
    isCustom?: boolean;
}
export interface CoordinateControlResult {
    formattedCoordinateText: string;
    mapCoordinate: Point;
    ddCoordinate: Point;
}
export interface CoordinateControlProps {
    parentWidgetId: string;
    locatorURL: string;
    inputLabelString?: string;
    defaultCoordinate?: string;
    defaultFormat?: string;
    zoomScale?: number;
    defaultPointSymbol?: any;
    minCandidateScore?: number;
    maxSuggestions?: number;
    displayFullAddress?: boolean;
    jimuMapview?: JimuMapView;
    copyAllList?: string[];
    showCopy?: boolean;
    showZoom?: boolean;
    deactivateMapTool?: boolean;
    /** @ignore */
    className?: string;
    onConversionComplete: (conversionResult: CoordinateControlResult) => void;
    onClear?: () => void;
    processing?: (value: boolean) => void;
    getSupportedFormats?: (formats: OutputSettings[]) => void;
}
/**
 * This component is used to input coordinates in different formats.
 */
export declare const CoordinateControl: import("@emotion/styled").StyledComponent<Omit<any, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default CoordinateControl;
