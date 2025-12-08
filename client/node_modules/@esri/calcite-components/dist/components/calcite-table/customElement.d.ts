/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { Scale, SelectionMode } from '../interfaces';
import { NumberingSystem } from '../../utils/locale';
import { TableRow } from '../calcite-table-row/customElement.js';
import { TableInteractionMode, TableLayout, TableRowFocusEvent, TableSelectionDisplay } from './interfaces';

/**
 * @slot  - A slot for adding `calcite-table-row` elements containing `calcite-table-cell` and/or `calcite-table-header` elements.
 * @slot [table-header] - A slot for adding `calcite-table-row` elements containing `calcite-table-header` elements.
 * @slot [table-footer] - A slot for adding `calcite-table-row` elements containing `calcite-table-cell` and/or `calcite-table-header` elements.
 * @slot [selection-actions] - A slot for adding `calcite-actions` or other elements to display when `selectionMode` is not `"none"` and `selectionDisplay` is not `"none"`.
 */
export declare class Table extends LitElement {
    /**
     * When `true`, displays borders in the component.
     *
     * @default false
     */
    bordered: boolean;
    /**
     * Specifies an accessible title for the component.
     *
     * @required
     */
    caption: string;
    /**
     * When `true`, number values are displayed with a group separator corresponding to the language and country format.
     *
     * @default false
     */
    groupSeparator: boolean;
    /**
     * When `"interactive"`, allows focus and keyboard navigation of `table-header`s and `table-cell`s.  When `"static"`, prevents focus and keyboard navigation of `table-header`s and `table-cell`s when assistive technologies are not active. Selection affordances and slotted content within `table-cell`s remain focusable.
     *
     * @default "interactive"
     */
    interactionMode: TableInteractionMode;
    /**
     * Specifies the layout of the component.
     *
     * @default "auto"
     */
    layout: TableLayout;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, displays the position of the row in numeric form.
     *
     * @default false
     */
    numbered: boolean;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem?: NumberingSystem;
    /**
     * Specifies the page size of the component. When present, renders `calcite-pagination`.
     *
     * @default 0
     */
    pageSize: number;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies the component's selected items. */
    get selectedItems(): HTMLCalciteTableRowElement[];
    /**
     * Specifies the display of the selection interface when `selection-mode` is not `"none"`. When `"none"`, content slotted the `selection-actions` slot will not be displayed.
     *
     * @default "top"
     */
    selectionDisplay: TableSelectionDisplay;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"multiple"` allows any number of selections,
     *
     * `"single"` allows only one selection, and
     *
     * `"none"` does not allow any selections.
     *
     * @default "none"
     */
    selectionMode: Extract<"none" | "multiple" | "single", SelectionMode>;
    /**
     * When `true`, displays striped styling in the component.
     *
     * @default false
     */
    striped: boolean;
    /** Emits when the component's page selection changes. */
    readonly calciteTablePageChange: TargetedEvent<this, void>;
    /** Emits when the component's selected rows change. */
    readonly calciteTableSelect: TargetedEvent<this, void>;
    private messages: {
        clear: string;
        hiddenSelected: string;
        page: string;
        row: string;
        selected: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        clear: string;
        hiddenSelected: string;
        page: string;
        row: string;
        selected: string;
    }>;
}
