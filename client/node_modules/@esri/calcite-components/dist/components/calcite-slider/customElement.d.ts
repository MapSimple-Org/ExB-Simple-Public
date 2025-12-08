/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { NumberingSystem } from '../../utils/locale';
import { ColorStop, DataSeries } from '../calcite-graph/interfaces';
import { Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { Label } from '../calcite-label/customElement.js';
import { ActiveSliderProperty } from './interfaces';

/** @slot [label-content] - A slot for rendering content next to the component's `labelText`. */
export declare class Slider extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Used to configure where the fill is placed along the slider track in relation to the value handle.
     *
     * Range mode will always display the fill between the min and max handles.
     *
     * @default "start"
     */
    fillPlacement: "start" | "none" | "end";
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /**
     * When `true`, number values are displayed with a group separator corresponding to the language and country format.
     *
     * @default false
     */
    groupSeparator: boolean;
    /**
     * When `true`, indicates a histogram is present.
     *
     * @default false
     */
    hasHistogram: boolean;
    /**
     * A list of the histogram's x,y coordinates within the component's `min` and `max`. Displays above the component's track.
     *
     * @see [DataSeries](https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/src/components/graph/interfaces.ts#L5).
     */
    histogram: DataSeries;
    /** A set of single color stops for a histogram, sorted by offset ascending. */
    histogramStops: ColorStop[];
    /** When specified, allows users to customize handle labels. */
    labelFormatter: (value: number, type: "value" | "min" | "max" | "tick", defaultFormatter: (value: number) => string) => string | undefined;
    /**
     * When `true`, displays label handles with their numeric value.
     *
     * @default false
     */
    labelHandles: boolean;
    /**
     * When `true` and `ticks` is specified, displays label tick marks with their numeric value.
     *
     * @default false
     */
    labelTicks: boolean;
    /**
     * The component's maximum selectable value.
     *
     * @default 100
     */
    max: number;
    /** For multiple selections, the accessible name for the second handle, such as `"Temperature, upper bound"`. */
    maxLabel: string;
    /** For multiple selections, the component's upper value. */
    maxValue: number;
    /**
     * The component's minimum selectable value.
     *
     * @default 0
     */
    min: number;
    /** Accessible name for first (or only) handle, such as `"Temperature, lower bound"`. */
    minLabel: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** For multiple selections, the component's lower value. */
    minValue: number;
    /**
     * When `true`, the component will display values from high to low.
     *
     * Note that this value will be ignored if the slider has an associated histogram.
     *
     * @default false
     */
    mirrored: boolean;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /** Specifies the interval to move with the page up, or page down keys. */
    pageStep: number;
    /**
     * When `true`, sets a finer point for handles.
     *
     * @default false
     */
    precise: boolean;
    /**
     * When `true` and the component resides in a form,
     * the component must have a value in order for the form to submit.
     *
     * @default false
     */
    required: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, enables snap selection in coordination with `step` via a mouse.
     *
     * @default false
     */
    snap: boolean;
    /**
     * Specifies the status of the input field, which determines message and icons.
     *
     * @default "idle"
     */
    status: Status;
    /**
     * Specifies the interval to move with the up, or down keys.
     *
     * @default 1
     */
    step: number;
    /** Displays tick marks on the number line at a specified interval. */
    ticks: number;
    /** Specifies the validation icon to display under the component. */
    validationIcon: IconNameOrString | boolean;
    /** Specifies the validation message to display under the component. */
    validationMessage: string;
    /**
     * The current validation state of the component.
     *
     * @mdn [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState)
     */
    readonly validity: MutableValidityState;
    /**
     * The component's value.
     *
     * @default 0
     */
    value: null | number | number[];
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /**
     * Fires when the thumb is released on the component.
     *
     * Note: To constantly listen to the drag event,
     * use `calciteSliderInput` instead.
     */
    readonly calciteSliderChange: TargetedEvent<this, void>;
    /**
     * Fires on all updates to the component.
     *
     * Note: Fires frequently during drag. To perform
     * expensive operations consider using a debounce or throttle to avoid
     * locking up the main thread.
     */
    readonly calciteSliderInput: TargetedEvent<this, void>;
    private messages: Partial<{
        required: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        required: string;
    }>;
}
