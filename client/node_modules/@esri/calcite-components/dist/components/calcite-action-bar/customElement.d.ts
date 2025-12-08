/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Layout, Position, Scale } from '../interfaces';
import { OverlayPositioning } from '../../utils/floating-ui';
import { Tooltip } from '../calcite-tooltip/customElement.js';

/**
 * @slot  - A slot for adding `calcite-action`s that will appear at the top of the component.
 * @slot [bottom-actions] - [Deprecated] Use the `"actions-end"` slot instead. A slot for adding `calcite-action`s that will appear at the bottom of the component, above the collapse/expand button.
 * @slot [actions-end] - A slot for adding `calcite-action`s that will appear at the end of the component, prior to the collapse/expand button.
 * @slot [expand-tooltip] - A slot to set the `calcite-tooltip` for the expand toggle.
 */
export declare class ActionBar extends LitElement {
    /** Specifies the accessible label for the last `calcite-action-group`. */
    actionsEndGroupLabel: string;
    /**
     * When `true`, the component is in a floating state.
     *
     * @default false
     */
    floating: boolean;
    /**
     * When `true`, the expand-toggling behavior is disabled.
     *
     * @default false
     */
    expandDisabled: boolean;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /**
     * Specifies the layout direction of the actions.
     *
     * @default "vertical"
     */
    layout: Extract<"horizontal" | "vertical" | "grid", Layout>;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
    /**
     * When `true`, disables automatically overflowing `calcite-action`s that won't fit into menus.
     *
     * @default false
     */
    overflowActionsDisabled: boolean;
    /**
     * Determines the type of positioning to use for the overlaid content.
     *
     * Using `"absolute"` will work for most cases. The component will be positioned inside of overflowing parent containers and will affect the container's layout.
     *
     * `"fixed"` should be used to escape an overflowing parent container, or when the reference element's `position` CSS property is `"fixed"`.
     *
     * @default "absolute"
     */
    overlayPositioning: OverlayPositioning;
    /** Arranges the component depending on the element's `dir` property. */
    position: Extract<"start" | "end", Position>;
    /**
     * Specifies the size of the expand `calcite-action`.
     *
     * @default "m"
     */
    scale: Scale;
    /**
     * Sets focus on the component's first focusable element.
     *
     * @param options - When specified an optional object customizes the component's focusing process. When `preventScroll` is `true`, scrolling will not occur on the component.
     * @mdn [focus(options)](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#options)
     */
    setFocus(options?: FocusOptions): Promise<void>;
    /** Fires when the component's content area is collapsed. */
    readonly calciteActionBarCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteActionBarExpand: TargetedEvent<this, void>;
    /** Fires when the `expanded` property is toggled. */
    readonly calciteActionBarToggle: TargetedEvent<this, void>;
    private messages: Partial<{
        expand: string;
        collapse: string;
        expandLabel: string;
        collapseLabel: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        expand: string;
        collapse: string;
        expandLabel: string;
        collapseLabel: string;
    }>;
}
