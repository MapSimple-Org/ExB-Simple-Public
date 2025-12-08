/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlipContext, Layout } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';
import { MenuItemCustomEvent } from './interfaces';

/** @slot [submenu-item] - A slot for adding `calcite-menu-item`s in a submenu. */
export declare class MenuItem extends LitElement {
    /**
     * When `true`, the component is highlighted.
     *
     * @default false
     */
    active: boolean;
    /**
     * When `true`, the component displays a breadcrumb trail for use as a navigational aid.
     *
     * @default false
     */
    breadcrumb: boolean;
    /** Specifies the URL destination of the component, which can be set as an absolute or relative path. */
    href: string;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /**
     * Accessible name for the component.
     *
     * @required
     */
    label: string;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, the component will display any slotted `calcite-menu-item` in an open overflow menu.
     *
     * @default false
     */
    open: boolean;
    /**
     * Defines the relationship between the `href` value and the current document.
     *
     * @mdn [rel](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel)
     */
    rel: string;
    /**
     * Specifies where to open the linked document defined in the `href` property.
     *
     * @mdn [target](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target)
     */
    target: string;
    /** Specifies the text to display. */
    text: string;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Emits when the component is selected. */
    readonly calciteMenuItemSelect: TargetedEvent<this, void>;
    private messages: Partial<{
        submenu: string;
        open: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        submenu: string;
        open: string;
    }>;
}
