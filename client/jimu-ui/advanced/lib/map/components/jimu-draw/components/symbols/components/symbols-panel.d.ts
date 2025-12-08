/** @jsx jsx */
import { React, type ImmutableObject } from 'jimu-core';
import { type JimuSymbolType, type JimuSymbol, type JimuPointSymbol, type JimuPolylineSymbol, type JimuPolygonSymbol, type JimuTextSymbol } from '../../../../../';
import type { JimuMapView } from 'jimu-arcgis';
import type { MeasurementsRuntimeInfo, MeasurementsUnitsInfo } from '../../measurements/constraints';
export type { JimuSymbol, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol, JimuTextSymbol };
export interface Props {
    jimuMapView: JimuMapView;
    symbol: JimuSymbol;
    jimuSymbolType: JimuSymbolType;
    isShow: boolean;
    onPointSymbolChanged: (symbol: JimuPointSymbol) => void;
    onPolylineSymbolChanged: (symbol: JimuPolylineSymbol) => void;
    onPolygonSymbolChanged: (symbol: JimuPolygonSymbol) => void;
    onTextSymbolChanged: (symbol: JimuTextSymbol) => void;
    measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>;
    measurementsUnitsInfos: MeasurementsUnitsInfo[];
    handleMeasurementsInfoChanged: (measurementsRuntimeInfo: ImmutableObject<MeasurementsRuntimeInfo>) => void;
    onA11yFocus: () => void;
    isCustomEditingFlag: boolean;
}
export declare const SymbolsPanel: React.MemoExoticComponent<(props: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
