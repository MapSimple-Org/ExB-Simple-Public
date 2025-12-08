/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { LogicalPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { NumberingSystem } from '../../utils/locale';
import { HourFormat } from '../../utils/time';
import { Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { TimePicker } from '../calcite-time-picker/customElement.js';
import { Label } from '../calcite-label/customElement.js';
import { TimeComponent } from '../../controllers/useTime';

/** @slot [label-content] - A slot for rendering content next to the component's `labelText`. */
export declare class InputTimePicker extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, prevents focus trapping.
     *
     * @default false
     */
    focusTrapDisabled: boolean;
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /**
     * Specifies the component's hour format, where:
     *
     * `"user"` displays the user's locale format,
     * `"12"` displays a 12-hour format, and
     * `"24"` displays a 24-hour format.
     *
     * @default "user"
     */
    hourFormat: HourFormat;
    /** Accessible name for the component. */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * When the component resides in a form,
     * specifies the maximum value.
     *
     * @mdn [max](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#max)
     */
    max: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides & TimePicker["messageOverrides"];
    /**
     * When the component resides in a form,
     * specifies the minimum value.
     *
     * @mdn [min](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#min)
     */
    min: string;
    /** Specifies the name of the component on form submission. */
    name: string;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * When `true`, displays the `calcite-time-picker` component.
     *
     * @default false
     */
    open: boolean;
    /**
     * Determines the type of positioning to use for the overlaid content.
     *
     * Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout.
     *
     * `"fixed"` should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
     *
     * @default "absolute"
     */
    overlayPositioning: OverlayPositioning;
    /**
     * Determines where the popover will be positioned relative to the input.
     *
     * @default "auto"
     */
    placement: LogicalPlacement;
    /**
     * When `true`, the component's value can be read, but controls are not accessible and the value cannot be modified.
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
     * Specifies the granularity the component's `value` must adhere to (in seconds).
     *
     * @default 60
     */
    step: number;
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
    /** The time value in ISO (24-hour) format. */
    value: string;
    /**
     * Updates the position of the component.
     *
     * @param delayed If true, delay the repositioning.
     */
    reposition(delayed?: boolean): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteInputTimePickerBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteInputTimePickerBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component's `value` is modified by the user. */
    readonly calciteInputTimePickerChange: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteInputTimePickerClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteInputTimePickerOpen: TargetedEvent<this, void>;
    private messages: Partial<{
        chooseTime: string;
        fractionalSecond: string;
        fractionalSecondDown: string;
        fractionalSecondUp: string;
        hour: string;
        hourDown: string;
        hourUp: string;
        meridiem: string;
        meridiemDown: string;
        meridiemUp: string;
        minute: string;
        minuteDown: string;
        minuteUp: string;
        required: string;
        second: string;
        secondDown: string;
        secondUp: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        chooseTime: string;
        fractionalSecond: string;
        fractionalSecondDown: string;
        fractionalSecondUp: string;
        hour: string;
        hourDown: string;
        hourUp: string;
        meridiem: string;
        meridiemDown: string;
        meridiemUp: string;
        minute: string;
        minuteDown: string;
        minuteUp: string;
        required: string;
        second: string;
        secondDown: string;
        secondUp: string;
    }>;
}
