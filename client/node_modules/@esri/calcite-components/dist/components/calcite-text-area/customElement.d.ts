/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { LabelableComponent } from '../../utils/label';
import { NumberingSystem } from '../../utils/locale';
import { InteractiveComponent } from '../../utils/interactive';
import { Status } from '../interfaces';
import { TextualInputComponent } from '../calcite-input/common/input';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { Label } from '../calcite-label/customElement.js';

/**
 * @slot  - A slot for adding text.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 * @slot [footer-start] - A slot for adding content to the start of the component's footer.
 * @slot [footer-end] - A slot for adding content to the end of the component's footer.
 */
export declare class TextArea extends LitElement {
    /**
     * Specifies the component's number of columns.
     *
     * @mdn [cols](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-cols)
     */
    columns: number;
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
    /** Accessible name for the component. */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * When `true`, prevents input beyond the `maxLength` value, mimicking native text area behavior.
     *
     * @default false
     */
    limitText: boolean;
    /**
     * When the component resides in a form,
     * specifies the maximum number of characters allowed.
     *
     * @mdn [maxlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-maxlength)
     */
    maxLength: number;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When the component resides in a form,
     * specifies the minimum number of characters allowed.
     *
     * @mdn [minlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-minlength)
     */
    minLength: number;
    /**
     * Specifies the name of the component.
     *
     * @mdn [name](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-name)
     */
    name: string;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * Specifies the placeholder text for the component.
     *
     * @mdn [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-placeholder)
     */
    placeholder: string;
    /**
     * When `true`, the component's `value` can be read, but cannot be modified.
     *
     * @mdn [readOnly](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly)
     * @default false
     */
    readOnly: boolean;
    /**
     * When `true` and the component resides in a form,
     * the component must have a value in order for the form to submit.
     *
     * @mdn [required]https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/required
     * @default false
     */
    required: boolean;
    /**
     * Specifies if the component is resizable.
     *
     * @default "both"
     */
    resize: "both" | "horizontal" | "vertical" | "none";
    /**
     * Specifies the component's number of rows.
     *
     * @mdn [rows](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-rows)
     */
    rows: number;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: "l" | "m" | "s";
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
    /**
     * The component's value.
     *
     * @default ""
     */
    value: string;
    /**
     * Specifies the wrapping mechanism for the text.
     *
     * @mdn [wrap](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attr-wrap)
     * @default "soft"
     */
    wrap: "soft" | "hard";
    /** Selects the text of the component's `value`. */
    selectText(): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires each time a new `value` is typed and committed. */
    readonly calciteTextAreaChange: TargetedEvent<this, void>;
    /** Fires each time a new `value` is typed. */
    readonly calciteTextAreaInput: TargetedEvent<this, void>;
    private messages: {
        invalid: string;
        required: string;
        tooLong: string;
        tooShort: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        invalid: string;
        required: string;
        tooLong: string;
        tooShort: string;
    }>;
}
