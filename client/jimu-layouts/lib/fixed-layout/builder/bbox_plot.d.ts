/** @jsx jsx */
import { React, type BoundingBox, type IMThemeVariables } from 'jimu-core';
interface ParsedBBox {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
    width?: boolean;
    height?: boolean;
}
export declare class BBoxPlot extends React.Component<{
    bbox: BoundingBox;
    theme: IMThemeVariables;
    size: number;
    autoProps?: ParsedBBox;
}> {
    getColor(parsedValue: ParsedBBox, prop: string): string;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
