import { React } from 'jimu-core';
import { type ButtonSize, type ButtonType, type StandardComponentProps } from 'jimu-ui';
import { type ImageSelectorPanelProps } from './image-selector-panel';
/**
 * The `ImageSelector` component props.
 */
export interface ImageSelectorProps extends StandardComponentProps, Omit<ImageSelectorPanelProps, 'isOpen' | 'onClose'> {
    /** @ignore */
    buttonClassName?: string;
    /** @ignore */
    buttonStyle?: React.CSSProperties;
    /**
     * The type of the button.
     */
    buttonType?: ButtonType;
    /**
     * The size of this component.
     * @default default
     */
    buttonSize?: ButtonSize;
    /**
     * The label for this component.
     */
    buttonLabel?: string;
    /**
     * If `true`, the component will be disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Identifies the element (or elements) that describes the object for accessibility purposes.
     */
    'aria-describedby'?: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     */
    'aria-label'?: string;
}
export declare const ImageSelector: (props: ImageSelectorProps) => import("@emotion/react/jsx-runtime").JSX.Element;
