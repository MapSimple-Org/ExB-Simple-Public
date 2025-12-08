/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { JsxNode, PublicLitElement as LitElement, TargetedEvent } from '@arcgis/lumina';
import { NumberingSystem } from '../../utils/locale';
import { HeadingLevel } from '../functional/Heading';

export declare class DatePicker extends LitElement {
    /** Specifies the component's active date. */
    activeDate: Date;
    /** When `range` is true, specifies the active `range`. Where `"start"` specifies the starting range date and `"end"` the ending range date. */
    activeRange: "start" | "end";
    /**
     * Specifies the number of calendars displayed when `range` is `true`.
     *
     * @default 2
     */
    calendars: 1 | 2;
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
    /**
     * Defines the layout of the component.
     *
     * @default "horizontal"
     */
    layout: "horizontal" | "vertical";
    /**
     * When the component resides in a form,
     * specifies the latest allowed date (`"yyyy-mm-dd"`).
     */
    max: string;
    /** Specifies the latest allowed date as a full date object (`new Date("yyyy-mm-dd")`). */
    maxAsDate: Date;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When the component resides in a form,
     * specifies the earliest allowed date (`"yyyy-mm-dd"`).
     */
    min: string;
    /** Specifies the earliest allowed date as a full date object (`new Date("yyyy-mm-dd")`). */
    minAsDate: Date;
    /**
     * Specifies the monthStyle used by the component.
     *
     * @default "wide"
     */
    monthStyle: "abbreviated" | "wide";
    /** Specifies the Unicode numeral system used by the component for localization. This property cannot be dynamically changed. */
    numberingSystem: NumberingSystem;
    /**
     * When `true`, disables the default behavior on the third click of narrowing or extending the range and instead starts a new range.
     *
     * @default false
     */
    proximitySelectionDisabled: boolean;
    /**
     * When `true`, activates the component's range mode to allow a start and end date.
     *
     * @default false
     */
    range: boolean;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: "s" | "m" | "l";
    /** Specifies the selected date as a string (`"yyyy-mm-dd"`), or an array of strings for `range` values (`["yyyy-mm-dd", "yyyy-mm-dd"]`). */
    value: string | string[];
    /** Specifies the selected date as a full date object (`new Date("yyyy-mm-dd")`), or an array containing full date objects (`[new Date("yyyy-mm-dd"), new Date("yyyy-mm-dd")]`). */
    valueAsDate: Date | Date[];
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when a user changes the component's date. For `range` events, use `calciteDatePickerRangeChange`. */
    readonly calciteDatePickerChange: TargetedEvent<this, void>;
    /** Fires when a user changes the component's date `range`. For components without `range` use `calciteDatePickerChange`. */
    readonly calciteDatePickerRangeChange: TargetedEvent<this, void>;
    private messages: {
        nextMonth: string;
        prevMonth: string;
        monthMenu: string;
        yearMenu: string;
        year: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        nextMonth: string;
        prevMonth: string;
        monthMenu: string;
        yearMenu: string;
        year: string;
    }>;
}
