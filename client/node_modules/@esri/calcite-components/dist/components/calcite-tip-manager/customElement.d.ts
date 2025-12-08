/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { HeadingLevel } from '../functional/Heading';
import { Tip } from '../calcite-tip/customElement.js';

/**
 * @deprecated Use the `calcite-carousel` and `calcite-carousel-item` components instead.
 * @slot  - A slot for adding `calcite-tip`s.
 */
export declare class TipManager extends LitElement {
    /**
     * When `true`, does not display or position the component.
     *
     * @default false
     */
    closed: boolean;
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /** Selects the next `calcite-tip` to display. */
    nextTip(): Promise<void>;
    /** Selects the previous `calcite-tip` to display. */
    previousTip(): Promise<void>;
    /** Emits when the component has been closed. */
    readonly calciteTipManagerClose: TargetedEvent<this, void>;
    private messages: Partial<{
        defaultGroupTitle: string;
        defaultPaginationLabel: string;
        close: string;
        previous: string;
        next: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        defaultGroupTitle: string;
        defaultPaginationLabel: string;
        close: string;
        previous: string;
        next: string;
    }>;
}
