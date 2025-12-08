/** @jsx jsx */
import { React } from 'jimu-core';
import type { ToolItemConfig, StateToLayoutProps } from '../types';
import { type ToolbarContextProps } from './toolbar-context';
interface Props {
    uid: string;
    tools: ToolItemConfig[];
}
export declare class ToolbarGroup extends React.PureComponent<Props> {
    contextProps: ToolbarContextProps;
    dropdownBtnRef: React.RefObject<HTMLButtonElement | null>;
    constructor(props: any);
    getBaseStyle(): import("jimu-core").SerializedStyles;
    getValue(target: any, props: any): any;
    togglePopToolItems: (e?: React.MouseEvent<HTMLDivElement>) => void;
    onItemClick: (toolConfig: ToolItemConfig, props: any) => void;
    createToolItem(toolConfig: ToolItemConfig, props: StateToLayoutProps, index: number): import("@emotion/react/jsx-runtime").JSX.Element;
    getGroupMenu(selectedTool: ToolItemConfig, visibleTools: ToolItemConfig[]): import("@emotion/react/jsx-runtime").JSX.Element;
    handleDoubleClick: (e: React.MouseEvent) => void;
    tooltipStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
