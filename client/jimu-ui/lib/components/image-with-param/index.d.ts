/** @jsx jsx */
import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `Image` component props.
 */
export interface ImageProps extends StandardComponentProps {
    /**
     * The URL of the image to display.
     */
    src?: string;
    /**
     * The width of the image.
     * If `width` is set, `isAutoWidth` will be ignored.
     */
    width?: number;
    /**
     * The height of the image.
     * If `height` is set, `isAutoHeight` will be ignored.
     */
    height?: number;
    /**
     * If `true`, the component will apply the image's intrinsic width.
     * If `false`, the component follows its parent's width.
     * @default false
     */
    isAutoWidth?: boolean;
    /**
     * If `true`, the component will apply the image's intrinsic height.
     * If `false`, the component follows its parent's height.
     * @default false
     */
    isAutoHeight?: boolean;
    /**
     * The alternative text for the image.
     * This will be used as the `alt` attribute of the `<img>` element.
     */
    alt?: string;
    /**
     * The title for the image.
     * This will be used as the `title` attribute of the `<img>` element.
     */
    title?: string;
    /**
     * The shape of the image.
     * @default rectangle
     */
    shape?: 'circle' | 'rectangle';
    /**
     * The crop parameters for the image.
     * If `shape` is set, `cropParam.cropShape` will be ignored.
     */
    cropParam?: CropParam;
    /**
     * The fit property specifies how the image should be resized to fit its container.
     */
    fit?: 'cover' | 'contain';
    /**
     * The fill mode for image.
     * This property has same behavior as `fit`.
     * If `fit` is set, `imageFillMode` will be ignored.
     * For backward compatibility, we keep this property.
     * @default FILL
     */
    imageFillMode?: ImageFillMode;
    /**
     * If `true`, image has a fade-in effect on load.
     * @default false
     */
    fadeInOnLoad?: boolean;
    /**
     * The original width of the image.
     * This property is needed if `quality` is set to a value other than `ORIGINAL`.
     */
    originalWidth?: number;
    /**
     * The image's file format.
     * This property is needed if `quality` is set to a value other than `ORIGINAL`.
     * Only 'image/jpeg', 'image/jpg' and 'image/png' MIME types support quality processing.
     */
    fileFormat?: string;
    /**
     * The image display quality mode. This property only works if the image
     * was uploaded in ImageSelector as an app resource.
     * `FUZZY` mode is used for thumbnail display with 100px width.
     * @default ORIGINAL
     */
    quality?: ImageDisplayQualityMode;
    /**
     * If `true`, a broken placeholder will be shown if src is invalid or the image fails to load.
     * @default false
     */
    showBrokenPlaceholder?: boolean;
    /**
     * Fired when the image is loaded.
     * @event
     */
    onLoad?: React.ReactEventHandler<HTMLImageElement>;
    /**
     * Fired when the image fails to load.
     * @event
     */
    onError?: React.ReactEventHandler<HTMLImageElement>;
    /**
     * Fired when the image is clicked.
     * @event
     */
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}
/**
 * The fill mode for image.
 */
export declare enum ImageFillMode {
    Fit = "FIT",// image fit in its container
    Fill = "FILL"
}
/** @ignore */
export declare enum ImgSourceType {
    ByURL = "BY_URL",
    ByUpload = "BY_UPLOAD"
}
/**
 * The info for ImageParam.
 */
export interface ImageParam {
    /**
     * The url for image.
     * If the image comes from a image selector or the app resource manager, the URL has two formats:
     * 1. When an image is newly uploaded in the builder, the URL is in blob format, e.g., 'blob:https://......'.
     * 2. After saving the app, the URL is in the format: '${appResourceUrl}/images/widget_1/1641535897496.png'.
     *
     * The second format (${appResourceUrl}) can be converted to the final URL format, such as:
     * 'https://www.arcgis.com/sharing/rest/content/items/787381a21f7/resources/images/widget_1/1641535897496.png?token=...'
     * using `appConfigUtils.processResourceUrl`.
     *
     * Note:
     * - For `Image` and `ImageViewer`, the URL is already converted, so no additional conversion is needed.
     * - For `<img>` tags or CSS `url()` properties, you must manually convert the URL using `appConfigUtils.processResourceUrl`.
     */
    url?: string;
    /** @ignore */
    originalId?: string;
    /** @ignore */
    originalUrl?: string;
    /**
     * The resource fileName for image, if it is stored as a resource.
     */
    fileName?: string;
    /**
     * The original fileName for image
     */
    originalName?: string;
    /**
     * The file format for image
     */
    fileFormat?: string;
    /** @ignore */
    imgSourceType?: ImgSourceType;
    /** @ignore */
    cropParam?: CropParam;
    /** The image original width that is from HTMLImageElement.naturalWidth. */
    originalWidth?: number;
    /** The image original height that is from HTMLImageElement.naturalHeight. */
    originalHeight?: number;
}
/** @ignore */
export declare enum CropType {
    Real = "REAL",
    Fake = "FAKE"
}
/** @ignore */
export interface CropPosition {
    x: number;
    y: number;
}
interface CropPixel {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
/** @ignore */
export interface CropParam {
    cropPosition?: CropPosition;
    cropZoom?: number;
    svgViewBox?: string;
    svgPath?: string;
    cropShape?: string;
    cropPixel?: CropPixel;
    cropType?: CropType;
}
export declare enum ImageDisplayQualityMode {
    Original = "ORIGINAL",
    High = "HIGH",
    Medium = "MEDIUM",
    Low = "LOW",
    Fuzzy = "FUZZY"
}
export declare enum ImageDisplayQualityValue {
    Original = 99.99,
    High = 66.66,
    Medium = 33.33,
    Low = 0
}
/**
 * The `Image` component is designed to display an image.
 * It supports common image properties like `src`, `width`, `height`, `alt`, and `title`.
 * It also supports placeholder, cropping, shape, fade-in, image fill mode and image quality.
 *
 * ```ts
 * import { Image } from 'jimu-ui'
 * ```
 */
export declare const Image: React.MemoExoticComponent<(props: ImageProps) => import("@emotion/react/jsx-runtime").JSX.Element>;
export {};
