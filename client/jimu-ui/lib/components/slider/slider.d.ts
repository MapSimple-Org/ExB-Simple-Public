import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `Slider` component props.
 *
 */
export interface SliderProps extends StandardComponentProps {
    /**
     * The unique id added to the element.
     */
    id?: string;
    /**
     * Defines the title added to the element.
     */
    title?: string;
    /**
     * To provide a label for interactive components for accessibility purposes
     */
    'aria-label'?: string;
    /**
     * A string value that provides a user-friendly name for the current value of the slider.
     * It's recommended to use the `props.formatter` to construct `aria-valuetext` based on the value.
     */
    'aria-valuetext'?: string;
    /**
     * Value of the id attribute of the <datalist> of autocomplete options
     */
    list?: string;
    /**
     * Whether to hide the thumb.
     */
    hideThumb?: boolean;
    /**
     * To define the size of the button.
     * @default default
     */
    size?: 'default' | 'lg';
    /**
     * The default element value. Use when the component is not controlled.
     */
    defaultValue?: number;
    /**
     * The value of the slider.
     */
    value?: number;
    /**
     * The minimum allowed value of the slider. Should not be equal to max.
     * @default 0
     */
    min?: number;
    /**
     * The maximum allowed value of the slider. Should not be equal to min.
     * @default 100
     */
    max?: number;
    /**
     * Whether to display labels tooltip when the mouse hovers over the component.
     * @default false
     */
    tooltip?: boolean;
    /**
     * A formatter function that takes `value` as a parameter; its return value will be used in the tooltip and as `aria-valuetext` (if `aria-valuetext` is not explicitly provided).
     * @param value
     */
    formatter?: (value: number) => string;
    /**
     * The granularity with which the slider can step through values.
     * @default 1
     */
    step?: number;
    /**
     * The component's base z-index.
     * Since the elements in the component rely on absolute layout to stack together, so different z-indexes are needed to control the hierarchical relationship.
     * @default 0
     */
    baseZindex?: number;
    /**
     * Whether this component is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * The visibility of the runnable track.
     * @default true
     */
    runnableTrackVisibility?: boolean;
    /**
     * Callback function that is fired when the slider's value changed.
     * @event
     */
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
}
/**
 * The `Slider` component is provided to the user for selection of a number, or a range of numbers, within a bounded range.
 *
 * ```ts
 * import { Slider } from 'jimu-ui'
 * ```
 */
export declare const Slider: React.ForwardRefExoticComponent<SliderProps & React.RefAttributes<HTMLInputElement>>;
