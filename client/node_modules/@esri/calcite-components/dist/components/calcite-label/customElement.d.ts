/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Alignment, Scale } from '../interfaces';

/** @slot  - A slot for adding text and a component that can be labeled. */
export declare class Label extends LitElement {
    /**
     * Specifies the text alignment of the component.
     *
     * @default "start"
     */
    alignment: Alignment;
    /** Specifies the `id` of the component the label is bound to. Use when the component the label is bound to does not reside within the component. */
    for: string;
    /**
     * Defines the layout of the label in relation to the component. Use `"inline"` positions to wrap the label and component on the same line.  [Deprecated] The `"default"` value is deprecated, use `"block"` instead.
     *
     * @default "default"
     */
    layout: "block" | "inline" | "inline-space-between" | "default";
    /**
     * Specifies the size of the component.
     *
     * @default "m"
     */
    scale: Scale;
}
