/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Scale } from '../interfaces';

export declare class DatePickerDay extends LitElement {
    /**
     * When `true`, the component is active.
     *
     * @default false
     */
    active: boolean;
    /**
     * Date is in the current month.
     *
     * @default false
     */
    currentMonth: boolean;
    /**
     * Day of the month to be shown.
     *
     * @required
     */
    day: number;
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Date is the end of date range.
     *
     * @default false
     */
    endOfRange: boolean;
    /**
     * Date is currently highlighted as part of the range,
     *
     * @default false
     */
    highlighted: boolean;
    /**
     * When `true`, activates the component's range mode to allow a start and end date.
     *
     * @default false
     */
    range: boolean;
    /**
     * Date is being hovered and within the set range.
     *
     * @default false
     */
    rangeHover: boolean;
    /** Specifies the size of the component. */
    scale: Scale;
    /**
     * When `true`, the component is selected.
     *
     * @default false
     */
    selected: boolean;
    /**
     * Date is the start of date range.
     *
     * @default false
     */
    startOfRange: boolean;
    /** The component's value. */
    value: Date;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
}
