/** @jsx jsx */
import { React } from 'jimu-core';
type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined;
export interface ImageSettings {
    /**
     * The URI of the embedded image.
     */
    src: string;
    /**
     * The height, in pixels, of the image.
     */
    height: number;
    /**
     * The width, in pixels, of the image.
     */
    width: number;
    /**
     * Whether or not to "excavate" the modules around the embedded image. This
     * means that any modules the embedded image overlaps will use the background
     * color.
     */
    excavate: boolean;
    /**
     * The horizon offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    x?: number;
    /**
     * The vertical offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    y?: number;
    /**
     * The opacity of the embedded image in the range of 0-1.
     * @defaultValue 1
     */
    opacity?: number;
    /**
     * The cross-origin value to use when loading the image. This is used to
     * ensure compatibility with CORS, particularly when extracting image data
     * from QRCodeCanvas.
     * Note: `undefined` is treated differently than the seemingly equivalent
     * empty string. This is intended to align with HTML behavior where omitting
     * the attribute behaves differently than the empty string.
     */
    crossOrigin?: CrossOrigin;
}
/**
 * The QR-code component props.
 */
export interface QRcodeProps {
    /** The URL string. */
    value: string;
    /** The size of the QR code image. */
    size?: number;
    /** Background color. */
    bgColor?: string;
    /** Foreground color. */
    fgColor?: string;
    /** @ignore */
    level?: 'L' | 'M' | 'Q' | 'H';
    /** @ignore */
    marginSize?: number;
    imageSettings: ImageSettings;
    /** @ignore */
    className?: string;
    /** @ignore */
    downloadFileName?: string;
    /** Indicates whether to show the Save image button. */
    hideDownloadBtn?: boolean;
    ariaLabel?: string;
    onRef?: (ref: any) => void;
    onError?: (error: any, errorInfo: any) => void;
}
/**
 *  A react component for generating a QR-code based on a URL string.
 */
export declare const QRCode: import("@emotion/styled").StyledComponent<Omit<any, "intl"> & {
    forwardedRef?: React.Ref<any>;
}, {}, {}>;
export default QRCode;
