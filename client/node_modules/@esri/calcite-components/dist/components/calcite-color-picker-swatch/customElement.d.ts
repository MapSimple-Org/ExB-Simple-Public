/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';

/** @deprecated Use the `calcite-swatch-group` and `calcite-swatch` components instead. */
export declare class ColorPickerSwatch extends LitElement {
    /**
     * When `true`, the component is active.
     *
     * @default false
     */
    active: boolean;
    /**
     * The color value.
     *
     * @see [Color CSS data type](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
     */
    color: string | null;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
}
