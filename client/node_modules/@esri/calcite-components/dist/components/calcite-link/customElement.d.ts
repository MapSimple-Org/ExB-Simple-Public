/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { InteractiveComponent } from '../../utils/interactive';
import { FlipContext } from '../interfaces';
import { IconNameOrString } from '../calcite-icon/interfaces';

/**
 * Any attributes placed on <calcite-link> component will propagate to the rendered child
 *
 * Passing a 'href' will render an anchor link, instead of a button.
 *
 * It is the consumers responsibility to add aria information, rel, target, for links, and any link attributes for form submission
 *
 * @slot  - A slot for adding text.
 */
export declare class Link extends LitElement {
    /**
     * When `true`, interaction is prevented and the component is displayed with lower opacity.
     *
     * @default false
     */
    disabled: boolean;
    /**
     * Prompts the user to save the linked URL instead of navigating to it. Can be used with or without a value:
     * Without a value, the browser will suggest a filename/extension.
     *
     * @see [Global download attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download).
     * @default false
     */
    download: string | boolean;
    /** Specifies the URL of the linked resource, which can be set as an absolute or relative path. */
    href: string;
    /** Specifies an icon to display at the end of the component. */
    iconEnd: IconNameOrString;
    /** Displays the `iconStart` and/or `iconEnd` as flipped when the element direction is right-to-left (`"rtl"`). */
    iconFlipRtl: FlipContext;
    /** Specifies an icon to display at the start of the component. */
    iconStart: IconNameOrString;
    /** Specifies the relationship to the linked document defined in `href`. */
    rel: string;
    /** Specifies the frame or window to open the linked document. */
    target: string;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
}
