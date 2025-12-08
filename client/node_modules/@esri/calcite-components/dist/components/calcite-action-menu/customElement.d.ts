/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { FlipPlacement, LogicalPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { Appearance, Scale } from '../interfaces';
import { Action } from '../calcite-action/customElement.js';

/**
 * @slot  - A slot for adding `calcite-action`s.
 * @slot [trigger] - A slot for adding a `calcite-action` to trigger opening the menu.
 * @slot [tooltip] - A slot for adding a tooltip for the menu.
 */
export declare class ActionMenu extends LitElement {
    /**
     * Specifies the appearance of the component.
     *
     * @default "solid"
     */
    appearance: Extract<"solid" | "transparent", Appearance>;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** Specifies the component's fallback slotted content `placement` when it's initial or specified `placement` has insufficient space available. */
    flipPlacements: FlipPlacement[];
    /**
     * Specifies the text string for the component.
     *
     * @required
     */
    label: string;
    /**
     * When `true`, the component is open.
     *
     * @default false
     */
    get open(): boolean;
    set open(open: boolean);
    /**
     * Determines the type of positioning to use for the overlaid content.
     *
     * Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout.
     * `"fixed"` should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
     *
     * @default "absolute"
     */
    overlayPositioning: OverlayPositioning;
    /**
     * Determines where the component will be positioned relative to the `referenceElement`.
     *
     * @default "auto"
     */
    placement: LogicalPlacement;
    /**
     * Specifies the size of the component's trigger `calcite-action`.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Sets focus on the component.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteActionMenuCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteActionMenuExpand: TargetedEvent<this, void>;
    /** Fires when the `open` property is toggled. */
    readonly calciteActionMenuOpen: TargetedEvent<this, void>;
}
