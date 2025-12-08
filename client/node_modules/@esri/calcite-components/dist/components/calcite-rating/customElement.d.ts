/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { Label } from '../calcite-label/customElement.js';

/** @slot [label-content] - A slot for rendering content next to the component's `labelText`. */
export declare class Rating extends LitElement {
    /** Specifies a cumulative average from previous ratings to display. */
    average: number;
    /** Specifies the number of previous ratings to display. */
    count: number;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /**
     * When `true`, the component's value can be read, but cannot be modified.
     *
     * @default false
     */
    readOnly: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, and if available, displays the `average` and/or `count` data summary in a `calcite-chip`.
     *
     * @default false
     */
    showChip: boolean;
    /**
     * Specifies the status of the input field, which determines message and icons.
     *
     * @default "idle"
     */
    status: Status;
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
    /** The component's value. */
    get value(): number;
    set value(value: number);
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's value changes. */
    readonly calciteRatingChange: TargetedEvent<this, void>;
    private messages: {
        rating: string;
        required: string;
        stars: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        rating: string;
        required: string;
        stars: string;
    }>;
}
