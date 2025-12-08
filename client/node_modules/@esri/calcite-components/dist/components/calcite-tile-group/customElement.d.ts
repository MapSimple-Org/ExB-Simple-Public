/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Alignment, Layout, Scale, SelectionAppearance, SelectionMode } from '../interfaces';
import { SelectableGroupComponent } from '../../utils/selectableComponent';
import { Tile } from '../calcite-tile/customElement.js';

/** @slot  - A slot for adding `calcite-tile` elements. */
export declare class TileGroup extends LitElement {
    /**
     * Specifies the alignment of each `calcite-tile`'s content.
     *
     * @default "start"
     */
    alignment: Exclude<Alignment, "end">;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /**
     * Defines the layout of the component.
     *
     * Use `"horizontal"` for rows, and `"vertical"` for a single column.
     *
     * @default "horizontal"
     */
    layout: Extract<Layout, "horizontal" | "vertical">;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies the component's selected items. */
    readonly selectedItems: HTMLCalciteTileElement[];
    /**
     * Specifies the selection appearance, where:
     *
     * - `"icon"` (displays a checkmark or dot), or
     * - `"border"` (displays a border).
     *
     * @default "icon"
     */
    selectionAppearance: SelectionAppearance;
    /**
     * Specifies the selection mode, where:
     *
     * - `"multiple"` (allows any number of selected items),
     * - `"single"` (allows only one selected item),
     * - `"single-persist"` (allows only one selected item and prevents de-selection),
     * - `"none"` (allows no selected items).
     *
     * @default "none"
     */
    selectionMode: Extract<"multiple" | "none" | "single" | "single-persist", SelectionMode>;
    /** Fires when the component's selection changes. */
    readonly calciteTileGroupSelect: TargetedEvent<this, void>;
}
