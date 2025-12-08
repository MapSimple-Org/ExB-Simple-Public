import { type CropParam, ImageDisplayQualityMode, ImageDisplayQualityValue } from './index';
import { type Size } from 'jimu-core';
export declare function getCroppedImagePosition(cropParam: CropParam, width: number, height: number): {
    zoom: number;
    x: number;
    y: number;
};
export declare function isIllegalUrl(url: string): boolean;
/**
 * Get image original size by link that is like url or dataURL.
 * @param imgLink url or dataURL, because sometimes image data is from cache
 * @returns Promise<{ width: number, height: number }>
 */
export declare function getImageOriginalSizeByUrl(imgLink: string): Promise<Size>;
export declare const cutWidthRangeList: number[];
export declare function getImageDisplayQualityModeWidthMap(naturalWidth: number): {
    ORIGINAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    FUZZY: number;
};
export declare function getImageDisplayQualityWidthByMode(naturalWidth: number, mode: ImageDisplayQualityMode): number;
export declare function getImageDisplayQualityModeByValue(value: ImageDisplayQualityValue): ImageDisplayQualityMode;
export declare function getImageDisplayQualityValueByMode(mode: ImageDisplayQualityMode): ImageDisplayQualityValue;
export declare function canvasToBlob(canvas: any, mimeType?: string): Promise<Blob>;
export declare function canvasToObjectURL(canvas: any, mimeType?: string): Promise<string>;
export declare function imageToCanvas(image: any, destWidth?: number, destHeight?: number): HTMLCanvasElement;
export declare function imageToObjectURL(image: HTMLImageElement, mimeType: string, destWidth?: number, destHeight?: number): Promise<string>;
export declare function compressImageByWidth(objectURL: string, destWidth?: number, mimeType?: string): Promise<string>;
export declare function getFuzzyImageWidth(): number;
export declare function updateUrlByDisplayQualityMode(src: string, cropParam: CropParam, originalWidth: number, fileFormat: string, mode: ImageDisplayQualityMode): Promise<string>;
export declare function canCutImage(src: string): boolean;
export declare function canUseImageDisplayQuality(src: string, fileFormat: string): boolean;
