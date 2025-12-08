/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { Appearance, Layout, Scale, Status, Width } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { SegmentedControlItem } from '../calcite-segmented-control-item/customElement.js';
import { Label } from '../calcite-label/customElement.js';

/**
 * @slot  - A slot for adding `calcite-segmented-control-item`s.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 */
export declare class SegmentedControl extends LitElement {
    /**
     * Specifies the appearance style of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"outline" | "outline-fill" | "solid", Appearance>;
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
    /**
     * Defines the layout of the component.
     *
     * @default "horizontal"
     */
    layout: Extract<"horizontal" | "vertical", Layout>;
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
    /** The component's selected item `HTMLElement`. */
    readonly selectedItem: HTMLCalciteSegmentedControlItemElement;
    /**
     * Specifies the status of the validation message.
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
    /** The component's `selectedItem` value. */
    value: string;
    /**
     * Specifies the width of the component. [Deprecated] The `"half"` value is deprecated, use `"full"` instead.
     *
     * @default "auto"
     */
    width: Extract<"auto" | "full", Width>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the `calcite-segmented-control-item` selection changes. */
    readonly calciteSegmentedControlChange: TargetedEvent<this, void>;
    private messages: Partial<{
        required: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        required: string;
    }>;
}
