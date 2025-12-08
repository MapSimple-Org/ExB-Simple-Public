import { React } from 'jimu-core';
interface Props {
    cropShape?: string;
    showGrid?: boolean;
    style?: any;
    className?: string;
    cropAreaStyle?: string;
    onSliderChange?: any;
    onCancelCrop?: any;
    onConfirmCrop?: any;
    svgViewBox?: string;
    svgPath?: string;
    widgetId?: string;
    screenWidth?: number;
    screenHeight?: number;
    widgetArea?: ClientRect;
}
export declare class CropArea extends React.Component<Props, unknown> {
    render(): import("@emotion/react/jsx-runtime").JSX.Element;
}
export {};
