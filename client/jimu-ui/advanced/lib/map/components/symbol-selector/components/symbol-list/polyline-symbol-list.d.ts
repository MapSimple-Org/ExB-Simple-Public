/** @jsx jsx */
import { React, type IntlShape, type IMThemeVariables } from 'jimu-core';
import { type JimuSymbol, type JimuPolylineSymbol } from '../../';
interface Props {
    intl?: IntlShape;
    theme: IMThemeVariables;
    symbol?: JimuPolylineSymbol;
    onSymbolChanged: (symbol: JimuSymbol) => void;
    onA11yFocus: () => void;
}
interface States {
    apiLoaded: boolean;
    currentIndex: number;
}
export declare class PolylineSymbolList extends React.PureComponent<Props, States> {
    jsonUtils: typeof __esri.jsonUtils;
    constructor(props: any);
    componentDidMount(): void;
    handleSymbolSelected: (index: number, symbol: any) => void;
    onSelectChanged: (e: any) => void;
    updateSymbolLineWidth: (value: any) => void;
    updateSymbolOpacity: (value: any) => void;
    updateSymbolFillColor: (color: string) => void;
    renderPolylineSymbolList: () => import("@emotion/react/jsx-runtime").JSX.Element[];
    getPolylineSymbolParamsSetting: () => import("@emotion/react/jsx-runtime").JSX.Element;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
