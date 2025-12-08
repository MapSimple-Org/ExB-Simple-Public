/** @jsx jsx */
import { React } from 'jimu-core';
import { type ButtonSize } from 'jimu-ui';
import { JimuSymbolType } from './components/symbol-list';
import type { JimuSymbol, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol, JimuTextSymbol } from './components/symbol-list';
export { JimuSymbolType };
export type { JimuSymbol, JimuPointSymbol, JimuPolylineSymbol, JimuPolygonSymbol, JimuTextSymbol };
export interface SymbolSelectorCreatedDescriptor {
    symbol: JimuSymbol;
}
export interface SymbolSelectorProps {
    symbol: JimuSymbol;
    jimuSymbolType: JimuSymbolType;
    btnSize?: ButtonSize;
    className?: string;
    isShowPreviewBtn?: boolean;
    onCreated?: (symbolSelectorCreatedDescriptor: SymbolSelectorCreatedDescriptor) => void;
    onPointSymbolChanged?: (symbol: JimuPointSymbol) => void;
    onPolylineSymbolChanged?: (symbol: JimuPolylineSymbol) => void;
    onPolygonSymbolChanged?: (symbol: JimuPolygonSymbol) => void;
    onTextSymbolChanged?: (symbol: JimuTextSymbol) => void;
    onPopperToggle?: (isPopperOpen: any) => void;
}
export declare const _SymbolSelector: React.MemoExoticComponent<(props: SymbolSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
export declare const SymbolSelector: import("@emotion/styled").StyledComponent<Pick<SymbolSelectorProps, keyof SymbolSelectorProps> & {
    theme?: import("jimu-core").IMThemeVariables;
}, {}, {}>;
