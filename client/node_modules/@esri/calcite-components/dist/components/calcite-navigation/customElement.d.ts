/// <reference path="../../index.d.ts" />
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';

/**
 * @slot [logo] - A slot for adding a `calcite-logo` component to the primary navigation level.
 * @slot [user] - A slot for adding a `calcite-user` component to the primary navigation level.
 * @slot [progress] - A slot for adding a `calcite-progress` component to the primary navigation level.
 * @slot [navigation-action] - A slot for adding a `calcite-action` component to the primary navigation level.
 * @slot [content-start] - A slot for adding a `calcite-menu`, `calcite-action`, or other interactive elements in the start position of any navigation level.
 * @slot [content-center] - A slot for adding a `calcite-menu`, `calcite-action`, or other interactive elements in the center position of the primary navigation level.
 * @slot [content-end] - A slot for adding a `calcite-menu`, `calcite-action`, or other interactive elements in the end position of any navigation level.
 * @slot [navigation-secondary] - A slot for adding a `calcite-navigation` component in the secondary navigation level. Components rendered here will not display `calcite-navigation-logo` or `calcite-navigation-user` components.
 * @slot [navigation-tertiary] - A slot for adding a `calcite-navigation` component in the tertiary navigation level.  Components rendered here will not display `calcite-navigation-logo` or `calcite-navigation-user` components.
 */
export declare class Navigation extends LitElement {
    /** When `navigationAction` is `true`, specifies the label of the `calcite-action`. */
    label: string;
    /**
     * When `true`, displays a `calcite-action` and emits a `calciteNavActionSelect` event on selection change.
     *
     * @default false
     */
    navigationAction: boolean;
    /**
     * When `navigationAction` is `true`, sets focus on the component's action element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** When `navigationAction` is `true`, emits when the displayed action selection changes. */
    readonly calciteNavigationActionSelect: TargetedEvent<this, void>;
}
