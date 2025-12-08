/** @jsx jsx */
import { React, type IMThemeVariables } from 'jimu-core';
import { type AdvancedSelectItem } from 'jimu-ui';
import { type Template } from 'jimu-for-builder/templates';
interface Props {
    theme: IMThemeVariables;
    formatMessage: (id: string, values?: {
        [key: string]: any;
    }) => string;
    tabId: string;
    onTabSelect: (tabId: string) => void;
    onItemSelect: (pageJson: any) => void;
}
interface State {
    fullScreenType: 'all' | 'fixed' | 'grid';
    capabilitiesForFullScreenApp: AdvancedSelectItem[];
    capabilitiesForScrollingPage: AdvancedSelectItem[];
    capabilitiesSelectedForFullScreenApp: AdvancedSelectItem[];
    capabilitiesSelectedForScrollingPage: AdvancedSelectItem[];
}
export declare class PageTemplateList extends React.PureComponent<Props, State> {
    tabsRef: any;
    constructor(props: any);
    onTabSelect: (tabId: any) => void;
    onFullScreenTypeChange: (e: any) => void;
    getValueLabelItems: (capabilities: string[]) => AdvancedSelectItem[];
    getCapabilitiesForFullScreenApp: () => AdvancedSelectItem[];
    getCapabilitiesForScrollingPage: () => AdvancedSelectItem[];
    getFilterdTemplatesForFullScreenApp: (fullScreenType: any) => Template[];
    getFilterdTemplatesForScrollingPage: () => Template[];
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
