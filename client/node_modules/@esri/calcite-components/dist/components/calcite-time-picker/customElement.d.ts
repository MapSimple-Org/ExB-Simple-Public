/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Scale } from '../interfaces';
import { NumberingSystem } from '../../utils/locale';
import { HourFormat } from '../../utils/time';
import { TimeComponent, useTime } from '../../controllers/useTime';

export declare class TimePicker extends LitElement {
    /** @internal */
    time: ReturnType<typeof useTime>;
    /**
     * Specifies the component's hour format, where:
     *
     * `"user"` displays the user's locale format,
     * `"12"` displays a 12-hour format, and
     * `"24"` displays a 24-hour format.
     *
     * @default "user"
     */
    hourFormat: HourFormat;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the granularity the `value` must adhere to (in seconds).
     *
     * @default 60
     */
    step: number;
    /** The component's value in UTC (always 24-hour format). */
    value: string;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when a user changes the component's time */
    readonly calciteTimePickerChange: TargetedEvent<this, void>;
    private messages: Partial<{
        fractionalSecond: string;
        fractionalSecondDown: string;
        fractionalSecondUp: string;
        hour: string;
        hourDown: string;
        hourUp: string;
        meridiem: string;
        meridiemDown: string;
        meridiemUp: string;
        minute: string;
        minuteDown: string;
        minuteUp: string;
        second: string;
        secondDown: string;
        secondUp: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        fractionalSecond: string;
        fractionalSecondDown: string;
        fractionalSecondUp: string;
        hour: string;
        hourDown: string;
        hourUp: string;
        meridiem: string;
        meridiemDown: string;
        meridiemUp: string;
        minute: string;
        minuteDown: string;
        minuteUp: string;
        second: string;
        secondDown: string;
        secondUp: string;
    }>;
}
