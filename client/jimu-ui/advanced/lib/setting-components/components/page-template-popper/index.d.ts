/** @jsx jsx */
import { React, type IMThemeVariables } from 'jimu-core';
export interface PageTemplatePopperProps {
    theme: IMThemeVariables;
    referenceElement: HTMLElement;
    formatMessage: (id: string, values?: {
        [key: string]: any;
    }) => string;
    onItemSelect: (item: any) => void;
    onClose: () => void;
}
interface State {
    open: boolean;
    tabId: string;
}
export declare class PageTemplatePopper extends React.PureComponent<PageTemplatePopperProps, State> {
    constructor(props: any);
    togglePopper: () => void;
    tabSelect: (tabId: string) => void;
    onItemSelect: (templateJson: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
