/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Alignment, Scale, SelectionMode } from '../interfaces';
import { RowType, TableInteractionMode } from '../calcite-table/interfaces';

export declare class TableHeader extends LitElement {
    /**
     * Specifies the alignment of the component.
     *
     * @default "start"
     */
    alignment: Alignment;
    /** Specifies the number of columns the component should span. */
    colSpan: number;
    /** A description to display beneath heading content. */
    description: string;
    /** A heading to display above description content. */
    heading: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Specifies the number of rows the component should span. */
    rowSpan: number;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    private messages: {
        all: string;
        keyboardDeselectAll: string;
        keyboardSelectAll: string;
        rowNumber: string;
        selected: string;
        selectionColumn: string;
    } & import('@arcgis/lumina/controllers').T9nMeta<{
        all: string;
        keyboardDeselectAll: string;
        keyboardSelectAll: string;
        rowNumber: string;
        selected: string;
        selectionColumn: string;
    }>;
}
