/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Alignment, Width } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { TileSelectType } from './interfaces';

/**
 * @deprecated Use the `calcite-tile` component instead.
 * @slot  - A slot for adding custom content.
 */
export declare class TileSelect extends LitElement {
    /**
     * When `true`, the component is checked.
     *
     * @default false
     */
    checked: boolean;
    /** A description for the component, which displays below the heading. */
    description: string;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** The component header text, which displays between the icon and description. */
    heading: string;
    /** Specifies an icon to display. */
    icon: IconNameOrString;
    /**
     * When `true`, the icon will be flipped when the element direction is right-to-left (`"rtl"`).
     *
     * @default false
     */
    iconFlipRtl: boolean;
    /**
     * When `inputEnabled` is `true`, specifies the placement of the interactive input on the component.
     *
     * @default "start"
     */
    inputAlignment: Extract<"end" | "start", Alignment>;
    /**
     * When `true`, displays an interactive input based on the `type` property.
     *
     * @default false
     */
    inputEnabled: boolean;
    /** Specifies the name of the component on form submission. */
    name: any;
    /**
     * Specifies the selection mode of the component, where:
     *
     * `"radio"` is for single selection, and
     *
     * `"checkbox"` is for multiple selections.
     *
     * @default "radio"
     */
    type: TileSelectType;
    /** The component's value. */
    value: any;
    /**
     * Specifies the width of the component.
     *
     * @default "auto"
     */
    width: Extract<"auto" | "full", Width>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /**
     * Emits a custom change event.
     *
     * For checkboxes it emits when checked or unchecked.
     *
     * For radios it only emits when checked.
     */
    readonly calciteTileSelectChange: TargetedEvent<this, void>;
}
