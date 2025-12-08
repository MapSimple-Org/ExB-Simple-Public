/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Appearance, Scale } from '../interfaces';
import { FormComponent } from '../../utils/form';
import { NumberingSystem } from '../../utils/locale';
import { Label } from '../calcite-label/customElement.js';
import { MeterFillType, MeterLabelType } from './interfaces';

export declare class Meter extends LitElement {
    /**
     * Specifies the appearance style of the component.
     *
     * @default "outline-fill"
     */
    appearance: Extract<"outline" | "outline-fill" | "solid", Appearance>;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Specifies the component's display, where `"single"` displays a single color and `"range"` displays a range of colors based on provided `low`, `high`, `min` or `max` values.
     *
     * @default "range"
     */
    fillType: MeterFillType;
    /**
     * The `id` of the form that will be associated with the component.
     *
     * When not set, the component will be associated with its ancestor form element, if any.
     */
    form: string;
    /**
     * When `true`, number values are displayed with a group separator corresponding to the language and country format.
     *
     * @default false
     */
    groupSeparator: boolean;
    /** Specifies a high value.  When `fillType` is `"range"`, displays a different color when above the specified threshold. */
    high: number;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** Specifies a low value.  When `fillType` is `"range"`, displays a different color when above the specified threshold. */
    low: number;
    /**
     * Specifies the highest allowed value of the component.
     *
     * @default 100
     */
    max: number;
    /**
     * Specifies the lowest allowed value of the component.
     *
     * @default 0
     */
    min: number;
    /**
     * Specifies the name of the component.
     *
     * Required to pass the component's `value` on form submission.
     */
    name: string;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * When `rangeLabels` is `true`, specifies the format of displayed labels.
     *
     * @default "percent"
     */
    rangeLabelType: MeterLabelType;
    /**
     * When `true`, displays the values of `high`, `low`, `min`, and `max`.
     *
     * @default false
     */
    rangeLabels: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * When `rangeLabelType` is `"units"` and either `valueLabel` or `rangeLabels` are `true`, displays beside the `value` and/or  `min` values.
     *
     * @default ""
     */
    unitLabel: string;
    /** Specifies the current value of the component. */
    value: number;
    /**
     * When `true`, displays the current value.
     *
     * @default false
     */
    valueLabel: boolean;
    /**
     * When `valueLabel` is `true`, specifies the format of displayed label.
     *
     * @default "percent"
     */
    valueLabelType: MeterLabelType;
}
