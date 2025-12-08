import { React } from 'jimu-core';
import { type ShiftOptions } from 'jimu-ui';
interface ResizerProps {
    alignment: 'center' | 'left' | 'right';
    img: HTMLImageElement;
    container: HTMLDivElement;
}
interface ResizerState {
    dragging: boolean;
    size: string;
}
export declare class Resizer extends React.PureComponent<ResizerProps, ResizerState> {
    img: HTMLImageElement;
    lastX: any;
    prevWidth: any;
    containerWidth: number;
    reference: HTMLDivElement;
    shiftOptions: ShiftOptions;
    isRTL: boolean;
    constructor(props: any);
    handleMousedown: (evt: any) => void;
    handleMouseup: () => void;
    getLimitedWidth: (width: number) => number;
    getPercentageWidth: (width?: number) => string;
    handleDrag: (evt: any) => void;
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
