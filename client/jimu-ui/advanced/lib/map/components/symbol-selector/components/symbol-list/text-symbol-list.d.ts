/** @jsx jsx */
import { React, type IntlShape, type IMThemeVariables } from 'jimu-core';
import { type JimuMapView } from 'jimu-arcgis';
import type { JimuSymbol } from '../../';
interface Props {
    jimuMapView: JimuMapView;
    intl: IntlShape;
    theme: IMThemeVariables;
    symbol: __esri.TextSymbol;
    defaultText: string;
    onSymbolChanged: (symbol: JimuSymbol) => void;
    onA11yFocus: () => void;
}
interface States {
    apiLoaded: boolean;
    showTextInTextArea: boolean;
    enableBackground: boolean;
}
export declare class TextSymbolList extends React.PureComponent<Props, States> {
    jsonUtils: typeof __esri.jsonUtils;
    TextSymbol: __esri.TextSymbol;
    Color: typeof __esri.Color;
    _defaultTextCache: string;
    _cacheBgInfo: {
        backgroundColor: number[];
        borderLineColor: number[];
        borderLineSize: number;
    };
    getInitBgInfo(): {
        backgroundColor: number[];
        borderLineColor: number[];
        borderLineSize: number;
    };
    constructor(props: any);
    componentDidMount(): void;
    is3DMode: () => boolean;
    handleTextChanged: (text: string) => void;
    onFontChanged: (evt: any) => void;
    handleSizeChanged: (size: number) => void;
    handleColorChanged: (color: string) => void;
    handleColorAlphaChanged: (value: number) => void;
    handleHaloSizeChanged: (haloSize: number) => void;
    handleHaloColorChanged: (haloColor: string) => void;
    handleAngleChanged: (angle: number) => void;
    handleSliderAngleChanged: (evt: any) => void;
    handleIsShowLocationMeasurementChanged: (isShow: boolean) => void;
    handleBackgroundColorChanged: (bgColor: string) => void;
    handleBackgroundColorAlphaChanged: (value: number) => void;
    handleBorderLineSizeChanged: (borderSize: number) => void;
    handleBorderLineColorChanged: (borderColor: string) => void;
    handleBorderLineColorAlphaChanged: (value: number) => void;
    getTextAreaValue: (text: string) => string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
