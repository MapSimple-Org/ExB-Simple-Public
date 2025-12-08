import { React } from 'jimu-core';
import { type JimuDrawUIOptions } from '..';
export interface LayoutContextStates {
    enableSymbolSelectorFunRef: (enableFlag: boolean) => void;
    uiOptions: JimuDrawUIOptions;
    disableSymbolSelector: boolean;
    isExpandSymbolList: boolean;
    symbolsWrapperPositionRef: Element;
}
interface LayoutContextAction {
    type: string;
    payload: any;
}
export declare const actionType: {
    UIOptionsChanged: string;
    DisableSymbolSelectorChanged: string;
    IsExpandSymbolListChanged: string;
    SymbolsWrapperPositionRefChanged: string;
};
export declare const UIOptionsChangedAction: (uiOptions: JimuDrawUIOptions) => {
    type: string;
    payload: JimuDrawUIOptions;
};
export declare const DisableSymbolSelectorChangedAction: (disableSymbolSelector: boolean) => {
    type: string;
    payload: boolean;
};
export declare const IsExpandSymbolListChangedAction: (isExpand: boolean) => {
    type: string;
    payload: boolean;
};
export declare const SymbolsWrapperPositionRefChangedAction: (ref: Element) => {
    type: string;
    payload: Element;
};
export declare const init: (initStates: any) => LayoutContextStates;
export declare const reducer: (state: LayoutContextStates, action: LayoutContextAction) => {
    uiOptions: any;
    enableSymbolSelectorFunRef: (enableFlag: boolean) => void;
    disableSymbolSelector: boolean;
    isExpandSymbolList: boolean;
    symbolsWrapperPositionRef: Element;
} | {
    disableSymbolSelector: any;
    enableSymbolSelectorFunRef: (enableFlag: boolean) => void;
    uiOptions: JimuDrawUIOptions;
    isExpandSymbolList: boolean;
    symbolsWrapperPositionRef: Element;
} | {
    isExpandSymbolList: any;
    enableSymbolSelectorFunRef: (enableFlag: boolean) => void;
    uiOptions: JimuDrawUIOptions;
    disableSymbolSelector: boolean;
    symbolsWrapperPositionRef: Element;
} | {
    symbolsWrapperPositionRef: any;
    enableSymbolSelectorFunRef: (enableFlag: boolean) => void;
    uiOptions: JimuDrawUIOptions;
    disableSymbolSelector: boolean;
    isExpandSymbolList: boolean;
};
export declare const LayoutContext: React.Context<{
    layoutContextStates: LayoutContextStates;
    dispatchLayoutActions: React.Dispatch<LayoutContextAction>;
}>;
export declare const LayoutContextProvider: (props: any) => import("@emotion/react/jsx-runtime").JSX.Element;
export {};
