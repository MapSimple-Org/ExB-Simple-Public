import { React } from 'jimu-core';
import { type StandardComponentProps } from 'jimu-ui';
import type { RichPluginRequiredProps } from '../plugin';
interface ImageSelectorProps extends RichPluginRequiredProps, StandardComponentProps {
    /**
     * Update the version will update the deletable state of image selector.
     */
    version?: number;
    /**
     * The ID of the widget using this component.
     */
    widgetId: string;
    /**
     * To provide a label for interactive components for accessibility purposes.
     * By default, the accessible name is computed from any text content inside the element.
     */
    'aria-label'?: string;
    /**
     * Whether to automatically insert a space after the expression tag
     */
    autoInsertSpace?: boolean;
    /**
     * Whether the component is disabled.
     */
    disabled?: boolean;
}
export declare const ImageSelector: (props: ImageSelectorProps) => React.ReactElement;
export {};
