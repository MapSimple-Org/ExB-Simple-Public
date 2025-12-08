/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { SelectionMode } from '../interfaces';
import { Card } from '../calcite-card/customElement.js';

/** @slot  - A slot for adding one or more `calcite-card`s. */
export declare class CardGroup extends LitElement {
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
    /** Specifies the component's selected items. */
    readonly selectedItems: HTMLCalciteCardElement[];
    /**
     * Specifies the selection mode of the component.
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
    /** Emits when the component's selection changes and the `selectionMode` is not `none`. */
    readonly calciteCardGroupSelect: TargetedEvent<this, void>;
}
