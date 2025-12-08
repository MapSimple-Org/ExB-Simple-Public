/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { NumberingSystem } from '../../utils/locale';
import { Scale } from '../interfaces';

export interface PaginationDetail {
    start: number;
    totalItems: number;
    startItem: number;
}
export declare class Pagination extends LitElement {
    /**
     * When `true`, number values are displayed with a group separator corresponding to the language and country format.
     *
     * @default false
     */
    groupSeparator: boolean;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies the Unicode numeral system used by the component for localization. */
    numberingSystem: NumberingSystem;
    /**
     * Specifies the number of items per page.
     *
     * @default 20
     */
    pageSize: number;
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Specifies the starting item number.
     *
     * @default 1
     */
    startItem: number;
    /**
     * Specifies the total number of items.
     *
     * @default 0
     */
    totalItems: number;
    /**
     * Set a specified page as active.
     *
     * @param page
     */
    goTo(page: number | "start" | "end"): Promise<void>;
    /** Go to the next page of results. */
    nextPage(): Promise<void>;
    /** Go to the previous page of results. */
    previousPage(): Promise<void>;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Emits when the selected page changes. */
    readonly calcitePaginationChange: TargetedEvent<this, void>;
    private messages: Partial<{
        next: string;
        previous: string;
        first: string;
        last: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        next: string;
        previous: string;
        first: string;
        last: string;
    }>;
}
