/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Scale, SelectionMode } from '../interfaces';
import { Chip } from '../calcite-chip/customElement.js';

/** @slot  - A slot for adding one or more `calcite-chip`s. */
export declare class ChipGroup extends LitElement {
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
     * Specifies the size of the component. Child `calcite-chip`s inherit the component's value.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies the component's selected items. */
    readonly selectedItems: HTMLCalciteChipElement[];
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
    selectionMode: Extract<"multiple" | "single" | "single-persist" | "none", SelectionMode>;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's selection changes. */
    readonly calciteChipGroupSelect: TargetedEvent<this, void>;
}
