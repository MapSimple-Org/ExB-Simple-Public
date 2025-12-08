/** @jsx jsx */
import { React } from 'jimu-core';
import type { JimuMapView } from 'jimu-arcgis';
export type JimuSymbol = (JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol | JimuTextSymbol);
export type JimuPointSymbol = (__esri.SimpleMarkerSymbol | __esri.PictureMarkerSymbol | __esri.PointSymbol3D);
export type JimuPolylineSymbol = (__esri.SimpleLineSymbol | __esri.LineSymbol3D);
export type JimuPolygonSymbol = (__esri.SimpleFillSymbol | __esri.PolygonSymbol3D);
export type JimuTextSymbol = (__esri.TextSymbol);
export declare enum JimuSymbolType {
    Point = "Point",
    Polyline = "Polyline",
    Polygon = "Polygon",
    Text = "Text"
}
interface Props {
    jimuMapView?: JimuMapView;
    className?: string;
    symbol?: JimuSymbol;
    jimuSymbolType: JimuSymbolType;
    onPointSymbolChanged?: (symbol: JimuPointSymbol) => void;
    onPolylineSymbolChanged?: (symbol: JimuPolylineSymbol) => void;
    onPolygonSymbolChanged?: (symbol: JimuPolygonSymbol) => void;
    onTextSymbolChanged?: (symbol: JimuTextSymbol) => void;
    isShow?: boolean;
    onA11yFocus?: () => void;
    showSymbolPreview?: boolean;
}
export declare const SymbolList: React.MemoExoticComponent<(props: Props) => import("@emotion/react/jsx-runtime").JSX.Element>;
export {};
