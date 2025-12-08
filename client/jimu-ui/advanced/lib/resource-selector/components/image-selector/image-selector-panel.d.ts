import { type ImageParam } from 'jimu-ui';
/**
 * The `ImageSelectorPanel` component props.
 */
export interface ImageSelectorPanelProps {
    /**
     * The ID of the widget using this component.
     */
    widgetId: string;
    /**
     * This prop controls whether the panel is open or not.
     */
    isOpen: boolean;
    /**
     * Set selected image by default in this component.
     * This prop commonly comes from stored settings or `onChange` callback.
     */
    imageParam?: ImageParam;
    /**
     * If `left`, the side popper is next to left sidebar of builder.
     * If `right`, the side popper is next to right sidebar of builder.
     * @default right
     */
    position?: 'left' | 'right';
    /**
     * This attribute is not required, most of the time we won't use it.
     * And this is a temporary solution for SidePopper.
     * Please see trigger props describe of SidePopper, they are the same.
     */
    trigger?: HTMLElement | HTMLElement[];
    /**
     * This prop is a indicator for updating the the images's in-use status.
     * Changing this prop, the remove buttons' disabled status will update according to the current `appConfig`.
     * @ignore
     */
    version?: number;
    /**
     * The function will be called when the used image is being changed.
     */
    onChange?: (imageParam: ImageParam) => void;
    /**
     * The function will be called when the close button is clicked.
     */
    onClose?: () => void;
}
export declare const ImageSelectorPanel: (props: ImageSelectorPanelProps) => import("@emotion/react/jsx-runtime").JSX.Element;
