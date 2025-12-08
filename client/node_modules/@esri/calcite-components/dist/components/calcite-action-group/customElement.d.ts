/// <reference path="../../index.d.ts" />
import { PropertyValues } from 'lit';
import { PublicLitElement as LitElement, JsxNode, TargetedEvent } from '@arcgis/lumina';
import { Layout, Scale } from '../interfaces';
import { FlipPlacement, LogicalPlacement, OverlayPositioning } from '../../utils/floating-ui';
import { Columns } from './interfaces';

/**
 * @slot  - A slot for adding a group of `calcite-action`s.
 * @slot [menu-actions] - A slot for adding an overflow menu with `calcite-action`s inside a `calcite-dropdown`.
 * @slot [menu-tooltip] - A slot for adding a `calcite-tooltip` for the menu.
 */
export declare class ActionGroup extends LitElement {
    /** Indicates number of columns. */
    columns: Columns;
    /**
     * When `true`, expands the component and its contents.
     *
     * @default false
     */
    expanded: boolean;
    /** Accessible name for the component. */
    label: string;
    /**
     * Indicates the layout of the component.
     *
     * @internal
     * @default "vertical"
     */
    layout: Extract<"horizontal" | "vertical" | "grid", Layout>;
    /** Specifies the component's fallback menu `placement` when it's initial or specified `placement` has insufficient space available. */
    menuFlipPlacements: FlipPlacement[];
    /**
     * When `true`, the `calcite-action-menu` is open.
     *
     * @default false
     */
    menuOpen: boolean;
    /** Determines where the action menu will be positioned. */
    menuPlacement: LogicalPlacement;
    /** Use this property to override individual strings used by the component. */
    messageOverrides?: typeof this.messages._overrides;
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
     * Specifies the size of the `calcite-action-menu`.
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
    readonly calciteActionGroupCollapse: TargetedEvent<this, void>;
    /** Fires when the component's content area is expanded. */
    readonly calciteActionGroupExpand: TargetedEvent<this, void>;
    private messages: Partial<{
        more: string;
    }> & import('@arcgis/lumina/controllers').T9nMeta<{
        more: string;
    }>;
}
