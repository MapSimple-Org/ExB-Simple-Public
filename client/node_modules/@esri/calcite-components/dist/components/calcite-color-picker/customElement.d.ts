/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { InteractiveComponent } from '../../utils/interactive';
import { NumberingSystem } from '../../utils/locale';
import { Format } from './utils';
import { Channels, ColorMode, ColorValue, InternalColor } from './interfaces';

export declare class ColorPicker extends LitElement {
    /**
     * When `true`, an empty color (`null`) will be allowed as a `value`.
     *
     * When `false`, a color value is enforced, and clearing the input or blurring will restore the last valid `value`.
     *
     * @deprecated Use `clearable` instead
     * @default false
     */
    allowEmpty: boolean;
    /**
     * When `true`, the component will allow updates to the color's alpha value.
     *
     * @default false
     */
    alphaChannel: boolean;
    /**
     * When `true`, hides the RGB/HSV channel inputs.
     *
     * @default false
     */
    channelsDisabled: boolean;
    /**
     * When `true`, an empty color (`null`) will be allowed as a `value`.
     *
     * When `false`, a color value is enforced, and clearing the input or blurring will restore the last valid `value`.
     *
     * @default false
     */
    clearable: boolean;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * When `true`, hides the color field.
     *
     * @default false
     */
    fieldDisabled: boolean;
    /**
     * The format of `value`.
     *
     * When `"auto"`, the format will be inferred from `value` when set.
     *
     * @default "auto"
     */
    format: Format;
    /**
     * When `true`, hides the hex input.
     *
     * @default false
     */
    hexDisabled: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * When `true`, hides the saved colors section.
     *
     * @default false
     */
    savedDisabled: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** Specifies the storage ID for colors. */
    storageId: string;
    /**
     * The component's value, where the value can be a CSS color string, or a RGB, HSL or HSV object.
     *
     * The type will be preserved as the color is updated.
     *
     * @see [CSS Color](https://developer.mozilla.org/en-US/docs/Web/CSS/color),
     * @see [ColorValue](https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/src/components/color-picker/interfaces.ts#L10).
     */
    get value(): ColorValue | null;
    set value(value: ColorValue | null);
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the color value has changed. */
    readonly calciteColorPickerChange: TargetedEvent<this, void>;
    /**
     * Fires as the color value changes.
     *
     * Similar to the `calciteColorPickerChange` event with the exception of dragging. When dragging the color field or hue slider thumb, this event fires as the thumb is moved.
     */
    readonly calciteColorPickerInput: TargetedEvent<this, void>;
    private messages: {
        b: string;
        blue: string;
        deleteColor: string;
        g: string;
        green: string;
        h: string;
        hsv: string;
        hex: string;
        hue: string;
        noColor: string;
        opacity: string;
        r: string;
        red: string;
        rgb: string;
        s: string;
        saturation: string;
        saveColor: string;
        saved: string;
        v: string;
        value: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        b: string;
        blue: string;
        deleteColor: string;
        g: string;
        green: string;
        h: string;
        hsv: string;
        hex: string;
        hue: string;
        noColor: string;
        opacity: string;
        r: string;
        red: string;
        rgb: string;
        s: string;
        saturation: string;
        saveColor: string;
        saved: string;
        v: string;
        value: string;
    }>;
}
