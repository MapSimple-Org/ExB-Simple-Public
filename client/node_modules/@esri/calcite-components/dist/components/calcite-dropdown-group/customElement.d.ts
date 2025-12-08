/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale, SelectionMode } from '../interfaces';
import { RequestedItem } from './interfaces';

/** @slot  - A slot for adding `calcite-dropdown-item`s. */
export declare class DropdownGroup extends LitElement {
    /** Specifies and displays a group title. */
    groupTitle: string;
    /**
     * The position of the group in the dropdown menu.
     *
     * @internal
     * @default -1
     */
    position: number;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"multiple"` allows any number of selections,
     *
     * `"single"` allows only one selection, and
     *
     * `"none"` does not allow any selections.
     *
     * @default "single"
     */
    selectionMode: Extract<"none" | "single" | "multiple", SelectionMode>;
}
