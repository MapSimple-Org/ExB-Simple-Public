/// <reference path="../../index.d.ts" />
import { ColorInstance } from 'color';
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { NumberingSystem } from '../../utils/locale';
import { ColorPicker } from '../calcite-color-picker/customElement.js';

export declare class ColorPickerHexInput extends LitElement {
    /**
     * When `true`, the component will allow updates to the color's alpha value.
     *
     * @default false
     */
    alphaChannel: boolean;
    /**
     * When `true`, an empty color (`undefined`) will be allowed as a `value`.
     *
     * When `false`, a color value is enforced, and clearing the input or blurring will restore the last valid `value`.
     *
     * @default false
     */
    allowEmpty: boolean;
    /**
     * Specifies accessible label for the input field.
     *
     * @deprecated use `messages` instead
     * @default "Hex"
     */
    hexLabel: string;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem?: NumberingSystem;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** The hex value. */
    value: string;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Emitted when the hex value changes. */
    readonly calciteColorPickerHexInputChange: TargetedEvent<this, void>;
}
