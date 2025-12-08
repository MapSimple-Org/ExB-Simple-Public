/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

export declare class NavigationUser extends LitElement {
    /**
     * When `true`, the component is highlighted.
     *
     * @default false
     */
    active: boolean;
    /** Specifies the full name of the user. */
    fullName: string;
    /** Describes the appearance of the avatar. If no label is provided, context will not be provided to assistive technologies. */
    label: string;
    /**
     * When `true`, hides the `fullName` and `username` contents.
     *
     * @default false
     */
    textDisabled: boolean;
    /** Specifies the `src` to an image (remember to add a token if the user is private). */
    thumbnail: string;
    /** Specifies the unique id of the user. */
    userId: string;
    /** Specifies the username of the user. */
    username: string;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
}
