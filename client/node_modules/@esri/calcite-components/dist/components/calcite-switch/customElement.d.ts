/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { CheckableFormComponent } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { Scale } from '../interfaces';
import { Label } from '../calcite-label/customElement.js';

export declare class Switch extends LitElement {
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
    /** Accessible name for the component. */
    label: string;
    /** When provided, displays label text at the end of the component */
    labelTextEnd: string;
    /** When provided, displays label text at the start of the component */
    labelTextStart: string;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** The component's value. */
    value: any;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the `checked` value has changed. */
    readonly calciteSwitchChange: TargetedEvent<this, void>;
}
