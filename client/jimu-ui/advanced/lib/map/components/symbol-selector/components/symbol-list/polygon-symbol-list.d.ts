import { React, type IntlShape, type IMThemeVariables } from 'jimu-core';
import { type JimuSymbol, type JimuPolygonSymbol } from '../../';
interface Props {
    intl?: IntlShape;
    theme: IMThemeVariables;
    symbol?: JimuPolygonSymbol;
    onSymbolChanged: (symbol: JimuSymbol) => void;
    onA11yFocus: () => void;
}
interface States {
    apiLoaded: boolean;
    currentIndex: number;
}
export declare class PolygonSymbolList extends React.PureComponent<Props, States> {
    jsonUtils: typeof __esri.jsonUtils;
    constructor(props: any);
    componentDidMount(): void;
    handleSymbolSelected: (index: number, symbol: any) => void;
    renderPolygonSymbolList: () => import("@emotion/react/jsx-runtime").JSX.Element[];
    getPolygonSymbolParamsSetting: () => import("@emotion/react/jsx-runtime").JSX.Element;
    updateSymbolOutLineWeight: (value: any) => void;
    updateSymbolOutLineColor: (color: string) => void;
    updateSymbolFillColor: (color: string) => void;
    updateSymbolOpacity: (value: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
