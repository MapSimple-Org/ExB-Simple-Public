/** @jsx jsx */
import { React } from 'jimu-core';
import { type AdvancedSelectItem } from 'jimu-ui';
import { type Template } from 'jimu-for-builder/templates';
interface Props {
    formatMessage: (id: string, values?: {
        [key: string]: any;
    }) => string;
    onItemSelect: (pageJson: any) => void;
}
interface State {
    type: 'all' | 'fixedModalWindow' | 'fixedNonModalWindow' | 'anchoredWindow';
    capabilities: AdvancedSelectItem[];
    capabilitiesSelected: AdvancedSelectItem[];
}
export declare class WindowTemplateList extends React.PureComponent<Props, State> {
    constructor(props: any);
    onTypeChange: (e: any) => void;
    getCapabilities: () => AdvancedSelectItem[];
    getFilterdTemplates: (type: any) => Template[];
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
