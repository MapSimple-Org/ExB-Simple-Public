/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Appearance, Position, IconType, Scale, SelectionMode } from '../interfaces';

/** @slot  - A slot for adding `calcite-accordion-item`s. `calcite-accordion` cannot be nested, however `calcite-accordion-item`s can. */
export declare class Accordion extends LitElement {
    /**
     * Specifies the appearance of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"solid" | "transparent", Appearance>;
    /**
     * Specifies the placement of the icon in the header.
     *
     * @default "end"
     */
    iconPosition: Extract<"start" | "end", Position>;
    /**
     * Specifies the type of the icon in the header.
     *
     * @default "chevron"
     */
    iconType: Extract<"chevron" | "caret" | "plus-minus", IconType>;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"multiple"` allows any number of selections,
     *
     * `"single"` allows only one selection, and
     *
     * `"single-persist"` allows one selection and prevents de-selection.
     *
     * @default "multiple"
     */
    selectionMode: Extract<"single" | "single-persist" | "multiple", SelectionMode>;
}
