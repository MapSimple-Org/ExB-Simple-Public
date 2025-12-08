/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, FloatingUIComponent, LogicalPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { FormComponent, MutableValidityState } from '../../utils/form';
import { InteractiveComponent } from '../../utils/interactive';
import { LabelableComponent } from '../../utils/label';
import { OpenCloseComponent } from '../../utils/openCloseComponent';
import { Scale, SelectionMode, Status } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { ComboboxItem as HTMLCalciteComboboxItemElement } from '../calcite-combobox-item/customElement.js';
import { Label } from '../calcite-label/customElement.js';
import { SelectionDisplay } from './interfaces';

/**
 * @slot  - A slot for adding `calcite-combobox-item`s.
 * @slot [label-content] - A slot for rendering content next to the component's `labelText`.
 */
export declare class Combobox extends LitElement {
    /**
     * When `true`, allows entry of custom values, which are not in the original set of items.
     *
     * @default false
     */
    allowCustomValues: boolean;
    /**
     * When `true`, the value-clearing will be disabled.
     *
     * @default false
     */
    clearDisabled: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Text for the component's filter input field. */
    get filterText(): string;
    set filterText(filterText: string);
    /** Specifies the properties to match against when filtering. If not set, all properties will be matched (`description`, `label`, `metadata`, `shortHeading`). */
    filterProps: string[];
    /** Specifies the component's filtered items. */
    get filteredItems(): HTMLCalciteComboboxItemElement["el"][];
    /** Specifies the component's fallback slotted content placement when it's initial placement has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** When provided, displays label text on the component. */
    labelText: string;
    /**
     * Specifies the maximum number of `calcite-combobox-item`s (including nested children) to display before displaying a scrollbar.
     *
     * @default 0
     */
    maxItems: number;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
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
    /** Specifies the placeholder text for the input. */
    placeholder: string;
    /** Specifies the placeholder icon for the input. */
    placeholderIcon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    placeholderIconFlipRtl: boolean;
    /**
     * When `true`, the component's value can be read, but controls are not accessible and the value cannot be modified.
     *
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
     * When `true` and `selectionMode` is `"multiple"` or `"ancestors"`, provides a checkbox for selecting all `calcite-combobox-item`s.
     *
     * @default false
     */
    selectAllEnabled: boolean;
    /** Specifies the component's selected items. */
    get selectedItems(): HTMLCalciteComboboxItemElement["el"][];
    /**
     * When `selectionMode` is `"ancestors"` or `"multiple"`, specifies the display of multiple `calcite-combobox-item` selections, where:
     *
     * `"all"` displays all selections with individual `calcite-chip`s,
     *
     * `"fit"` displays individual `calcite-chip`s that scale to the component's size, including a non-closable `calcite-chip`, which provides the number of additional `calcite-combobox-item` selections not visually displayed, and
     *
     * `"single"` displays one `calcite-chip` with the total number of selections.
     *
     * @default "all"
     */
    selectionDisplay: SelectionDisplay;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"multiple"` allows any number of selections,
     *
     * `"single"` allows only one selection,
     *
     * `"single-persist"` allows one selection and prevents de-selection, and
     *
     * `"ancestors"` allows multiple selections, but shows ancestors of selected items as selected, with only deepest children shown in chips.
     *
     * @default "multiple"
     */
    selectionMode: Extract<"single" | "single-persist" | "ancestors" | "multiple", SelectionMode>;
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
    /** The component's value(s) from the selected `calcite-combobox-item`(s). */
    get value(): string | string[];
    set value(value: string | string[]);
    /**
     * Updates the position of the component.
     *
     * @param delayed Reposition the component after a delay
     * @returns Promise
     */
    reposition(delayed?: boolean): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component is requested to be closed, and before the closing transition begins. */
    readonly calciteComboboxBeforeClose: TargetedEvent<this, void>;
    /** Fires when the component is added to the DOM but not rendered, and before the opening transition begins. */
    readonly calciteComboboxBeforeOpen: TargetedEvent<this, void>;
    /** Fires when the selected item(s) changes. */
    readonly calciteComboboxChange: TargetedEvent<this, void>;
    /** Fires when a selected item in the component is closed via its `calcite-chip`. */
    readonly calciteComboboxChipClose: TargetedEvent<this, void>;
    /** Fires when the component is closed and animation is complete. */
    readonly calciteComboboxClose: TargetedEvent<this, void>;
    /** Fires when text is added to filter the options list. */
    readonly calciteComboboxFilterChange: TargetedEvent<this, void>;
    /** Fires when the component is open and animation is complete. */
    readonly calciteComboboxOpen: TargetedEvent<this, void>;
    private messages: Partial<{
        add: string;
        all: string;
        allSelected: string;
        clear: string;
        noMatches: string;
        removeTag: string;
        required: string;
        selectAll: string;
        selected: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        add: string;
        all: string;
        allSelected: string;
        clear: string;
        noMatches: string;
        removeTag: string;
        required: string;
        selectAll: string;
        selected: string;
    }>;
}
