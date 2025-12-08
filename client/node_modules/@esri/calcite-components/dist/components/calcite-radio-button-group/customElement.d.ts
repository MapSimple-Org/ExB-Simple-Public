/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Layout, Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { RadioButton } from '../calcite-radio-button/customElement.js';

/**
 * @slot  - A slot for adding `calcite-radio-button`s.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 */
export declare class RadioButtonGroup extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * Defines the layout of the component. [Deprecated] The `"grid"` value is deprecated, use `"horizontal"` instead.
     *
     * @default "horizontal"
     */
    layout: Extract<"horizontal" | "vertical" | "grid", Layout>;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the name of the component on form submission. Must be unique to other component instances.
     *
     * @required
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
    /** Specifies the component's selected item. */
    readonly selectedItem: HTMLCalciteRadioButtonElement;
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
     * Sets focus on the fist focusable `calcite-radio-button` element in the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component has changed. */
    readonly calciteRadioButtonGroupChange: TargetedEvent<this, void>;
    private messages: Partial<{
        required: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        required: string;
    }>;
}
