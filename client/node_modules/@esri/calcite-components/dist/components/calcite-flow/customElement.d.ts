/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlowItem } from '../calcite-flow-item/customElement.js';
import { FlowDirection, FlowItemLikeElement } from './interfaces';

/** @slot  - A slot for adding `calcite-flow-item` elements to the component. */
export declare class Flow extends LitElement {
    /**
     * Removes the currently active `calcite-flow-item`.
     *
     * @returns Promise<HTMLCalciteFlowItemElement | FlowItemLikeElement>
     */
    back(): Promise<HTMLCalciteFlowItemElement | FlowItemLikeElement>;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     * @returns Promise<void>
     */
    setFocus(options?: FocusOptions): Promise<void>;
}
