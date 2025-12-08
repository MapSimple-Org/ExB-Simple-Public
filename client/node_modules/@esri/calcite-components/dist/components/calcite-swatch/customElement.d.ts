/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale, SelectionMode } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';
import { SwatchGroup } from '../calcite-swatch-group/customElement.js';

/** @slot [image] - A slot for adding an image or pattern. */
export declare class Swatch extends LitElement {
    /**
     * Specifies the component's color
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
     */
    color: string;
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
     * Specifies the size of the component. When contained in a parent `calcite-swatch-group` inherits the parent's `scale` value.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /** The component's value. */
    value: any;
    /**
     * Sets focus on the component.
     *
     * @param options
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the selected state of the component changes. */
    readonly calciteSwatchSelect: TargetedEvent<this, void>;
}
