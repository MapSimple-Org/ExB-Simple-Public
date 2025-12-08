/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

type Layout = "horizontal" | "vertical";
export declare class Menu extends LitElement {
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /**
     * Specifies the layout of the component.
     *
     * @default "horizontal"
     */
    layout: Layout;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    private messages: Partial<{
        more: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        more: string;
    }>;
}
export {};
