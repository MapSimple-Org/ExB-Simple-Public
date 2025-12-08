/** @jsx jsx */
import { React, type IMThemeVariables } from 'jimu-core';
import { type ButtonSize } from 'jimu-ui';
import { type JimuSymbol, JimuSymbolType } from '../../';
interface SymbolItemProps {
    theme: IMThemeVariables;
    symbol?: JimuSymbol;
    index?: number;
    isActive?: boolean;
    onClick?: (index: number, symbol?: JimuSymbol) => void;
    jimuSymbolType: JimuSymbolType;
    isSelectorPreview?: boolean;
    isInnerPreviewBtn?: boolean;
    className?: string;
    btnSize?: ButtonSize;
    a11yNeedFocus?: boolean;
    btnRef?: any;
}
interface States {
    symbolLoading: boolean;
    apiLoaded: boolean;
}
export declare class _SymbolItem extends React.PureComponent<SymbolItemProps, States> {
    btnContainerRef: HTMLElement;
    btnRef: HTMLElement;
    symbolUtils: typeof __esri.symbolUtils;
    Color: typeof __esri.Color;
    ApiSyncRenderSymbolFlag: boolean;
    renderPreviewHTMLPromise: Promise<HTMLElement>;
    innerIconWH: number;
    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: SymbolItemProps, prevState: unknown): void;
    onHandleSymbolClick: () => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export declare const SymbolItem: typeof _SymbolItem;
declare const _default: React.ForwardRefExoticComponent<SymbolItemProps & React.RefAttributes<unknown>>;
export default _default;
