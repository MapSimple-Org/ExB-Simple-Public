import { React } from 'jimu-core';
import type { JimuSymbol, JimuSymbolType, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol, JimuTextSymbol } from '../../../../../';
export interface JimuSymbolsGroup {
    pointSymbol?: JimuPointSymbol;
    polylineSymbol?: JimuPolylineSymbol;
    polygonSymbol?: JimuPolygonSymbol;
    textSymbol?: JimuTextSymbol;
}
export interface SymbolCallBacks {
    onPointSymbolChanged?: (symbol: JimuPointSymbol) => void;
    onPolylineSymbolChanged?: (symbol: JimuPolylineSymbol) => void;
    onPolygonSymbolChanged?: (symbol: JimuPolygonSymbol) => void;
    onTextSymbolChanged?: (symbol: JimuTextSymbol) => void;
}
export interface SymbolContextStates {
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
}
interface SymbolContextAction {
    type: string;
    payload: any;
}
export declare const actionType: {
    SymbolChanged: string;
    JimuSymbolTypeChanged: string;
    SymbolCallBacksChanged: string;
    DefaultSymbolsChanged: string;
    PointSymbolChanged: string;
    PolylineSymbolChanged: string;
    PolygonSymbolChanged: string;
    TextSymbolChanged: string;
};
export declare const SymbolChangedAction: (symbol: JimuSymbol) => {
    type: string;
    payload: JimuSymbol;
};
export declare const JimuSymbolTypeChangedAction: (jimuSymbolType: JimuSymbolType) => {
    type: string;
    payload: JimuSymbolType;
};
export declare const SymbolCallBacksChangedAction: (callBacks: SymbolCallBacks) => {
    type: string;
    payload: SymbolCallBacks;
};
export declare const DefaultSymbolsChangedAction: (defaultSymbols: JimuSymbolsGroup) => {
    type: string;
    payload: JimuSymbolsGroup;
};
export declare const PointSymbolChangedAction: (symbol: JimuPointSymbol) => {
    type: string;
    payload: JimuPointSymbol;
};
export declare const PolylineSymbolChangedAction: (symbol: JimuPolylineSymbol) => {
    type: string;
    payload: JimuPolylineSymbol;
};
export declare const PolygonSymbolChangedAction: (symbol: JimuPolygonSymbol) => {
    type: string;
    payload: JimuPolygonSymbol;
};
export declare const TextSymbolChangedAction: (symbol: JimuPolygonSymbol) => {
    type: string;
    payload: JimuPolygonSymbol;
};
export declare const init: (defaultSymbols: JimuSymbolsGroup) => SymbolContextStates;
export declare const reducer: (state: SymbolContextStates, action: SymbolContextAction) => {
    symbol: any;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    defaultSymbols: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    callBacks: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    jimuSymbolType: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    pointSymbol: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    polylineSymbol: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polygonSymbol: JimuPolygonSymbol;
    textSymbol: JimuTextSymbol;
} | {
    polygonSymbol: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    textSymbol: JimuTextSymbol;
} | {
    textSymbol: any;
    symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol;
    jimuSymbolType: JimuSymbolType;
    defaultSymbols: JimuSymbolsGroup;
    callBacks: SymbolCallBacks;
    pointSymbol: JimuPointSymbol;
    polylineSymbol: JimuPolylineSymbol;
    polygonSymbol: JimuPolygonSymbol;
};
export declare const SymbolContext: React.Context<{
    symbolContextStates: SymbolContextStates;
    dispatchSymbolActions: React.Dispatch<SymbolContextAction>;
}>;
export declare const SymbolContextProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
