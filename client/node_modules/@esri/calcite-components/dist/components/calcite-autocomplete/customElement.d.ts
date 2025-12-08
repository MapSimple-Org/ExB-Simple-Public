/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, FloatingLayout, FloatingUIComponent, MenuPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { InteractiveComponent } from '../../utils/interactive';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Alignment, Scale, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { LabelableComponent } from '../../utils/label';
import { TextualInputComponent } from '../calcite-input/common/input';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { Input } from '../calcite-input/customElement.js';
import { AutocompleteItem } from '../calcite-autocomplete-item/customElement.js';
import { AutocompleteItemGroup } from '../calcite-autocomplete-item-group/customElement.js';
import { Label } from '../calcite-label/customElement.js';

/**
 * @slot  - A slot for adding `calcite-autocomplete-item` elements.
 * @slot [content-bottom] - A slot for adding content below `calcite-autocomplete-item` elements.
 * @slot [content-top] - A slot for adding content above `calcite-autocomplete-item` elements.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 */
export declare class Autocomplete extends LitElement {
    /**
     * Specifies the text alignment of the component's value.
     *
     * @default "start"
     */
    alignment: Extract<"start" | "end", Alignment>;
    /**
     * Specifies the type of content to autocomplete, for use in forms.
     * Read the native attribute's documentation on MDN for more info.
     *
     * @mdn [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete)
     */
    autocomplete: AutoFill;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies the component's fallback `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /** When `true`, shows a default recommended icon. Alternatively, pass a Calcite UI Icon name to display a specific icon. */
    icon: IconNameOrString | boolean;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /** The component's input value. */
    inputValue: string;
    /** Accessible name for the component. */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /**
     * When the component resides in a form,
     * specifies the maximum length of text for the component's value.
     *
     * @mdn [maxlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#maxlength)
     */
    maxLength: number;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When the component resides in a form,
     * specifies the minimum length of text for the component's value.
     *
     * @mdn [minlength](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#minlength)
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
     * When `true`, displays and positions the component.
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
     * When the component resides in a form,
     * specifies a regular expression (regex) pattern the component's `value` must match for validation.
     * Read the native attribute's documentation on MDN for more info.
     *
     * @mdn [step](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/pattern)
     */
    pattern: string;
    /**
     * Specifies placeholder text for the component.
     *
     * @mdn [placeholder](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#placeholder)
     */
    placeholder: string;
    /**
     * Determines where the component will be positioned relative to the container element.
     *
     * @default "bottom-start"
     */
    placement: MenuPlacement;
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
    /**
     * The component's value.
     *
     * @default ""
     */
    value: string;
    /**
     * Updates the position of the component.
     *
     * @param delayed - `true` if the placement should be updated after the component is finished rendering.
     * @returns
     */
    reposition(delayed?: boolean): Promise<void>;
    /**
     * Scrolls the component's content to a specified set of coordinates.
     *
     * @example
     * myAutocomplete.scrollContentTo({
     *   left: 0, // Specifies the number of pixels along the X axis to scroll the window or element.
     *   top: 0, // Specifies the number of pixels along the Y axis to scroll the window or element
     *   behavior: "auto" // Specifies whether the scrolling should animate smoothly (smooth), or happen instantly in a single jump (auto, the default value).
     * });
     * @param options - allows specific coordinates to be defined.
     * @returns - promise that resolves once the content is scrolled to.
     */
    scrollContentTo(options?: ScrollToOptions): Promise<void>;
    /**
     * Selects the text of the component's `value`.
     *
     * @returns
     */
    selectText(): Promise<void>;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     * @returns
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is requested to be closed and before the closing transition begins. */
    readonly calciteAutocompleteBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteAutocompleteBeforeOpen: TargetedEvent<this, void>;
    /** Fires each time a new `value` is typed and committed. */
    readonly calciteAutocompleteChange: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteAutocompleteClose: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteAutocompleteOpen: TargetedEvent<this, void>;
    /** Fires each time a new `inputValue` is typed and committed. */
    readonly calciteAutocompleteTextChange: TargetedEvent<this, void>;
    /** Fires each time a new `inputValue` is typed. */
    readonly calciteAutocompleteTextInput: TargetedEvent<this, void>;
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
