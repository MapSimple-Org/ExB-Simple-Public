import { ImageDots } from './image-dots';
/**
 * The `ImageViewer` component props.
 */
export interface ImageViewerProps {
    /**
     * An array list of images' src.
     */
    srcList: string[];
    /**
     * The default image's index in the `srcList` when the image viewer is opened.
     * @default 0
     */
    defaultIndex?: number;
    /**
     * Whether the image viewer is opened.
     * @default true
     */
    isOpen?: boolean;
    /**
     * The callback function when the image viewer is closed.
     * @event
     */
    onClose?: () => void;
}
export { ImageDots };
/**
 * The `ImageViewer` component is designed to display a list of images.
 *
 * It allows users to navigate through images, view, zoom in and out, and pan images in a modal.
 *
 * ```ts
 * import { ImageViewer } from 'jimu-ui'
 * ```
 */
export declare const ImageViewer: (props: ImageViewerProps) => import("@emotion/react/jsx-runtime").JSX.Element;
