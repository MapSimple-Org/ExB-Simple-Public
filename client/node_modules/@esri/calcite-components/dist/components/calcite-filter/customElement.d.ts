/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { Scale } from '../interfaces';

export declare class Filter extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /** Specifies the properties to match against when filtering. This will only apply when `value` is an object. If not set, all properties will be matched. */
    filterProps: string[];
    /** The component's resulting items after filtering. */
    readonly filteredItems: object[];
    /**
     * Defines the items to filter. The component uses the values as the starting point, and returns items
     *
     * that contain the string entered in the input, using a partial match and recursive search.
     *
     * This property is needed to conduct filtering.
     */
    items: object[];
    /** Specifies an accessible name for the component. */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies placeholder text for the input element. */
    placeholder: string;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /** The component's value. */
    get value(): string;
    set value(value: string);
    /**
     * Performs a filter on the component.
     *
     * This method can be useful because filtering is delayed and asynchronous.
     *
     * @param value - The filter text value.
     * @returns
     */
    filter(value?: string): Promise<void>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the filter text changes. */
    readonly calciteFilterChange: TargetedEvent<this, void>;
    private messages: Partial<{
        label: string;
        clear: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        label: string;
        clear: string;
    }>;
}
