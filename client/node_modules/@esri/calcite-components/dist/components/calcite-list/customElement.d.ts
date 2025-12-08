/// <reference path="../../index.d.ts" />
import { default as Sortable } from 'sortablejs';
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { InteractionMode, Scale, SelectionMode } from '../interfaces';
import { ItemData } from '../calcite-list-item/interfaces';
import { SortableComponent } from '../../utils/sortableComponent';
import { NumberingSystem } from '../../utils/locale';
import { SortMenuItem } from '../calcite-sort-handle/interfaces';
import { ListItem } from '../calcite-list-item/customElement.js';
import { Filter } from '../calcite-filter/customElement.js';
import { SelectionAppearance } from './resources';
import { ListDisplayMode, ListDragDetail } from './interfaces';

/**
 * A general purpose list that enables users to construct list items that conform to Calcite styling.
 *
 * @slot  - A slot for adding `calcite-list-item` and `calcite-list-item-group` elements.
 * @slot [filter-actions-start] - A slot for adding actionable `calcite-action` elements before the filter component.
 * @slot [filter-actions-end] - A slot for adding actionable `calcite-action` elements after the filter component.
 * @slot [filter-no-results] - When `filterEnabled` is `true`, a slot for adding content to display when no results are found.
 */
export declare class List extends LitElement {
    /** When provided, the method will be called to determine whether the element can move from the list. */
    canPull: (detail: ListDragDetail) => boolean | "clone";
    /** When provided, the method will be called to determine whether the element can be added from another list. */
    canPut: (detail: ListDragDetail) => boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, `calcite-list-item`s are sortable via a draggable button.
     *
     * @default false
     */
    dragEnabled: boolean;
    /**
     * When `true`, an input appears at the top of the component that can be used by end users to filter `calcite-list-item`s.
     *
     * @default false
     */
    filterEnabled: boolean;
    /**
     * Specifies a function to handle filtering.
     *
     * @example
     * myList.filterPredicate = (myListItem) => {
     *   // returns true to show the list item if some condition is met
     *   return myListItem.label.includes("someValue");
     * };
     */
    filterPredicate?: (item: HTMLCalciteListItemElement) => boolean;
    /** Specifies an accessible name for the filter input field. */
    filterLabel: string;
    /** Placeholder text for the component's filter input field. */
    filterPlaceholder: string;
    /** Specifies the properties to match against when filtering. If not set, all properties will be matched (`description`, `label`, `metadata`, and the `calcite-list-item-group`'s `heading`). */
    filterProps: string[];
    /** Text for the component's filter input field. */
    filterText: string;
    /** The currently filtered `calcite-list-item` data. */
    readonly filteredData: ItemData[];
    /** The currently filtered `calcite-list-item`s. */
    readonly filteredItems: HTMLCalciteListItemElement[];
    /**
     * The list's group identifier.
     *
     * To drag elements from one list into another, both lists must have the same group value.
     */
    group?: string;
    /**
     * Specifies the interaction mode of the component.
     *
     * `"interactive"` allows interaction styling and pointer changes on hover
     *
     * `"static"` does not allow interaction styling and pointer changes on hover
     *
     * The `"static"` value should only be used when `selectionMode` is `"none"`.
     *
     * @default "interactive"
     */
    interactionMode: InteractionMode;
    /**
     * Specifies an accessible name for the component.
     *
     * When `dragEnabled` is `true` and multiple list sorting is enabled with `group`, specifies the component's name for dragging between lists.
     *
     * @required
     */
    label: string;
    /**
     * When `true`, a busy indicator is displayed.
     *
     * @default false
     */
    loading: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Specifies the nesting behavior of `calcite-list-item`s, where
     *
     * `"flat"` displays `calcite-list-item`s in a uniform list, and
     *
     * `"nested"` displays `calcite-list-item`s under their parent element.
     *
     *  The parent component's behavior should follow throughout its child elements.
     *
     * @default "flat"
     */
    displayMode: ListDisplayMode;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** The currently selected items. */
    readonly selectedItems: HTMLCalciteListItemElement[];
    /**
     * Specifies the selection appearance - `"icon"` (displays a checkmark or dot) or `"border"` (displays a border).
     *
     * @default "icon"
     */
    selectionAppearance: SelectionAppearance;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"multiple"` allows any number of selections,
     *
     * `"single"` allows only one selection,
     *
     * `"single-persist"` allows one selection and prevents de-selection, and
     *
     * `"none"` does not allow any selections.
     *
     * @default "none"
     */
    selectionMode: Extract<"none" | "multiple" | "single" | "single-persist", SelectionMode>;
    /**
     * When `true`, and a `group` is defined, `calcite-list-item`s are no longer sortable.
     *
     * @default false
     */
    sortDisabled: boolean;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     * @returns
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's selected items have changed. */
    readonly calciteListChange: TargetedEvent<this, void>;
    /** Fires when the component's dragging has ended. */
    readonly calciteListDragEnd: TargetedEvent<this, ListDragDetail>;
    /** Fires when the component's dragging has started. */
    readonly calciteListDragStart: TargetedEvent<this, ListDragDetail>;
    /** Fires when the component's filter has changed. */
    readonly calciteListFilter: TargetedEvent<this, void>;
    /**
     * Fires when a user attempts to move an element using the sort menu and 'canPut' or 'canPull' returns falsy.
     *
     * @deprecated No longer necessary.
     */
    readonly calciteListMoveHalt: TargetedEvent<this, ListDragDetail>;
    /** Fires when the component's item order changes. */
    readonly calciteListOrderChange: TargetedEvent<this, ListDragDetail>;
    private messages: {
        filterEnabled: string;
        total: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        filterEnabled: string;
        total: string;
    }>;
}
