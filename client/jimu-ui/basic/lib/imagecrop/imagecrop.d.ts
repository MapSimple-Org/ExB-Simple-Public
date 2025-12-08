/** @jsx jsx */
import { React } from 'jimu-core';
import type { CropParam, CropPosition } from 'jimu-ui';
import { CropType } from 'jimu-ui';
interface State {
    modal: boolean;
    crop: any;
    zoom: number;
    aspect: number;
    showGrid: boolean;
    zoomSpeed: number;
    croppedAreaPixels: any;
    loading?: boolean;
}
interface Props {
    onCancelCrop?: any;
    onConfirmCrop?: any;
    onFailCrop?: any;
    widgetId?: string;
    widgetArea?: DOMRect;
    image: string;
    imageFormat?: string;
    cropParam?: CropParam;
    cropZoom?: number;
    crop?: CropPosition;
    cropType?: CropType;
    originId?: string;
}
export { type CropParam, CropType };
export declare class ImageCrop extends React.Component<Props, State> {
    editInfoStyle: {
        width: string;
        height: string;
        margin: number;
    };
    constructor(props: any);
    onCropChange: (crop: any) => void;
    onCropAreaComplete: (croppedArea: any, croppedAreaPixels: any) => void;
    onZoomChange: (zoom: any) => void;
    onConfirmCrop: (svgViewBox: string, svgPath: string, cropShape: any) => void;
    render(): React.ReactPortal;
}
