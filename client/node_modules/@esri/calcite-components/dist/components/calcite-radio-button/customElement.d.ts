/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { CheckableFormComponent } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { Scale } from '../interfaces';
import { Label } from '../calcite-label/customElement.js';

export declare class RadioButton extends LitElement {
    /**
     * When `true`, the component is checked.
     *
     * @default false
     */
    checked: boolean;
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
    /**
     * Specifies the name of the component. Can be inherited from `calcite-radio-button-group`.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /**
     * When `true` and the component resides in a form,
     * the component must have a value selected from the `calcite-radio-button-group` in order for the form to submit.
     *
     * @default false
     */
    required: boolean;
    /**
     * Specifies the size of the component inherited from the `calcite-radio-button-group`.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * The component's value.
     *
     * @required
     */
    value: any;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /**
     * Fires only when the radio button is checked.  This behavior is identical to the native HTML input element.
     * Since this event does not fire when the radio button is unchecked, it's not recommended to attach a listener for this event
     * directly on the element, but instead either attach it to a node that contains all of the radio buttons in the group
     * or use the `calciteRadioButtonGroupChange` event if using this with `calcite-radio-button-group`.
     */
    readonly calciteRadioButtonChange: TargetedEvent<this, void>;
}
