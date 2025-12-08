/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, FloatingUIComponent, MenuPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { NumberingSystem } from '../../utils/locale';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { HeadingLevel } from '../functional/Heading';
import { Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { DatePicker } from '../calcite-date-picker/customElement.js';
import { Label } from '../calcite-label/customElement.js';

/** @slot [label-content] - A slot for rendering content next to the component's `labelText`. */
export declare class InputDatePicker extends LitElement {
    /**
     * Specifies the number of calendars displayed when `range` is `true`.
     *
     * @default 2
     */
    calendars: 1 | 2;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies the component's fallback `calcite-date-picker` `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
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
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
    /** Accessible name for the component. */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * Defines the layout of the component.
     *
     * @default "horizontal"
     */
    layout: "horizontal" | "vertical";
    /**
     * When the component resides in a form,
     * specifies the latest allowed date ("yyyy-mm-dd").
     */
    max: string;
    /** Specifies the latest allowed date as a full date object. */
    maxAsDate: Date;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides & DatePicker["messageOverrides"];
    /**
     * When the component resides in a form,
     * specifies the earliest allowed date ("yyyy-mm-dd").
     */
    min: string;
    /** Specifies the earliest allowed date as a full date object. */
    minAsDate: Date;
    /**
     * Specifies the monthStyle used by the component.
     *
     * @default "wide"
     */
    monthStyle: "abbreviated" | "wide";
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /** Specifies the Unicode numeral system used by the component for localization. This property cannot be dynamically changed. */
    numberingSystem: NumberingSystem;
    /**
     * When `true`, displays the `calcite-date-picker` component.
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
     * Specifies the placement of the `calcite-date-picker` relative to the component.
     *
     * @default "bottom-start"
     */
    placement: MenuPlacement;
    /**
     * When `true`, disables the default behavior on the third click of narrowing or extending the range.
     * Instead starts a new range.
     *
     * @default false
     */
    proximitySelectionDisabled: boolean;
    /**
     * When `true`, activates a range for the component.
     *
     * @default false
     */
    range: boolean;
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
    scale: "s" | "m" | "l";
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
    /** Selected date as a string in ISO format (`"yyyy-mm-dd"`). */
    get value(): string | string[];
    set value(value: string | string[]);
    /** The component's value as a full date object. */
    valueAsDate: Date | Date[];
    /**
     * Updates the position of the component.
     *
     * @param delayed If true, the repositioning is delayed.
     * @returns void
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
    readonly calciteInputDatePickerBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteInputDatePickerBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the component's `value` changes. */
    readonly calciteInputDatePickerChange: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteInputDatePickerClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteInputDatePickerOpen: TargetedEvent<this, void>;
    private messages: {
        chooseDate: string;
        date: string;
        dateFormat: string;
        endDate: string;
        required: string;
        startDate: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        chooseDate: string;
        date: string;
        dateFormat: string;
        endDate: string;
        required: string;
        startDate: string;
    }>;
}
