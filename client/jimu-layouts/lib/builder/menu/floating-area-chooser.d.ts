/** @jsx jsx */
import { React } from 'jimu-core';
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime';
interface ExtraProps {
    area?: number;
}
export declare class FloatingAreaChooser extends React.PureComponent<ToolSettingPanelProps & ExtraProps> {
    static defaultProps: Partial<ToolSettingPanelProps & ExtraProps>;
    topLeft: () => void;
    topCenter: () => void;
    topRight: () => void;
    middleLeft: () => void;
    middleCenter: () => void;
    middleRight: () => void;
    bottomLeft: () => void;
    bottomCenter: () => void;
    bottomRight: () => void;
    constructor(props: any);
    updateFloatingArea(value: number): void;
    getSizeOfItem(): DOMRect;
    getStyle(): import("jimu-core").SerializedStyles;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
