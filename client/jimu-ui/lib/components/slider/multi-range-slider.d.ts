import { React } from 'jimu-core';
import type { StandardComponentProps } from '../types';
/**
 * The `MultiRangeSlider` component props.
 */
export interface MultiRangeSliderProps extends StandardComponentProps {
    /**
     * To provide a label for interactive components for accessibility purposes
     */
    'aria-label'?: string;
    /**
     * A string value that provides a user-friendly name for the minimum value of the slider.
     */
    'aria-valuetext-min'?: string;
    /**
     * A string value that provides a user-friendly name for the maximum value of the slider.
     */
    'aria-valuetext-max'?: string;
    /**
     * The component's base z-index.
     * Since the elements in the component rely on absolute layout to stack together, so different z-indexes are needed to control the hierarchical relationship.
     * @default 0
     */
    baseZindex?: number;
    /**
     * The default minimum value. Use when the component is not controlled.
     */
    defaultMinValue?: number;
    /**
     * The default maximum value. Use when the component is not controlled.
     */
    defaultMaxValue?: number;
    /**
     * The minimum value. Use when the component is controlled.
     */
    minValue?: number;
    /**
     * The maximum value. Use when the component is controlled.
     */
    maxValue?: number;
    /**
     * The granularity with which the slider can step through values.
     * @default 1
     */
    step?: number;
    /**
     * The minimum allowed value of the component. Should not be equal to max.
     * @default 0
     */
    min?: number;
    /**
     * The maximum allowed value of the component. Should not be equal to min.
     * @default 100
     */
    max?: number;
    /**
     * Whether to display labels tooltip when the mouse hovers over the component.
     * @default false
     */
    tooltip?: boolean;
    /**
     * Whether this component is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Fired when the slider's value changed.
     * @param {number} minValue The minimum value.
     * @param {number} maxValue The maximum value.
     * @param {number} activeThumb Index of the currently moved thumb.
     * @event
     */
    onChange?: (minValue: number, maxValue: number, activeThumb: number) => void;
    /**
     * Fired after the slider slides.
     * @param {number} minValue The minimum value.
     * @param {number} maxValue The maximum value.
     * @param {number} activeThumb Index of the currently moved thumb.
     * @event
     */
    onAcceptValue?: (minValue: number, maxValue: number, activeThumb: number) => void;
}
/**
 * The `MultiRangeSlider` component is provided to the user for selection of multiple ranges of numbers within a bounded range.
 *
 * ```ts
 * import { MultiRangeSlider } from 'jimu-ui'
 * ```
 */
export declare const MultiRangeSlider: React.ForwardRefExoticComponent<MultiRangeSliderProps & React.RefAttributes<HTMLDivElement>>;
