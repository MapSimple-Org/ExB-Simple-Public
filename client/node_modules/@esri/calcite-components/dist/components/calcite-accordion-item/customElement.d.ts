/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlipContext, Position, Scale, IconType, Appearance } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { Accordion } from '../calcite-accordion/customElement.js';
import { HeadingLevel } from '../functional/Heading';
import { RequestedItem } from './interfaces';

/**
 * @slot  - A slot for adding custom content, including nested `calcite-accordion-item`s.
 * @slot [actions-end] - A slot for adding `calcite-action`s or content to the end side of the component's header.
 * @slot [actions-start] - A slot for adding `calcite-action`s or content to the start side of the component's header.
 * @slot [content-end] - A slot for adding non-actionable elements after the component's header text.
 * @slot [content-start] - A slot for adding non-actionable elements before the component's header text.
 */
export declare class AccordionItem extends LitElement {
    /** Specifies a description for the component. */
    description: string;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** Specifies heading text for the component. */
    heading: string;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies the heading level of the component's `heading` for proper document structure, without affecting visual styling. */
    headingLevel: HeadingLevel;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteAccordionItemCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteAccordionItemExpand: TargetedEvent<this, void>;
    private messages: Partial<{
        collapse: string;
        expand: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        collapse: string;
        expand: string;
    }>;
}
