/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Alignment, Scale, Status } from '../interfaces';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { NumberingSystem } from '../../utils/locale';
import { InputPlacement } from '../calcite-input/interfaces';
import { NumericInputComponent, TextualInputComponent } from '../calcite-input/common/input';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { Label } from '../calcite-label/customElement.js';

/**
 * @slot [action] - A slot for positioning a `calcite-action` or other interactive content.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 */
export declare class InputNumber extends LitElement {
    /**
     * Specifies the text alignment of the component's value.
     *
     * @default "start"
     */
    alignment: Alignment;
    /**
     * Specifies the type of content to autocomplete, for use in forms.
     * Read the native attribute's documentation on MDN for more info.
     *
     * @mdn [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
     */
    autocomplete: AutoFill;
    /**
     * When `true`, a clear button is displayed when the component has a value.
     *
     * @default false
     */
    clearable: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @mdn [disabled](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled)
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
     * When `true`, number values are displayed with a group separator corresponding to the language and country format.
     *
     * @default false
     */
    groupSeparator: boolean;
    /**
     * Specifies an icon to display.
     *
     * @futureBreaking Remove boolean type as it is not supported.
     */
    icon: IconNameOrString | boolean;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * When `true`, restricts the component to integer numbers only and disables exponential notation.
     *
     * @default false
     */
    integer: boolean;
    /** Accessible name for the component's button or hyperlink. */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * When `true`, the component is in the loading state and `calcite-progress` is displayed.
     *
     * @default false
     */
    loading: boolean;
    /**
     * When the component resides in a form,
     * specifies the maximum value.
     *
     * @mdn [max](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#max)
     */
    max: number;
    /**
     * When the component resides in a form,
     * specifies the maximum length of text for the component's value.
     *
     * @mdn [maxlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength)
     * @deprecated This property has no effect on the component.
     */
    maxLength: number;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When the component resides in a form,
     * specifies the minimum value.
     *
     * @mdn [min](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#min)
     */
    min: number;
    /**
     * When the component resides in a form,
     * specifies the minimum length of text for the component's value.
     *
     * @mdn [minlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength)
     * @deprecated This property has no effect on the component.
     */
    minLength: number;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     *
     * @mdn [name](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#name)
     */
    name: string;
    /**
     * Specifies the placement of the buttons.
     *
     * @default "vertical"
     */
    numberButtonType: InputPlacement;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * Specifies placeholder text for the component.
     *
     * @mdn [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder)
     */
    placeholder: string;
    /** Adds text to the start of the component. */
    prefixText: string;
    /**
     * When `true`, the component's value can be read, but cannot be modified.
     *
     * @mdn [readOnly](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)
     * @default false
     */
    readOnly: boolean;
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
     * Specifies the status of the input field, which determines message and icons.
     *
     * @default "idle"
     */
    status: Status;
    /**
     * Specifies the granularity that the component's value must adhere to.
     *
     * @mdn [step](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/step)
     */
    step: number | "any";
    /** Adds text to the end of the component. */
    suffixText: string;
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
    get value(): string;
    set value(value: string);
    /** Selects the text of the component's `value`. */
    selectText(): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires each time a new value is typed and committed. */
    readonly calciteInputNumberChange: TargetedEvent<this, void>;
    /** Fires each time a new value is typed. */
    readonly calciteInputNumberInput: TargetedEvent<this, void>;
    private messages: Partial<{
        clear: string;
        loading: string;
        required: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        clear: string;
        loading: string;
        required: string;
    }>;
}
